#!/usr/bin/env python3
"""worker.py — delegacion de I/O a un modelo barato.

El modelo caro razona; este worker carga las cajas. Dos operaciones:

  read   Lee N archivos completos y devuelve un resumen en viñetas.
         El modelo principal recibe el resumen, no los archivos.

  write  Genera un archivo nuevo desde una spec y una referencia, y lo
         escribe DIRECTO A DISCO. El contenido nunca pasa por el contexto
         del modelo principal: costo de salida cero.

Lo que este worker NO debe hacer nunca (modos de falla medidos por Spotify
en https://engineering.atspotify.com/2026/9/portal-by-spotify-cut-my-claude-code-token-usage-by-90):

  - Editar archivos existentes: los resumenes pierden los numeros de linea
    y el parche termina en el lugar equivocado.
  - Diagnosticar bugs, concurrencia, seguridad o arquitectura: en su prueba
    el worker paso por alto un bug de thread-safety que el modelo de
    frontera encontro en segundos.

Uso:
    worker.py read  --question "donde se define X" --paths a.py b.py
    worker.py write --spec "spec.md" --reference modelo.py --target nuevo.py

Sin dependencias externas: urllib de la stdlib. Proveedor inferido del
nombre del modelo (gemini-* / claude-*).
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
from harness_config import buscar, leer_config  # noqa: E402, I001

# Tope de seguridad: si el paquete de archivos supera esto, se corta y se
# avisa. Delegar 5 MB de texto no ahorra plata, la quema en otro lado.
MAX_BYTES_ENTRADA = 400_000

# Lo que nunca sale de la máquina. El worker manda el contenido a un proveedor
# externo: un `--paths .env` por descuido publica las claves del proyecto.
SECRETOS = (
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "*.p12",
    "*.pfx",
    "*.keystore",
    "*.jks",
    "id_rsa*",
    "id_ed25519*",
    "credentials*",
    "*secret*",
    ".npmrc",
    ".pypirc",
)

PROMPT_READ = """Sos un lector masivo. Te paso archivos completos y una pregunta.

Reglas de salida, sin excepciones:
- Respondé SOLO en viñetas. Sin saludo, sin introducción, sin cierre.
- Cada viñeta cita el archivo y, cuando aplique, el número de línea aproximado.
- Si la respuesta no está en los archivos, decí exactamente: NO ENCONTRADO.
- No opines sobre la calidad del código. No sugieras mejoras. No lo resumas
  "por las dudas": respondé la pregunta y nada más.

PREGUNTA:
{question}

ARCHIVOS:
{files}"""

PROMPT_WRITE = """Sos un generador de código. Te paso una especificación y un archivo
de referencia cuyo estilo tenés que imitar.

Output only the code. Sin bloques markdown, sin ```, sin explicación previa
ni posterior, sin comentarios de cortesía. La primera línea de tu respuesta
es la primera línea del archivo.

ESPECIFICACIÓN:
{spec}

ARCHIVO DE REFERENCIA (imitá su estilo, no su contenido):
{reference}"""


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------


def cargar_env(root: str) -> None:
    """Carga el .env del proyecto sin pisar lo que ya esté en el entorno.

    Las claves viven en el .env gitignoreado, no en harness.config.yml, que sí
    se commitea. La config solo dice de qué variable sale cada una.
    """
    ruta = Path(root) / ".env"
    if not ruta.is_file():
        return
    for cruda in ruta.read_text(encoding="utf-8", errors="ignore").splitlines():
        linea = cruda.strip()
        if not linea or linea.startswith("#") or "=" not in linea:
            continue
        clave, _, valor = linea.partition("=")
        clave = clave.strip()
        valor = valor.strip().strip("\"'")
        # Una variable exportada a mano gana sobre el archivo.
        if clave and clave not in os.environ:
            os.environ[clave] = valor


def cargar(root: str, config_name: str) -> dict:
    return leer_config(Path(root) / config_name)


def opcion(cfg: dict, clave: str, porDefecto):
    return buscar(cfg, "delegacion", clave, default=porDefecto)


def proveedor_de(modelo: str) -> str:
    if modelo.startswith("gemini"):
        return "gemini"
    if modelo.startswith("claude"):
        return "anthropic"
    raise SystemExit(
        f"✗ No sé qué proveedor usar para el modelo '{modelo}'.\n"
        "  Los nombres tienen que empezar con 'gemini-' o 'claude-'."
    )


# ---------------------------------------------------------------------------
# Llamada al modelo
# ---------------------------------------------------------------------------


def base_url(prov: str) -> str:
    # Override para tests: apunta a un mock local sin tocar el código.
    override = os.environ.get("HARNESS_WORKER_BASE_URL")
    if override:
        return override.rstrip("/")
    if prov == "gemini":
        return "https://generativelanguage.googleapis.com"
    return "https://api.anthropic.com"


def invocar(modelo: str, prompt: str, cfg: dict, timeout: int) -> tuple[str, dict]:
    """Devuelve (texto, uso_de_tokens)."""
    prov = proveedor_de(modelo)

    if prov == "gemini":
        env = opcion(cfg, "api_key_env_gemini", "GEMINI_API_KEY")
        clave = os.environ.get(env, "")
        if not clave:
            raise SystemExit(
                f"✗ Falta la variable de entorno {env}.\n"
                "  Ponela en el .env del proyecto o exportala en la shell."
            )
        url = f"{base_url(prov)}/v1beta/models/{modelo}:generateContent"
        cuerpo = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2},
        }
        headers = {"content-type": "application/json", "x-goog-api-key": clave}
    else:
        env = opcion(cfg, "api_key_env_anthropic", "ANTHROPIC_API_KEY")
        clave = os.environ.get(env, "")
        if not clave:
            raise SystemExit(f"✗ Falta la variable de entorno {env}.")
        url = f"{base_url(prov)}/v1/messages"
        cuerpo = {
            "model": modelo,
            "max_tokens": int(opcion(cfg, "max_tokens_salida", 4096)),
            "temperature": 0.2,
            "messages": [{"role": "user", "content": prompt}],
        }
        headers = {
            "content-type": "application/json",
            "x-api-key": clave,
            "anthropic-version": "2023-06-01",
        }

    peticion = urllib.request.Request(
        url, data=json.dumps(cuerpo).encode("utf-8"), headers=headers, method="POST"
    )

    inicio = time.time()
    try:
        with urllib.request.urlopen(peticion, timeout=timeout) as r:
            datos = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detalle = e.read().decode("utf-8", errors="ignore")[:500]
        raise SystemExit(f"✗ {prov} respondió {e.code}: {detalle}") from e
    except urllib.error.URLError as e:
        raise SystemExit(f"✗ No pude alcanzar {prov}: {e.reason}") from e
    except TimeoutError:
        raise SystemExit(
            f"✗ {prov} no respondió en {timeout}s.\n"
            "  Si pasa seguido, subí delegacion.timeout_seconds o delegá menos archivos."
        ) from None
    demora = time.time() - inicio

    if prov == "gemini":
        try:
            texto = datos["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            raise SystemExit(
                f"✗ Respuesta inesperada de Gemini: {json.dumps(datos)[:400]}"
            ) from None
        um = datos.get("usageMetadata", {})
        uso = {
            "entrada": um.get("promptTokenCount", 0),
            "salida": um.get("candidatesTokenCount", 0),
        }
    else:
        try:
            texto = datos["content"][0]["text"]
        except (KeyError, IndexError):
            raise SystemExit(
                f"✗ Respuesta inesperada de Anthropic: {json.dumps(datos)[:400]}"
            ) from None
        um = datos.get("usage", {})
        uso = {
            "entrada": um.get("input_tokens", 0),
            "salida": um.get("output_tokens", 0),
        }

    uso["segundos"] = round(demora, 1)
    uso["modelo"] = modelo
    return texto, uso


def reportar(uso: dict) -> None:
    # A stderr, para no ensuciar la salida que consume el agente.
    print(
        f"[worker] {uso['modelo']} · {uso['entrada']} tokens de entrada · "
        f"{uso['salida']} de salida · {uso['segundos']}s",
        file=sys.stderr,
    )


# ---------------------------------------------------------------------------
# Empaquetado de archivos
# ---------------------------------------------------------------------------


def empaquetar(paths: list[str]) -> tuple[str, int]:
    """Envuelve cada archivo en etiquetas XML para fijar fronteras claras."""
    partes: list[str] = []
    total = 0

    for p in paths:
        ruta = Path(p)
        nombre = ruta.name.lower()
        if any(fnmatch.fnmatch(nombre, patron) for patron in SECRETOS):
            raise SystemExit(
                f"✗ {p} parece un secreto y no se manda a un proveedor externo.\n"
                "  Si de verdad es código, renombralo o leelo con grep/offset."
            )
        if not ruta.is_file():
            print(f"[worker] aviso: {p} no existe, se omite", file=sys.stderr)
            continue
        try:
            contenido = ruta.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            print(f"[worker] aviso: no pude leer {p} ({e})", file=sys.stderr)
            continue

        total += len(contenido.encode("utf-8"))
        if total > MAX_BYTES_ENTRADA:
            raise SystemExit(
                f"✗ El paquete supera {MAX_BYTES_ENTRADA} bytes en {p}.\n"
                "  Delegá menos archivos por vez, o filtrá con grep antes."
            )

        partes.append(f'<file path="{p}">\n{contenido}\n</file>')

    if not partes:
        raise SystemExit("✗ Ningún archivo legible en --paths.")

    return "\n\n".join(partes), total


def limpiar_fences(texto: str) -> str:
    """Saca los ``` que el modelo pone aunque le digas que no."""
    t = texto.strip()
    if t.startswith("```"):
        # Primera línea es ```lenguaje
        lineas = t.split("\n")
        lineas = lineas[1:]
        if lineas and lineas[-1].strip().startswith("```"):
            lineas = lineas[:-1]
        t = "\n".join(lineas)
    return t.rstrip() + "\n"


# ---------------------------------------------------------------------------
# Operaciones
# ---------------------------------------------------------------------------


def op_read(args, cfg: dict) -> int:
    modelo = opcion(cfg, "worker_read", "gemini-3.6-flash")
    timeout = int(opcion(cfg, "timeout_seconds", 60))

    paquete, bytes_totales = empaquetar(args.paths)
    prompt = PROMPT_READ.format(question=args.question, files=paquete)

    texto, uso = invocar(modelo, prompt, cfg, timeout)
    reportar(uso)
    print(
        f"[worker] evitaste meter ~{bytes_totales // 4} tokens en el contexto principal",
        file=sys.stderr,
    )

    print(texto.strip())
    return 0


def op_write(args, cfg: dict) -> int:
    modelo = opcion(cfg, "worker_write", "gemini-3.6-flash")
    timeout = int(opcion(cfg, "timeout_seconds", 60))

    destino = Path(args.target)
    if destino.exists() and not args.force:
        raise SystemExit(
            f"✗ {args.target} ya existe.\n"
            "  Este worker genera archivos NUEVOS. Editar uno existente no se\n"
            "  delega: el resumen pierde los números de línea. Usá --force solo\n"
            "  si de verdad querés pisarlo."
        )

    spec = (
        Path(args.spec).read_text(encoding="utf-8")
        if Path(args.spec).is_file()
        else args.spec
    )

    referencia = ""
    if args.reference:
        ref = Path(args.reference)
        if not ref.is_file():
            raise SystemExit(f"✗ La referencia {args.reference} no existe.")
        cuerpo_ref = ref.read_text(encoding="utf-8", errors="replace")
        referencia = f'<file path="{args.reference}">\n{cuerpo_ref}\n</file>'

    prompt = PROMPT_WRITE.format(spec=spec, reference=referencia or "(sin referencia)")

    texto, uso = invocar(modelo, prompt, cfg, timeout)
    reportar(uso)

    codigo = limpiar_fences(texto)
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(codigo, encoding="utf-8")

    # El agente principal recibe solo esta línea, no el archivo.
    print(f"escrito: {args.target} ({len(codigo.splitlines())} líneas)")
    print(
        "[worker] el contenido no pasó por el contexto principal: 0 tokens de salida",
        file=sys.stderr,
    )
    return 0


# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Delegación de I/O a un modelo barato."
    )
    parser.add_argument("--config", default="harness.config.yml")
    parser.add_argument("--root", default=".")
    sub = parser.add_subparsers(dest="op", required=True)

    pr = sub.add_parser("read", help="lee archivos y devuelve un resumen")
    pr.add_argument("--question", required=True)
    pr.add_argument("--paths", required=True, nargs="+")

    pw = sub.add_parser("write", help="genera un archivo nuevo a disco")
    pw.add_argument("--spec", required=True, help="texto o ruta a un archivo")
    pw.add_argument("--reference", default="")
    pw.add_argument("--target", required=True)
    pw.add_argument("--force", action="store_true")

    args = parser.parse_args()
    cargar_env(args.root)
    cfg = cargar(args.root, args.config)

    if str(opcion(cfg, "enabled", "true")).lower() not in ("true", "1", "yes"):
        raise SystemExit(
            "✗ La delegación está apagada (delegacion.enabled: false en harness.config.yml)."
        )

    return op_read(args, cfg) if args.op == "read" else op_write(args, cfg)


if __name__ == "__main__":
    sys.exit(main())

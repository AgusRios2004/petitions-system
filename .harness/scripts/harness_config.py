#!/usr/bin/env python3
"""harness_config.py — lector de harness.config.yml.

Un solo parser para todo el harness: lo importan spec_coverage.py y lo consulta
verify.sh por linea de comandos. Si hubiera dos parsers habria dos verdades, que
es exactamente lo que este harness existe para evitar.

Parser minimo del subconjunto de YAML que usa harness.config.yml: mapas
anidados por indentacion, listas simples, comillas opcionales, comentarios.
Sin PyYAML a proposito: tiene que correr en cualquier repo sin instalar nada.

Uso como CLI:
    python3 harness_config.py commands.test
    python3 harness_config.py commands.typecheck --default ""
    python3 harness_config.py spec_coverage.test_glob --config otro.yml

Devuelve el valor por stdout. Si no existe y no hay --default, sale con 1.
Las listas se imprimen una por linea.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def desnudar(valor: str) -> str:
    valor = valor.strip()
    if len(valor) >= 2 and valor[0] == valor[-1] and valor[0] in "\"'":
        return valor[1:-1]
    return valor


def leer_config(path: Path) -> dict:
    """Parsea el archivo. Devuelve {} si no existe."""
    if not path.exists():
        return {}

    raiz: dict = {}
    pila: list[tuple[int, dict]] = [(-1, raiz)]
    ult_padre: dict | None = None
    ult_clave: str | None = None

    for cruda in path.read_text(encoding="utf-8").splitlines():
        # Saca comentarios de linea completa y los que siguen a un valor.
        linea = re.sub(r"(?<!\S)#.*$", "", cruda).rstrip()
        if not linea.strip():
            continue

        indent = len(linea) - len(linea.lstrip())
        contenido = linea.strip()

        if contenido.startswith("- "):
            if ult_padre is None or ult_clave is None:
                continue
            actual = ult_padre.get(ult_clave)
            if isinstance(actual, dict) and not actual:
                # Era una lista, no un mapa anidado.
                if pila and pila[-1][1] is actual:
                    pila.pop()
                ult_padre[ult_clave] = []
            if isinstance(ult_padre.get(ult_clave), list):
                ult_padre[ult_clave].append(desnudar(contenido[2:]))
            continue

        if ":" not in contenido:
            continue

        clave, _, valor = contenido.partition(":")
        clave = clave.strip()
        valor = valor.strip()

        while pila and pila[-1][0] >= indent:
            pila.pop()
        padre = pila[-1][1] if pila else raiz

        if valor == "":
            hijo: dict = {}
            padre[clave] = hijo
            pila.append((indent, hijo))
        elif valor == "[]":
            padre[clave] = []
        else:
            padre[clave] = desnudar(valor)

        ult_padre, ult_clave = padre, clave

    return raiz


def buscar(config: dict, *camino: str, default=None):
    """buscar(cfg, 'commands', 'test') — devuelve default si falta o esta vacio."""
    nodo = config
    for paso in camino:
        if not isinstance(nodo, dict) or paso not in nodo:
            return default
        nodo = nodo[paso]
    if nodo is None or nodo == "" or nodo == {}:
        return default
    return nodo


def main() -> int:
    parser = argparse.ArgumentParser(description="Lee un valor de harness.config.yml")
    parser.add_argument("clave", help="ruta con puntos, ej: commands.test")
    parser.add_argument("--config", default="harness.config.yml")
    parser.add_argument("--root", default=".")
    parser.add_argument("--default", dest="por_defecto", default=None)
    args = parser.parse_args()

    config = leer_config(Path(args.root) / args.config)
    valor = buscar(config, *args.clave.split("."), default=args.por_defecto)

    if valor is None:
        print(f"harness.config.yml: falta '{args.clave}'", file=sys.stderr)
        return 1

    if isinstance(valor, list):
        for item in valor:
            print(item)
    else:
        print(valor)
    return 0


if __name__ == "__main__":
    sys.exit(main())

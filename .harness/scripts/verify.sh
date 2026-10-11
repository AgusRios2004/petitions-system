#!/usr/bin/env bash
# verify.sh — la compuerta. Un solo entrypoint de verificacion para los tres
# lugares donde se trabaja:
#
#   Claude Code : lo invocan los hooks de .claude/settings.json
#   Cowork      : no hay hooks, se corre a mano antes de dar algo por terminado
#   CI          : lo corre el workflow de GitHub Actions
#
# Que los tres corran EXACTAMENTE lo mismo es el punto: si la compuerta local y
# la de CI difieren, la local no sirve para nada.
#
# Uso:
#   verify.sh                 gate completo: lint + typecheck + tests + specs
#   verify.sh --file RUTA     gate rapido de un archivo: formato + lint
#   verify.sh --no-specs      omite spec_coverage (util al instalar, sin specs)
#   verify.sh --solo-lint     solo lint: para quien deja la suite en rojo a
#                             proposito (el test-author de spec-driven)
#   verify.sh --help
#
# Salida: 0 si todo pasa, 1 al primer fallo.

set -uo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ="${HARNESS_ROOT:-$(pwd)}"
CONFIG="${HARNESS_CONFIG:-harness.config.yml}"

rojo()  { printf '\033[31m%s\033[0m\n' "$*"; }
verde() { printf '\033[32m%s\033[0m\n' "$*"; }
gris()  { printf '\033[90m%s\033[0m\n' "$*"; }

cfg() {
  # cfg CLAVE [DEFECTO] — lee de harness.config.yml con el parser del harness.
  python3 "$AQUI/harness_config.py" "$1" \
    --root "$RAIZ" --config "$CONFIG" --default "${2-}" 2>/dev/null
}

correr() {
  # correr NOMBRE COMANDO — ejecuta y aborta al primer fallo.
  local nombre="$1" comando="$2"
  if [ -z "$comando" ]; then
    gris "· $nombre: no configurado, se omite"
    return 0
  fi
  gris "· $nombre: $comando"
  if ! ( cd "$RAIZ" && eval "$comando" ); then
    rojo "✗ $nombre falló."
    return 1
  fi
  return 0
}

uso() {
  sed -n '2,22p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
  exit 0
}

# ---------------------------------------------------------------------------

MODO="completo"
ARCHIVO=""
CON_SPECS=1
SOLO_LINT=0

while [ $# -gt 0 ]; do
  case "$1" in
    --file)     MODO="rapido"; ARCHIVO="${2:-}"; shift 2 ;;
    --no-specs) CON_SPECS=0; shift ;;
    --solo-lint) SOLO_LINT=1; shift ;;
    -h|--help)  uso ;;
    *)          rojo "Opción desconocida: $1"; exit 2 ;;
  esac
done

if [ ! -f "$RAIZ/$CONFIG" ]; then
  rojo "✗ No encuentro $CONFIG en $RAIZ."
  echo "  El harness no está instalado acá, o falta pasar HARNESS_ROOT."
  exit 1
fi

# --- Modo rapido: un archivo, despues de editarlo --------------------------
# Barato y acotado. Si el proyecto no define comandos por archivo, no hace nada
# en vez de correr el lint del repo entero en cada edicion.

if [ "$MODO" = "rapido" ]; then
  [ -n "$ARCHIVO" ] || { rojo "✗ --file necesita una ruta."; exit 2; }

  FMT_FILE="$(cfg commands.format_file '')"
  LINT_FILE="$(cfg commands.lint_file '')"

  if [ -z "$FMT_FILE" ] && [ -z "$LINT_FILE" ]; then
    gris "· sin commands.format_file/lint_file en la config: nada que hacer"
    exit 0
  fi

  fallo=0
  [ -n "$FMT_FILE" ]  && { correr "formato"  "${FMT_FILE//\{file\}/$ARCHIVO}"  || fallo=1; }
  [ -n "$LINT_FILE" ] && { correr "lint"     "${LINT_FILE//\{file\}/$ARCHIVO}" || fallo=1; }
  exit "$fallo"
fi

# --- Modo completo: la compuerta de verdad ---------------------------------

echo "── verify: $(cfg project.name "$(basename "$RAIZ")") ──"

# Copia vendoreada vieja: avisa, no falla. Solo se puede comparar donde commons
# existe (la máquina de desarrollo); en CI el origen no está y se omite.
ORIGEN="$(sed -n 's/^origen: *//p' "$RAIZ/.harness/VERSION" 2>/dev/null)"
if [ -n "$ORIGEN" ] && [ -d "$ORIGEN/scripts" ] && [ "$AQUI" != "$ORIGEN/scripts" ]; then
  for f in "$ORIGEN"/scripts/*; do
    [ -f "$f" ] || continue
    if ! cmp -s "$f" "$AQUI/$(basename "$f")"; then
      gris "⚠ .harness/scripts/ está desactualizado respecto de commons."
      gris "  $ORIGEN/install.sh --update $RAIZ"
      break
    fi
  done
fi

correr "lint"      "$(cfg commands.lint '')"      || exit 1

if [ "$SOLO_LINT" -eq 1 ]; then
  verde "✓ verify OK (solo lint)"
  exit 0
fi

correr "typecheck" "$(cfg commands.typecheck '')" || exit 1
correr "tests"     "$(cfg commands.test '')"      || exit 1

if [ "$CON_SPECS" -eq 1 ]; then
  gris "· spec_coverage"
  if ! python3 "$AQUI/spec_coverage.py" --root "$RAIZ" --config "$CONFIG"; then
    rojo "✗ Hay criterios de aceptación sin test."
    exit 1
  fi
fi

verde "✓ verify OK"

#!/usr/bin/env bash
# hook_post_edit.sh — compuerta rápida, se dispara después de cada Edit/Write.
#
# Lo invoca el hook PostToolUse de .claude/settings.json. Recibe por stdin el
# JSON del evento y saca de ahí tool_input.file_path.
#
# Barato a propósito: formatea y lintea SOLO el archivo tocado. El gate pesado
# (tests + spec_coverage) corre al final, en hook_stop.sh.
#
# Exit 2 le devuelve el error al agente para que lo arregle en el mismo turno.

set -uo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ENTRADA="$(cat)"

ARCHIVO="$(
  printf '%s' "$ENTRADA" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
print(d.get("tool_input", {}).get("file_path", "") or "")
' 2>/dev/null
)"

# Sin archivo (o JSON inesperado) no hay nada que verificar: salir limpio.
[ -n "$ARCHIVO" ] || exit 0

# Solo archivos del proyecto. Un Write a /tmp no es asunto de la compuerta.
RAIZ="${CLAUDE_PROJECT_DIR:-$(pwd)}"
case "$ARCHIVO" in
  "$RAIZ"/*) ;;
  /*) exit 0 ;;
esac

SALIDA="$(HARNESS_ROOT="$RAIZ" "$AQUI/verify.sh" --file "$ARCHIVO" 2>&1)"
CODIGO=$?

if [ "$CODIGO" -ne 0 ]; then
  {
    echo "El archivo que acabás de escribir no pasa lint/formato:"
    echo "$SALIDA"
    echo
    echo "Arreglalo antes de seguir."
  } >&2
  exit 2
fi

exit 0

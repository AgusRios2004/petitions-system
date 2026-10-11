#!/usr/bin/env bash
# hook_readonly_guard.sh — garantía DURA de "no escribe", vía hook.
#
# Se dispara en PreToolUse sobre Edit/Write/NotebookEdit. Si HARNESS_READONLY
# no está en "1", no opina: exit 0 inmediato, cero costo para el 99% de las
# corridas que no son el reviewer.
#
# Por qué existe: sandcastle (@ai-hero/sandcastle, v0.12.0, confirmado en
# .harness/schemas-verificados.md el 07/09/2026) no tiene allowedTools ni
# disallowedTools en RunOptions. El único lever real es permissionMode: "plan",
# aplicado al AGENTE.reviewer en main.mts — pero QUÉ bloquea ese modo puertas
# adentro de Claude Code nunca se confirmó contra la doc (queda anotado como
# "asumido, no confirmado" en el mismo archivo). Este hook no depende de esa
# suposición: bloquea la herramienta él mismo, con el mismo mecanismo que ya
# hace duras las otras tres compuertas del harness (hook_pre_read.sh,
# hook_post_edit.sh, hook_stop.sh). Sube la garantía de "no escribe" de
# "un flag que puede hacer lo que digo" a "un hook que lo hace cumplir".
#
# Quién lo prende: sandcastle-template/roles/spec-driven/main.mts, poniendo
# HARNESS_READONLY=1 en el env del AGENTE.reviewer y de nadie más. Un agente
# interactivo normal en Claude Code nunca tiene esta variable puesta.

set -uo pipefail

case "${HARNESS_READONLY:-}" in
  1|true|True) ;;
  *) exit 0 ;;
esac

ENTRADA="$(cat)"

TOOL="$(
  printf '%s' "$ENTRADA" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    print("")
    sys.exit(0)
print(d.get("tool_name", "") or "")
' 2>/dev/null
)"

python3 -c "
import json, sys
print(json.dumps({
  'hookSpecificOutput': {
    'hookEventName': 'PreToolUse',
    'permissionDecision': 'deny',
    'permissionDecisionReason': sys.argv[1],
  }
}))" "HARNESS_READONLY=1: este rol es de solo lectura y no puede usar $TOOL. Si encontraste algo para corregir, es un hallazgo del JSON de salida, no un cambio que hagas vos."

printf 'Bloqueado: HARNESS_READONLY=1, %s no puede editar ni escribir.\n' "$TOOL" >&2
exit 2

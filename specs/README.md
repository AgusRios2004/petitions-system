# specs/ — Convención

Una spec por unidad de trabajo. Es el contrato entre lo que el humano quiere y lo que el agente construye, y el único documento que **bloquea** algo.

## Nomenclatura

```
NNNN-titulo-corto-en-minusculas.md          la spec
NNNN-titulo-corto-en-minusculas.tasks.md    el plan de tareas
```

Numeración secuencial, nunca se reutiliza ni se reordena. Es la misma regla que los ADR y por el mismo motivo: los IDs se citan desde tests y commits, y un ID que cambia de significado rompe el rastro.

## Estados

| Estado | Qué significa | Quién lo cambia |
|:---|:---|:---|
| `draft` | El humano escribió objetivo y restricciones | humano |
| `propuesta` | El agente la expandió, falta aprobación | agente |
| `aprobada` | Mergeada por PR. **Habilita escribir código** | humano, por merge |
| `implementada` | Todos sus AC tienen test y pasan | agente, verificado por CI |
| `archivada` | Cerrada, fuera del contexto activo | humano |

`spec_coverage.py` solo audita specs en `aprobada` e `implementada`. Una spec en `draft` o `propuesta` no bloquea nada — y tampoco habilita nada.

## AC-IDs

Formato: `AC-NNNN-MM`, donde `NNNN` es el id de la spec y `MM` el número de criterio.

El ID va **en el nombre del test**. Con `_` en vez de `-` donde el lenguaje no
acepta guiones: `spec_coverage.py` los trata igual.

```python
def test_ac_0002_04_draft_queda_pending_si_gemini_falla():
    ...
```

```java
@Test
void ac_0002_04_draftQuedaPendingSiGeminiFalla() { … }
```

```ts
it('AC-0002-04: con la API caída el draft queda en pending', () => { … })
```

Por defecto `spec_coverage.py` busca el ID como texto plano en los archivos de
test, así que un docstring o un comentario también cuentan. Pero con
`spec_coverage.junit_glob` activo, solo cuenta un test **que pasó** y cuyo
**nombre** trae el ID: es lo único que aparece en el reporte JUnit. Un
comentario de sección arriba de tres tests no dice cuál de los tres cubre el
criterio, y un test salteado con el ID en un comentario daba verde. Escribilo
en el nombre desde el principio: es gratis y deja activar la evidencia de
ejecución sin renombrar después.

## Reglas

- **Ningún código de implementación antes de que la spec esté `aprobada`.** Es la compuerta G1 y es la única que no se puede automatizar.
- **Un criterio de aceptación se escribe falsable** o no se escribe. Ver la skill `plan-implementacion`.
- **La spec no se edita para que el código pase.** Si la spec está mal, se corrige como spec, por PR, con el humano mirando.
- Una spec `implementada` a la que le borran los tests vuelve a romper CI. Es intencional.

## Relación con el resto de la documentación

La spec **no reemplaza** al PRD ni al ROADMAP: los referencia. El PRD dice qué entra en el producto; la spec dice cómo se verifica una pieza concreta. Si copiás el PRD acá, creaste una segunda verdad que se va a desincronizar.

## Archivado

Una vez por mes: las specs `implementada` pasan a `archivada` y salen del contexto activo del agente.

Una spec sin test asociado no es documentación, es pasivo. Se le escribe el test o se archiva. No hay tercera opción.

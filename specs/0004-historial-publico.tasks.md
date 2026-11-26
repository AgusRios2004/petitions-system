# Tareas — 0004 Historial público del proveedor con menos datos

Spec: [`0004-historial-publico.md`](./0004-historial-publico.md) · Estimado: 2 días-ideales.

Cada tarea empieza con su test en rojo. Los tests del back van en `back/test/t12-0004-*.test.js` y los del front al lado del componente, siguiendo la convención de la spec 0002. El nombre de cada test lleva su AC-ID.

| # | Tarea | Archivos | Depende de | AC | Tam. |
|:--|:---|:---|:---|:---|:--|
| 1 | **Seed con `FIN`.** Sacar la lista de estados a una constante exportada y sumarle `FIN`, sin ejecutar nada al hacer `require`. | `back/scripts/seed.js` | — | AC-0004-06 | S |
| 2 | **Endpoint de historial** con los campos mínimos. | `back/routes/providerRoutes.js`, `back/controllers/providerController.js`, `back/services/postulationService.js` | — | AC-0004-01, 02, 03 | S |
| 3 | **Listado sin `id_petition` solo para el dueño.** Sacar `isPublicHistoryRequest`. | `back/controllers/postulationController.js` | 2 | AC-0004-04, 05 | S |
| 4 | **Front del historial.** `getProviderHistory`, una constante de estados y la página. | `front/src/service/postulationService.ts`, `front/src/app/provider/[id]/postulations/page.tsx`, `front/src/lib/states.ts` (nuevo) | 2, 3 | AC-0004-07, 08 | M |

**Cierre:** los 8 AC con test y todo en verde (back, front, `cd front && npx tsc --noEmit` sin errores nuevos, y build); se cierran B-39, B-42 y B-43 en `docs/HALLAZGOS.md`; la spec pasa a `implementada`.

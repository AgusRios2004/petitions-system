# Tareas — 0003 Postulaciones solo para su autor

Spec: [`0003-postulaciones-del-autor.md`](./0003-postulaciones-del-autor.md) · Estimado: 3 días-ideales.

Cada tarea empieza con su test en rojo (`back/test/t10-0003-*.test.js`, con los fixtures de la 0001). Cada test lleva su AC-ID en el nombre.

| # | Tarea | Archivos | Depende de | AC | Tam. |
|:--|:---|:---|:---|:---|:--|
| 1 | **Errores con su código.** Los controladores de postulación propagan `e.statusCode` y ocultan el detalle de los 5xx; `reject`, `withdraw` y `finish` no hacen doble `rollback`. Borrar `PATCH /:id/winner` y `winnerPostulation`. | `back/controllers/postulationController.js`, `back/routes/postulationRoutes.js`, `back/services/postulationService.js` | — | AC-0003-07, AC-0003-10 | S |
| 2 | **Editar solo el autor**, con campos permitidos, validación y transacción. | `back/controllers/postulationController.js`, `back/services/postulationService.js` | 1 | AC-0003-01 … AC-0003-06 | M |
| 3 | **Finalizar solo en `ACE`.** | `back/services/postulationService.js` | 1 | AC-0003-08, AC-0003-09 | S |
| 4 | **Leer solo autor, dueño o superusuario.** | `back/controllers/postulationController.js` | 1 | AC-0003-11 | S |

**Cierre de la spec:**
- Los 11 AC con test y la suite entera en verde (`npm --prefix back test`).
- B-30 cerrado en `docs/HALLAZGOS.md` con el commit. Anotados los hallazgos nuevos que aparezcan.
- Spec en `implementada`.

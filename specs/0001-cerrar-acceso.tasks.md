# Tareas — 0001 Cerrar el acceso

Spec: [`0001-cerrar-acceso.md`](./0001-cerrar-acceso.md) · Sprint S1 · Estimado: 7,5 días-ideales. Los tamaños son relativos (S ≤ ½ día, M 1–2 días); ver PRD §7.

Orden sugerido: del que expone datos sin login al que requiere una cuenta. Cada tarea empieza con su test en rojo.

| # | Tarea | Archivos | Depende de | AC | Tam. |
|:--|:---|:---|:---|:---|:--|
| 1 | **Fixtures de acceso.** Usuarios A (cliente), B (proveedor), C (cliente ajeno) y un superusuario; una petición de A en `PEN` con dos postulaciones (una de B); una conversación A–B. Helpers `loginAs(user)` y `socketAs(user)`. | `back/test/helpers/fixtures.js`, `back/test/helpers/auth.js` | E0 (T-01) | test propio: los fixtures se crean y cada usuario puede loguearse | M |
| 2 | **`User` sin `password`.** `defaultScope` que lo excluye y scope `withPassword` usado solo por el login. | `back/models/User.js`, `back/controllers/authControllers.js` | 1 | AC-0001-01, AC-0001-02 | S |
| 3 | **Borrar endpoints muertos** y sus controladores y servicios huérfanos (`createCustomer`, `registerCustomer`, `createProvider`, `registerProvider`, `createProfile`). | `back/routes/customerRoutes.js`, `back/routes/providerRoutes.js`, `back/routes/profileRoutes.js`, controladores y servicios asociados | 1 | AC-0001-03 | S |
| 4 | **Catálogos y domicilios solo para superusuario.** `authRequired` + `onlySuperuser`. `onlyStaff`/`onlySuperuser` devuelven 403 (hoy devuelven 500 por el default de `error()`). | `back/routes/categoryRoutes.js`, `back/routes/addressRoutes.js`, `back/routes/departmentRoutes.js`, `back/middlewares/auth.js` | 1 | AC-0001-04 (catálogos y domicilios), AC-0001-05 | S |
| 5 | **Perfiles solo para el dueño.** `authRequired` en `GET`/`PUT` de customer y `PUT` de provider, verificación de dueño contra el token, y lista permitida de campos en los `update`. | `back/routes/customerRoutes.js`, `back/routes/providerRoutes.js`, `back/controllers/customerController.js`, `back/controllers/providerController.js`, `back/services/customerService.js`, `back/services/providerService.js` | 3 (mismos archivos de rutas) | AC-0001-04 (perfiles), AC-0001-06, AC-0001-07, AC-0001-08 | M |
| 6 | **IDOR de usuario:** `updateUser` compara `:id` con `req.user.sub`. | `back/controllers/profileController.js` | 3 (mismo controlador) | AC-0001-09 | S |
| 7 | **Petición solo para el dueño.** Verificación de dueño en `updatePetition`; `id_customer` e `id_state` salen de los campos aplicables y de la validación obligatoria. | `back/controllers/petitionController.js`, `back/services/petitionService.js` | 1 | AC-0001-10, AC-0001-11 | S |
| 8 | **Aceptar con dueño, estado y un solo ganador.** Verificación de dueño (como `rejectPostulation`) y de estado `PEN` de la petición y la postulación, *después* de bloquear la petición. El controlador propaga `e.statusCode` (hoy fuerza 500). | `back/services/postulationService.js`, `back/controllers/postulationController.js` | 1 | AC-0001-12, AC-0001-13, AC-0001-14 | M |
| 9 | **Salas de chat solo para participantes.** `joinConversation` parsea `conversation:<id>` y usa `messageService.isUserParticipant`. | `back/sockets/messageHandler.js` | 1 | AC-0001-15 | S |

**Suma:** 1,5 + 0,5 + 0,5 + 0,5 + 1,5 + 0,5 + 0,5 + 1,5 + 0,5 = **7,5 días-ideales**.

**Cierre de la spec:**
- Los 15 AC tienen test con el ID en el nombre, y `verify.sh` pasa con `commands.test` activo.
- Se hizo la prueba manual de las notas de handoff.
- Se cierran B-01, B-02, B-23, B-03, B-06, B-07 y B-04 en `docs/HALLAZGOS.md`, con el commit de cada uno.

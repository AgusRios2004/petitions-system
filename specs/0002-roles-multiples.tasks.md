# Tareas — 0002 Roles múltiples

Spec: [`0002-roles-multiples.md`](./0002-roles-multiples.md) · Sprint S2 · Estimado: 8,0 días-ideales. Los tamaños son relativos (S ≤ ½ día, M 1–2 días); ver PRD §7.

Orden obligatorio: back (1–5) → front (6–7) → quitar la compatibilidad (8). La tarea 8 nunca va antes que la 6 y la 7. Cada tarea empieza con su test en rojo.

| # | Tarea | Archivos | Depende de | AC | Tam. |
|:--|:---|:---|:---|:---|:--|
| 1 | **Un perfil de cada tipo por usuario.** Índice único en `user_id` de `Customer` y `Provider`. Se aplica recreando la base con el seed. Extiende los fixtures de la spec 0001 con un usuario D que tiene los dos perfiles. | `back/models/Customer.js`, `back/models/Provider.js`, `back/test/helpers/fixtures.js` | spec 0001 implementada | AC-0002-07 | S |
| 2 | **Identidad sin `is_staff`.** El registro deja de escribirlo. Middleware `loadProfiles`. `roles` en el login y en `/profile/me`, con `role` derivado como compatibilidad. | `back/controllers/authControllers.js`, `back/middlewares/auth.js`, `back/controllers/profileController.js` | 1 | AC-0002-01, AC-0002-02 | M |
| 3 | **Postulaciones por relación.** `getAllPostulations` decide con `req.customer`/`req.provider` en vez de `is_staff`. `PATCH /:id/state` pasa a `onlySuperuser` y se elimina `onlyStaff`. | `back/controllers/postulationController.js`, `back/routes/postulationRoutes.js`, `back/middlewares/auth.js` | 2 (mismo middleware) | AC-0002-09, AC-0002-10 | M |
| 4 | **Activar el segundo perfil.** `POST /api/profile/me/provider` y `/customer`, en una transacción con el domicilio, con `reuseAddress`. El error de unicidad se traduce a 409. | `back/routes/profileRoutes.js`, `back/controllers/profileController.js`, `back/services/customerService.js`, `back/services/providerService.js` | 1, 2 (mismo controlador) | AC-0002-03, AC-0002-06, AC-0002-08 | M |
| 5 | **No postularse a lo propio.** `createPostulation` compara el dueño de la petición con el usuario. Se corrige también la firma de `Provider.findOne` para que corra dentro de la transacción (B-15, mismo bloque). | `back/services/postulationService.js` | 4 (AC-0002-04 usa el endpoint de activación) | AC-0002-04, AC-0002-05 | S |
| 6 | **Capacidades en el front.** Función pura que deriva `isCustomer`/`isProvider`. `AuthContext` la usa en lugar de `is_staff` y expone `activeMode`/`setActiveMode`. Se ajustan los tipos de `common.ts`. | `front/src/context/AuthContext.tsx`, `front/src/lib/roles.ts` (nuevo), `front/src/types/common.ts` | 2 (el back devuelve `roles`) | AC-0002-13 | S |
| 7 | **Selector de modo en `/profile`.** Componente de selector; el modo sale de `?mode=`, si no de `localStorage`, si no el default. `ProviderProfile` conserva `mode` al cambiar de pestaña. Cambiar de modo invalida la cache. | `front/src/app/profile/page.tsx`, `front/src/components/profile/ProfileModeSwitch.tsx` (nuevo), `front/src/components/profile/ProviderProfile.tsx` | 6 | AC-0002-14, AC-0002-15, AC-0002-16, AC-0002-17 | M |
| 8 | **Quitar la compatibilidad.** El back deja de devolver `role` e `is_staff` y de ponerlo en el JWT. El front deja de leer `user.role` (`ProfileCompletionGuard`, `IncompleteProfile`) y usa las capacidades. | `back/controllers/authControllers.js`, `back/controllers/profileController.js`, `front/src/components/auth/ProfileCompletionGuard.tsx`, `front/src/components/profile/IncompleteProfile.tsx` | 3, 6, 7 | AC-0002-11, AC-0002-12 | S |

**Suma:** 0,5 + 1,5 + 1,5 + 1,5 + 0,5 + 0,5 + 1,5 + 0,5 = **8,0 días-ideales** (100 % de la capacidad de S2; ver PRD §8, "qué se cae").

**Cierre de la spec:**
- Los 17 AC tienen test con el ID en el nombre, y `verify.sh` pasa.
- Prueba manual:
  - Registrarse como cliente.
  - Activar el perfil de proveedor por API (no hay UI hasta F-16) y recargar `/profile`: aparece el selector.
  - Postularse a una petición ajena en modo proveedor.
  - Volver a modo cliente y ver las peticiones propias sin datos del otro modo.
- Se cierran B-05, B-26, B-27, B-24 y F-02 en `docs/HALLAZGOS.md`. B-15 se cierra con la tarea 5.

**Nota de plan:** la tarea 5 absorbe B-15 porque toca exactamente el mismo bloque. Sale de S4 y deja 0,5 días libres ahí.

---
id: 0002
titulo: Roles múltiples
estado: propuesta        # draft | propuesta | aprobada | implementada | archivada
autor_humano: Diego Agustín Rios
fecha: 28/09/2026
adrs_relacionados: []    # la decisión de diseño vive en docs/PRD.md §3.1
---

## Objetivo

Que una misma cuenta pueda ser cliente, proveedor o las dos cosas, y que los permisos dependan de la relación con el recurso y no de un rol. Cubre la épica E2 del [PRD](../docs/PRD.md): hallazgos B-05, B-26, B-27, B-24 y F-02 de [`docs/HALLAZGOS.md`](../docs/HALLAZGOS.md).

## Restricciones

Decisiones del humano (28/09/2026, PRD §3.1 y §9):

- **El rol lo da el perfil.** Es cliente quien tiene fila en `Customer`; es proveedor quien tiene fila en `Provider`; administrador es `is_superuser`. No se usa `n_user_role` (se elimina en E5, B-28).
- **Los roles no van en el JWT.** El token lleva `sub`, `email` e `is_superuser`.
- **En el registro se elige un solo rol**, como hoy. El segundo se activa después desde el perfil. El formulario de registro no cambia.
- **UI:** selector de modo en `/profile?mode=customer|provider`, recordado entre sesiones. Los dos dashboards (`CustomerProfile`, `ProviderProfile`) se reutilizan sin fusionarse.
- **Reputación separada por rol**, como hoy: `GradeCustomer` / `GradeProvider`.

Precondiciones:

- **Spec 0001 `implementada`.** Esta spec reescribe la autorización de postulaciones y supone que perfiles, peticiones y `accept` ya verifican al dueño.
- **E0 cerrado.** Hacen falta los runners de tests del back (T-01) y del front (T-04).

## Comportamiento esperado

1. **Registro y token.**
   - El registro deja de escribir `is_staff`.
   - El login y `GET /api/profile/me` devuelven `roles: { customer: boolean, provider: boolean }`, derivado de los perfiles que existen.
   - El JWT no lleva ni roles ni `is_staff`.
2. **Perfiles por request.** Un middleware `loadProfiles`, que corre después de `authRequired`, deja en `req.customer` y `req.provider` los perfiles del usuario, o `null`.
3. **Activar el segundo perfil.**
   - Rutas autenticadas: `POST /api/profile/me/provider` (`id_profession`, `id_type_provider`, `description`) y `POST /api/profile/me/customer` (`dni`, `phone`).
   - Cada una acepta un domicilio nuevo o `reuseAddress: true`, que reutiliza el `address_id` del perfil que ya existe.
   - Responden 201 con el mismo payload que `/profile/me`.
   - El perfil queda usable **con el token actual**, sin volver a loguearse.
4. **Un perfil de cada tipo por usuario**, garantizado por la base con un índice único en `Customer.user_id` y en `Provider.user_id`.
5. **Postulaciones por relación.**
   - `GET /api/postulation` le da todas las postulaciones de una petición a su cliente dueño. A cualquier proveedor le da solo la propia.
   - `PATCH /:id/state` pasa a ser solo de superusuario.
   - Nadie puede postularse a una petición propia.
6. **Front.**
   - `AuthContext` expone `isCustomer`/`isProvider` (derivados de `user.customer`/`user.provider`) y `activeMode`.
   - Con los dos perfiles, `/profile` muestra un selector. El modo sale de `?mode=`, si no del último elegido (guardado en el navegador), y si no, `customer`.
   - Con un solo perfil no hay selector.
   - Cambiar de modo invalida la cache de React Query. Cambiar de pestaña conserva el modo.
7. **Compatibilidad durante la migración.** Hasta que el front deje de leerlos (tarea 8), `/profile/me` y el login siguen devolviendo un `role` derivado: `provider` si solo tiene perfil de proveedor, y `customer` en cualquier otro caso. Al cerrar la spec, ni `role` ni `is_staff` salen de la API.

## Casos de borde

| Caso | Comportamiento |
|:---|:---|
| **Vacío:** usuario sin ningún perfil (el superusuario del seed) | `roles` en `false/false`. `/profile` no muestra selector ni dashboard, y muestra el mensaje actual de rol desconocido. Sus rutas de negocio responden 403. |
| **Vacío:** activar un perfil con el body vacío | 400 con los campos faltantes; no se crea nada. |
| **Vacío:** `reuseAddress: true` sin un perfil previo que tenga domicilio | 400; no se crea nada. |
| **Duplicado:** activar un perfil que ya existe | 409, y sigue habiendo una sola fila. |
| **Duplicado:** dos activaciones simultáneas del mismo perfil | Una 201 y otra 409. El índice único lo garantiza aunque el chequeo previo no vea la carrera: el error de unicidad se traduce a 409, no a 500. |
| **Fuera de rango:** `?mode=admin` o `?mode=provider` sin perfil de proveedor | Se ignora y se usa el modo por defecto del usuario. |
| **Concurrente:** el usuario activa su perfil de proveedor en una pestaña mientras otra tiene el `user` viejo guardado en el navegador | La otra pestaña sigue en modo cliente hasta recargar `/profile/me`. Se acepta: refrescar el `user` al volver a la pestaña es parte de F-16 (E3). |
| **Servicio externo caído:** la base cae a mitad de la activación con domicilio nuevo | Domicilio y perfil se crean en una sola transacción: rollback de los dos, sin domicilio huérfano. |
| **Reinicio a mitad de operación** | Mismo caso que el anterior. |
| **Token viejo con `is_staff`** (emitido antes del cambio) | Se ignora: nada lee `is_staff`. Igual se rota `JWT_SECRET` al desplegar, porque no hay usuarios reales (PRD §10). |

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0002-01 | Registrar un cliente y un proveedor por `POST /api/auth/register` deja `is_staff = false` en los dos usuarios. | |
| AC-0002-02 | El login y `GET /api/profile/me` devuelven `roles` igual a `{customer:true, provider:false}` para un cliente, `{false, true}` para un proveedor y `{true, true}` para un usuario con los dos perfiles. | |
| AC-0002-03 | Un cliente sin perfil de proveedor hace `POST /api/profile/me/provider` con un body válido → 201. Un `GET /api/profile/me` con el **mismo token** devuelve `roles.provider = true`. | |
| AC-0002-04 | Con el mismo token de AC-0002-03, sin volver a loguearse, `POST /api/postulation` a una petición de otro cliente responde 2xx, y la postulación queda con el `id_provider` del perfil recién creado. | |
| AC-0002-05 | Un usuario con los dos perfiles hace `POST /api/postulation` a una petición propia → 403, y la cantidad de postulaciones de esa petición no cambia. | |
| AC-0002-06 | `POST /api/profile/me/provider` de un usuario que ya es proveedor → 409, y sigue habiendo una sola fila `Provider` para ese `user_id`. Lo mismo para `/customer`. | |
| AC-0002-07 | Crear por modelo un segundo `Customer`, o un segundo `Provider`, con un `user_id` que ya tiene uno falla con `SequelizeUniqueConstraintError`. | |
| AC-0002-08 | `POST /api/profile/me/customer` sin `dni` o sin `phone` → 400 y no crea nada. Con `reuseAddress: true`, desde un proveedor, → 201, y el `address_id` del cliente nuevo es igual al del proveedor. | |
| AC-0002-09 | `GET /api/postulation?id_petition=X` con token de un proveedor que no es dueño devuelve solo postulaciones con su propio `id_provider`. Con token del cliente dueño devuelve las dos del fixture. | |
| AC-0002-10 | `PATCH /api/postulation/:id/state` con token de un proveedor → 403. | |
| AC-0002-11 | Un test que lee `back/controllers`, `back/services` y `back/middlewares` no encuentra la cadena `is_staff`. | |
| AC-0002-12 | El JWT del login, decodificado, tiene claves ⊆ `{sub, email, is_superuser, iat, exp}`. Ni `user` del login ni `/profile/me` contienen `is_staff` ni `role`. | |
| AC-0002-13 | (front) La función que deriva capacidades devuelve `{isCustomer:true, isProvider:false}` para un usuario con solo `customer`, `{true, true}` con los dos perfiles y `{false, false}` sin ninguno. | |
| AC-0002-14 | (front) `/profile` con un usuario con los dos perfiles muestra un selector con dos opciones. `?mode=provider` renderiza `ProviderProfile` y `?mode=customer` renderiza `CustomerProfile`. | |
| AC-0002-15 | (front) `/profile` con un usuario con solo `customer` no muestra selector y renderiza `CustomerProfile`, aunque la URL traiga `?mode=provider`. | |
| AC-0002-16 | (front) Elegir el modo proveedor y volver a montar `/profile` sin `?mode` renderiza `ProviderProfile`. Cambiar de pestaña dentro de `ProviderProfile` deja `mode=provider` en la URL. | |
| AC-0002-17 | (front) Cambiar de modo en el selector llama a `queryClient.invalidateQueries` exactamente una vez. | |

## Fuera de alcance

| Qué | Por qué |
|:---|:---|
| Pantalla para activar el segundo perfil ("Activar perfil de proveedor") | Es F-16, en E3. Esta spec deja el endpoint y lo prueba por API. La UI, junto con refrescar el `user` guardado, va con la sesión (F-01) porque tocan el mismo `AuthContext`. |
| Elegir los dos roles en el registro | Decidido que no (PRD §9). |
| Borrar la columna `is_staff` y las tablas `n_role`/`n_user_role` | B-28, en E5, con migraciones. Hasta entonces la columna existe pero nadie la lee (AC-0002-11). |
| Calificar solo si participaste (B-25) | E3. Con roles múltiples el riesgo es el mismo que ya existía. |
| Marcar en la lista de conversaciones "como cliente" / "como proveedor" | Nice-to-have sin hallazgo asociado. Se deriva de la petición de la conversación cuando haga falta. |
| Dashboard unificado | Descartado en favor del selector (PRD §9). |

## Notas de handoff

**Qué asumí:**
- El modo por defecto de un usuario con los dos perfiles es `customer`, cuando no hay nada en la URL ni guardado.
- El "último modo elegido" se guarda en `localStorage`, envuelto en `try/catch` como el resto del `AuthContext`: es una preferencia del navegador, no un dato de la cuenta.
- `role` y `is_staff` se sacan de la API en esta misma spec (tarea 8), no en E5.

**Preguntas abiertas:**
- Ninguna que bloquee. La del PRD §9.1 (si un proveedor ve las ofertas de otros) se resolvió por el supuesto "no", y está codificada en AC-0002-09. Si cambia, cambia ese AC por PR.

**Lo más probable que salga mal:**
1. **Front y back desalineados sobre el rol a mitad del sprint.** La tarea 8 depende de las tareas 6 y 7. Si el sprint se corta antes, se cierra con la compatibilidad de `role` puesta, y la tarea 8 pasa al sprint siguiente. Nunca al revés: sacar `role` antes de que el front lo deje de leer rompe `/profile` para todos.
2. **`ProviderProfile` pierde el modo al cambiar de pestaña,** porque hoy hace `router.push('/profile?tab=…')` y descarta el resto de la query. Lo cubre AC-0002-16, pero es el tipo de bug que aparece en cada link interno que arma `/profile?…` a mano. Buscar todos los `'/profile?` del front antes de cerrar.
3. **Datos cruzados entre modos.** Queries con claves ambiguas (`['petitions']`, F-12) muestran en modo proveedor lo cacheado en modo cliente. AC-0002-17 lo mitiga invalidando todo; el arreglo de fondo es F-12, en E6.
4. **El índice único no llega a la base de desarrollo,** porque `sync()` sin `force` no altera tablas existentes. Se aplica volviendo a correr `npm --prefix back run seed`, que hace `sync({ force: true })`. Anotarlo en el PR.

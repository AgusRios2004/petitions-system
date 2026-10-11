---
id: 0001
titulo: Cerrar el acceso
estado: propuesta        # draft | propuesta | aprobada | implementada | archivada
autor_humano: Diego Agustín Rios
fecha: 28/09/2026
adrs_relacionados: []    # no hay ADRs; la decisión de roles vive en docs/PRD.md §3.1
---

## Objetivo

Que ningún usuario, logueado o no, pueda leer datos privados de otro o modificar recursos que no le pertenecen. Cubre la épica E1 del [PRD](../docs/PRD.md): hallazgos B-01, B-02, B-23, B-03, B-06, B-07 y B-04 de [`docs/HALLAZGOS.md`](../docs/HALLAZGOS.md).

## Restricciones

- Los permisos son los de la matriz del PRD §3. Esta spec la hace cumplir para las acciones que ya existen; lo que es propio de roles múltiples va en la spec 0002.
- **No se rompe ninguna pantalla del front.** El front usa estos endpoints, que cambian de permisos pero siguen existiendo:
  - `GET /api/customer/:id` (perfil propio)
  - `PUT /api/customer/:id` y `PUT /api/provider/:id` (edición del perfil propio)
  - `PUT /api/profile/user/:id` (usuario propio)
  - `PUT /api/petition/:id` (con `id_customer` e `id_state` en el body)
  - el evento de socket `joinConversation`
- **No se cambia el formato de errores** (`{ status, message, errors }`) ni los códigos de los flujos que esta spec no toca. Un 500 en credenciales inválidas sigue siendo 500 hasta la spec de E3 (B-10).
- **Precondición:** E0 cerrado. Hace falta el runner de tests del back (T-01), con una MySQL de test, para correr los tests de esta spec.

## Comportamiento esperado

1. **Datos privados.** El modelo `User` excluye `password` por defecto. Solo el login lo pide explícitamente, para comparar el hash. Ningún endpoint, público o autenticado, devuelve la clave `password` en ningún nivel del JSON.
2. **Endpoints muertos y peligrosos se eliminan** (el front no los usa):
   - `GET /api/customer` (listado con DNI y teléfono de todos los clientes)
   - `POST /api/customer`, `POST /api/provider`
   - `POST /api/customer/register`, `POST /api/provider/register` (este último acepta `isStaff` del body)
   - `POST /api/profile`
3. **Catálogos y domicilios son de administración.** Escribir categorías, departamentos y domicilios, y leer `/api/addresses`, requiere token de un usuario con `is_superuser`. Sin token → 401; con token de un usuario común → 403.
4. **Perfil de cliente y de proveedor.**
   - `GET /api/customer/:id`, `PUT /api/customer/:id` y `PUT /api/provider/:id` requieren token, y solo el dueño del perfil pasa.
   - `PUT` aplica solo campos de una lista permitida. `user_id` y la clave primaria nunca cambian por body.
5. **Usuario.** `PUT /api/profile/user/:id` solo pasa si `:id` es el `sub` del token.
6. **Petición.** `PUT /api/petition/:id` solo lo puede hacer el cliente dueño. `id_customer` e `id_state` del body se ignoran: el estado cambia solo por `/cancel` y `/complete`.
7. **Aceptar una postulación.**
   - Solo el cliente dueño de la petición puede aceptarla.
   - La petición y la postulación tienen que estar en `PEN`; si no, se responde 409 y nada cambia.
   - Dos aceptaciones simultáneas sobre la misma petición dejan un solo ganador.
8. **Chat en tiempo real.** `joinConversation` solo une a la sala a un participante de la conversación. Un pedido ajeno se ignora y se loguea.

## Casos de borde

| Caso | Comportamiento |
|:---|:---|
| **Vacío:** id inexistente en cualquier ruta protegida | 404 si el recurso no existe; 403 si existe y es ajeno. Se acepta que eso revela la existencia del id: los ids son secuenciales y ya se exponen en las URLs. |
| **Vacío:** `PUT` del dueño con body vacío o solo con campos no permitidos | 400 "No se proporcionaron datos para actualizar"; nada cambia. |
| **Duplicado:** aceptar dos veces la misma postulación | La segunda da 409, porque la postulación ya no está en `PEN`. |
| **Fuera de rango:** id no numérico (`/api/petition/abc`) | 404, sin llegar a la base con `NaN`. |
| **Fuera de rango:** `joinConversation` con un nombre de sala que no respeta `conversation:<id>` | Se ignora. |
| **Concurrente:** dos `accept` a la vez sobre postulaciones distintas de la misma petición | Exactamente una responde 200 y la otra 409. La petición queda con una sola postulación `winner = true`. |
| **Servicio externo caído:** MySQL cae durante `accept` | Rollback completo. La respuesta es 500 sin el detalle del error, y ni la petición ni la postulación cambian de estado. |
| **Reinicio a mitad de operación** | Mismo caso que el anterior: la transacción no confirmada no deja estado parcial. Las notificaciones se emiten solo después del commit, como hoy. |
| **Token de superusuario en rutas de dueño** | El superusuario **no** saltea la verificación de dueño en perfiles, peticiones ni postulaciones. Solo administra catálogos. |

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0001-01 | Recorrer con los tokens de A y B, y sin token donde el endpoint es público: `GET /api/provider`, `/api/provider/:id`, `/api/provider/public/:id`, `/api/provider/details/:id`, `/api/customer/:id` (dueño), `/api/article`, `/api/article/:id`, `/api/offer`, `/api/postulation/:id`, `/api/profile/me` y `POST /api/auth/login`. La clave `password` aparece 0 veces, buscada recursivamente en cada JSON. | |
| AC-0001-02 | `POST /api/auth/login` con la contraseña correcta devuelve `accessToken`; con una incorrecta, no. | |
| AC-0001-03 | `GET /api/customer`, `POST /api/customer`, `POST /api/customer/register`, `POST /api/provider`, `POST /api/provider/register` y `POST /api/profile` responden 404. | |
| AC-0001-04 | Sin token responden 401: `PUT /api/customer/:id`, `PUT /api/provider/:id`, `POST`/`PUT`/`DELETE` de `/api/category`, `/api/addresses` y `/api/departments`, y los tres `GET` de `/api/addresses`. | |
| AC-0001-05 | Con token de un usuario sin `is_superuser`, las escrituras de catálogos y los `GET` de `/api/addresses` responden 403. Con token de superusuario, `POST /api/category` responde 2xx. | |
| AC-0001-06 | `GET /api/customer/:idA` con token de B responde 403; con token de A, 200. | |
| AC-0001-07 | `PUT /api/customer/:idA` y `PUT /api/provider/:idProvA` con token de B responden 403, y un `GET` posterior muestra el perfil sin cambios. Con token del dueño, 200. | |
| AC-0001-08 | `PUT /api/customer/:idA` del dueño con `user_id` distinto en el body responde 200, y `user_id` queda igual. | |
| AC-0001-09 | `PUT /api/profile/user/:idA` con token de B responde 403, y el email de A queda igual. Con token de A, 200. | |
| AC-0001-10 | `PUT /api/petition/:idPetA` con token de B responde 403, y la descripción queda igual. | |
| AC-0001-11 | `PUT /api/petition/:idPetA` de A, con `id_customer` de B e `id_state` de `CAN` en el body, responde 200, y la petición conserva su `id_customer` y su `id_state` originales. | |
| AC-0001-12 | `PATCH /api/postulation/:id/accept` con token del proveedor autor de la postulación responde 403, y la postulación y la petición siguen en `PEN`. | |
| AC-0001-13 | `accept` del dueño sobre una petición en `CAN`, o sobre una postulación en `REC`, responde 409, y ningún estado cambia. | |
| AC-0001-14 | Dos `accept` concurrentes (`Promise.all`) del dueño sobre dos postulaciones de la misma petición: una responde 200 y la otra 409, y la petición tiene exactamente una postulación con `winner = true`. | |
| AC-0001-15 | Un socket de C, que no participa, emite `joinConversation` con `conversation:<idConvAB>`. A manda un mensaje a esa conversación: C no recibe `newMessage` en 500 ms, y B sí. | |

## Fuera de alcance

| Qué | Por qué |
|:---|:---|
| Pasar credenciales inválidas y tokens vencidos a 401/400 | B-10, en la spec de E3. Mezclarlo acá cambia contratos que el front interpreta, sin relación con el acceso. |
| `is_staff`, roles y ver postulaciones de la competencia | B-05, en la spec 0002. Esta spec no toca `getAllPostulations` ni `onlyStaff`, más allá de corregir el status que devuelven. |
| Calificar sin haber participado (B-25) | E3. No es explotable para leer ni modificar datos ajenos, solo para ensuciar reputación. |
| Tipo y tamaño de los uploads (B-08) | E4. Es otra superficie, con otro test. |
| Validación de forma de los bodies (B-20) | E6. Acá solo se valida *quién* puede, no *qué* forma tiene el dato. |
| Cambios en el front | No hacen falta: los endpoints que usa siguen existiendo con el mismo contrato para el dueño. Se verifica a mano (ver notas). |

## Notas de handoff

**Qué asumí:**
- Los catálogos (categorías, departamentos, domicilios) los administra solo `is_superuser`, que hoy asigna únicamente el seed (PRD §9, pregunta abierta 2).
- `GET /api/category` sigue siendo público porque el front lo usa en el registro.
- Recurso inexistente → 404 y ajeno → 403 (ver casos de borde).
- El seed se puede volver a correr: no hay datos reales.

**Preguntas abiertas:**
- ¿Algún domicilio necesita ser visible para otro usuario, por ejemplo la dirección de una petición para el proveedor ganador? Hoy nadie la lee por `/api/addresses`; si hace falta, va por la petición y con su propio permiso.

**Lo más probable que salga mal:**
1. **El `defaultScope` que excluye `password` no se aplica a todos los `include`.** En Sequelize 6 el scope por defecto del modelo incluido se respeta, pero un `include` con `attributes` propios o una consulta cruda (`gradeService.js` usa SQL a mano) lo esquivan. Por eso AC-0001-01 recorre respuestas reales en vez de confiar en el modelo.
2. **El login deja de funcionar**, porque `comparePassword` necesita el hash. Lo cubre AC-0001-02, pero hay que correrlo primero.
3. **El chat deja de actualizarse en vivo** si `MessageList.tsx:73` se une a salas antes de que exista la fila de participante (conversación recién creada). Probar a mano iniciar una conversación nueva desde una postulación.
4. **Prueba manual obligatoria antes de cerrar**, porque el front no tiene tests de estos flujos: editar el perfil de cliente, editar el de proveedor, editar una petición, aceptar una postulación y chatear.

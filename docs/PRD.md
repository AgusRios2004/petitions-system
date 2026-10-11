# PRD — JobFinder: ciclo de endurecimiento

| | |
|:---|:---|
| **Estado** | propuesta (falta aprobación) |
| **Fecha** | 28/09/2026 |
| **Base** | `main` @ `b65dd1a` |
| **Hallazgos** | [`HALLAZGOS.md`](./HALLAZGOS.md): la fuente de verdad. Este documento cita IDs y no repite el detalle. |

## 1. Problema

JobFinder cubre el flujo completo del marketplace: petición → postulación → aceptación → finalización → calificación, con chat y notificaciones en tiempo real. Funcionalmente está.

Lo que no está es el **control de acceso**:
- Cualquiera sin login lee los hashes de contraseñas (B-01) y edita clientes y proveedores (B-02), o se registra con el flag de staff (B-23).
- Cualquier usuario logueado edita a otros (B-03, B-06), se adjudica trabajos (B-04), ve las ofertas de la competencia (B-05) o escucha chats ajenos (B-07).

Además, la identidad asume **un rol por cuenta**: para ser cliente y proveedor hoy hacen falta dos usuarios con emails distintos.

Y nada impide que se rompa de nuevo: no hay tests (T-01) y el build ignora los errores de tipos (F-07).

Este ciclo **no agrega features**, salvo roles múltiples, que es un cambio de modelo de identidad y no se puede postergar: toca la misma autorización que hay que arreglar. Deja el producto que ya existe en un estado que se pueda defender y desplegar.

## 2. Objetivos

1. Ningún usuario puede leer ni modificar datos que no le pertenecen, por HTTP ni por socket.
2. La sesión no se cae a la hora de uso.
3. Los flujos que hoy fallan (link roto, URLs hardcodeadas, `createCustomer`) funcionan.
4. Hay una compuerta automática (tests + build estricto) que impide volver atrás.
5. Una misma cuenta puede ser cliente y proveedor (§3.1).
6. La base de datos y el proyecto se levantan desde cero siguiendo el README.

### No-objetivos (con la razón, para no rediscutirlos)

| Queda afuera | Por qué |
|:---|:---|
| Features nuevas (pagos, búsqueda, mapas…) | Agregar superficie antes de cerrar el acceso multiplica los agujeros. |
| Migrar el front a Server Components | 69 archivos son `'use client'` y la sesión vive en `localStorage`: sería una reescritura. Se corrige el README (T-02), no el código. |
| Tokens en cookies `httpOnly` | Obliga a mismo dominio y protección CSRF. Se revisa cuando B-08 esté cerrado, porque el XSS de uploads es el vector que lo haría urgente. |
| Cambiar Express, Sequelize o MySQL | El problema es cómo se usan, no cuáles son. |
| Rediseño visual | La UI tiene una identidad coherente (oscura, Tailwind). La skill `frontend-design` es para identidades nuevas y no aplica. |
| Cambiar `react-hot-toast` por Sonner | `pick-ui-library` lo sugiere, pero la misma skill dice no rotar una dependencia que ya funciona sin pedido: tiene 25 usos y anda. |

## 3. Usuarios y permisos esperados

Esta matriz es el contrato que verifican los tests de S1 a S3. "Cliente" y "proveedor" son **perfiles**, no cuentas: una misma persona puede tener los dos (§3.1). Donde dice **(supuesto)** hay una decisión de negocio pendiente (§9).

| Acción | Cliente dueño | Otro cliente | Proveedor | Proveedor postulado | Anónimo |
|:---|:---|:---|:---|:---|:---|
| Ver una petición abierta | ✓ | ✓ | ✓ | ✓ | ✓ (supuesto) |
| Editar o cancelar una petición | ✓ | ✗ | ✗ | ✗ | ✗ |
| Postularse a una petición | ✗, aunque también sea proveedor | — | ✓ | ✗ (ya está postulado) | ✗ |
| Ver las postulaciones de una petición | ✓ todas | ✗ | ✗ | solo la propia (supuesto) | ✗ |
| Aceptar o rechazar una postulación | ✓ | ✗ | ✗ | ✗ | ✗ |
| Editar o retirar una postulación | ✗ | ✗ | ✗ | ✓ la propia | ✗ |
| Calificar | ✓ al ganador, con la petición finalizada | ✗ | ✗ | ✓ al cliente, si ganó y finalizó | ✗ |
| Editar un perfil de usuario | solo el propio | ✗ | solo el propio | — | ✗ |
| Leer mensajes de una conversación | solo si participa | ✗ | solo si participa | — | ✗ |
| CRUD de catálogos (categorías, departamentos…) | ✗ | ✗ | ✗ | ✗ | ✗: solo admin (supuesto, ver §9) |

### 3.1 Roles múltiples: un usuario, dos perfiles

**Requisito:** una persona puede ser cliente, proveedor o las dos cosas con **una sola cuenta**. Hoy hacen falta dos cuentas con emails distintos.

**Decisión: el rol lo da el perfil.**
- Un usuario es cliente si tiene fila en `Customer`, y proveedor si tiene fila en `Provider`.
- Administrador es `is_superuser`.
- `is_staff` deja de significar "proveedor", y `n_role`/`n_user_role` se eliminan (B-28).

**Por qué perfiles y no la tabla `n_user_role`:**
- Cada rol ya exige datos propios: DNI y teléfono para el cliente; profesión, tipo y descripción para el proveedor. Un rol sin su perfil no sirve para nada.
- El modelo ya lo soporta: `User` tiene `hasOne` a `Customer` y a `Provider`, y el login ya devuelve los dos.
- Con una tabla de roles aparte habría dos verdades que se desincronizan. Ese es justamente el estado "perfil incompleto" que la app tiene que manejar hoy (`IncompleteProfile`).

**Los roles no van en el JWT.** El token lleva `sub` (y `is_superuser`). Si el token llevara los roles, un usuario que activa su perfil de proveedor seguiría con un token viejo hasta refrescarlo. En cambio, un middleware `loadProfiles` resuelve `req.customer` y `req.provider` en cada request.

**La autorización pasa a ser por relación con el recurso, no por rol.** La pregunta deja de ser "¿es proveedor?" y pasa a ser "¿es el cliente dueño de *esta* petición?" o "¿es el proveedor de *esta* postulación?". La mayoría de los servicios ya lo hace así: hay 6 búsquedas `findOne({ where: { user_id } })` en `postulationService`, `petitionService`, `availabilityController` y `messageService`. Las excepciones que hay que reescribir son `getAllPostulations` y `onlyStaff`, que leen `is_staff`.

**Reglas que aparecen con el rol dual:**
- **No postularse a la petición propia (B-24).** Hoy no pasa porque nadie tiene los dos perfiles; el front lo esconde, pero el back no lo impide.
- **Calificar solo como parte de la petición (B-25).**
- La conversación consigo mismo ya está bloqueada (`messageController.js:65`).

**Lo que ya sirve y no se toca:**
- El login y `/profile/me` devuelven `customer` y `provider`.
- `PostulationCard` recibe `role` como prop desde la pantalla que la usa, no desde el usuario: ya modela "de qué lado de esta postulación estoy".
- `PetitionDetail`, las páginas de postulación y `ProviderOportunities` ya deciden por `user.provider`/`user.customer`.
- `Header` y las notificaciones no dependen del rol.

**Lo que cambia:**

| Capa | Qué | Hallazgo |
|:---|:---|:---|
| Back | El registro deja de setear `is_staff`. El token y `/profile/me` exponen `roles: { customer, provider }` derivado de los perfiles. | B-05 |
| Back | `loadProfiles` y la autorización de postulaciones por relación. `onlyStaff` pasa a `onlySuperuser` o se elimina. | B-05 |
| Back | `POST /api/profile/me/provider` y `/customer`, autenticados, para activar el segundo perfil. La dirección del perfil existente se puede reutilizar. Reemplazan al `POST /api/profile` roto. | B-26 |
| Back | Índice único en `Customer.user_id` y `Provider.user_id`. | B-27 |
| Back | 403 al postularse a la petición propia. | B-24 |
| Front | `AuthContext`: saca `role` y expone `isCustomer`/`isProvider` más un `activeMode`. `/profile` muestra un selector si tiene los dos perfiles. | F-02 |
| Front | "Activar perfil de proveedor/cliente" en lugar de `IncompleteProfile` y el link roto. | F-16, F-04 |

**Datos compartidos:**
- La foto y el nombre viven en `User` y se comparten entre los dos perfiles.
- La reputación queda **separada por rol** (`GradeCustomer` / `GradeProvider`): el perfil público de proveedor muestra solo la de proveedor.

**Decisiones confirmadas el 28/09/2026** (§9):
- **Registro:** se elige un rol; el segundo se activa desde el perfil.
- **UI:** selector de modo en `/profile`.

## 4. Alcance por épica

Cada épica tiene un **criterio de salida falsable**: se demuestra corriendo algo. Las specs de cada épica (`specs/NNNN-*.md`) van a bajar esto a `AC-NNNN-MM` con un test por criterio.

### E0 — Preparación · T-01, T-04, T-03, F-08, F-07, B-09, B-22

- Existen un runner de tests en `back/` (API contra una MySQL de test) y el harness de commons instalado.
- F-07 entra acá y no en E5 porque es lo que vuelve alcanzable la compuerta: sin lint y `tsc` en verde, `commands.lint` y `commands.typecheck` no se pueden activar en `harness.config.yml`.
- **Salida:**
  - `npm test` en `back/` corre al menos un test que levanta la app y pega a `/api/auth/login`.
  - `npm test` en `front/` corre al menos un test de componente (T-04).
  - `commands.test`, `commands.lint` y `commands.typecheck` están completos en `harness.config.yml`, y `bash .harness/scripts/verify.sh` pasa con los tres.
  - `npm run build` en `front/` **falla** ante un error de tipos y pasa en `main`.
  - `git ls-files back/uploads` sale vacío.
  - `npm ls next` en `front/` coincide con el lockfile.

### E1 — Cerrar el acceso · B-01, B-02, B-23, B-03, B-04, B-06, B-07

- **Salida:**
  - Ninguna respuesta JSON de la API contiene la clave `password`. Se verifica con un test que recorre todos los `GET` públicos.
  - Cada endpoint de escritura de B-02, sin token, responde **401**. `POST /api/profile` se elimina (lo reemplaza B-26 en E2).
  - `/api/provider/register` y `/api/customer/register` responden **404** (B-23).
  - Con dos usuarios de prueba A y B: B recibe **403** al editar el usuario de A, editar la petición de A o aceptar una postulación de una petición de A.
  - Un socket de B que emite `joinConversation` sobre una conversación de A no recibe los mensajes de A.

### E2 — Roles múltiples · B-05, B-26, B-27, B-24, B-15, F-02

- **Salida:**
  - Un usuario registrado como cliente activa su perfil de proveedor con `POST /api/profile/me/provider` y, **sin volver a loguearse**, se postula a la petición de otro usuario.
  - Ese mismo usuario recibe **403** al postularse a una petición propia.
  - Activar por segunda vez un perfil que ya existe → **409**.
  - `grep -rn is_staff back/controllers back/services back/middlewares` sale vacío.
  - Un proveedor que no es dueño de la petición, al pedir sus postulaciones, recibe solo la propia.
  - En el front: con los dos perfiles, `/profile` muestra el selector y cada modo abre su dashboard. Con un solo perfil, no hay selector.

### E3 — Sesión, errores y alta del segundo perfil · B-10, F-01, B-11, F-16, F-04, F-03, B-25

- **Salida:**
  - Credenciales inválidas → **401**; campos faltantes → **400**; ningún error de validación → 500.
  - Con `JWT_EXPIRES=10s`, la app sigue operando pasados 15 s sin volver al login. Con el refresh vencido, redirige a `/login`.
  - Con un solo perfil, `/profile` ofrece "Activar perfil de …", que lleva a un formulario que existe y crea el perfil.
  - Visitar `/petition/create` sin sesión redirige a `/login`.
  - Calificar en una petición en la que no participaste → **403**.

### E4 — Archivos y bugs funcionales · B-08, F-05, F-06, B-12, B-13, B-14, B-21, B-17, B-18

- **Salida:**
  - Subir un `.html` → **400**. Subir un archivo de más de 10 MB → **413** (el límite es supuesto).
  - `grep -rn localhost front/src` solo encuentra el fallback de configuración.
  - `POST /api/postulation` responde **201**.
  - CORS rechaza un origen que no esté en la lista permitida.
  - Dos pestañas del mismo usuario reciben la misma notificación.

### E5 — Pipeline y base reproducible · B-16, B-28, B-19, F-15, T-02, F-13

- **Salida:**
  - Migraciones + seed sobre una base vacía dejan la app funcional, sin `sync()`.
  - No existen `n_role`, `n_user_role`, `Module`, `Form` ni la columna `is_staff`.
  - Los comandos del README, copiados tal cual, levantan back y front.

### E6 — Robustez · B-20, F-12, F-09, F-11

- **Salida:**
  - Todo `POST`/`PUT`/`PATCH` con un body inválido responde **400** con el campo que falló.
  - Todas las query keys salen de una fábrica única, sin literales sueltos: se verifica con un `grep` en CI.
  - Con el modal abierto, Escape lo cierra y Tab no sale del modal.

### E7 — Pulido del front (opcional) · F-10, F-14

- **Salida:**
  - `npm ls @mui/material react-toast` sale vacío.
  - Queda una sola librería de íconos.
  - `grep transition-all` da 0.
  - Con `prefers-reduced-motion` no hay animaciones de movimiento.

## 5. Frontend: qué se mejora y qué no

Revisado con las skills de commons `emil-design-eng` (checklist de UI) y `pick-ui-library` (elección de librerías).

**Se mantiene, porque está bien hecho:**

| Qué | Por qué no se toca |
|:---|:---|
| React Query en 38 archivos | Es la base correcta. El problema son las claves (F-12), no la librería. |
| react-hook-form + zod en formularios | Tipado y validación del lado del cliente bien resueltos. Falta el espejo en el back (B-20). |
| `SocketContext` centralizado con invalidación de queries | Buen patrón. Solo sobra el hook duplicado (F-11). |
| Interceptor de errores con `friendlyMessage` | Se extiende para el refresh (F-01), no se reemplaza. |
| Skeleton loaders y estados vacíos y de error | Ya están en los listados principales. |
| `PostulationCard` con `role` por prop | Ya modela el rol como "de qué lado de esta postulación estoy". Es lo que roles múltiples necesita. |
| `CustomerProfile` y `ProviderProfile` separados | El selector de modo los reutiliza enteros; fusionarlos no aporta. |
| TypeScript | 1 solo error de `tsc`: casi todo se arregla sacando el `ignoreBuildErrors` (F-07). |

**Se mejora**, por prioridad:
1. Roles múltiples (F-02, F-16).
2. Sesión y rutas (F-01, F-03).
3. Links y URLs rotos (F-04, F-05, F-06).
4. Build estricto (F-07, F-08).
5. Claves de cache (F-12).
6. Accesibilidad del modal (F-09).
7. Dependencias sobrantes (F-10).
8. Movimiento (F-14).

**No se mejora en este ciclo:** Server Components, cookies `httpOnly`, cambio de librería de toasts ni rediseño (§2, no-objetivos).

## 6. Métricas de éxito del ciclo

| Métrica | Hoy | Meta |
|:---|:---|:---|
| Endpoints de escritura sin autenticación | 14, más 2 registros duplicados | 0 |
| Endpoints públicos que filtran `password` o datos personales | 9 (clientes 1, proveedores 3, artículos 2, domicilios 3) | 0 |
| Hallazgos 🔴 abiertos | 8 | 0 |
| Cuentas necesarias para ser cliente y proveedor | 2 | 1 |
| Tests en CI | 0 | 1 por criterio de salida de E0–E4, como mínimo |
| Errores de `tsc` / ESLint que el build ignora | 1 / 15 | 0 / 0, con el build fallando si aparecen |

## 7. Estimación

**Método:**
- Cada hallazgo tiene un tamaño relativo: **S** (≤ ½ día), **M** (1–2 días), **L** (3–5 días).
- Para sumar se usan puntos medios: S = 0,5, M = 1,5, L = 4 días-ideales.
- Un **día-ideal** es un día entero de trabajo sin interrupciones, e incluye escribir el test del criterio.

**Por qué no son horas:** la skill `plan-implementacion` de commons prohíbe estimar en horas sin base histórica, y este proyecto no la tiene: nunca se estimó y se midió. Lo único medible es la cadencia del git:
- 405 commits en **75 días activos** entre el 06/08/2025 y el 19/03/2026.
- Eso da ≈ 2,3 días activos por semana.

**Supuestos de capacidad:**
- 1 desarrollador, sprints de 2 semanas.
- A tiempo completo: **8 días-ideales por sprint** (80 % de 10 días hábiles).
- Al ritmo histórico: **≈ 4,5 días-ideales por sprint**, o sea que cada sprint dura ~1,75 veces más.
- **No hay fecha de entrega**, así que la columna realista es la del ritmo histórico.

**Calibración:** al cerrar el Sprint 1, comparar días reales contra estimados y corregir la tabla de tamaños antes de comprometer el Sprint 2. Si el desvío pasa el 30 %, se reestima todo lo que falta.

## 8. Plan de sprints

| Sprint | Duración | Épica | Hallazgos | Días-ideales | Carga | Prioridad |
|:---|:---|:---|:---|:---|:---|:---|
| **S0** | 2 semanas | E0 Preparación | T-01, T-04, T-03, F-08, F-07, B-09, B-22 | 5,5 | 69 % | Must |
| **S1** | 2 semanas | E1 Cerrar el acceso | B-01, B-02, B-23, B-03, B-06, B-07, B-04 | 7,5 | 94 % | Must |
| **S2** | 2 semanas | E2 Roles múltiples | B-05, B-26, B-27, B-24, B-15¹, F-02 | 8,0 | 100 % ⚠ | Must |
| **S3** | 2 semanas | E3 Sesión, errores y alta del segundo perfil | B-10, F-01, B-11, F-16, F-04, F-03, B-25 | 7,5 | 94 % | Must |
| **S4** | 2 semanas | E4 Archivos y bugs funcionales | B-08, F-05, F-06, B-12, B-13, B-14, B-21, B-17, B-18 | 6,5 | 81 % | Must |
| **S5** | 2 semanas | E5 Pipeline y base reproducible | B-16, B-28, B-19, F-15, T-02, F-13 | 6,5 | 81 % | Should |
| **S6** | 2 semanas | E6 Robustez | B-20, F-12, F-09, F-11 | 7,5 | 94 % | Should |
| **S7** | 1 semana | E7 Pulido del front | F-10, F-14 | 3,0 | 75 % de 4 | Could |
| | | | **Total** | **52,0** | | |

¹ B-15 sin costo propio: lo absorbe la tarea 5 de la spec 0002, que toca el mismo bloque de `createPostulation`.

**Duración total:**

| Tramo | A tiempo completo | Al ritmo histórico |
|:---|:---|:---|
| Must (S0–S4) | 10 semanas | ≈ 18 semanas |
| Must + Should (S0–S6) | 14 semanas | ≈ 25 semanas |
| Todo (S0–S7) | 15 semanas | ≈ 26 semanas |

**Qué se cae si algo se atrasa:**
- **S2 está al 100 % y no se puede partir:** el back tiene que quedar entero. Si falta tiempo, el selector de modo de F-02 pasa a S3, y mientras tanto el back sigue devolviendo un `role` derivado para que el front actual no se rompa (§10).
- S0 queda al 69 % a propósito: es el primer sprint medido, y el margen absorbe el error de estimar sin historial (§7, calibración).
- **Orden dentro de S1:** B-01 → B-02 → B-23 → B-03 → B-06 → B-07 → B-04. Primero lo que expone datos sin login y después lo que requiere una cuenta.

## 9. Preguntas

**Respondidas el 28/09/2026:**
- **Fecha de entrega:** no hay; el objetivo es mejorar el proyecto. Entra todo el plan, al ritmo histórico.
- **Datos en producción:** no hay, es solo de prueba. Consecuencias:
  - B-05 no necesita migrar datos.
  - La base se puede recrear desde migraciones.
  - B-09 se puede purgar del historial de git. Igual implica force-push a `main` y a 5 ramas remotas, y se confirma antes de hacerlo.
- **Roles:** un usuario puede ser cliente y proveedor a la vez (§3.1).

- **Registro de roles:** se elige uno al registrarse y el segundo se activa desde el perfil (confirmado).
- **UI de roles:** selector de modo en `/profile?mode=customer|provider`, recordado entre sesiones (confirmado).

**Abiertas:**

1. **¿Un proveedor puede ver las ofertas de otros proveedores?** Se asumió que no (§3).
2. **¿Existe un administrador real?** `is_superuser` solo lo asigna el seed. Mientras no haya uno, los catálogos se administran por seed y scripts.
3. **¿Dedicación a tiempo completo o al ritmo actual?** Define cuál columna de §8 vale.

## 10. Riesgos

Lo más probable que salga mal:

- **Cerrar el acceso rompe pantallas que dependían de endpoints abiertos.** El perfil público del proveedor lee campos de `user` que B-01 va a recortar. Mitigación: en S1, cada cambio de permisos se prueba también desde la pantalla que lo consume, no solo con el test de API.
- **Roles múltiples toca token, autorización y `AuthContext` a la vez.** Si front y back se desincronizan, la UI muestra el dashboard equivocado. Mitigación: durante S2, el back sigue devolviendo un `role` derivado (`provider` si tiene perfil de proveedor y no de cliente, etc.) hasta que F-02 cierre, y recién ahí se elimina. Los tokens emitidos antes del cambio se invalidan rotando `JWT_SECRET`, cosa que se puede hacer porque no hay usuarios reales.
- **Un usuario con los dos perfiles cruza datos entre sus dos lados.** Las query keys ambiguas de F-12 (`['petitions']` sin distinguir si es "mis peticiones" o "mis oportunidades") pueden mostrar en modo proveedor datos cacheados del modo cliente. Mitigación: al cambiar de modo se invalida la cache, hasta que F-12 las ordene en S6.
- **La infraestructura de tests contra MySQL (T-01) tarda más de 1,5 días.** Si pasa, S1 arranca igual con tests de integración contra una base Docker efímera, y la parte de CI se completa en S5.
- **Las migraciones (B-16) sobre una base creada con `sync()`** pueden no coincidir con el esquema real. Como no hay datos que preservar, la primera migración se escribe desde los modelos y se valida recreando la base, no comparando contra la actual.

## 11. Siguiente paso

1. ~~Confirmar las decisiones de roles~~: hecho el 28/09/2026.
2. ~~Instalar el harness~~: hecho el 28/09/2026. Faltan los tres comandos de S0 (ver `harness.config.yml`).
3. ~~Escribir las specs de E1 y E2~~: `specs/0001-cerrar-acceso.md` y `specs/0002-roles-multiples.md`, en estado `propuesta`.
4. Aprobar las specs (por PR) y arrancar S0. Ninguna spec habilita código hasta estar en `aprobada`.

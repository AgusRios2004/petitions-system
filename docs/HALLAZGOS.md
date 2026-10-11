# Registro de hallazgos — JobFinder

Revisión del 28/09/2026 sobre `main` (`b65dd1a`). Es la **única fuente de verdad** de los bugs y deudas: el [PRD](./PRD.md) y las specs futuras citan estos IDs, no copian el contenido.

**Origen:** salvo que se indique otra cosa, todo está **verificado**: se leyó el código o se corrió el comando. Lo inferido o sin verificar está marcado.

**Severidad:**
- 🔴 **Crítica:** explotable hoy por cualquiera con Postman.
- 🟠 **Alta:** rompe un flujo o expone datos.
- 🟡 **Media:** bug o deuda que va a morder.
- ⚪ **Baja:** prolijidad.

**Tamaño (relativo):**
- **S:** ≤ ½ día.
- **M:** 1–2 días.
- **L:** 3–5 días.

Es tamaño relativo, no horas: el proyecto no tiene historial de estimaciones contra el que calibrar (ver PRD §7).

**Estado:** `abierto` → `en curso` → `cerrado (commit)`. Un hallazgo se cierra con el test que lo demuestra, no con el diff.

---

## Backend (`back/`)

| ID | Sev | Hallazgo | Evidencia | Tam. | Estado |
|:---|:---|:---|:---|:---|:---|
| B-01 | 🔴 | **Se filtran los hashes de contraseñas y datos personales sin login.** `GET /api/customer`, `/api/provider`, `/api/provider/:id` y `/api/provider/public/:id` incluyen el `user` entero, con `password` (bcrypt), email, DNI y teléfono. `User` no tiene `defaultScope` que lo excluya. Ampliado al redactar la spec 0001: `GET /api/article` y `/api/article/:id` (públicos) incluyen `createdBy`/`updatedBy` sin `attributes`, y `GET /api/addresses` lista todos los domicilios sin login. El front no usa ni el listado de clientes ni `/addresses`. | `back/services/customerService.js:9`, `back/services/providerService.js:9,25,127`, `back/services/articleService.js:9-10,35-36`, `back/routes/customerRoutes.js:4`, `back/routes/providerRoutes.js:10`, `back/routes/addressRoutes.js:4-5` | M | abierto |
| B-02 | 🔴 | **Hay endpoints de escritura sin `authRequired`.** Crear y editar clientes y proveedores; el CRUD de categorías, direcciones y departamentos; `POST /api/profile`. `updateCustomer` además recibe el `req.body` entero (asignación masiva). | `back/routes/customerRoutes.js:6-7`, `back/routes/providerRoutes.js:7-8`, `back/routes/categoryRoutes.js:6-8`, `back/routes/addressRoutes.js:6-8`, `back/routes/departmentRoutes.js:92-94`, `back/routes/profileRoutes.js` | M | abierto |
| B-03 | 🔴 | **IDOR en la edición de usuario:** `PUT /api/profile/user/:id` toma el id de la URL, no del token. Cualquier usuario logueado le cambia el email a otro. | `back/controllers/profileController.js:79` | S | abierto |
| B-04 | 🔴 | **Un proveedor puede aceptar su propia postulación.** `acceptPostulation` no verifica que quien acepta sea el dueño de la petición, ni que la petición siga abierta, ni que la postulación esté pendiente. `rejectPostulation` sí lo verifica. | `back/services/postulationService.js:278` (comparar con la línea 399) | M | abierto |
| B-05 | 🔴 | **Todo proveedor queda como "staff".** En el registro se hace `is_staff = role === 'provider'`. Consecuencias: cualquier proveedor lista **todas** las postulaciones de cualquier petición, con los precios de la competencia, y puede cambiar el estado de cualquier postulación. Se mezcla el rol de negocio con el de administración. | `back/controllers/authControllers.js:57`, `back/controllers/postulationController.js:21`, `back/routes/postulationRoutes.js:9`. El front deriva el rol de `is_staff` (ver F-02). Con roles múltiples (PRD §3.1) se resuelve sacando los roles de negocio del token y autorizando por perfil | L | abierto |
| B-06 | 🔴 | **`updatePetition` no chequea al dueño** y aplica `id_customer` e `id_state` del body. Cualquiera reasigna una petición ajena o le cambia el estado. | `back/services/petitionService.js:238`, `back/controllers/petitionController.js:141` | M | abierto |
| B-07 | 🔴 | **Se pueden escuchar chats ajenos por socket.** `joinConversation` une al usuario a la sala que pida, sin validar que participe. El REST sí valida; el socket lo esquiva. | `back/sockets/messageHandler.js:33` | S | abierto |
| B-08 | 🟠 | **Adjuntos sin límite de tamaño ni filtro de tipo**, con la extensión tomada del `originalname` y servidos estáticos desde `/uploads`. Un `.html` subido se ejecuta en el dominio de la API. | `back/routes/attachmentRoutes.js:22`, `back/app.js:56` | M | abierto |
| B-09 | 🟠 | **Archivos subidos por usuarios versionados en git** (10 archivos: PDFs y fotos de perfil). | `git ls-files back/uploads` | S | abierto |
| B-10 | 🟠 | **Códigos de estado incorrectos:** `error()` usa 500 por defecto, así que credenciales inválidas y campos faltantes salen como 500. Un token vencido devuelve 403 en vez de 401. El login devuelve el objeto de excepción al cliente. | `back/middlewares/response.js:6`, `back/controllers/authControllers.js:105,110,144`, `back/middlewares/auth.js:14` | M | abierto |
| B-11 | 🟡 | **`/auth/refresh` se rompe si el usuario ya no existe** (`user` null, termina en 403 genérico). No hay rotación ni revocación del refresh token. | `back/controllers/authControllers.js:153` | S | abierto |
| B-12 | 🟡 | **Enumeración de usuarios:** "Usuario deshabilitado" se responde antes de comparar la contraseña. | `back/controllers/authControllers.js:107` | S | abierto |
| B-13 | 🟡 | **`createPostulation` responde con status equivocado:** `success(res, postulation, 201)` manda el 201 al parámetro `message`. | `back/controllers/postulationController.js:68` | S | abierto |
| B-14 | 🟡 | **`createCustomer` tira `ReferenceError`:** usa `User` sin importarlo y sin `await`. | `back/services/customerService.js:57` | S | abierto |
| B-15 | 🟡 | **`Provider.findOne({where}, {transaction})` tiene la firma mal:** la consulta corre fuera de la transacción. | `back/services/postulationService.js:104` | S | abierto |
| B-16 | 🟡 | **Esquema sin migraciones:** `sequelize.sync()` más scripts sueltos (`add_fin_state.js`). No hay forma reproducible de levantar la base. | `back/app.js:109`, `back/scripts/` | L | abierto |
| B-17 | 🟡 | **CORS `*`** en HTTP y en Socket.IO. | `back/app.js:49`, `back/server.js:17` | S | abierto |
| B-18 | 🟡 | **Un socket por usuario:** `userSocketMap` guarda un solo socket por persona, así que con dos pestañas una deja de recibir notificaciones. | `back/server.js:50` | M | abierto |
| B-19 | ⚪ | **Logs de debug en producción:** `DEBUG UPDATE`, y la config de la base (host, usuario, nombre) impresa al arrancar. | `back/services/petitionService.js:223`, `back/config/database.js:7` | S | abierto |
| B-20 | 🟡 | **Sin validación de entrada en el back:** todo es `if (!campo)` a mano; zod existe solo en el front. | todos los controllers | L | abierto |
| B-21 | ⚪ | **El registro destructura `address` antes de validar**, así que sin `address` da 500 en vez de 400. | `back/controllers/authControllers.js:18` | S | abierto |
| B-23 | 🔴 | **Registros duplicados y abiertos:** `POST /api/provider/register` y `/api/customer/register` duplican `/api/auth/register` y el front no los usa. El de proveedor toma `isStaff` del body, así que cualquiera se registra con el flag que quiera. Se borran. | `back/controllers/providerController.js:56`, `back/services/providerService.js:109` | S | abierto |
| B-24 | 🟠 | **Nada impide postularse a la propia petición.** `createPostulation` no compara al dueño de la petición con el proveedor. Hoy no pasa porque nadie tiene los dos perfiles; con roles múltiples pasa. El front solo lo esconde (`PetitionDetail.tsx:230`). | `back/services/postulationService.js:98-160` | S | abierto |
| B-25 | 🟠 | **Cualquiera califica a cualquiera:** `createGrade` toma `id_provider`/`id_customer` del body sin verificar que quien califica haya participado en esa petición, ni que esté finalizada. | `back/services/gradeService.js:56`, `back/controllers/gradeController.js:17` | S | abierto |
| B-26 | 🟡 | **`POST /api/profile` está roto y sin auth:** crea `Customer`/`Provider` con `id_user` en lugar de `user_id` (siempre falla por `allowNull: false`). El front no lo usa. Es la pieza que roles múltiples necesita: se reemplaza por un endpoint autenticado para activar el segundo perfil. | `back/controllers/profileController.js:7-20` | M | abierto |
| B-27 | 🟡 | **`Customer.user_id` y `Provider.user_id` no son únicos:** la asociación es `hasOne`, pero la base acepta dos perfiles del mismo tipo por usuario, y `findOne` devolvería cualquiera. | `back/models/Customer.js:8`, `back/models/Provider.js:8` | S | abierto |
| B-28 | ⚪ | **Tablas muertas:** `n_role`/`n_user_role` (solo las escribe el seed, nadie las lee), `Module` y `Form` (sin uso). Son una tercera fuente de verdad sobre roles, además de `is_staff` y los perfiles. | `back/scripts/seed.js:21,31,109`, `back/models/Module.js`, `back/models/Form.js` | S | abierto |
| B-22 | ⚪ | **Restos:** `"node"` como dependencia, `test_env.js` suelto, script `test` por defecto. | `back/package.json`, `back/test_env.js` | S | abierto |

## Frontend (`front/`)

Revisado además con dos skills de commons: `emil-design-eng` (checklist de UI) y `pick-ui-library` (librerías).

| ID | Sev | Hallazgo | Evidencia | Tam. | Estado |
|:---|:---|:---|:---|:---|:---|
| F-01 | 🟠 | **El refresh token se guarda pero nunca se usa:** no hay interceptor que refresque ante un 401. A la hora de vida del access token la app empieza a fallar sin avisar. | `front/src/context/AuthContext.tsx:119`, `front/src/service/apiClient.ts` (solo mapea mensajes) | M | abierto |
| F-02 | 🟠 | **El rol es uno solo y se deriva de `is_staff`.** Está acoplado a B-05, y `/profile` elige *un* dashboard según `user.role`, así que un usuario con los dos perfiles solo ve uno. Hay que derivar las capacidades de `user.customer`/`user.provider` y agregar un selector de modo. | `front/src/context/AuthContext.tsx:55,123`, `front/src/app/profile/page.tsx:64-75` | M | abierto |
| F-03 | 🟠 | **Sin protección de rutas centralizada:** no hay `middleware.ts` y solo `/profile` redirige a login. Por ejemplo, `/petition/create` renderiza el formulario sin sesión y falla recién al enviar. | `front/src/app/profile/page.tsx:34` es el único redirect; `front/src/app/petition/create/page.tsx:66` | M | abierto |
| F-04 | 🟠 | **Link roto:** el banner de perfil incompleto lleva a `/profile/complete`, que no existe (404). | `front/src/components/auth/ProfileCompletionGuard.tsx:36`; `app/profile/` solo tiene `page.tsx` y `edit/` | S | abierto |
| F-05 | 🟠 | **URL hardcodeada** `http://localhost:3001/uploads/...`: el 3001 es el puerto del **front**, así que está roto hasta en local. | `front/src/components/portfolio/PortfolioCard.tsx:39` | S | abierto |
| F-06 | 🟡 | **Las URLs de archivos se arman con `SOCKET_URL`:** funciona de casualidad y el nombre engaña. Falta un helper `fileUrl()` único. | `front/src/components/petitions/PetitionDetail.tsx:248`, `CustomerProfile.tsx:16`, `ProviderProfile.tsx:18`, `app/petition/[id]/add-attachment/page.tsx:10` | S | abierto |
| F-07 | 🟠 | **El build ignora los errores de TypeScript y ESLint.** Hoy hay 1 error de `tsc`, 15 errores de ESLint y 64 warnings. | `front/next.config.ts:9`; `tsc`: `CustomerOffers.tsx:32`; `npx eslint src` | M | abierto |
| F-08 | 🟡 | **Dependencias desincronizadas:** `node_modules` tiene Next 15.5.12, pero el lockfile y el `package.json` piden 16.1.6. `eslint-config-next` está fijado en 15.5.12. El `tsc` de esta revisión corrió contra la 15 (**inferido:** con la 16 pueden aparecer más errores). | `front/package.json:22,43`, `package-lock.json` | S | abierto |
| F-09 | 🟡 | **Modal no accesible:** sin Escape, sin foco atrapado, sin `role="dialog"`/`aria-modal`, y lee `document` durante el render. Hay 6 overlays `fixed inset-0` hechos a mano. | `front/src/components/ui/Modal.tsx:53` | M | abierto |
| F-10 | 🟡 | **Dependencias de más:** MUI con Emotion se usa solo para un `Box`, `CssBaseline` (que choca con el preflight de Tailwind) y un tema. `react-toast` está instalado y nunca se importa. Hay dos librerías de íconos (`react-icons` ×14 imports, `lucide-react` ×9). | `front/src/theme/ThemeRegistry.tsx:56`, `front/src/app/(auth)/layout.tsx:3`, `front/package.json` | M | abierto |
| F-11 | ⚪ | **`useSocket` definido dos veces.** | `front/src/hooks/useSockets.ts:10`, `front/src/context/SocketContext.tsx:18` | S | abierto |
| F-12 | 🟡 | **Query keys sin fábrica:** conviven `['petition']` sin id, `['petition', id]` y `['petitions']`, y se invalida de forma amplia. Resultado: refetches de más, o datos viejos cuando la clave no coincide. | `grep -rn queryKey front/src` | M | abierto |
| F-13 | ⚪ | **Metadata de plantilla:** título "Create Next App" y `lang="en"` en una app en español (afecta lectores de pantalla y SEO). | `front/src/app/layout.tsx:22,28` | S | abierto |
| F-14 | ⚪ | **Checklist `emil-design-eng`:** 49 `transition-all`, 10 duraciones ≥ 500 ms, 31 `hover:scale/translate` sin `@media (hover: hover)`, 0 `prefers-reduced-motion`, solo 10 estados `active:`. | grep sobre `front/src` | M | abierto |
| F-15 | ⚪ | **Ruido:** 17 `console.log` (incluye el que imprime la API base URL), 15 `any`. | grep sobre `front/src` | S | abierto |
| F-16 | 🟡 | **No hay forma de sumar el segundo perfil desde la app.** `IncompleteProfile` y `ProfileCompletionGuard` asumen un único rol, y el link de F-04 apunta a una pantalla que no existe. Con roles múltiples, eso pasa a ser "Activar perfil de proveedor/cliente". | `front/src/components/profile/IncompleteProfile.tsx`, `front/src/components/auth/ProfileCompletionGuard.tsx:16-17` | M | abierto |

## Transversal

| ID | Sev | Hallazgo | Evidencia | Tam. | Estado |
|:---|:---|:---|:---|:---|:---|
| T-01 | 🟠 | **Cero tests** en back y front. Ningún hallazgo de este registro puede cerrarse con evidencia hasta que exista la infraestructura. | `back/package.json` (script `test` por defecto); `front/` sin runner | M | abierto |
| T-02 | 🟡 | **El README no coincide con el código.** Dice: Next 13 (es 16), Express 4.18 (es 5), `cd backend` (es `back/`). Vende "Server Components" (69 archivos son `'use client'`) y "optimistic updates" (8 usos). | `README.md` | S | abierto |
| T-03 | 🟡 | **Sin harness de commons** (`AGENTS.md`, `harness.config.yml`, `specs/`): no hay compuerta que impida volver a romper lo que se arregle. | raíz del repo | S | en curso: harness instalado el 28/09/2026; faltan `commands.test/lint/typecheck`, que dependen de T-01 y F-07 |
| T-04 | 🟡 | **El front no tiene runner de tests.** Los criterios de UI de la spec 0002 (selector de modo) no se pueden verificar sin uno. Hace falta Vitest + Testing Library, con un script `test`. Separado de T-01, que cubre el back. | `front/package.json` (sin script `test`) | S | abierto |

## Huecos de esta revisión

- **`npm audit` no llegó a correr** (timeout sin salida). No se sabe si hay CVEs en las dependencias.
- **No se probó la app en ejecución:** todo sale de leer el código. B-01 a B-07 son explotables *según el código*; falta reproducirlos contra la API levantada, y esa es la primera tarea de cada test en el sprint 1.
- **Los errores de ESLint no se clasificaron** uno por uno.

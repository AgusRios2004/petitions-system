# AGENTS.md

JobFinder: marketplace de servicios donde clientes publican peticiones y proveedores se postulan. Monorepo: `back/` (Express 5 + Sequelize + MySQL + Socket.IO) y `front/` (Next 16 + React Query + Tailwind).

## Comandos

| Qué | Comando |
|:---|:---|
| Instalar | `npm --prefix back ci && npm --prefix front ci` |
| Tests | `npm --prefix back test && npm --prefix front test` (se activan con T-01 y T-04) |
| Lint | `npm --prefix front run lint` |
| Typecheck | `npm --prefix front exec -- tsc --noEmit` |
| Correr | `npm --prefix back run dev` y `npm --prefix front run dev` (API :3000, web :3001) |
| Seed | `npm --prefix back run seed`: **borra la base** y la recarga |

## Límites duros

- Toda ruta que escribe lleva `authRequired` **y** verifica que el recurso sea del usuario del token. El id de la URL o del body no cuenta. (B-02, B-03, B-06: 14 endpoints abiertos y 3 IDOR al 28/09/2026.)
- Los permisos se deciden por la relación con el recurso (`req.customer` dueño de la petición, `req.provider` autor de la postulación), nunca por `is_staff` ni por un "rol" del token. Un usuario puede tener los dos perfiles. (B-05, PRD §3.1.)
- Ninguna respuesta incluye `User.password`. Todo `include` de `user` lleva `attributes` explícitos. (B-01: hashes expuestos sin login.)
- Nada de `back/uploads/` entra a git. (B-09: archivos de usuarios versionados.)
- El front no hardcodea hosts: nada de `http://localhost`. La base sale de `NEXT_PUBLIC_API_URL`. (F-05: link roto hasta en local.)
- No editar `.env` ni migraciones ya aplicadas. Una migración aplicada se corrige con una migración nueva.
- No escribir código de implementación sin una spec aprobada en `specs/`.
- No cambiar una spec para que el código pase. Si la spec está mal, se reporta.

## Dónde buscar

| Necesitás saber | Leé |
|:---|:---|
| Qué se construye y en qué orden | `docs/PRD.md` §4 y §8 |
| Qué está roto y dónde (IDs B-/F-/T-) | `docs/HALLAZGOS.md` |
| Por qué se decidió X | `docs/PRD.md` §3.1 (roles). Todavía no hay ADRs. |
| Qué entra en el alcance | `docs/PRD.md` §2 |
| Qué se está construyendo ahora | `specs/` |

No copiar el contenido de esos documentos acá. Se leen cuando hacen falta.

## Flujo

1. Spec aprobada en `specs/` antes de código.
2. Test rojo antes de implementación; cada test lleva su `AC-ID` en el nombre.
3. Una tarea no se cierra con el suite en rojo.
4. Una tarea = un diff. Lo que se ve de paso se anota en `docs/HALLAZGOS.md`, no se arregla.
5. Un hallazgo se cierra con el commit y el test que lo demuestran.

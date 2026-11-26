---
id: 0003
titulo: Postulaciones solo para su autor
estado: aprobada        # draft | propuesta | aprobada | implementada | archivada
autor_humano: Diego Agustín Rios
fecha: 25/11/2026
adrs_relacionados: []
---

- **Aprobada:** 25/11/2026, por delegación del humano: "sé crítico solo si es regla de negocio, me chiflás; si no, dale caña". La spec no agrega reglas de negocio nuevas: aplica las de `AGENTS.md` (el autor de la postulación es quien la toca) y la de PRD §9.1 / AC-0002-09 (un proveedor no ve las ofertas de otros).

## Objetivo

Cerrar B-30: que una postulación solo la edite, la finalice o la lea quien corresponde, que el body no pueda escribir campos que no le tocan, y que los errores de permiso y de estado salgan con su código y no como 500.

## Restricciones

- Mismo criterio que la spec 0001: el permiso sale de la relación con el recurso (`Provider.user_id` del token = `id_provider` de la postulación; `Customer.user_id` del token = dueño de la petición), nunca de `is_staff` ni del id del body.
- El superusuario puede **leer** cualquier postulación, pero no editarla ni finalizarla (igual que en `accept`, AC-0001-12).
- No se toca `PATCH /:id/state`: es de la spec 0002 (AC-0002-10).
- No se cambia el front. El formulario de edición ya manda `proposal`, `cost` y `articles`.
- Los conflictos de estado responden **409**, como `accept` en la spec 0001. Hoy editar una postulación no pendiente responde 400: cambia a 409.

## Diagnóstico (al 25/11/2026, leído en `ea55467`)

| Endpoint | Hoy | Problema |
|:---|:---|:---|
| `PUT /:id` | Cualquier usuario logueado edita cualquier postulación pendiente | Sin verificación de autor; `id_user_update` sale del body; sin `articles` en el body borra el inventario; artículos sin validar |
| `PATCH /:id/winner` | Siempre 500 | Llama a `service.updatePostulationWinnerStatus`, que no existe. `accept` ya marca el ganador |
| `PATCH /:id/finish` | El ganador finaliza | No exige estado `ACE` (se finaliza dos veces); el controlador convierte todo error en 500 |
| `PATCH /:id/reject`, `/:id/cancel` | Verifican dueño/autor | El controlador devuelve 500 en vez de 403/404; el servicio hace `rollback` dos veces |
| `GET /:id` | Cualquier usuario logueado lee cualquier postulación | Un proveedor ve la oferta y el costo de la competencia |

## Comportamiento esperado

1. **Editar (`PUT /:id`).**
   - Solo el proveedor autor. Cualquier otro (otro proveedor, el cliente dueño, un cliente ajeno, el superusuario) → 403.
   - Campos aplicables: `proposal`, `cost` y `articles`. Todo lo demás del body se ignora. `id_user_update` sale del token.
   - Un campo ausente no cambia. `articles` ausente deja el inventario como está; `articles: []` lo vacía; una lista lo reemplaza.
   - Validación: `cost` número ≥ 0; `proposal` texto no vacío; cada artículo con `id_article` existente, `quantity` entero > 0 y `cost` número ≥ 0. Si algo falla → 400 y no cambia nada.
   - Solo en `PEN`; si no → 409. Inexistente → 404.
2. **`PATCH /:id/winner` se borra**, con su controlador. Responde 404.
3. **Finalizar (`PATCH /:id/finish`).** Solo el proveedor autor (403 si no). Solo si la postulación está en `ACE` y es ganadora (409 si no). Queda en `FIN`.
4. **Errores con su código.** Los controladores de postulación propagan `e.statusCode`; los 5xx responden "Error interno" sin el detalle. Los servicios no hacen `rollback` de una transacción ya terminada.
5. **Leer (`GET /:id`).** El proveedor autor, el cliente dueño de la petición y el superusuario → 200. Cualquier otro → 403. Inexistente → 404.

## Casos de borde

| Caso | Comportamiento |
|:---|:---|
| Body vacío en `PUT` del autor | 200, nada cambia salvo `id_user_update` y `date_update`. |
| `cost: "abc"`, `cost: -1`, `quantity: 0`, `quantity: 1.5`, `id_article` inexistente | 400; ni la postulación ni el inventario cambian. |
| El autor manda `id_state`, `winner`, `id_provider` o `id_petition` | Se ignoran: quedan como estaban. |
| Usuario sin perfil de proveedor hace `PUT` | 403. |
| `PATCH /finish` dos veces | La segunda → 409. |
| `PATCH /finish` de una postulación pendiente, por su autor | 409. |
| `GET /:id` con un id no numérico | 404. |

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0003-01 | `PUT /api/postulation/:id` sobre la postulación de B con token de D, A, C y del superusuario → 403, y `proposal`, `cost` e inventario no cambian. | |
| AC-0003-02 | `PUT` de B con `proposal`, `cost` y dos `articles` → 200; quedan guardados, y `id_user_update` es el de B aunque el body traiga otro. | |
| AC-0003-03 | `PUT` de B con `id_state`, `winner`, `id_provider` e `id_petition` en el body → 200, y esos cuatro campos quedan como estaban. | |
| AC-0003-04 | `PUT` de B sin `articles` deja el inventario igual; con `articles: []` lo deja vacío. | |
| AC-0003-05 | `PUT` de B con `cost` negativo, `cost` no numérico, `quantity` 0, `quantity` no entera o `id_article` inexistente → 400 cada uno, y ni `proposal` ni el inventario cambian. | |
| AC-0003-06 | `PUT` de B sobre su postulación en `ACE` → 409 sin cambios; `PUT` a un id inexistente → 404. | |
| AC-0003-07 | `PATCH /api/postulation/:id/winner` → 404, y `winner` no cambia. | |
| AC-0003-08 | `PATCH /:id/finish` con token de D, A o C → 403; con token de B sobre su postulación en `PEN` → 409; en ningún caso cambia el estado. | |
| AC-0003-09 | Con la postulación de B ganadora y en `ACE`, `PATCH /finish` de B → 200 y queda en `FIN`; un segundo `PATCH /finish` → 409. | |
| AC-0003-10 | `PATCH /:id/cancel` de D sobre la postulación de B → 403; `PATCH /:id/reject` de C → 403; `PATCH /:id/finish` a un id inexistente → 404. Ninguno responde 500. | |
| AC-0003-11 | `GET /api/postulation/:id` de la postulación de B: con token de B, A o del superusuario → 200; con token de D o C → 403; un id inexistente → 404. | |

## Fuera de alcance

| Qué | Por qué |
|:---|:---|
| `PATCH /:id/state` | Spec 0002 (AC-0002-10). Ojo: `changePostulationState` tampoco existe en el servicio; se anota en HALLAZGOS para la 0002. |
| `reject` sobre una postulación ya aceptada o finalizada | Es regla de negocio (¿el cliente puede "des-elegir" al ganador?). Se anota como hallazgo y se le pregunta al humano. |
| Que el superusuario pueda editar o finalizar | Mismo criterio que `accept` en la 0001: no. |
| Columnas de `user` en los `include` (B-29) | Otro hallazgo, otra spec. |

## Notas de handoff

**Qué asumí:**
- Que `PATCH /:id/winner` no lo usa nadie: el front no lo llama (`grep` en `front/src`) y hoy responde siempre 500.
- Que `proposal` vacío es inválido, igual que al crear desde el formulario.

**Preguntas abiertas:** ninguna que bloquee.

**Lo más probable que salga mal:**
1. El formulario de edición del front recibe 409 donde antes recibía 400. Hay que verificar que muestre el mensaje y no rompa (prueba manual).
2. `GET /:id` restringido puede romper una pantalla que hoy lee postulaciones ajenas. Buscar en el front todos los `getPostulationById` antes de cerrar: solo deberían usarlo el autor y el dueño de la petición.

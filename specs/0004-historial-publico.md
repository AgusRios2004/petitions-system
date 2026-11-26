---
id: 0004
titulo: Historial público del proveedor con menos datos
estado: aprobada        # draft | propuesta | aprobada | implementada | archivada
autor_humano: Diego Agustín Rios
fecha: 25/11/2026
adrs_relacionados: []
---

- **Aprobada:** 25/11/2026. El humano decidió en B-39: "historial con menos datos". Esta spec no agrega reglas de negocio nuevas. Aplica dos que ya están decididas:
  - esa decisión de B-39;
  - la de PRD §9.1 / AC-0002-09: un proveedor no ve las ofertas de otros, así que el historial público no lleva ni la propuesta ni el costo.

## Objetivo

Que el historial público de un proveedor muestre solo sus trabajos ganados, sin la oferta y sin datos del cliente. Que el proveedor dueño vuelva a ver su propio historial filtrado por estado. Cubre B-39, B-42 y B-43.

## Diagnóstico (al 25/11/2026, en `1b6614c`)

| Qué | Hoy | Problema |
|:---|:---|:---|
| Historial público (`/provider/[id]/postulations`, quien mira no es el dueño) | `GET /api/postulation?id_provider=X&id_state=1` | En el seed, el id 1 es **Pendiente**, no Aceptada: muestra las ofertas pendientes. Además devuelve la propuesta, el costo, el inventario, la petición con el cliente entero y los `User` creador y editor (B-39, B-43). |
| Historial del dueño (filtro por estado) | `GET /api/postulation?id_provider=<propio>&id_state=Y` | Desde la spec 0002 responde `[]`: sin `id_petition`, solo pasa el caso "público". Además las opciones del filtro usan ids equivocados (3 = "Pendiente", pero en el seed el 3 es Rechazado). |
| Seed | Crea los estados del 1 al 5 | No crea `FIN`, así que `finish` y la finalización de peticiones fallan en la base de desarrollo (B-42). |

## Comportamiento esperado

1. **`GET /api/provider/:id/history`** (con `authRequired`, como hoy).
   - Devuelve las postulaciones de ese proveedor en estado `ACE` o `FIN`, de la más reciente a la más vieja.
   - Cada elemento trae exactamente esto:
     - `id_postulation`
     - `state`: el nombre del estado
     - `date`: `date_update`, o si no hay, `date_create`
     - `petition: { id_petition, description }`
   - No trae nada más: ni la propuesta, ni el costo, ni el inventario, ni el cliente, ni usuarios.
   - Si el proveedor no existe o el id no es numérico → 404. Si no tiene trabajos ganados → `[]`.
2. **`GET /api/postulation` sin `id_petition`.**
   - Con `id_provider` igual al perfil de proveedor de quien pide: devuelve sus postulaciones, filtradas por `id_state` si viene.
   - Con cualquier otro `id_provider`, o sin `id_provider`: 403.
   - Se elimina el caso especial `isPublicHistoryRequest`.
   - El superusuario sigue viendo todo.
3. **Front.** `/provider/[id]/postulations`:
   - Para quien no es el dueño, usa el endpoint nuevo y muestra la descripción de la petición, el estado, la fecha y el enlace a la petición. No muestra propuesta ni costo.
   - Para el dueño, deja el filtro con los estados reales (Pendiente, Aceptado, Rechazado, Finalizado), tomados de una constante con los ids del seed, no de números sueltos.
4. **Seed.** Crea el estado `FIN` (`id_state: 6`, "Finalizado"), igual que los fixtures de test.

## Casos de borde

| Caso | Comportamiento |
|:---|:---|
| Proveedor sin postulaciones ganadas | `[]`; el front muestra "No se encontraron postulaciones". |
| Postulación ganada de una petición borrada o sin cliente | Aparece igual, con `petition` en `null`. |
| El dueño mira su propio historial público (`/provider/<propio>/postulations`) | Ve el filtro por estado, con sus datos completos. |
| `id_provider` no numérico en `GET /api/postulation` | 403, igual que un proveedor ajeno. |

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0004-01 | `GET /api/provider/:id/history` del proveedor B devuelve solo sus postulaciones en `ACE` y `FIN`; las que están en `PEN`, `REC`, `CAN` o `BJA` no aparecen. | |
| AC-0004-02 | Cada elemento de la respuesta tiene exactamente las claves `id_postulation`, `state`, `date` y `petition`, y `petition` tiene exactamente `id_petition` y `description`. En el JSON no aparecen `cost`, `proposal`, `email`, `dni`, `phone` ni `customers`. | |
| AC-0004-03 | `GET /api/provider/:id/history` con un id inexistente o no numérico → 404. | |
| AC-0004-04 | `GET /api/postulation?id_provider=<B>&id_state=<PEN>` con token de B → 200 con su postulación pendiente. Con token de D, de A o de C → 403. | |
| AC-0004-05 | `GET /api/postulation?id_provider=<B>&id_state=1`, sin `id_petition` y con token de D → 403: el antiguo atajo "público" ya no existe. | |
| AC-0004-06 | El seed define el estado `FIN` con `id_state` 6. Se verifica leyendo la lista de estados que exporta el seed, sin ejecutarlo. | |
| AC-0004-07 | (front) `/provider/[id]/postulations` para quien no es el dueño llama a `getProviderHistory(id)` y muestra la descripción, el estado y la fecha; el texto renderizado no contiene "Propuesta" ni "Costo". | |
| AC-0004-08 | (front) Para el dueño, el filtro ofrece Pendiente, Aceptado, Rechazado y Finalizado con los valores 1, 2, 3 y 6. | |

## Fuera de alcance

| Qué | Por qué |
|:---|:---|
| Hacer público el historial sin login | Hoy pide login. Cambiarlo amplía el acceso; si se quiere, va en otra spec. |
| Columnas de `user` en los demás GET públicos (B-29) | Otro hallazgo, otra spec. |
| Paginado del historial | No hay volumen que lo pida. |

## Notas de handoff

**Qué asumí:**
- Que "exitosas" incluye los trabajos finalizados (`FIN`) y no solo los aceptados.
- Que la fecha que conviene mostrar es la del último cambio.

**Lo más probable que salga mal:** que otra pantalla use `GET /api/postulation?id_provider=…` sin `id_petition` desde un usuario que no es el dueño, y que ahora reciba 403. Hay que buscar en `front/src` todos los usos de `getPostulationsByProvider` antes de cerrar.

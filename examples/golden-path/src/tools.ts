import { createTool } from '@anvia/core'
import { z } from 'zod'
import type { OrderStore } from './orders.js'

/**
 * Typed tools are the agent's only way into application data. The input schema
 * is both the model-facing contract and the runtime validation boundary, so a
 * malformed call fails before application code runs.
 */
export function createOrderTools(store: OrderStore) {
  const lookupOrder = createTool({
    name: 'lookup_order',
    description: 'Look up one customer order by its id and return its current status.',
    inputSchema: z.object({
      orderId: z.string().min(1).describe('Order id as printed on the confirmation, for example A-1042.'),
    }),
    execute: async ({ orderId }) => {
      const order = store.find(orderId)

      if (order === undefined) {
        return { orderId, found: false as const }
      }

      return {
        orderId: order.id,
        found: true as const,
        customer: order.customer,
        status: order.status,
        carrier: order.carrier ?? null,
        eta: order.eta ?? null,
      }
    },
  })

  const listOpenOrders = createTool({
    name: 'list_open_orders',
    description: 'List every order that has not been delivered yet, with its status and estimated arrival.',
    inputSchema: z.object({}),
    execute: async () => ({
      orders: store.open().map((order) => ({
        orderId: order.id,
        customer: order.customer,
        status: order.status,
        eta: order.eta ?? null,
      })),
    }),
  })

  return [lookupOrder, listOpenOrders] as const
}

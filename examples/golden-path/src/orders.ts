/**
 * Application-owned data. The agent never reaches this store directly: the
 * typed tools below are the only boundary, so authorization, validation, and
 * audit rules live in application code that the model cannot edit.
 */
export type OrderStatus = 'processing' | 'shipped' | 'delayed' | 'delivered'

export type Order = Readonly<{
  id: string
  customer: string
  status: OrderStatus
  carrier?: string
  eta?: string
}>

export type OrderStore = Readonly<{
  find(orderId: string): Order | undefined
  open(): readonly Order[]
}>

const SEED_ORDERS: readonly Order[] = [
  { id: 'A-1042', customer: 'Northwind Traders', status: 'shipped', carrier: 'DHL', eta: '2026-09-21' },
  { id: 'A-1043', customer: 'Contoso Ltd', status: 'delayed', carrier: 'GLS', eta: '2026-09-24' },
  { id: 'A-1044', customer: 'Fabrikam', status: 'processing' },
]

export function createOrderStore(orders: readonly Order[] = SEED_ORDERS): OrderStore {
  const byId = new Map(orders.map((order) => [order.id.toUpperCase(), order]))

  return {
    find(orderId) {
      return byId.get(orderId.trim().toUpperCase())
    },
    open() {
      return [...byId.values()].filter((order) => order.status !== 'delivered')
    },
  }
}

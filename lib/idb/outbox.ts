import { openDatabase, withStore } from "./indexeddb"

export type Mutation = {
  key?: number
  table: string
  op: "insert" | "update" | "delete"
  payload: Record<string, unknown>
  createdAt: number
}

export async function queueMutation(m: Omit<Mutation, "createdAt">) {
  const db = await openDatabase()
  const mutation: Mutation = { ...m, createdAt: Date.now() }
  return withStore(db, "mutations", "readwrite", (s) => s.add(mutation))
}

export async function getQueuedMutations() {
  const db = await openDatabase()
  return withStore<Mutation[]>(db, "mutations", "readonly", (s) => s.getAll())
}

export async function clearQueuedMutations() {
  const db = await openDatabase()
  return withStore(db, "mutations", "readwrite", (s) => s.clear())
}



import { openDatabase, type StoreName, withStore } from "./indexeddb"

export type Query<T> = {
  filter?: (item: T) => boolean
  sortBy?: (a: T, b: T) => number
  limit?: number
}

export async function putMany<T extends { id: string }>(store: StoreName, items: T[]) {
  const db = await openDatabase()
  const tx = db.transaction(store, "readwrite")
  const s = tx.objectStore(store)
  await Promise.all(items.map((item) => requestToPromise(s.put(item))))
  await txComplete(tx)
}

export async function putOne<T extends { id: string }>(store: StoreName, item: T) {
  const db = await openDatabase()
  return withStore(db, store, "readwrite", (s) => s.put(item))
}

export async function getOne<T>(store: StoreName, id: string) {
  const db = await openDatabase()
  return withStore<T | undefined>(db, store, "readonly", (s) => s.get(id))
}

export async function getAll<T>(store: StoreName, query?: Query<T>) {
  const db = await openDatabase()
  const items = await withStore<T[]>(db, store, "readonly", (s) => s.getAll())
  let result = items
  if (query?.filter) result = result.filter(query.filter)
  if (query?.sortBy) result = result.sort(query.sortBy)
  if (query?.limit) result = result.slice(0, query.limit)
  return result
}

export async function remove(store: StoreName, id: string) {
  const db = await openDatabase()
  return withStore(db, store, "readwrite", (s) => s.delete(id))
}

export async function clear(store: StoreName) {
  const db = await openDatabase()
  return withStore(db, store, "readwrite", (s) => s.clear())
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error)
    tx.onerror = () => reject(tx.error)
  })
}

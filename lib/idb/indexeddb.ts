const DATABASE_NAME = "gss-hr-db"
const DATABASE_VERSION = 1

export type StoreName =
  | "employees"
  | "deployments"
  | "leave_requests"
  | "payroll"
  | "admin_users"
  | "settings"
  | "notifications"
  | "attendance"
  | "mutations"
  | "meta"

export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      const ensureStore = (name: string, options?: IDBObjectStoreParameters) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, options)
        }
      }

      // Data stores (primary key defaults to `id` as UUID from Supabase)
      ensureStore("employees", { keyPath: "id" })
      ensureStore("deployments", { keyPath: "id" })
      ensureStore("leave_requests", { keyPath: "id" })
      ensureStore("payroll", { keyPath: "id" })
      ensureStore("admin_users", { keyPath: "id" })
      ensureStore("settings", { keyPath: "id" })
      ensureStore("notifications", { keyPath: "id" })
      ensureStore("attendance", { keyPath: "id" })

      // Outbox queue for offline mutations
      ensureStore("mutations", { keyPath: "key", autoIncrement: true })

      // Meta info such as lastSync timestamps
      ensureStore("meta", { keyPath: "key" })
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function withStore<T>(
  db: IDBDatabase,
  storeName: StoreName,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const result = fn(store)

    if (result instanceof IDBRequest) {
      result.onsuccess = () => resolve(result.result as T)
      result.onerror = () => reject(result.error)
    } else {
      // If fn returns a Promise<T>
      ;(result as Promise<T>)
        .then((value) => resolve(value))
        .catch((err) => reject(err))
    }

    tx.onabort = () => reject(tx.error)
  })
}



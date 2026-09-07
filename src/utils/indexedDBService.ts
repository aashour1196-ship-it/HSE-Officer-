/**
 * HSE Safety System - IndexedDB Offline Data Storage & Auto-Sync Engine
 * محرك التخزين المؤقت المحلي والمزامنة التلقائية عند استعادة الاتصال
 */

import { IncidentReport, SafetyObservation, OfflineQueueItem } from '../types';

const DB_NAME = 'HSE_Safety_DB_v1';
const DB_VERSION = 1;

export const STORES = {
  INCIDENTS: 'incidents',
  OBSERVATIONS: 'safety_observations',
  OFFLINE_QUEUE: 'offline_queue',
  APP_CACHE: 'app_cache',
} as const;

let dbInstance: IDBDatabase | null = null;

/**
 * Initializes or returns the open IndexedDB database
 */
export function openHseDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Incidents Store
      if (!db.objectStoreNames.contains(STORES.INCIDENTS)) {
        const incidentsStore = db.createObjectStore(STORES.INCIDENTS, { keyPath: 'id' });
        incidentsStore.createIndex('date', 'date', { unique: false });
        incidentsStore.createIndex('severity', 'severity', { unique: false });
        incidentsStore.createIndex('status', 'status', { unique: false });
      }

      // 2. Safety Observations Store
      if (!db.objectStoreNames.contains(STORES.OBSERVATIONS)) {
        const obsStore = db.createObjectStore(STORES.OBSERVATIONS, { keyPath: 'id' });
        obsStore.createIndex('date', 'date', { unique: false });
      }

      // 3. Offline Reports Queue Store (قائمة انتظار المزامنة)
      if (!db.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.OFFLINE_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('queuedAt', 'queuedAt', { unique: false });
        queueStore.createIndex('type', 'type', { unique: false });
      }

      // 4. General App Cache Store
      if (!db.objectStoreNames.contains(STORES.APP_CACHE)) {
        db.createObjectStore(STORES.APP_CACHE, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Failed to open HSE IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Generic helper to save or update an item in a store
 */
export async function saveToStore<T>(storeName: string, item: T): Promise<void> {
  const db = await openHseDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Generic helper to get all items from a store
 */
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openHseDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Generic helper to delete an item by ID from a store
 */
export async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await openHseDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Enqueue an offline report into IndexedDB
 */
export async function enqueueOfflineReport(item: OfflineQueueItem): Promise<void> {
  await saveToStore(STORES.OFFLINE_QUEUE, item);
}

/**
 * Retrieve all pending items in the offline queue
 */
export async function getPendingOfflineReports(): Promise<OfflineQueueItem[]> {
  try {
    const all = await getAllFromStore<OfflineQueueItem>(STORES.OFFLINE_QUEUE);
    return all.filter((item) => item.status === 'pending_sync');
  } catch (err) {
    console.error('Error fetching pending offline reports from IndexedDB:', err);
    return [];
  }
}

/**
 * Get count of pending offline reports
 */
export async function getPendingOfflineCount(): Promise<number> {
  const items = await getPendingOfflineReports();
  return items.length;
}

/**
 * Mark a report as synced or remove it once merged
 */
export async function resolveOfflineReport(id: string): Promise<void> {
  await deleteFromStore(STORES.OFFLINE_QUEUE, id);
}

/**
 * Cache all incidents into IndexedDB for persistent offline retrieval
 */
export async function cacheAllIncidents(incidents: IncidentReport[]): Promise<void> {
  if (!incidents || incidents.length === 0) return;
  const db = await openHseDatabase();
  const tx = db.transaction(STORES.INCIDENTS, 'readwrite');
  const store = tx.objectStore(STORES.INCIDENTS);
  for (const inc of incidents) {
    store.put(inc);
  }
}

/**
 * Retrieve all cached incidents from IndexedDB
 */
export async function getCachedIncidents(): Promise<IncidentReport[]> {
  try {
    return await getAllFromStore<IncidentReport>(STORES.INCIDENTS);
  } catch (err) {
    console.warn('Could not load incidents from IndexedDB:', err);
    return [];
  }
}

/**
 * Cache general app dataset (observations, permits, checklists)
 */
export async function cacheAppSetting(key: string, value: any): Promise<void> {
  await saveToStore(STORES.APP_CACHE, { key, value, updatedAt: new Date().toISOString() });
}

export async function getAppSetting<T>(key: string): Promise<T | null> {
  const db = await openHseDatabase();
  return new Promise((resolve) => {
    const tx = db.transaction(STORES.APP_CACHE, 'readonly');
    const store = tx.objectStore(STORES.APP_CACHE);
    const req = store.get(key);
    req.onsuccess = () => {
      resolve(req.result ? (req.result.value as T) : null);
    };
    req.onerror = () => resolve(null);
  });
}

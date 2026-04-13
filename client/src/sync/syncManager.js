import db from '../db/db';

const API_BASE = '/api';

export const checkInternet = async () => {
  if (!navigator.onLine) return false;
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
};

export const syncToServer = async (token) => {
  const isReachable = await checkInternet();
  if (!token || !isReachable) return;

  const pending = await db.sync_queue.toArray();
  if (!pending.length) return;

  console.log(`[Sync] Flushing ${pending.length} queued items…`);

  try {
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: pending }),
    });

    if (!res.ok) return;

    const { success, failed } = await res.json();

    if (success.length) {
      // Remove successfully synced items from the queue to prevent infinite growth
      await db.sync_queue
        .where('localId')
        .anyOf(success)
        .delete();
    }

    if (failed.length) {
      console.warn('[Sync] Failed items:', failed);
    }

    console.log(`[Sync] ✅ ${success.length} synced, ${failed.length} failed`);
  } catch (err) {
    console.warn('[Sync] Network error — will retry on next online event:', err.message);
  }
};

export const addToQueue = async (collection, operation, localId, payload) => {
  await db.sync_queue.add({
    collection,
    operation,
    localId,
    payload,
    synced: 0,
    timestamp: new Date().toISOString(),
  });
};

import Dexie from 'dexie';

const db = new Dexie('DisasterAidDB');

db.version(1).stores({
  victims:     '&localId, status, severity, createdAt',
  sos_signals: '&localId, status, emergencyType, timestamp',
  sync_queue:  '++id, collection, localId, synced, timestamp, operation',
});

export default db;

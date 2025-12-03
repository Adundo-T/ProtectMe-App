import * as SQLite from 'expo-sqlite';
import type { PendingAlert, Report, Resource, ReportStatus } from '@/types';

type DbReportRow = {
  id: number;
  title: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  isAnonymous: number;
  hasAttachment: number;
  photoUri: string | null;
  audioUri: string | null;
};

type DbResourceRow = {
  id: number;
  name: string;
  category: Resource['category'];
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  isOpen24h: number;
};

const dbPromise = SQLite.openDatabaseAsync('protectme.db');

const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    isAnonymous INTEGER DEFAULT 0,
    hasAttachment INTEGER DEFAULT 0,
    photoUri TEXT,
    audioUri TEXT
  );
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    isOpen24h INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS pending_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    createdAt TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    status TEXT NOT NULL
  );
`;

// Seed data is intentionally Kenya-focused so demo contacts feel locally relevant.
// These are example locations and hotlines – real deployments should replace them
// with verified partners and up‑to‑date numbers.
const defaultResources: Omit<Resource, 'id'>[] = [
  {
    name: 'Nairobi Women\'s Hospital GVRC – Adams',
    category: 'Medical / GBV Centre',
    phone: '+254 709 667 000',
    address: 'Ngong Rd, Adams Arcade, Nairobi, Kenya',
    latitude: -1.2987,
    longitude: 36.7819,
    isOpen24h: true,
  },
  {
    name: 'Kenyatta National Hospital – GBV Recovery Centre',
    category: 'Medical / GBV Centre',
    phone: '+254 20 2726300',
    address: 'Hospital Rd, Upper Hill, Nairobi, Kenya',
    latitude: -1.3009,
    longitude: 36.8066,
    isOpen24h: true,
  },
  {
    name: 'Nairobi Central Police Station',
    category: 'Police',
    phone: '+254 20 2222222',
    address: 'Moi Avenue, Nairobi, Kenya',
    latitude: -1.2841,
    longitude: 36.8252,
    isOpen24h: true,
  },
  {
    name: 'Mombasa Rescue Safe House',
    category: 'Safe House',
    phone: '+254 703 000 000',
    address: 'Mombasa Island, Mombasa, Kenya',
    latitude: -4.0435,
    longitude: 39.6682,
    isOpen24h: true,
  },
  {
    name: 'Kenya National GBV Helpline 1195',
    category: 'Helpline',
    phone: '+254 780 119 500',
    address: '24/7 toll‑free helpline within Kenya',
    latitude: undefined,
    longitude: undefined,
    isOpen24h: true,
  },
];

export async function initializeDatabase() {
  const db = await dbPromise;
  await db.execAsync(createTablesSQL);

  const resourceCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM resources');
  if ((resourceCount?.count ?? 0) === 0) {
    await Promise.all(
      defaultResources.map((resource) =>
        db.runAsync(
          `INSERT INTO resources (name, category, phone, address, latitude, longitude, isOpen24h)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            resource.name,
            resource.category,
            resource.phone,
            resource.address,
            resource.latitude ?? null,
            resource.longitude ?? null,
            resource.isOpen24h ? 1 : 0,
          ],
        ),
      ),
    );
  }
}

export async function getReports(): Promise<Report[]> {
  const db = await dbPromise;
  const rows = await db.getAllAsync<DbReportRow>('SELECT * FROM reports ORDER BY createdAt DESC');
  return rows.map(mapDbReport);
}

export async function getReportById(id: number): Promise<Report | undefined> {
  const db = await dbPromise;
  const row = await db.getFirstAsync<DbReportRow>('SELECT * FROM reports WHERE id = ?', [id]);
  return row ? mapDbReport(row) : undefined;
}

export async function saveReport(payload: {
  id?: number;
  title: string;
  description: string;
  status: ReportStatus;
  isAnonymous: boolean;
  attachments?: { photoUri?: string; audioUri?: string };
}) {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();
  if (payload.id) {
    await db.runAsync(
      `UPDATE reports
       SET title = ?, description = ?, status = ?, updatedAt = ?, isAnonymous = ?, hasAttachment = ?, photoUri = ?, audioUri = ?
       WHERE id = ?`,
      [
        payload.title,
        payload.description,
        payload.status,
        timestamp,
        payload.isAnonymous ? 1 : 0,
        payload.attachments ? 1 : 0,
        payload.attachments?.photoUri ?? null,
        payload.attachments?.audioUri ?? null,
        payload.id,
      ],
    );
    return payload.id;
  }

  const result = await db.runAsync(
    `INSERT INTO reports (title, description, status, createdAt, updatedAt, isAnonymous, hasAttachment, photoUri, audioUri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.title,
      payload.description,
      payload.status,
      timestamp,
      timestamp,
      payload.isAnonymous ? 1 : 0,
      payload.attachments ? 1 : 0,
      payload.attachments?.photoUri ?? null,
      payload.attachments?.audioUri ?? null,
    ],
  );

  return Number(result.lastInsertRowId);
}

export async function deleteReport(id: number) {
  const db = await dbPromise;
  await db.runAsync('DELETE FROM reports WHERE id = ?', [id]);
}

export async function updateReportStatus(id: number, status: ReportStatus) {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();
  await db.runAsync('UPDATE reports SET status = ?, updatedAt = ? WHERE id = ?', [status, timestamp, id]);
}

export async function getResources(): Promise<Resource[]> {
  const db = await dbPromise;
  const rows = await db.getAllAsync<DbResourceRow>('SELECT * FROM resources ORDER BY name ASC');
  return rows.map((row) => ({
    ...row,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    isOpen24h: Boolean(row.isOpen24h),
  }));
}

export async function logPendingAlert(phoneNumber: string): Promise<number> {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO pending_alerts (createdAt, phoneNumber, status)
     VALUES (?, ?, ?)`,
    [timestamp, phoneNumber, 'pending'],
  );
  return Number(result.lastInsertRowId);
}

export async function getPendingAlerts(): Promise<PendingAlert[]> {
  const db = await dbPromise;
  const rows = await db.getAllAsync<PendingAlert>('SELECT * FROM pending_alerts ORDER BY createdAt DESC');
  return rows;
}

function mapDbReport(row: DbReportRow): Report {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    isAnonymous: Boolean(row.isAnonymous),
    hasAttachment: Boolean(row.hasAttachment),
    attachments:
      row.photoUri || row.audioUri
        ? {
            photoUri: row.photoUri ?? undefined,
            audioUri: row.audioUri ?? undefined,
          }
        : undefined,
  };
}


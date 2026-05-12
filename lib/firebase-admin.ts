import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

function parsePrivateKey(raw: string): string {
  if (!raw) return '';
  // Accept both raw PEM (with literal \n escapes from .env files) and base64-encoded PEM.
  if (raw.includes('-----BEGIN')) return raw.replace(/\\n/g, '\n');
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    if (decoded.includes('-----BEGIN')) return decoded.replace(/\\n/g, '\n');
  } catch {}
  return raw;
}

export function getAdminApp(): admin.app.App {
  if (admin.apps.length) return admin.app();
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: parsePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? ''),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

let _db: Firestore | undefined;

export function getAdminDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getAdminApp());
    try {
      _db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // settings already applied on a prior invocation
    }
  }
  return _db;
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}

export function getAdminStorage(): admin.storage.Storage {
  return admin.storage(getAdminApp());
}

export async function getSignedDownloadUrl(filePath: string, expiresInMs = 3600000): Promise<string> {
  const bucket = getAdminStorage().bucket();
  const file = bucket.file(filePath);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInMs,
  });
  return url;
}

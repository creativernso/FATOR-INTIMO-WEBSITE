import * as admin from 'firebase-admin';

function getAdminApp(): admin.app.App {
  if (admin.apps.length) return admin.app();
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? '', 'base64').toString('utf8'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
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

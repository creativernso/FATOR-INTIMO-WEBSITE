import { getAdminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Affiliate, AffiliateReferral } from './types';

const db = () => getAdminDb();

export async function getAffiliates(): Promise<Affiliate[]> {
  const snap = await db().collection('affiliates').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data() as Affiliate);
}

export async function getAffiliateById(id: string): Promise<Affiliate | undefined> {
  const doc = await db().collection('affiliates').doc(id).get();
  return doc.exists ? (doc.data() as Affiliate) : undefined;
}

export async function getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
  const snap = await db().collection('affiliates').where('code', '==', code).limit(1).get();
  if (snap.empty) return undefined;
  return snap.docs[0].data() as Affiliate;
}

export async function getAffiliateByToken(token: string): Promise<Affiliate | undefined> {
  const snap = await db().collection('affiliates').where('dashboardToken', '==', token).limit(1).get();
  if (snap.empty) return undefined;
  return snap.docs[0].data() as Affiliate;
}

export async function getAffiliateByEmail(email: string): Promise<Affiliate | undefined> {
  const snap = await db().collection('affiliates').where('email', '==', email).limit(1).get();
  if (snap.empty) return undefined;
  return snap.docs[0].data() as Affiliate;
}

export async function saveAffiliate(affiliate: Affiliate): Promise<void> {
  await db().collection('affiliates').doc(affiliate.id).set(affiliate);
}

export async function updateAffiliate(id: string, data: Partial<Affiliate>): Promise<void> {
  await db().collection('affiliates').doc(id).update(data);
}

export async function incrementAffiliateClicks(code: string): Promise<void> {
  const snap = await db().collection('affiliates').where('code', '==', code).limit(1).get();
  if (snap.empty) return;
  await snap.docs[0].ref.update({ clicks: FieldValue.increment(1) });
}

// ─── Referrals ──────────────────────────────────────────────────────────────

export async function saveAffiliateReferral(referral: AffiliateReferral): Promise<void> {
  await db().collection('affiliateReferrals').doc(referral.id).set(referral);
}

export async function getReferralsByAffiliate(affiliateId: string): Promise<AffiliateReferral[]> {
  // Sorted in memory rather than via .orderBy() to avoid needing a Firestore
  // composite index for this where+orderBy combination.
  const snap = await db().collection('affiliateReferrals').where('affiliateId', '==', affiliateId).get();
  return snap.docs
    .map((d) => d.data() as AffiliateReferral)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllReferrals(): Promise<AffiliateReferral[]> {
  const snap = await db().collection('affiliateReferrals').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data() as AffiliateReferral);
}

export async function markReferralPaid(id: string): Promise<void> {
  await db().collection('affiliateReferrals').doc(id).update({
    status: 'paid',
    paidAt: new Date().toISOString(),
  });
}

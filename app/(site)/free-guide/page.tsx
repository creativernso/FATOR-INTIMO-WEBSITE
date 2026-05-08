import { getGuideConfig } from '@/lib/db';
import FreeGuideClient from './FreeGuideClient';

export const dynamic = 'force-dynamic';

export default async function FreeGuidePage() {
  const config = await getGuideConfig();
  return <FreeGuideClient config={config} />;
}

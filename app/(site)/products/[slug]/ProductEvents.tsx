'use client';

import { useEffect } from 'react';
import { trackViewContent } from '@/lib/fbq';

interface Props {
  productId: string;
  productTitle: string;
  value: number;
}

export default function ProductEvents({ productId, productTitle, value }: Props) {
  useEffect(() => {
    trackViewContent({
      content_ids: [productId],
      content_name: productTitle,
      content_type: 'product',
      value,
      currency: 'BRL',
    });
  }, [productId, productTitle, value]);
  return null;
}

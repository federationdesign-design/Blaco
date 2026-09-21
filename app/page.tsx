import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage } from './lib/content';
import { PageView } from './components/templates/PageView';

export const metadata: Metadata = {
  title: { absolute: 'Blaco Hill Farm Cottages | Holiday Rentals' },
  alternates: { canonical: '/' },
};

export default function Home() {
  const page = getPage('/');
  if (!page) notFound();
  return <PageView page={page} />;
}

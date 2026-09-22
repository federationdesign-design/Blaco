import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage } from './lib/content';
import { pageMetadata } from './lib/metadata';
import { PageView } from './components/templates/PageView';

const home = getPage('/');

export const metadata: Metadata = home ? pageMetadata(home) : {};

export default function Home() {
  const page = getPage('/');
  if (!page) notFound();
  return <PageView page={page} />;
}

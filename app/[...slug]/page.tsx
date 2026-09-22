import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getIndex, getPage } from '../lib/content';
import { pageMetadata } from '../lib/metadata';
import { PageView } from '../components/templates/PageView';

// Every ported URL except the home page, including root-level FAQ and
// testimonial slugs such as /do-you-have-wifi.
export const dynamicParams = false;

type Params = { slug: string[] };

export function generateStaticParams(): Params[] {
  return getIndex()
    .filter((entry) => entry.url !== '/')
    .map((entry) => ({ slug: entry.url.slice(1).split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(`/${slug.join('/')}`);
  return page ? pageMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = getPage(`/${slug.join('/')}`);
  if (!page) notFound();
  return <PageView page={page} />;
}

// Content types and loaders. The JSON in content/ is generated from the live
// WordPress site by agent/scripts/build-content.mjs; edit the script, not the JSON.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Img = { src: string; width: number; height: number; alt: string };

export type Overlay = 'light' | 'green' | 'dark';
export type Background = { image: Img | null; overlay: Overlay };

export type IconName = 'pin' | 'house' | 'people' | 'phone' | 'mail' | 'check' | 'bed';

export type FormField = { name: string; label: string; type: 'text' | 'email' | 'tel' | 'textarea'; required: boolean };

export type TextModule = { type: 'text'; html: string };
export type ButtonModule = { type: 'button'; label: string; href: string };
// sans: the live label is Raleway (read from the live page CSS), not Baskervville.
export type BlurbModule = { type: 'blurb'; title: string; icon: IconName | null; sans: boolean; image: Img | null; href: string | null; html: string };
export type TestimonialModule = { type: 'testimonial'; author: string; html: string; portrait: Img | null };
// heading: the level of the form's title. It is 'h1' on the two pages whose
// only top-level heading is the form title (agent/SEO.md), 'h2' everywhere else.
export type FormModule = { type: 'form'; variant: 'quick' | 'full'; title: string; titleSans: boolean; heading: 'h1' | 'h2'; fields: FormField[]; submit: string; success: string };
export type Slide = { title: string; titleSans: boolean; html: string; image: Img | null };

export type Module =
  | TextModule
  | ButtonModule
  | BlurbModule
  | TestimonialModule
  | FormModule
  | { type: 'image'; image: Img | null; href: string | null }
  | { type: 'toggle'; title: string; sans: boolean; html: string }
  | { type: 'counter'; number: string; title: string; sans: boolean }
  | { type: 'gallery'; images: Img[] }
  | { type: 'divider' }
  | { type: 'map'; title: string; lat: number; lng: number }
  | { type: 'posts' }
  | { type: 'slider'; slides: Slide[] }
  | { type: 'card'; image: Img | null; html: string; href: string; label: string };

export type ColumnSize = '4_4' | '1_2' | '1_3' | '2_3' | '1_4' | '3_4' | '1_6' | '2_5' | '3_5';
export type Column = { size: ColumnSize; modules: Module[] };
export type Row = { columns: Column[] };

export type SectionKind = 'hero' | 'slider' | 'band' | 'parallax' | 'reviews' | 'contact' | 'amenities' | 'cards' | 'content';
export type Section = { kind: SectionKind; background: Background | null; rows: Row[] };

export type Template =
  | 'home'
  | 'cottage'
  | 'listing'
  | 'faq-index'
  | 'testimonial-index'
  | 'post'
  | 'contact'
  | 'general'
  | 'policy'
  | 'accessibility';

export type Cottage = {
  background: Background | null;
  heading: string;
  highlights: BlurbModule[];
  action: ButtonModule | null;
  description: Module[];
  features: Module[];
  gallery: Module[];
  map: Img | null;
  sections: Section[];
};

export type Post = { title: string; date: string; category: 'faq' | 'testimonial'; html: string };

export type Page = {
  url: string;
  template: Template;
  title: string;
  absoluteTitle: string | null;
  // Approved wording from agent/blaco_seo_descriptions.csv, used as written for
  // both the meta description and og:description.
  description: string;
  // og:image: the page's hero photo, or the logo where the page has none.
  share: Img;
  sections?: Section[];
  cottage?: Cottage | null;
  post?: Post;
};

export type IndexEntry = { url: string; file: string; template: Template; title: string };
export type PostSummary = { url: string; title: string; html: string; date: string };

const CONTENT = join(process.cwd(), 'content');
const readJson = <T,>(path: string): T => JSON.parse(readFileSync(join(CONTENT, path), 'utf8')) as T;

export const getIndex = () => readJson<IndexEntry[]>('index.json');

export function getPage(url: string): Page | null {
  const entry = getIndex().find((e) => e.url === url);
  return entry ? readJson<Page>(`pages/${entry.file}.json`) : null;
}

export const getPosts = () => readJson<{ faq: PostSummary[]; testimonial: PostSummary[] }>('posts.json');

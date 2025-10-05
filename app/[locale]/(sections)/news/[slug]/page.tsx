import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import {
  getContent,
  listSlugs,
  resolveAvailableLocales,
  SUPPORTED_LOCALES,
  type Locale
} from '@/lib/content-loader';
import { Callout } from '@/components/mdx/callout';

interface NewsDetailPageProps {
  params: { locale: string; slug: string };
}

export async function generateStaticParams() {
  const slugs = await listSlugs('news');
  return SUPPORTED_LOCALES.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const locale = params.locale as Locale;
  const newsItem = await getContent('news', params.slug, locale);

  if (!newsItem) {
    notFound();
  }

  const { content } = await compileMDX({
    source: newsItem.body,
    components: { Callout }
  });

  const availableLocales = await resolveAvailableLocales('news', params.slug);

  return (
    <article className="article">
      <header className="article-header">
        <p className="difficulty-pill">{newsItem.difficulty}</p>
        <h1 className="article-title">{newsItem.title}</h1>
        <p className="article-description">{newsItem.description}</p>
        <p className="article-meta">Updated {newsItem.updatedAt} · {newsItem.author}</p>
        <div className="tag-row">
          {newsItem.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <p className="locale-note">Available in: {availableLocales.join(', ')}</p>
      </header>
      <div className="article-body">{content}</div>
    </article>
  );
}

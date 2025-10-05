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

interface ResourceDetailPageProps {
  params: { locale: string; slug: string };
}

export async function generateStaticParams() {
  const slugs = await listSlugs('resources');
  return SUPPORTED_LOCALES.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const locale = params.locale as Locale;
  const resource = await getContent('resources', params.slug, locale);

  if (!resource) {
    notFound();
  }

  const { content } = await compileMDX({
    source: resource.body,
    components: { Callout }
  });

  const availableLocales = await resolveAvailableLocales('resources', params.slug);

  return (
    <article className="article">
      <header className="article-header">
        <p className="difficulty-pill">{resource.difficulty}</p>
        <h1 className="article-title">{resource.title}</h1>
        <p className="article-description">{resource.description}</p>
        <p className="article-meta">Updated {resource.updatedAt} · {resource.author}</p>
        <div className="tag-row">
          {resource.tags.map((tag) => (
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

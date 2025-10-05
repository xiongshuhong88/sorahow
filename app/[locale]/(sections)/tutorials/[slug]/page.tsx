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

interface TutorialDetailPageProps {
  params: { locale: string; slug: string };
}

export async function generateStaticParams() {
  const slugs = await listSlugs('tutorials');
  return SUPPORTED_LOCALES.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export default async function TutorialDetailPage({ params }: TutorialDetailPageProps) {
  const locale = params.locale as Locale;
  const tutorial = await getContent('tutorials', params.slug, locale);

  if (!tutorial) {
    notFound();
  }

  const { content } = await compileMDX({
    source: tutorial.body,
    components: { Callout }
  });

  const availableLocales = await resolveAvailableLocales('tutorials', params.slug);

  return (
    <article className="article">
      <header className="article-header">
        <p className="difficulty-pill">{tutorial.difficulty}</p>
        <h1 className="article-title">{tutorial.title}</h1>
        <p className="article-description">{tutorial.description}</p>
        <p className="article-meta">Updated {tutorial.updatedAt} · {tutorial.author}</p>
        <div className="tag-row">
          {tutorial.tags.map((tag) => (
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

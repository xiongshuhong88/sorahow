import Link from 'next/link';
import { listContent, type Locale } from '@/lib/content-loader';

interface TutorialsPageProps {
  params: { locale: string };
  searchParams?: { tag?: string };
}

export default async function TutorialsPage({ params, searchParams }: TutorialsPageProps) {
  const locale = params.locale as Locale;
  const tag = searchParams?.tag;
  const tutorials = await listContent('tutorials', locale, { tag });

  return (
    <section className="category-block">
      <header className="list-header">
        <h2 className="category-title">Tutorials</h2>
        <p className="filter-label">Filtered by tag: {tag ?? 'All'}</p>
      </header>
      <ul className="item-list">
        {tutorials.map((tutorial) => (
          <li key={tutorial.slug} className="item-card">
            <div className="item-card-content">
              <Link className="item-card-link" href={`/${locale}/tutorials/${tutorial.slug}`}>
                <h3 className="item-card-title">{tutorial.title}</h3>
              </Link>
              <p className="item-card-description">{tutorial.description}</p>
              <div className="tag-row">
                <span className="tag">{tutorial.difficulty}</span>
                {tutorial.tags.map((tagItem) => (
                  <Link
                    key={tagItem}
                    href={`/${locale}/tutorials?tag=${encodeURIComponent(tagItem)}`}
                    className="tag tag-link"
                  >
                    {tagItem}
                  </Link>
                ))}
              </div>
              <p className="meta-info">Updated {tutorial.updatedAt} · {tutorial.author}</p>
            </div>
          </li>
        ))}
        {tutorials.length === 0 && (
          <li className="item-card item-card-empty">
            No tutorials found for this filter. Try selecting a different tag.
          </li>
        )}
      </ul>
    </section>
  );
}

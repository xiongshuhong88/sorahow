import Link from 'next/link';
import { listContent, type Locale } from '@/lib/content-loader';

interface ResourcesPageProps {
  params: { locale: string };
  searchParams?: { tag?: string };
}

export default async function ResourcesPage({ params, searchParams }: ResourcesPageProps) {
  const locale = params.locale as Locale;
  const tag = searchParams?.tag;
  const resources = await listContent('resources', locale, { tag });

  return (
    <section className="category-block">
      <header className="list-header">
        <h2 className="category-title">Resources</h2>
        <p className="filter-label">Filter by tag: {tag ?? 'All'}</p>
      </header>
      <ul className="item-list">
        {resources.map((resource) => (
          <li key={resource.slug} className="item-card">
            <div className="item-card-content">
              <Link className="item-card-link" href={`/${locale}/resources/${resource.slug}`}>
                <h3 className="item-card-title">{resource.title}</h3>
              </Link>
              <p className="item-card-description">{resource.description}</p>
              <div className="tag-row">
                <span className="tag">{resource.difficulty}</span>
                {resource.tags.map((tagItem) => (
                  <Link
                    key={tagItem}
                    href={`/${locale}/resources?tag=${encodeURIComponent(tagItem)}`}
                    className="tag tag-link"
                  >
                    {tagItem}
                  </Link>
                ))}
              </div>
              <p className="meta-info">Updated {resource.updatedAt} · {resource.author}</p>
            </div>
          </li>
        ))}
        {resources.length === 0 && (
          <li className="item-card item-card-empty">
            No resources found for this filter. Try selecting a different tag.
          </li>
        )}
      </ul>
    </section>
  );
}

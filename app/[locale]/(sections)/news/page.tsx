import Link from 'next/link';
import { listContent, type Locale } from '@/lib/content-loader';

interface NewsPageProps {
  params: { locale: string };
  searchParams?: { tag?: string };
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const locale = params.locale as Locale;
  const tag = searchParams?.tag;
  const news = await listContent('news', locale, { tag });

  return (
    <section className="category-block">
      <header className="list-header">
        <h2 className="category-title">News</h2>
        <p className="filter-label">Filter by tag: {tag ?? 'All'}</p>
      </header>
      <ul className="item-list">
        {news.map((entry) => (
          <li key={entry.slug} className="item-card">
            <div className="item-card-content">
              <Link className="item-card-link" href={`/${locale}/news/${entry.slug}`}>
                <h3 className="item-card-title">{entry.title}</h3>
              </Link>
              <p className="item-card-description">{entry.description}</p>
              <div className="tag-row">
                <span className="tag">{entry.difficulty}</span>
                {entry.tags.map((tagItem) => (
                  <Link
                    key={tagItem}
                    href={`/${locale}/news?tag=${encodeURIComponent(tagItem)}`}
                    className="tag tag-link"
                  >
                    {tagItem}
                  </Link>
                ))}
              </div>
              <p className="meta-info">Updated {entry.updatedAt} · {entry.author}</p>
            </div>
          </li>
        ))}
        {news.length === 0 && (
          <li className="item-card item-card-empty">
            No news entries match this filter. Try a different tag.
          </li>
        )}
      </ul>
    </section>
  );
}

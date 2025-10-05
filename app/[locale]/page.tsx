import Link from 'next/link';
import { CONTENT_CATEGORIES, type Locale, listContent } from '@/lib/content-loader';

interface PageProps {
  params: { locale: string };
}

const categoryLabels: Record<string, { en: string; zh: string; description: string }> = {
  tutorials: {
    en: 'Tutorials',
    zh: '教程',
    description: 'Step-by-step guides to help you master Sorahow.'
  },
  resources: {
    en: 'Resources',
    zh: '资源',
    description: 'Reusable assets, templates, and references.'
  },
  news: {
    en: 'News',
    zh: '新闻',
    description: 'Latest announcements and release notes.'
  }
};

export default async function LocaleIndex({ params }: PageProps) {
  const locale = params.locale as Locale;
  const previews = await Promise.all(
    CONTENT_CATEGORIES.map(async (category) => {
      const items = await listContent(category, locale);
      return { category, items: items.slice(0, 2) };
    })
  );

  return (
    <div className="stack-lg">
      {previews.map(({ category, items }) => {
        const label = categoryLabels[category][locale] ?? category;
        return (
          <section key={category} className="category-block">
            <header className="category-header">
              <div>
                <h2 className="category-title">{label}</h2>
                <p className="category-subtitle">{categoryLabels[category].description}</p>
              </div>
              <Link className="category-link" href={`/${locale}/${category}`}>
                View all
              </Link>
            </header>
            <ul className="item-list">
              {items.map((item) => (
                <li key={`${category}-${item.slug}`} className="item-card">
                  <Link href={`/${locale}/${category}/${item.slug}`} className="item-card-link">
                    <h3 className="item-card-title">{item.title}</h3>
                    <p className="item-card-description">{item.description}</p>
                  </Link>
                </li>
              ))}
              {items.length === 0 && (
                <li className="item-card item-card-empty">
                  No entries yet. Content editors can add new items in web/content/{category}.
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

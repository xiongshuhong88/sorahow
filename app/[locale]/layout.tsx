import type { ReactNode } from 'react';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/content-loader';

interface LocaleLayoutProps {
  params: { locale: string };
  children: ReactNode;
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({ params, children }: LocaleLayoutProps) {
  const locale = params.locale as Locale;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: ${params.locale}`);
  }

  return (
    <section className="section">
      <header className="section-header">
        <p className="locale-chip">{locale}</p>
        <h1 className="section-title">Sorahow Knowledge Base</h1>
        <p className="section-subtitle">
          Curated tutorials, resources, and product news that adapt to your language.
        </p>
      </header>
      {children}
    </section>
  );
}

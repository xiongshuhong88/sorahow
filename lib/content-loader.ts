import path from 'node:path';
import { promises as fs } from 'node:fs';
import matter from 'gray-matter';

export const SUPPORTED_LOCALES = ['en', 'zh'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const CONTENT_CATEGORIES = ['tutorials', 'resources', 'news'] as const;
export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
type Difficulty = (typeof DIFFICULTY_LEVELS)[number];

export interface ContentFrontmatter {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  updatedAt: string;
  author: string;
}

export interface ContentMeta extends ContentFrontmatter {
  slug: string;
  locale: Locale;
  category: ContentCategory;
}

export interface ContentEntry extends ContentMeta {
  body: string;
}

const CONTENT_ROOT = path.join(process.cwd(), 'web', 'content');

export async function listSlugs(category: ContentCategory): Promise<string[]> {
  assertCategory(category);
  const categoryPath = path.join(CONTENT_ROOT, category);
  const directories = await readDirectorySafe(categoryPath);
  return directories.filter((item) => !item.startsWith('.'));
}

function assertLocale(locale: string): asserts locale is Locale {
  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
}

function assertCategory(category: string): asserts category is ContentCategory {
  if (!CONTENT_CATEGORIES.includes(category as ContentCategory)) {
    throw new Error(`Unsupported category: ${category}`);
  }
}

function assertDifficulty(difficulty: string): asserts difficulty is Difficulty {
  if (!DIFFICULTY_LEVELS.includes(difficulty as Difficulty)) {
    throw new Error(`Unsupported difficulty: ${difficulty}`);
  }
}

async function readDirectorySafe(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function listContent(
  category: ContentCategory,
  locale: Locale,
  options: { tag?: string } = {}
): Promise<ContentMeta[]> {
  assertCategory(category);
  assertLocale(locale);
  const categoryPath = path.join(CONTENT_ROOT, category);
  const entryDirs = await readDirectorySafe(categoryPath);
  const entries: ContentMeta[] = [];

  for (const entryDir of entryDirs) {
    const mdxPath = path.join(categoryPath, entryDir, `${locale}.mdx`);
    try {
      const file = await fs.readFile(mdxPath, 'utf-8');
      const { data } = matter(file);
      const frontmatter = normalizeFrontmatter(data, entryDir, category, locale);
      if (options.tag && !frontmatter.tags.includes(options.tag)) {
        continue;
      }
      entries.push(frontmatter);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }

  return entries.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getContent(
  category: ContentCategory,
  slug: string,
  locale: Locale
): Promise<ContentEntry | null> {
  assertLocale(locale);
  assertCategory(category);

  const mdxPath = path.join(CONTENT_ROOT, category, slug, `${locale}.mdx`);
  try {
    const file = await fs.readFile(mdxPath, 'utf-8');
    const { data, content } = matter(file);
    const frontmatter = normalizeFrontmatter(data, slug, category, locale);
    return { ...frontmatter, body: content };
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function getAllContent(locale: Locale): Promise<ContentMeta[]> {
  assertLocale(locale);
  const aggregated: ContentMeta[] = [];
  for (const category of CONTENT_CATEGORIES) {
    const categoryEntries = await listContent(category, locale);
    aggregated.push(...categoryEntries);
  }
  return aggregated.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function normalizeFrontmatter(
  data: matter.GrayMatterFile<string>['data'],
  slug: string,
  category: ContentCategory,
  locale: Locale
): ContentMeta {
  const frontmatter = data as Partial<ContentFrontmatter>;
  if (!frontmatter.title) {
    throw new Error(`Missing title in ${category}/${slug}/${locale}.mdx`);
  }
  if (!frontmatter.description) {
    throw new Error(`Missing description in ${category}/${slug}/${locale}.mdx`);
  }
  if (!frontmatter.difficulty) {
    throw new Error(`Missing difficulty in ${category}/${slug}/${locale}.mdx`);
  }
  assertDifficulty(frontmatter.difficulty);
  if (!frontmatter.tags) {
    throw new Error(`Missing tags in ${category}/${slug}/${locale}.mdx`);
  }
  if (!frontmatter.updatedAt) {
    throw new Error(`Missing updatedAt in ${category}/${slug}/${locale}.mdx`);
  }
  if (!frontmatter.author) {
    throw new Error(`Missing author in ${category}/${slug}/${locale}.mdx`);
  }

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    difficulty: frontmatter.difficulty,
    tags: (Array.isArray(frontmatter.tags)
      ? frontmatter.tags.map((tag) => String(tag))
      : String(frontmatter.tags)
          .split(',')
          .map((tag) => tag.trim())
    ).filter((tag) => tag.length > 0),
    updatedAt: frontmatter.updatedAt,
    author: frontmatter.author,
    slug,
    category,
    locale
  };
}

export function resolveAvailableLocales(
  category: ContentCategory,
  slug: string
): Promise<Locale[]> {
  const entryDir = path.join(CONTENT_ROOT, category, slug);
  return readDirectorySafe(entryDir).then((files) =>
    files
      .map((file) => file.replace(/\.mdx$/, ''))
      .filter((file): file is Locale => SUPPORTED_LOCALES.includes(file as Locale))
  );
}

export function validateContentStructure(): Promise<void> {
  return Promise.all(
    CONTENT_CATEGORIES.map(async (category) => {
      const categoryPath = path.join(CONTENT_ROOT, category);
      const entries = await readDirectorySafe(categoryPath);
      await Promise.all(
        entries.map(async (slug) => {
          for (const locale of SUPPORTED_LOCALES) {
            const mdxPath = path.join(categoryPath, slug, `${locale}.mdx`);
            try {
              await fs.access(mdxPath);
            } catch (error: unknown) {
              if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                throw new Error(
                  `Missing translation file: ${path.relative(process.cwd(), mdxPath)}`
                );
              }
              throw error;
            }
          }
        })
      );
    })
  ).then(() => undefined);
}

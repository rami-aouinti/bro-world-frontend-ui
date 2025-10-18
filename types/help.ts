export interface HelpCategory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  order?: number;
  articleCount: number;
}

export interface HelpArticleSummary {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  keywords?: string[];
  updatedAtIso?: string;
  isPopular?: boolean;
  relatedIds?: string[];
}

export interface HelpArticleDetail extends HelpArticleSummary {
  body: string;
}

export interface HelpSearchResult extends HelpArticleSummary {
  snippet?: string;
}

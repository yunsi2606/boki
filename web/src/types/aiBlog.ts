export type AiBlogAction =
  | 'FULL_ARTICLE'
  | 'OUTLINE'
  | 'POLISH'
  | 'SEO_OPTIMIZE'
  | 'GENERATE_EXCERPT';

export type AiBlogTone =
  | 'INSPIRING'
  | 'PROFESSIONAL'
  | 'CONVERSATIONAL'
  | 'ANALYTICAL'
  | 'HUMOROUS';

export type AiBlogLength = 'SHORT' | 'MEDIUM' | 'DETAILED';

export type AiBlogTargetAudience =
  | 'BOOK_LOVERS'
  | 'STUDENTS'
  | 'PROFESSIONALS'
  | 'GENERAL';

export interface AiGenerateBlogRequest {
  action: AiBlogAction;
  topic?: string;
  bookId?: string;
  category?: string;
  tone?: AiBlogTone;
  length?: AiBlogLength;
  targetAudience?: AiBlogTargetAudience;
  existingTitle?: string;
  existingContent?: string;
  customPrompt?: string;
}

export interface AiGenerateBlogResponse {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  outline: string[];
  metaKeywords: string;
  estimatedReadingTime: number;
  providerName: string;
}

export interface AiBlogAppliedData {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface PostMetadata {
  caption?: string;
  author?: string;
  description?: string;
  likes?: string;
  date?: string;
  hashtags?: string[];
  thumbnailUrl?: string;
}

export interface AnalysisResult {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  suggestedHashtags: string[];
  contentIdeas: string[];
}

export enum AppMode {
  URL_ANALYZER = 'URL_ANALYZER',
  MEDIA_ANALYZER = 'MEDIA_ANALYZER'
}

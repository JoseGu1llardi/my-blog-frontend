export interface AuthorSummaryResponse {
  id: number;
  fullName: string;
  slug: string;
  avatarUrl: string;
}

export interface AuthorResponse {
  username: string;
  fullName: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  website: string;
  github: string;
  x: string;
  linkedin: string;
  postCount: number;
}
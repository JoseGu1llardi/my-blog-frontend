export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  postCount: number;
}

export interface CategoryCreateRequest {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
}
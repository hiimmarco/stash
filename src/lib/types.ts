export type LinkType = "article" | "video" | "podcast";

export interface Link {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  type: LinkType;
  domain: string;
  platform: string;
  created_at: string;
}

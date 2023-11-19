export interface PostDto {
  id: string;
  created_at: string;
  title: string;
  content: string;
  profile: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

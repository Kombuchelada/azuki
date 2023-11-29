export interface Post {
  id: string;
  createdAt: Date;
  title: string;
  content: string;
  profile: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

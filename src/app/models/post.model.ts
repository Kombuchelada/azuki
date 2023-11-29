export interface Post {
  id: string;
  createdAt: Date;
  title: string;
  content: string;
  profile: {
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

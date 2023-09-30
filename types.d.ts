export interface User {
  email: string;
  gender: string;
  isVerified: boolean;
  logged: boolean;
  password: string;
  photoUrl: string;
  posts: Post[] | [];
  username: string;
}

export interface Post {
  author: string;
  body: string;
  date: string;
  photoUrl: string;
  postId: string;
  reactions: Reactions;
  title: string;
}

export interface Reactions {
  thumbsUp: {
    count: number,
    reactedBy: string[] | [],
  },
  thumbsDown: {
    count: number,
    reactedBy: string[] | [],
  },
  smile: {
    count: number,
    reactedBy: string[] | [],
  },
  hooray: {
    count: number,
    reactedBy: string[] | [],
  },
  unhappy: {
    count: number,
    reactedBy: string[] | [],
  },
  heart: {
    count: number,
    reactedBy: string[] | [],
  },
}

export interface UpdateReactions {
  post: Post;
  userId: string;
}
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
  title: string;
  body: string;
  author: string;
  date: string;
  postId: string;
  photoUrl: string;
  reactions: Reactions;
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
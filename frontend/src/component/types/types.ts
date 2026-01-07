
export interface Category {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  role: "user" | "system";
  content: string;
  createdAt: string;
  userId: string;
  companionId: string;
}

export interface Companion {
  id: string;
  userId: string;
  username: string;
  src: string;
  name: string;
  description: string;
  instructions: string;
  seed: string;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category?: Category;
  messages: Message[];
  _count: {
    messages: number;
  };
}
export type User = {
  id: string;
  email: string;
  firstName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SharedSpace = {
  id: string;
  code: string;
  user1_id: string;
  user2_id?: string;
  user1?: User;
  user2?: User;
  createdAt: Date;
  updatedAt: Date;
};

export type Memory = {
  id: string;
  space_id: string;
  author_id: string;
  author?: User;
  type: 'word' | 'photo' | 'video' | 'audio' | 'mood' | 'secret';
  content: string;
  media_url?: string;
  mood?: 'in-love' | 'happy' | 'peaceful' | 'nostalgic' | 'sad' | 'tired' | 'excited';
  createdAt: Date;
  updatedAt: Date;
};

export type Reaction = {
  id: string;
  memory_id: string;
  user_id: string;
  emoji: string;
  createdAt: Date;
};

export type Notification = {
  id: string;
  space_id: string;
  user_id: string;
  type: 'new_memory' | 'new_reaction' | 'new_message' | 'streak_milestone';
  relatedMemoryId?: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export type Streak = {
  id: string;
  space_id: string;
  currentDays: number;
  maxDays: number;
  lastUpdated: Date;
};

export type SecretMessage = {
  id: string;
  space_id: string;
  author_id: string;
  title: string;
  content: string;
  media_url?: string;
  unlocksAt: Date;
  opened: boolean;
  createdAt: Date;
};

export type AuthContextType = {
  user: User | null;
  space: SharedSpace | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string) => Promise<void>;
  logout: () => Promise<void>;
  createSpace: () => Promise<string>;
  joinSpace: (code: string) => Promise<void>;
};

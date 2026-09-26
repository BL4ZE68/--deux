export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  avatar?: string;
}

export interface SharedSpace {
  id: string;
  code: string;
  user1_id: string;
  user2_id?: string;
  createdAt?: string | Date;
  created_at?: string | Date;
}

export interface Memory {
  id: string;
  space_id: string;
  author_id: string;
  type: 'word' | 'photo' | 'video' | 'audio' | 'mood' | 'secret';
  content: string;
  mood?: string;
  media_url?: string;
  createdAt?: string | Date;
  created_at?: string | Date;
}

export interface Reaction {
  id: string;
  memory_id: string;
  user_id: string;
  emoji: string;
}

export interface Streak {
  current_streak: number;
  max_streak: number;
}

export interface SecretMessage {
  id: string;
  space_id: string;
  author_id: string;
  title: string;
  content: string;
  opens_at: string;
  created_at: string;
  is_locked: boolean;
}

export interface SessionResponse {
  token?: string;
  user?: AppUser;
  space?: SharedSpace | null;
  needsEmailConfirmation?: boolean;
  message?: string;
}

export interface ApiErrorResponse {
  message?: string;
}

export interface MemoriesResponse {
  memories: Memory[];
}

export interface ReactionsResponse {
  reactions: Reaction[];
}

export interface SecretsResponse {
  secrets: SecretMessage[];
}

export type Locale = 'es' | 'en';

export type Gender = 'male' | 'female' | 'other';
export type Orientation = 'men' | 'women' | 'everyone';
export type Category = 'body' | 'chest' | 'back' | 'butt' | 'intimate';
export type Visibility = 'global' | 'country' | '100km' | '20km';
export type Reaction = 'hot' | 'nice' | 'ok' | 'nope';
export type PhotoStatus = 'pending' | 'published' | 'rejected';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type Distance = '20km' | 'country' | 'global';

export interface User {
  id: string;
  nickname: string;
  age: number;
  gender: Gender;
  orientation: Orientation;
  status: UserStatus;
  credits: number;
  location_permission: boolean;
  distance_km?: number;
  created_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  user: Pick<User, 'nickname' | 'age' | 'gender'> & { distance_km?: number };
  category: Category;
  visibility: Visibility;
  status: PhotoStatus;
  storage_path: string;
  vote_count: number;
  score: number;
  created_at: string;
}

export interface Vote {
  id: string;
  voter_id: string;
  photo_id: string;
  reaction: Reaction;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  photo_id: string;
  content: string;
  created_at: string;
}

export interface OnboardingState {
  // Step 1 - Adults Only
  consent_adults_only: boolean;
  consent_content: boolean;
  consent_terms: boolean;
  consent_privacy: boolean;
  terms_version: string;
  privacy_version: string;

  // Step 2 - Register
  email: string;
  password: string;
  date_of_birth: string;

  // Step 4 - About You
  gender: Gender | null;
  orientation: Orientation | null;

  // Step 6 - Preferences
  preferred_categories: Category[];
  age_range_min: number;
  age_range_max: number;
  preferred_distance: Distance;

  // Step 7 - Location (Welcome shown before)
  latitude: number | null;
  longitude: number | null;
  location_permission: boolean;
}

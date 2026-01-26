export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  last_activity?: string | null;          // ISO datetime string, optional
  auth_provider?: string | null;          // e.g., 'google', 'facebook'
  language_preference?: string | null;    // e.g., 'en', 'fr'
  is_email_verified?: boolean;
  profile_picture_url?: string | null;
  profile_picture?: string | null;        // could be URL or file path
  google_picture?: string | null;
  facebook_picture?: string | null;
  date_joined: string;                     // ISO datetime string
};


export interface AuthStoreType {
    user : UserProfile  | null,
    logout: () => void,
    hasCompletedOnboarding : boolean,
    setOnboarding : (value : boolean) => void,
    completeOnboarding: () => void,
    _hydrated : boolean,
    setHasHydrated : (value:boolean) => void,
    setTokens: (access: string,refresh:string) => Promise<void>,
    setUser: (data : UserProfile | null) => void,
}


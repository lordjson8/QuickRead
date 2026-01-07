export interface UserType {

}

export interface AuthStoreType {
    user : UserType | null,
    logout: () => void,
    hasCompletedOnboarding : boolean,
    setOnboarding : (value : boolean) => void,
    completeOnboarding: () => void,
    _hydrated : boolean,
    setHasHydrated : (value:boolean) => void,
    setTokens: (access: string,refresh:string) => Promise<void>
}


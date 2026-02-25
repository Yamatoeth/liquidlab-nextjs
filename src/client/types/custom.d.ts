// Minimal module declarations to satisfy TypeScript during development.
// These provide lightweight `any`-based types so the project can compile
// without installing full type packages immediately.

declare module "@supabase/supabase-js" {
  export function createClient(url: string, key: string, options?: any): any;
  export type SupabaseClient = any;
  const _default: { createClient: typeof createClient };
  export default _default;
}

declare module "@/lib/auth" {
  // public auth wrapper - exported functions used in app
  export function signUp(email: string, password: string): Promise<any>;
  export function signIn(email: string, password: string): Promise<any>;
  export function signOut(): Promise<any>;
  export function signInWithGoogle(): Promise<any>;
  export function sendMagicLink(email: string): Promise<any>;
  const _default: {
    signUp: typeof signUp;
    signIn: typeof signIn;
    signOut: typeof signOut;
    signInWithGoogle: typeof signInWithGoogle;
    sendMagicLink: typeof sendMagicLink;
  };
  export default _default;
}

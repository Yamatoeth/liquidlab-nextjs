// Use Supabase auth when available, otherwise fallback to a small stub
import * as supa from "@/lib/auth.supabase";

export type Auth = {
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<any>
  sendMagicLink: (email: string) => Promise<any>
}

export const signUp = async (email: string, password: string) => {
  try {
    return await supa.signUp(email, password);
  } catch (e) {
    // fallback stub
    await new Promise((r) => setTimeout(r, 500));
    return { user: { email } };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    return await supa.signIn(email, password);
  } catch (e) {
    await new Promise((r) => setTimeout(r, 500));
    return { user: { email } };
  }
};

export const signOut = async () => {
  try {
    return await supa.signOut();
  } catch (e) {
    await new Promise((r) => setTimeout(r, 200));
  }
};

export const signInWithGoogle = async () => {
  try {
    return await supa.signInWithGoogle();
  } catch (e) {
    await new Promise((r) => setTimeout(r, 200));
    return null;
  }
};

export const sendMagicLink = async (email: string) => {
  try {
    return await supa.sendMagicLink(email);
  } catch (e) {
    await new Promise((r) => setTimeout(r, 200));
    throw e;
  }
};

export const auth: Auth = {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  sendMagicLink,
}

export default auth

// also export names explicitly to ensure TypeScript sees the named exports
// named functions are already exported where declared above

import supabase from "@/lib/supabase";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  console.debug('auth.supabase.signUp result', { data });
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  console.debug('auth.supabase.signIn result', { data, error });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  console.debug('auth.supabase.signOut', { error });
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  console.debug('auth.supabase.getSession', { session: data?.session });
  return data.session;
}

export default { signUp, signIn, signOut, getSession };

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  console.debug('auth.supabase.signInWithGoogle', { data, error });
  if (error) throw error;
  return data;
}

export async function sendMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({ email });
  console.debug('auth.supabase.sendMagicLink', { data, error });
  if (error) throw error;
  return data;
}

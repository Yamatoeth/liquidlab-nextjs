"use client";
import { useState } from "react";
import { useNavigate } from "@App/useRouter";
import auth from "@/lib/auth";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.signUp(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Sign-up failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      await auth.signInWithGoogle();
    } catch (err) {
      console.error(err);
      alert("Google sign-up failed");
    }
  };

  const onMagicLink = async () => {
    if (!email) return alert("Enter your email to receive a sign-up link");
    try {
      await auth.sendMagicLink(email);
      alert("Magic link sent — check your email");
    } catch (err) {
      console.error(err);
      alert("Failed to send magic link");
    }
  };

  return (
    <div className="container py-16 md:py-24">
      <div className="panel mx-auto max-w-md p-7 md:p-8">
        <div className="mb-4">
          <button type="button" onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back
          </button>
        </div>
        <h2 className="mb-1 text-4xl font-semibold">Create account</h2>
        <p className="mb-6 text-sm text-muted-foreground">Start building with premium visuals.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Email</label>
            <input className="input-premium" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Password</label>
            <input className="input-premium" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <button type="submit" className="btn-primary h-11 w-full text-sm" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
          <div className="mt-3 space-y-2">
            <button type="button" onClick={onGoogle} className="btn-secondary h-11 w-full text-sm">
              Continue with Google
            </button>
            <button type="button" onClick={onMagicLink} className="btn-secondary h-11 w-full text-sm">
              Send sign-up link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;

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
      alert('Google sign-up failed');
    }
  };

  const onMagicLink = async () => {
    if (!email) return alert('Enter your email to receive a sign-up link');
    try {
      await auth.sendMagicLink(email);
      alert('Magic link sent — check your email');
    } catch (err) {
      console.error(err);
      alert('Failed to send magic link');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white/80 rounded-lg shadow">
      <div className="mb-4">
        <button type="button" onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:underline">
          ← Back
        </button>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Create account</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create account"}
        </button>
        <div className="mt-3">
          <button type="button" onClick={onGoogle} className="w-full border px-4 py-2 rounded mb-2">Continue with Google</button>
          <button type="button" onClick={onMagicLink} className="w-full border px-4 py-2 rounded">Send sign-up link</button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;

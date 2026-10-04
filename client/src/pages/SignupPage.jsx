import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/authApi.js";
import { useAuthStore } from "../store/authStore.js";
import ThemeToggle from "../components/layout/ThemeToggle.jsx";
import Brand from "../components/layout/Brand.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { user, token } = await signup(name, email, password);
      setAuth(user, token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <Brand />
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-xl shadow-md p-8 w-full max-w-sm"
        >
          <h1 className="text-2xl font-semibold text-text-main mb-6">
            Create account
          </h1>

          {error && <p className="text-rose-500 text-sm mb-4">{error}</p>}

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-5 px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90"
          >
            Sign up
          </button>

          <p className="text-text-muted text-sm mt-4 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Log in
            </Link>
          </p>
        </form>
      </div>
      <Footer />
    </div>
  );
}

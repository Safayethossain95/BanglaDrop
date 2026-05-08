import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../assets/images/logo.png";
import { apiFetch } from "../lib/api";
import { getDefaultRouteForRole, setStoredAuth, type AuthUser } from "../lib/auth";

type RegisterResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<RegisterResponse>("/api/auth/register", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify(form)
      });

      setStoredAuth({
        token: data.token,
        user: data.user
      });

      navigate(getDefaultRouteForRole(data.user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={logoImage} alt="BanglaDrop logo" className="w-12 h-12 rounded-xl object-cover mb-4 shadow-sm" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Your BanglaDrop Account</h1>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Start with an admin account. A super admin can later change your role to supplier or super admin.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400"
              placeholder="agent@bangladrop.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400"
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400"
              placeholder="At least 6 characters"
            />
          </div>

          {error ? (
            <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

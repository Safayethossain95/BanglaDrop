import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login delay
    setTimeout(() => {
      setLoading(false);
      if (email.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to BongoDrop</h1>
          <p className="text-sm text-slate-500 mt-2 text-center">Login to your verified agent account to manage your COD dropshipping business.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400"
              placeholder="agent@bongodrop.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border outline-none transition-all placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-sm text-slate-600">Remember me</span>
            </label>
            <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 mt-4"
          >
            {loading ? (
               <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          Not a verified agent yet? <a href="#" className="font-medium text-teal-600 hover:text-teal-700">Apply here</a>
        </div>
        <div className="mt-2 text-center text-xs text-slate-400">
          To test Admin Dashboard, use <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">admin@bongodrop.com</span>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Network Online • Payments processed via COD
      </div>
    </div>
  );
}

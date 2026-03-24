import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Train, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";

const BG = "https://images.unsplash.com/photo-1760572938662-adffc9db226c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwc3BlZWQlMjB0cmFpbiUyMHRyYXZlbCUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NzM4MTUxOTV8MA&ixlib=rb-4.1.0&q=80&w=1080";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = passwordStrength();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const ok = await register(form.name, form.email, form.phone, form.password);
    setLoading(false);
    if (ok) navigate("/");
    else setError("Registration failed. Please try again.");
  };

  const perks = [
    "Instant PNR confirmation",
    "Easy cancellation & refunds",
    "Real-time train tracking",
    "Exclusive member discounts",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img src={BG} alt="Train" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-blue-900/75 to-slate-900/80" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Train className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
              PickMy<span className="text-blue-300">Train</span>
            </span>
          </div>
          <div className="space-y-8">
            <div>
              <h1 className="text-white text-4xl" style={{ fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
                Join Millions of<br />Happy Travelers
              </h1>
              <p className="text-blue-200 mt-4" style={{ fontWeight: 400 }}>
                Create a free account and unlock exclusive benefits for your train journeys across India.
              </p>
            </div>
            <div className="space-y-3">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-white/90 text-sm">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 text-xl" style={{ fontWeight: 700 }}>
              PickMy<span className="text-blue-600">Train</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-slate-900 text-3xl" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Create account</h2>
            <p className="text-slate-500 mt-2">Start your journey with us today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm text-slate-700" style={{ fontWeight: 600 }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm text-slate-700" style={{ fontWeight: 600 }}>Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm text-slate-700" style={{ fontWeight: 600 }}>Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm text-slate-700" style={{ fontWeight: 600 }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Min. 8 chars"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm text-slate-700" style={{ fontWeight: 600 }}>Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) => update("confirm", e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-slate-200"}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Password strength: <span style={{ fontWeight: 600 }} className={strength >= 3 ? "text-emerald-600" : strength >= 2 ? "text-yellow-600" : "text-red-500"}>{strengthLabel}</span>
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500">
              By creating an account, you agree to our{" "}
              <button type="button" className="text-blue-600" style={{ fontWeight: 500 }}>Terms of Service</button>
              {" "}and{" "}
              <button type="button" className="text-blue-600" style={{ fontWeight: 500 }}>Privacy Policy</button>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700" style={{ fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Train, Eye, EyeOff, Mail, Lock, User, Phone,
  ArrowRight, Loader2, CheckCircle2, ShieldCheck, RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sendOTPFn, verifyOTPFn } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";

const BG = "https://images.unsplash.com/photo-1760572938662-adffc9db226c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwc3BlZWQlMjB0cmFpbiUyMHRyYXZlbCUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NzM4MTUxOTV8MA&ixlib=rb-4.1.0&q=80&w=1080";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (field === "email") {
      setOtpSent(false);
      setOtpVerified(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setResendTimer(0);
    }
  };

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSendOTP = async () => {
    if (!isValidEmail(form.email)) { setOtpError("Enter a valid email address first."); return; }
    setOtpSending(true);
    setOtpError("");
    try {
      await sendOTPFn({ email: form.email.trim(), purpose: "emailVerification" });
      setOtpSent(true);
      setOtp(Array(OTP_LENGTH).fill(""));
      setResendTimer(RESEND_SECONDS);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setOtpError("Failed to send OTP. Please try again.");
    }
    setOtpSending(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError("");
    if (value && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (digits.length === OTP_LENGTH) {
      setOtp(digits.split(""));
      otpRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) { setOtpError("Enter the full 6-digit OTP."); return; }
    setOtpVerifying(true);
    setOtpError("");
    try {
      const result: any = await verifyOTPFn({ email: form.email.trim(), otp: code, purpose: "emailVerification" });
      if (result.data?.success) {
        setOtpVerified(true);
      } else {
        setOtpError(result.data?.reason || "Incorrect OTP. Please try again.");
      }
    } catch {
      setOtpError("Incorrect OTP. Please try again.");
    }
    setOtpVerifying(false);
  };

  // Password strength
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields."); return;
    }
    if (!otpVerified) {
      setError("Please verify your email address before creating an account."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
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
              <p className="text-blue-200 mt-4">
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
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
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

            {/* Email + Send OTP */}
            <div className="space-y-2">
              <label className="text-sm text-slate-700" style={{ fontWeight: 600 }}>Email address</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="rahul@example.com"
                    disabled={otpVerified}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                {!otpVerified ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpSending || !isValidEmail(form.email)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontWeight: 600 }}
                  >
                    {otpSending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : otpSent ? "Resend" : "Send OTP"}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span style={{ fontWeight: 600 }}>Verified</span>
                  </div>
                )}
              </div>

              {/* OTP box */}
              <AnimatePresence>
                {otpSent && !otpVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-4 mt-2">
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">
                          OTP sent to <span style={{ fontWeight: 600 }}>{form.email}</span>. Enter it below to verify.
                        </p>
                      </div>

                      {/* 6-digit OTP boxes */}
                      <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => { otpRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className={`w-11 h-12 text-center text-lg rounded-xl border-2 bg-white text-slate-900 focus:outline-none transition-all ${
                              otpError
                                ? "border-red-300 focus:border-red-500"
                                : digit
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 focus:border-blue-500"
                            }`}
                            style={{ fontWeight: 700 }}
                          />
                        ))}
                      </div>

                      {otpError && (
                        <p className="text-xs text-red-500 text-center" style={{ fontWeight: 500 }}>{otpError}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={resendTimer > 0 || otpSending}
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          <RefreshCw className="w-3 h-3" />
                          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                        </button>

                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={otp.join("").length < OTP_LENGTH || otpVerifying}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ fontWeight: 600 }}
                        >
                          {otpVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm OTP"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Phone */}
            <div className="space-y-2">
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

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-4">
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
                  Password strength:{" "}
                  <span style={{ fontWeight: 600 }} className={strength >= 3 ? "text-emerald-600" : strength >= 2 ? "text-yellow-600" : "text-red-500"}>
                    {strengthLabel}
                  </span>
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500">
              By creating an account, you agree to our{" "}
              <button type="button" className="text-blue-600" style={{ fontWeight: 500 }}>Terms of Service</button>
              {" "}and{" "}
              <button type="button" className="text-blue-600" style={{ fontWeight: 500 }}>Privacy Policy</button>.
            </p>

            {/* Submit — disabled until email is OTP-verified */}
            <button
              type="submit"
              disabled={loading || !otpVerified}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {otpVerified ? "Create Account" : "Verify email to continue"}
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

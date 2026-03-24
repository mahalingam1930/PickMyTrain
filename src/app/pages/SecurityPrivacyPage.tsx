import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Shield, Lock, Smartphone, Eye, EyeOff, ChevronLeft,
  CheckCircle, AlertCircle, Key
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../../lib/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "motion/react";

export default function SecurityPrivacyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [twoFALoaded, setTwoFALoaded] = useState(false);

  // Load 2FA status from Firestore
  if (!twoFALoaded && user) {
    setTwoFALoaded(true);
    getDoc(doc(db, "users", user.id)).then((snap) => {
      if (snap.exists()) {
        setTwoFAEnabled(snap.data()?.twoFAEnabled ?? false);
      }
    });
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordLoading(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) throw new Error("Not authenticated");

      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);

      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setPasswordMsg({ type: "error", text: "Current password is incorrect." });
      } else if (code === "auth/too-many-requests") {
        setPasswordMsg({ type: "error", text: "Too many attempts. Please try again later." });
      } else {
        setPasswordMsg({ type: "error", text: "Failed to update password. Please try again." });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!user) return;
    setTwoFALoading(true);
    setTwoFAMsg(null);
    try {
      const newValue = !twoFAEnabled;
      const ref = doc(db, "users", user.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { twoFAEnabled: newValue });
      } else {
        await setDoc(ref, { twoFAEnabled: newValue }, { merge: true });
      }
      setTwoFAEnabled(newValue);
      setTwoFAMsg({
        type: "success",
        text: newValue ? "Two-factor authentication enabled." : "Two-factor authentication disabled.",
      });
      setTimeout(() => setTwoFAMsg(null), 3000);
    } catch {
      setTwoFAMsg({ type: "error", text: "Failed to update 2FA setting." });
    } finally {
      setTwoFALoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 pb-20 pt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm" style={{ fontWeight: 500 }}>Back to Profile</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl" style={{ fontWeight: 800 }}>Security & Privacy</h1>
              <p className="text-blue-200 text-sm">Manage your password and account security</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-12 pb-10 space-y-5">

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <Key className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400" style={{ fontWeight: 700 }}>CHANGE PASSWORD</span>
          </div>

          <form onSubmit={handleChangePassword} className="p-5 space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>
                CURRENT PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>
                NEW PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {newPassword && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        newPassword.length >= i * 3
                          ? newPassword.length >= 10 ? "bg-emerald-500" : newPassword.length >= 7 ? "bg-yellow-400" : "bg-red-400"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-slate-400 ml-1">
                    {newPassword.length >= 10 ? "Strong" : newPassword.length >= 7 ? "Medium" : "Weak"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>
                CONFIRM NEW PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Message */}
            {passwordMsg && (
              <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
                passwordMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}>
                {passwordMsg.type === "success"
                  ? <CheckCircle className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />}
                {passwordMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors disabled:opacity-60"
              style={{ fontWeight: 600 }}
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </motion.div>

        {/* 2FA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400" style={{ fontWeight: 700 }}>TWO-FACTOR AUTHENTICATION</span>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Enable 2FA</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add an extra layer of security to your account. You'll be asked for a verification code on login.
                </p>
              </div>
              <button
                onClick={handleToggle2FA}
                disabled={twoFALoading}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
                  twoFAEnabled ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    twoFAEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {twoFAMsg && (
              <div className={`mt-3 flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
                twoFAMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}>
                {twoFAMsg.type === "success"
                  ? <CheckCircle className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />}
                {twoFAMsg.text}
              </div>
            )}

            {twoFAEnabled && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700" style={{ fontWeight: 600 }}>2FA is active</p>
                <p className="text-xs text-blue-600 mt-1">
                  Your account is protected with two-factor authentication. A verification code will be sent to <strong>{user?.email}</strong> on each login.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400" style={{ fontWeight: 700 }}>ACCOUNT INFO</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm text-slate-900" style={{ fontWeight: 500 }}>{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Account ID</span>
              <span className="text-xs text-slate-400 font-mono">{user?.id?.slice(0, 16)}…</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bell, ChevronLeft, Mail, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { motion } from "motion/react";

interface NotificationSettings {
  emailBookingConfirmation: boolean;
  emailCancellation: boolean;
  emailOffers: boolean;
  smsBookingConfirmation: boolean;
  smsCancellation: boolean;
  smsOffers: boolean;
}

const defaultSettings: NotificationSettings = {
  emailBookingConfirmation: true,
  emailCancellation: true,
  emailOffers: false,
  smsBookingConfirmation: true,
  smsCancellation: true,
  smsOffers: false,
};

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.id)).then((snap) => {
      if (snap.exists() && snap.data().notifications) {
        setSettings({ ...defaultSettings, ...snap.data().notifications });
      }
      setLoading(false);
    });
  }, [user]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMsg(null);
    try {
      const ref = doc(db, "users", user.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { notifications: settings });
      } else {
        await setDoc(ref, { notifications: settings }, { merge: true });
      }
      setMsg({ type: "success", text: "Notification preferences saved." });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to save preferences." });
    } finally {
      setSaving(false);
    }
  };

  const emailOptions = [
    { key: "emailBookingConfirmation" as const, label: "Booking Confirmation", desc: "Get notified when your booking is confirmed" },
    { key: "emailCancellation" as const, label: "Cancellation Updates", desc: "Get notified when a booking is cancelled" },
    { key: "emailOffers" as const, label: "Offers & Promotions", desc: "Receive discount codes and special offers" },
  ];

  const smsOptions = [
    { key: "smsBookingConfirmation" as const, label: "Booking Confirmation", desc: "SMS alert when your booking is confirmed" },
    { key: "smsCancellation" as const, label: "Cancellation Updates", desc: "SMS alert when a booking is cancelled" },
    { key: "smsOffers" as const, label: "Offers & Promotions", desc: "Receive promotional SMS messages" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 pb-20 pt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate("/profile")} className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm" style={{ fontWeight: 500 }}>Back to Profile</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl" style={{ fontWeight: 800 }}>Notification Settings</h1>
              <p className="text-blue-200 text-sm">Manage your email and SMS preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-12 pb-10 space-y-5">

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-56 bg-slate-100 rounded" />
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Email Notifications */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400" style={{ fontWeight: 700 }}>EMAIL NOTIFICATIONS</span>
              </div>
              <div className="divide-y divide-slate-100">
                {emailOptions.map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between px-5 py-4">
                    <div className="flex-1 pr-4">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(opt.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${settings[opt.key] ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${settings[opt.key] ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SMS Notifications */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400" style={{ fontWeight: 700 }}>SMS NOTIFICATIONS</span>
              </div>
              <div className="divide-y divide-slate-100">
                {smsOptions.map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between px-5 py-4">
                    <div className="flex-1 pr-4">
                      <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(opt.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${settings[opt.key] ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${settings[opt.key] ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {msg && (
              <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                {msg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {msg.text}
              </div>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
              style={{ fontWeight: 600 }}
            >
              {saving ? "Saving..." : "Save Preferences"}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}

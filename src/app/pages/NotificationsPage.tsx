import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Bell, ChevronLeft, CheckCircle2, Ticket, Tag, Info, Settings, Trash2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, getDocs
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

interface Notification {
  id: string;
  type: "booking_confirmed" | "booking_cancelled" | "pnr_update" | "offer" | "info";
  title: string;
  message: string;
  createdAt: { seconds: number };
  read: boolean;
}

const typeConfig = {
  booking_confirmed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  booking_cancelled: { icon: Ticket, color: "text-red-500", bg: "bg-red-50" },
  pnr_update: { icon: Ticket, color: "text-blue-600", bg: "bg-blue-50" },
  offer: { icon: Tag, color: "text-orange-500", bg: "bg-orange-50" },
  info: { icon: Info, color: "text-slate-500", bg: "bg-slate-100" },
};

function timeAgo(seconds: number) {
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(seconds * 1000).toLocaleDateString();
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.id, "notifications"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(notifs);
      setLoading(false);

      // Mark all unread as read when page is opened
      const unread = snap.docs.filter((d) => !d.data().read);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach((d) => batch.update(d.ref, { read: true }));
        batch.commit();
      }
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications
      .filter((n) => !n.read)
      .forEach((n) => batch.update(doc(db, "users", user.id, "notifications", n.id), { read: true }));
    await batch.commit();
  };

  const markRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.id, "notifications", id), { read: true });
  };

  const clearAll = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, "users", user.id, "notifications"));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 pb-20 pt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm" style={{ fontWeight: 500 }}>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center relative">
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center" style={{ fontWeight: 700 }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-white text-2xl" style={{ fontWeight: 800 }}>Notifications</h1>
                <p className="text-blue-200 text-sm">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/notification-settings")}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-12 pb-10 space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-lg p-10 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-800 font-semibold">No notifications yet</p>
              <p className="text-slate-400 text-sm mt-1">Booking updates and alerts will appear here.</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Actions row */}
            <div className="flex items-center justify-between pt-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Mark all as read
                </button>
              )}
              <button
                onClick={clearAll}
                className="ml-auto flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden"
            >
              <AnimatePresence initial={false}>
                {notifications.map((n, idx) => {
                  const cfg = typeConfig[n.type] ?? typeConfig.info;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => !n.read && markRead(n.id)}
                      className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                        idx < notifications.length - 1 ? "border-b border-slate-100" : ""
                      } ${!n.read ? "bg-blue-50/40" : ""}`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!n.read ? "text-slate-900 font-semibold" : "text-slate-700 font-medium"}`}>
                            {n.title}
                          </p>
                          <span className="text-xs text-slate-400 shrink-0 mt-0.5">
                            {timeAgo(n.createdAt?.seconds ?? 0)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

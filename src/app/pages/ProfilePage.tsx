import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  User, Mail, Phone, Shield, Bell, CreditCard, LogOut, ChevronRight,
  Edit3, Camera, Star, Ticket, ArrowRight, Save, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { motion } from "motion/react";

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const { completedBookings } = useBooking();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateProfile({ name: form.name, phone: form.phone });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const upcomingCount = completedBookings.filter((b) => b.status === "upcoming").length;
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalFare, 0);

  const menuSections = [
    {
      title: "Account",
      items: [
        { icon: Shield, label: "Security & Privacy", desc: "Password, 2FA", path: "/security-privacy" },
        { icon: Bell, label: "Notifications", desc: "Email, SMS alerts", path: undefined },
        { icon: CreditCard, label: "Saved Payment Methods", desc: "Cards, UPI IDs", path: undefined },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: Star, label: "Rate Our App", desc: "Share your feedback", path: undefined },
        { icon: Shield, label: "Help & Support", desc: "FAQs, Contact us", path: undefined },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 pb-20 pt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-white text-2xl" style={{ fontWeight: 800 }}>Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-12 pb-10 space-y-5">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl shadow-lg" style={{ fontWeight: 700 }}>
                  {user?.name?.charAt(0) || "U"}
                </div>
                <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400" style={{ fontWeight: 600 }}>FULL NAME</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400" style={{ fontWeight: 600 }}>PHONE</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm" style={{ fontWeight: 600 }}>
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                      <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm" style={{ fontWeight: 500 }}>
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-slate-900 text-xl" style={{ fontWeight: 700 }}>{user?.name}</h2>
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                        style={{ fontWeight: 500 }}
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      {user?.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                      {user?.phone || form.phone || "+91 —"}
                    </div>
                    {saved && (
                      <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block" style={{ fontWeight: 500 }}>
                        ✓ Profile updated successfully
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border-t border-slate-100">
            {[
              { label: "Bookings", value: completedBookings.length },
              { label: "Upcoming", value: upcomingCount },
              { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}` },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-4 border-r border-slate-100 last:border-r-0">
                <div className="text-slate-900 text-lg" style={{ fontWeight: 700 }}>{stat.value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-0.5"
          >
            <Ticket className="w-8 h-8 text-blue-200" />
            <div className="text-left">
              <div className="text-white text-sm" style={{ fontWeight: 700 }}>My Bookings</div>
              <div className="text-blue-200 text-xs">{completedBookings.length} trips</div>
            </div>
          </button>

          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-emerald-200 transition-all hover:-translate-y-0.5"
          >
            <ArrowRight className="w-8 h-8 text-emerald-200" />
            <div className="text-left">
              <div className="text-white text-sm" style={{ fontWeight: 700 }}>Book Train</div>
              <div className="text-emerald-200 text-xs">500+ routes</div>
            </div>
          </button>
        </motion.div>

        {/* Menu Sections */}
        {menuSections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + si * 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400" style={{ fontWeight: 700 }}>{section.title.toUpperCase()}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.path && navigate(item.path)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all"
          style={{ fontWeight: 600 }}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </motion.button>
      </div>
    </div>
  );
}

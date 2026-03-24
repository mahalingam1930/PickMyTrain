import React, { useState } from "react";
import { Search, Train, Calendar, CheckCircle2, XCircle, Clock, User, Loader2, AlertCircle } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useBooking, CompletedBooking } from "../context/BookingContext";
import { motion } from "motion/react";

const classInfo: Record<string, string> = {
  SL: "Sleeper", "3A": "AC 3 Tier", "2A": "AC 2 Tier", "1A": "AC First Class",
};

const statusConfig = {
  upcoming: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

export default function PNRStatusPage() {
  const { completedBookings } = useBooking();
  const [pnr, setPnr] = useState("");
  const [result, setResult] = useState<CompletedBooking | null | "not_found">(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const trimmed = pnr.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);

    // Check user's own bookings first
    const local = completedBookings.find((b) => b.bookingId.toUpperCase() === trimmed);
    if (local) {
      setResult(local);
      setLoading(false);
      return;
    }

    // Otherwise query Firestore
    try {
      const q = query(collection(db, "bookings"), where("bookingId", "==", trimmed));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = { ...(snap.docs[0].data() as CompletedBooking), bookingId: trimmed };
        setResult(data);
      } else {
        setResult("not_found");
      }
    } catch {
      setResult("not_found");
    }
    setLoading(false);
  };

  const booking = result && result !== "not_found" ? result : null;
  const status = booking ? (statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.upcoming) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl text-white mb-1" style={{ fontWeight: 800 }}>PNR Status</h1>
          <p className="text-blue-200 text-sm">Enter your PNR number to check booking status</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search Box */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <label className="block text-xs text-slate-500 mb-2" style={{ fontWeight: 600 }}>ENTER PNR NUMBER</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. PNR1234567"
              maxLength={12}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg tracking-widest"
              style={{ fontWeight: 600 }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !pnr.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontWeight: 600 }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Check
            </button>
          </div>
        </div>

        {/* Not Found */}
        {result === "not_found" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-700 text-lg" style={{ fontWeight: 600 }}>PNR Not Found</h3>
            <p className="text-slate-400 mt-2 text-sm">No booking found for <span className="font-semibold text-slate-600">{pnr}</span>. Please check and try again.</p>
          </motion.div>
        )}

        {/* Result Card */}
        {booking && status && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-blue-200 text-xs mb-1" style={{ fontWeight: 600 }}>PNR NUMBER</div>
                  <div className="text-xl tracking-widest" style={{ fontWeight: 800 }}>{booking.bookingId}</div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${status.color}`} style={{ fontWeight: 700 }}>
                  <status.icon className="w-3.5 h-3.5" />
                  {status.label}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl" style={{ fontWeight: 800 }}>{booking.selectedTrain?.departure || ""}</div>
                  <div className="text-blue-200 text-sm">{booking.from?.split(" ")[0]}</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-blue-200 text-xs mb-1">{booking.selectedTrain?.duration}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/30" />
                    <Train className="w-4 h-4 text-blue-200" />
                    <div className="flex-1 h-px bg-white/30" />
                  </div>
                  <div className="text-blue-200 text-xs mt-1">{booking.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl" style={{ fontWeight: 800 }}>{booking.selectedTrain?.arrival || ""}</div>
                  <div className="text-blue-200 text-sm">{booking.to?.split(" ")[0]}</div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100">
              {[
                { label: "TRAIN", value: booking.selectedTrain?.name || "—", sub: `#${booking.selectedTrain?.number}` },
                { label: "CLASS", value: classInfo[booking.selectedClass] || booking.selectedClass, sub: booking.selectedClass },
                { label: "DATE", value: booking.date, sub: "" },
                { label: "PASSENGERS", value: String(booking.passengers), sub: "" },
              ].map((f) => (
                <div key={f.label}>
                  <div className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>{f.label}</div>
                  <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{f.value}</div>
                  {f.sub && <div className="text-xs text-slate-500">{f.sub}</div>}
                </div>
              ))}
            </div>

            {/* Passengers */}
            <div className="p-6">
              <h4 className="text-xs text-slate-400 mb-3" style={{ fontWeight: 700 }}>PASSENGER DETAILS</h4>
              <div className="space-y-2">
                {booking.passengerDetails.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm" style={{ fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="text-xs text-slate-500">{p.age} yrs · {p.gender} · {p.berth}</div>
                    </div>
                    {booking.selectedSeats?.[i] && (
                      <div className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700" style={{ fontWeight: 600 }}>
                        {booking.selectedSeats[i]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  Booked on {new Date(booking.bookedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
                <div className="text-base text-blue-600" style={{ fontWeight: 800 }}>₹{booking.totalFare?.toLocaleString()}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Ticket, Calendar, Clock, CheckCircle2,
  XCircle, Train, ChevronDown, ChevronUp, Download, Search, AlertTriangle
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { printTicket } from "../../lib/printTicket";
import { motion, AnimatePresence } from "motion/react";

function getEffectiveStatus(status: string, date: string): string {
  if (status !== "upcoming") return status;
  const journey = new Date(date);
  journey.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return journey < today ? "completed" : "upcoming";
}

const classInfo: Record<string, string> = {
  SL: "Sleeper", "3A": "AC 3 Tier", "2A": "AC 2 Tier", "1A": "AC First Class",
};

const statusConfig = {
  upcoming: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

function BookingSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-6 w-24 bg-slate-200 rounded-full" />
        <div className="h-4 w-32 bg-slate-100 rounded" />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <div className="h-7 w-20 bg-slate-200 rounded" />
        <div className="flex-1 h-px bg-slate-100" />
        <div className="h-7 w-20 bg-slate-200 rounded" />
      </div>
      <div className="flex gap-4">
        <div className="h-4 w-24 bg-slate-100 rounded" />
        <div className="h-4 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const { completedBookings, cancelBooking } = useBooking();
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    setConfirmCancelId(null);
    await cancelBooking(bookingId);
    setCancellingId(null);
  };

  const filtered = completedBookings
    .filter((b) => filter === "all" || getEffectiveStatus(b.status, b.date) === filter)
    .filter((b) =>
      !search ||
      b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      b.from.toLowerCase().includes(search.toLowerCase()) ||
      b.to.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-white" style={{ fontWeight: 800 }}>My Bookings</h1>
              <p className="text-blue-200 mt-1 text-sm">{completedBookings.length} total booking{completedBookings.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 transition-colors text-sm"
              style={{ fontWeight: 600 }}
            >
              <Train className="w-4 h-4" />
              Book New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PNR, route..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "upcoming", "completed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-sm capitalize transition-all ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                }`}
                style={{ fontWeight: filter === f ? 600 : 500 }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {initialLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <BookingSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-700 text-lg" style={{ fontWeight: 600 }}>No bookings found</h3>
            <p className="text-slate-400 mt-2 mb-6 text-sm">
              {filter !== "all" ? `No ${filter} bookings` : "You haven't made any bookings yet"}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
              style={{ fontWeight: 600 }}
            >
              Book Your First Train
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const effectiveStatus = getEffectiveStatus(booking.status, booking.date);
              const status = statusConfig[effectiveStatus as keyof typeof statusConfig] || statusConfig.upcoming;
              const StatusIcon = status.icon;
              const isExpanded = expandedId === booking.bookingId;

              return (
                <div
                  key={booking.bookingId}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Route Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${status.color}`} style={{ fontWeight: 600 }}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </div>
                          <span className="text-slate-400 text-xs">PNR: <span className="text-slate-700" style={{ fontWeight: 700 }}>{booking.bookingId}</span></span>
                          <span className="text-slate-400 text-xs">{classInfo[booking.selectedClass] || booking.selectedClass}</span>
                        </div>

                        {/* Journey */}
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-xl text-slate-900" style={{ fontWeight: 800 }}>{booking.from.split(" ")[0]}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{booking.from}</div>
                          </div>
                          <div className="flex-1 flex flex-col items-center gap-1 max-w-32">
                            <div className="w-full flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                              <div className="flex-1 h-px bg-slate-200" />
                              <Train className="w-4 h-4 text-blue-400" />
                              <div className="flex-1 h-px bg-slate-200" />
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl text-slate-900" style={{ fontWeight: 800 }}>{booking.to.split(" ")[0]}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{booking.to}</div>
                          </div>
                        </div>

                        {/* Date & Passengers */}
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {booking.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span>·</span>
                            {booking.passengers} Passenger{booking.passengers > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 mb-0.5">Total paid</div>
                          <div className="text-xl text-blue-600" style={{ fontWeight: 800 }}>₹{booking.totalFare.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
                      <button
                        onClick={() => printTicket(booking)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm"
                        style={{ fontWeight: 600 }}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>

                      {effectiveStatus === "upcoming" && confirmCancelId !== booking.bookingId && (
                        <button
                          onClick={() => setConfirmCancelId(booking.bookingId)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm"
                          style={{ fontWeight: 500 }}
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      )}

                      {confirmCancelId === booking.bookingId && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="text-xs text-red-700" style={{ fontWeight: 500 }}>Cancel this booking?</span>
                          <button
                            onClick={() => handleCancel(booking.bookingId)}
                            disabled={cancellingId === booking.bookingId}
                            className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 transition-colors disabled:opacity-60"
                            style={{ fontWeight: 600 }}
                          >
                            {cancellingId === booking.bookingId ? "Cancelling..." : "Yes, Cancel"}
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs hover:bg-slate-300 transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            No
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : booking.bookingId)}
                        className="ml-auto flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                        style={{ fontWeight: 500 }}
                      >
                        View Details
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100"
                      >
                        <div className="p-5 bg-slate-50">
                          <h4 className="text-sm text-slate-700 mb-3" style={{ fontWeight: 700 }}>Passenger Details</h4>
                          <div className="space-y-2">
                            {booking.passengerDetails.map((p, pi) => (
                              <div key={pi} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm" style={{ fontWeight: 700 }}>
                                  {pi + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{p.name}</div>
                                  <div className="text-xs text-slate-500">{p.age} yrs · {p.gender} · Berth: {p.berth}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

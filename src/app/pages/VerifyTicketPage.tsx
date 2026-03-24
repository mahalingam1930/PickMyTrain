import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CompletedBooking } from "../context/BookingContext";
import { CheckCircle2, XCircle, Train, Calendar, User, Loader2, ShieldCheck } from "lucide-react";

const classInfo: Record<string, string> = {
  SL: "Sleeper", "3A": "AC 3 Tier", "2A": "AC 2 Tier", "1A": "AC First Class",
};

export default function VerifyTicketPage() {
  const { pnr } = useParams<{ pnr: string }>();
  const [booking, setBooking] = useState<CompletedBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!pnr) { setNotFound(true); setLoading(false); return; }
    (async () => {
      try {
        const q = query(collection(db, "bookings"), where("bookingId", "==", pnr.toUpperCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setBooking({ ...(snap.docs[0].data() as CompletedBooking), bookingId: pnr.toUpperCase() });
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [pnr]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm">Verifying ticket...</p>
        </div>
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl text-slate-900 mb-2" style={{ fontWeight: 700 }}>Ticket Not Found</h2>
          <p className="text-slate-500 text-sm">No booking found for PNR <span className="font-mono font-bold text-slate-700">{pnr}</span>. The ticket may be invalid or cancelled.</p>
        </div>
      </div>
    );
  }

  const isCancelled = booking.status === "cancelled";
  const train = booking.selectedTrain;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white text-center ${isCancelled ? "bg-gradient-to-r from-red-500 to-rose-600" : "bg-gradient-to-r from-emerald-500 to-teal-600"}`}>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            {isCancelled
              ? <XCircle className="w-7 h-7 text-white" />
              : <ShieldCheck className="w-7 h-7 text-white" />}
          </div>
          <h1 className="text-xl mb-1" style={{ fontWeight: 800 }}>
            {isCancelled ? "Ticket Cancelled" : "Ticket Verified"}
          </h1>
          <p className="text-white/80 text-sm">
            {isCancelled ? "This ticket has been cancelled." : "This is a valid PickMyTrain ticket."}
          </p>
        </div>

        {/* Ticket Details */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-0.5" style={{ fontWeight: 600 }}>PNR NUMBER</div>
            <div className="text-xl font-mono text-slate-900" style={{ fontWeight: 800 }}>{booking.bookingId}</div>
          </div>

          {train && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Train className="w-4 h-4 text-blue-600" />
                <span className="text-sm" style={{ fontWeight: 600 }}>{train.name} #{train.number}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">FROM</div>
                  <div className="text-slate-900" style={{ fontWeight: 600 }}>{booking.from?.split(" ").slice(0, 2).join(" ")}</div>
                  <div className="text-blue-600 text-xs" style={{ fontWeight: 600 }}>{train.departure}</div>
                </div>
                <div className="text-slate-300 text-lg">→</div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs mb-0.5">TO</div>
                  <div className="text-slate-900" style={{ fontWeight: 600 }}>{booking.to?.split(" ").slice(0, 2).join(" ")}</div>
                  <div className="text-blue-600 text-xs" style={{ fontWeight: 600 }}>{train.arrival}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar className="w-3.5 h-3.5" />
                {booking.date} &nbsp;·&nbsp; {classInfo[booking.selectedClass] || booking.selectedClass}
              </div>
            </div>
          )}

          {/* Passengers */}
          <div>
            <div className="text-xs text-slate-400 mb-2" style={{ fontWeight: 600 }}>PASSENGERS</div>
            <div className="space-y-2">
              {booking.passengerDetails?.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-600" />
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
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-500">Total Fare</span>
            <span className="text-lg text-emerald-600" style={{ fontWeight: 700 }}>₹{booking.totalFare?.toLocaleString()}</span>
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-slate-400">Verified by PickMyTrain · {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

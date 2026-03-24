import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import QRCode from "react-qr-code";
import {
  CheckCircle2, Download, Share2, Train, Calendar, MapPin, User,
  ArrowRight, Home, Ticket, Clock, Star
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { printTicket } from "../../lib/printTicket";
import { useBookingTimer } from "../hooks/useBookingTimer";
import { motion } from "motion/react";
import confetti from "canvas-confetti";

const classInfo: Record<string, string> = {
  SL: "Sleeper", "3A": "AC 3 Tier", "2A": "AC 2 Tier", "1A": "AC First Class",
};


export default function ConfirmationPage() {
  const { booking, resetBooking } = useBooking();
  const { reset: resetTimer } = useBookingTimer();
  const navigate = useNavigate();
  const confettiDone = useRef(false);

  useEffect(() => {
    resetTimer(); // clear session timer on successful booking
    if (!confettiDone.current) {
      confettiDone.current = true;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.4 },
        colors: ["#2563EB", "#7C3AED", "#10B981", "#F59E0B"],
      });
    }
  }, []);

  const train = booking.selectedTrain;
  const bookingId = booking.bookingId || `PNR${Math.floor(Math.random() * 9000000 + 1000000)}`;
  const totalFare = booking.totalFare;

  if (!train) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No booking found.</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 rounded-xl bg-blue-600 text-white">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl text-white mb-2" style={{ fontWeight: 800 }}>Booking Confirmed!</h1>
            <p className="text-emerald-100">
              Your ticket has been booked successfully. Have a great journey! 🎉
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
        >
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-200 text-xs mb-1" style={{ fontWeight: 600 }}>PNR NUMBER</div>
                <div className="text-2xl tracking-widest" style={{ fontWeight: 800 }}>{bookingId}</div>
              </div>
              <div className="text-right">
                <div className="text-blue-200 text-xs mb-1" style={{ fontWeight: 600 }}>STATUS</div>
                <div className="px-3 py-1.5 rounded-full bg-emerald-400/25 border border-emerald-400/40 text-emerald-300 text-sm" style={{ fontWeight: 700 }}>
                  CONFIRMED
                </div>
              </div>
            </div>

            {/* Journey */}
            <div className="flex items-center gap-4 mt-6">
              <div>
                <div className="text-3xl text-white" style={{ fontWeight: 800 }}>{train.departure}</div>
                <div className="text-blue-200 text-sm">{booking.from?.split(" ").slice(0, 2).join(" ")}</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="text-blue-200 text-xs">{train.duration}</div>
                <div className="w-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
                  <div className="flex-1 h-px bg-white/30" />
                  <Train className="w-5 h-5 text-blue-200" />
                  <div className="flex-1 h-px bg-white/30" />
                  <div className="w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
                </div>
                <div className="text-blue-200 text-xs">{booking.date}</div>
              </div>
              <div className="text-right">
                <div className="text-3xl text-white" style={{ fontWeight: 800 }}>{train.arrival}</div>
                <div className="text-blue-200 text-sm">{booking.to?.split(" ").slice(0, 2).join(" ")}</div>
              </div>
            </div>
          </div>

          {/* Dashed divider */}
          <div className="flex items-center px-6 py-0">
            <div className="w-6 h-6 rounded-full bg-slate-100 -translate-x-6 border border-slate-200 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
            <div className="w-6 h-6 rounded-full bg-slate-100 translate-x-6 border border-slate-200 flex-shrink-0" />
          </div>

          {/* Ticket Body */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Details */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>TRAIN</div>
                    <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{train.name}</div>
                    <div className="text-xs text-slate-500">#{train.number}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>CLASS</div>
                    <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{classInfo[booking.selectedClass]}</div>
                    <div className="text-xs text-slate-500">{booking.selectedClass}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>DATE</div>
                    <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{booking.date}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>PASSENGERS</div>
                    <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{booking.passengers}</div>
                  </div>
                </div>

                {/* Passengers */}
                <div>
                  <div className="text-xs text-slate-400 mb-2" style={{ fontWeight: 600 }}>PASSENGER DETAILS</div>
                  <div className="space-y-2">
                    {booking.passengerDetails.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{p.name}</div>
                          <div className="text-xs text-slate-500">{p.age} yrs · {p.gender} · {p.berth}</div>
                        </div>
                        {booking.selectedSeats[i] && (
                          <div className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700" style={{ fontWeight: 600 }}>
                            {booking.selectedSeats[i]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* QR */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 bg-white rounded-xl border-2 border-slate-200 p-2 flex items-center justify-center">
                  <QRCode
                    value={`${window.location.origin}/verify/${bookingId}`}
                    size={104}
                    bgColor="#ffffff"
                    fgColor="#1e293b"
                  />
                </div>
                <div className="text-xs text-slate-400 text-center">Scan to verify ticket</div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-0.5" style={{ fontWeight: 600 }}>TOTAL PAID</div>
                  <div className="text-2xl text-emerald-600" style={{ fontWeight: 800 }}>₹{totalFare.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => printTicket({ ...booking, bookingId, status: "upcoming", bookedAt: new Date().toISOString(), userId: "" })}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
              style={{ fontWeight: 600 }}
            >
              <Download className="w-4 h-4" />
              Download Ticket
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm" style={{ fontWeight: 600 }}>
              <Share2 className="w-4 h-4" />
              Share Ticket
            </button>
          </div>
        </motion.div>

        {/* Important Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-amber-50 rounded-2xl border border-amber-200 p-5"
        >
          <h3 className="text-amber-900 text-sm mb-3 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
            Important Information
          </h3>
          <ul className="space-y-2 text-sm text-amber-800">
            {[
              "Please carry a valid photo ID proof during travel.",
              "Report to the station at least 30 minutes before departure.",
              "Your e-ticket has been sent to your registered email.",
              "Cancellation is available up to 4 hours before departure.",
            ].map((info, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">•</span>
                {info}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() => { resetBooking(); navigate("/"); }}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={() => navigate("/my-bookings")}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all"
            style={{ fontWeight: 600 }}
          >
            <Ticket className="w-5 h-5" />
            View My Bookings
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

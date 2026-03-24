import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Timer, AlertTriangle, Clock } from "lucide-react";
import { useBookingTimer } from "../hooks/useBookingTimer";
import { useBooking } from "../context/BookingContext";
import { motion, AnimatePresence } from "motion/react";

export default function BookingTimer() {
  const { minutes, seconds, isExpired, isWarning, isDanger, reset } = useBookingTimer();
  const { resetBooking } = useBooking();
  const navigate = useNavigate();
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    if (isExpired) {
      setShowExpired(true);
    }
  }, [isExpired]);

  const handleGoHome = () => {
    reset();
    resetBooking();
    setShowExpired(false);
    navigate("/");
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  const colorClass = isDanger
    ? "bg-red-500/20 border-red-400/40 text-red-200"
    : isWarning
    ? "bg-amber-500/20 border-amber-400/40 text-amber-200"
    : "bg-white/10 border-white/20 text-white";

  return (
    <>
      {/* Session Expired Modal */}
      <AnimatePresence>
        {showExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-slate-900 text-xl mb-2" style={{ fontWeight: 800 }}>Session Expired</h2>
              <p className="text-slate-500 text-sm mb-6">
                Your booking session timed out after 10 minutes. Your entered details have been cleared. Please search again to continue.
              </p>
              <button
                onClick={handleGoHome}
                className="w-full py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                style={{ fontWeight: 700 }}
              >
                Search Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Badge */}
      <AnimatePresence>
        <motion.div
          key={isWarning ? "warn" : "normal"}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${colorClass} ${isDanger ? "animate-pulse" : ""}`}
          style={{ fontWeight: 600 }}
        >
          {isWarning ? (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Timer className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="tabular-nums">
            {pad(minutes)}:{pad(seconds)}
          </span>
          {isWarning && (
            <span className="text-xs hidden sm:inline" style={{ fontWeight: 500 }}>
              {isDanger ? "Expiring!" : "Session ending"}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

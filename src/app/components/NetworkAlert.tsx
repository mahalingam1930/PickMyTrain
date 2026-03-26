import { useState, useEffect, useRef } from "react";
import { WifiOff, X, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNetworkStatus, SignalLevel } from "../hooks/useNetworkStatus";

/* ─── Signal Bars ──────────────────────────────────────────────── */
const barHeights = ["h-2", "h-3", "h-4", "h-5"];

const levelColors: Record<number, { active: string; dot: string; label: string }> = {
  0: { active: "bg-red-500",    dot: "bg-red-500",    label: "Offline"   },
  1: { active: "bg-orange-400", dot: "bg-orange-400", label: "Very Slow" },
  2: { active: "bg-amber-400",  dot: "bg-amber-400",  label: "Slow"      },
  3: { active: "bg-emerald-500",dot: "bg-emerald-500",label: "Good"      },
  4: { active: "bg-emerald-500",dot: "bg-emerald-500",label: "Excellent" },
};

export function SignalBars({ level, className = "" }: { level: SignalLevel; className?: string }) {
  const colors = levelColors[level];
  return (
    <div className={`flex items-end gap-[3px] ${className}`} title={`Signal: ${colors.label}`}>
      {barHeights.map((h, i) => (
        <motion.div
          key={i}
          className={`w-[4px] rounded-full transition-colors duration-300 ${
            i < level ? colors.active : "bg-slate-200"
          } ${h}`}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          style={{ originY: 1 }}
        />
      ))}
    </div>
  );
}

/* ─── Navbar indicator (signal + tooltip) ──────────────────────── */
const pillStyle: Record<number, { bg: string; border: string; text: string; label: string }> = {
  0: { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-600",     label: "Offline"   },
  1: { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-600",  label: "Very Slow" },
  2: { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-600",   label: "Slow"      },
  3: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", label: "Good"      },
  4: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", label: "Excellent" },
};

export function NetworkStatusIndicator() {
  const { isOnline, signalLevel, connectionType, downlink, rtt } = useNetworkStatus();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const pill = pillStyle[signalLevel];
  const dotColor = levelColors[signalLevel].dot;

  return (
    <div
      className="relative hidden md:flex items-center"
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
    >
      {/* Pill chip */}
      <button
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${pill.bg} ${pill.border} transition-all hover:shadow-sm`}
      >
        {/* Animated dot */}
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor} ${isOnline ? "animate-pulse" : ""}`} />
        {/* Signal bars */}
        {isOnline ? (
          <SignalBars level={signalLevel} />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-red-500" />
        )}
        {/* Label */}
        <span className={`text-xs ${pill.text}`} style={{ fontWeight: 600 }}>
          {pill.label}
        </span>
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltipOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50"
          >
            <div className="flex items-center gap-2 mb-3">
              <SignalBars level={signalLevel} />
              <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{pill.label}</span>
              <span className={`ml-auto w-2 h-2 rounded-full ${dotColor} ${isOnline ? "animate-pulse" : ""}`} />
            </div>
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Status</span>
                <span style={{ fontWeight: 600 }} className={isOnline ? "text-emerald-600" : "text-red-500"}>
                  {isOnline ? "Connected" : "Offline"}
                </span>
              </div>
              {connectionType !== "offline" && (
                <div className="flex justify-between">
                  <span>Network</span>
                  <span style={{ fontWeight: 600 }} className="text-slate-700 uppercase">{connectionType}</span>
                </div>
              )}
              {downlink !== null && (
                <div className="flex justify-between">
                  <span>Speed</span>
                  <span style={{ fontWeight: 600 }} className="text-slate-700">{downlink} Mbps</span>
                </div>
              )}
              {rtt !== null && (
                <div className="flex justify-between">
                  <span>Latency</span>
                  <span style={{ fontWeight: 600 }} className="text-slate-700">{rtt} ms</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Offline banner + back-online toast ───────────────────────── */
export default function NetworkAlert() {
  const { isOnline } = useNetworkStatus();
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const prevOnlineRef = useRef(isOnline);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const wasOnline = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    if (!wasOnline && isOnline) {
      // came back online
      setDismissed(false);
      setShowBackOnline(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowBackOnline(false), 3500);
    } else if (wasOnline && !isOnline) {
      // went offline
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowBackOnline(false);
      setDismissed(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOnline]);

  return (
    <AnimatePresence>
      {/* Offline banner — bottom of screen to avoid navbar overlap */}
      {!isOnline && !dismissed && (
        <motion.div
          key="offline"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none"
        >
          <div className="flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-red-300/40 pointer-events-auto max-w-sm w-full">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm" style={{ fontWeight: 600 }}>No internet connection</p>
              <p className="text-red-200 text-xs">Check your network and try again</p>
            </div>
            <button onClick={() => setDismissed(true)} className="text-red-200 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Back online toast — slides up from bottom, auto-closes */}
      {showBackOnline && (
        <motion.div
          key="online"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none"
        >
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-300/40 max-w-sm w-full">
            <Wifi className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm" style={{ fontWeight: 600 }}>Back online</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

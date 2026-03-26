import { useState, useEffect } from "react";

export type SignalLevel = 0 | 1 | 2 | 3 | 4;
export type ConnectionType = "offline" | "slow-2g" | "2g" | "3g" | "4g";

export interface NetworkStatus {
  isOnline: boolean;
  signalLevel: SignalLevel; // 0 = offline, 4 = excellent
  connectionType: ConnectionType;
  downlink: number | null;   // Mbps
  rtt: number | null;        // ms round-trip time
}

function getConnection() {
  return (navigator as any).connection
    || (navigator as any).mozConnection
    || (navigator as any).webkitConnection
    || null;
}

function getSignalLevel(online: boolean, effectiveType?: string, downlink?: number): SignalLevel {
  if (!online) return 0;
  switch (effectiveType) {
    case "slow-2g": return 1;
    case "2g":      return 1;
    case "3g":      return 2;
    case "4g":
      if (downlink !== undefined && downlink >= 5) return 4;
      if (downlink !== undefined && downlink >= 1) return 3;
      return 3;
    default:
      // No Network Information API — just mark as good if online
      return 3;
  }
}

function readStatus(): NetworkStatus {
  const online = navigator.onLine;
  const conn = getConnection();
  const effectiveType: ConnectionType = conn?.effectiveType ?? (online ? "4g" : "offline");
  const downlink: number | null = conn?.downlink ?? null;
  const rtt: number | null = conn?.rtt ?? null;
  return {
    isOnline: online,
    signalLevel: getSignalLevel(online, conn?.effectiveType, downlink ?? undefined),
    connectionType: online ? effectiveType : "offline",
    downlink,
    rtt,
  };
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(readStatus);

  useEffect(() => {
    const update = () => setStatus(readStatus());

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    const conn = getConnection();
    conn?.addEventListener("change", update);

    // Poll every 5 s as a fallback (connection change events aren't always fired)
    const timer = setInterval(update, 5000);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener("change", update);
      clearInterval(timer);
    };
  }, []);

  return status;
}

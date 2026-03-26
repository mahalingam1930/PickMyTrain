import React, { useState } from "react";
import { Search, Train, CheckCircle2, Clock, MapPin, AlertCircle, Circle } from "lucide-react";
import { getTrainStops } from "../../lib/trainStops";

// Known trains for search suggestions
const knownTrains: Record<string, string> = {
  "12951": "Mumbai Rajdhani",
  "12952": "New Delhi Rajdhani",
  "12301": "Howrah Rajdhani",
  "12302": "New Delhi Rajdhani",
  "11301": "Udyan Express",
  "12627": "Karnataka Express",
  "12621": "Tamil Nadu Express",
  "12841": "Coromandel Express",
  "12125": "Pragati Express",
  "12123": "Deccan Queen",
  "12701": "Hussainsagar Express",
  "12027": "Shatabdi Express",
  "12015": "Ajmer Shatabdi",
  "10103": "Mandovi Express",
  "12957": "Rajdhani Express",
  "12723": "Telangana Express",
};

function getStopStatus(stops: ReturnType<typeof getTrainStops>, trainNumber: string) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Use train number as a seed to offset time (simulate different trains at different positions)
  const seed = parseInt(trainNumber.slice(-2)) || 0;
  const offsetMinutes = (seed * 17) % 120 - 60; // -60 to +60 min offset

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const depTime = stop.departure !== "—" ? toMinutes(stop.departure) + offsetMinutes : null;
    const arrTime = stop.arrival !== "—" ? toMinutes(stop.arrival) + offsetMinutes : null;

    if (i === stops.length - 1) {
      // Last stop — check if arrived
      if (arrTime !== null && currentMinutes >= arrTime) return { currentIdx: i, status: "arrived", delay: 0 };
      return { currentIdx: i - 1, status: "running", delay: 0 };
    }

    if (depTime !== null && currentMinutes < depTime) {
      // Train hasn't departed this stop yet
      if (i === 0) return { currentIdx: 0, status: "at_source", delay: Math.max(0, currentMinutes - (toMinutes(stop.departure) + offsetMinutes - 15)) };
      return { currentIdx: i - 1, status: "running", delay: 0 };
    }
  }

  return { currentIdx: stops.length - 1, status: "arrived", delay: 0 };
}

export default function RunningStatusPage() {
  const [trainNumber, setTrainNumber] = useState("");
  const [result, setResult] = useState<{ number: string; name: string } | null>(null);
  const [error, setError] = useState("");

  const handleSearch = () => {
    const num = trainNumber.trim();
    if (!num) return;
    const name = knownTrains[num];
    const stops = getTrainStops(num);
    if (!name || stops.length === 0) {
      setError("Running status not available for this train number.");
      setResult(null);
      return;
    }
    setError("");
    setResult({ number: num, name });
  };

  const stops = result ? getTrainStops(result.number) : [];
  const { currentIdx, status } = result ? getStopStatus(stops, result.number) : { currentIdx: -1, status: "" };

  const statusLabel =
    status === "arrived" ? "Arrived at Destination"
    : status === "at_source" ? "At Source Station"
    : "Running";

  const statusColor =
    status === "arrived" ? "text-emerald-600 bg-emerald-50"
    : status === "at_source" ? "text-blue-600 bg-blue-50"
    : "text-orange-600 bg-orange-50";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Train className="w-6 h-6 text-blue-300" />
            <h1 className="text-2xl" style={{ fontWeight: 700 }}>Running Status</h1>
          </div>
          <p className="text-blue-200 text-sm">Track live position of any train</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <label className="block text-sm text-slate-600 mb-2" style={{ fontWeight: 500 }}>Enter Train Number</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. 12951"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontWeight: 500 }}
            />
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm hover:shadow-lg hover:shadow-blue-200 transition-all"
              style={{ fontWeight: 600 }}
            >
              <Search className="w-4 h-4" />
              Track
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {["12951", "12301", "12841", "12627", "12125"].map((num) => (
              <button
                key={num}
                onClick={() => { setTrainNumber(num); setResult(null); setError(""); }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                style={{ fontWeight: 500 }}
              >
                {num} · {knownTrains[num]}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Result */}
        {result && stops.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Train Header */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-slate-900 text-lg" style={{ fontWeight: 700 }}>{result.name}</h2>
                  <p className="text-slate-400 text-sm">#{result.number}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusColor}`} style={{ fontWeight: 600 }}>
                  {statusLabel}
                </span>
              </div>

              {status === "running" && currentIdx >= 0 && currentIdx < stops.length - 1 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-orange-50 rounded-xl px-4 py-2.5">
                  <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>Between <span style={{ fontWeight: 600 }}>{stops[currentIdx].station}</span> and <span style={{ fontWeight: 600 }}>{stops[currentIdx + 1].station}</span></span>
                </div>
              )}
              {status === "arrived" && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Train has arrived at <span style={{ fontWeight: 600 }}>{stops[stops.length - 1].station}</span></span>
                </div>
              )}
            </div>

            {/* Stops Timeline */}
            <div className="p-5">
              <h3 className="text-sm text-slate-500 mb-4" style={{ fontWeight: 600 }}>ROUTE & HALTS</h3>
              <div className="relative">
                {stops.map((stop, idx) => {
                  const isPassed = idx <= currentIdx;
                  const isCurrent = idx === currentIdx && status === "running";
                  const isSource = idx === 0;
                  const isDest = idx === stops.length - 1;

                  return (
                    <div key={stop.code} className="flex gap-4 items-start">
                      {/* Timeline dot + line */}
                      <div className="flex flex-col items-center" style={{ minWidth: 24 }}>
                        {isCurrent ? (
                          <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-200 mt-0.5 flex-shrink-0 animate-pulse" />
                        ) : isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        ) : isSource || isDest ? (
                          <div className="w-4 h-4 rounded-full bg-slate-300 border-2 border-slate-200 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                        )}
                        {idx < stops.length - 1 && (
                          <div className={`w-0.5 flex-1 my-1 ${isPassed ? "bg-emerald-300" : "bg-slate-200"}`} style={{ minHeight: 32 }} />
                        )}
                      </div>

                      {/* Stop info */}
                      <div className={`flex-1 pb-5 ${idx === stops.length - 1 ? "pb-0" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`text-sm ${isPassed ? "text-slate-800" : "text-slate-500"}`} style={{ fontWeight: isCurrent ? 700 : 600 }}>
                              {stop.station}
                            </span>
                            <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{stop.code}</span>
                            {isCurrent && (
                              <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>● Live</span>
                            )}
                            {stop.day > 1 && (
                              <span className="ml-1 text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">Day {stop.day}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
                            {stop.arrival !== "—" && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Arr <span style={{ fontWeight: 600 }}>{stop.arrival}</span></span>
                              </span>
                            )}
                            {stop.departure !== "—" && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Dep <span style={{ fontWeight: 600 }}>{stop.departure}</span></span>
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{stop.distance} km from origin</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

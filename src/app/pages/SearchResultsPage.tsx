import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, Wifi, Coffee, Zap, Star, ChevronDown,
  ArrowLeftRight, Train, AlertCircle, ChevronUp, Loader2
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { format, parseISO } from "date-fns";

const classInfo: Record<string, string> = {
  SL: "Sleeper", "3A": "AC 3 Tier", "2A": "AC 2 Tier", "1A": "AC First Class",
};

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3.5 h-3.5" />,
  pantry: <Coffee className="w-3.5 h-3.5" />,
  charging: <Zap className="w-3.5 h-3.5" />,
  meals: <span className="text-xs">🍽️</span>,
};

const cityAliases: Record<string, string> = {
  "bangalore": "Bangalore City",
  "bengaluru": "Bangalore City",
  "mumbai": "Mumbai Central",
  "bombay": "Mumbai Central",
  "chennai": "Chennai Central",
  "madras": "Chennai Central",
  "delhi": "New Delhi",
  "new delhi": "New Delhi",
  "calcutta": "Kolkata",
  "kolkata": "Kolkata",
};

function normalizeCity(city: string): string {
  return cityAliases[city.toLowerCase().trim()] || city;
}

type SortKey = "departure" | "duration" | "price" | "rating";

interface TrainDoc {
  id: string;
  number: string;
  name: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  date: string;
  classes: { type: string; label: string; price: number; available: number }[];
  amenities: string[];
  rating: number;
}

export default function SearchResultsPage() {
  const { booking, setBookingField } = useBooking();
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>("departure");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState(booking.travelClass || "SL");
  const [trains, setTrains] = useState<TrainDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      const q = query(
        collection(db, "trains"),
        where("from", "==", normalizeCity(booking.from)),
        where("to", "==", normalizeCity(booking.to))
      );
      const snap = await getDocs(q);
      const results = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<TrainDoc, "id">),
        date: booking.date,
      }));
      setTrains(results);
      setLoading(false);
    };
    if (booking.from && booking.to) fetchTrains();
  }, [booking.from, booking.to, booking.date]);

  const sorted = [...trains].sort((a, b) => {
    if (sort === "departure") return a.departure.localeCompare(b.departure);
    if (sort === "duration") return a.duration.localeCompare(b.duration);
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "price") {
      const pa = a.classes.find((c) => c.type === filterClass)?.price ?? 9999;
      const pb = b.classes.find((c) => c.type === filterClass)?.price ?? 9999;
      return pa - pb;
    }
    return 0;
  });

  const handleSelectTrain = (train: TrainDoc, classType: string) => {
    setBookingField("selectedTrain", { ...train, date: booking.date });
    setBookingField("selectedClass", classType);
    navigate("/seat-selection");
  };

  const formattedDate = booking.date
    ? format(parseISO(booking.date), "EEE, dd MMM yyyy")
    : "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl" style={{ fontWeight: 700 }}>{booking.from}</span>
                <ArrowRight className="w-5 h-5 text-blue-300" />
                <span className="text-xl" style={{ fontWeight: 700 }}>{booking.to}</span>
              </div>
              <div className="flex items-center gap-4 text-blue-200 text-sm">
                <span>{formattedDate}</span>
                <span>·</span>
                <span>{booking.passengers} Passenger{booking.passengers > 1 ? "s" : ""}</span>
                <span>·</span>
                <span>{classInfo[booking.travelClass] || booking.travelClass}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-sm border border-white/20"
              style={{ fontWeight: 500 }}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Modify Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Sort & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <p className="text-slate-500 text-sm">
            <span className="text-slate-900" style={{ fontWeight: 600 }}>{sorted.length} trains</span> found
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Class Filter */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
              {["SL", "3A", "2A", "1A"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setFilterClass(cls)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    filterClass === cls
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  style={{ fontWeight: filterClass === cls ? 600 : 500 }}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
              {(["departure", "duration", "price", "rating"] as SortKey[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all capitalize ${
                    sort === s
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  style={{ fontWeight: sort === s ? 600 : 500 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Train Cards */}
        <div className="space-y-4">
          {sorted.map((train, i) => {
            const selectedClassData = train.classes.find((c) => c.type === filterClass);
            const isExpanded = expandedId === train.id;

            return (
              <motion.div
                key={train.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5">
                  {/* Train Name & Number */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 text-base" style={{ fontWeight: 700 }}>{train.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500" style={{ fontWeight: 500 }}>
                          #{train.number}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-slate-600" style={{ fontWeight: 500 }}>{train.rating}</span>
                        <span className="text-slate-300">·</span>
                        <div className="flex items-center gap-1">
                          {train.amenities.map((a) => (
                            <span key={a} className="text-slate-400">{amenityIcons[a]}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedClassData && (
                      <div className="text-right">
                        <div className="text-2xl text-blue-600" style={{ fontWeight: 800 }}>
                          ₹{(selectedClassData.price * booking.passengers).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          ₹{selectedClassData.price}/person
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Journey Timeline */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl text-slate-900" style={{ fontWeight: 700 }}>{train.departure}</div>
                      <div className="text-xs text-slate-500 mt-1">{train.from.split(" ")[0]}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-xs text-slate-400" style={{ fontWeight: 500 }}>{train.duration}</div>
                      <div className="w-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                        <div className="flex-1 h-px bg-blue-200 relative">
                          <Train className="w-4 h-4 text-blue-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white" />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-slate-400">Non-stop</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-slate-900" style={{ fontWeight: 700 }}>{train.arrival}</div>
                      <div className="text-xs text-slate-500 mt-1">{train.to.split(" ")[0]}</div>
                    </div>
                  </div>

                  {/* Class Pills & Book Button */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex flex-wrap gap-2">
                      {train.classes.map((cls) => (
                        <button
                          key={cls.type}
                          onClick={() => handleSelectTrain(train, cls.type)}
                          className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${
                            cls.type === filterClass
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
                          }`}
                          style={{ fontWeight: 500 }}
                        >
                          <span style={{ fontWeight: 600 }}>{cls.type}</span>
                          <span className="text-slate-400 mx-1">·</span>
                          ₹{cls.price}
                          <span className={`ml-1.5 text-xs ${cls.available < 10 ? "text-red-500" : "text-emerald-600"}`}>
                            ({cls.available})
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : train.id)}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        Details
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleSelectTrain(train, filterClass)}
                        disabled={!selectedClassData}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none text-sm"
                        style={{ fontWeight: 600 }}
                      >
                        Select
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
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
                      <div className="p-5 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {train.classes.map((cls) => (
                          <div key={cls.type} className="bg-white rounded-xl p-4 text-center border border-slate-100">
                            <div className="text-xs text-slate-400 mb-1" style={{ fontWeight: 600 }}>{cls.label}</div>
                            <div className="text-blue-600 text-lg" style={{ fontWeight: 700 }}>₹{cls.price}</div>
                            <div className="text-xs mt-1">
                              <span className={cls.available < 10 ? "text-red-500" : "text-emerald-600"} style={{ fontWeight: 500 }}>
                                {cls.available} seats left
                              </span>
                            </div>
                            <button
                              onClick={() => handleSelectTrain(train, cls.type)}
                              className="mt-2 w-full py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                              style={{ fontWeight: 600 }}
                            >
                              Book
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-slate-500">Searching trains...</p>
          </div>
        )}

        {/* No results */}
        {!loading && sorted.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-700 text-lg" style={{ fontWeight: 600 }}>No trains found</h3>
            <p className="text-slate-400 mt-2">Try changing your date or route</p>
          </div>
        )}
      </div>
    </div>
  );
}

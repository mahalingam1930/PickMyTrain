import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search, ArrowLeftRight, Calendar, Users, ChevronDown, MapPin,
  Zap, Shield, Clock, Star, Tag, ArrowRight, Train
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { popularRoutes, offers, indianCities } from "../data/mockData";
import { motion } from "motion/react";
import { format, addDays, parse } from "date-fns";
import { Calendar as CalendarPicker } from "../components/ui/calendar";

const HERO_BG = "https://images.unsplash.com/photo-1645874197112-11a90125cf4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFpbiUyMHN0YXRpb24lMjBtb2Rlcm4lMjByYWlsd2F5JTIwcGxhdGZvcm18ZW58MXx8fHwxNzczODE1MTk0fDA&ixlib=rb-4.1.0&q=80&w=1080";

const travelClasses = [
  { value: "SL", label: "Sleeper (SL)" },
  { value: "3A", label: "AC 3 Tier (3A)" },
  { value: "2A", label: "AC 2 Tier (2A)" },
  { value: "1A", label: "AC First Class (1A)" },
];

function CityAutocomplete({
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = indianCities.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 6);

  return (
    <div ref={ref} className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 z-10" />
      <input
        type="text"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-5 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
        style={{ fontWeight: 500 }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              onMouseDown={() => { onChange(city); setQuery(city); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
            >
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 text-sm">{city}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { setBookingField, booking } = useBooking();
  const navigate = useNavigate();

  const [from, setFrom] = useState(booking.from || "");
  const [to, setTo] = useState(booking.to || "");
  const [date, setDate] = useState(booking.date || format(addDays(new Date(), 3), "yyyy-MM-dd"));
  const [passengers, setPassengers] = useState(booking.passengers || 1);
  const [travelClass, setTravelClass] = useState(booking.travelClass || "SL");
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const swapCities = () => { const tmp = from; setFrom(to); setTo(tmp); };

  const handleSearch = () => {
    if (!from || !to) return;
    setBookingField("from", from);
    setBookingField("to", to);
    setBookingField("date", date);
    setBookingField("passengers", passengers);
    setBookingField("travelClass", travelClass);
    navigate("/search-results");
  };

  const handleRouteClick = (route: typeof popularRoutes[0]) => {
    setFrom(route.from);
    setTo(route.to);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ minHeight: "520px" }}>
        <img src={HERO_BG} alt="Train" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-blue-900/60 to-slate-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white text-sm mb-6" style={{ fontWeight: 500 }}>
              <Zap className="w-4 h-4 text-yellow-400" />
              Book instantly, travel confidently
            </div>
            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl" style={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Travel India's Rails<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                in Style
              </span>
            </h1>
            <p className="text-blue-100 mt-4 text-lg max-w-xl mx-auto" style={{ fontWeight: 400 }}>
              Book train tickets to 500+ destinations across India. Fast, secure, and seamless.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Resume Booking Banner */}
      {booking.selectedTrain && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-32 relative z-20 mb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm" style={{ fontWeight: 700 }}>You have an unfinished booking</p>
                <p className="text-amber-100 text-xs mt-0.5">
                  {booking.selectedTrain.name} · {booking.from?.split(" ")[0]} → {booking.to?.split(" ")[0]} · {booking.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  if (booking.passengerDetails.length > 0) navigate("/payment");
                  else if (booking.selectedSeats.length > 0) navigate("/passenger-details");
                  else navigate("/seat-selection");
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-amber-600 text-sm hover:bg-amber-50 transition-colors"
                style={{ fontWeight: 700 }}
              >
                Resume <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { sessionStorage.removeItem("pmt_booking_draft"); window.location.reload(); }}
                className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs transition-colors"
                style={{ fontWeight: 500 }}
              >
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search Card - overlapping the hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 overflow-hidden"
        >
          {/* Trip Type Tabs */}
          <div className="flex border-b border-slate-100 px-6 pt-4">
            {(["oneway", "roundtrip"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTripType(type)}
                className={`pb-3 px-4 text-sm mr-2 transition-all border-b-2 ${
                  tripType === type
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
                style={{ fontWeight: tripType === type ? 600 : 500 }}
              >
                {type === "oneway" ? "One Way" : "Round Trip"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* From / To Row */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              {/* From */}
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors relative overflow-hidden">
                <label className="absolute top-2 left-12 text-xs text-slate-400 z-10" style={{ fontWeight: 600 }}>FROM</label>
                <div className="pt-4">
                  <CityAutocomplete value={from} onChange={setFrom} placeholder="Mumbai Central" icon={MapPin} />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={swapCities}
                  className="w-10 h-10 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* To */}
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors relative overflow-hidden">
                <label className="absolute top-2 left-12 text-xs text-slate-400 z-10" style={{ fontWeight: 600 }}>TO</label>
                <div className="pt-4">
                  <CityAutocomplete value={to} onChange={setTo} placeholder="New Delhi" icon={Train} />
                </div>
              </div>
            </div>

            {/* Date / Passengers / Class Row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              {/* Date */}
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors p-4 relative">
                <label className="text-xs text-slate-400 block mb-1" style={{ fontWeight: 600 }}>DEPARTURE DATE</label>
                <button
                  type="button"
                  onClick={() => setDatePickerOpen((o) => !o)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-slate-900" style={{ fontWeight: 500 }}>
                    {date ? format(parse(date, "yyyy-MM-dd", new Date()), "dd MMM yyyy") : "Select date"}
                  </span>
                </button>
                {datePickerOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDatePickerOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                      <CalendarPicker
                        mode="single"
                        selected={date ? parse(date, "yyyy-MM-dd", new Date()) : undefined}
                        onSelect={(day) => {
                          setDate(day ? format(day, "yyyy-MM-dd") : "");
                          setDatePickerOpen(false);
                        }}
                        disabled={{ before: new Date() }}
                        initialFocus
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Passengers */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors p-4">
                <label className="text-xs text-slate-400 block mb-1" style={{ fontWeight: 600 }}>PASSENGERS</label>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:border-blue-300 transition-colors text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-slate-900" style={{ fontWeight: 600 }}>{passengers}</span>
                    <button
                      type="button"
                      onClick={() => setPassengers(Math.min(6, passengers + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:border-blue-300 transition-colors text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Class */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors p-4">
                <label className="text-xs text-slate-400 block mb-1" style={{ fontWeight: 600 }}>CLASS</label>
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-blue-500" />
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="bg-transparent text-slate-900 focus:outline-none appearance-none"
                    style={{ fontWeight: 500 }}
                  >
                    {travelClasses.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!from || !to}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all hover:shadow-xl hover:shadow-blue-300/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{ fontSize: "1rem", fontWeight: 600 }}
            >
              <Search className="w-5 h-5" />
              Search Trains
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Instant Booking", desc: "Book tickets in under 60 seconds with our streamlined flow", color: "text-yellow-500", bg: "bg-yellow-50" },
            { icon: Shield, title: "100% Secure", desc: "Your payments and personal data are fully protected", color: "text-emerald-500", bg: "bg-emerald-50" },
            { icon: Clock, title: "Live Tracking", desc: "Real-time train tracking and PNR status updates", color: "text-blue-500", bg: "bg-blue-50" },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-slate-900 mb-1" style={{ fontSize: "1rem", fontWeight: 600 }}>{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Popular Routes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-900 text-2xl" style={{ fontWeight: 700 }}>Popular Routes</h2>
            <p className="text-slate-500 text-sm mt-1">Most booked destinations this month</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularRoutes.map((route, i) => (
            <motion.button
              key={`${route.from}-${route.to}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleRouteClick(route)}
              className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{route.emoji}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600" style={{ fontWeight: 600 }}>
                  ₹{route.startingPrice}+
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-900" style={{ fontWeight: 600 }}>{route.from}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-slate-900" style={{ fontWeight: 600 }}>{route.to}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-slate-500 text-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>{route.duration}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Offers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="mb-6">
          <h2 className="text-slate-900 text-2xl" style={{ fontWeight: 700 }}>Today's Offers</h2>
          <p className="text-slate-500 text-sm mt-1">Save more on your next journey</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.code}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${offer.color} rounded-2xl p-6 text-white relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Tag className="w-8 h-8 mb-3 opacity-90" />
              <h3 className="text-lg mb-1" style={{ fontWeight: 700 }}>{offer.title}</h3>
              <p className="text-white/80 text-sm mb-4">{offer.description}</p>
              <div className="flex items-center justify-between">
                <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur text-sm" style={{ fontWeight: 600 }}>
                  {offer.code}
                </div>
                <span className="text-white/70 text-xs">Valid till {offer.validTill}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Greeting Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span style={{ fontWeight: 500 }}>Welcome back, {user?.name?.split(" ")[0]}!</span>
            </div>
            <h2 className="text-white text-2xl" style={{ fontWeight: 700 }}>Ready for your next adventure?</h2>
            <p className="text-blue-200 mt-1">You have 2 upcoming trips planned.</p>
          </div>
          <button
            onClick={() => navigate("/my-bookings")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
            style={{ fontWeight: 600 }}
          >
            View My Bookings
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, User, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useBooking, Passenger } from "../context/BookingContext";
import BookingTimer from "../components/BookingTimer";
import { motion } from "motion/react";

const genders = ["Male", "Female", "Other"];
const berths = ["Lower", "Middle", "Upper", "Side Lower", "Side Upper", "No Preference"];

const classInfo: Record<string, string> = {
  SL: "Sleeper", "3A": "AC 3 Tier", "2A": "AC 2 Tier", "1A": "AC First Class",
};

function PassengerForm({
  index,
  passenger,
  onChange,
  onRemove,
  canRemove,
  assignedSeat,
}: {
  index: number;
  passenger: Passenger;
  onChange: (p: Passenger) => void;
  onRemove: () => void;
  canRemove: boolean;
  assignedSeat?: string;
}) {
  const update = (field: keyof Passenger, value: string) => onChange({ ...passenger, [field]: value });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm" style={{ fontWeight: 700 }}>
            {index + 1}
          </div>
          <span className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>
            Passenger {index + 1}
          </span>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>FULL NAME *</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={passenger.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter full name"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>AGE *</label>
          <input
            type="text"
            inputMode="numeric"
            value={passenger.age}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 3);
              if (val === "" || (Number(val) >= 1 && Number(val) <= 120)) update("age", val);
            }}
            placeholder="e.g. 28"
            maxLength={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>GENDER *</label>
          <div className="flex gap-2">
            {genders.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => update("gender", g)}
                className={`flex-1 py-3 rounded-xl text-sm border transition-all ${
                  passenger.gender === g
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300"
                }`}
                style={{ fontWeight: passenger.gender === g ? 600 : 500 }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Berth — show assigned seat if selected, else preference picker */}
        <div className="sm:col-span-2">
          {assignedSeat ? (
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>ASSIGNED SEAT</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm" style={{ fontWeight: 600 }}>
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                {assignedSeat}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>BERTH PREFERENCE</label>
              <div className="flex flex-wrap gap-2">
                {berths.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => update("berth", b)}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                      passenger.berth === b
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300"
                    }`}
                    style={{ fontWeight: passenger.berth === b ? 600 : 500 }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PassengerDetailsPage() {
  const { booking, setBookingField } = useBooking();
  const navigate = useNavigate();

  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    if (booking.passengerDetails.length > 0) return booking.passengerDetails;
    return Array.from({ length: booking.passengers }, (_, i) => {
      const seat = booking.selectedSeats[i];
      const berth = seat ? seat.replace(/.*\((.+)\)/, "$1") : "No Preference";
      return { name: "", age: "", gender: "", berth };
    });
  });

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("+91 ");
  const [errors, setErrors] = useState<string[]>([]);

  const updatePassenger = (i: number, p: Passenger) => {
    const updated = [...passengers];
    updated[i] = p;
    setPassengers(updated);
  };

  const validate = () => {
    const errs: string[] = [];
    passengers.forEach((p, i) => {
      const label = passengers.length > 1 ? `Passenger ${i + 1}` : "Passenger";
      if (!p.name.trim()) errs.push(`${label} — Please enter the full name`);
      if (!p.age) errs.push(`${label} — Please enter the age`);
      if (!p.gender) errs.push(`${label} — Please select a gender`);
    });
    if (!contactEmail.trim()) errs.push("Please enter a contact email address");
    if (!contactPhone || contactPhone.replace(/\D/g, "").length < 10) errs.push("Please enter a valid 10-digit mobile number");
    return errs;
  };

  const handleContinue = () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setBookingField("passengerDetails", passengers);
    const totalFare = (booking.selectedTrain?.classes.find((c) => c.type === booking.selectedClass)?.price || 0) * passengers.length + 30;
    setBookingField("totalFare", totalFare);
    navigate("/payment");
  };

  const train = booking.selectedTrain;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/seat-selection")} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg" style={{ fontWeight: 700 }}>Passenger Details</h2>
                <p className="text-blue-200 text-sm">{train?.name} · {booking.from?.split(" ")[0]} → {booking.to?.split(" ")[0]}</p>
              </div>
            </div>
            <BookingTimer />
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            {["Search", "Select Seats", "Passengers", "Payment", "Confirm"].map((step, i) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-1.5 ${i === 2 ? "text-blue-600" : i < 2 ? "text-emerald-500" : "text-slate-400"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    i === 2 ? "bg-blue-600 text-white" : i < 2 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  }`} style={{ fontWeight: 600 }}>
                    {i < 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs" style={{ fontWeight: i === 2 ? 600 : 400 }}>{step}</span>
                </div>
                {i < 4 && <div className={`flex-1 h-px ${i < 2 ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Passengers */}
          <div className="flex-1 space-y-4">
            {errors.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                <span className="text-red-500 text-lg leading-none">*</span>
                <p className="text-sm text-red-600" style={{ fontWeight: 600 }}>All fields marked with * are required. Please fill them in to continue.</p>
              </div>
            )}

            {passengers.map((p, i) => (
              <PassengerForm
                key={i}
                index={i}
                passenger={p}
                onChange={(p) => updatePassenger(i, p)}
                onRemove={() => {
                  const updated = passengers.filter((_, j) => j !== i);
                  setPassengers(updated);
                }}
                canRemove={passengers.length > 1}
                assignedSeat={booking.selectedSeats[i]}
              />
            ))}

            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                <h3 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Contact Information</h3>
                <p className="text-slate-500 text-xs mt-0.5">Ticket confirmation will be sent here</p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>MOBILE NUMBER *</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* GST (optional) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>GST Details (Optional)</h3>
                  <span className="text-xs text-slate-400">For business travel</span>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>GSTIN</label>
                  <input
                    type="text"
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>COMPANY NAME</label>
                  <input
                    type="text"
                    placeholder="Your company name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:w-72">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm sticky top-24 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Trip Summary</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Train</span>
                  <span className="text-slate-900 text-right" style={{ fontWeight: 500, maxWidth: "60%" }}>{train?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Route</span>
                  <span className="text-slate-900" style={{ fontWeight: 500 }}>{booking.from?.split(" ")[0]} → {booking.to?.split(" ")[0]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-900" style={{ fontWeight: 500 }}>{booking.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Class</span>
                  <span className="text-slate-900" style={{ fontWeight: 500 }}>{classInfo[booking.selectedClass]} ({booking.selectedClass})</span>
                </div>

                {/* Seats */}
                {booking.selectedSeats.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-2" style={{ fontWeight: 600 }}>SELECTED SEATS</p>
                    <div className="space-y-1">
                      {booking.selectedSeats.map((s, i) => (
                        <div key={i} className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5">{s}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fare Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Base fare × {passengers.length}
                    </span>
                    <span className="text-slate-900">
                      ₹{((train?.classes.find((c) => c.type === booking.selectedClass)?.price || 0) * passengers.length).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Service fee</span>
                    <span className="text-slate-900">₹30</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Total</span>
                    <span className="text-blue-600 text-base" style={{ fontWeight: 700 }}>
                      ₹{((train?.classes.find((c) => c.type === booking.selectedClass)?.price || 0) * passengers.length + 30).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
                  style={{ fontWeight: 600 }}
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

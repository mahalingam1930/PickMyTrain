import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import BookingTimer from "../components/BookingTimer";
import { motion } from "motion/react";

type SeatStatus = "available" | "selected" | "occupied" | "ladies";

interface Seat {
  id: string;
  number: string;
  berth: string;
  status: SeatStatus;
}

function generateCoach(coachNum: number, selectedSeats: string[]): Seat[] {
  const berths = ["Lower", "Middle", "Upper", "Side Lower", "Side Upper"];
  const seats: Seat[] = [];
  for (let i = 1; i <= 10; i++) {
    berths.forEach((berth, bi) => {
      const id = `${coachNum}-${i}-${bi}`;
      const number = `${(coachNum - 1) * 50 + (i - 1) * 5 + bi + 1}`;
      let status: SeatStatus = "available";
      if (selectedSeats.includes(id)) status = "selected";
      else if (Math.random() < 0.3) status = "occupied";
      else if (Math.random() < 0.05) status = "ladies";
      seats.push({ id, number, berth, status });
    });
  }
  return seats;
}

const berthColors: Record<SeatStatus, string> = {
  available: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer",
  selected: "bg-blue-600 border-blue-700 text-white cursor-pointer shadow-lg shadow-blue-200",
  occupied: "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
  ladies: "bg-pink-50 border-pink-200 text-pink-600 cursor-not-allowed",
};

const classInfo: Record<string, string> = {
  SL: "Sleeper", "3A": "AC 3 Tier", "2A": "AC 2 Tier", "1A": "AC First Class",
};

export default function SeatSelectionPage() {
  const { booking, setBookingField } = useBooking();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeCoach, setActiveCoach] = useState(1);
  const coaches = [1, 2, 3, 4, 5];
  const [coachSeats, setCoachSeats] = useState<Record<number, Seat[]>>(() => {
    const initial: Record<number, Seat[]> = {};
    coaches.forEach((c) => { initial[c] = generateCoach(c, []); });
    return initial;
  });

  const train = booking.selectedTrain;
  const classType = booking.selectedClass;
  const selectedClassData = train?.classes.find((c) => c.type === classType);
  const maxSeats = booking.passengers;

  const toggleSeat = (seat: Seat) => {
    if (seat.status === "occupied" || seat.status === "ladies") return;
    if (seat.status === "selected") {
      const newSelected = selectedSeats.filter((s) => s !== seat.id);
      setSelectedSeats(newSelected);
      setCoachSeats((prev) => {
        const updated = { ...prev };
        updated[activeCoach] = updated[activeCoach].map((s) =>
          s.id === seat.id ? { ...s, status: "available" } : s
        );
        return updated;
      });
    } else {
      if (selectedSeats.length >= maxSeats) return;
      const newSelected = [...selectedSeats, seat.id];
      setSelectedSeats(newSelected);
      setCoachSeats((prev) => {
        const updated = { ...prev };
        updated[activeCoach] = updated[activeCoach].map((s) =>
          s.id === seat.id ? { ...s, status: "selected" } : s
        );
        return updated;
      });
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length < maxSeats) return;
    const seatDetails = selectedSeats.map((id) => {
      for (const c of Object.values(coachSeats)) {
        const seat = c.find((s) => s.id === id);
        if (seat) return `${seat.number} (${seat.berth})`;
      }
      return id;
    });
    setBookingField("selectedSeats", seatDetails);
    const totalFare = (selectedClassData?.price || 0) * selectedSeats.length;
    setBookingField("totalFare", totalFare);
    navigate("/passenger-details");
  };

  const seats = coachSeats[activeCoach] || [];
  const compartments = [];
  for (let i = 0; i < seats.length; i += 5) {
    compartments.push(seats.slice(i, i + 5));
  }

  const berthTypes = ["Lower", "Middle", "Upper"];
  const sideBerths = ["Side Lower", "Side Upper"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/search-results")} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg" style={{ fontWeight: 700 }}>Select Seats</h2>
                <p className="text-blue-200 text-sm">{train?.name} · {classInfo[classType]} · {booking.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-blue-200 text-xs" style={{ fontWeight: 500 }}>Price per person</div>
                <div className="text-2xl" style={{ fontWeight: 700 }}>₹{selectedClassData?.price?.toLocaleString()}</div>
              </div>
              <BookingTimer />
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            {["Search", "Select Seats", "Passengers", "Payment", "Confirm"].map((step, i) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-1.5 ${i === 1 ? "text-blue-600" : i < 1 ? "text-emerald-500" : "text-slate-400"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    i === 1 ? "bg-blue-600 text-white" : i < 1 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  }`} style={{ fontWeight: 600 }}>
                    {i < 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs" style={{ fontWeight: i === 1 ? 600 : 400 }}>{step}</span>
                </div>
                {i < 4 && <div className={`flex-1 h-px ${i < 1 ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Seat Map */}
          <div className="flex-1">
            {/* Coach Selector */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2">
              <span className="text-sm text-slate-500 flex-shrink-0" style={{ fontWeight: 500 }}>Coach:</span>
              {coaches.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCoach(c)}
                  className={`px-4 py-2 rounded-xl text-sm flex-shrink-0 transition-all ${
                    activeCoach === c
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  B{c}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mb-5 p-4 bg-white rounded-xl border border-slate-100">
              {[
                { color: "bg-emerald-100 border border-emerald-300", label: "Available" },
                { color: "bg-blue-600", label: "Selected" },
                { color: "bg-slate-200 border border-slate-300", label: "Occupied" },
                { color: "bg-pink-100 border border-pink-300", label: "Ladies Only" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded ${color}`} />
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </div>

            {/* Compartments */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-sm text-slate-700" style={{ fontWeight: 600 }}>Coach B{activeCoach}</span>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Info className="w-3.5 h-3.5" />
                  Window side →
                </div>
              </div>

              <div className="p-4 space-y-4">
                {compartments.map((comp, ci) => {
                  const mainBerths = comp.filter((s) => berthTypes.includes(s.berth));
                  const sideBeths = comp.filter((s) => sideBerths.includes(s.berth));

                  return (
                    <div key={ci} className="flex gap-3">
                      <div className="flex-shrink-0 w-5 flex items-center justify-center">
                        <span className="text-xs text-slate-400" style={{ fontWeight: 600 }}>{ci + 1}</span>
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-2">
                        {mainBerths.map((seat) => (
                          <motion.button
                            key={seat.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleSeat(seat)}
                            className={`p-2 rounded-xl border text-center transition-all ${berthColors[seat.status]}`}
                            disabled={seat.status === "occupied" || seat.status === "ladies"}
                          >
                            <div className="text-xs" style={{ fontWeight: 700 }}>{seat.number}</div>
                            <div className="text-[10px] mt-0.5 opacity-75">{seat.berth}</div>
                          </motion.button>
                        ))}
                      </div>

                      <div className="flex-shrink-0 w-px bg-slate-200" />

                      <div className="flex-shrink-0 grid grid-cols-1 gap-2 w-20">
                        {sideBeths.map((seat) => (
                          <motion.button
                            key={seat.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleSeat(seat)}
                            className={`p-2 rounded-xl border text-center transition-all ${berthColors[seat.status]}`}
                            disabled={seat.status === "occupied" || seat.status === "ladies"}
                          >
                            <div className="text-xs" style={{ fontWeight: 700 }}>{seat.number}</div>
                            <div className="text-[10px] mt-0.5 opacity-75">{seat.berth}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm sticky top-24 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="text-slate-900 text-base" style={{ fontWeight: 700 }}>Booking Summary</h3>
                <p className="text-slate-500 text-sm mt-0.5">{train?.name}</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Route</span>
                  <span className="text-slate-900" style={{ fontWeight: 500 }}>{booking.from?.split(" ")[0]} → {booking.to?.split(" ")[0]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Class</span>
                  <span className="text-slate-900" style={{ fontWeight: 500 }}>{classInfo[classType]} ({classType})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Passengers</span>
                  <span className="text-slate-900" style={{ fontWeight: 500 }}>{booking.passengers}</span>
                </div>

                {/* Selected Seats */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-600" style={{ fontWeight: 600 }}>Selected Seats</span>
                    <span className="text-sm text-blue-600" style={{ fontWeight: 600 }}>{selectedSeats.length}/{maxSeats}</span>
                  </div>

                  {selectedSeats.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                        <Info className="w-5 h-5" />
                      </div>
                      Select {maxSeats} seat{maxSeats > 1 ? "s" : ""} from the map
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.values(coachSeats).flat().filter((s) => selectedSeats.includes(s.id)).map((seat) => (
                        <div key={seat.id} className="flex items-center justify-between text-sm bg-blue-50 rounded-lg px-3 py-2">
                          <span className="text-blue-700" style={{ fontWeight: 600 }}>Seat {seat.number}</span>
                          <span className="text-blue-500">{seat.berth}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fare */}
                {selectedSeats.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Base fare</span>
                      <span className="text-slate-900">₹{selectedClassData?.price} × {selectedSeats.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Service fee</span>
                      <span className="text-slate-900">₹30</span>
                    </div>
                    <div className="flex justify-between text-base border-t border-slate-100 pt-2">
                      <span className="text-slate-900" style={{ fontWeight: 700 }}>Total</span>
                      <span className="text-blue-600" style={{ fontWeight: 700 }}>₹{((selectedClassData?.price || 0) * selectedSeats.length + 30).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={handleContinue}
                  disabled={selectedSeats.length < maxSeats}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ fontWeight: 600 }}
                >
                  {selectedSeats.length < maxSeats
                    ? `Select ${maxSeats - selectedSeats.length} more seat${maxSeats - selectedSeats.length > 1 ? "s" : ""}`
                    : "Continue to Passengers"}
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

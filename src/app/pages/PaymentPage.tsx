import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, ArrowRight, CreditCard, Smartphone, Building2, Wallet,
  CheckCircle2, Lock, Shield, Tag, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { loadRazorpayScript } from "../../lib/razorpay";
import BookingTimer from "../components/BookingTimer";
import { motion, AnimatePresence } from "motion/react";

type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

const classInfo: Record<string, string> = {
  SL: "Sleeper", "3A": "AC 3 Tier", "2A": "AC 2 Tier", "1A": "AC First Class",
};

const upiApps = ["GPay", "PhonePe", "Paytm", "BHIM"];
const banks = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "PNB"];
const wallets = ["Paytm Wallet", "Amazon Pay", "MobiKwik", "FreeCharge"];

function CardForm() {
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [showCvv, setShowCvv] = useState(false);

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);

  const formatExpiry = (v: string) =>
    v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>CARD NUMBER</label>
        <div className="relative">
          <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={card.number}
            onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>CARDHOLDER NAME</label>
        <input
          type="text"
          value={card.name}
          onChange={(e) => setCard({ ...card, name: e.target.value })}
          placeholder="Name on card"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>EXPIRY DATE</label>
          <input
            type="text"
            value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>CVV</label>
          <div className="relative">
            <input
              type={showCvv ? "text" : "password"}
              value={card.cvv}
              onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
              placeholder="•••"
              maxLength={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        Your card data is encrypted and secure
      </div>
    </div>
  );
}

function UpiForm() {
  const [upiId, setUpiId] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {upiApps.map((app) => (
          <button
            key={app}
            type="button"
            onClick={() => setSelectedApp(app)}
            className={`p-3 rounded-xl border text-xs transition-all ${
              selectedApp === app
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
            }`}
            style={{ fontWeight: selectedApp === app ? 600 : 500 }}
          >
            <div className="text-2xl mb-1">
              {app === "GPay" ? "G" : app === "PhonePe" ? "📱" : app === "Paytm" ? "P" : "🏛"}
            </div>
            {app}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400" style={{ fontWeight: 500 }}>OR ENTER UPI ID</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      <div className="relative">
        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="username@upi"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const { booking, setBookingField, addCompletedBooking } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");

  const train = booking.selectedTrain;
  const basePrice = (train?.classes.find((c) => c.type === booking.selectedClass)?.price || 0) * booking.passengers;
  const serviceFee = 30;
  const discount = couponApplied ? Math.floor(basePrice * 0.1) : 0;
  const total = basePrice + serviceFee - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "AC10") setCouponApplied(true);
  };

  const completeBooking = async () => {
    const trainId = booking.selectedTrain?.id;
    if (trainId) {
      const trainRef = doc(db, "trains", trainId);
      const trainSnap = await getDoc(trainRef);
      if (trainSnap.exists()) {
        const updatedClasses = (
          trainSnap.data().classes as { type: string; label: string; price: number; available: number }[]
        ).map((c) =>
          c.type === booking.selectedClass
            ? { ...c, available: Math.max(0, c.available - booking.passengers) }
            : c
        );
        await updateDoc(trainRef, { classes: updatedClasses });
      }
    }
    const bookingId = `PNR${Math.floor(Math.random() * 9000000 + 1000000)}`;
    setBookingField("bookingId", bookingId);
    setBookingField("totalFare", total);
    await addCompletedBooking({
      ...booking,
      bookingId,
      status: "upcoming",
      bookedAt: new Date().toISOString(),
    });
    if (user) {
      await addDoc(collection(db, "users", user.id, "notifications"), {
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `Your journey from ${booking.from} to ${booking.to} on ${booking.date} is confirmed. PNR: ${bookingId}`,
        createdAt: serverTimestamp(),
        read: false,
      });
    }
    navigate("/confirmation");
  };

  const handlePay = async () => {
    setProcessing(true);

    const razorpayKey = ((import.meta as unknown) as Record<string, Record<string, string>>).env?.VITE_RAZORPAY_KEY_ID ?? "";
    const isPlaceholderKey = !razorpayKey || razorpayKey === "rzp_test_YOUR_KEY_HERE";

    // If no real key is configured, run in demo mode
    if (isPlaceholderKey) {
      try {
        await completeBooking();
      } catch {
        alert("Booking failed. Please try again.");
        setProcessing(false);
      }
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Failed to load payment gateway. Please check your internet connection.");
      setProcessing(false);
      return;
    }

    try {
      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: total * 100,
        currency: "INR",
        name: "PickMyTrain",
        description: `${booking.from} → ${booking.to} · ${booking.selectedClass}`,
        prefill: {
          name: user?.name || booking.passengerDetails[0]?.name,
          email: user?.email,
        },
        theme: { color: "#2563eb" },
        handler: async () => {
          await completeBooking();
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      });
      rzp.open();
    } catch {
      alert("Payment gateway error. Please try again.");
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { id: "card" as PaymentMethod, label: "Credit / Debit Card", icon: CreditCard },
    { id: "upi" as PaymentMethod, label: "UPI", icon: Smartphone },
    { id: "netbanking" as PaymentMethod, label: "Net Banking", icon: Building2 },
    { id: "wallet" as PaymentMethod, label: "Wallets", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/passenger-details")} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg" style={{ fontWeight: 700 }}>Secure Payment</h2>
                <p className="text-blue-200 text-sm flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  256-bit SSL encrypted
                </p>
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
                <div className={`flex items-center gap-1.5 ${i === 3 ? "text-blue-600" : i < 3 ? "text-emerald-500" : "text-slate-400"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    i === 3 ? "bg-blue-600 text-white" : i < 3 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  }`} style={{ fontWeight: 600 }}>
                    {i < 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="hidden sm:block text-xs" style={{ fontWeight: i === 3 ? 600 : 400 }}>{step}</span>
                </div>
                {i < 4 && <div className={`flex-1 h-px ${i < 3 ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Payment Methods */}
          <div className="flex-1 space-y-4">
            {/* Method Selector */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Choose Payment Method</h3>
              </div>
              <div className="p-3">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl mb-1 transition-all ${
                      method === m.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      method === m.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <span className="text-slate-900 text-sm flex-1 text-left" style={{ fontWeight: method === m.id ? 600 : 500 }}>
                      {m.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      method === m.id ? "border-blue-600" : "border-slate-300"
                    }`}>
                      {method === m.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
                  {paymentMethods.find((m2) => m2.id === method)?.label} Details
                </h3>
              </div>
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={method}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {method === "card" && <CardForm />}
                    {method === "upi" && <UpiForm />}
                    {method === "netbanking" && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {banks.map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-3 rounded-xl border text-sm transition-all ${
                              selectedBank === bank
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
                            }`}
                            style={{ fontWeight: selectedBank === bank ? 600 : 500 }}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    )}
                    {method === "wallet" && (
                      <div className="grid grid-cols-2 gap-3">
                        {wallets.map((wallet) => (
                          <button
                            key={wallet}
                            type="button"
                            onClick={() => setSelectedWallet(wallet)}
                            className={`p-4 rounded-xl border text-sm transition-all ${
                              selectedWallet === wallet
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
                            }`}
                            style={{ fontWeight: selectedWallet === wallet ? 600 : 500 }}
                          >
                            {wallet}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm text-slate-900 mb-3" style={{ fontWeight: 700 }}>Coupon / Promo Code</h3>
              {couponApplied ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="text-emerald-700 text-sm" style={{ fontWeight: 600 }}>AC10 applied!</span>
                    <span className="text-emerald-600 text-sm ml-2">-₹{discount} saved</span>
                  </div>
                  <button onClick={() => { setCouponApplied(false); setCoupon(""); }} className="ml-auto text-xs text-slate-400 hover:text-slate-600">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (try AC10)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm sticky top-24 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Order Summary</h3>
              </div>

              <div className="p-5 space-y-3">
                {/* Journey */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-center flex-1">
                    <div className="text-sm text-slate-900" style={{ fontWeight: 700 }}>{train?.departure}</div>
                    <div className="text-xs text-slate-500">{booking.from?.split(" ")[0]}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-xs text-slate-400">{train?.duration}</div>
                    <div className="w-full h-px bg-slate-300 my-1" />
                    <div className="text-xs text-blue-500" style={{ fontWeight: 500 }}>{booking.selectedClass}</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-sm text-slate-900" style={{ fontWeight: 700 }}>{train?.arrival}</div>
                    <div className="text-xs text-slate-500">{booking.to?.split(" ")[0]}</div>
                  </div>
                </div>

                {/* Passengers */}
                <div>
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between text-sm text-slate-600 py-2"
                    style={{ fontWeight: 500 }}
                  >
                    <span>{booking.passengers} Passenger{booking.passengers > 1 ? "s" : ""}</span>
                    {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {showBreakdown && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="space-y-1.5 pb-2">
                          {booking.passengerDetails.map((p, i) => (
                            <div key={i} className="flex justify-between text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                              <span>{p.name || `Passenger ${i + 1}`}</span>
                              <span style={{ fontWeight: 500 }}>₹{train?.classes.find((c) => c.type === booking.selectedClass)?.price}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Fare Breakdown */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Base fare</span>
                    <span className="text-slate-900">₹{basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Service fee</span>
                    <span className="text-slate-900">₹{serviceFee}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Coupon (AC10)</span>
                      <span className="text-emerald-600">-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-3">
                    <span className="text-slate-900" style={{ fontWeight: 700 }}>Total Amount</span>
                    <span className="text-blue-600 text-lg" style={{ fontWeight: 800 }}>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <div className="px-5 pb-5">
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all hover:shadow-xl hover:shadow-blue-300/40 hover:-translate-y-0.5 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ fontWeight: 700, fontSize: "1rem" }}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ₹{total.toLocaleString()}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  By paying, you agree to our Terms & Conditions
                </p>
              </div>

              {/* Trust Badges */}
              <div className="px-5 pb-5 flex items-center justify-center gap-4">
                {["SSL Secure", "PCI DSS", "RBI Compliant"].map((badge) => (
                  <div key={badge} className="flex items-center gap-1 text-xs text-slate-400">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

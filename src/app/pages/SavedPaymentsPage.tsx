import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CreditCard, ChevronLeft, Plus, Trash2, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
}

interface SavedUPI {
  id: string;
  upiId: string;
}

export default function SavedPaymentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [upis, setUpis] = useState<SavedUPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add card form
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardBrand, setCardBrand] = useState("Visa");

  // Add UPI form
  const [showAddUPI, setShowAddUPI] = useState(false);
  const [upiInput, setUpiInput] = useState("");

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.id)).then((snap) => {
      if (snap.exists()) {
        setCards(snap.data().savedCards || []);
        setUpis(snap.data().savedUPIs || []);
      }
      setLoading(false);
    });
  }, [user]);

  const saveToFirestore = async (newCards: SavedCard[], newUpis: SavedUPI[]) => {
    if (!user) return;
    const ref = doc(db, "users", user.id);
    const snap = await getDoc(ref);
    const data = { savedCards: newCards, savedUPIs: newUpis };
    if (snap.exists()) {
      await updateDoc(ref, data);
    } else {
      await setDoc(ref, data, { merge: true });
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const last4 = cardNumber.replace(/\s/g, "").slice(-4);
    if (last4.length !== 4) {
      setMsg({ type: "error", text: "Please enter a valid card number." });
      return;
    }
    const newCard: SavedCard = { id: Date.now().toString(), last4, brand: cardBrand, expiry: cardExpiry };
    const updated = [...cards, newCard];
    try {
      await saveToFirestore(updated, upis);
      setCards(updated);
      setShowAddCard(false);
      setCardNumber(""); setCardExpiry(""); setCardBrand("Visa");
      setMsg({ type: "success", text: "Card saved successfully." });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to save card." });
    }
  };

  const handleAddUPI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiInput.includes("@")) {
      setMsg({ type: "error", text: "Please enter a valid UPI ID (e.g. name@upi)." });
      return;
    }
    const newUPI: SavedUPI = { id: Date.now().toString(), upiId: upiInput };
    const updated = [...upis, newUPI];
    try {
      await saveToFirestore(cards, updated);
      setUpis(updated);
      setShowAddUPI(false);
      setUpiInput("");
      setMsg({ type: "success", text: "UPI ID saved successfully." });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to save UPI ID." });
    }
  };

  const handleDeleteCard = async (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    await saveToFirestore(updated, upis);
    setCards(updated);
    setMsg({ type: "success", text: "Card removed." });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDeleteUPI = async (id: string) => {
    const updated = upis.filter((u) => u.id !== id);
    await saveToFirestore(cards, updated);
    setUpis(updated);
    setMsg({ type: "success", text: "UPI ID removed." });
    setTimeout(() => setMsg(null), 3000);
  };

  const brandColors: Record<string, string> = {
    Visa: "bg-blue-600",
    Mastercard: "bg-red-500",
    RuPay: "bg-emerald-600",
    Amex: "bg-indigo-600",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 pb-20 pt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate("/profile")} className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm" style={{ fontWeight: 500 }}>Back to Profile</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl" style={{ fontWeight: 800 }}>Saved Payment Methods</h1>
              <p className="text-blue-200 text-sm">Manage your cards and UPI IDs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-12 pb-10 space-y-5">

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-8 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Cards */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400" style={{ fontWeight: 700 }}>SAVED CARDS</span>
                </div>
                <button onClick={() => { setShowAddCard(!showAddCard); setShowAddUPI(false); }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700" style={{ fontWeight: 600 }}>
                  <Plus className="w-4 h-4" /> Add Card
                </button>
              </div>

              <AnimatePresence>
                {showAddCard && (
                  <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddCard} className="overflow-hidden border-b border-slate-100">
                    <div className="p-5 space-y-3 bg-slate-50">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block" style={{ fontWeight: 600 }}>CARD NUMBER</label>
                        <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="**** **** **** 1234"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block" style={{ fontWeight: 600 }}>EXPIRY (MM/YY)</label>
                          <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block" style={{ fontWeight: 600 }}>BRAND</label>
                          <select value={cardBrand} onChange={(e) => setCardBrand(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            {["Visa", "Mastercard", "RuPay", "Amex"].map((b) => <option key={b}>{b}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors" style={{ fontWeight: 600 }}>Save Card</button>
                        <button type="button" onClick={() => setShowAddCard(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm" style={{ fontWeight: 500 }}>Cancel</button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {cards.length === 0 && !showAddCard ? (
                <div className="px-5 py-8 text-center">
                  <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No saved cards</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cards.map((card) => (
                    <div key={card.id} className="flex items-center gap-4 px-5 py-4">
                      <div className={`w-12 h-8 rounded-lg ${brandColors[card.brand] || "bg-slate-400"} flex items-center justify-center`}>
                        <span className="text-white text-xs" style={{ fontWeight: 700 }}>{card.brand.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{card.brand} •••• {card.last4}</p>
                        <p className="text-xs text-slate-500">Expires {card.expiry}</p>
                      </div>
                      <button onClick={() => handleDeleteCard(card.id)} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* UPI */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400" style={{ fontWeight: 700 }}>SAVED UPI IDs</span>
                </div>
                <button onClick={() => { setShowAddUPI(!showAddUPI); setShowAddCard(false); }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700" style={{ fontWeight: 600 }}>
                  <Plus className="w-4 h-4" /> Add UPI
                </button>
              </div>

              <AnimatePresence>
                {showAddUPI && (
                  <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddUPI} className="overflow-hidden border-b border-slate-100">
                    <div className="p-5 space-y-3 bg-slate-50">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block" style={{ fontWeight: 600 }}>UPI ID</label>
                        <input type="text" value={upiInput} onChange={(e) => setUpiInput(e.target.value)} placeholder="yourname@upi"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors" style={{ fontWeight: 600 }}>Save UPI</button>
                        <button type="button" onClick={() => setShowAddUPI(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm" style={{ fontWeight: 500 }}>Cancel</button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {upis.length === 0 && !showAddUPI ? (
                <div className="px-5 py-8 text-center">
                  <Smartphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No saved UPI IDs</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upis.map((upi) => (
                    <div key={upi.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{upi.upiId}</p>
                        <p className="text-xs text-slate-500">UPI ID</p>
                      </div>
                      <button onClick={() => handleDeleteUPI(upi.id)} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {msg && (
              <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                {msg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {msg.text}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../lib/firebase";

export interface Train {
  id: string;
  number: string;
  name: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  date: string;
  classes: {
    type: string;
    label: string;
    price: number;
    available: number;
  }[];
  amenities: string[];
  rating: number;
}

export interface Passenger {
  name: string;
  age: string;
  gender: string;
  berth: string;
}

export interface BookingData {
  from: string;
  to: string;
  date: string;
  passengers: number;
  travelClass: string;
  selectedTrain: Train | null;
  selectedClass: string;
  selectedSeats: string[];
  passengerDetails: Passenger[];
  totalFare: number;
  bookingId?: string;
}

export type CompletedBooking = BookingData & {
  bookingId: string;
  status: string;
  bookedAt: string;
  userId: string;
};

interface BookingContextType {
  booking: BookingData;
  setBookingField: <K extends keyof BookingData>(key: K, value: BookingData[K]) => void;
  resetBooking: () => void;
  completedBookings: CompletedBooking[];
  addCompletedBooking: (b: Omit<CompletedBooking, "userId">) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

const defaultBooking: BookingData = {
  from: "",
  to: "",
  date: "",
  passengers: 1,
  travelClass: "SL",
  selectedTrain: null,
  selectedClass: "",
  selectedSeats: [],
  passengerDetails: [],
  totalFare: 0,
};

const BOOKING_KEY = "pmt_booking_draft";

function loadDraft(): BookingData {
  try {
    const raw = sessionStorage.getItem(BOOKING_KEY);
    if (raw) return { ...defaultBooking, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultBooking;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingData>(loadDraft);
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);

  useEffect(() => {
    let unsubBookings: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubBookings) unsubBookings();

      if (firebaseUser) {
        const q = query(
          collection(db, "bookings"),
          where("userId", "==", firebaseUser.uid)
        );
        unsubBookings = onSnapshot(q, (snapshot) => {
          const bookings = snapshot.docs
            .map((doc) => ({
              ...(doc.data() as CompletedBooking),
              bookingId: doc.data().bookingId || doc.id,
            }))
            .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
          setCompletedBookings(bookings);
        });
      } else {
        setCompletedBookings([]);
      }
    });

    return () => {
      unsubAuth();
      if (unsubBookings) unsubBookings();
    };
  }, []);

  useEffect(() => {
    if (booking.selectedTrain || booking.from) {
      sessionStorage.setItem(BOOKING_KEY, JSON.stringify(booking));
    }
  }, [booking]);

  const setBookingField = <K extends keyof BookingData>(key: K, value: BookingData[K]) => {
    setBooking((prev) => ({ ...prev, [key]: value }));
  };

  const resetBooking = () => {
    sessionStorage.removeItem(BOOKING_KEY);
    setBooking(defaultBooking);
  };

  const cancelBooking = async (bookingId: string) => {
    const b = completedBookings.find((x) => x.bookingId === bookingId);
    if (!b) return;

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(collection(db, "bookings"), where("bookingId", "==", bookingId), where("userId", "==", userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(doc(db, "bookings", snap.docs[0].id), { status: "cancelled" });
      await addDoc(collection(db, "users", userId, "notifications"), {
        type: "booking_cancelled",
        title: "Booking Cancelled",
        message: `Your journey from ${b.from} to ${b.to} on ${b.date} (PNR: ${bookingId}) has been cancelled.`,
        createdAt: serverTimestamp(),
        read: false,
      });
    }

    const trainId = b.selectedTrain?.id;
    if (trainId) {
      const trainRef = doc(db, "trains", trainId);
      const trainSnap = await getDoc(trainRef);
      if (trainSnap.exists()) {
        const updatedClasses = (
          trainSnap.data().classes as { type: string; label: string; price: number; available: number }[]
        ).map((c) =>
          c.type === b.selectedClass
            ? { ...c, available: c.available + b.passengers }
            : c
        );
        await updateDoc(trainRef, { classes: updatedClasses });
      }
    }
  };

  const addCompletedBooking = async (b: Omit<CompletedBooking, "userId">) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, "bookings"), {
      ...b,
      userId,
      bookedAt: b.bookedAt || new Date().toISOString(),
    });
  };

  return (
    <BookingContext.Provider value={{ booking, setBookingField, resetBooking, completedBookings, addCompletedBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

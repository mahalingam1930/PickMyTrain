import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const SEED_VERSION = 2;

const route = (
  from: string, to: string,
  trains: { number: string; name: string; departure: string; arrival: string; duration: string; classes: { type: string; label: string; price: number; available: number }[]; amenities: string[]; rating: number }[]
) => trains.map((t) => ({ ...t, from, to }));

const trainData = [
  // ── Mumbai Central ────────────────────────────────────────────────────────
  ...route("Mumbai Central", "New Delhi", [
    { number: "12951", name: "Mumbai Rajdhani", departure: "16:25", arrival: "08:15", duration: "15h 50m", classes: [{ type: "SL", label: "Sleeper", price: 680, available: 42 }, { type: "3A", label: "AC 3 Tier", price: 1805, available: 18 }, { type: "2A", label: "AC 2 Tier", price: 2565, available: 8 }, { type: "1A", label: "AC First Class", price: 4320, available: 3 }], amenities: ["pantry", "wifi", "charging"], rating: 4.5 },
    { number: "12953", name: "August Kranti Rajdhani", departure: "17:40", arrival: "10:55", duration: "17h 15m", classes: [{ type: "SL", label: "Sleeper", price: 590, available: 65 }, { type: "3A", label: "AC 3 Tier", price: 1560, available: 32 }, { type: "2A", label: "AC 2 Tier", price: 2200, available: 14 }, { type: "1A", label: "AC First Class", price: 3750, available: 6 }], amenities: ["pantry", "charging"], rating: 4.2 },
    { number: "22209", name: "Mumbai Duronto", departure: "23:00", arrival: "15:45", duration: "16h 45m", classes: [{ type: "3A", label: "AC 3 Tier", price: 1920, available: 24 }, { type: "2A", label: "AC 2 Tier", price: 2780, available: 10 }, { type: "1A", label: "AC First Class", price: 4650, available: 2 }], amenities: ["pantry", "wifi", "meals"], rating: 4.7 },
    { number: "19019", name: "Bandra Terminus Express", departure: "06:10", arrival: "07:50", duration: "25h 40m", classes: [{ type: "SL", label: "Sleeper", price: 420, available: 120 }, { type: "3A", label: "AC 3 Tier", price: 1100, available: 56 }, { type: "2A", label: "AC 2 Tier", price: 1580, available: 22 }], amenities: ["pantry"], rating: 3.8 },
  ]),
  ...route("New Delhi", "Mumbai Central", [
    { number: "12952", name: "New Delhi Rajdhani", departure: "16:35", arrival: "08:35", duration: "16h 00m", classes: [{ type: "SL", label: "Sleeper", price: 680, available: 38 }, { type: "3A", label: "AC 3 Tier", price: 1805, available: 20 }, { type: "2A", label: "AC 2 Tier", price: 2565, available: 10 }, { type: "1A", label: "AC First Class", price: 4320, available: 4 }], amenities: ["pantry", "wifi", "charging"], rating: 4.5 },
    { number: "12954", name: "August Kranti Express", departure: "17:25", arrival: "11:05", duration: "17h 40m", classes: [{ type: "SL", label: "Sleeper", price: 590, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 1560, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 2200, available: 15 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "22210", name: "Delhi Duronto", departure: "22:30", arrival: "15:00", duration: "16h 30m", classes: [{ type: "3A", label: "AC 3 Tier", price: 1950, available: 20 }, { type: "2A", label: "AC 2 Tier", price: 2800, available: 8 }], amenities: ["pantry", "wifi", "meals"], rating: 4.6 },
  ]),

  ...route("Mumbai Central", "Bangalore City", [
    { number: "11301", name: "Udyan Express", departure: "08:05", arrival: "06:40", duration: "22h 35m", classes: [{ type: "SL", label: "Sleeper", price: 450, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 1200, available: 40 }, { type: "2A", label: "AC 2 Tier", price: 1720, available: 18 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "16530", name: "Udyan Abha Toofan", departure: "21:45", arrival: "20:30", duration: "22h 45m", classes: [{ type: "SL", label: "Sleeper", price: 410, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 1100, available: 30 }, { type: "2A", label: "AC 2 Tier", price: 1580, available: 12 }], amenities: ["pantry"], rating: 3.8 },
    { number: "11023", name: "Sahyadri Express", departure: "05:50", arrival: "04:15", duration: "22h 25m", classes: [{ type: "SL", label: "Sleeper", price: 390, available: 100 }, { type: "3A", label: "AC 3 Tier", price: 1050, available: 50 }], amenities: ["pantry"], rating: 3.7 },
  ]),
  ...route("Bangalore City", "Mumbai Central", [
    { number: "11302", name: "Udyan Express", departure: "08:20", arrival: "07:00", duration: "22h 40m", classes: [{ type: "SL", label: "Sleeper", price: 450, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 1200, available: 38 }, { type: "2A", label: "AC 2 Tier", price: 1720, available: 15 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "16529", name: "Udyan Abha Express", departure: "20:15", arrival: "19:00", duration: "22h 45m", classes: [{ type: "SL", label: "Sleeper", price: 410, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 1100, available: 35 }], amenities: ["pantry"], rating: 3.8 },
  ]),

  ...route("Mumbai Central", "Chennai Central", [
    { number: "11041", name: "Mumbai Chennai Express", departure: "14:15", arrival: "18:10", duration: "27h 55m", classes: [{ type: "SL", label: "Sleeper", price: 520, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 1380, available: 32 }, { type: "2A", label: "AC 2 Tier", price: 1980, available: 14 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "16331", name: "Trivandrum Express", departure: "11:05", arrival: "16:15", duration: "29h 10m", classes: [{ type: "SL", label: "Sleeper", price: 480, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 1260, available: 42 }], amenities: ["pantry"], rating: 3.7 },
  ]),
  ...route("Chennai Central", "Mumbai Central", [
    { number: "11042", name: "Chennai Mumbai Express", departure: "08:20", arrival: "12:30", duration: "28h 10m", classes: [{ type: "SL", label: "Sleeper", price: 520, available: 65 }, { type: "3A", label: "AC 3 Tier", price: 1380, available: 30 }, { type: "2A", label: "AC 2 Tier", price: 1980, available: 12 }], amenities: ["pantry", "charging"], rating: 3.9 },
    { number: "16332", name: "Trivandrum Mumbai Express", departure: "19:30", arrival: "01:00", duration: "29h 30m", classes: [{ type: "SL", label: "Sleeper", price: 480, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 1260, available: 44 }], amenities: ["pantry"], rating: 3.6 },
  ]),

  ...route("Mumbai Central", "Kolkata", [
    { number: "12321", name: "Howrah Mumbai Mail", departure: "21:50", arrival: "05:30", duration: "31h 40m", classes: [{ type: "SL", label: "Sleeper", price: 580, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 1540, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 2200, available: 16 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "12101", name: "Jnaneswari Super Deluxe", departure: "07:05", arrival: "15:05", duration: "32h 00m", classes: [{ type: "SL", label: "Sleeper", price: 545, available: 60 }, { type: "3A", label: "AC 3 Tier", price: 1440, available: 28 }], amenities: ["pantry"], rating: 3.9 },
  ]),
  ...route("Kolkata", "Mumbai Central", [
    { number: "12322", name: "Mumbai Howrah Mail", departure: "20:05", arrival: "03:15", duration: "31h 10m", classes: [{ type: "SL", label: "Sleeper", price: 580, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 1540, available: 32 }, { type: "2A", label: "AC 2 Tier", price: 2200, available: 14 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "12102", name: "Jnaneswari Express", departure: "08:10", arrival: "17:00", duration: "32h 50m", classes: [{ type: "SL", label: "Sleeper", price: 545, available: 55 }, { type: "3A", label: "AC 3 Tier", price: 1440, available: 25 }], amenities: ["pantry"], rating: 3.8 },
  ]),

  ...route("Mumbai Central", "Hyderabad", [
    { number: "12701", name: "Hussainsagar Express", departure: "21:55", arrival: "13:30", duration: "15h 35m", classes: [{ type: "SL", label: "Sleeper", price: 380, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 1010, available: 42 }, { type: "2A", label: "AC 2 Tier", price: 1450, available: 18 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "17031", name: "Hyderabad Express", departure: "06:30", arrival: "22:30", duration: "16h 00m", classes: [{ type: "SL", label: "Sleeper", price: 350, available: 110 }, { type: "3A", label: "AC 3 Tier", price: 940, available: 50 }], amenities: ["pantry"], rating: 3.7 },
  ]),
  ...route("Hyderabad", "Mumbai Central", [
    { number: "12702", name: "Hussainsagar Express", departure: "16:30", arrival: "08:10", duration: "15h 40m", classes: [{ type: "SL", label: "Sleeper", price: 380, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 1010, available: 40 }, { type: "2A", label: "AC 2 Tier", price: 1450, available: 16 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "17032", name: "Mumbai Express", departure: "18:15", arrival: "10:45", duration: "16h 30m", classes: [{ type: "SL", label: "Sleeper", price: 350, available: 100 }, { type: "3A", label: "AC 3 Tier", price: 940, available: 45 }], amenities: ["pantry"], rating: 3.7 },
  ]),

  ...route("Mumbai Central", "Goa", [
    { number: "10103", name: "Mandovi Express", departure: "07:10", arrival: "19:00", duration: "11h 50m", classes: [{ type: "SL", label: "Sleeper", price: 410, available: 60 }, { type: "3A", label: "AC 3 Tier", price: 1080, available: 25 }, { type: "2A", label: "AC 2 Tier", price: 1540, available: 10 }], amenities: ["pantry", "charging"], rating: 4.3 },
    { number: "12133", name: "Mangala Express", departure: "21:50", arrival: "10:30", duration: "12h 40m", classes: [{ type: "SL", label: "Sleeper", price: 380, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 990, available: 38 }, { type: "2A", label: "AC 2 Tier", price: 1420, available: 14 }], amenities: ["pantry"], rating: 4.0 },
  ]),
  ...route("Goa", "Mumbai Central", [
    { number: "10104", name: "Mandovi Express", departure: "06:30", arrival: "18:20", duration: "11h 50m", classes: [{ type: "SL", label: "Sleeper", price: 410, available: 55 }, { type: "3A", label: "AC 3 Tier", price: 1080, available: 22 }, { type: "2A", label: "AC 2 Tier", price: 1540, available: 8 }], amenities: ["pantry", "charging"], rating: 4.2 },
    { number: "12134", name: "Mangala Express", departure: "20:40", arrival: "09:30", duration: "12h 50m", classes: [{ type: "SL", label: "Sleeper", price: 380, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 990, available: 35 }], amenities: ["pantry"], rating: 3.9 },
  ]),

  ...route("Mumbai Central", "Pune", [
    { number: "12125", name: "Pragati Express", departure: "06:15", arrival: "09:05", duration: "2h 50m", classes: [{ type: "2A", label: "AC 2 Tier", price: 320, available: 45 }, { type: "1A", label: "AC First Class", price: 590, available: 12 }], amenities: ["wifi", "meals"], rating: 4.4 },
    { number: "12127", name: "Intercity Express", departure: "07:55", arrival: "10:55", duration: "3h 00m", classes: [{ type: "SL", label: "Sleeper", price: 110, available: 120 }, { type: "3A", label: "AC 3 Tier", price: 290, available: 55 }, { type: "2A", label: "AC 2 Tier", price: 415, available: 20 }], amenities: ["pantry"], rating: 4.1 },
    { number: "12123", name: "Deccan Queen", departure: "17:10", arrival: "20:35", duration: "3h 25m", classes: [{ type: "SL", label: "Sleeper", price: 125, available: 100 }, { type: "3A", label: "AC 3 Tier", price: 330, available: 48 }, { type: "2A", label: "AC 2 Tier", price: 475, available: 18 }], amenities: ["pantry", "charging"], rating: 4.3 },
  ]),
  ...route("Pune", "Mumbai Central", [
    { number: "12126", name: "Pragati Express", departure: "05:55", arrival: "08:50", duration: "2h 55m", classes: [{ type: "2A", label: "AC 2 Tier", price: 320, available: 40 }, { type: "1A", label: "AC First Class", price: 590, available: 10 }], amenities: ["wifi", "meals"], rating: 4.4 },
    { number: "12128", name: "Intercity Express", departure: "14:50", arrival: "17:55", duration: "3h 05m", classes: [{ type: "SL", label: "Sleeper", price: 110, available: 115 }, { type: "3A", label: "AC 3 Tier", price: 290, available: 50 }, { type: "2A", label: "AC 2 Tier", price: 415, available: 18 }], amenities: ["pantry"], rating: 4.0 },
    { number: "12124", name: "Deccan Queen", departure: "07:15", arrival: "10:25", duration: "3h 10m", classes: [{ type: "SL", label: "Sleeper", price: 125, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 330, available: 45 }], amenities: ["pantry", "charging"], rating: 4.2 },
  ]),

  ...route("Mumbai Central", "Ahmedabad", [
    { number: "12009", name: "Shatabdi Express", departure: "06:25", arrival: "12:15", duration: "5h 50m", classes: [{ type: "2A", label: "AC 2 Tier", price: 580, available: 32 }, { type: "1A", label: "AC First Class", price: 1080, available: 8 }], amenities: ["wifi", "meals", "charging"], rating: 4.5 },
    { number: "12931", name: "Ahmedabad Express", departure: "23:40", arrival: "07:50", duration: "8h 10m", classes: [{ type: "SL", label: "Sleeper", price: 220, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 585, available: 38 }, { type: "2A", label: "AC 2 Tier", price: 840, available: 15 }], amenities: ["pantry", "charging"], rating: 4.0 },
  ]),
  ...route("Ahmedabad", "Mumbai Central", [
    { number: "12010", name: "Shatabdi Express", departure: "15:05", arrival: "21:00", duration: "5h 55m", classes: [{ type: "2A", label: "AC 2 Tier", price: 580, available: 28 }, { type: "1A", label: "AC First Class", price: 1080, available: 6 }], amenities: ["wifi", "meals", "charging"], rating: 4.5 },
    { number: "12932", name: "Mumbai Express", departure: "21:10", arrival: "05:30", duration: "8h 20m", classes: [{ type: "SL", label: "Sleeper", price: 220, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 585, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 840, available: 12 }], amenities: ["pantry", "charging"], rating: 3.9 },
  ]),

  ...route("Mumbai Central", "Surat", [
    { number: "12479", name: "Suryanagari Express", departure: "07:30", arrival: "11:05", duration: "3h 35m", classes: [{ type: "SL", label: "Sleeper", price: 140, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 370, available: 42 }, { type: "2A", label: "AC 2 Tier", price: 530, available: 16 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "22955", name: "Gujarat Express", departure: "15:25", arrival: "19:10", duration: "3h 45m", classes: [{ type: "SL", label: "Sleeper", price: 130, available: 110 }, { type: "3A", label: "AC 3 Tier", price: 350, available: 50 }], amenities: ["pantry"], rating: 3.8 },
  ]),
  ...route("Surat", "Mumbai Central", [
    { number: "12480", name: "Suryanagari Express", departure: "17:00", arrival: "20:45", duration: "3h 45m", classes: [{ type: "SL", label: "Sleeper", price: 140, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 370, available: 40 }, { type: "2A", label: "AC 2 Tier", price: 530, available: 14 }], amenities: ["pantry", "charging"], rating: 3.9 },
    { number: "22956", name: "Gujarat Express", departure: "06:20", arrival: "10:10", duration: "3h 50m", classes: [{ type: "SL", label: "Sleeper", price: 130, available: 100 }, { type: "3A", label: "AC 3 Tier", price: 350, available: 48 }], amenities: ["pantry"], rating: 3.7 },
  ]),

  ...route("Mumbai Central", "Nagpur", [
    { number: "12140", name: "Sevagram Express", departure: "14:20", arrival: "01:25", duration: "11h 05m", classes: [{ type: "SL", label: "Sleeper", price: 310, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 820, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 1175, available: 14 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "12105", name: "Vidarbha Express", departure: "07:05", arrival: "18:30", duration: "11h 25m", classes: [{ type: "SL", label: "Sleeper", price: 290, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 770, available: 40 }], amenities: ["pantry"], rating: 3.8 },
  ]),
  ...route("Nagpur", "Mumbai Central", [
    { number: "12139", name: "Sevagram Express", departure: "20:30", arrival: "07:40", duration: "11h 10m", classes: [{ type: "SL", label: "Sleeper", price: 310, available: 65 }, { type: "3A", label: "AC 3 Tier", price: 820, available: 32 }, { type: "2A", label: "AC 2 Tier", price: 1175, available: 12 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "12106", name: "Vidarbha Express", departure: "06:10", arrival: "17:50", duration: "11h 40m", classes: [{ type: "SL", label: "Sleeper", price: 290, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 770, available: 38 }], amenities: ["pantry"], rating: 3.7 },
  ]),

  ...route("Mumbai Central", "Bhopal", [
    { number: "12155", name: "Bhopal Express", departure: "06:05", arrival: "20:50", duration: "14h 45m", classes: [{ type: "SL", label: "Sleeper", price: 380, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 1010, available: 38 }, { type: "2A", label: "AC 2 Tier", price: 1445, available: 15 }], amenities: ["pantry", "charging"], rating: 3.9 },
    { number: "12723", name: "Telangana Express", departure: "21:20", arrival: "12:25", duration: "15h 05m", classes: [{ type: "SL", label: "Sleeper", price: 360, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 960, available: 45 }], amenities: ["pantry"], rating: 3.7 },
  ]),
  ...route("Bhopal", "Mumbai Central", [
    { number: "12156", name: "Bhopal Express", departure: "18:20", arrival: "09:15", duration: "14h 55m", classes: [{ type: "SL", label: "Sleeper", price: 380, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 1010, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 1445, available: 12 }], amenities: ["pantry", "charging"], rating: 3.8 },
    { number: "12724", name: "Telangana Express", departure: "06:35", arrival: "22:05", duration: "15h 30m", classes: [{ type: "SL", label: "Sleeper", price: 360, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 960, available: 42 }], amenities: ["pantry"], rating: 3.6 },
  ]),

  ...route("Mumbai Central", "Indore", [
    { number: "12961", name: "Avantika Express", departure: "19:55", arrival: "09:30", duration: "13h 35m", classes: [{ type: "SL", label: "Sleeper", price: 350, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 930, available: 40 }, { type: "2A", label: "AC 2 Tier", price: 1330, available: 16 }], amenities: ["pantry", "charging"], rating: 4.2 },
    { number: "12963", name: "Mewar Express", departure: "08:05", arrival: "22:10", duration: "14h 05m", classes: [{ type: "SL", label: "Sleeper", price: 330, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 880, available: 48 }], amenities: ["pantry"], rating: 3.8 },
  ]),
  ...route("Indore", "Mumbai Central", [
    { number: "12962", name: "Avantika Express", departure: "21:05", arrival: "10:55", duration: "13h 50m", classes: [{ type: "SL", label: "Sleeper", price: 350, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 930, available: 38 }, { type: "2A", label: "AC 2 Tier", price: 1330, available: 14 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "12964", name: "Mewar Express", departure: "07:20", arrival: "21:45", duration: "14h 25m", classes: [{ type: "SL", label: "Sleeper", price: 330, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 880, available: 45 }], amenities: ["pantry"], rating: 3.7 },
  ]),

  // ── New Delhi ─────────────────────────────────────────────────────────────
  ...route("New Delhi", "Kolkata", [
    { number: "12301", name: "Howrah Rajdhani", departure: "16:55", arrival: "09:55", duration: "17h 00m", classes: [{ type: "3A", label: "AC 3 Tier", price: 1850, available: 28 }, { type: "2A", label: "AC 2 Tier", price: 2650, available: 12 }, { type: "1A", label: "AC First Class", price: 4450, available: 4 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.8 },
    { number: "12303", name: "Poorva Express", departure: "08:45", arrival: "09:30", duration: "24h 45m", classes: [{ type: "SL", label: "Sleeper", price: 540, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 1420, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 2050, available: 18 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "12305", name: "Kolkata Duronto", departure: "12:25", arrival: "05:10", duration: "16h 45m", classes: [{ type: "3A", label: "AC 3 Tier", price: 1980, available: 20 }, { type: "2A", label: "AC 2 Tier", price: 2860, available: 8 }], amenities: ["pantry", "wifi", "meals"], rating: 4.5 },
  ]),
  ...route("Kolkata", "New Delhi", [
    { number: "12302", name: "New Delhi Rajdhani", departure: "14:05", arrival: "06:15", duration: "16h 10m", classes: [{ type: "3A", label: "AC 3 Tier", price: 1850, available: 26 }, { type: "2A", label: "AC 2 Tier", price: 2650, available: 10 }, { type: "1A", label: "AC First Class", price: 4450, available: 3 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.7 },
    { number: "12304", name: "Poorva Express", departure: "20:15", arrival: "22:25", duration: "26h 10m", classes: [{ type: "SL", label: "Sleeper", price: 540, available: 65 }, { type: "3A", label: "AC 3 Tier", price: 1420, available: 32 }, { type: "2A", label: "AC 2 Tier", price: 2050, available: 15 }], amenities: ["pantry", "charging"], rating: 3.9 },
  ]),

  ...route("New Delhi", "Chennai Central", [
    { number: "12433", name: "Chennai Rajdhani", departure: "06:05", arrival: "10:30", duration: "28h 25m", classes: [{ type: "3A", label: "AC 3 Tier", price: 2100, available: 22 }, { type: "2A", label: "AC 2 Tier", price: 3050, available: 10 }, { type: "1A", label: "AC First Class", price: 5100, available: 3 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.7 },
    { number: "12621", name: "Tamil Nadu Express", departure: "22:30", arrival: "07:40", duration: "33h 10m", classes: [{ type: "SL", label: "Sleeper", price: 640, available: 60 }, { type: "3A", label: "AC 3 Tier", price: 1700, available: 30 }, { type: "2A", label: "AC 2 Tier", price: 2440, available: 12 }], amenities: ["pantry", "charging"], rating: 4.3 },
  ]),
  ...route("Chennai Central", "New Delhi", [
    { number: "12434", name: "New Delhi Rajdhani", departure: "06:10", arrival: "10:20", duration: "28h 10m", classes: [{ type: "3A", label: "AC 3 Tier", price: 2100, available: 20 }, { type: "2A", label: "AC 2 Tier", price: 3050, available: 8 }, { type: "1A", label: "AC First Class", price: 5100, available: 2 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.7 },
    { number: "12622", name: "Tamil Nadu Express", departure: "10:00", arrival: "19:30", duration: "33h 30m", classes: [{ type: "SL", label: "Sleeper", price: 640, available: 55 }, { type: "3A", label: "AC 3 Tier", price: 1700, available: 28 }, { type: "2A", label: "AC 2 Tier", price: 2440, available: 10 }], amenities: ["pantry", "charging"], rating: 4.2 },
  ]),

  ...route("New Delhi", "Bangalore City", [
    { number: "22691", name: "Rajdhani Express", departure: "20:30", arrival: "05:15", duration: "32h 45m", classes: [{ type: "3A", label: "AC 3 Tier", price: 2250, available: 18 }, { type: "2A", label: "AC 2 Tier", price: 3280, available: 8 }, { type: "1A", label: "AC First Class", price: 5480, available: 2 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.6 },
    { number: "12627", name: "Karnataka Express", departure: "22:30", arrival: "08:00", duration: "33h 30m", classes: [{ type: "SL", label: "Sleeper", price: 700, available: 55 }, { type: "3A", label: "AC 3 Tier", price: 1860, available: 26 }, { type: "2A", label: "AC 2 Tier", price: 2680, available: 10 }], amenities: ["pantry", "charging"], rating: 4.1 },
  ]),
  ...route("Bangalore City", "New Delhi", [
    { number: "22692", name: "New Delhi Rajdhani", departure: "20:15", arrival: "05:30", duration: "33h 15m", classes: [{ type: "3A", label: "AC 3 Tier", price: 2250, available: 16 }, { type: "2A", label: "AC 2 Tier", price: 3280, available: 7 }, { type: "1A", label: "AC First Class", price: 5480, available: 2 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.6 },
    { number: "12628", name: "Karnataka Express", departure: "18:30", arrival: "04:10", duration: "33h 40m", classes: [{ type: "SL", label: "Sleeper", price: 700, available: 50 }, { type: "3A", label: "AC 3 Tier", price: 1860, available: 24 }, { type: "2A", label: "AC 2 Tier", price: 2680, available: 9 }], amenities: ["pantry", "charging"], rating: 4.0 },
  ]),

  ...route("New Delhi", "Hyderabad", [
    { number: "12723", name: "Telangana Express", departure: "06:20", arrival: "05:30", duration: "23h 10m", classes: [{ type: "SL", label: "Sleeper", price: 590, available: 65 }, { type: "3A", label: "AC 3 Tier", price: 1560, available: 30 }, { type: "2A", label: "AC 2 Tier", price: 2240, available: 12 }], amenities: ["pantry", "charging"], rating: 4.2 },
    { number: "12707", name: "Andhra Pradesh Express", departure: "14:45", arrival: "14:15", duration: "23h 30m", classes: [{ type: "SL", label: "Sleeper", price: 560, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 1490, available: 40 }], amenities: ["pantry"], rating: 3.9 },
  ]),
  ...route("Hyderabad", "New Delhi", [
    { number: "12724", name: "Telangana Express", departure: "17:30", arrival: "16:40", duration: "23h 10m", classes: [{ type: "SL", label: "Sleeper", price: 590, available: 60 }, { type: "3A", label: "AC 3 Tier", price: 1560, available: 28 }, { type: "2A", label: "AC 2 Tier", price: 2240, available: 10 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "12708", name: "Andhra Pradesh Express", departure: "07:30", arrival: "07:15", duration: "23h 45m", classes: [{ type: "SL", label: "Sleeper", price: 560, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 1490, available: 38 }], amenities: ["pantry"], rating: 3.8 },
  ]),

  ...route("New Delhi", "Jaipur", [
    { number: "12015", name: "Ajmer Shatabdi", departure: "06:05", arrival: "10:35", duration: "4h 30m", classes: [{ type: "2A", label: "AC 2 Tier", price: 540, available: 35 }, { type: "1A", label: "AC First Class", price: 1010, available: 10 }], amenities: ["wifi", "meals", "charging"], rating: 4.5 },
    { number: "12413", name: "Ajmer Express", departure: "15:10", arrival: "20:55", duration: "5h 45m", classes: [{ type: "SL", label: "Sleeper", price: 170, available: 100 }, { type: "3A", label: "AC 3 Tier", price: 450, available: 48 }, { type: "2A", label: "AC 2 Tier", price: 645, available: 20 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "12955", name: "Jaipur Express", departure: "22:25", arrival: "04:55", duration: "6h 30m", classes: [{ type: "SL", label: "Sleeper", price: 155, available: 120 }, { type: "3A", label: "AC 3 Tier", price: 410, available: 55 }], amenities: ["pantry"], rating: 3.8 },
  ]),
  ...route("Jaipur", "New Delhi", [
    { number: "12016", name: "Delhi Shatabdi", departure: "17:50", arrival: "22:20", duration: "4h 30m", classes: [{ type: "2A", label: "AC 2 Tier", price: 540, available: 30 }, { type: "1A", label: "AC First Class", price: 1010, available: 8 }], amenities: ["wifi", "meals", "charging"], rating: 4.5 },
    { number: "12414", name: "Delhi Express", departure: "06:30", arrival: "12:05", duration: "5h 35m", classes: [{ type: "SL", label: "Sleeper", price: 170, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 450, available: 45 }, { type: "2A", label: "AC 2 Tier", price: 645, available: 18 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "12956", name: "Delhi Express Night", departure: "21:45", arrival: "04:20", duration: "6h 35m", classes: [{ type: "SL", label: "Sleeper", price: 155, available: 110 }, { type: "3A", label: "AC 3 Tier", price: 410, available: 52 }], amenities: ["pantry"], rating: 3.7 },
  ]),

  ...route("New Delhi", "Lucknow", [
    { number: "12003", name: "Lucknow Shatabdi", departure: "06:10", arrival: "12:35", duration: "6h 25m", classes: [{ type: "2A", label: "AC 2 Tier", price: 630, available: 30 }, { type: "1A", label: "AC First Class", price: 1180, available: 8 }], amenities: ["wifi", "meals", "charging"], rating: 4.5 },
    { number: "12229", name: "Lucknow Duronto", departure: "10:20", arrival: "17:05", duration: "6h 45m", classes: [{ type: "3A", label: "AC 3 Tier", price: 680, available: 28 }, { type: "2A", label: "AC 2 Tier", price: 990, available: 12 }], amenities: ["pantry", "wifi", "meals"], rating: 4.3 },
    { number: "12419", name: "Gomti Express", departure: "18:30", arrival: "01:10", duration: "6h 40m", classes: [{ type: "SL", label: "Sleeper", price: 195, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 520, available: 42 }, { type: "2A", label: "AC 2 Tier", price: 745, available: 18 }], amenities: ["pantry", "charging"], rating: 4.0 },
  ]),
  ...route("Lucknow", "New Delhi", [
    { number: "12004", name: "Delhi Shatabdi", departure: "16:55", arrival: "23:15", duration: "6h 20m", classes: [{ type: "2A", label: "AC 2 Tier", price: 630, available: 28 }, { type: "1A", label: "AC First Class", price: 1180, available: 7 }], amenities: ["wifi", "meals", "charging"], rating: 4.5 },
    { number: "12420", name: "Gomti Express", departure: "22:20", arrival: "05:15", duration: "6h 55m", classes: [{ type: "SL", label: "Sleeper", price: 195, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 520, available: 40 }, { type: "2A", label: "AC 2 Tier", price: 745, available: 16 }], amenities: ["pantry", "charging"], rating: 3.9 },
  ]),

  ...route("New Delhi", "Chandigarh", [
    { number: "12011", name: "Kalka Shatabdi", departure: "07:40", arrival: "11:00", duration: "3h 20m", classes: [{ type: "2A", label: "AC 2 Tier", price: 410, available: 38 }, { type: "1A", label: "AC First Class", price: 765, available: 10 }], amenities: ["wifi", "meals", "charging"], rating: 4.6 },
    { number: "12029", name: "Amritsar Shatabdi", departure: "16:40", arrival: "20:15", duration: "3h 35m", classes: [{ type: "2A", label: "AC 2 Tier", price: 395, available: 35 }, { type: "1A", label: "AC First Class", price: 740, available: 8 }], amenities: ["wifi", "meals"], rating: 4.4 },
    { number: "12241", name: "Chandigarh Express", departure: "21:45", arrival: "01:35", duration: "3h 50m", classes: [{ type: "SL", label: "Sleeper", price: 120, available: 110 }, { type: "3A", label: "AC 3 Tier", price: 320, available: 55 }, { type: "2A", label: "AC 2 Tier", price: 460, available: 20 }], amenities: ["pantry", "charging"], rating: 4.0 },
  ]),
  ...route("Chandigarh", "New Delhi", [
    { number: "12012", name: "New Delhi Shatabdi", departure: "16:25", arrival: "19:45", duration: "3h 20m", classes: [{ type: "2A", label: "AC 2 Tier", price: 410, available: 34 }, { type: "1A", label: "AC First Class", price: 765, available: 8 }], amenities: ["wifi", "meals", "charging"], rating: 4.6 },
    { number: "12242", name: "Delhi Express", departure: "06:25", arrival: "10:30", duration: "4h 05m", classes: [{ type: "SL", label: "Sleeper", price: 120, available: 105 }, { type: "3A", label: "AC 3 Tier", price: 320, available: 50 }, { type: "2A", label: "AC 2 Tier", price: 460, available: 18 }], amenities: ["pantry", "charging"], rating: 3.9 },
  ]),

  ...route("New Delhi", "Agra", [
    { number: "12001", name: "Bhopal Shatabdi", departure: "06:15", arrival: "08:10", duration: "1h 55m", classes: [{ type: "2A", label: "AC 2 Tier", price: 280, available: 45 }, { type: "1A", label: "AC First Class", price: 525, available: 12 }], amenities: ["wifi", "meals"], rating: 4.6 },
    { number: "12279", name: "Taj Express", departure: "07:15", arrival: "10:00", duration: "2h 45m", classes: [{ type: "SL", label: "Sleeper", price: 85, available: 120 }, { type: "3A", label: "AC 3 Tier", price: 225, available: 55 }, { type: "2A", label: "AC 2 Tier", price: 325, available: 22 }], amenities: ["pantry"], rating: 4.1 },
    { number: "12137", name: "Punjab Mail", departure: "19:55", arrival: "22:40", duration: "2h 45m", classes: [{ type: "SL", label: "Sleeper", price: 80, available: 130 }, { type: "3A", label: "AC 3 Tier", price: 215, available: 60 }], amenities: ["pantry"], rating: 3.9 },
  ]),
  ...route("Agra", "New Delhi", [
    { number: "12002", name: "New Delhi Shatabdi", departure: "20:50", arrival: "22:45", duration: "1h 55m", classes: [{ type: "2A", label: "AC 2 Tier", price: 280, available: 40 }, { type: "1A", label: "AC First Class", price: 525, available: 10 }], amenities: ["wifi", "meals"], rating: 4.6 },
    { number: "12280", name: "Taj Express", departure: "19:20", arrival: "22:15", duration: "2h 55m", classes: [{ type: "SL", label: "Sleeper", price: 85, available: 115 }, { type: "3A", label: "AC 3 Tier", price: 225, available: 52 }, { type: "2A", label: "AC 2 Tier", price: 325, available: 20 }], amenities: ["pantry"], rating: 4.0 },
  ]),

  ...route("New Delhi", "Patna", [
    { number: "12309", name: "Rajendra Nagar Rajdhani", departure: "18:55", arrival: "08:10", duration: "13h 15m", classes: [{ type: "3A", label: "AC 3 Tier", price: 1450, available: 22 }, { type: "2A", label: "AC 2 Tier", price: 2090, available: 10 }, { type: "1A", label: "AC First Class", price: 3500, available: 3 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.5 },
    { number: "12397", name: "Mahabodhi Express", departure: "12:30", arrival: "04:55", duration: "16h 25m", classes: [{ type: "SL", label: "Sleeper", price: 460, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 1220, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 1750, available: 14 }], amenities: ["pantry", "charging"], rating: 4.0 },
  ]),
  ...route("Patna", "New Delhi", [
    { number: "12310", name: "New Delhi Rajdhani", departure: "18:30", arrival: "07:30", duration: "13h 00m", classes: [{ type: "3A", label: "AC 3 Tier", price: 1450, available: 20 }, { type: "2A", label: "AC 2 Tier", price: 2090, available: 8 }, { type: "1A", label: "AC First Class", price: 3500, available: 2 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.5 },
    { number: "12398", name: "Mahabodhi Express", departure: "21:45", arrival: "14:25", duration: "16h 40m", classes: [{ type: "SL", label: "Sleeper", price: 460, available: 65 }, { type: "3A", label: "AC 3 Tier", price: 1220, available: 32 }, { type: "2A", label: "AC 2 Tier", price: 1750, available: 12 }], amenities: ["pantry", "charging"], rating: 3.9 },
  ]),

  // ── Bangalore City ────────────────────────────────────────────────────────
  ...route("Bangalore City", "Chennai Central", [
    { number: "12027", name: "Shatabdi Express", departure: "06:00", arrival: "11:00", duration: "5h 00m", classes: [{ type: "2A", label: "AC 2 Tier", price: 890, available: 30 }, { type: "1A", label: "AC First Class", price: 1650, available: 8 }], amenities: ["wifi", "meals", "charging"], rating: 4.6 },
    { number: "12657", name: "Bangalore Mail", departure: "22:30", arrival: "05:30", duration: "7h 00m", classes: [{ type: "SL", label: "Sleeper", price: 320, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 850, available: 40 }, { type: "2A", label: "AC 2 Tier", price: 1200, available: 15 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "12639", name: "Brindavan Express", departure: "07:20", arrival: "13:05", duration: "5h 45m", classes: [{ type: "SL", label: "Sleeper", price: 280, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 760, available: 50 }], amenities: ["pantry"], rating: 3.9 },
  ]),
  ...route("Chennai Central", "Bangalore City", [
    { number: "12028", name: "Shatabdi Express", departure: "14:30", arrival: "19:40", duration: "5h 10m", classes: [{ type: "2A", label: "AC 2 Tier", price: 875, available: 28 }, { type: "1A", label: "AC First Class", price: 1620, available: 6 }], amenities: ["wifi", "meals", "charging"], rating: 4.6 },
    { number: "12658", name: "Chennai Mail", departure: "23:15", arrival: "06:00", duration: "6h 45m", classes: [{ type: "SL", label: "Sleeper", price: 305, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 820, available: 42 }, { type: "2A", label: "AC 2 Tier", price: 1160, available: 16 }], amenities: ["pantry", "charging"], rating: 4.0 },
  ]),

  ...route("Bangalore City", "Hyderabad", [
    { number: "12785", name: "Secunderabad Express", departure: "21:00", arrival: "08:00", duration: "11h 00m", classes: [{ type: "SL", label: "Sleeper", price: 310, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 825, available: 36 }, { type: "2A", label: "AC 2 Tier", price: 1185, available: 14 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "12163", name: "Dadar Express", departure: "08:30", arrival: "20:10", duration: "11h 40m", classes: [{ type: "SL", label: "Sleeper", price: 290, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 770, available: 45 }], amenities: ["pantry"], rating: 3.7 },
  ]),
  ...route("Hyderabad", "Bangalore City", [
    { number: "12786", name: "Bangalore Express", departure: "16:30", arrival: "03:30", duration: "11h 00m", classes: [{ type: "SL", label: "Sleeper", price: 310, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 825, available: 33 }, { type: "2A", label: "AC 2 Tier", price: 1185, available: 12 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "12164", name: "Mumbai Express", departure: "19:40", arrival: "07:30", duration: "11h 50m", classes: [{ type: "SL", label: "Sleeper", price: 290, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 770, available: 42 }], amenities: ["pantry"], rating: 3.6 },
  ]),

  ...route("Bangalore City", "Kochi", [
    { number: "16515", name: "Karwar Express", departure: "19:45", arrival: "09:55", duration: "14h 10m", classes: [{ type: "SL", label: "Sleeper", price: 340, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 905, available: 38 }, { type: "2A", label: "AC 2 Tier", price: 1295, available: 15 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "16525", name: "Island Express", departure: "21:30", arrival: "11:35", duration: "14h 05m", classes: [{ type: "SL", label: "Sleeper", price: 325, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 865, available: 44 }], amenities: ["pantry"], rating: 3.9 },
  ]),
  ...route("Kochi", "Bangalore City", [
    { number: "16516", name: "Bangalore Express", departure: "18:00", arrival: "08:10", duration: "14h 10m", classes: [{ type: "SL", label: "Sleeper", price: 340, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 905, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 1295, available: 12 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "16526", name: "Island Express", departure: "08:00", arrival: "21:50", duration: "13h 50m", classes: [{ type: "SL", label: "Sleeper", price: 325, available: 88 }, { type: "3A", label: "AC 3 Tier", price: 865, available: 42 }], amenities: ["pantry"], rating: 3.8 },
  ]),

  // ── Chennai Central ───────────────────────────────────────────────────────
  ...route("Chennai Central", "Kolkata", [
    { number: "12841", name: "Coromandel Express", departure: "09:00", arrival: "13:45", duration: "28h 45m", classes: [{ type: "SL", label: "Sleeper", price: 630, available: 65 }, { type: "3A", label: "AC 3 Tier", price: 1670, available: 30 }, { type: "2A", label: "AC 2 Tier", price: 2400, available: 12 }], amenities: ["pantry", "wifi", "charging"], rating: 4.5 },
    { number: "12663", name: "Howrah Express", departure: "23:55", arrival: "07:15", duration: "31h 20m", classes: [{ type: "SL", label: "Sleeper", price: 580, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 1540, available: 38 }], amenities: ["pantry", "charging"], rating: 4.0 },
  ]),
  ...route("Kolkata", "Chennai Central", [
    { number: "12842", name: "Coromandel Express", departure: "14:45", arrival: "19:30", duration: "28h 45m", classes: [{ type: "SL", label: "Sleeper", price: 630, available: 60 }, { type: "3A", label: "AC 3 Tier", price: 1670, available: 28 }, { type: "2A", label: "AC 2 Tier", price: 2400, available: 10 }], amenities: ["pantry", "wifi", "charging"], rating: 4.4 },
    { number: "12664", name: "Chennai Express", departure: "23:20", arrival: "07:05", duration: "31h 45m", classes: [{ type: "SL", label: "Sleeper", price: 580, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 1540, available: 35 }], amenities: ["pantry", "charging"], rating: 3.9 },
  ]),

  ...route("Chennai Central", "Hyderabad", [
    { number: "12759", name: "Charminar Express", departure: "18:30", arrival: "07:10", duration: "12h 40m", classes: [{ type: "SL", label: "Sleeper", price: 330, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 880, available: 40 }, { type: "2A", label: "AC 2 Tier", price: 1260, available: 16 }], amenities: ["pantry", "charging"], rating: 4.2 },
    { number: "17229", name: "Sabari Express", departure: "06:10", arrival: "18:45", duration: "12h 35m", classes: [{ type: "SL", label: "Sleeper", price: 310, available: 100 }, { type: "3A", label: "AC 3 Tier", price: 825, available: 50 }], amenities: ["pantry"], rating: 3.8 },
  ]),
  ...route("Hyderabad", "Chennai Central", [
    { number: "12760", name: "Charminar Express", departure: "17:45", arrival: "06:30", duration: "12h 45m", classes: [{ type: "SL", label: "Sleeper", price: 330, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 880, available: 38 }, { type: "2A", label: "AC 2 Tier", price: 1260, available: 14 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "17230", name: "Sabari Express", departure: "07:50", arrival: "20:30", duration: "12h 40m", classes: [{ type: "SL", label: "Sleeper", price: 310, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 825, available: 48 }], amenities: ["pantry"], rating: 3.7 },
  ]),

  ...route("Chennai Central", "Coimbatore", [
    { number: "12671", name: "Nilgiri Express", departure: "21:15", arrival: "06:25", duration: "9h 10m", classes: [{ type: "SL", label: "Sleeper", price: 250, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 665, available: 42 }, { type: "2A", label: "AC 2 Tier", price: 955, available: 18 }], amenities: ["pantry", "charging"], rating: 4.2 },
    { number: "12673", name: "Cheran Express", departure: "22:10", arrival: "07:30", duration: "9h 20m", classes: [{ type: "SL", label: "Sleeper", price: 235, available: 100 }, { type: "3A", label: "AC 3 Tier", price: 625, available: 50 }], amenities: ["pantry"], rating: 4.0 },
  ]),
  ...route("Coimbatore", "Chennai Central", [
    { number: "12672", name: "Nilgiri Express", departure: "19:30", arrival: "05:05", duration: "9h 35m", classes: [{ type: "SL", label: "Sleeper", price: 250, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 665, available: 40 }, { type: "2A", label: "AC 2 Tier", price: 955, available: 15 }], amenities: ["pantry", "charging"], rating: 4.2 },
    { number: "12674", name: "Cheran Express", departure: "20:15", arrival: "06:20", duration: "10h 05m", classes: [{ type: "SL", label: "Sleeper", price: 235, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 625, available: 48 }], amenities: ["pantry"], rating: 3.9 },
  ]),

  // ── Hyderabad ─────────────────────────────────────────────────────────────
  ...route("Hyderabad", "Pune", [
    { number: "11303", name: "Koyna Express", departure: "17:30", arrival: "06:15", duration: "12h 45m", classes: [{ type: "SL", label: "Sleeper", price: 390, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 1020, available: 32 }, { type: "2A", label: "AC 2 Tier", price: 1460, available: 12 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "17031", name: "Hyderabad Express", departure: "06:20", arrival: "18:30", duration: "12h 10m", classes: [{ type: "SL", label: "Sleeper", price: 350, available: 100 }, { type: "3A", label: "AC 3 Tier", price: 920, available: 45 }], amenities: ["pantry"], rating: 3.7 },
  ]),
  ...route("Pune", "Hyderabad", [
    { number: "11304", name: "Hyderabad Express", departure: "20:15", arrival: "09:10", duration: "12h 55m", classes: [{ type: "SL", label: "Sleeper", price: 390, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 1020, available: 30 }, { type: "2A", label: "AC 2 Tier", price: 1460, available: 10 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "17032", name: "Pune Express", departure: "07:05", arrival: "19:45", duration: "12h 40m", classes: [{ type: "SL", label: "Sleeper", price: 350, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 920, available: 42 }], amenities: ["pantry"], rating: 3.6 },
  ]),

  ...route("Hyderabad", "Visakhapatnam", [
    { number: "12727", name: "Godavari Express", departure: "17:30", arrival: "06:30", duration: "13h 00m", classes: [{ type: "SL", label: "Sleeper", price: 360, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 960, available: 38 }, { type: "2A", label: "AC 2 Tier", price: 1375, available: 15 }], amenities: ["pantry", "charging"], rating: 4.2 },
    { number: "07005", name: "Prashanti Nilayam Express", departure: "07:15", arrival: "21:15", duration: "14h 00m", classes: [{ type: "SL", label: "Sleeper", price: 330, available: 100 }, { type: "3A", label: "AC 3 Tier", price: 880, available: 48 }], amenities: ["pantry"], rating: 3.8 },
  ]),
  ...route("Visakhapatnam", "Hyderabad", [
    { number: "12728", name: "Godavari Express", departure: "16:30", arrival: "05:35", duration: "13h 05m", classes: [{ type: "SL", label: "Sleeper", price: 360, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 960, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 1375, available: 12 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "07006", name: "Hyderabad Express", departure: "08:20", arrival: "22:45", duration: "14h 25m", classes: [{ type: "SL", label: "Sleeper", price: 330, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 880, available: 45 }], amenities: ["pantry"], rating: 3.7 },
  ]),

  // ── Kolkata ───────────────────────────────────────────────────────────────
  ...route("Kolkata", "Hyderabad", [
    { number: "12703", name: "Falaknuma Express", departure: "13:45", arrival: "19:30", duration: "29h 45m", classes: [{ type: "SL", label: "Sleeper", price: 570, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 1510, available: 32 }, { type: "2A", label: "AC 2 Tier", price: 2170, available: 13 }], amenities: ["pantry", "charging"], rating: 4.1 },
    { number: "18045", name: "Hyderabad Express", departure: "23:45", arrival: "08:30", duration: "32h 45m", classes: [{ type: "SL", label: "Sleeper", price: 530, available: 85 }, { type: "3A", label: "AC 3 Tier", price: 1410, available: 42 }], amenities: ["pantry"], rating: 3.7 },
  ]),
  ...route("Hyderabad", "Kolkata", [
    { number: "12704", name: "Falaknuma Express", departure: "18:00", arrival: "23:40", duration: "29h 40m", classes: [{ type: "SL", label: "Sleeper", price: 570, available: 65 }, { type: "3A", label: "AC 3 Tier", price: 1510, available: 30 }, { type: "2A", label: "AC 2 Tier", price: 2170, available: 11 }], amenities: ["pantry", "charging"], rating: 4.0 },
    { number: "18046", name: "Kolkata Express", departure: "06:30", arrival: "15:15", duration: "32h 45m", classes: [{ type: "SL", label: "Sleeper", price: 530, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 1410, available: 40 }], amenities: ["pantry"], rating: 3.6 },
  ]),

  // ── Ahmedabad / Vadodara / Surat ─────────────────────────────────────────
  ...route("Ahmedabad", "New Delhi", [
    { number: "12957", name: "Rajdhani Express", departure: "15:00", arrival: "06:05", duration: "15h 05m", classes: [{ type: "3A", label: "AC 3 Tier", price: 1540, available: 24 }, { type: "2A", label: "AC 2 Tier", price: 2220, available: 10 }, { type: "1A", label: "AC First Class", price: 3720, available: 3 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.6 },
    { number: "12915", name: "Ashram Express", departure: "05:50", arrival: "22:30", duration: "16h 40m", classes: [{ type: "SL", label: "Sleeper", price: 465, available: 70 }, { type: "3A", label: "AC 3 Tier", price: 1240, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 1780, available: 15 }], amenities: ["pantry", "charging"], rating: 4.2 },
  ]),
  ...route("New Delhi", "Ahmedabad", [
    { number: "12958", name: "Ahmedabad Rajdhani", departure: "19:55", arrival: "11:05", duration: "15h 10m", classes: [{ type: "3A", label: "AC 3 Tier", price: 1540, available: 22 }, { type: "2A", label: "AC 2 Tier", price: 2220, available: 9 }, { type: "1A", label: "AC First Class", price: 3720, available: 2 }], amenities: ["pantry", "wifi", "meals", "charging"], rating: 4.6 },
    { number: "12916", name: "Ashram Express", departure: "15:20", arrival: "08:30", duration: "17h 10m", classes: [{ type: "SL", label: "Sleeper", price: 465, available: 65 }, { type: "3A", label: "AC 3 Tier", price: 1240, available: 32 }, { type: "2A", label: "AC 2 Tier", price: 1780, available: 13 }], amenities: ["pantry", "charging"], rating: 4.1 },
  ]),

  ...route("Vadodara", "Mumbai Central", [
    { number: "12010", name: "Shatabdi Express", departure: "16:45", arrival: "21:00", duration: "4h 15m", classes: [{ type: "2A", label: "AC 2 Tier", price: 510, available: 32 }, { type: "1A", label: "AC First Class", price: 955, available: 8 }], amenities: ["wifi", "meals", "charging"], rating: 4.4 },
    { number: "12934", name: "Karnavati Express", departure: "07:10", arrival: "11:55", duration: "4h 45m", classes: [{ type: "SL", label: "Sleeper", price: 165, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 440, available: 45 }, { type: "2A", label: "AC 2 Tier", price: 630, available: 18 }], amenities: ["pantry", "charging"], rating: 4.0 },
  ]),
  ...route("Mumbai Central", "Vadodara", [
    { number: "12009", name: "Shatabdi Express", departure: "06:25", arrival: "10:40", duration: "4h 15m", classes: [{ type: "2A", label: "AC 2 Tier", price: 510, available: 30 }, { type: "1A", label: "AC First Class", price: 955, available: 7 }], amenities: ["wifi", "meals", "charging"], rating: 4.4 },
    { number: "12933", name: "Karnavati Express", departure: "17:45", arrival: "22:45", duration: "5h 00m", classes: [{ type: "SL", label: "Sleeper", price: 165, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 440, available: 42 }, { type: "2A", label: "AC 2 Tier", price: 630, available: 16 }], amenities: ["pantry", "charging"], rating: 3.9 },
  ]),

  // ── Pune ──────────────────────────────────────────────────────────────────
  ...route("Pune", "Bangalore City", [
    { number: "11007", name: "Deccan Express", departure: "23:10", arrival: "20:00", duration: "20h 50m", classes: [{ type: "SL", label: "Sleeper", price: 415, available: 80 }, { type: "3A", label: "AC 3 Tier", price: 1105, available: 38 }, { type: "2A", label: "AC 2 Tier", price: 1585, available: 15 }], amenities: ["pantry", "charging"], rating: 3.9 },
    { number: "11013", name: "Coimbatore Express", departure: "19:30", arrival: "16:45", duration: "21h 15m", classes: [{ type: "SL", label: "Sleeper", price: 395, available: 95 }, { type: "3A", label: "AC 3 Tier", price: 1055, available: 45 }], amenities: ["pantry"], rating: 3.7 },
  ]),
  ...route("Bangalore City", "Pune", [
    { number: "11008", name: "Pune Express", departure: "18:50", arrival: "15:30", duration: "20h 40m", classes: [{ type: "SL", label: "Sleeper", price: 415, available: 75 }, { type: "3A", label: "AC 3 Tier", price: 1105, available: 35 }, { type: "2A", label: "AC 2 Tier", price: 1585, available: 12 }], amenities: ["pantry", "charging"], rating: 3.8 },
    { number: "11014", name: "Pune Express", departure: "07:30", arrival: "05:00", duration: "21h 30m", classes: [{ type: "SL", label: "Sleeper", price: 395, available: 90 }, { type: "3A", label: "AC 3 Tier", price: 1055, available: 42 }], amenities: ["pantry"], rating: 3.6 },
  ]),
];

export async function seedTrainsIfEmpty() {
  const metaRef = doc(db, "_meta", "trainsSeed");
  const metaSnap = await getDoc(metaRef);
  if (metaSnap.exists() && metaSnap.data().version === SEED_VERSION) return;

  // Delete old trains
  const existing = await getDocs(collection(db, "trains"));
  await Promise.all(existing.docs.map((d) => deleteDoc(doc(db, "trains", d.id))));

  // Insert new trains
  for (const train of trainData) {
    await addDoc(collection(db, "trains"), train);
  }

  await setDoc(metaRef, { version: SEED_VERSION });
}

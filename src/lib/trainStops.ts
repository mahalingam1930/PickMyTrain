export interface TrainStop {
  station: string;
  code: string;
  arrival: string;
  departure: string;
  day: number;
  distance: number; // km from origin
}

const stops: Record<string, TrainStop[]> = {
  // Mumbai Rajdhani (Mumbai Central → New Delhi)
  "12951": [
    { station: "Mumbai Central", code: "BCT", arrival: "—", departure: "16:25", day: 1, distance: 0 },
    { station: "Vadodara Jn", code: "BRC", arrival: "20:38", departure: "20:43", day: 1, distance: 391 },
    { station: "Ratlam Jn", code: "RTM", arrival: "23:15", departure: "23:20", day: 1, distance: 532 },
    { station: "Kota Jn", code: "KOTA", arrival: "02:10", departure: "02:15", day: 2, distance: 734 },
    { station: "Sawai Madhopur", code: "SWM", arrival: "03:28", departure: "03:30", day: 2, distance: 810 },
    { station: "New Delhi", code: "NDLS", arrival: "08:15", departure: "—", day: 2, distance: 1386 },
  ],
  // New Delhi Rajdhani (Mumbai Central ← New Delhi)
  "12952": [
    { station: "New Delhi", code: "NDLS", arrival: "—", departure: "16:35", day: 1, distance: 0 },
    { station: "Sawai Madhopur", code: "SWM", arrival: "20:52", departure: "20:55", day: 1, distance: 576 },
    { station: "Kota Jn", code: "KOTA", arrival: "22:05", departure: "22:10", day: 1, distance: 652 },
    { station: "Ratlam Jn", code: "RTM", arrival: "01:10", departure: "01:15", day: 2, distance: 854 },
    { station: "Vadodara Jn", code: "BRC", arrival: "03:50", departure: "03:55", day: 2, distance: 995 },
    { station: "Mumbai Central", code: "BCT", arrival: "08:35", departure: "—", day: 2, distance: 1386 },
  ],
  // Howrah Rajdhani (New Delhi → Kolkata)
  "12301": [
    { station: "New Delhi", code: "NDLS", arrival: "—", departure: "16:55", day: 1, distance: 0 },
    { station: "Kanpur Central", code: "CNB", arrival: "22:10", departure: "22:20", day: 1, distance: 440 },
    { station: "Allahabad Jn", code: "ALD", arrival: "01:05", departure: "01:15", day: 2, distance: 634 },
    { station: "Mughal Sarai Jn", code: "MGS", arrival: "03:00", departure: "03:05", day: 2, distance: 770 },
    { station: "Gaya Jn", code: "GAYA", arrival: "05:50", departure: "05:55", day: 2, distance: 988 },
    { station: "Dhanbad Jn", code: "DHN", arrival: "08:45", departure: "08:50", day: 2, distance: 1151 },
    { station: "Howrah Jn", code: "HWH", arrival: "09:55", departure: "—", day: 2, distance: 1441 },
  ],
  // New Delhi Rajdhani (Kolkata → New Delhi)
  "12302": [
    { station: "Howrah Jn", code: "HWH", arrival: "—", departure: "14:05", day: 1, distance: 0 },
    { station: "Dhanbad Jn", code: "DHN", arrival: "16:25", departure: "16:30", day: 1, distance: 290 },
    { station: "Gaya Jn", code: "GAYA", arrival: "18:15", departure: "18:20", day: 1, distance: 453 },
    { station: "Mughal Sarai Jn", code: "MGS", arrival: "21:05", departure: "21:10", day: 1, distance: 671 },
    { station: "Allahabad Jn", code: "ALD", arrival: "22:50", departure: "23:00", day: 1, distance: 807 },
    { station: "Kanpur Central", code: "CNB", arrival: "01:45", departure: "01:55", day: 2, distance: 1001 },
    { station: "New Delhi", code: "NDLS", arrival: "06:15", departure: "—", day: 2, distance: 1441 },
  ],
  // Udyan Express (Mumbai Central → Bangalore City)
  "11301": [
    { station: "Mumbai Central", code: "BCT", arrival: "—", departure: "08:05", day: 1, distance: 0 },
    { station: "Pune Jn", code: "PUNE", arrival: "11:15", departure: "11:25", day: 1, distance: 192 },
    { station: "Miraj Jn", code: "MRJ", arrival: "16:10", departure: "16:20", day: 1, distance: 448 },
    { station: "Hubli Jn", code: "UBL", arrival: "21:50", departure: "22:00", day: 1, distance: 688 },
    { station: "Davangere", code: "DVG", arrival: "01:30", departure: "01:35", day: 2, distance: 824 },
    { station: "Bangalore City", code: "SBC", arrival: "06:40", departure: "—", day: 2, distance: 1160 },
  ],
  // Karnataka Express (New Delhi → Bangalore City)
  "12627": [
    { station: "New Delhi", code: "NDLS", arrival: "—", departure: "22:30", day: 1, distance: 0 },
    { station: "Agra Cantt", code: "AGC", arrival: "01:05", departure: "01:10", day: 2, distance: 199 },
    { station: "Gwalior Jn", code: "GWL", arrival: "02:45", departure: "02:50", day: 2, distance: 305 },
    { station: "Jhansi Jn", code: "JHS", arrival: "04:40", departure: "04:50", day: 2, distance: 403 },
    { station: "Nagpur Jn", code: "NGP", arrival: "13:30", departure: "13:40", day: 2, distance: 1004 },
    { station: "Secunderabad Jn", code: "SC", arrival: "22:45", departure: "22:55", day: 2, distance: 1569 },
    { station: "Bangalore City", code: "SBC", arrival: "08:00", departure: "—", day: 3, distance: 2056 },
  ],
  // Tamil Nadu Express (New Delhi → Chennai Central)
  "12621": [
    { station: "New Delhi", code: "NDLS", arrival: "—", departure: "22:30", day: 1, distance: 0 },
    { station: "Agra Cantt", code: "AGC", arrival: "01:02", departure: "01:07", day: 2, distance: 199 },
    { station: "Jhansi Jn", code: "JHS", arrival: "04:28", departure: "04:38", day: 2, distance: 403 },
    { station: "Nagpur Jn", code: "NGP", arrival: "12:55", departure: "13:10", day: 2, distance: 1004 },
    { station: "Vijayawada Jn", code: "BZA", arrival: "22:50", departure: "23:00", day: 2, distance: 1716 },
    { station: "Chennai Central", code: "MAS", arrival: "07:40", departure: "—", day: 3, distance: 2185 },
  ],
  // Coromandel Express (Chennai Central → Kolkata)
  "12841": [
    { station: "Chennai Central", code: "MAS", arrival: "—", departure: "09:00", day: 1, distance: 0 },
    { station: "Nellore", code: "NLR", arrival: "11:45", departure: "11:50", day: 1, distance: 175 },
    { station: "Vijayawada Jn", code: "BZA", arrival: "14:25", departure: "14:40", day: 1, distance: 432 },
    { station: "Visakhapatnam", code: "VSKP", arrival: "19:40", departure: "19:55", day: 1, distance: 790 },
    { station: "Bhubaneswar", code: "BBS", arrival: "01:00", departure: "01:05", day: 2, distance: 1154 },
    { station: "Kharagpur Jn", code: "KGP", arrival: "04:30", departure: "04:35", day: 2, distance: 1378 },
    { station: "Howrah Jn", code: "HWH", arrival: "13:45", departure: "—", day: 2, distance: 1659 },
  ],
  // Pragati Express (Mumbai Central → Pune)
  "12125": [
    { station: "Mumbai Central", code: "BCT", arrival: "—", departure: "06:15", day: 1, distance: 0 },
    { station: "Dadar", code: "DR", arrival: "06:30", departure: "06:32", day: 1, distance: 9 },
    { station: "Thane", code: "TNA", arrival: "06:55", departure: "06:57", day: 1, distance: 34 },
    { station: "Kalyan Jn", code: "KYN", arrival: "07:20", departure: "07:22", day: 1, distance: 54 },
    { station: "Pune Jn", code: "PUNE", arrival: "09:05", departure: "—", day: 1, distance: 192 },
  ],
  // Deccan Queen (Mumbai Central → Pune)
  "12123": [
    { station: "Mumbai Central", code: "BCT", arrival: "—", departure: "17:10", day: 1, distance: 0 },
    { station: "Dadar", code: "DR", arrival: "17:25", departure: "17:27", day: 1, distance: 9 },
    { station: "Thane", code: "TNA", arrival: "17:49", departure: "17:51", day: 1, distance: 34 },
    { station: "Lonavala", code: "LNL", arrival: "19:05", departure: "19:07", day: 1, distance: 110 },
    { station: "Pune Jn", code: "PUNE", arrival: "20:35", departure: "—", day: 1, distance: 192 },
  ],
  // Hussainsagar Express (Mumbai Central → Hyderabad)
  "12701": [
    { station: "Mumbai Central", code: "BCT", arrival: "—", departure: "21:55", day: 1, distance: 0 },
    { station: "Pune Jn", code: "PUNE", arrival: "01:30", departure: "01:40", day: 2, distance: 192 },
    { station: "Solapur Jn", code: "SUR", arrival: "05:45", departure: "05:55", day: 2, distance: 457 },
    { station: "Gulbarga", code: "GR", arrival: "08:25", departure: "08:30", day: 2, distance: 608 },
    { station: "Secunderabad Jn", code: "SC", arrival: "12:50", departure: "13:00", day: 2, distance: 816 },
    { station: "Hyderabad", code: "HYB", arrival: "13:30", departure: "—", day: 2, distance: 830 },
  ],
  // Shatabdi Express (Bangalore City → Chennai Central)
  "12027": [
    { station: "Bangalore City", code: "SBC", arrival: "—", departure: "06:00", day: 1, distance: 0 },
    { station: "Jolarpettai Jn", code: "JTJ", arrival: "08:10", departure: "08:12", day: 1, distance: 216 },
    { station: "Katpadi Jn", code: "KPD", arrival: "09:05", departure: "09:07", day: 1, distance: 310 },
    { station: "Chennai Central", code: "MAS", arrival: "11:00", departure: "—", day: 1, distance: 496 },
  ],
  // Ajmer Shatabdi (New Delhi → Jaipur)
  "12015": [
    { station: "New Delhi", code: "NDLS", arrival: "—", departure: "06:05", day: 1, distance: 0 },
    { station: "Gurgaon", code: "GGN", arrival: "06:35", departure: "06:37", day: 1, distance: 32 },
    { station: "Rewari Jn", code: "RE", arrival: "07:20", departure: "07:22", day: 1, distance: 82 },
    { station: "Jaipur Jn", code: "JP", arrival: "10:35", departure: "—", day: 1, distance: 308 },
  ],
  // Mandovi Express (Mumbai Central → Goa)
  "10103": [
    { station: "Mumbai Central", code: "BCT", arrival: "—", departure: "07:10", day: 1, distance: 0 },
    { station: "Thane", code: "TNA", arrival: "07:45", departure: "07:47", day: 1, distance: 34 },
    { station: "Ratnagiri", code: "RN", arrival: "12:10", departure: "12:15", day: 1, distance: 352 },
    { station: "Kudal", code: "KUDL", arrival: "15:20", departure: "15:22", day: 1, distance: 528 },
    { station: "Madgaon Jn", code: "MAO", arrival: "19:00", departure: "—", day: 1, distance: 672 },
  ],
  // Rajdhani Express (New Delhi → Ahmedabad)
  "12957": [
    { station: "New Delhi", code: "NDLS", arrival: "—", departure: "19:55", day: 1, distance: 0 },
    { station: "Gandhinagar Cap", code: "GNC", arrival: "06:30", departure: "06:35", day: 2, distance: 929 },
    { station: "Ahmedabad Jn", code: "ADI", arrival: "07:00", departure: "—", day: 2, distance: 935 },
  ],
  // Telangana Express (New Delhi → Hyderabad)
  "12723": [
    { station: "New Delhi", code: "NDLS", arrival: "—", departure: "06:20", day: 1, distance: 0 },
    { station: "Agra Cantt", code: "AGC", arrival: "09:05", departure: "09:15", day: 1, distance: 199 },
    { station: "Jhansi Jn", code: "JHS", arrival: "12:00", departure: "12:10", day: 1, distance: 403 },
    { station: "Nagpur Jn", code: "NGP", arrival: "20:30", departure: "20:45", day: 1, distance: 1004 },
    { station: "Secunderabad Jn", code: "SC", arrival: "05:15", departure: "05:25", day: 2, distance: 1569 },
    { station: "Hyderabad", code: "HYB", arrival: "05:30", departure: "—", day: 2, distance: 1583 },
  ],
};

export function getTrainStops(trainNumber: string): TrainStop[] {
  return stops[trainNumber] || [];
}

export default stops;

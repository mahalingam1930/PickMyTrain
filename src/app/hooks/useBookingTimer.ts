import { useState, useEffect, useCallback } from "react";

const TIMER_KEY = "pmt_booking_timer_start";
const DURATION = 10 * 60; // 10 minutes in seconds

export function useBookingTimer() {
  const getRemaining = () => {
    const start = sessionStorage.getItem(TIMER_KEY);
    if (!start) return DURATION;
    const elapsed = Math.floor((Date.now() - Number(start)) / 1000);
    return Math.max(0, DURATION - elapsed);
  };

  const [remaining, setRemaining] = useState(getRemaining);

  // Start timer if not already started
  useEffect(() => {
    if (!sessionStorage.getItem(TIMER_KEY)) {
      sessionStorage.setItem(TIMER_KEY, String(Date.now()));
    }
  }, []);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining(getRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const reset = useCallback(() => {
    sessionStorage.removeItem(TIMER_KEY);
    setRemaining(DURATION);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isExpired = remaining <= 0;
  const isWarning = remaining <= 3 * 60; // last 3 minutes = orange
  const isDanger = remaining <= 60;      // last 1 minute = red

  return { minutes, seconds, isExpired, isWarning, isDanger, reset };
}

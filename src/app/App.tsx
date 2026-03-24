import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { seedTrainsIfEmpty } from "../lib/seedTrains";

export default function App() {
  useEffect(() => {
    seedTrainsIfEmpty();
  }, []);

  return (
    <AuthProvider>
      <BookingProvider>
        <RouterProvider router={router} />
      </BookingProvider>
    </AuthProvider>
  );
}

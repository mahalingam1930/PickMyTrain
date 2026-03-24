import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import PassengerDetailsPage from "./pages/PassengerDetailsPage";
import PaymentPage from "./pages/PaymentPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ProfilePage from "./pages/ProfilePage";
import PNRStatusPage from "./pages/PNRStatusPage";
import VerifyTicketPage from "./pages/VerifyTicketPage";
import { useAuth } from "./context/AuthContext";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useAuth();
  if (authLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useAuth();
  if (authLoading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
  const { isAuthenticated, authLoading } = useAuth();
  if (authLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout />;
}

export const router = createBrowserRouter([
  {
    path: "/verify/:pnr",
    element: <VerifyTicketPage />,
  },
  {
    path: "/login",
    element: <AuthRoute><LoginPage /></AuthRoute>,
  },
  {
    path: "/register",
    element: <AuthRoute><RegisterPage /></AuthRoute>,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "search-results", element: <SearchResultsPage /> },
      { path: "seat-selection", element: <SeatSelectionPage /> },
      { path: "passenger-details", element: <PassengerDetailsPage /> },
      { path: "payment", element: <PaymentPage /> },
      { path: "confirmation", element: <ConfirmationPage /> },
      { path: "my-bookings", element: <MyBookingsPage /> },
      { path: "pnr-status", element: <PNRStatusPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

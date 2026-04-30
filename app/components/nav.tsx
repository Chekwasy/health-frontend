"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  logout,
  setInitialized,
} from "@/store/slices/mainslice";

export default function Nav() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { logged, me, isInitialized, profileComplete } =
    useSelector((state: any) => state.mainState) || {};

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 🔥 Fetch user on load
  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("access_token");

      if (!token) {
        dispatch(setInitialized());
        router.push("/auth/login");
        return;
      }

      try {
        const res = await axios.get("/api/users/getme", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        dispatch(
          setUser({
            me: res.data.me,
            profileComplete: res.data.profileComplete,
          })
        );
      } catch {
        Cookies.remove("access_token");
        dispatch(logout());
        router.push("/auth/login");
      }
    };

    fetchUser();
  }, [dispatch, router]);

  if (!isInitialized) return null;

  const handleLogout = () => {
    Cookies.remove("access_token");
    dispatch(logout());
    router.push("/auth/login");
  };

  const isDoctor = me?.role === "DOCTOR";

  return (
    <nav className="bg-[#020617] fixed top-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* LOGO */}
        <Link href="/" className="text-white font-bold text-xl">
          Health Care
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-white hover:text-blue-400">
            Home
          </Link>

          <Link href="/about" className="text-white hover:text-blue-400">
            About
          </Link>

          {/* ROLE BASED LINKS */}
          {logged && (
            <>
              {isDoctor ? (
                <>
                  <Link
                    href="/doctor/schedule/view"
                    className="text-white hover:text-green-400"
                  >
                    Schedule
                  </Link>

                  {/* 🔥 NEW: DOCTOR APPOINTMENTS */}
                  <Link
                    href="/doctor/appointments"
                    className="text-white hover:text-yellow-400"
                  >
                    Appointments
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/patient/appointment/available-doctors"
                    className="text-white hover:text-blue-400"
                  >
                    Book Appointment
                  </Link>

                  <Link
                    href="/patient/appointment/my"
                    className="text-white hover:text-yellow-400"
                  >
                    My Appointments
                  </Link>
                </>
              )}

              <Link
                href="/dashboard"
                className="text-white hover:text-purple-400"
              >
                Dashboard
              </Link>
            </>
          )}

          {/* AUTH */}
          {logged ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-300">
                {me?.title ? me.title + " " : ""}
                {me?.first_name}
              </div>

              {!profileComplete && (
                <span className="text-yellow-400 text-xs">
                  (Update profile)
                </span>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded text-white text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-white">
                Login
              </Link>

              <Link
                href="/auth/signup"
                className="bg-blue-600 px-3 py-1 rounded text-white"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#020617] text-white p-6 space-y-4">
          <MobileItem href="/" label="Home" />
          <MobileItem href="/about" label="About" />

          {logged && (
            <>
              {isDoctor ? (
                <>
                  <MobileItem
                    href="/doctor/schedule/view"
                    label="Schedule"
                  />

                  {/* 🔥 NEW */}
                  <MobileItem
                    href="/doctor/appointments"
                    label="Appointments"
                  />
                </>
              ) : (
                <>
                  <MobileItem
                    href="/patient/appointment/available-doctors"
                    label="Book Appointment"
                  />

                  <MobileItem
                    href="/patient/appointment/my"
                    label="My Appointments"
                  />
                </>
              )}

              <MobileItem href="/dashboard" label="Dashboard" />

              {!profileComplete && (
                <div className="text-yellow-400 text-sm">
                  Complete your profile
                </div>
              )}

              <button onClick={handleLogout} className="text-red-400">
                Logout
              </button>
            </>
          )}

          {!logged && (
            <>
              <MobileItem href="/auth/login" label="Login" />
              <MobileItem href="/auth/signup" label="Get Started" />
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const MobileItem = ({ href, label }: any) => (
  <Link href={href} className="block py-2 border-b border-gray-700">
    {label}
  </Link>
);
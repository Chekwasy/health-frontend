"use client";

import { useSelector } from "react-redux";
import Link from "next/link";

export default function Main() {
  const { logged, me, isInitialized, profileComplete } =
    useSelector((state: any) => state.mainState) || {};

  if (!isInitialized) return null;

  const isDoctor = me?.role === "DOCTOR";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,15,30,0.85), rgba(5,15,30,0.9)), url('/bg.jpeg')",
      }}
    >
      <div className="max-w-5xl w-full text-center text-white">
        <h1 className="text-4xl font-bold mb-4">
          {logged
            ? `Welcome ${me?.title ? me.title + " " : ""}${me?.first_name}`
            : "Your Health, Simplified"}
        </h1>

        <p className="text-gray-300 mb-10">
          Connecting patients with trusted doctors seamlessly.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* PATIENT */}
          <div className="bg-white/10 p-6 rounded-xl text-left">
            <h2 className="text-2xl font-semibold mb-3">Patients</h2>
            <p className="text-gray-300">
              Find doctors, book appointments, and manage your health easily.
            </p>

            {logged && !isDoctor && (
              <>
                {!profileComplete ? (
                  <Link href="/patient/update-profile">
                    <button className="mt-4 w-full bg-yellow-500 text-black py-2 rounded font-bold">
                      Complete Profile First
                    </button>
                  </Link>
                ) : (
                  <Link href="/appointments/book">
                    <button className="mt-4 w-full bg-blue-600 py-2 rounded">
                      Book Appointment
                    </button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* DOCTOR */}
          <div className="bg-white/10 p-6 rounded-xl text-left">
            <h2 className="text-2xl font-semibold mb-3">Doctors</h2>
            <p className="text-gray-300">
              Manage appointments, availability, and grow your practice.
            </p>

            {logged && isDoctor && (
              <>
                {!profileComplete ? (
                  <Link href="/doctor/update-profile">
                    <button className="mt-4 w-full bg-yellow-500 text-black py-2 rounded font-bold">
                      Complete Profile First
                    </button>
                  </Link>
                ) : (
                  <Link href="/doctor/schedule">
                    <button className="mt-4 w-full bg-green-600 py-2 rounded">
                      Manage Schedule
                    </button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {!logged && (
          <div className="mt-10 flex gap-4 justify-center">
            <Link href="/auth/signup">
              <button className="bg-blue-600 px-6 py-3 rounded">
                Get Started
              </button>
            </Link>

            <Link href="/auth/login">
              <button className="bg-white text-black px-6 py-3 rounded">
                Login
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
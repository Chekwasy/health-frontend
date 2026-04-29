"use client";

import Nav from "@/app/components/nav";
import { useSelector } from "react-redux";
import Link from "next/link";

export default function Dashboard() {
  const { logged, me, isInitialized, profileComplete } =
    useSelector((state: any) => state.mainState) || {};

  if (!isInitialized) return null;

  const isDoctor = me?.role === "DOCTOR";

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,15,30,0.85), rgba(5,15,30,0.9)), url('/bg.jpeg')",
      }}
    >
      <Nav />

      <div className="pt-24 px-4 flex justify-center">
        <div className="max-w-6xl w-full text-white">
          {/* HEADER */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              Dashboard
            </h1>

            <p className="text-gray-300 mt-2">
              {logged
                ? `Welcome ${
                    me?.title ? me.title + " " : ""
                  }${me?.first_name}`
                : "Please login to continue"}
            </p>
          </div>

          {/* NOT LOGGED */}
          {!logged && (
            <div className="text-center mt-10">
              <Link href="/auth/login">
                <button className="bg-blue-600 px-6 py-3 rounded font-bold">
                  Login
                </button>
              </Link>
            </div>
          )}

          {/* 🔥 PROFILE NOT COMPLETE */}
          {logged && !profileComplete && (
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">
                Complete Your Profile
              </h2>

              <p className="text-gray-300 mb-6">
                {isDoctor
                  ? "Set up your professional profile to start managing your schedule and receiving patient bookings."
                  : "Complete your profile to start booking appointments and accessing healthcare services seamlessly."}
              </p>

              <Link
                href={
                  isDoctor
                    ? "/doctor/update-profile"
                    : "/patient/update-profile"
                }
              >
                <button className="bg-yellow-500 text-black px-6 py-3 rounded font-bold hover:scale-105 transition">
                  {isDoctor
                    ? "Set Up Doctor Profile"
                    : "Complete Patient Profile"}
                </button>
              </Link>
            </div>
          )}

          {/* 🔥 PATIENT DASHBOARD */}
          {logged && profileComplete && !isDoctor && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                title="Book Appointment"
                desc="Find doctors and schedule appointments easily."
                link="/appointments/book"
                color="bg-blue-600"
              />

              <Card
                title="My Appointments"
                desc="View your upcoming and past appointments."
                link="/appointments"
                color="bg-purple-600"
              />
            </div>
          )}

          {/* 🔥 DOCTOR DASHBOARD */}
          {logged && profileComplete && isDoctor && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                title="Manage Schedule"
                desc="Set your availability and manage bookings."
                link="/doctor/schedule"
                color="bg-green-600"
              />

              <Card
                title="Patient Appointments"
                desc="View and manage patient appointments."
                link="/doctor/appointments"
                color="bg-teal-600"
              />
            </div>
          )}

          {/* PROFILE SUMMARY */}
          {logged && (
            <div className="mt-10 bg-white/10 backdrop-blur-md p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-3">
                Profile Summary
              </h2>

              <div className="text-gray-300 space-y-1">
                <p>Email: {me?.email}</p>
                <p>
                  Name:{" "}
                  {me?.title ? me.title + " " : ""}
                  {me?.first_name} {me?.last_name}
                </p>
                <p>Role: {me?.role}</p>
                <p>Phone: {me?.phone || "Not set"}</p>

                <p
                  className={`mt-2 text-sm ${
                    profileComplete
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {profileComplete
                    ? "Profile Complete"
                    : "Profile Incomplete"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* 🔥 Card */
function Card({
  title,
  desc,
  link,
  color,
}: {
  title: string;
  desc: string;
  link: string;
  color: string;
}) {
  return (
    <Link href={link}>
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:scale-[1.02] transition cursor-pointer">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{desc}</p>

        <button className={`${color} px-4 py-2 rounded font-bold`}>
          Open
        </button>
      </div>
    </Link>
  );
}
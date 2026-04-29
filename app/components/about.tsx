"use client";

import Nav from "./nav";

export default function About() {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,15,30,0.85), rgba(5,15,30,0.9)), url('/bg.jpeg')",
      }}
    >
      {/* 🔥 NAV stays at top */}
      <Nav />

      {/* 🔥 CONTENT */}
      <div className="pt-24 px-4 flex justify-center">
        <div className="max-w-4xl w-full text-white text-center">
          {/* HEADER */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Health Care
          </h1>

          <p className="text-gray-300 mb-10 text-lg">
            We are building a simple, reliable, and accessible platform that
            connects patients with trusted healthcare professionals.
          </p>

          {/* CONTENT */}
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {/* MISSION */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-3">
                Our Mission
              </h2>
              <p className="text-gray-300">
                Our mission is to make healthcare easier to access by
                simplifying how patients find doctors and how doctors
                manage their services.
              </p>
            </div>

            {/* VISION */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-3">
                Our Vision
              </h2>
              <p className="text-gray-300">
                We envision a future where healthcare is seamless,
                digital, and efficient for everyone.
              </p>
            </div>

            {/* PATIENT */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-3">
                For Patients
              </h2>
              <p className="text-gray-300">
                Find doctors, book appointments, and manage your health easily.
              </p>
            </div>

            {/* DOCTOR */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-3">
                For Doctors
              </h2>
              <p className="text-gray-300">
                Manage schedules, appointments, and grow your practice.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-10 text-gray-400 text-sm">
            Health Care — Your Health, Our Priority
          </div>
        </div>
      </div>
    </div>
  );
}
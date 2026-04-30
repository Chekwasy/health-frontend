"use client";

import Nav from "@/app/components/nav";
import { useState, FormEvent } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DoctorUpdateProfile() {
  const router = useRouter();

  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [years, setYears] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!specialty || !bio || !years) {
      toast.error("Please fill all fields");
      return;
    }

    if (bio.length < 10) {
      toast.error("Bio is too short");
      return;
    }

    try {
      const token = Cookies.get("access_token");

      if (!token) {
        toast.error("Unauthorized");
        return;
      }

      const loading = toast.loading("Updating profile...");

      await axios.patch(
        "/api/users/update/doctor",
        {
          specialty,
          bio,
          years_of_experience: Number(years),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Profile updated successfully 🎉", {
        id: loading,
      });

      // 🔥 redirect back
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Update failed"
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,15,30,0.85), rgba(5,15,30,0.9)), url('/bg.jpeg')",
      }}
    >
      <Nav />

      <div className="pt-24 flex justify-center px-4">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg text-white">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Complete Doctor Profile
          </h1>

          <form onSubmit={handleSubmit}>
            {/* SPECIALTY */}
            <input
              type="text"
              placeholder="Specialty (e.g. Cardiologist)"
              className="w-full mb-4 p-3 rounded bg-white/20 border border-white/20 outline-none"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />

            {/* EXPERIENCE */}
            <input
              type="number"
              placeholder="Years of Experience"
              className="w-full mb-4 p-3 rounded bg-white/20 border border-white/20 outline-none"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />

            {/* BIO */}
            <textarea
              placeholder="Tell patients about yourself..."
              className="w-full mb-6 p-3 rounded bg-white/20 border border-white/20 outline-none"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <button className="w-full bg-green-600 py-3 rounded font-bold hover:scale-[1.02] transition">
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
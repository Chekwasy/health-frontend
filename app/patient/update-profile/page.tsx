"use client";

import Nav from "@/app/components/nav";
import { useState, FormEvent } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PatientUpdateProfile() {
  const router = useRouter();

  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!gender || !dob || !emergencyPhone) {
    toast.error("Please fill required fields");
    return;
  }

  try {
    const token = Cookies.get("access_token");

    if (!token) {
      toast.error("Unauthorized");
      return;
    }

    const loading = toast.loading("Updating profile...");

    // 🔥 CLEAN PAYLOAD (ONLY SEND FILLED FIELDS)
    const payload: any = {
      gender,
      date_of_birth: dob,
      emergency_contact_phone: emergencyPhone,
    };

    if (bloodGroup) payload.blood_group = bloodGroup;
    if (allergies) payload.allergies = allergies;
    if (conditions) payload.chronic_conditions = conditions;
    if (medications) payload.current_medications = medications;
    if (emergencyName) payload.emergency_contact_name = emergencyName;

    await axios.patch("/api/users/update/patient", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Profile updated successfully 🎉", {
      id: loading,
    });

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
            Complete Patient Profile
          </h1>

          <form onSubmit={handleSubmit}>
            {/* GENDER */}
            <select
  className="w-full mb-4 p-3 rounded bg-white/20 border border-white/20 text-white"
  value={gender}
  onChange={(e) => setGender(e.target.value)}
>
  <option value="" className="text-black">Select Gender</option>
  <option value="MALE" className="text-black">Male</option>
  <option value="FEMALE" className="text-black">Female</option>
  <option value="OTHER" className="text-black">Other</option>
</select>

            {/* DOB */}
            <input
              type="date"
              className="w-full mb-4 p-3 rounded bg-white/20 border border-white/20"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            {/* BLOOD GROUP */}
            <input
              type="text"
              placeholder="Blood Group (e.g. O+)"
              className="w-full mb-4 p-3 rounded bg-white/20 border border-white/20"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            />

            {/* ALLERGIES */}
            <input
              type="text"
              placeholder="Allergies (optional)"
              className="w-full mb-4 p-3 rounded bg-white/20 border border-white/20"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />

            {/* CONDITIONS */}
            <input
              type="text"
              placeholder="Chronic Conditions (optional)"
              className="w-full mb-4 p-3 rounded bg-white/20 border border-white/20"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
            />

            {/* MEDICATIONS */}
            <input
              type="text"
              placeholder="Current Medications (optional)"
              className="w-full mb-4 p-3 rounded bg-white/20 border border-white/20"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
            />

            {/* EMERGENCY NAME */}
            <input
              type="text"
              placeholder="Emergency Contact Name"
              className="w-full mb-4 p-3 rounded bg-white/20 border border-white/20"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
            />

            {/* EMERGENCY PHONE */}
            <input
              type="text"
              placeholder="Emergency Contact Phone"
              className="w-full mb-6 p-3 rounded bg-white/20 border border-white/20"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
            />

            <button className="w-full bg-blue-600 py-3 rounded font-bold hover:scale-[1.02] transition">
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
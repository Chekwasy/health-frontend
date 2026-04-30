"use client";

import Nav from "@/app/components/nav";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DeleteSchedule() {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const token = Cookies.get("access_token");

      const loading = toast.loading("Deleting schedule...");

      await axios.delete("/api/doctor/schedule", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Schedule deleted", { id: loading });
      router.push("/doctor/schedule/add");
    } catch (err: any) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "linear-gradient(rgba(5,15,30,0.9), rgba(5,15,30,0.9)), url('/bg.jpeg')" }}
    >
      <Nav />

      <div className="bg-white/10 p-8 rounded text-white text-center">
        <h1 className="text-xl mb-4">Delete Schedule</h1>
        <p className="mb-6 text-gray-300">
          This will remove all your available slots.
        </p>

        <button onClick={handleDelete} className="bg-red-600 px-6 py-3 rounded">
          Delete All
        </button>
      </div>
    </div>
  );
}
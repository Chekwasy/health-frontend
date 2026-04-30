"use client";

import Nav from "@/app/components/nav";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function DeleteSchedule() {
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    try {
      const token = Cookies.get("access_token");

      const loading = toast.loading("Deleting schedule...");

      await axios.delete("/api/doctor/schedule/removeall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Schedule deleted successfully", { id: loading });
      setDeleted(true);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to delete"
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,15,30,0.9), rgba(5,15,30,0.9)), url('/bg.jpeg')",
      }}
    >
      <Nav />

      <div className="bg-white/10 backdrop-blur-md p-8 rounded text-white text-center max-w-md w-full">
        {/* 🔥 AFTER DELETE */}
        {deleted ? (
          <>
            <h1 className="text-xl mb-4">Schedule Removed</h1>

            <p className="text-gray-300 mb-6">
              Your available slots have been deleted successfully.
            </p>

            <Link href="/doctor/schedule/add">
              <button className="bg-green-600 px-6 py-3 rounded font-bold">
                Add New Schedule
              </button>
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl mb-4">Delete Schedule</h1>

            <p className="mb-6 text-gray-300">
              This will permanently remove all your available slots.
              <br />
              <span className="text-red-400 font-semibold">
                This action cannot be undone.
              </span>
            </p>

            {/* 🔥 FIRST STEP */}
            {!confirming && (
              <button
                onClick={() => setConfirming(true)}
                className="bg-red-600 px-6 py-3 rounded font-bold hover:bg-red-700 transition"
              >
                Delete All
              </button>
            )}

            {/* 🔥 CONFIRMATION STEP */}
            {confirming && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-yellow-400">
                  Are you sure you want to delete all your schedule?
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleDelete}
                    className="bg-red-700 px-5 py-2 rounded font-bold"
                  >
                    Yes, Delete
                  </button>

                  <button
                    onClick={() => setConfirming(false)}
                    className="bg-gray-600 px-5 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
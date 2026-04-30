"use client";

import Nav from "@/app/components/nav";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddSchedule() {
  const router = useRouter();

  const [interval, setInterval] = useState(30);
  const [blocks, setBlocks] = useState([{ start: "", end: "" }]);

  const addBlock = () => {
    setBlocks([...blocks, { start: "", end: "" }]);
  };

  const handleChange = (i: number, field: string, value: string) => {
    const updated = [...blocks];
    updated[i][field as "start" | "end"] = value;
    setBlocks(updated);
  };

  const handleSubmit = async () => {
    try {
      const token = Cookies.get("access_token");

      const loading = toast.loading("Creating schedule...");

      await axios.post(
        "/api/doctor/schedule/add",
        {
          interval,
          blocks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Schedule created 🎉", { id: loading });
      router.push("/doctor/schedule/view");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,15,30,0.9), rgba(5,15,30,0.9)), url('/bg.jpeg')",
      }}
    >
      <Nav />

      <div className="pt-24 max-w-xl mx-auto text-white px-4">
        <h1 className="text-2xl font-bold mb-4">Add Schedule</h1>

        {/* 🔥 GUIDE */}
        <div className="bg-white/10 p-4 rounded mb-6 text-sm text-gray-300">
          <p className="font-semibold text-white mb-2">
            How to create your schedule:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Select how long each appointment should take</li>
            <li>Pick a start time and end time for your availability</li>
            <li>Add multiple blocks if you want breaks in between</li>
            <li>Make sure your schedule is within the next 72 hours</li>
          </ul>
        </div>

        {/* 🔥 INTERVAL */}
        <label className="block mb-1 text-sm">Select Interval</label>
        <select
          className="w-full mb-6 p-3 rounded bg-white/20 text-black"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
        >
          <option value={15} className="text-black">
            15 mins
          </option>
          <option value={30} className="text-black">
            30 mins
          </option>
          <option value={60} className="text-black">
            1 hour
          </option>
        </select>

        {/* 🔥 BLOCKS */}
        {blocks.map((b, i) => (
          <div key={i} className="mb-6 bg-white/10 p-4 rounded">
            <p className="mb-2 font-semibold">Block {i + 1}</p>

            {/* START TIME */}
            <label className="block text-sm mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              className="w-full mb-3 p-3 rounded bg-white/20 border border-white/20"
              value={b.start}
              onChange={(e) =>
                handleChange(i, "start", e.target.value)
              }
            />

            {/* END TIME */}
            <label className="block text-sm mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              className="w-full p-3 rounded bg-white/20 border border-white/20"
              value={b.end}
              onChange={(e) =>
                handleChange(i, "end", e.target.value)
              }
            />
          </div>
        ))}

        {/* ADD BLOCK */}
        <button
          onClick={addBlock}
          className="mb-4 bg-gray-600 px-4 py-2 rounded"
        >
          + Add Another Time Block
        </button>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 py-3 rounded font-bold hover:scale-[1.02] transition"
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
}
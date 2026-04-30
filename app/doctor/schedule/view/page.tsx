"use client";

import Nav from "@/app/components/nav";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";

export default function ViewSchedule() {
  const [slots, setSlots] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSlots = async () => {
    try {
      setLoading(true);

      const token = Cookies.get("access_token");

      const res = await axios.get("/api/doctor/schedule/slots", {
        params: {
          date,
          page,
          limit: 12,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSlots(res.data.slots || []);
      setTotalPages(res.data.pagination?.total_pages || 0);
    } catch (err) {
      console.error(err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [date, page]);

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,15,30,0.9), rgba(5,15,30,0.9)), url('/bg.jpeg')",
      }}
    >
      <Nav />

      <div className="pt-24 max-w-4xl mx-auto text-white px-4">
        <h1 className="text-2xl mb-6">Your Schedule</h1>

        {/* 🔥 FILTERS */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <input
            type="date"
            className="p-2 rounded bg-white/20"
            value={date}
            onChange={(e) => {
              setPage(1);
              setDate(e.target.value);
            }}
          />

          <button
            onClick={() => {
              setDate("");
              setPage(1);
            }}
            className="bg-gray-600 px-3 py-2 rounded"
          >
            Reset
          </button>
        </div>

        {/* 🔥 LOADING */}
        {loading && <p className="text-gray-300">Loading...</p>}

        {/* 🔥 EMPTY STATE */}
        {!loading && slots.length === 0 && (
          <div className="bg-white/10 p-6 rounded text-center">
            <h2 className="text-xl mb-2">No schedule found</h2>
            <p className="text-gray-300 mb-4">
              You have not created any availability yet.
            </p>

            <Link href="/doctor/schedule/add">
              <button className="bg-green-600 px-6 py-2 rounded">
                Add Schedule
              </button>
            </Link>
          </div>
        )}

        {/* 🔥 SLOTS */}
        {slots.length > 0 && (
          <>
            {/* 🔥 ACTION BUTTONS */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <p className="text-gray-300 text-sm">
                Showing {slots.length} slots
              </p>

              <div className="flex gap-2">
                <Link href="/doctor/schedule/add">
                  <button className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition">
                    Add More
                  </button>
                </Link>

                <Link href="/doctor/schedule/delete">
                  <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition">
                    Delete Schedule
                  </button>
                </Link>
              </div>
            </div>

            {/* 🔥 SLOT GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {slots.map((slot: any) => {
                const start = new Date(slot.start_time);
                const end = new Date(slot.end_time);

                const interval =
                  (end.getTime() - start.getTime()) / (1000 * 60);

                return (
                  <div
                    key={slot.id}
                    className="bg-white/10 p-4 rounded shadow-md"
                  >
                    {/* TIME RANGE */}
                    <p className="font-semibold text-lg">
                      {start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {end.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* INTERVAL */}
                    <p className="text-sm text-gray-300 mt-1">
                      Interval: {interval} mins
                    </p>

                    {/* STATUS */}
                    <p
                      className={`text-sm mt-2 ${
                        slot.is_booked
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {slot.is_booked ? "Booked" : "Available"}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 🔥 PAGINATION */}
            <div className="flex justify-center mt-6 gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="bg-gray-600 px-4 py-2 rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span className="self-center">
                Page {page} / {totalPages || 1}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="bg-gray-600 px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
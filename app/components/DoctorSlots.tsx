"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export default function DoctorSlots({
  doctorId,
}: {
  doctorId: string;
}) {
  const [slots, setSlots] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<any>(null);

  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);

  const [selectedSlot, setSelectedSlot] =
    useState<any>(null);

  const [reason, setReason] = useState("");

  // 🔥 FETCH SLOTS
  const fetchSlots = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/api/doctor/${doctorId}/slots`,
        {
          params: { page, date },
        }
      );

      setSlots(res.data.slots || []);
      setDoctor(res.data.doctor || null);
      setTotalPages(res.data.pagination?.total_pages || 0);
    } catch (err) {
      console.error(err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) fetchSlots();
  }, [doctorId, date, page]);

  // 🔥 BOOK SLOT
  const handleBooking = async () => {
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }

    if (!reason || reason.length < 5) {
      toast.error("Enter a valid reason");
      return;
    }

    try {
      const token = Cookies.get("access_token");

      const loadingToast = toast.loading("Booking...");

      await axios.post(
        "/api/patient/appointments/book",
        {
          slot_id: selectedSlot.id,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Appointment booked 🎉", {
        id: loadingToast,
      });

      // 🔥 RESET STATE
      setSelectedSlot(null);
      setReason("");

      // 🔥 REFRESH SLOTS
      fetchSlots();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Booking failed"
      );
    }
  };

  if (!doctorId) return null;

  return (
    <div className="bg-white/10 p-6 rounded-xl text-white">
      {/* 🔥 DOCTOR INFO */}
      {doctor && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {doctor.name}
          </h2>
          <p className="text-gray-300 text-sm">
            {doctor.specialty || "General"} •{" "}
            {doctor.experience || 0} yrs experience
          </p>
        </div>
      )}

      {/* 🔥 FILTER */}
      <div className="flex gap-3 mb-6 flex-wrap">
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
      {loading && (
        <p className="text-gray-300">Loading slots...</p>
      )}

      {/* 🔥 EMPTY */}
      {!loading && slots.length === 0 && (
        <div className="text-center bg-white/10 p-6 rounded">
          No available slots for this doctor.
        </div>
      )}

      {/* 🔥 SLOTS */}
      {slots.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const start = new Date(slot.start_time);
              const end = new Date(slot.end_time);

              const interval =
                (end.getTime() - start.getTime()) /
                (1000 * 60);

              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-4 rounded cursor-pointer transition ${
                    selectedSlot?.id === slot.id
                      ? "bg-green-600"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {/* TIME */}
                  <p className="font-semibold">
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
                  <p className="text-sm text-gray-300">
                    {interval} mins
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

      {/* 🔥 BOOKING FORM */}
      {selectedSlot && (
        <div className="mt-8 bg-white/10 p-4 rounded">
          <h3 className="mb-3 font-semibold">
            Book Selected Slot
          </h3>

          <textarea
            className="w-full p-3 rounded bg-white text-black mb-3"
            placeholder="Enter reason for appointment..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button
            onClick={handleBooking}
            className="w-full bg-green-600 py-3 rounded font-bold"
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}
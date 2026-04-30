"use client";

import Nav from "@/app/components/nav";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PatientAppointments() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const token = Cookies.get("access_token");

      const res = await axios.get(
        "/api/patient/appointments/my",
        {
          params: { page },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppointments(res.data.appointments || []);
      setTotalPages(res.data.pagination?.total_pages || 0);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page]);

  // 🔥 CANCEL HANDLER
  const handleCancel = async (appointmentId: string) => {
    try {
      const token = Cookies.get("access_token");

      const loadingToast = toast.loading("Cancelling...");

      await axios.patch(
        "/api/patient/appointments/cancel",
        { appointment_id: appointmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Appointment cancelled", {
        id: loadingToast,
      });

      fetchAppointments(); // 🔥 refresh
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Cancel failed"
      );
    }
  };

  // 🔥 RESCHEDULE HANDLER
  const handleReschedule = async (a: any) => {
    try {
      const token = Cookies.get("access_token");

      const loadingToast = toast.loading("Preparing reschedule...");

      // 🔥 STEP 1: cancel current
      await axios.patch(
        "/api/patient/appointments/cancel",
        { appointment_id: a.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Select a new slot", {
        id: loadingToast,
      });

      // 🔥 STEP 2: redirect with doctorId
      router.push(
        `/patient/appointment/available-doctors?doctorId=${a.doctor_id}`
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Reschedule failed"
      );
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

      <div className="pt-24 max-w-4xl mx-auto text-white px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          My Appointments
        </h1>

        {/* 🔥 LOADING */}
        {loading && (
          <p className="text-center text-gray-300">
            Loading appointments...
          </p>
        )}

        {/* 🔥 EMPTY */}
        {!loading && appointments.length === 0 && (
          <div className="bg-white/10 p-6 rounded text-center">
            <h2 className="text-xl mb-2">
              No appointments yet
            </h2>
            <p className="text-gray-300">
              You haven’t booked any appointments.
            </p>
          </div>
        )}

        {/* 🔥 LIST */}
        {appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((a) => {
              const start = a.slot
                ? new Date(a.slot.start_time)
                : null;

              const end = a.slot
                ? new Date(a.slot.end_time)
                : null;

              const isCancelled = a.status === "CANCELLED_BY_PATIENT" || a.status === "CANCELLED_BY_DOCTOR";

              return (
                <div
                  key={a.id}
                  className="bg-white/10 p-5 rounded-xl"
                >
                  {/* DOCTOR */}
                  <h2 className="text-lg font-semibold">
                    {a.doctor || "Doctor"}
                  </h2>

                  {/* TIME */}
                  {start && end && (
                    <p className="text-gray-300 text-sm mt-1">
                      {start.toLocaleDateString()} •{" "}
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
                  )}

                  {/* REASON */}
                  <p className="mt-2 text-gray-200">
                    {a.reason}
                  </p>

                  {/* STATUS */}
                  <div className="mt-3">
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        a.status === "PENDING"
                          ? "bg-yellow-500"
                          : a.status === "CONFIRMED"
                          ? "bg-green-600"
                          : a.status === "CANCELLED_BY_PATIENT" || a.status === "CANCELLED_BY_DOCTOR"
                          ? "bg-red-600"
                          : "bg-gray-500"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  {/* 🔥 ACTIONS */}
                  {!isCancelled && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="bg-red-600 px-4 py-2 rounded text-sm"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => handleReschedule(a)}
                        className="bg-blue-600 px-4 py-2 rounded text-sm"
                      >
                        Reschedule
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 🔥 PAGINATION */}
        {appointments.length > 0 && (
          <div className="flex justify-center mt-8 gap-4">
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
        )}
      </div>
    </div>
  );
}
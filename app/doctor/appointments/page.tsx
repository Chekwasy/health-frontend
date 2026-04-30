"use client";

import Nav from "@/app/components/nav";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [actionModal, setActionModal] = useState<{
    type: "cancel" | "confirm" | null;
    appointment: any | null;
  }>({ type: null, appointment: null });

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const token = Cookies.get("access_token");

      const res = await axios.get("/api/doctor/appointments/view", {
        params: { page },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAppointments(res.data.appointments || []);
      setTotalPages(res.data.pagination?.total_pages || 0);
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page]);

  // 🔥 EXECUTE ACTION
  const handleAction = async () => {
    if (!actionModal.appointment) return;

    const token = Cookies.get("access_token");
    const loadingToast = toast.loading("Processing...");

    try {
      if (actionModal.type === "cancel") {
        await axios.patch(
          "/api/doctor/appointments/cancel",
          { appointment_id: actionModal.appointment.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Cancelled (slot blocked)", {
          id: loadingToast,
        });
      }

      if (actionModal.type === "confirm") {
        await axios.patch(
          "/api/doctor/appointments/confirm",
          { appointment_id: actionModal.appointment.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Appointment confirmed", {
          id: loadingToast,
        });
      }

      setActionModal({ type: null, appointment: null });
      fetchAppointments();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Action failed"
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

      <div className="pt-24 max-w-5xl mx-auto text-white px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Patient Appointments
        </h1>

        {loading && (
          <p className="text-center text-gray-300">
            Loading...
          </p>
        )}

        {!loading && appointments.length === 0 && (
          <div className="bg-white/10 p-6 rounded text-center">
            <h2>No appointments found</h2>
          </div>
        )}

        {appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((a) => {
              const start = a.slot
                ? new Date(a.slot.start_time)
                : null;

              const end = a.slot
                ? new Date(a.slot.end_time)
                : null;

              const interval =
                start && end
                  ? (end.getTime() - start.getTime()) / 60000
                  : null;

              const isCancelled =
                a.status === "CANCELLED_BY_DOCTOR" ||
                a.status === "CANCELLED_BY_PATIENT";

              return (
                <div key={a.id} className="bg-white/10 p-5 rounded-xl">
                  <h2 className="text-lg font-semibold">
                    {a.patient?.name || "Patient"}
                  </h2>

                  {a.patient?.phone && (
                    <p className="text-gray-400 text-sm">
                      {a.patient.phone}
                    </p>
                  )}

                  {/* 🔥 TIME + INTERVAL */}
                  {start && end && (
                    <div className="mt-2 text-sm text-gray-300">
                      <p>
                        {start.toLocaleDateString()}
                      </p>
                      <p>
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
                      <p className="text-xs text-gray-400">
                        Interval: {interval} mins
                      </p>
                    </div>
                  )}

                  <p className="mt-2">{a.reason}</p>

                  <div className="mt-3">
                    <span className="px-3 py-1 rounded bg-gray-700">
                      {a.status}
                    </span>
                  </div>

                  {/* 🔥 ACTIONS */}
                  {!isCancelled && (
                    <div className="mt-4 flex gap-3">
                      {a.status === "PENDING" && (
                        <button
                          onClick={() =>
                            setActionModal({
                              type: "confirm",
                              appointment: a,
                            })
                          }
                          className="bg-green-600 px-4 py-2 rounded"
                        >
                          Confirm
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setActionModal({
                            type: "cancel",
                            appointment: a,
                          })
                        }
                        className="bg-red-600 px-4 py-2 rounded"
                      >
                        Cancel
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
              className="bg-gray-600 px-4 py-2 rounded"
            >
              Prev
            </button>

            <span>
              Page {page} / {totalPages || 1}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="bg-gray-600 px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* 🔥 MODAL */}
      {actionModal.type && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#020617] p-6 rounded-xl max-w-md w-full text-white">
            <h2 className="text-xl font-semibold mb-4">
              Are you sure?
            </h2>

            {actionModal.type === "cancel" && (
              <p className="text-red-400 mb-4">
                This will cancel the appointment and BLOCK the slot permanently.
              </p>
            )}

            {actionModal.type === "confirm" && (
              <p className="text-green-400 mb-4">
                This will confirm the appointment. This action cannot be undone.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAction}
                className="bg-blue-600 px-4 py-2 rounded w-full"
              >
                Yes, continue
              </button>

              <button
                onClick={() =>
                  setActionModal({ type: null, appointment: null })
                }
                className="bg-gray-600 px-4 py-2 rounded w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
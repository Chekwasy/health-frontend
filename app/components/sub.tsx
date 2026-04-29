"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function Sub() {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [PaystackPop, setPaystackPop] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => setIsOpen(false);

  const handleOverlayClick = (e: any) => {
    if (e.target.classList.contains("popup-overlay")) handleClose();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@paystack/inline-js")
        .then((module) => setPaystackPop(new module.default()))
        .catch(() => {
          setMsg("Failed to load payment gateway.");
          setIsOpen(true);
        });
    }
  }, []);

  const handleProceed = async () => {
    if (!selectedPlan) {
      setMsg("Please select a plan.");
      setIsOpen(true);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "/api/initpay",
        {},
        {
          headers: {
            tok: Cookies.get("trybet_tok"),
            plan: selectedPlan,
          },
        },
      );

      if (!PaystackPop) throw new Error("Payment not ready");

      PaystackPop.resumeTransaction(response.data.access_code, {
        onSuccess: async (transaction: any) => {
          try {
            const verify = await axios.post(
              "/api/verify",
              {},
              {
                headers: {
                  tok: Cookies.get("trybet_tok"),
                  reference: transaction.reference,
                },
              },
            );

            setMsg(verify.data.message);
          } catch {
            setMsg("Payment successful, but verification failed.");
          }

          setIsOpen(true);
          setLoading(false);
        },
        onClose: () => {
          setMsg("Transaction canceled.");
          setIsOpen(true);
          setLoading(false);
        },
      });
    } catch {
      setMsg("Something went wrong. Try again.");
      setIsOpen(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 md:p-8">
        {/* HEADER */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
          Upgrade Your Access 🚀
        </h1>
        <p className="text-center text-gray-500 mt-2 mb-6">
          Choose a plan that works for you
        </p>

        {/* PLANS */}
        <div className="space-y-4">
          {/* WEEKLY */}
          <div
            onClick={() => setSelectedPlan("weekly")}
            className={`p-5 rounded-xl border cursor-pointer transition-all
              ${
                selectedPlan === "weekly"
                  ? "border-indigo-600 bg-indigo-50 shadow-md"
                  : "border-gray-200 hover:border-indigo-400"
              }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Weekly</h3>
              <span className="text-indigo-600 font-bold text-xl">₦250</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">Good for quick testing</p>
          </div>

          {/* MONTHLY */}
          <div
            onClick={() => setSelectedPlan("monthly")}
            className={`p-5 rounded-xl border cursor-pointer transition-all relative
              ${
                selectedPlan === "monthly"
                  ? "border-indigo-600 bg-indigo-50 shadow-md"
                  : "border-gray-200 hover:border-indigo-400"
              }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Monthly</h3>
              <span className="text-indigo-600 font-bold text-xl">₦800</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Best value for regular users
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleProceed}
          disabled={!selectedPlan || loading}
          className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition
            ${
              selectedPlan && !loading
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? "Processing..." : "Continue to Payment"}
        </button>

        {/* TRUST TEXT */}
        <p className="text-center text-xs text-gray-400 mt-3">
          Secure payment powered by Paystack 🔒
        </p>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div
          className="popup-overlay fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center shadow-lg">
            <p className="text-gray-800 font-medium mb-4">{msg}</p>
            <button
              onClick={handleClose}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

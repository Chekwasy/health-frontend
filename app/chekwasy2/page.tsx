"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function TxForm() {
  const [option, setOption] = useState<string | null>(null); // first group
  const [result, setResult] = useState<string | null>(null); // second group
  const [day, setDay] = useState<string | null>(null); // third group
  const [index, setIndex] = useState<number | null>(null); // fourth group
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!option || !result || !day || index === null) {
      alert("Please select one option from each group.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/postx2', {}, {
                headers: {
                'tok': Cookies.get('trybet_tok') || '',
                'Content-Type': 'application/json',
                saved: JSON.stringify({ option, result, day, index }),
                },
            });
      console.log("Success:", response.data);
      alert("Submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md space-y-6">
      {/* First Group */}
      <div>
        <h3 className="font-semibold mb-2">Choose Option</h3>
        {["two2win", "point5", "point5pro"].map((item) => (
          <label key={item} className="block">
            <input
              type="checkbox"
              checked={option === item}
              onChange={() => setOption(item)}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </div>

      {/* Second Group */}
      <div>
        <h3 className="font-semibold mb-2">Result</h3>
        {["Won", "Lost"].map((item) => (
          <label key={item} className="block">
            <input
              type="checkbox"
              checked={result === item}
              onChange={() => setResult(item)}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </div>

      {/* Third Group (Yesterday / Today) */}
      <div>
        <h3 className="font-semibold mb-2">Day</h3>
        {["yest", "today"].map((item) => (
          <label key={item} className="block">
            <input
              type="checkbox"
              checked={day === item}
              onChange={() => setDay(item)}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </div>

      {/* Fourth Group (Index 0–7) */}
      <div>
        <h3 className="font-semibold mb-2">Index (0–7)</h3>
        {[...Array(8)].map((_, i) => (
          <label key={i} className="inline-block mr-4">
            <input
              type="checkbox"
              checked={index === i}
              onChange={() => setIndex(i)}
              className="mr-1"
            />
            {i}
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

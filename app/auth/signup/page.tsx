"use client";

import { useState, FormEvent, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";

import { checkpwd } from "../../tools/func";

function SignupPage() {
  const router = useRouter();

  const [title, setTitle] = useState("Mr");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // full number
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidInputChars = useCallback((str: string) => {
    return str.length <= 50 && checkpwd(str);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!firstname || !lastname || !email || !password || !phone) {
        toast.error("Please fill all fields");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (!isValidInputChars(firstname) || !isValidInputChars(lastname)) {
        toast.error("Invalid name characters");
        return;
      }

      try {
        const authHeader = btoa(`${email}:${password}`);
        const loading = toast.loading("Creating account...");

        const response = await axios.post("/api/users/puser", {
          emailpwd: `encoded ${authHeader}`,
          firstname,
          lastname,
          role,
          title,
          phone, // 🔥 already includes country code
        });

        toast.success("Signup successful 🎉", { id: loading });

        const next = response.data.nextStep || "/auth/login";
        router.push(next);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Signup failed");
        } else {
          toast.error("Unexpected error");
        }
      }
    },
    [firstname, lastname, email, password, confirmPassword, phone, role, title]
  );

  return (
    <div
      className="min-h-screen flex justify-center items-center p-4 bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,15,30,0.85), rgba(5,15,30,0.9)), url('/bg.jpeg')",
      }}
    >
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-4">
          Create Account
        </h2>

        {/* ROLE */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setRole("PATIENT")}
            className={`flex-1 p-2 rounded ${
              role === "PATIENT"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("DOCTOR")}
            className={`flex-1 p-2 rounded ${
              role === "DOCTOR"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <select
            className="w-full mb-3 p-3 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          >
            <option>Mr</option>
            <option>Mrs</option>
            <option>Miss</option>
            <option>Dr</option>
            <option>Prof</option>
          </select>

          <input
            className="w-full mb-3 p-3 border rounded"
            placeholder="First Name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />

          <input
            className="w-full mb-3 p-3 border rounded"
            placeholder="Last Name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />

          <input
            className="w-full mb-3 p-3 border rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* 🔥 PHONE INPUT */}
          <div className="mb-3">
            <PhoneInput
  country="in"
  value={phone}
  onChange={(phone) => setPhone("+" + phone)}
  containerClass="w-full mb-3"
  inputClass="!w-full !h-[48px] !pl-14 !pr-3 !border !border-gray-300 !rounded-md !bg-white !text-gray-900 !text-sm"
  buttonClass="!bg-white !border !border-gray-300 !rounded-l-md"
  dropdownClass="!bg-white !text-gray-900"
/>
          </div>

          {/* PASSWORD */}
          <div className="relative mb-3">
            <input
              className="w-full p-3 border rounded pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative mb-4">
            <input
              className="w-full p-3 border rounded pr-10"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded font-bold">
            Sign Up
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
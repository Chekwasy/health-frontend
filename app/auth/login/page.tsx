"use client";

import { useState, FormEvent, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { checkpwd } from "../../tools/func";

function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValidInputChars = useCallback((str: string) => {
    return str.length <= 50 && checkpwd(str);
  }, []);

  const handleLoginSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!email || !password) {
        toast.error("Please fill all fields");
        return;
      }

      if (
        email.length < 6 ||
        !email.includes("@") ||
        !email.includes(".") ||
        !isValidInputChars(email)
      ) {
        toast.error("Invalid email format");
        return;
      }

      if (password.length < 6 || !isValidInputChars(password)) {
        toast.error("Invalid password format");
        return;
      }

      try {
        const authHeader = btoa(`${email}:${password}`);
        const loading = toast.loading("Logging in...");

        const response = await axios.post("/api/auth/connect", {
          auth_header: `Basic ${authHeader}`,
        });

        // 🔥 Supabase session
        const session = response.data.session;

        if (session?.access_token) {
          Cookies.set("access_token", session.access_token, {
            expires: 7,
          });
        }

        toast.success("Login successful 🎉", { id: loading });

        router.push("/");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Login failed"
          );
        } else {
          toast.error("Unexpected error");
        }
      }
    },
    [email, password, isValidInputChars, router]
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
          Welcome Back
        </h2>

        <p className="text-gray-600 text-sm mb-6 text-center">
          Login to continue
        </p>

        <form onSubmit={handleLoginSubmit}>
          {/* EMAIL */}
          <input
            className="w-full mb-3 p-3 border rounded text-gray-800"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
              className="w-full p-3 border rounded pr-10 text-gray-800"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* BUTTON */}
          <button className="w-full bg-blue-600 text-white py-3 rounded font-bold">
            Log In
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600">
            Sign Up
          </Link>
        </p>

        <p className="text-center mt-2 text-sm">
          Forgot Password?{" "}
          <Link href="/auth/fpwd" className="text-blue-600">
            Reset
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
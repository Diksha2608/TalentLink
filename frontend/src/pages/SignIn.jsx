import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/auth";

export default function SignIn({ setUser }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const navigate = useNavigate();

  // 🔐 Handle Sign In
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await authAPI.login(formData.email, formData.password);

    // ✅ If tokens are present, login succeeded
    if (response.data?.access && response.data?.refresh) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      const userResponse = await authAPI.me();
      setUser(userResponse.data);

      // ✅ Show success before redirecting
      setResetStatus("✅ Login successful! Redirecting...");
      setError(""); // clear any old error

      setTimeout(() => {
        if (userResponse.data.role === "freelancer") {
          if (!userResponse.data.profile_complete) {
            navigate("/onboarding");
          } else {
            navigate("/dashboard/freelancer");
          }
        } else {
          navigate("/dashboard/client");
        }
      }, 2000); // delay 2s for user to see message
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);

    // ✅ Display proper backend error messages if available
    const detail =
      err.response?.data?.detail ||
      err.response?.data?.non_field_errors?.[0] ||
      "Invalid email or password.";

    setError(detail);
    setResetStatus(""); // clear any success messages

    // Keep error visible for 5 seconds
    setTimeout(() => setError(""), 5000);
  } finally {
    setLoading(false);
  }
};

  // 🔄 Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetStatus("");
    setError("");

    if (!resetEmail) {
      setError("Please enter your registered email.");
      return;
    }

    try {
      setResetStatus("Sending reset link...");
      const res = await authAPI.forgotPassword(resetEmail);
      if (res.status === 200 || res.status === 201) {
        setResetStatus("Password reset link sent! Check your inbox.");
      } else {
        setError("No account found with this email.");
      }
    } catch (err) {
      console.error(
        "Forgot password error:",
        err.response?.data || err.message
      );
      if (err.response?.status === 400) {
        setError("No account found with this email address.");
      } else {
        setError("Failed to send reset link. Try again.");
      }
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900";

  // 🔁 Forgot Password UI
  if (forgotMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900">
              Forgot Password
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Enter your email to reset your password
            </p>
          </div>

          <form
            onSubmit={handleForgotPassword}
            className="bg-white shadow-xl rounded-lg p-8 space-y-6"
          >
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                <p className="text-sm">{error}</p>
              </div>
            )}
            {resetStatus && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded">
                <p className="text-sm">{resetStatus}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={inputCls}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-lg"
            >
              Send Reset Link
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="text-purple-600 hover:underline font-medium"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 🧠 Sign In UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2 text-lg">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-lg p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Login Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={inputCls}
              placeholder="your.email@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password + Eye toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`${inputCls} pr-12`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPwd((v) => !v);
                }}
                aria-label={showPwd ? "Hide password" : "Show password"}
                aria-pressed={showPwd}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                title={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? (
                  // 👁️‍🗨️ Eye Off Icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 3l18 18M10.584 10.59A3 3 0 0012 15a3 3 0 002.828-1.99M9.88 4.603A9.74 9.74 0 0112 4.5c5.523 0 10 4.5 10 7.5-.492 1.4-1.64 2.985-3.29 4.326M6.228 6.222C4.06 7.666 2.5 9.57 2 12c.22.95.82 2.053 1.74 3.12 1.01 1.174 2.39 2.28 4.07 3.04 1.68.76 3.65 1.2 6.19.84"
                    />
                  </svg>
                ) : (
                  // 👁️ Eye Icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-purple-600 hover:underline text-sm"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center">
            <p className="text-gray-600 mb-3">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-purple-600 hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

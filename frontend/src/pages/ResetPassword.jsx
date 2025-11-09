import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending payload:", { token, password });
      const res = await axios.post(
        "http://127.0.0.1:8000/api/password_reset/confirm/",
        { token, password }
      );

      console.log("Password reset response:", res.data);

      if (
        res.data.status === "OK" ||
        res.data.detail?.toLowerCase().includes("reset") ||
        res.data.message?.toLowerCase().includes("reset")
      ) {
        setMessage("Password reset successful! Redirecting to Sign In...");
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Reset error:", err.response?.data || err.message);

      if (err.response?.data?.password) {
        // Django sends password validation errors as an array
        setError(err.response.data.password.join(" "));
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors.join(" "));
      } else {
        setError("Invalid or expired token. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2 text-lg">
            Enter your new password below
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-lg p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded">
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* 🔒 New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pr-12`}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                aria-pressed={showPwd}
                title={showPwd ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPwd ? (
                  // Eye Off Icon
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
                  // Eye Icon
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
          </div>

          {/* 🔐 Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPwd ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputCls} pr-12`}
                placeholder="Re-enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd((v) => !v)}
                aria-label={showConfirmPwd ? "Hide password" : "Show password"}
                aria-pressed={showConfirmPwd}
                title={showConfirmPwd ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showConfirmPwd ? (
                  // Eye Off Icon
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
                  // Eye Icon
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="text-purple-600 hover:underline font-medium mt-2"
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

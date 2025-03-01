import { useState } from "react";

export default function ResetPasswordPrompt({ isOpen, onClose, onSubmit }) {
  const [newPassword, setNewPassword] = useState("");

  if (!isOpen) return null; // Don't render if modal is closed

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[350px] text-center border border-gray-300">
        <h3 className="text-xl font-semibold text-gray-800">🔑 Reset Password</h3>
        <p className="text-sm text-gray-600 mt-2">Enter your new password below:</p>

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="w-full mt-4 p-3 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />

        <div className="flex justify-between mt-4">
          <button
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
            onClick={() => onSubmit(newPassword)}
          >
            ✅ Confirm
          </button>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
            onClick={onClose}
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

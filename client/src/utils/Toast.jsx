// Toast.js
import React from "react";
import toast, { Toaster } from "react-hot-toast";

// Mount this once
export const ToastBar = () => (
  <Toaster
    position="top-center"  
    toastOptions={{
      style: {
        padding: "16px 24px",
        borderRadius: "8px",
        color: "#fff",
        fontWeight: "500",
      },
      success: { style: { background: "#1677ff" } },
      error: { style: { background: "#d4380d" } },
    }}
  />
);

// Helper function
export const showToast = (message, type = "default") => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    default:
      toast(message);
  }
};

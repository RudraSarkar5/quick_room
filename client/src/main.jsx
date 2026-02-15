import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastBar } from "./utils/Toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ToastBar/>
    <App />
  </BrowserRouter>
);

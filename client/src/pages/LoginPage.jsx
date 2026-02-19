import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { showToast } from "../utils/Toast";

function LoginPage() {
  const [roomId, setRoomId] = useState("");
  const [key, setKey] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!roomId || !key) {
      showToast("Please enter both Room ID and Key", "error");
      return;
    }

    try {
      const res = await API.post("/rooms", { roomId, key });

      // Store token & roomId
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("roomId", roomId);

      // Show success toast
      showToast("Login successful!", "success");
 
      navigate("/room");
     
    } catch (err) {
      // Show error toast
      showToast(
        "Login failed: " + (err.response?.data?.message || err.message),
        "error"
      );
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome 👋</h2>
        <p style={styles.subtitle}>Enter your Room ID and Key to continue</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Room ID</label>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Key</label>
            <input
              type="password"
              placeholder="Enter Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Enter Room
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1677ff, #69c0ff)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "14px",
    width: "350px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  title: { marginBottom: "5px", textAlign: "center" },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    marginBottom: "25px",
  },
  form: { display: "flex", flexDirection: "column" },
  inputGroup: { marginBottom: "18px", display: "flex", flexDirection: "column" },
  label: { fontSize: "13px", marginBottom: "6px", color: "#555" },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
  button: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1677ff",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default LoginPage;

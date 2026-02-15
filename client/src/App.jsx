import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RoomPage from "./pages/RoomPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/room" element={<RoomPage />} />
    </Routes>
  );
}

export default App;

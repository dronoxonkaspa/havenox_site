import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/ui/Navbar.jsx";
import Footer from "./components/ui/Footer.jsx";
import Home from "./pages/ui/Home.jsx";
import LiveTent from "./components/LiveTent.jsx";
import CreateTent from "./pages/CreateTent.jsx";
import "./styles/cyberpunk.css";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/livetent" element={<LiveTent />} />
        <Route path="/createtent" element={<CreateTent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import About from "./pages/About";
import FAQ from "./pages/FAQ"; // ✅ Added FAQ page
import Create from "./pages/Create";
import "./index.css";

export default function App() {
  return (
    <div className="min-h-screen bg-[#00040A] text-[#C0C7C9]">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} /> {/* ✅ About route */}
          <Route path="/faq" element={<FAQ />} /> {/* ✅ FAQ route */}
          <Route path="/create" element={<Create />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-[#00E8C8]/20 mt-10">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()}{" "}
          <span className="text-[#00FFA3] font-semibold">TradeHaven</span>. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

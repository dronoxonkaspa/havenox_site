import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/cyberpunk.css";

export default function Navbar() {
  return (
    <nav className="cyber-navbar">
      <div className="logo">HAVENOX</div>
      <ul>
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/livetent">Live Tent</NavLink></li>
        <li><NavLink to="/createtent">Create Tent</NavLink></li>
      </ul>
    </nav>
  );
}

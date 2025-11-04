import React from "react";
import "/src/styles/havenox.css";

export default function Footer() {
  return (
    <footer className="cyber-footer">
      <p>© {new Date().getFullYear()} HavenOx — Built on Kaspa Energy</p>
    </footer>
  );
}

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://shavenox-backend.onrender.com", {
  transports: ["polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default function LiveTent() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    socket.on("connect", () =>
      setEvents((e) => [...e, { type: "system", text: "? Connected" }])
    );
    socket.on("connect_error", (err) =>
      setEvents((e) => [...e, { type: "error", text: `? ${err.message}` }])
    );
    socket.on("transactionStatus", (data) =>
      setEvents((e) => [...e, { type: "tx", text: data?.status || "No status" }])
    );
    socket.on("disconnect", () =>
      setEvents((e) => [...e, { type: "system", text: "? Disconnected" }])
    );
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("transactionStatus");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div style={{ padding: "1rem", color: "white" }}>
      <h2>?? Live Tent Activity</h2>
      <div style={{
          border: "1px solid #00f0ff",
          background: "rgba(0, 0, 0, 0.3)",
          padding: "1rem",
          borderRadius: "8px",
          height: "400px",
          overflowY: "auto"
      }}>
        {events.map((e, i) => (
          <div key={i}>
            <strong>{e.type.toUpperCase()}:</strong> {e.text}
          </div>
        ))}
      </div>
    </div>
  );
}

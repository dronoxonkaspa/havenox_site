import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE.replace('/api', ''), {
  transports: ['websocket'],
});

export default function LiveTent() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      setEvents((e) => [...e, { type: 'system', text: '? Connected to HavenOx backend' }]);
    });

    socket.on('transactionStatus', (data) => {
      setEvents((e) => [...e, { type: 'transaction', text: data.status }]);
    });

    socket.on('chatMessage', (data) => {
      setEvents((e) => [...e, { type: 'chat', text: ${data.sender}:  }]);
    });

    socket.on('disconnect', () => {
      setEvents((e) => [...e, { type: 'system', text: '? Disconnected from backend' }]);
    });

    return () => {
      socket.off('connect');
      socket.off('transactionStatus');
      socket.off('chatMessage');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div style={{ padding: '1rem', color: 'white' }}>
      <h2>?? Live Tent Activity</h2>
      <div
        style={{
          border: '1px solid #00f0ff',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '1rem',
          borderRadius: '8px',
          height: '400px',
          overflowY: 'auto',
        }}
      >
        {events.map((e, i) => (
          <div key={i}>
            <strong>{e.type.toUpperCase()}:</strong> {e.text}
          </div>
        ))}
      </div>
    </div>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateTent from './pages/CreateTent.jsx';
import LiveTent from './components/LiveTent.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/createtent" element={<CreateTent />} />
        <Route path="/livetent" element={<LiveTent />} />
        <Route path="*" element={<h2>404 – Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

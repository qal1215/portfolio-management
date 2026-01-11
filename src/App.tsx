import { Link, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
function App() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/portfolio">Portfolio</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </div>
  );
}

export default App;

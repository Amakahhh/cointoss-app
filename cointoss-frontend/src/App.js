import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Wallet from './pages/Wallet';
import Betting from './pages/Betting';
import Overview from './pages/Overview';
import History from './pages/History';
import FAQ from './pages/FAQ';
import Profile from './pages/Profile';
import useStore from './store/useStore';

function App() {
  const { initializeAuth, initializeWebSocket, loadCurrentPool, isAuthenticated } = useStore();

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Load current pool and WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Load current pool data
      loadCurrentPool().catch(console.error);
      
      // Initialize WebSocket for real-time updates
      initializeWebSocket().catch(console.error);
    }
  }, [isAuthenticated, loadCurrentPool, initializeWebSocket]);

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/betting" element={<Betting />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/history" element={<History />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;


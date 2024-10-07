// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Host from './components/Host';
import Player from './components/Player';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/host" />} />
        <Route path="/host" element={<Host />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </Router>
  );
}

export default App;

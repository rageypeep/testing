// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import VideoPlayer from './components/VideoPlayer';

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/video">Video Player</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/video" element={<VideoPlayer src="video/Overwatch2.webm" />} />
          <Route path="/" element={<h1>Home Page</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

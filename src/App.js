// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VideoPlayer from './components/VideoPlayer';
import Header from './components/Header';

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/video" element={<VideoPlayer src="/video/Overwatch2.webm" />} />
          <Route path="/" element={<h1>Home Page</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VideoPlayer from './components/VideoPlayer';
import Header from './components/Header';
import VoxelTest from './components/Voxel';

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/video" element={<VideoPlayer src="/video/Overwatch2.webm" />} />
          <Route path="/" element={<h1>Home Page</h1>} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
          <Route path='/voxel' element={<VoxelTest />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

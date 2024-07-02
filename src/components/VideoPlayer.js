// src/components/VideoPlayer.js
import React, { useRef, useEffect, useState } from 'react';
import styles from './VideoPlayer.module.css';

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [boxShadow, setBoxShadow] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!video || !canvas || !ctx) {
      return;
    }

    canvas.width = 640;
    canvas.height = 360;

    const extractColor = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = getEdgeColors(frame.data, canvas.width, canvas.height);
      // The 3rd value of the box shadow, sets the blur radius. 200px is extreme, but shows off the effect.
      setBoxShadow(`
        0 -20px 200px -20px rgba(${colors.top.r}, ${colors.top.g}, ${colors.top.b}, 1), 
        0 20px 200px -20px rgba(${colors.bottom.r}, ${colors.bottom.g}, ${colors.bottom.b}, 1), 
        -20px 0 200px -20px rgba(${colors.left.r}, ${colors.left.g}, ${colors.left.b}, 1), 
        20px 0 200px -20px rgba(${colors.right.r}, ${colors.right.g}, ${colors.right.b}, 1)
      `);
    };

    const handlePlay = () => {
      extractColor();
      const interval = setInterval(() => {
        if (video.paused || video.ended) {
          clearInterval(interval);
          return;
        }
        extractColor();
      }, 250); // This is how often you want to extract the color in milliseconds.

      video.addEventListener('pause', () => clearInterval(interval));
      video.addEventListener('ended', () => {
        clearInterval(interval);
        setBoxShadow(''); // Optionally reset the glow when video ends
      });
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('loadeddata', extractColor); // Extract color when the video is loaded

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('loadeddata', extractColor);
    };
  }, []);

  const getEdgeColors = (data, width, height) => {
    const getAverageColor = (indices) => {
      let r = 0, g = 0, b = 0;
      let count = 0;

      for (let i = 0; i < indices.length; i++) {
        r += data[indices[i]];
        g += data[indices[i] + 1];
        b += data[indices[i] + 2];
        count++;
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      return { r, g, b };
    };

    const topIndices = [];
    const bottomIndices = [];
    const leftIndices = [];
    const rightIndices = [];

    for (let x = 0; x < width; x++) {
      topIndices.push((x + 0 * width) * 4);
      bottomIndices.push((x + (height - 1) * width) * 4);
    }

    for (let y = 0; y < height; y++) {
      leftIndices.push((0 + y * width) * 4);
      rightIndices.push(((width - 1) + y * width) * 4);
    }

    return {
      top: getAverageColor(topIndices),
      bottom: getAverageColor(bottomIndices),
      left: getAverageColor(leftIndices),
      right: getAverageColor(rightIndices),
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.videoContainer} style={{ boxShadow }}>
        <video ref={videoRef} src={src} controls className={styles.videoElement}></video>
        <canvas ref={canvasRef} className={styles.hiddenCanvas}></canvas>
      </div>
    </div>
  );
};

export default VideoPlayer;

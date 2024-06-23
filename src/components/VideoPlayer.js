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
      const color = getAverageColor(frame.data);
      console.log('Extracted color:', color);
      setBoxShadow(`0 0 200px rgba(${color.r}, ${color.g}, ${color.b}, 1)`); // The first 2 numbers are the spread offset, the 3rd (200px) is the blur radius, then the RGB values, the last is the opacity value.
    };

    const interval = setInterval(() => {
      if (video.paused || video.ended) {
        clearInterval(interval);
        return;
      }
      extractColor();
    }, 1000);

    video.addEventListener('play', extractColor);

    return () => {
      clearInterval(interval);
      video.removeEventListener('play', extractColor);
    };
  }, []);

  const getAverageColor = (data) => {
    let r = 0, g = 0, b = 0;
    const length = data.length;
    const blockSize = 1; // Sample rate, 1 = every pixel, 2 = every other pixel, etc. 1 is very extrem, 5 is a good vaule for perfomance.
    let count = 0;

    for (let i = 0; i < length; i += 4 * blockSize) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    return { r, g, b };
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

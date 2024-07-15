import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';
import styles from './Voxel.module.css';

const VoxelShape = () => {
  const mountRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add FPS stats
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms/frame, 2: memory
    statsRef.current.appendChild(stats.dom);

    // Style the stats box
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '10px'; // Adjusted position
    stats.dom.style.left = '10px'; // Adjusted position

    // Function to create a rounded shape with voxel instancing
    function createRoundedShapeWithInstancing(radius, detail) {
      const geometry = new THREE.BoxGeometry(detail, detail, detail);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

      // Create an instanced mesh
      const count = Math.pow((radius * 2 / detail) + 1, 3);
      const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
      let index = 0;

      function isSurfaceVoxel(x, y, z, radius) {
        const delta = 0.1; // Small value to check neighboring positions
        const neighbors = [
          [x + delta, y, z],
          [x - delta, y, z],
          [x, y + delta, z],
          [x, y - delta, z],
          [x, y, z + delta],
          [x, y, z - delta],
        ];

        for (const neighbor of neighbors) {
          const [nx, ny, nz] = neighbor;
          const distance = Math.sqrt(nx * nx + ny * ny + nz * nz);
          if (distance > radius) {
            return true;
          }
        }
        return false;
      }

      for (let x = -radius; x <= radius; x += detail) {
        for (let y = -radius; y <= radius; y += detail) {
          for (let z = -radius; z <= radius; z += detail) {
            const distance = Math.sqrt(x * x + y * y + z * z);
            if (distance <= radius && isSurfaceVoxel(x, y, z, radius)) {
              const matrix = new THREE.Matrix4().makeTranslation(x, y, z);
              instancedMesh.setMatrixAt(index, matrix);
              index++;
            }
          }
        }
      }

      // Update the instance count to the actual number of voxels
      instancedMesh.count = index;
      instancedMesh.instanceMatrix.needsUpdate = true;
      return instancedMesh;
    }

    // Create a rounded shape with voxel instancing
    const radius = 6;
    const detail = 0.1;
    const roundedShape = createRoundedShapeWithInstancing(radius, detail);
    scene.add(roundedShape);

    // Position the camera
    camera.position.z = 20;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      stats.begin(); // Begin measuring
      roundedShape.rotation.x += 0.01;
      roundedShape.rotation.y += 0.01;
      renderer.render(scene, camera);
      stats.end(); // End measuring
    };
    animate();

    // Cleanup function to remove the renderer and stats on component unmount
    return () => {
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        if (statsRef.current) {
          statsRef.current.removeChild(stats.dom);
        }
      };
  }, []);

  return (
    <div className={styles.container}>
      <div ref={mountRef} className={styles.canvas} />
      <div ref={statsRef} className={styles.stats} />
    </div>
  );
};

export default VoxelShape;

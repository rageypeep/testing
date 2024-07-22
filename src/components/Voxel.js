import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
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

    // Function to create a voxel with only visible faces
    function createVoxel(x, y, z, detail, isVisible) {
      const halfDetail = detail / 2;
      const vertices = [];
      const indices = [];
      const colors = [];
      const color1 = new THREE.Color(0x00ff00);
      const color2 = new THREE.Color(0xff0000);
      const color = (x + y + z) % 2 === 0 ? color1 : color2;

      const vertexIndex = (vx, vy, vz) => {
        vertices.push(vx, vy, vz);
        colors.push(color.r, color.g, color.b);
        return vertices.length / 3 - 1;
      };

      const addFace = (v0, v1, v2, v3) => {
        const i0 = vertexIndex(...v0);
        const i1 = vertexIndex(...v1);
        const i2 = vertexIndex(...v2);
        const i3 = vertexIndex(...v3);
        indices.push(i0, i1, i2, i2, i3, i0);
      };

      // Front face
      if (isVisible[0]) addFace(
        [-halfDetail, -halfDetail,  halfDetail],
        [ halfDetail, -halfDetail,  halfDetail],
        [ halfDetail,  halfDetail,  halfDetail],
        [-halfDetail,  halfDetail,  halfDetail]
      );
      // Back face
      if (isVisible[1]) addFace(
        [ halfDetail, -halfDetail, -halfDetail],
        [-halfDetail, -halfDetail, -halfDetail],
        [-halfDetail,  halfDetail, -halfDetail],
        [ halfDetail,  halfDetail, -halfDetail]
      );
      // Top face
      if (isVisible[2]) addFace(
        [-halfDetail,  halfDetail,  halfDetail],
        [ halfDetail,  halfDetail,  halfDetail],
        [ halfDetail,  halfDetail, -halfDetail],
        [-halfDetail,  halfDetail, -halfDetail]
      );
      // Bottom face
      if (isVisible[3]) addFace(
        [-halfDetail, -halfDetail, -halfDetail],
        [ halfDetail, -halfDetail, -halfDetail],
        [ halfDetail, -halfDetail,  halfDetail],
        [-halfDetail, -halfDetail,  halfDetail]
      );
      // Left face
      if (isVisible[4]) addFace(
        [-halfDetail, -halfDetail, -halfDetail],
        [-halfDetail, -halfDetail,  halfDetail],
        [-halfDetail,  halfDetail,  halfDetail],
        [-halfDetail,  halfDetail, -halfDetail]
      );
      // Right face
      if (isVisible[5]) addFace(
        [ halfDetail, -halfDetail,  halfDetail],
        [ halfDetail, -halfDetail, -halfDetail],
        [ halfDetail,  halfDetail, -halfDetail],
        [ halfDetail,  halfDetail,  halfDetail]
      );

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);
      geometry.translate(x, y, z);
      return geometry;
    }

    // Function to create a rounded shape with visible voxel faces only
    function createRoundedShape(radius, detail) {
      const voxelGeometries = [];

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
              // Determine which faces are visible
              const isVisible = [
                y + detail > radius || !isSurfaceVoxel(x, y + detail, z, radius),  // front
                y - detail < -radius || !isSurfaceVoxel(x, y - detail, z, radius), // back
                z + detail > radius || !isSurfaceVoxel(x, y, z + detail, radius),  // top
                z - detail < -radius || !isSurfaceVoxel(x, y, z - detail, radius), // bottom
                x - detail < -radius || !isSurfaceVoxel(x - detail, y, z, radius), // left
                x + detail > radius || !isSurfaceVoxel(x + detail, y, z, radius),  // right
              ];

              const voxelGeometry = createVoxel(x, y, z, detail, isVisible);
              voxelGeometries.push(voxelGeometry);
            }
          }
        }
      }

      const mergedGeometry = mergeGeometries(voxelGeometries, true);
      const material = new THREE.MeshBasicMaterial({ vertexColors: true });
      return new THREE.Mesh(mergedGeometry, material);
    }

    // Create a rounded shape with visible voxel faces only
    const radius = 6;
    const detail = 0.1;
    const roundedShape = createRoundedShape(radius, detail);
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


import React from 'react';
import styles from './Header.module.css';
import { Link } from'react-router-dom';


function Header() {
    return (
        <nav className={styles.mainNav}>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/video">Video Player</Link>
          </li>
          <li>
            <Link to="/voxel">Voxel Test</Link>
          </li>
        </ul>
      </nav>
    )
};

export default Header;

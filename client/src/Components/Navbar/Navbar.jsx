import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from 'react-router-dom';
import styles from "./Navbar.module.css";
import { jwtDecode } from 'jwt-decode';


function Navbar() {
    const [showPopup, setShowPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Get token from localStorage and decode it
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const userInfo = decodedToken.user;
                setUser(userInfo);
            } catch (error) {
                console.error("Failed to decode token:", error);
                // Handle invalid or expired token, maybe log the user out
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        // Add event listener to the document
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const handleLogout = () => {
        window.localStorage.clear();
        navigate('/');
    };

    const openPopup = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const toggleDropdown = () => {
        setShowDropdown(prevState => !prevState);
    };

    const userInitial = user ? user.username.charAt(0).toUpperCase() : "U";

    return (
        <>
            <nav className={styles.navbar}>
            <h1>
                <NavLink to="/home">Task Scheduler</NavLink>
            </h1>
            <ul className={styles.navCenter}>
                <li>
                <NavLink to="/tasks" className={({ isActive }) => isActive ? styles.active : ''}>Tasks</NavLink>
                </li>
                <li>
                <NavLink to="/timetable" className={({ isActive }) => isActive ? styles.active : ''}>Timetable</NavLink>
                </li>
            </ul>
            <ul className={styles.navside}>
                <li>
                <div className={styles.userSection} onClick={toggleDropdown}>
                    <div className={styles.userCircle}>{userInitial}</div>
                </div>
                </li>
            </ul>
            </nav>
            {showDropdown && (
                <ul className={styles.dropdownMenu} ref={dropdownRef}>
                    <li><NavLink to="/profile">User Profile</NavLink></li>
                    <li><NavLink to="/preferences">Scheduling Preference</NavLink></li>
                    <li><NavLink to="/settings">Settings</NavLink></li>
                    <li onClick={openPopup}>Logout</li>
                </ul>
            )}
            {showPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <h2>Confirm Logout</h2>
                        <p>Are you sure you want to log out?</p>
                        <button onClick={handleLogout}>Yes</button>
                        <button onClick={closePopup}>No</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;

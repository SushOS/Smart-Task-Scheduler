import React, { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode'; // Ensure this is the correct import
import styles from './UserProfile.module.css';
import Navbar from '../Navbar/Navbar';
import { base_url } from '../../assets/help';
import bgimg from '../../assets/bg.jpg'

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '', fullname: '', phone: '', id: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        document.body.style.backgroundImage = `url(${bgimg})`;
        document.body.style.backgroundSize = 'cover'; 
        document.body.style.backgroundRepeat = 'no-repeat'; 
        
        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundRepeat = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundColor = '';
        };
    }, [bgimg]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Set user id to fetch user details later
                setFormData({ ...formData, id: decodedToken.user.id });
                fetchUserDetails(decodedToken.user.id); // Fetch user details
            } catch (error) {
                console.error("Failed to decode token:", error);
            }
        }
    }, []);

    const fetchUserDetails = async (userId) => {
        try {
            const response = await fetch(`${base_url}/signup/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUser(data); // Set user data
                // Update form data with fetched user info
                setFormData({
                    username: data.username,
                    fullname: data.fullname,
                    email: data.email,
                    phone: data.phone,
                    id: data._id,
                });
            } else {
                console.error('Failed to fetch user details');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        try {
            const response = await fetch(`${base_url}/signup/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Use formData for the body
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser); // Update user state with the returned user details
                setSuccess('User details edited successfully!');
                setTimeout(() => {
                    setSuccess('');
                }, 2000);
            } else {
                setError('Failed to update user');
                console.error('Failed to update user');
            }
        } catch (error) {
            setError('Error updating user');
            console.error('Error updating user:', error);
        }
    };

    if (!formData) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <>
            <Navbar />
            {error && (
                <div className={styles.modalA}>
                    <div className={styles.modalContentA}>
                        <span className={styles.close} onClick={() => setError('')}>&times;</span>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className={styles.modalA}>
                    <div className={styles.modalContentA}>
                        <p>{success}</p>
                    </div>
                </div>
            )}
            <div className={styles.profileContainer}>
                <h1>User Profile</h1>
                <form onSubmit={handleSubmit} className={styles.profileForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Full Name:</label>
                        <input
                            type="text"
                            id="fullname"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Phone:</label>
                        <input
                            type="number"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>User ID:</label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            value={formData.id}
                            onChange={handleChange}
                            readOnly
                        />
                    </div>
                    <button type="submit" className={styles.saveButton}>Save Changes</button>
                </form>
            </div>
        </>
    );
};

export default UserProfile;

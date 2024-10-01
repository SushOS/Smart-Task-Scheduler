import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import styles from './Preferences.module.css';
import Navbar from "../Navbar/Navbar";
import bgimg from '../../assets/bg.jpg'
import { base_url } from '../../assets/help';

const Preferences = () => {

    useEffect(() => {
        document.body.style.backgroundImage = `url(${bgimg})`;
        document.body.style.backgroundSize = 'cover'; 
        document.body.style.backgroundRepeat = 'no-repeat'; 
        
        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundRepeat = '';
        };
    }, [bgimg]);

    const [preferencesExist, setPreferencesExist] = useState(false);

    const [preferences, setPreferences] = useState({
        userId: '',
        schedulingStartHour: '',
        schedulingEndHour: '',
        workingHours: '',
        relaxingHours: '',
        playingHours: '',
        playingStartTime: '',
        playingEndTime: '',
        goals: [],
    });
    const [newGoal, setNewGoal] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                fetchPreferences(decodedToken.user.id);
            } catch (error) {
                console.error("Failed to decode token:", error);
            }
        }
    }, []);

    const fetchPreferences = async (userId) => {
        try {
            const response = await fetch(`${base_url}/preferences/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setPreferences(data);
                setPreferencesExist(true);
            } 
            else {
                setPreferencesExist(false);
            }
        } catch (error) {
            setPreferencesExist(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPreferences({
            ...preferences,
            [name]: value,
        });
    };

    const handleAddGoal = () => {
        if (newGoal) {
            setPreferences({
                ...preferences,
                goals: [...preferences.goals, newGoal],
            });
            setNewGoal(''); // Clear the input after adding
        }
    };

    const handleRemoveGoal = (index) => {
        const updatedGoals = preferences.goals.filter((goal, i) => i !== index);
        setPreferences({
            ...preferences,
            goals: updatedGoals,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const decodedToken = jwtDecode(token);

        setPreferences({
            ...preferences,
            ["userId"]: decodedToken.user.id,
        });

        const url = preferencesExist ? `${base_url}/preferences/${decodedToken.user.id}`: `${base_url}/preferences`;
        const method = preferencesExist ? 'PUT' : 'POST'; // Determine method based on existence of preferences

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preferences),
            });

            if (response.ok) {
                const message = preferencesExist
                    ? 'Preferences updated successfully!'
                    : 'Preferences saved successfully!';
                setSuccess(message);
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            } else {
                setError('Failed to save preferences');
                setTimeout(() => {
                    setError('');
                }, 2000);
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            setError('Error saving preferences');
            setTimeout(() => {
                setError('');
            }, 2000);
        }
    };

    return (
        <>
        <Navbar/>
        <div className={styles.container}>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            <h1>Scheduling Preferences</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.rowentry}>
                    <label>Scheduling Hours:</label>
                    <div className={styles.timeentry}>
                        <input
                            type="time"
                            name="schedulingStartHour"
                            value={preferences.schedulingStartHour}
                            onChange={handleChange}
                            required
                        />
                        <span>to</span>
                        <input
                            type="time"
                            name="schedulingEndHour"
                            value={preferences.schedulingEndHour }
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className={styles.rowentry}>
                    <label>No. of Working Hours:</label>
                    <input
                        type="number"
                        name="workingHours"
                        value={preferences.workingHours}
                        onChange={handleChange}
                        step="0.01"
                        required
                    />
                </div>
                <div className={styles.rowentry}>
                    <label>No. of Relaxing Hours:</label>
                    <input
                        type="number"
                        name="relaxingHours"
                        value={preferences.relaxingHours}
                        onChange={handleChange}
                        step="0.01"
                        required
                    />
                </div>
                <div className={styles.rowentry}>
                    <label>No. of Playing Hours:</label>
                    <input
                        type="number"
                        name="playingHours"
                        value={preferences.playingHours}
                        onChange={handleChange}
                        step="0.01"
                        required
                    />
                </div>
                <div className={styles.rowentry}>
                    <label>Play Time Preference:</label>
                    <div className={styles.timeentry}>
                        <input
                            type="time"
                            name="playingStartTime"
                            value={preferences.playingStartTime}
                            onChange={handleChange}
                        />
                        <span>to</span>
                        <input
                            type="time"
                            name="playingEndTime"
                            value={preferences.playingEndTime}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className={styles.rowentry2}>
                    <label>List of Goals:</label>
                    <div className={styles.goalentry}>
                        <input
                            type="text"
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                        />
                        <button type="button" className={styles.addbutton} onClick={handleAddGoal}>
                            Add
                        </button>
                    </div>
                </div>
                <ul className={styles.goalbox}>
                    {preferences.goals.map((goal, index) => (
                        <li key={index}>
                            {goal}
                            <button type="button" onClick={() => handleRemoveGoal(index)}>
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
                <button type="submit" className={styles.savebutton}>Save Preferences</button>
            </form>
        </div>
        </>
    );
};

export default Preferences;

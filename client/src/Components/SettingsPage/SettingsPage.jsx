import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './SettingsPage.module.css';
import Navbar from "../Navbar/Navbar";
import bgimg from '../../assets/bg.jpg';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { base_url } from '../../assets/help';

const SettingsPage = () => {
    const [fonts, setFonts] = useState([]); // Store the font list

    // Set background image
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

    const [settingsExist, setSettingsExist] = useState(false);

    const [settings, setSettings] = useState({
        userId: '',
        fontstyle:'',
        fontsize:'',
        notiftime:''
    });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                fetchSettings(decodedToken.user.id);
            } catch (error) {
                console.error("Failed to decode token:", error);
            }
        }
    }, []);

    const fetchSettings = async (userId) => {
        try {
            const response = await fetch(`${base_url}/settings/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
                setSettingsExist(true);
            } 
            else {
                setSettingsExist(false);
            }
        } catch (error) {
            setSettingsExist(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings({
            ...settings,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const decodedToken = jwtDecode(token);

        setSettings({
            ...settings,
            ["userId"]: decodedToken.user.id,
        });

        const url = settingsExist ? `${base_url}/settings/${decodedToken.user.id}`: `${base_url}/settings`;
        const method = settingsExist ? 'PUT' : 'POST'; // Determine method based on existence of settings

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                const message = settingsExist
                    ? 'Settings updated successfully!'
                    : 'Settings saved successfully!';
                setSuccess(message);
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            } else {
                setError('Failed to save settings');
                setTimeout(() => {
                    setError('');
                }, 2000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setError('Error saving settings');
            setTimeout(() => {
                setError('');
            }, 2000);
        }
    };

    const GOOGLE_FONT_API_KEY = import.meta.env.VITE_GOOGLE_FONT_API_KEY;

    // Fetch Google Fonts from API
    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const response = await axios.get(
                    `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONT_API_KEY}`
                );
                setFonts(response.data.items);
            } catch (error) {
                console.error('Error fetching Google Fonts:', error);
            }
        };
        fetchFonts();
    }, []);

    // Handle font selection and dynamically load the selected font
    useEffect(() => {

        // Dynamically load the selected Google Font
        if (settings.fontstyle && settings.fontstyle !== '') {
            const link = document.createElement('link');
            // Apply replace method outside the template literal
            const fontFamily = settings.fontstyle.replace(/ /g, '+');
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        
            // Apply the selected font globally
            document.body.style.fontFamily = settings.fontstyle;
        } 
        
        
    });

    // Handle font size selection
    useEffect(() => {
        if (settings.fontsize!='') {
            document.body.style.fontSize = settings.fontsize; // Apply selected font size globally
        }
    });

    // Available font sizes
    const fontSizes = ['12px', '14px', '16px', '18px', '20px','22px', '24px', '26px', '28px','30px', '32px'];

    // Fetch the current font and size from the document body
    const getCurrentFontAndSize = () => {
        const computedStyle = getComputedStyle(document.body);
        return {
            font: computedStyle.fontFamily,
            size: computedStyle.fontSize,
        };
    };

    const { font: currentFont, size: currentSize } = getCurrentFontAndSize();

    return (
        <>
            <Navbar />
            <div className={styles.settingspage} style={{ padding: '20px'}}>
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}
                <h1>Settings</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div style={{ display:'flex',flexDirection:'row'}}>
                        <label style={{ marginRight: '10px'}}>Font Style:</label>
                        <select id="fontstyle" name='fontstyle' value={settings.fontstyle} onChange={handleChange}>
                            <option value={settings.fontstyle}>{settings.fontstyle}</option>
                            {fonts.map((font, index) => (
                                <option key={index} value={font.family}>
                                    {font.family}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginTop: '20px',display:'flex',flexDirection:'row' }}>
                        <label style={{ marginRight: '10px' }}>Font Size:</label>
                        <select id="fontsize" name='fontsize' value={settings.fontsize} onChange={handleChange}>
                            <option value={settings.fontsize}>{settings.fontsize}</option>
                            {fontSizes.map((size, index) => (
                                <option key={index} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginTop: '20px',display:'flex',flexDirection:'row' }}>
                        <label style={{ marginRight: '10px' }}>Notification Time:</label>
                        <input
                            type="number"
                            name="notiftime"
                            placeholder='in minutes'
                            value={settings.notiftime}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.savebutton}>Save Settings</button>
                </form>
            </div>
        </>
    );
};

export default SettingsPage;

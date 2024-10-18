import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import axios from 'axios';
import { base_url } from '../../assets/help';
import styles from './ForgotPassword.module.css';
import bgimg from '../../assets/bg.jpg'

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${base_url}/forgot-password`, { email });
            if (response.data.success) {
                setStep(2);
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    const handleOTPVerification = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${base_url}/verify-otp`, { email, otp });
            if (response.data.success) {
                setStep(3);
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post(`${base_url}/reset-password`, {
                email,
                otp,
                newPassword
            });
            if (response.data.success) {
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed');
        }
    };

    return (
        <div className={styles.box}>
            <div className={styles.forgotPasswordBox}>
                <h1>Forgot Password</h1>
                
                {error && (
                    <div className={styles.error}>
                        {error}
                        <button onClick={() => setError('')}>×</button>
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit}>
                        <div className={styles.inputContainer}>
                            <FaEnvelope className={styles.icon} color="black" size={17}/>
                            <input
                                className={styles.inputbox}
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button className={styles.submitButton} type="submit">
                            Send OTP
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleOTPVerification}>
                        <div className={styles.inputContainer}>
                            <FaLock className={styles.icon} color="black" size={17}/>
                            <input
                                className={styles.inputbox}
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <button className={styles.submitButton} type="submit">
                            Verify OTP
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handlePasswordReset}>
                        <div className={styles.inputContainer}>
                            <FaLock className={styles.icon} color="black" size={17}/>
                            <input
                                className={styles.inputbox}
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <FaLock className={styles.icon} color="black" size={17}/>
                            <input
                                className={styles.inputbox}
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className={styles.submitButton} type="submit">
                            Reset Password
                        </button>
                    </form>
                )}
                
                <div className={styles.backToLogin}>
                    <a href="/login">Back to Login</a>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
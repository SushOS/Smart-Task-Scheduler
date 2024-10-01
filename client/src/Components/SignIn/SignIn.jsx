import React,{ useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './SignIn.module.css';
import { FaUser, FaLock } from "react-icons/fa";
import axios from 'axios'
import { base_url } from '../../assets/help';
import bgimg from '../../assets/bg.jpg'

function SignIn(){

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

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');

    const closePopup = () => {
        setError('');
        setUsername('');
        setPassword('');
    };

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${base_url}/login`, { username, password })
            .then(result=>{console.log(result)
            if(result.data.message === "Success"){  
                window.localStorage.setItem('access_token', result.data.access_token);
                window.localStorage.setItem('isLoggedIn', true);

                navigate('/home')
            }
            })
            console.log(response);
            
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                console.log(err)
                setError("An unexpected error occurred");
            }
        }
    };

    return (

        <div className={styles.box}>
            <div className={styles.SignInbox}>
                <form onSubmit={handleSubmit}>
                <h1>Sign In</h1>
                <div className={styles.inputContainer}>
                    <FaUser className={styles.icon} color="black"size={17}/>
                    <input className={styles.inputbox} placeholder="Username" type="text" value={username} onChange={(e)=> setUsername(e.target.value)}/>   
                </div>
                <div className={styles.inputContainer}>
                    <FaLock className={styles.icon} color="black"size={17}/>
                    <input className={styles.inputbox} placeholder="Password" type="password" value={password} onChange={(e)=> setPassword(e.target.value)}/>
                </div>
                <div className={styles.remfor}>
                    <label className={styles.remmm}><input type="checkbox" />Remember Me</label>
                </div>
                <div>
                    <button className={styles.loginbutton} type="submit">Login</button>
                </div>
                <div className={styles.forgot}>
                    <a href="#">Forgot Password</a>
                </div>
                </form>
                <hr
                    style={{
                    border: 'none',
                    borderTop: '2px solid #000', 
                    width: '82%', 
                    marginTop: '25px',
                    marginBottom: '5px', 
                    }}
                />
                <div className={styles.signupway}>
                    
                    <p>Don't have an account ?</p>
                    <Link to="/signup">Sign Up</Link>
                </div>
                {error && (
                <>
                    <div className={styles.popup}>
                        <p>{error}</p>
                        <button onClick={closePopup}>Close</button>
                    </div>
                </>
                )}
            </div>
        </div>
    );
}

export default SignIn;

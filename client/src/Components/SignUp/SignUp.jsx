import React,{useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './SignUp.module.css';
import { FaUser, FaLock, FaPhoneAlt } from "react-icons/fa";
import { MdPerson4 } from "react-icons/md";
import { IoMail } from "react-icons/io5";
import axios from 'axios'
import { base_url } from '../../assets/help';
import bgimg from '../../assets/bg.jpg'

function SignUp(){

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

    const [username, setUsername] = useState('')
    const [fullname, setFullname] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');

    const closePopup = () => {
        setError('');
    };

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${base_url}/signup`, { username,fullname, email, phone, password })
            .then(result=>{console.log(result)  
            navigate('/login')
            })
            console.log(response);
            setUsername('');
            setFullname('');
            setEmail('');
            setPhone('');
            setPassword('');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    return (
        <div className={styles.box}>
            <div className={styles.SignUpbox}>
                <form onSubmit={handleSubmit}>
                <h1>Sign Up</h1>
                <div className={styles.inputContainer}>
                    <FaUser className={styles.icon} color="black"size={17}/>
                    <input className={styles.inputbox} placeholder="Username" type="text" value={username} onChange={(e)=> setUsername(e.target.value)}/>
                </div>
                <div className={styles.inputContainer}>
                    <MdPerson4 className={styles.icon} color="black"size={21}/>
                    <input className={styles.inputbox} placeholder="Full Name" type="text" value={fullname} onChange={(e)=> setFullname(e.target.value)}/>
                </div>
                <div className={styles.inputContainer}>
                    <IoMail className={styles.icon} color="black"size={17}/>
                    <input className={styles.inputbox} placeholder="Email" type="email" value={email} onChange={(e)=> setEmail(e.target.value)}/>
                </div>
                <div className={styles.inputContainer}>
                    <FaPhoneAlt className={styles.icon} color="black"size={17}/>
                    <input className={styles.inputbox} placeholder="Phone Number" type="number" value={phone} onChange={(e)=> setPhone(e.target.value)}/>
                </div>
                <div className={styles.inputContainer}>
                    <FaLock className={styles.icon} color="black"size={17}/>
                    <input className={styles.inputbox} placeholder="Password" type="password" value={password} onChange={(e)=> setPassword(e.target.value)}/>
                </div>
                <div>
                    <button className={styles.SignUpbutton} type="submit">Register</button>
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
                <div className={styles.loginway}>
                    <p>Already having an account ?</p>
                    <Link to="/">Sign In</Link>
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

export default SignUp;

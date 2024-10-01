import React,{ useEffect } from 'react';
import styles from './HomePage.module.css';
import Navbar from '../Navbar/Navbar';
import bgimg from '../../assets/bg.jpg'
import homeimg from '../../assets/home.png'

function Home(){

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

    return(
        <>
            <Navbar/>

            <div className={styles.homeimage}>
                <img src={homeimg} alt='background'></img>
            </div>
        </>
        
    )
}

export default Home
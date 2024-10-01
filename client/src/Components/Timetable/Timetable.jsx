import React,{useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../Navbar/Navbar";
import bgimg from '../../assets/bg.jpg'
import styles from './Timetable.module.css';

const Timetable = () => {

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

    return(
        <>
            <Navbar/>
            <p>This is the Timetable page</p>
        </>
    )
}

export default Timetable;
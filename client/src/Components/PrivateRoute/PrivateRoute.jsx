import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) =>{
    
    const LoggedIn = window.localStorage.getItem("isLoggedIn")

    if(LoggedIn){
        return <Component {...rest} />
    }
    else{
        alert("User is Not Logged In")
        return <Navigate to={'/login'}/>
    }
}
export default PrivateRoute;

import { BrowserRouter,Routes, Route} from 'react-router-dom';
import SignUp from "./Components/SignUp/SignUp.jsx"
import Login from "./Components/SignIn/SignIn.jsx"
import HomePage from "./Components/HomePage/HomePage.jsx"
import UserProfile from './Components/UserProfile/UserProfile.jsx';
import Tasks from './Components/Tasks/Tasks.jsx';
import Timetable from './Components/Timetable/Timetable.jsx';
import Preferences from './Components/Preferences/Preferences.jsx';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute.jsx';

function App() {
    const isLoggedIn = window.localStorage.getItem("isLoggedIn")
    return(
        <BrowserRouter>
            <Routes>
            <Route exact path="/" element={isLoggedIn==true?<HomePage/>:<Login/>} />
                <Route path="/login" element={<Login/>} />  
                <Route path="/signup" element={<SignUp/>} />
                <Route path="/home" element={<PrivateRoute element={HomePage}/>} />
                <Route path="/profile" element={<PrivateRoute element={UserProfile}/>} />
                <Route path="/tasks" element={<PrivateRoute element={Tasks}/>} />
                <Route path="/timetable" element={<PrivateRoute element={Timetable}/>} />
                <Route path="/preferences" element={<PrivateRoute element={Preferences}/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

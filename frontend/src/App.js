import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './home';
import Pizza from './pizza';
import Login from './login';
import Registration from './registration';
import ForgotPassword from './forgotPassword';
import './App.css';
import { useEffect, useState } from 'react';

function App() {
    const [loggedIn, setLoggedIn] = useState(false)
    const [username, setUsername] = useState("")

    useEffect(() => {
        
        const user = JSON.parse(localStorage.getItem("user"));

        // If the token/username does not exist, mark the user as logged out
        if (!user || !user.token) {
            setLoggedIn(false);
            return;
        }

        fetch("http://localhost:3080/verify", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'jwt-token': user.token
            },
            credentials: 'include' // Include credentials (cookies)
        })
            .then(r => r.json())
            .then(r => {
                setLoggedIn('success' === r.message)
                setUsername(user.username || "")
            });
    }, []);

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home username={username} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
                    <Route path="/login" element={<Login setLoggedIn={setLoggedIn} setUsername={setUsername} />} />
                    <Route path="/register" element={<Registration setLoggedIn={setLoggedIn} setUsername={setUsername} />} /> 
                    <Route path="/forgot-password" element={<ForgotPassword setLoggedIn={setLoggedIn} setUsername={setUsername} />} /> 
                    <Route path="/pizza" element={<Pizza setLoggedIn={setLoggedIn} username={username} loggedIn={loggedIn} />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

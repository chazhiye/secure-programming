import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './App.css';  // Import your CSS file

const Login = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();

    const onButtonClick = () => {
        setUsernameError("");
        setPasswordError("");

        if (username.trim() === "") {
            setUsernameError("Please enter your username");
            return;
        }

        if (username.length < 2) {
            setUsernameError("Please enter a valid username");
            return;
        }

        if (password.trim() === "") {
            setPasswordError("Please enter a password");
            return;
        }

        if (password.length < 5) {
            setPasswordError("The password must be 8 characters or longer");
            return;
        }

        checkAccountExists(accountExists => {
            if (accountExists) {
                logIn();
            } else {
                window.alert("Wrong username or password");
            }
        });
    }

    const checkAccountExists = (callback) => {
        fetch("http://localhost:3080/check-account", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        })
            .then(r => r.json())
            .then(r => {
                callback(r?.userExists);
            });
    }

    const logIn = () => {
        fetch("http://localhost:3080/auth", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // Include credentials (cookies)
        })
            .then(r => r.json())
            .then(r => {
                if (r.message === 'success') {
                    localStorage.setItem("user", JSON.stringify({ username }));
                    props.setLoggedIn(true);
                    props.setUsername(username);
                    navigate("/pizza");
                } else {
                    window.alert("Wrong username or password");
                }
            });
    };


    return (
        <div className="mainContainer">
            <div className="titleContainer">
                <div>Login</div>
            </div>
            <br />
            <div className="inputContainer">
                <input
                    value={username}
                    placeholder="Enter your username here"
                    onChange={ev => setUsername(ev.target.value)}
                    className="inputBox"
                />
                <label className="errorLabel">{usernameError}</label>
            </div>
            <br />
            <div className="inputContainer">
                <input
                    type="password"
                    value={password}
                    placeholder="Enter your password here"
                    onChange={ev => setPassword(ev.target.value)}
                    className="inputBox"
                />
                <label className="errorLabel">{passwordError}</label>
            </div>
            <br />
            <div className="inputContainer">
                <input
                    className="inputButton"
                    type="button"
                    onClick={onButtonClick}
                    value="Log in"
                />
            </div>
            <div className="inputContainer">
                <p>Don't have an account? <Link to="/register" className="registerLink">Register</Link></p>
            </div>
            <div className="inputContainer">
                <Link to="/forgot-password" className="forgotPasswordLink">Forgot Password?</Link>
            </div>
        </div>
    );
}

export default Login;

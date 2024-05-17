import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registration = (props) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    
    const navigate = useNavigate();
        
    const onButtonClick = () => {

        // Set initial error values to empty
        setUsernameError("")
        setPasswordError("")

        // Check if the user has entered both fields correctly
        if ("" === username) {
            setUsernameError("Please enter your username")
            return
        }
        if (username.length < 2)  {
            setUsernameError("Please enter a valid username")
            return
        }

        if ("" === password) {
            setPasswordError("Please enter a password")
            return
        }

        if (password.length < 5) {
            setPasswordError("The password must be 8 characters or longer")
            return
        }

        // Register the user
        registerUser();
        navigate("/");
    }

    // Call the server API to register a new user
    const registerUser = (props) => {
        fetch("http://localhost:3080/auth", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({username, password})
        })
        .then(r => r.json())
        .then(r => {
            if ('success' === r.message) {
                localStorage.setItem("user", JSON.stringify({ username, token: r.token }))
                props.setLoggedIn(true)
                props.setUsername(username)
                
                navigate("/login")
            } else {
                window.alert("Failed to register. Please try again.")
            }
        })
    }

    return (
        <div className={"mainContainer"}>
            <div className={"titleContainer"}>
                <div>Register your account</div>
            </div>
            <br />
            <div className={"inputContainer"}>
                <input
                    value={username}
                    placeholder="Enter your username here"
                    onChange={ev => setUsername(ev.target.value)}
                    className={"inputBox"} />
                <label className="errorLabel">{usernameError}</label>
            </div>
            <br />
            <div className={"inputContainer"}>
                <input
                    value={password}
                    placeholder="Enter your password here"
                    onChange={ev => setPassword(ev.target.value)}
                    className={"inputBox"} />
                <label className="errorLabel">{passwordError}</label>
            </div>
            <br />
            <div className={"inputContainer"}>
                <input
                    className={"inputButton"}
                    type="button"
                    onClick={onButtonClick}
                    value={"Register"} />
            </div>
        </div>
    );
}

export default Registration;

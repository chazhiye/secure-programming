import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './forgotPassword.css'; // Ensure this CSS file exists

const ForgotPassword = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const navigate = useNavigate();

    const handleResetPassword = () => {
        // Validate username, password, and confirm password
        setUsernameError("");
        setPasswordError("");
        setConfirmPasswordError("");

        if (username.trim() === "") {
            setUsernameError("Please enter your username");
            return;
        }
        if (password.trim() === "") {
            setPasswordError("Please enter a new password");
            return;
        }
        if (password.length < 5) {
            setPasswordError("The password must be 8 characters or longer");
            return;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            return;
        }

        // Check if the account exists and update password
        checkAccountExists((accountExists) => {
            if (accountExists) {
                updatePassword();
            } else {
                setUsernameError("Username not found");
            }
        });
    };

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

    const updatePassword = () => {
        fetch("http://localhost:3080/update-password", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password: confirmPassword })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    console.log("Password updated successfully");
                    navigate("/");
                } else {
                    console.error("Failed to update password");
                    navigate("/");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <div className="forgotPasswordContainer">
            <h2>Reset Password</h2>
            <div className="inputContainer">
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <label className="errorLabel">{usernameError}</label>
            </div>
            <div className="inputContainer">
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <label className="errorLabel">{passwordError}</label>
            </div>
            <div className="inputContainer">
                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <label className="errorLabel">{confirmPasswordError}</label>
            </div>
            <div className="inputContainer">
                <button className="button" onClick={handleResetPassword}>Reset Password</button>
            </div>
        </div>
    );
};

export default ForgotPassword;

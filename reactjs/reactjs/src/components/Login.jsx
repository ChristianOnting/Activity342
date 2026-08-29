import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    const validate = () => {
        let tempErrors = {};
        if (!credentials.username.trim()) tempErrors.username = 'Username is required.';
        if (!credentials.password.trim()) tempErrors.password = 'Password is required.';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Attempting login...');
        setIsSuccess(false);

        if (!validate()) {
            setMessage('Validation failed. Please check inputs.');
            return;
        }

        try {
            console.log('Sending login request:', credentials);
            const response = await axios.post('http://localhost:8080/api/users/login', credentials);
            
            console.log('Backend response:', response);

            if (response.status === 200) {
                const userData = response.data;
                console.log('User data payload:', userData);

                // Handle string responses vs JSON object responses
                let token = '';
                let resolvedUserId = '';
                let username = credentials.username;
                let email = '';

                if (typeof userData === 'string') {
                    token = userData; // If endpoint returns plain JWT string
                } else if (typeof userData === 'object' && userData !== null) {
                    token = userData.token || userData.jwt || userData.accessToken || '';
                    resolvedUserId = userData.id || userData.userId || '';
                    username = userData.username || credentials.username;
                    email = userData.email || '';
                }

                console.log('Extracted Token:', token);

                if (!token) {
                    setIsSuccess(false);
                    setMessage('Login response received, but no JWT token was found in the payload.');
                    return;
                }

                // 1. Save to LocalStorage
                localStorage.setItem('token', token);
                if (resolvedUserId) localStorage.setItem('userId', String(resolvedUserId));
                if (username) localStorage.setItem('username', username);
                if (email) localStorage.setItem('email', email);

                setIsSuccess(true);
                setMessage('Login successful! Redirecting to dashboard...');

                // 2. Redirect after brief delay to allow reading screen feedback
                setTimeout(() => {
                    navigate('/dashboard', { 
                        state: { 
                            token: token,
                            username: username, 
                            email: email, 
                            userId: resolvedUserId 
                        } 
                    });
                }, 1000);
            }
        } catch (err) {
            console.error('Full login error object:', err);
            setIsSuccess(false);

            if (err.response) {
                // Server responded with non-2xx status code
                const serverErr = err.response.data;
                const status = err.response.status;
                const errDetail = typeof serverErr === 'string' 
                    ? serverErr 
                    : JSON.stringify(serverErr);

                setMessage(`Server Error (${status}): ${errDetail || 'Invalid credentials'}`);
            } else if (err.request) {
                // Request was made but no response was received (CORS, server down, connection refused)
                setMessage('Network Error: Could not reach backend server at http://localhost:8080');
            } else {
                // Setup or runtime error
                setMessage(`Request Error: ${err.message}`);
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>User Login</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    />
                    {errors.username && <span style={{ color: 'red' }}> {errors.username}</span>}
                </div>
                <br />
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    />
                    {errors.password && <span style={{ color: 'red' }}> {errors.password}</span>}
                </div>
                <br />
                <button type="submit">Login</button>
            </form>

            {/* Detailed status messaging */}
            {message && (
                <p style={{ 
                    color: isSuccess ? 'green' : 'red', 
                    fontWeight: 'bold', 
                    marginTop: '15px' 
                }}>
                    {message}
                </p>
            )}

            <p style={{ marginTop: '15px' }}>
                Don't have an account? <Link to="/register">Go to Registration</Link>
            </p>
        </div>
    );
}
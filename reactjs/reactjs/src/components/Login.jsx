import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

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
        setMessage('');

        if (!validate()) return;

        try {
            // 1. Updated endpoint URL to match SecurityConfig permitAll matcher (/api/users/login)
            const response = await axios.post('http://localhost:8080/api/users/login', credentials);
            
            if (response.status === 200) {
                const userData = response.data;

                // Normalize ID (handles both id and userId)
                const resolvedUserId = userData.id || userData.userId;

                // 2. Persist user session and basic credentials in localStorage for authenticated requests
                localStorage.setItem('userId', resolvedUserId);
                localStorage.setItem('username', userData.username);
                localStorage.setItem('email', userData.email || '');
                localStorage.setItem('password', credentials.password); // Used for Basic Auth header if needed

                // 3. Navigate to dashboard with location state
                navigate('/dashboard', { 
                    state: { 
                        username: userData.username, 
                        email: userData.email, 
                        userId: resolvedUserId 
                    } 
                });
            }
        } catch (err) {
            console.error('Login error:', err);
            setMessage(
                typeof err.response?.data === 'string' 
                    ? err.response.data 
                    : 'Invalid username or password.'
            );
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

            {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

            <p style={{ marginTop: '15px' }}>
                Don't have an account? <Link to="/register">Go to Registration</Link>
            </p>
        </div>
    );
}
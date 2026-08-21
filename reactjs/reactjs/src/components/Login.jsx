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
        const response = await axios.post('http://localhost:8080/login', credentials);
        if (response.status === 200) {
            const userData = response.data;
            navigate('/dashboard', { state: { username: userData.username, email: userData.email, userId: userData.userId} });
        }
        } catch (err) {
            setMessage(err.response?.data || 'Invalid username or password.');
        }
    };

    return (
        <div>
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

            {message && <p style={{ color: 'red' }}>{message}</p>}

            <p>
                Don't have an account? <Link to="/register">Go to Registration</Link>
            </p>
        </div>
    );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const navigate = useNavigate();

    const validate = () => {
        let tempErrors = {};
        if (!formData.username.trim()) tempErrors.username = 'Username is required.';
        if (!formData.email.trim()) {
            tempErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = 'Email format is invalid.';
        }
        if (!formData.password.trim()) tempErrors.password = 'Password is required.';
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!validate()) return;

        try {
            // 1. Updated endpoint to match backend controller mapping (/api/users/register)
            const response = await axios.post('http://localhost:8080/api/users/register', formData);
            
            setIsError(false);
            
            // 2. Safe message parsing (handles text response or JSON objects)
            const successMsg = typeof response.data === 'string' 
                ? response.data 
                : 'User registered successfully!';
                
            setMessage(successMsg);
            setFormData({ username: '', email: '', password: '' });
            setErrors({});

            // Optional: Automatically navigate to login after 1.5 seconds
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (err) {
            setIsError(true);
            setMessage(
                typeof err.response?.data === 'string' 
                    ? err.response.data 
                    : 'Registration failed. Please try again.'
            );
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>User Registration</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    {errors.username && <span style={{ color: 'red' }}> {errors.username}</span>}
                </div>
                <br />
                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <span style={{ color: 'red' }}> {errors.email}</span>}
                </div>
                <br />
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    {errors.password && <span style={{ color: 'red' }}> {errors.password}</span>}
                </div>
                <br />
                <button type="submit">Register</button> 
            </form>

            {message && (
                <p style={{ color: isError ? 'red' : 'green', marginTop: '10px' }}>{message}</p>
            )}

            <p style={{ marginTop: '15px' }}>
                Already have an account? <Link to="/login">Go to Login</Link>
            </p>
        </div>
    );
}
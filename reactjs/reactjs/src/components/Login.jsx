import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const res = await axios.post('http://localhost:8080/login', credentials);
        if (res.status === 200) {
            navigate('/home');
        }
        } catch (err) {
        setMessage(err.response?.data || 'Invalid credentials');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username: </label>
                    <input 
                        type="text" 
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} 
                        required 
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input 
                        type="password" 
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} 
                        required 
                    />
                    </div>
                <button type="submit">Login</button>
            </form>
            <p>{message}</p>
        </div>
    );
}
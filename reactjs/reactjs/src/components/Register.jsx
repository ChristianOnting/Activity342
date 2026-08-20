import { useState } from "react";
import axios from 'axios';

export default function Register(){
    const [formData, setFormData] = useState({username: '', email: '', password: ''});
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const res = await axios.post('http://localhost:8080/register', formData);
        setMessage(res.data);
        } catch (err) {
        setMessage(err.response?.data || 'Registration failed');
        }
    };

    return(
        <>
            <div>
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Username: </label>
                        <input 
                            type="text" 
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                            required 
                        />
                    </div>
                    <div>
                        <label>Email: </label>
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                            required 
                        />
                    </div>
                    <div>
                        <label>Password: </label>
                        <input 
                            type="password" 
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                            required 
                        />
                    </div>
                    <button type="submit">Register</button>
                </form>
                <p>{message}</p>
            </div>
        </>
    );
}
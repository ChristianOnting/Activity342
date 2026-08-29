import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // Load initial values safely from localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const [userId, setUserId] = useState(() => localStorage.getItem('userId') || '');
    const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User');
    const [email, setEmail] = useState(() => localStorage.getItem('email') || 'Email');

    const [requests, setRequests] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const [statusMessage, setStatusMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const API_URL = 'http://localhost:8080/api/service-requests';

    const showFeedback = (msg, error = false) => {
        setStatusMessage(msg);
        setIsError(error);
    };

    // 1. Process navigation state from Login ONCE on mount
    useEffect(() => {
        if (location.state?.token) {
            localStorage.setItem('token', location.state.token);
            setToken(location.state.token);
        }
        if (location.state?.userId) {
            localStorage.setItem('userId', String(location.state.userId));
            setUserId(String(location.state.userId));
        }
        if (location.state?.username) {
            localStorage.setItem('username', location.state.username);
            setUsername(location.state.username);
        }
        if (location.state?.email) {
            localStorage.setItem('email', location.state.email);
            setEmail(location.state.email);
        }
    }, [location.state]);

    // 2. Auth Guard: Redirect if no token is present
    useEffect(() => {
        const activeToken = token || localStorage.getItem('token');
        if (!activeToken) {
            navigate('/login');
        }
    }, [token, navigate]);

    // Helper to generate dynamic request config with valid Bearer token
    const getAuthHeader = useCallback(() => {
        const activeToken = localStorage.getItem('token') || token;
        return {
            headers: {
                'Authorization': `Bearer ${activeToken}`,
                'Content-Type': 'application/json'
            }
        };
    }, [token]);

    // 3. READ (Fetch Requests)
    const fetchRequests = useCallback(async () => {
        const activeUserId = localStorage.getItem('userId') || userId;
        const activeToken = localStorage.getItem('token') || token;

        if (!activeUserId || !activeToken) return;

        try {
            const response = await axios.get(`${API_URL}/user/${activeUserId}`, getAuthHeader());
            setRequests(response.data);
        } catch (err) {
            console.error('Error fetching requests:', err);
            showFeedback('Failed to load service requests.', true);
        }
    }, [userId, token, getAuthHeader]);

    useEffect(() => {
        const activeToken = localStorage.getItem('token') || token;
        const activeUserId = localStorage.getItem('userId') || userId;
        if (activeToken && activeUserId) {
            fetchRequests();
        }
    }, [token, userId, fetchRequests]);

    // 4. CREATE
    const handleCreate = async (e) => {
        e.preventDefault();
        showFeedback('');

        const activeUserId = localStorage.getItem('userId') || userId;
        if (!activeUserId) {
            showFeedback('User session missing. Please log in again.', true);
            return;
        }

        if (!title.trim() || !description.trim()) {
            showFeedback('Title and Description cannot be empty.', true);
            return;
        }

        try {
            await axios.post(`${API_URL}/user/${activeUserId}`, { title, description }, getAuthHeader());
            setTitle('');
            setDescription('');
            showFeedback('Service request submitted successfully!');
            fetchRequests();
        } catch (err) {
            console.error('Error creating request:', err);
            showFeedback('Submission failed: Could not create request.', true);
        }
    };

    // 5. UPDATE
    const handleUpdate = async (requestId) => {
        showFeedback('');
        try {
            await axios.put(
                `${API_URL}/${requestId}`,
                { title: editTitle, description: editDescription },
                getAuthHeader()
            );
            setEditingId(null);
            setEditTitle('');
            setEditDescription('');
            showFeedback('Service request updated successfully!');
            fetchRequests();
        } catch (err) {
            console.error('Error updating request:', err);
            showFeedback('Update failed: Could not save changes.', true);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
        setEditDescription('');
    };

    // 6. DELETE
    const handleDelete = async (requestId) => {
        showFeedback('');
        try {
            await axios.delete(`${API_URL}/${requestId}`, getAuthHeader());
            showFeedback('Service request deleted successfully!');
            fetchRequests();
        } catch (err) {
            console.error('Error deleting request:', err);
            showFeedback('Delete failed: Could not remove request.', true);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard</h1>
            <p>Welcome, {username}!</p>
            <p>Email: {email}</p>
            <p>User ID: {userId}</p>
            <button onClick={handleLogout}>Logout</button>

            <hr />

            {statusMessage && (
                <p style={{ color: isError ? 'red' : 'green', fontWeight: 'bold' }}>
                    {statusMessage}
                </p>
            )}

            <h3>Create Service Request</h3>
            <form onSubmit={handleCreate}>
                <div>
                    <label>Title: </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <br />
                <div>
                    <label>Description: </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <br />
                <button type="submit">Submit Request</button>
            </form>

            <hr />

            <h3>Your Service Requests</h3>
            {requests.length === 0 ? (
                <p>No service requests found.</p>
            ) : (
                <ul>
                    {requests.map((req) => (
                        <li key={req.id} style={{ marginBottom: '15px' }}>
                            {editingId === req.id ? (
                                <div>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                    />
                                    <button onClick={() => handleUpdate(req.id)}>Save</button>
                                    <button onClick={handleCancelEdit}>Cancel</button>
                                </div>
                            ) : (
                                <div>
                                    <strong>{req.title}</strong> - {req.description} [Status: {req.status}]
                                    {' '}
                                    <button onClick={() => {
                                        setEditingId(req.id);
                                        setEditTitle(req.title);
                                        setEditDescription(req.description);
                                    }}>Edit</button>
                                    {' '}
                                    <button onClick={() => handleDelete(req.id)}>Delete</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
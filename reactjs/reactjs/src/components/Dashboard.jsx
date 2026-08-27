import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Resolve user credentials and session info
    const userId = location.state?.userId || localStorage.getItem('userId');
    const username = location.state?.username || localStorage.getItem('username') || 'User';
    const email = location.state?.email || localStorage.getItem('email') || 'Email';
    const token = localStorage.getItem('token');

    // Axios config using Bearer JWT authentication
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // Store user session info locally when passed from Login
    useEffect(() => {
        if (location.state?.userId) {
            localStorage.setItem('userId', location.state.userId);
            if (location.state.username) localStorage.setItem('username', location.state.username);
            if (location.state.email) localStorage.setItem('email', location.state.email);
            if (location.state.token) localStorage.setItem('token', location.state.token);
        }
    }, [location.state]);

    // CRUD state management
    const [requests, setRequests] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Feedback message state
    const [statusMessage, setStatusMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const API_URL = 'http://localhost:8080/api/service-requests';

    // Helper to display status feedback
    const showFeedback = (msg, error = false) => {
        setStatusMessage(msg);
        setIsError(error);
    };

    // 1. READ (Fetch all requests for this user)
    const fetchRequests = async () => {
        if (!userId) {
            showFeedback('No user session found. Please log in again.', true);
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`, config);
            setRequests(response.data);
        } catch (err) {
            console.error('Error fetching requests:', err);
            showFeedback('Failed to load service requests.', true);
        }
    };

    useEffect(() => {
        if (token) {
            fetchRequests();
        }
    }, [userId, token]);

    // 2. CREATE (Add a new service request)
    const handleCreate = async (e) => {
        e.preventDefault();
        showFeedback('');

        if (!title.trim() || !description.trim()) {
            showFeedback('Submission failed: Title and Description cannot be empty.', true);
            return;
        }

        try {
            await axios.post(`${API_URL}/user/${userId}`, { title, description }, config);
            setTitle('');
            setDescription('');
            showFeedback('Service request submitted successfully!');
            fetchRequests();
        } catch (err) {
            console.error('Error creating request:', err);
            showFeedback('Submission failed: Could not create request.', true);
        }
    };

    // 3. UPDATE (Save edited request)
    const handleUpdate = async (requestId) => {
        showFeedback('');
        try {
            await axios.put(
                `${API_URL}/${requestId}`,
                { title: editTitle, description: editDescription },
                config
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

    // Cancel Edit Handler
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
        setEditDescription('');
    };

    // 4. DELETE (Remove request)
    const handleDelete = async (requestId) => {
        showFeedback('');
        try {
            await axios.delete(`${API_URL}/${requestId}`, config);
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

            {/* STATUS FEEDBACK DISPLAY */}
            {statusMessage && (
                <p style={{ color: isError ? 'red' : 'green', fontWeight: 'bold' }}>
                    {statusMessage}
                </p>
            )}

            {/* CREATE FORM */}
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

            {/* READ / VIEW LIST */}
            <h3>Your Service Requests</h3>
            {requests.length === 0 ? (
                <p>No service requests found.</p>
            ) : (
                <ul>
                    {requests.map((req) => (
                        <li key={req.id} style={{ marginBottom: '15px' }}>
                            {editingId === req.id ? (
                                /* EDIT MODE */
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
                                /* VIEW MODE */
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
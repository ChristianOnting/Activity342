import { useLocation, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || 'User';

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {username}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
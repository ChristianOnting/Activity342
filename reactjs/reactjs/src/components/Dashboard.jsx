import { useLocation, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || 'User';
  const email = location.state?.email || 'Email';
  const id = location.state?.userId || '#ID';
  

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {username}!</p>
      <p>{email} is a great email.</p>
      <p>Your id is {id}.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
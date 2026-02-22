import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  //to redirect the user after they log in
  const navigate = useNavigate();

  //runs when they click submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop the page from refreshing
    setError('');

    try {
      // Sends the request to your backend
      const response = await apiClient.post('/auth/login', { email, password });
      const token = response.data.token || response.data.data?.token;
    
      if (token) {
        localStorage.setItem('token', token);
        // Teleport the user to the dashboard
        navigate('/dashboard'); 
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Check your credentials.');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Login to Decision Engine</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Email:</label><br/>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label>Password:</label><br/>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Login
        </button>
      </form>
    </div>
  );
}
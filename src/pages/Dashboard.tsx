import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

interface Decision {
  id: string;
  title: string;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTitle, setNewTitle] = useState('');

  //fetchs decisions on load
  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      const response = await apiClient.get('/decisions');
      setDecisions(response.data.data);
    } catch (err) {
      setError('Failed to load decisions.');
    } finally {
      setLoading(false);
    }
  };

  //handle creating a decision
  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      // Send the POST request to the Kitchen
      await apiClient.post('/decisions', { title: newTitle });
      
      // Clear the input box
      setNewTitle('');
      
      // Refresh the list so the new decision pops up instantly!
      fetchDecisions();
    } catch (err) {
      alert('Failed to create decision');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Decisions</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/*Creation Form */}
      <form onSubmit={handleCreateDecision} style={{ display: 'flex', gap: '10px', marginBottom: '30px', padding: '20px', background: '#333', borderRadius: '8px' }}>
        <input 
          type="text" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          placeholder="e.g., Which city should I move to?" 
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Create New
        </button>
      </form>

      {loading && <p>Loading your engine data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'grid', gap: '15px' }}>
          {decisions.length === 0 ? (
            <p>You haven't created any decisions yet.</p>
          ) : (
            decisions.map((decision) => (
              <div 
                key={decision.id} 
                onClick={() => navigate(`/decisions/${decision.id}`)} // <-- NEW: Teleport to the detail page
                style={{ 
                  border: '1px solid #444', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  background: '#222', 
                  color: 'white',
                  cursor: 'pointer', // <-- NEW: Makes it look like a button
                  transition: 'background 0.2s'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{decision.title}</h3>
                <p style={{ margin: 0, fontSize: '0.8em', color: '#aaa' }}>
                  Created: {new Date(decision.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
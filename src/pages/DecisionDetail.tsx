import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function DecisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newOption, setNewOption] = useState('');
  const [newCriterion, setNewCriterion] = useState('');
  const [criterionWeight, setCriterionWeight] = useState(3);
  
  //Scoring states
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [selectedCriterionId, setSelectedCriterionId] = useState('');
  const [scoreValue, setScoreValue] = useState(5);

  //Evaluation Engine states
  const [results, setResults] = useState<any>(null);
  const [evaluationError, setEvaluationError] = useState('');

  const fetchDecision = async () => {
    try {
      const response = await apiClient.get(`/decisions/${id}`);
      setDecision(response.data.data);
      
      // Auto-select the first option/criterion for the scoring form
      if (response.data.data.options?.length > 0 && !selectedOptionId) {
        setSelectedOptionId(response.data.data.options[0].id);
      }
      if (response.data.data.criteria?.length > 0 && !selectedCriterionId) {
        setSelectedCriterionId(response.data.data.criteria[0].id);
      }
    } catch (err) {
      alert('Failed to load decision details.');
      navigate('/dashboard'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecision();
  }, [id]);

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOption.trim()) return;
    try {
      await apiClient.post(`/decisions/${id}/options`, { name: newOption });
      setNewOption('');
      fetchDecision();
    } catch (err) { alert('Failed to add option'); }
  };

  const handleAddCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriterion.trim()) return;
    try {
      await apiClient.post(`/decisions/${id}/criteria`, { name: newCriterion, weight: criterionWeight });
      setNewCriterion('');
      setCriterionWeight(3);
      fetchDecision();
    } catch (err) { alert('Failed to add criterion'); }
  };

  //Submit a Score
  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/decisions/${id}/scores`, {
        optionId: selectedOptionId,
        criterionId: selectedCriterionId,
        value: scoreValue
      });
      alert('Score saved!');
      fetchDecision(); // Refresh to ensure backend state is synced
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add score (You may have already scored this pair!).');
    }
  };

  // NEW: Trigger the Backend Evaluation Engine
  const handleEvaluate = async () => {
    setEvaluationError('');
    setResults(null);
    try {
      const response = await apiClient.get(`/decisions/${id}/evaluate`);
      setResults(response.data.data);
    } catch (err: any) {
      setEvaluationError(err.response?.data?.error || 'Failed to run engine. Make sure all options have scores!');
    }
  };

  if (loading) return <div style={{ padding: '50px', color: 'white' }}>Loading matrix...</div>;
  if (!decision) return <div style={{ padding: '50px', color: 'red' }}>Decision not found.</div>;

  return (
    <div style={{ padding: '50px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>
        &larr; Back to Dashboard
      </button>

      <h1>{decision.title}</h1>
      
      {/* MATRIX BUILDER */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        {/* Options Panel */}
        <div style={{ flex: 1, padding: '20px', background: '#222', color: 'white', borderRadius: '8px' }}>
          <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>1. Options</h2>
          <form onSubmit={handleAddOption} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input value={newOption} onChange={(e) => setNewOption(e.target.value)} placeholder="e.g., Toyota" style={{ flex: 1, padding: '8px' }}/>
            <button type="submit" style={{ padding: '8px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Add</button>
          </form>
          <ul style={{ paddingLeft: '20px' }}>
            {decision.options?.map((opt: any) => <li key={opt.id} style={{ margin: '10px 0' }}>{opt.name}</li>)}
          </ul>
        </div>

        {/* Criteria Panel */}
        <div style={{ flex: 1, padding: '20px', background: '#222', color: 'white', borderRadius: '8px' }}>
          <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>2. Criteria</h2>
          <form onSubmit={handleAddCriterion} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input value={newCriterion} onChange={(e) => setNewCriterion(e.target.value)} placeholder="e.g., Mileage" style={{ flex: 1, padding: '8px' }}/>
            <select value={criterionWeight} onChange={(e) => setCriterionWeight(Number(e.target.value))} style={{ padding: '8px' }}>
              <option value={1}>1 - Low</option><option value={2}>2</option><option value={3}>3 - Med</option><option value={4}>4</option><option value={5}>5 - High</option>
            </select>
            <button type="submit" style={{ padding: '8px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Add</button>
          </form>
          <ul style={{ paddingLeft: '20px' }}>
            {decision.criteria?.map((crit: any) => <li key={crit.id} style={{ margin: '10px 0' }}>{crit.name} <span style={{ color: '#007bff' }}>(W: {crit.weight})</span></li>)}
          </ul>
        </div>
      </div>

      {/* SCORING PANEL */}
      {decision.options?.length > 0 && decision.criteria?.length > 0 && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#333', color: 'white', borderRadius: '8px' }}>
          <h2 style={{ borderBottom: '1px solid #555', paddingBottom: '10px' }}>3. Assign Scores</h2>
          <form onSubmit={handleAddScore} style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '15px' }}>
            <select value={selectedOptionId} onChange={(e) => setSelectedOptionId(e.target.value)} style={{ flex: 1, padding: '10px' }}>
              {decision.options.map((opt: any) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <span style={{ fontSize: '20px' }}>&times;</span>
            <select value={selectedCriterionId} onChange={(e) => setSelectedCriterionId(e.target.value)} style={{ flex: 1, padding: '10px' }}>
              {decision.criteria.map((crit: any) => <option key={crit.id} value={crit.id}>{crit.name}</option>)}
            </select>
            <span style={{ fontSize: '20px' }}>=</span>
            <input type="number" min="1" max="10" value={scoreValue} onChange={(e) => setScoreValue(Number(e.target.value))} style={{ width: '80px', padding: '10px' }} title="Score from 1 to 10" />
            <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Save Score</button>
          </form>
        </div>
      )}

      {/* EVALUATION ENGINE BUTTON */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button onClick={handleEvaluate} style={{ padding: '15px 40px', fontSize: '20px', background: '#ffc107', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          ⚙️ RUN DECISION ENGINE
        </button>
        {evaluationError && <p style={{ color: 'red', marginTop: '15px' }}>{evaluationError}</p>}
      </div>

      {/* RESULTS DASHBOARD */}
      {results && (
        <div style={{ marginTop: '40px', padding: '30px', background: '#111', color: 'white', borderRadius: '12px', border: '2px solid #ffc107' }}>
          <h2 style={{ textAlign: 'center', color: '#ffc107', textTransform: 'uppercase', letterSpacing: '2px' }}>Winner</h2>
          <div style={{ textAlign: 'center', fontSize: '40px', fontWeight: 'bold', margin: '20px 0' }}>
            🏆 {results.winner.name} <span style={{ fontSize: '24px', color: '#aaa' }}>({results.winner.totalScore} pts)</span>
          </div>
          
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '30px' }}>Full Rankings</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {results.rankings.map((rank: any, index: number) => (
              <li key={rank.id} style={{ padding: '15px', background: index === 0 ? '#222' : '#1a1a1a', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '18px' }}><strong>#{index + 1}</strong> {rank.name}</span>
                <span style={{ color: '#007bff', fontWeight: 'bold' }}>{rank.totalScore} pts</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
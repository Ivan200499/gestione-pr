import { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

function CreateEvent({ onEventCreated }) {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [availableTickets, setAvailableTickets] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const eventData = {
        name,
        date,
        location,
        price: Number(price),
        availableTickets: Number(availableTickets),
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await addDoc(collection(db, 'events'), eventData);

      // Reset form
      setName('');
      setDate('');
      setLocation('');
      setPrice('');
      setAvailableTickets('');
      setError('');

      if (onEventCreated) {
        onEventCreated();
      }
    } catch (error) {
      setError('Errore durante la creazione dell\'evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h3>Crea Nuovo Evento</h3>
      {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nome Evento:</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Data:</label>
          <input 
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Luogo:</label>
          <input 
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Prezzo (€):</label>
          <input 
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Biglietti Disponibili:</label>
          <input 
            type="number"
            value={availableTickets}
            onChange={(e) => setAvailableTickets(e.target.value)}
            required
            min="1"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Creazione in corso...' : 'Crea Evento'}
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;
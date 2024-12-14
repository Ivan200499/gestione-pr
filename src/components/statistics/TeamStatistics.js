import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

function TeamStatistics({ teamId, onClose }) {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [teamId]);

  async function fetchStatistics() {
    try {
      // Recupera tutti i promoter del team
      const promotersQuery = query(
        collection(db, 'users'),
        where('teamLeaderId', '==', teamId),
        where('role', '==', 'promoter')
      );
      const promotersSnapshot = await getDocs(promotersQuery);
      const promoters = promotersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Per ogni promoter, recupera le sue vendite
      const promoterStats = await Promise.all(promoters.map(async (promoter) => {
        const salesQuery = query(
          collection(db, 'sales'),
          where('promoterId', '==', promoter.id)
        );
        const salesSnapshot = await getDocs(salesQuery);
        const sales = salesSnapshot.docs.map(doc => doc.data());

        return {
          promoter,
          totalSales: sales.length,
          totalRevenue: sales.reduce((acc, sale) => acc + sale.totalPrice, 0),
          sales
        };
      }));

      setStatistics({
        teamTotalSales: promoterStats.reduce((acc, stat) => acc + stat.totalSales, 0),
        teamTotalRevenue: promoterStats.reduce((acc, stat) => acc + stat.totalRevenue, 0),
        promoterStats
      });

      setLoading(false);
    } catch (error) {
      console.error('Errore nel recupero delle statistiche:', error);
      setLoading(false);
    }
  }

  if (loading) return <div>Caricamento statistiche...</div>;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto'
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer'
        }}
      >
        ��
      </button>

      <h3>Statistiche del Team</h3>
      <div style={{ marginBottom: '20px' }}>
        <p>Vendite totali: {statistics.teamTotalSales}</p>
        <p>Ricavo totale: €{statistics.teamTotalRevenue}</p>
      </div>

      <h4>Statistiche per Promoter</h4>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {statistics.promoterStats.map(({ promoter, totalSales, totalRevenue }) => (
          <div key={promoter.id} style={{
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <h5>{promoter.name}</h5>
            <p>Vendite: {totalSales}</p>
            <p>Ricavo: €{totalRevenue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamStatistics; 
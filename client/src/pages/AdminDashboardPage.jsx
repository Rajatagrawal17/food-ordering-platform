import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { Spinner } from '../components/common/Spinner';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { connectSocket, disconnectSocket, onSocketEvent } from '../services/socketService';

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await adminService.analytics();
        setAnalytics(response);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  useEffect(() => {
    const socket = connectSocket(token);
    const unsubscribe = onSocketEvent('admin:dashboard', (payload) => {
      setAnalytics((prev) => (prev ? { ...prev, ...payload } : payload));
    });

    return () => {
      unsubscribe();
      if (socket) {
        disconnectSocket();
      }
    };
  }, [token]);

  const handleDownloadRevenue = async () => {
    try {
      const blob = await adminService.exportRevenue();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'revenue_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadSales = async () => {
    try {
      const blob = await adminService.exportSales();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Spinner label="Loading dashboard" />;
  }

  const revenueData = analytics?.revenueOverTime ?? [];
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);
  const chartHeight = 160;
  const chartWidth = 500;

  const points = revenueData
    .map((d, index) => {
      const x = (index / Math.max(1, revenueData.length - 1)) * chartWidth;
      const y = chartHeight - (d.revenue / maxRevenue) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const topFoods = analytics?.topSellingFoods ?? [];
  const maxQty = Math.max(...topFoods.map((f) => f.quantity), 1);

  return (
    <section className="page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div className="page__hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span className="page__eyebrow">Administration</span>
          <h1 className="page__title">Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button onClick={handleDownloadRevenue}>
            Export Revenue CSV
          </Button>
          <Button onClick={handleDownloadSales}>
            Export Sales CSV
          </Button>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard label="Users" value={analytics?.users ?? 0} tone="neutral" />
        <StatCard label="Foods" value={analytics?.foods ?? 0} tone="good" />
        <StatCard label="Orders" value={analytics?.orders ?? 0} tone="warning" />
        <StatCard label="Revenue" value={`₹${analytics?.revenue ?? 0}`} tone="good" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        <div className="dashboard-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 600 }}>Revenue Over Time</h3>
          {revenueData.length > 0 ? (
            <div style={{ position: 'relative' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <polyline
                  fill="none"
                  stroke="#ff7f32"
                  strokeWidth="3"
                  points={points}
                />
                {revenueData.map((d, index) => {
                  const x = (index / Math.max(1, revenueData.length - 1)) * chartWidth;
                  const y = chartHeight - (d.revenue / maxRevenue) * chartHeight;
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="5" fill="#ff7f32" />
                      <text x={x} y={y - 10} fontSize="10" textAnchor="middle" fill="#1f2937">
                        ₹{d.revenue}
                      </text>
                      <text x={x} y={chartHeight + 15} fontSize="9" textAnchor="middle" fill="#6b7280">
                        {d._id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <p className="muted">No sales data available yet.</p>
          )}
        </div>

        <div className="dashboard-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 600 }}>Top Selling Dishes</h3>
          {topFoods.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {topFoods.map((food, index) => {
                const percentage = (food.quantity / maxQty) * 100;
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: 500 }}>{food._id}</span>
                      <span className="muted" style={{ fontSize: '0.85rem' }}>{food.quantity} units (₹{food.revenue})</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #ff9e59, #ff7f32)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">No sales data available yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
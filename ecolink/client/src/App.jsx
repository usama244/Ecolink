import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import ImpactPage from './pages/ImpactPage';
import ProducerDashboard from './pages/producer/Dashboard';
import UploadListing from './pages/producer/UploadListing';
import ProducerMatches from './pages/producer/Matches';
import ProducerAnalytics from './pages/producer/Analytics';
import ConsumerDashboard from './pages/consumer/Dashboard';
import ConsumerSearch from './pages/consumer/Search';
import ConsumerRecommendations from './pages/consumer/Recommendations';
import AdminDashboard from './pages/admin/Dashboard';
import AdminVerify from './pages/admin/Verify';
import AdminModeration from './pages/admin/Moderation';
import AdminDisputes from './pages/admin/Disputes';
import AdminTransactions from './pages/admin/Transactions';
import DealChat from './pages/DealChat';
import Profile from './pages/Profile';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.5rem' }}>♻️</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'consumer') return <Navigate to="/consumer" replace />;
  return <Navigate to="/producer" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* Producer */}
        <Route path="/producer" element={<ProtectedRoute roles={['producer']}><ProducerDashboard /></ProtectedRoute>} />
        <Route path="/producer/upload" element={<ProtectedRoute roles={['producer']}><UploadListing /></ProtectedRoute>} />
        <Route path="/producer/matches" element={<ProtectedRoute roles={['producer']}><ProducerMatches /></ProtectedRoute>} />
        <Route path="/producer/analytics" element={<ProtectedRoute roles={['producer']}><ProducerAnalytics /></ProtectedRoute>} />

        {/* Consumer */}
        <Route path="/consumer" element={<ProtectedRoute roles={['consumer']}><ConsumerDashboard /></ProtectedRoute>} />
        <Route path="/consumer/search" element={<ProtectedRoute roles={['consumer']}><ConsumerSearch /></ProtectedRoute>} />
        <Route path="/consumer/recommendations" element={<ProtectedRoute roles={['consumer']}><ConsumerRecommendations /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/verify" element={<ProtectedRoute roles={['admin']}><AdminVerify /></ProtectedRoute>} />
        <Route path="/admin/moderation" element={<ProtectedRoute roles={['admin']}><AdminModeration /></ProtectedRoute>} />
        <Route path="/admin/disputes" element={<ProtectedRoute roles={['admin']}><AdminDisputes /></ProtectedRoute>} />
        <Route path="/admin/transactions" element={<ProtectedRoute roles={['admin']}><AdminTransactions /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/deals/:id" element={<ProtectedRoute><DealChat /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/impact" element={<ImpactPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

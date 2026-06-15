import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, LogOut, ShieldCheck, Cpu, HardDrive, Network } from 'lucide-react';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5050/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile. Session may have expired.');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
        localStorage.clear();
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Verifying session security credentials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-card">
          <h1>Session Denied</h1>
          <p>{error}</p>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Header bar */}
      <header className="dashboard-header">
        <div className="header-logo">
          <ShieldCheck size={24} className="text-purple" />
          <span>SecurePortal</span>
          <span className="badge-live">Live</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-banner">
          <h1>Hello, {profile?.username}!</h1>
          <p>Your session is encrypted and authenticated using JSON Web Tokens.</p>
        </div>

        {/* Stats Row */}
        <div className="dashboard-grid">
          <div className="stats-card">
            <div className="stats-header">
              <span className="stats-title">Profile Integrity</span>
              <ShieldCheck size={20} className="text-purple" />
            </div>
            <div className="stats-value">Verified</div>
            <div className="stats-subtext">JWT Signature verified</div>
          </div>

          <div className="stats-card">
            <div className="stats-header">
              <span className="stats-title">API Server Connection</span>
              <Cpu size={20} className="text-green" />
            </div>
            <div className="stats-value">Active</div>
            <div className="stats-subtext">Route: /api/auth/profile</div>
          </div>

          <div className="stats-card">
            <div className="stats-header">
              <span className="stats-title">Database Status</span>
              <HardDrive size={20} className="text-blue" />
            </div>
            <div className="stats-value">Connected</div>
            <div className="stats-subtext">MongoDB Atlas Cluster</div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-details-card">
          <h2>User Profile Details</h2>
          <div className="details-list">
            <div className="detail-item">
              <div className="detail-label">
                <User size={18} />
                <span>User Identifier</span>
              </div>
              <div className="detail-value text-mono">{profile?._id}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <User size={18} />
                <span>Username</span>
              </div>
              <div className="detail-value">{profile?.username}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Mail size={18} />
                <span>Email Address</span>
              </div>
              <div className="detail-value">{profile?.email}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Calendar size={18} />
                <span>Account Created At</span>
              </div>
              <div className="detail-value">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

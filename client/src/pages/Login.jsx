import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'field_worker' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    try {
      const handleResponse = async (res) => {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server is offline or unreachable. Please verify the backend is running.");
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Operation failed');
        return data;
      };

      if (isRegistering) {
        // Register flow
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }),
        });
        await handleResponse(res);

        // Auto-login after successful registration
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });

        try {
          const loginData = await handleResponse(loginRes);
          setAuth(loginData.user, loginData.token);
          navigate('/');
        } catch (loginErr) {
          setIsRegistering(false);
          setSuccess('Registration successful! Please sign in.');
        }

      } else {
        // Login flow
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await handleResponse(res);
        setAuth(data.user, data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center p-5">
      <div className="w-full max-w-sm p-8 rounded-3xl 
          bg-[#111827]/90 
          border border-white/10 
          shadow-[0_0_40px_rgba(0,0,0,0.6)] 
          backdrop-blur-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🆘</div>
          <h1 className="text-2xl font-bold">DisasterAid</h1>
          <p className="text-muted text-sm mt-1">Emergency Rescue Coordination</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <input
              id="name-input" type="text" placeholder="Full Name"
              autoComplete="name" required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            id="email-input" type="email" placeholder="Email"
            autoComplete="email" required
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            id="password-input" type="password" placeholder="Password"
            autoComplete={isRegistering ? "new-password" : "current-password"} required
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {isRegistering && (
            <select
              className="input-field"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="field_worker">Field Worker</option>
              <option value="command">Command Center</option>
              <option value="admin">Admin</option>
            </select>
          )}

          {error && (
            <p role="alert" className="text-emergency text-sm text-center">{error}</p>
          )}
          {success && (
            <p role="alert" className="text-safe text-sm text-center">{success}</p>
          )}
          <button id="auth-btn" type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing…' : (isRegistering ? '📝 Create Account' : '🔐 Sign In')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button type="button" onClick={toggleMode} className="text-sm text-muted hover:text-white transition-colors">
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-muted text-sm mb-3">No account? Need immediate help?</p>
          <button
            id="guest-sos-btn"
            onClick={() => navigate('/sos')}
            className="btn-secondary py-3 text-sm"
          >
            🆘 Send SOS as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

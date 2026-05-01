import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
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

  const handleGoogleSignIn = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${API_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server is offline or unreachable. Please verify the backend is running.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google sign-in failed');

      setAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Try again.');
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

        {/* Google Sign-In */}
        <div className="mt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-muted text-xs">or continue with</span>
            <div className="flex-1 border-t border-white/10" />
          </div>
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-secondary py-3 text-sm flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Sign in with Google
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

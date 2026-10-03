import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, setToken } from '../api.js';

function AuthForm({ mode }) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const register = mode === 'register';

  async function submit(e) {
    e.preventDefault(); setError('');
    try {
      const res = await api(register ? '/auth/register' : '/auth/login', { method: 'POST', body: f });
      setToken(res.token);
      const plan = params.get('plan');
      if (register && (plan === 'pro' || plan === 'enterprise')) await api('/billing/plan', { method: 'POST', body: { plan }, auth: true });
      nav('/dashboard');
    } catch (err) { setError(err.message); }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="card mx-auto max-w-sm space-y-4" aria-label={register ? 'Register' : 'Log in'}>
      <h1 className="text-2xl font-bold text-white">{register ? 'Create your account' : 'Log in'}</h1>
      {register && <div><label htmlFor="n" className="label">Name</label><input id="n" className="input" value={f.name} onChange={set('name')} /></div>}
      <div><label htmlFor="e" className="label">Email</label><input id="e" type="email" required className="input" value={f.email} onChange={set('email')} /></div>
      <div><label htmlFor="p" className="label">Password</label><input id="p" type="password" required minLength={8} className="input" value={f.password} onChange={set('password')} /></div>
      <button className="btn w-full">{register ? 'Sign up' : 'Log in'}</button>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <p className="text-sm text-zinc-400">{register ? <>Have an account? <Link className="text-gold" to="/login">Log in</Link></> : <>New here? <Link className="text-gold" to="/register">Sign up free</Link></>}</p>
    </form>
  );
}
export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;

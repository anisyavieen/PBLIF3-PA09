import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3h6" />
      <path d="M10 3v6.2L4.6 18.1A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.9L14 9.2V3" />
      <path d="M7.5 15h9" />
    </svg>
  )
}

function EyeIcon({ off }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  )
}

function Rocket() {
  return (
    <svg className="login-rocket" viewBox="0 0 160 240" aria-hidden="true">
      <defs>
        <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9bec9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M62 190 L98 190 L84 238 L76 238 Z" fill="url(#flame)" />
      <path d="M80 6 C110 40 116 90 112 150 L112 190 L48 190 L48 150 C44 90 50 40 80 6 Z" fill="#0f172a" />
      <path d="M48 140 L14 176 L14 196 L48 184 Z" fill="#0f172a" />
      <path d="M112 140 L146 176 L146 196 L112 184 Z" fill="#0f172a" />
      <circle cx="80" cy="96" r="14" fill="none" stroke="#fff" strokeWidth="9" />
      <rect x="62" y="138" width="36" height="9" rx="4.5" fill="#fff" />
    </svg>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login gagal. Periksa email dan password.')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/dashboard', { replace: true })
    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-visual" aria-hidden="true">
        <div className="planet planet-top" />
        <div className="planet planet-bottom" />
        <span className="star star-top" />
        <span className="star star-bottom" />
      </div>

      <Rocket />

      <div className="login-main">
        <section className="login-card">
          <div className="login-brand">
            <FlaskIcon />
            <span>V-LabVerse</span>
          </div>

          <h1>Masuk sebagai Admin</h1>
          <p className="login-description">
            Login hanya untuk Admin pengelolaan sistem. Pengguna umum tidak
            memerlukan akun.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Masukkan Email disini"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password disini"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                <EyeIcon off={!showPassword} />
              </button>
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? 'MEMPROSES...' : 'LOGIN'}
            </button>
          </form>

        </section>
      </div>
    </main>
  )
}

export default Login
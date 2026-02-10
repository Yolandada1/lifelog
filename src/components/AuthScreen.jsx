import { useState } from 'react'

const T = {
  bg: '#fafaf9', card: '#ffffff', text: '#1c1917',
  textSec: '#78716c', textTer: '#a8a29e',
  accentSoft: '#f5f5f4', divider: '#e7e5e4',
  radius: 12, shadow: '0 4px 12px rgba(0,0,0,0.06)',
}

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError(''); setSuccess(''); setLoading(true)
    const { error: err } = isLogin
      ? await onSignIn(email, password)
      : await onSignUp(email, password)

    if (err) {
      setError(err.message)
    } else if (!isLogin) {
      setSuccess('注册成功！请查看邮箱验证链接。')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: T.card, borderRadius: 20, padding: 36, width: '100%',
        maxWidth: 380, boxShadow: T.shadow, border: `1px solid ${T.divider}`,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 700, color: T.text,
            letterSpacing: '-0.03em', marginBottom: 4,
          }}>
            LifeLog
          </h1>
          <p style={{ fontSize: 13, color: T.textTer }}>记录每一天的你</p>
        </div>

        {/* Tab */}
        <div style={{
          display: 'flex', background: T.accentSoft, borderRadius: T.radius,
          padding: 3, marginBottom: 24,
        }}>
          {['登录', '注册'].map((label, i) => (
            <button key={label}
              onClick={() => { setIsLogin(i === 0); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: '9px 0', border: 'none', borderRadius: 10,
                background: (isLogin ? i === 0 : i === 1) ? T.card : 'transparent',
                color: (isLogin ? i === 0 : i === 1) ? T.text : T.textTer,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: (isLogin ? i === 0 : i === 1) ? T.shadow : 'none',
                transition: 'all 0.2s',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="邮箱地址"
            style={{
              width: '100%', padding: '12px 16px', background: T.accentSoft,
              border: `1px solid ${T.divider}`, borderRadius: T.radius,
              fontSize: 14, color: T.text, outline: 'none', boxSizing: 'border-box',
            }}
          />
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="密码（至少 6 位）"
            style={{
              width: '100%', padding: '12px 16px', background: T.accentSoft,
              border: `1px solid ${T.divider}`, borderRadius: T.radius,
              fontSize: 14, color: T.text, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: '8px 12px', marginBottom: 16, fontSize: 12, color: '#dc2626',
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
            padding: '8px 12px', marginBottom: 16, fontSize: 12, color: '#059669',
          }}>
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          style={{
            width: '100%', padding: '12px 0', background: T.text, color: '#fff',
            border: 'none', borderRadius: T.radius, fontSize: 14, fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !email || !password ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}>
          {loading ? '请稍候...' : isLogin ? '登录' : '注册'}
        </button>

        <p style={{
          textAlign: 'center', fontSize: 11, color: T.textTer, marginTop: 20,
        }}>
          数据安全存储于云端，多设备自动同步
        </p>
      </div>
    </div>
  )
}
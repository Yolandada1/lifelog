import { useState, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { useAuth, useLifeLogData } from './lib/useSupabase'
import AuthScreen from './components/AuthScreen'
import LifeLogApp from './LifeLogApp'

const SAMPLE_DATA = {
  "2026-02-01": { mood:4, score:8, diary:"完成了ML项目数据预处理。", note:"效率还不错", todos:[{id:"s1",text:"完成CS6620 Assignment 3",done:true,tags:["study"],reminder:null,period:"morning"}] },
  "2026-02-03": { mood:5, score:9, diary:"周末去了波士顿downtown！", note:"", todos:[{id:"s2",text:"买生活用品",done:true,tags:["life"],reminder:null,period:"afternoon"}] },
  "2026-02-09": { mood:4, score:8, diary:"code-switching项目有了新进展。", note:"和队友沟通很顺畅", todos:[{id:"s3",text:"团队会议",done:true,tags:["work","social"],reminder:"10:00",period:"morning"},{id:"s4",text:"健身1小时",done:true,tags:["health"],reminder:"17:00",period:"evening"}] },
}

const DEFAULT_TAGS = [
  { id:"work",label:"工作",color:"#2563eb",icon:"💼" },
  { id:"study",label:"学习",color:"#7c3aed",icon:"📚" },
  { id:"life",label:"生活",color:"#6366f1",icon:"🏠" },
]

function useLocalData() {
  const [data, setData] = useState(SAMPLE_DATA)
  const [tags, setTags] = useState(DEFAULT_TAGS)

  const updateEntry = useCallback((key, updates) => {
    setData(prev => ({
      ...prev,
      [key]: { mood: 4, score: 6, diary: '', note: '', todos: [], ...prev[key], ...updates }
    }))
  }, [])

  const addTodo = useCallback((dateKey, text, todoTags, reminder, period) => {
    setData(prev => {
      const existing = prev[dateKey] || { mood: 4, score: 6, diary: '', note: '', todos: [] }
      return {
        ...prev,
        [dateKey]: {
          ...existing,
          todos: [...existing.todos, { id: 'l_' + Date.now(), text, done: false, tags: todoTags || [], reminder: reminder || null, period: period || 'morning' }]
        }
      }
    })
  }, [])

  const toggleTodo = useCallback((dateKey, idx) => {
    setData(prev => {
      const entry = prev[dateKey]; if (!entry?.todos?.[idx]) return prev
      const todos = [...entry.todos]; todos[idx] = { ...todos[idx], done: !todos[idx].done }
      return { ...prev, [dateKey]: { ...entry, todos } }
    })
  }, [])

  const removeTodo = useCallback((dateKey, idx) => {
    setData(prev => {
      const entry = prev[dateKey]; if (!entry?.todos?.[idx]) return prev
      return { ...prev, [dateKey]: { ...entry, todos: entry.todos.filter((_, i) => i !== idx) } }
    })
  }, [])

  const saveTodo = useCallback((dateKey, idx, updated) => {
    setData(prev => {
      const entry = prev[dateKey]; if (!entry?.todos?.[idx]) return prev
      const todos = [...entry.todos]; todos[idx] = updated
      return { ...prev, [dateKey]: { ...entry, todos } }
    })
  }, [])

  const addTag = useCallback((tag) => setTags(prev => [...prev, tag]), [])
  const editTag = useCallback((updated) => setTags(prev => prev.map(t => t.id === updated.id ? { ...t, label: updated.label, color: updated.color } : t)), [])
  const deleteTag = useCallback((tagId) => setTags(prev => prev.filter(t => t.id !== tagId)), [])

  return { data, tags, loading: false, updateEntry, addTodo, toggleTodo, removeTodo, saveTodo, addTag, editTag, deleteTag }
}

export default function App() {
  if (!supabase) return <LocalApp />
  return <CloudApp />
}

function LocalApp() {
  const store = useLocalData()
  return <LifeLogApp {...store} onSignOut={null} userEmail={null} />
}

function CloudApp() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const store = useLifeLogData(user)

  if (authLoading) {
    return <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1c1917', marginBottom: 8 }}>LifeLog</h1>
        <p style={{ color: '#a8a29e', fontSize: 13 }}>加载中...</p>
      </div>
    </div>
  }

  if (!user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />

  if (store.loading) {
    return <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1c1917', marginBottom: 8 }}>LifeLog</h1>
        <p style={{ color: '#a8a29e', fontSize: 13 }}>正在同步数据...</p>
      </div>
    </div>
  }

  return <LifeLogApp {...store} onSignOut={signOut} userEmail={user.email} />
}
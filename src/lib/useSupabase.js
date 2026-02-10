import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'

const DEFAULT_TAGS = [
  { id: 'work', label: '工作', color: '#2563eb', icon: '💼' },
  { id: 'study', label: '学习', color: '#7c3aed', icon: '📚' },
  { id: 'health', label: '健康', color: '#059669', icon: '💪' },
  { id: 'social', label: '社交', color: '#d97706', icon: '👥' },
  { id: 'hobby', label: '爱好', color: '#db2777', icon: '🎨' },
  { id: 'life', label: '生活', color: '#6366f1', icon: '🏠' },
  { id: 'finance', label: '财务', color: '#0d9488', icon: '💰' },
  { id: 'travel', label: '旅行', color: '#ea580c', icon: '✈️' },
]

/* ─── Auth Hook ─── */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signUp, signIn, signOut }
}

/* ─── Data Hook ─── */
export function useLifeLogData(user) {
  const [data, setData] = useState({})
  const [tags, setTags] = useState(DEFAULT_TAGS)
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)

  // Load all data on mount
  useEffect(() => {
    if (!supabase || !user) { setLoading(false); return }
    loadAll()
  }, [user])

  const loadAll = async () => {
    setLoading(true)
    try {
      // Load tags
      const { data: dbTags } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)

      if (dbTags && dbTags.length > 0) {
        setTags(dbTags.map(t => ({
          id: t.id, label: t.label, color: t.color, icon: t.icon
        })))
      } else {
        // First time: seed default tags
        const toInsert = DEFAULT_TAGS.map(t => ({ ...t, user_id: user.id }))
        await supabase.from('tags').insert(toInsert)
        setTags(DEFAULT_TAGS)
      }

      // Load entries + todos
      const { data: entries } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)

      const { data: todos } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })

      // Merge into { date: { mood, score, diary, todos: [...] } }
      const merged = {}
      entries?.forEach(e => {
        merged[e.date] = {
          mood: e.mood,
          score: e.score,
          diary: e.diary || '',
          todos: [],
        }
      })
      todos?.forEach(t => {
        if (!merged[t.date]) {
          merged[t.date] = { mood: 3, score: 5, diary: '', todos: [] }
        }
        merged[t.date].todos.push({
          id: t.id,
          text: t.text,
          done: t.done,
          tags: t.tags || [],
          reminder: t.reminder,
        })
      })

      setData(merged)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
    setLoading(false)
  }

  // Save entry (debounced - waits 500ms after last change)
  const saveEntry = useCallback((dateKey, entry) => {
    if (!supabase || !user) return

    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        // Upsert entry
        await supabase.from('entries').upsert({
          date: dateKey,
          user_id: user.id,
          mood: entry.mood,
          score: entry.score,
          diary: entry.diary || '',
          updated_at: new Date().toISOString(),
        })
      } catch (err) {
        console.error('Save entry failed:', err)
      }
    }, 500)
  }, [user])

  // Update entry in local state + sync to DB
  const updateEntry = useCallback((dateKey, updates) => {
    setData(prev => {
      const existing = prev[dateKey] || { mood: 3, score: 5, diary: '', todos: [] }
      const newEntry = { ...existing, ...updates }
      // Sync to Supabase
      saveEntry(dateKey, newEntry)
      return { ...prev, [dateKey]: newEntry }
    })
  }, [saveEntry])

  // ─── Todo operations ───

  const addTodo = useCallback(async (dateKey, text) => {
    const todo = { text, done: false, tags: [], reminder: null }

    if (supabase && user) {
      const { data: inserted } = await supabase.from('todos').insert({
        date: dateKey,
        user_id: user.id,
        text,
        done: false,
        tags: [],
        reminder: null,
        sort_order: (data[dateKey]?.todos?.length || 0),
      }).select().single()

      if (inserted) todo.id = inserted.id
    } else {
      todo.id = 'local_' + Date.now()
    }

    setData(prev => {
      const existing = prev[dateKey] || { mood: 3, score: 5, diary: '', todos: [] }
      return { ...prev, [dateKey]: { ...existing, todos: [...existing.todos, todo] } }
    })

    // Also ensure entry row exists
    if (supabase && user) {
      const existing = data[dateKey]
      await supabase.from('entries').upsert({
        date: dateKey,
        user_id: user.id,
        mood: existing?.mood || 3,
        score: existing?.score || 5,
        diary: existing?.diary || '',
      })
    }
  }, [user, data])

  const toggleTodo = useCallback(async (dateKey, idx) => {
    setData(prev => {
      const entry = prev[dateKey]
      if (!entry?.todos?.[idx]) return prev
      const todos = [...entry.todos]
      todos[idx] = { ...todos[idx], done: !todos[idx].done }

      if (supabase && user && todos[idx].id) {
        supabase.from('todos').update({ done: todos[idx].done })
          .eq('id', todos[idx].id).then()
      }

      return { ...prev, [dateKey]: { ...entry, todos } }
    })
  }, [user])

  const removeTodo = useCallback(async (dateKey, idx) => {
    setData(prev => {
      const entry = prev[dateKey]
      if (!entry?.todos?.[idx]) return prev
      const removed = entry.todos[idx]
      const todos = entry.todos.filter((_, i) => i !== idx)

      if (supabase && user && removed.id) {
        supabase.from('todos').delete().eq('id', removed.id).then()
      }

      return { ...prev, [dateKey]: { ...entry, todos } }
    })
  }, [user])

  const saveTodo = useCallback(async (dateKey, idx, updated) => {
    setData(prev => {
      const entry = prev[dateKey]
      if (!entry?.todos?.[idx]) return prev
      const todos = [...entry.todos]
      todos[idx] = updated

      if (supabase && user && updated.id) {
        supabase.from('todos').update({
          text: updated.text,
          done: updated.done,
          tags: updated.tags || [],
          reminder: updated.reminder,
        }).eq('id', updated.id).then()
      }

      return { ...prev, [dateKey]: { ...entry, todos } }
    })
  }, [user])

  // ─── Tag operations ───

  const addTag = useCallback(async (tag) => {
    setTags(prev => [...prev, tag])
    if (supabase && user) {
      await supabase.from('tags').insert({
        id: tag.id, user_id: user.id,
        label: tag.label, color: tag.color, icon: tag.icon,
      })
    }
  }, [user])

  return {
    data, tags, loading,
    updateEntry, addTodo, toggleTodo, removeTodo, saveTodo, addTag,
  }
}
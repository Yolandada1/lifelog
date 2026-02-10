import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'

const DEFAULT_TAGS = [
  { id:'work',label:'工作',color:'#2563eb',icon:'💼' },
  { id:'study',label:'学习',color:'#7c3aed',icon:'📚' },
  { id:'life',label:'生活',color:'#6366f1',icon:'🏠' },
]

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null); setLoading(false)
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
  const signOut = async () => { await supabase.auth.signOut(); setUser(null) }

  return { user, loading, signUp, signIn, signOut }
}

export function useLifeLogData(user) {
  const [data, setData] = useState({})
  const [tags, setTags] = useState(DEFAULT_TAGS)
  const [stickyNotes, setStickyNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!supabase || !user) { setLoading(false); return }
    loadAll()
  }, [user])

  const loadAll = async () => {
    setLoading(true)
    try {
      const { data: dbTags } = await supabase.from('tags').select('*').eq('user_id', user.id)
      if (dbTags && dbTags.length > 0) {
        setTags(dbTags.map(t => ({ id: t.id, label: t.label, color: t.color, icon: t.icon })))
      } else {
        const toInsert = DEFAULT_TAGS.map(t => ({ ...t, user_id: user.id }))
        await supabase.from('tags').insert(toInsert)
        setTags(DEFAULT_TAGS)
      }

      const { data: entries } = await supabase.from('entries').select('*').eq('user_id', user.id)
      const { data: todos } = await supabase.from('todos').select('*').eq('user_id', user.id).order('sort_order', { ascending: true })
      const { data: stickies } = await supabase.from('sticky_notes').select('*').eq('user_id', user.id).order('created_at', { ascending: true })

      if (stickies) setStickyNotes(stickies.map(s => ({ id: s.id, text: s.text, color: s.color })))

      const merged = {}
      entries?.forEach(e => {
        merged[e.date] = { mood: e.mood, score: e.score, diary: e.diary || '', note: e.note || '', todos: [] }
      })
      todos?.forEach(t => {
        if (!merged[t.date]) merged[t.date] = { mood: 4, score: 6, diary: '', note: '', todos: [] }
        merged[t.date].todos.push({
          id: t.id, text: t.text, done: t.done,
          tags: t.tags || [], reminder: t.reminder, period: t.period || 'morning',
        })
      })
      setData(merged)
    } catch (err) { console.error('Failed to load:', err) }
    setLoading(false)
  }

  const saveEntry = useCallback((dateKey, entry) => {
    if (!supabase || !user) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await supabase.from('entries').upsert({
          date: dateKey, user_id: user.id,
          mood: entry.mood, score: entry.score,
          diary: entry.diary || '', note: entry.note || '',
          updated_at: new Date().toISOString(),
        })
      } catch (err) { console.error('Save failed:', err) }
    }, 500)
  }, [user])

  const updateEntry = useCallback((dateKey, updates) => {
    setData(prev => {
      const existing = prev[dateKey] || { mood: 4, score: 6, diary: '', note: '', todos: [] }
      const newEntry = { ...existing, ...updates }
      saveEntry(dateKey, newEntry)
      return { ...prev, [dateKey]: newEntry }
    })
  }, [saveEntry])

  const addTodo = useCallback(async (dateKey, text, todoTags, reminder, period) => {
    const todo = { text, done: false, tags: todoTags || [], reminder: reminder || null, period: period || 'morning' }
    if (supabase && user) {
      const { data: inserted } = await supabase.from('todos').insert({
        date: dateKey, user_id: user.id, text, done: false,
        tags: todoTags || [], reminder: reminder || null, period: period || 'morning',
        sort_order: (data[dateKey]?.todos?.length || 0),
      }).select().single()
      if (inserted) todo.id = inserted.id
    } else { todo.id = 'local_' + Date.now() }

    setData(prev => {
      const existing = prev[dateKey] || { mood: 4, score: 6, diary: '', note: '', todos: [] }
      return { ...prev, [dateKey]: { ...existing, todos: [...existing.todos, todo] } }
    })

    if (supabase && user) {
      const existing = data[dateKey]
      await supabase.from('entries').upsert({
        date: dateKey, user_id: user.id,
        mood: existing?.mood || 4, score: existing?.score || 6,
        diary: existing?.diary || '', note: existing?.note || '',
      })
    }
  }, [user, data])

  const toggleTodo = useCallback(async (dateKey, idx) => {
    setData(prev => {
      const entry = prev[dateKey]; if (!entry?.todos?.[idx]) return prev
      const todos = [...entry.todos]; todos[idx] = { ...todos[idx], done: !todos[idx].done }
      if (supabase && user && todos[idx].id)
        supabase.from('todos').update({ done: todos[idx].done }).eq('id', todos[idx].id).then()
      return { ...prev, [dateKey]: { ...entry, todos } }
    })
  }, [user])

  const removeTodo = useCallback(async (dateKey, idx) => {
    setData(prev => {
      const entry = prev[dateKey]; if (!entry?.todos?.[idx]) return prev
      const removed = entry.todos[idx]
      if (supabase && user && removed.id)
        supabase.from('todos').delete().eq('id', removed.id).then()
      return { ...prev, [dateKey]: { ...entry, todos: entry.todos.filter((_, i) => i !== idx) } }
    })
  }, [user])

  const saveTodo = useCallback(async (dateKey, idx, updated) => {
    setData(prev => {
      const entry = prev[dateKey]; if (!entry?.todos?.[idx]) return prev
      const todos = [...entry.todos]; todos[idx] = updated
      if (supabase && user && updated.id)
        supabase.from('todos').update({
          text: updated.text, done: updated.done,
          tags: updated.tags || [], reminder: updated.reminder, period: updated.period || 'morning',
        }).eq('id', updated.id).then()
      return { ...prev, [dateKey]: { ...entry, todos } }
    })
  }, [user])

  const addTag = useCallback(async (tag) => {
    setTags(prev => [...prev, tag])
    if (supabase && user)
      await supabase.from('tags').insert({ id: tag.id, user_id: user.id, label: tag.label, color: tag.color, icon: tag.icon || '' })
  }, [user])

  const editTag = useCallback(async (updated) => {
    setTags(prev => prev.map(t => t.id === updated.id ? { ...t, label: updated.label, color: updated.color } : t))
    if (supabase && user)
      await supabase.from('tags').update({ label: updated.label, color: updated.color }).eq('id', updated.id).eq('user_id', user.id)
  }, [user])

  const deleteTag = useCallback(async (tagId) => {
    setTags(prev => prev.filter(t => t.id !== tagId))
    if (supabase && user)
      await supabase.from('tags').delete().eq('id', tagId).eq('user_id', user.id)
  }, [user])

  const addStickyNote = useCallback(async (note) => {
    setStickyNotes(prev => [...prev, note])
    if (supabase && user)
      await supabase.from('sticky_notes').insert({ id: note.id, user_id: user.id, text: note.text, color: note.color })
  }, [user])

  const updateStickyNote = useCallback(async (id, text) => {
    setStickyNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n))
    if (supabase && user)
      await supabase.from('sticky_notes').update({ text }).eq('id', id).eq('user_id', user.id)
  }, [user])

  const deleteStickyNote = useCallback(async (id) => {
    setStickyNotes(prev => prev.filter(n => n.id !== id))
    if (supabase && user)
      await supabase.from('sticky_notes').delete().eq('id', id).eq('user_id', user.id)
  }, [user])

  return { data, tags, stickyNotes, loading, updateEntry, addTodo, toggleTodo, removeTodo, saveTodo, addTag, editTag, deleteTag, addStickyNote, updateStickyNote, deleteStickyNote }
}
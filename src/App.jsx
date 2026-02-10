/**
 * App.jsx — 入口文件
 * 
 * 这个文件负责：
 *  1. 判断有没有 Supabase（没有就用本地模式）
 *  2. 有 Supabase → 显示登录页 → 登录后加载数据
 *  3. 把数据操作函数传给 LifeLogApp 主组件
 * 
 * 【重要】你需要把之前 Claude artifact 中的完整 LifeLog 组件代码
 *  复制到 src/LifeLogApp.jsx 中，并做以下修改：
 * 
 *  ① 将 export default function App() 改为：
 *     export default function LifeLogApp({ 
 *       data, tags, updateEntry, addTodo, toggleTodo, 
 *       removeTodo, saveTodo, addTag, onSignOut, userEmail 
 *     })
 * 
 *  ② 删除组件内部的这些 useState（因为现在从 props 传入）：
 *     - const [tags, sTags] = ...
 *     - const [data, sData] = ...
 *     以及相关的 upd, togTodo, addTodo, rmTodo, saveTodo 等函数
 * 
 *  ③ 将所有内部调用替换为 props 中的函数：
 *     - upd(key, {...})     → updateEntry(key, {...})
 *     - togTodo(i)          → toggleTodo(sel, i)   // 注意要传 dateKey
 *     - addTodo()           → addTodo(sel, nTodo)   // 传 dateKey 和 text
 *     - rmTodo(i)           → removeTodo(sel, i)
 *     - saveTodo(i, u)      → saveTodo(sel, i, u)
 *     - sTags(p=>[...p,t])  → addTag(t)
 * 
 *  ④ 在 Nav 组件中加一个登出按钮和用户邮箱显示：
 *     {userEmail && <span style={{fontSize:11,color:'#a8a29e'}}>{userEmail}</span>}
 *     {onSignOut && <button onClick={onSignOut}>登出</button>}
 * 
 *  如果你觉得改动太多，也可以不拆分文件——直接在下面
 *  把完整的 LifeLog 组件代码贴进来，并做上述修改即可。
 * 
 *  或者——最简单的方式——告诉我，我帮你直接生成改好的完整版！
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { useAuth, useLifeLogData } from './lib/useSupabase'
import AuthScreen from './components/AuthScreen'
import LifeLogApp from './LifeLogApp'  // ← 主界面组件

// ─── 本地模式的示例数据 ───
const SAMPLE_DATA = {
  "2026-02-01": { mood:4, score:8, diary:"完成了ML项目数据预处理。", todos:[{id:"s1",text:"完成CS6620 Assignment 3",done:true,tags:["study"],reminder:null}] },
  "2026-02-03": { mood:5, score:9, diary:"周末去了波士顿downtown！", todos:[{id:"s2",text:"买生活用品",done:true,tags:["life"],reminder:null}] },
  "2026-02-09": { mood:4, score:8, diary:"code-switching项目有了新进展。", todos:[{id:"s3",text:"团队会议",done:true,tags:["work","social"],reminder:"10:00"}] },
}

const DEFAULT_TAGS = [
  { id:"work",label:"工作",color:"#2563eb",icon:"💼" },
  { id:"study",label:"学习",color:"#7c3aed",icon:"📚" },
  { id:"health",label:"健康",color:"#059669",icon:"💪" },
  { id:"social",label:"社交",color:"#d97706",icon:"👥" },
  { id:"hobby",label:"爱好",color:"#db2777",icon:"🎨" },
  { id:"life",label:"生活",color:"#6366f1",icon:"🏠" },
  { id:"finance",label:"财务",color:"#0d9488",icon:"💰" },
  { id:"travel",label:"旅行",color:"#ea580c",icon:"✈️" },
]

// ─── 本地模式 hook（无 Supabase 时使用）───
function useLocalData() {
  const [data, setData] = useState(SAMPLE_DATA)
  const [tags, setTags] = useState(DEFAULT_TAGS)

  const updateEntry = useCallback((key, updates) => {
    setData(prev => ({
      ...prev,
      [key]: { mood: 3, score: 5, diary: '', todos: [], ...prev[key], ...updates }
    }))
  }, [])

  const addTodo = useCallback((dateKey, text) => {
    setData(prev => {
      const existing = prev[dateKey] || { mood: 3, score: 5, diary: '', todos: [] }
      return {
        ...prev,
        [dateKey]: {
          ...existing,
          todos: [...existing.todos, { id: 'l_' + Date.now(), text, done: false, tags: [], reminder: null }]
        }
      }
    })
  }, [])

  const toggleTodo = useCallback((dateKey, idx) => {
    setData(prev => {
      const entry = prev[dateKey]
      if (!entry?.todos?.[idx]) return prev
      const todos = [...entry.todos]
      todos[idx] = { ...todos[idx], done: !todos[idx].done }
      return { ...prev, [dateKey]: { ...entry, todos } }
    })
  }, [])

  const removeTodo = useCallback((dateKey, idx) => {
    setData(prev => {
      const entry = prev[dateKey]
      if (!entry?.todos?.[idx]) return prev
      return { ...prev, [dateKey]: { ...entry, todos: entry.todos.filter((_, i) => i !== idx) } }
    })
  }, [])

  const saveTodo = useCallback((dateKey, idx, updated) => {
    setData(prev => {
      const entry = prev[dateKey]
      if (!entry?.todos?.[idx]) return prev
      const todos = [...entry.todos]
      todos[idx] = updated
      return { ...prev, [dateKey]: { ...entry, todos } }
    })
  }, [])

  const addTag = useCallback((tag) => setTags(prev => [...prev, tag]), [])

  return { data, tags, loading: false, updateEntry, addTodo, toggleTodo, removeTodo, saveTodo, addTag }
}


// ─── 主入口 ───
export default function App() {
  // 如果没有配置 Supabase，直接进入本地模式
  if (!supabase) {
    return <LocalApp />
  }
  return <CloudApp />
}

function LocalApp() {
  const store = useLocalData()
  return (
    <LifeLogApp
      {...store}
      onSignOut={null}
      userEmail={null}
    />
  )
}

function CloudApp() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const store = useLifeLogData(user)

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fafaf9', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1c1917', marginBottom: 8 }}>LifeLog</h1>
          <p style={{ color: '#a8a29e', fontSize: 13 }}>加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />
  }

  if (store.loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fafaf9', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1c1917', marginBottom: 8 }}>LifeLog</h1>
          <p style={{ color: '#a8a29e', fontSize: 13 }}>正在同步数据...</p>
        </div>
      </div>
    )
  }

  return (
    <LifeLogApp
      {...store}
      onSignOut={signOut}
      userEmail={user.email}
    />
  )
}
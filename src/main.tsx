import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Check, Copy, Dices, LogIn, Plus, Save, Sparkles, Users, X } from 'lucide-react'
import { ActivityState, saveActivity, supabase } from './supabase'
import './styles.css'

const sampleNames = ['林晓晴', '陈宇航', '王心妍', '李子轩', '周思涵', '张嘉乐', '黄诗琪', '刘奕辰', '杨可欣', '吴浩然', '郑语彤', '孙明轩']
const emptyState: ActivityState = { title: '2026 新生欢迎会', theme: '把新朋友缝进同一段好时光', groupCount: 4, groupSize: 0, names: sampleNames, leaders: [], together: [], apart: [], groups: [], status: 'draft' }

function parseLines(value: string) { return [...new Set(value.split(/[\n,，]/).map(x => x.trim()).filter(Boolean))] }
function parseRules(value: string) { return value.split('\n').map(line => parseLines(line)).filter(rule => rule.length > 0) }

function groupPeople(names: string[], groupCount: number, groupSize: number, leaders: string[], together: string[][], apart: string[][]) {
  const validTogether = together.map(rule => rule.filter(n => names.includes(n))).filter(rule => rule.length > 1)
  const claimed = new Set(validTogether.flat())
  const count = groupCount || Math.ceil(names.length / Math.max(groupSize, 1))
  const capacity = groupSize || Math.ceil(names.length / count)
  const selectedLeaders = Array.from({ length: count }, (_, index) => leaders[index]).map(name => names.includes(name) ? name : '')
  const groups = selectedLeaders.map(leader => leader ? [leader] : [])
  const leaderSet = new Set(selectedLeaders.filter(Boolean))
  const units = validTogether.reduce<string[][]>((result, unit) => {
    const leaderIndex = selectedLeaders.findIndex(leader => unit.includes(leader))
    if (leaderIndex >= 0) groups[leaderIndex].push(...unit.filter(name => name !== selectedLeaders[leaderIndex]))
    else result.push(unit)
    return result
  }, [])
  units.push(...names.filter(name => !claimed.has(name) && !leaderSet.has(name)).map(name => [name]))
  const shuffled = [...units].sort(() => Math.random() - .5).sort((a, b) => b.length - a.length)
  const conflicts = (candidate: string[], group: string[]) => apart.some(rule => candidate.some(a => rule.includes(a)) && group.some(b => rule.includes(b)))
  for (const unit of shuffled) {
    const candidates = groups.map((g, i) => ({ g, i })).filter(({ g }) => g.length + unit.length <= capacity && !conflicts(unit, g))
    const chosen = (candidates.length ? candidates : groups.map((g, i) => ({ g, i }))).sort((a, b) => a.g.length - b.g.length)[0]
    chosen.g.push(...unit)
  }
  return groups
}

function App() {
  const [state, setState] = useState<ActivityState>(emptyState)
  const [page, setPage] = useState<'dashboard' | 'configure' | 'draw'>('dashboard')
  const [slug, setSlug] = useState('')
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const [loggedIn, setLoggedIn] = useState(!supabase)
<<<<<<< HEAD
  const [activities, setActivities] = useState<Array<{slug: string, title: string, updated_at: string}>>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
=======
>>>>>>> 4c1c3e76e22843acee7d1cf9f71d41696f4c65cc
  const publicView = new URLSearchParams(location.search).get('view') === 'public'
  const publicUrl = `${location.origin}${location.pathname}?activity=${slug || 'your-activity'}&view=public`
  const namesText = state.names.join('\n')
  const togetherText = state.together.map(r => r.join('、')).join('\n')
  const apartText = state.apart.map(r => r.join('、')).join('\n')

  useEffect(() => {
    const client = supabase
    if (!client) return
    client.auth.getSession().then(({ data }) => setLoggedIn(Boolean(data.session)))
    const params = new URLSearchParams(location.search); const id = params.get('activity')
    if (!id) return
    setSlug(id)
    client.from('activities').select('state').eq('slug', id).single().then(({ data }) => { if (data?.state) setState(data.state as ActivityState) })
    const channel = client.channel(`activity-${id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'activities', filter: `slug=eq.${id}` }, payload => setState(payload.new.state as ActivityState)).subscribe()
    return () => { client.removeChannel(channel) }
  }, [])

<<<<<<< HEAD
  const loadMyActivities = async () => {
    const client = supabase
    if (!client) return
    setLoadingActivities(true)
    const { data } = await client.from('activities').select('slug, state, updated_at').order('updated_at', { ascending: false })
    if (data) setActivities(data.map(d => ({ slug: d.slug, title: (d.state as ActivityState).title, updated_at: d.updated_at })))
    setLoadingActivities(false)
  }

  useEffect(() => { if (loggedIn && page === 'dashboard') loadMyActivities() }, [loggedIn, page])

=======
>>>>>>> 4c1c3e76e22843acee7d1cf9f71d41696f4c65cc
  const totalGroups = state.groupCount || Math.ceil(state.names.length / Math.max(state.groupSize, 1))
  const save = async () => { const nextSlug = slug || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; setSlug(nextSlug); await saveActivity(nextSlug, state); setMessage('已保存到云端'); setTimeout(() => setMessage(''), 1800) }
  const draw = async () => { const selectedLeaders = state.leaders ?? []; const invalidRule = state.together.some(rule => rule.filter(name => selectedLeaders.includes(name)).length > 1); if (invalidRule) { setMessage('同一“必须同组”规则中不能设置两位不同组长'); return }; const activitySlug = slug || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; setSlug(activitySlug); const groups = groupPeople(state.names, state.groupCount, state.groupSize, selectedLeaders, state.together, state.apart); const next = { ...state, leaders: selectedLeaders, groups, status: 'drawing' as const }; setState(next); setPage('draw'); await saveActivity(activitySlug, next); setTimeout(async () => { const done = { ...next, status: 'done' as const }; setState(done); await saveActivity(activitySlug, done) }, 1600) }
  const update = (patch: Partial<ActivityState>) => setState(prev => ({ ...prev, ...patch }))

  if (!loggedIn && !publicView) return <Login onLogin={() => setLoggedIn(true)} />
  if (publicView) return <PublicScreen state={state} />

  return <main className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => setPage('dashboard')}><span>✦</span> 欢迎小铺</button><nav><button onClick={() => setPage('dashboard')}>我的活动</button><button className="nav-active" onClick={() => setPage('configure')}>新建活动</button></nav><span className="stitch-badge">管理员</span></header>
<<<<<<< HEAD
    {page === 'dashboard' && <section className="workspace"><div className="section-heading"><div><p className="eyebrow">MY ACTIVITIES</p><h2>我的活动</h2></div><div className="actions"><button className="primary" onClick={() => { setState(emptyState); setSlug(''); setPage('configure') }}><Plus size={18}/> 创建新活动</button></div></div>
      <div className="activities-list">
        {loadingActivities ? <p className="hint">加载中…</p> : activities.length === 0 ? <p className="hint">暂无活动，点击上方按钮创建</p> : activities.map(a => <article key={a.slug} className="activity-item" onClick={() => { setSlug(a.slug); supabase?.from('activities').select('state').eq('slug', a.slug).single().then(({ data }) => { if (data?.state) setState(data.state as ActivityState); setPage('configure') })} }><div><strong>{a.title}</strong><span>{new Date(a.updated_at).toLocaleString()}</span></div><button className="chip" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(`${location.origin}${location.pathname}?activity=${a.slug}&view=public`) }}><Copy size={14}/> 复制公开链接</button></article>)}
      </div></section>}
=======
    {page === 'dashboard' && <section className="hero"><div><p className="eyebrow">WELCOME PANTRY</p><h1>把新朋友，<br/>缝进同一段好时光。</h1><p>创建活动、套用名单模板，再让现场一起见证随机分组。</p><button className="primary" onClick={() => setPage('configure')}><Plus size={18}/> 创建迎新活动</button></div><div className="hero-collage"><span className="cloud">☁</span><span className="star">✦</span><div className="fabric-card"><Users size={30}/><b>实时同步</b><small>公开链接，所有人一起看</small></div></div></section>}
>>>>>>> 4c1c3e76e22843acee7d1cf9f71d41696f4c65cc
    {page === 'configure' && <section className="workspace"><div className="section-heading"><div><p className="eyebrow">ACTIVITY STUDIO</p><h2>制作一场新活动</h2></div><div className="actions"><button className="secondary" onClick={save}><Save size={16}/> 保存活动</button><button className="primary" onClick={draw}><Dices size={17}/> 开始抽签</button></div></div>
      <div className="editor-grid"><article className="paper-card basics"><CardTitle icon="✦" title="活动名片"/><label>活动名称<input value={state.title} onChange={e => update({ title: e.target.value })}/></label><label>主题文案<input value={state.theme} onChange={e => update({ theme: e.target.value })}/></label><div className="two-inputs"><label>固定组数<input type="number" min="1" value={state.groupCount || ''} onChange={e => update({ groupCount: Number(e.target.value) })}/></label><label>每组人数<input type="number" min="0" value={state.groupSize || ''} onChange={e => update({ groupSize: Number(e.target.value) })}/></label></div><p className="hint">填写其一即可；同时填写时，系统优先保证每组人数。</p></article>
      <article className="paper-card roster"><CardTitle icon="✿" title={`成员名单 · ${state.names.length} 人`}/><textarea value={namesText} onChange={e => update({ names: parseLines(e.target.value) })} placeholder="每行一位成员"/><div className="template-row"><button className="chip"><Save size={14}/> 保存为常用名单</button><button className="chip">套用模板</button></div></article>
      <article className="paper-card captains"><CardTitle icon="👑" title={`队长设置 · ${totalGroups} 组`}/><p className="hint">为每组指定一位队长，队长必须在成员名单中。</p><div className="captain-list">{Array.from({ length: totalGroups }, (_, i) => <label key={i}><span>第 {i + 1} 组队长</span><select value={state.leaders[i] || ''} onChange={e => { const next = [...state.leaders]; next[i] = e.target.value; update({ leaders: next }) }}><option value="">— 无 —</option>{state.names.map(n => <option key={n} value={n}>{n}</option>)}</select></label>)}</div></article>
      <article className="paper-card rule-card"><CardTitle icon="♡" title="必须同组"/><p className="hint">每行一组，使用顿号或逗号分隔姓名。</p><textarea value={togetherText} onChange={e => update({ together: parseRules(e.target.value) })} placeholder="例如：林晓晴、王心妍、周思涵"/></article>
      <article className="paper-card rule-card"><CardTitle icon="✕" title="不能同组"/><p className="hint">同一行中的成员会被彼此分开。</p><textarea value={apartText} onChange={e => update({ apart: parseRules(e.target.value) })} placeholder="例如：陈宇航、李子轩"/></article></div>
      <section className="share-strip"><Sparkles size={20}/><div><b>公开观看链接</b><span>{slug ? publicUrl : '保存活动后生成固定链接'}</span></div><button className="secondary" disabled={!slug} onClick={() => { navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? '已复制' : '复制链接'}</button></section>
    </section>}
    {page === 'draw' && <DrawScreen state={state} onBack={() => setPage('configure')} />}
    {message && <div className="toast">{message}</div>}
  </main>
}

function CardTitle({ icon, title }: { icon: string, title: string }) { return <h3><span className="patch-icon">{icon}</span>{title}</h3> }
function Login({ onLogin }: { onLogin: () => void }) { const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const go = async () => { if (supabase) await supabase.auth.signInWithOtp({ email }); setSent(true); if (!supabase) onLogin() }; return <main className="login-page"><div className="login-card"><span className="big-star">✦</span><p className="eyebrow">WELCOME PANTRY</p><h1>管理员入口</h1><p>登录后创建、保存并控制活动。</p><input value={email} onChange={e => setEmail(e.target.value)} placeholder="管理员邮箱" type="email"/><button className="primary" onClick={go}><LogIn size={17}/>{sent ? '登录链接已发送' : '发送登录链接'}</button><small>部署前请在 Supabase 启用 Email OTP 登录。</small></div></main> }
function DrawScreen({ state, onBack }: { state: ActivityState, onBack: () => void }) { return <section className="draw-page"><button className="back" onClick={onBack}>← 返回编辑</button><p className="eyebrow">{state.status === 'drawing' ? 'DRAWING NOW' : 'GROUPS ARE READY'}</p><h1>{state.status === 'drawing' ? '正在把缘分缝进小组…' : state.title}</h1><p>{state.theme}</p><div className="group-grid">{state.groups.map((group, i) => <article className={`group-card ${state.status === 'drawing' ? 'reveal' : ''}`} style={{ animationDelay: `${i * .22}s` }} key={i}><span>第 {i + 1} 组</span>{state.status === 'drawing' ? <b>✦</b> : <ul>{group.map(n => <li key={n}>{n}</li>)}</ul>}</article>)}</div></section> }
<<<<<<< HEAD
function PublicScreen({ state }: { state: ActivityState }) { const hasGroups = state.groups.length > 0; return <main className="public-page"><div className="public-top"><span>✦ 欢迎小铺</span><span className="live-dot">● 现场同步中</span></div>{!hasGroups && state.status === 'draft' ? <section className="draw-page" style={{textAlign:'center'}}><p className="eyebrow">WAITING FOR DRAW</p><h1>管理员正在准备抽签…</h1><p>请稍候，结果将实时出现在此处</p></section> : <DrawScreen state={state} onBack={() => {}} />}</main> }
=======
function PublicScreen({ state }: { state: ActivityState }) { return <main className="public-page"><div className="public-top"><span>✦ 欢迎小铺</span><span className="live-dot">● 现场同步中</span></div><DrawScreen state={state} onBack={() => {}} /></main> }
>>>>>>> 4c1c3e76e22843acee7d1cf9f71d41696f4c65cc

createRoot(document.getElementById('root')!).render(<App />)

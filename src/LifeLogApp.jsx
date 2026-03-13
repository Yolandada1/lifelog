import { useState, useEffect, useMemo, useRef } from "react";

function StickyNote({note,onUpdate,onDelete}){
  const ref=useRef(null);
  const saveTimer=useRef(null);
  const inited=useRef(false);
  useEffect(()=>{
    if(ref.current&&!inited.current){
      ref.current.innerText=note.text||'';
      inited.current=true;
    }
  },[]);
  const save=()=>{
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{
      if(ref.current)onUpdate(note.id,ref.current.innerText);
    },800);
  };
  return <div style={{
    background:note.color,borderRadius:12,padding:"14px 16px",width:"calc(50% - 5px)",minHeight:80,
    boxShadow:"0 2px 8px rgba(0,0,0,0.06)",position:"relative",fontFamily:"'Georgia',serif",
  }}>
    <div ref={ref} contentEditable suppressContentEditableWarning
      onInput={save}
      onBlur={()=>{if(ref.current)onUpdate(note.id,ref.current.innerText)}}
      placeholder="点击编辑..."
      style={{
        fontSize:13,lineHeight:1.6,color:"#1c1917",whiteSpace:"pre-wrap",
        minHeight:40,outline:"none",cursor:"text",
        empty:"before",
      }}
    />
    <style>{`[contenteditable]:empty:before{content:attr(placeholder);color:#a8a29e;pointer-events:none}`}</style>
    <div style={{display:"flex",gap:4,position:"absolute",top:6,right:6}}>
      <button onMouseDown={e=>{e.preventDefault();document.execCommand('bold')}} style={{background:"rgba(0,0,0,0.06)",border:"none",borderRadius:4,width:22,height:22,cursor:"pointer",fontSize:11,fontWeight:700,color:"#57534e",display:"flex",alignItems:"center",justifyContent:"center"}} title="加粗">B</button>
      <button onMouseDown={e=>{e.preventDefault();document.execCommand('strikeThrough')}} style={{background:"rgba(0,0,0,0.06)",border:"none",borderRadius:4,width:22,height:22,cursor:"pointer",fontSize:11,color:"#57534e",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"line-through"}} title="划线">S</button>
      <button onMouseDown={e=>{e.preventDefault();onDelete(note.id)}} style={{background:"rgba(0,0,0,0.06)",border:"none",borderRadius:4,width:22,height:22,cursor:"pointer",fontSize:11,color:"#a8a29e",display:"flex",alignItems:"center",justifyContent:"center"}} title="删除">×</button>
    </div>
  </div>;
}

const TAG_COLORS=["#2563eb","#9333ea","#059669","#dc2626","#d97706","#db2777","#0891b2","#ea580c","#4f46e5","#16a34a","#e11d48","#ca8a04"];
const MOODS=[
  {val:1,emoji:"🤬",label:"生气",color:"#dc2626"},
  {val:2,emoji:"🙁",label:"EMO",color:"#ea580c"},
  {val:3,emoji:"😶",label:"平静",color:"#d97706"},
  {val:4,emoji:"😋",label:"开心",color:"#2563eb"},
  {val:5,emoji:"🥳",label:"超棒",color:"#059669"},
];
const dkFn=(y,m,d)=>`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const MO=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
const WK=["日","一","二","三","四","五","六"];
const PERIODS=[{id:"morning",label:"🌅 上午"},{id:"afternoon",label:"☀️ 下午"},{id:"evening",label:"🌙 晚上"}];
const T={bg:"#fafaf9",card:"#ffffff",cardBorder:"#e7e5e4",text:"#1c1917",textSec:"#78716c",textTer:"#a8a29e",accentSoft:"#f5f5f4",divider:"#e7e5e4",radius:12,radiusSm:8,shadow:"0 1px 3px rgba(0,0,0,0.04),0 1px 2px rgba(0,0,0,0.03)",shadowMd:"0 4px 12px rgba(0,0,0,0.06)"};
const STICKY_COLORS=["#fef9c3","#dbeafe","#fce7f3","#d1fae5","#ede9fe","#ffedd5"];

function calcDuration(s,e){if(!s||!e)return 0;const[sh,sm]=s.split(":").map(Number);const[eh,em]=e.split(":").map(Number);return Math.max(0,(eh*60+em)-(sh*60+sm))}
function fmtDur(mins){if(!mins)return"";const h=Math.floor(mins/60);const m=mins%60;if(h&&m)return`${h}h${m}min`;if(h)return`${h}h`;return`${m}min`}
function getDayDuration(entry){return(entry?.todos||[]).reduce((s,t)=>s+(t.duration||0),0)}

function Modal({children,onClose}){
  return <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.3)",backdropFilter:"blur(8px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>{children}</div>;
}

function ManageTagsModal({tags,onClose,onAdd,onEdit,onDelete}){
  const[mode,sMode]=useState("list");const[editTag,sEditTag]=useState(null);
  const[label,sLabel]=useState("");const[color,sColor]=useState(TAG_COLORS[0]);
  const startAdd=()=>{sLabel("");sColor(TAG_COLORS[Math.floor(Math.random()*TAG_COLORS.length)]);sMode("add")};
  const startEdit=(t)=>{sEditTag(t);sLabel(t.label);sColor(t.color);sMode("edit")};
  const save=()=>{if(!label.trim())return;if(mode==="add"){onAdd({id:"t_"+Date.now(),label:label.trim(),color,icon:""});sMode("list")}else if(mode==="edit"&&editTag){onEdit({...editTag,label:label.trim(),color});sMode("list")}};
  return <Modal onClose={onClose}><div style={{background:T.card,borderRadius:16,padding:28,width:"min(400px,calc(100vw - 32px))",border:`1px solid ${T.cardBorder}`,boxShadow:T.shadowMd,maxHeight:"80vh",overflowY:"auto"}}>
    {mode==="list"?<>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h3 style={{margin:0,fontSize:16,color:T.text,fontWeight:600}}>管理标签</h3>
        <button onClick={startAdd} style={{background:T.text,border:"none",borderRadius:T.radiusSm,padding:"6px 14px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600}}>+ 新建</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {tags.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:`${t.color}12`,borderRadius:10,border:`1.5px solid ${t.color}30`}}>
          <span style={{flex:1,fontSize:14,color:t.color,fontWeight:600}}>{t.label}</span>
          <button onClick={()=>startEdit(t)} style={{background:"none",border:"none",color:T.textTer,cursor:"pointer",fontSize:12}}>✏️</button>
          <button onClick={()=>{if(confirm(`确定删除「${t.label}」？`))onDelete(t.id)}} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:12}}>🗑</button>
        </div>)}
      </div>
      <button onClick={onClose} style={{width:"100%",marginTop:16,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 0",color:T.textSec,cursor:"pointer",fontSize:13}}>关闭</button>
    </>:<>
      <h3 style={{margin:"0 0 18px",fontSize:16,color:T.text,fontWeight:600}}>{mode==="add"?"新建标签":"编辑标签"}</h3>
      <input value={label} onChange={e=>sLabel(e.target.value)} placeholder="输入标签名称（可含 emoji）" autoFocus style={{width:"100%",background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"12px 14px",color:T.text,fontSize:15,outline:"none",marginBottom:16,boxSizing:"border-box"}}/>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"10px 14px",background:T.accentSoft,borderRadius:T.radiusSm}}>
        <div style={{width:16,height:16,borderRadius:"50%",background:color}}/><span style={{fontSize:15,color,fontWeight:600}}>{label||"预览"}</span>
      </div>
      <div style={{fontSize:12,color:T.textSec,marginBottom:8}}>选择颜色</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
        {TAG_COLORS.map(cl=><button key={cl} onClick={()=>sColor(cl)} style={{width:32,height:32,borderRadius:"50%",border:color===cl?"3px solid "+T.text:"2px solid "+T.divider,background:cl,cursor:"pointer"}}/>)}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>sMode("list")} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 0",color:T.textSec,cursor:"pointer",fontSize:13}}>取消</button>
        <button onClick={save} style={{flex:1,background:T.text,border:"none",borderRadius:T.radiusSm,padding:"10px 0",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>保存</button>
      </div>
    </>}
  </div></Modal>;
}

function AddTodoModal({tags,defaultPeriod,onAdd,onClose}){
  const[t,sT]=useState("");const[st,sST]=useState([]);const[p,sP]=useState(defaultPeriod||"morning");
  const[startT,sStartT]=useState("");const[endT,sEndT]=useState("");
  const dur=calcDuration(startT,endT);
  const tog=id=>sST(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  return <Modal onClose={onClose}><div style={{background:T.card,borderRadius:16,padding:28,width:"min(400px,calc(100vw - 32px))",border:`1px solid ${T.cardBorder}`,boxShadow:T.shadowMd,maxHeight:"85vh",overflowY:"auto"}}>
    <h3 style={{margin:"0 0 16px",fontSize:16,color:T.text,fontWeight:600}}>添加待办</h3>
    <input value={t} onChange={e=>sT(e.target.value)} placeholder="待办内容" autoFocus style={{width:"100%",background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>时段</div>
    <div style={{display:"flex",gap:6,marginBottom:14}}>{PERIODS.map(pd=><button key={pd.id} onClick={()=>sP(pd.id)} style={{flex:1,background:p===pd.id?T.card:T.accentSoft,border:p===pd.id?`2px solid ${T.text}`:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"8px 4px",cursor:"pointer",fontSize:12,fontWeight:p===pd.id?600:400,color:p===pd.id?T.text:T.textSec,boxShadow:p===pd.id?T.shadow:"none"}}>{pd.label}</button>)}</div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>关联标签</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>{tags.map(tg=><button key={tg.id} onClick={()=>tog(tg.id)} style={{background:st.includes(tg.id)?`${tg.color}15`:T.accentSoft,color:st.includes(tg.id)?tg.color:T.textTer,border:st.includes(tg.id)?`2px solid ${tg.color}`:`1px solid ${T.divider}`,borderRadius:16,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:st.includes(tg.id)?600:400}}>{tg.label}</button>)}</div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>⏱ 时间段（可选）</div>
    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
      <input type="time" value={startT} onChange={e=>sStartT(e.target.value)} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"8px 12px",color:T.text,fontSize:14,outline:"none"}}/>
      <span style={{color:T.textTer}}>→</span>
      <input type="time" value={endT} onChange={e=>sEndT(e.target.value)} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"8px 12px",color:T.text,fontSize:14,outline:"none"}}/>
    </div>
    {dur>0&&<div style={{fontSize:12,color:"#059669",marginBottom:14,fontWeight:500}}>投入时间：{fmtDur(dur)}</div>}
    {!dur&&<div style={{height:14,marginBottom:14}}/>}
    <div style={{display:"flex",gap:10}}>
      <button onClick={onClose} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 0",color:T.textSec,cursor:"pointer",fontSize:13}}>取消</button>
      <button onClick={()=>{if(t.trim()){onAdd(t.trim(),st,startT||null,endT||null,dur,p);onClose()}}} style={{flex:1,background:T.text,border:"none",borderRadius:T.radiusSm,padding:"10px 0",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>添加</button>
    </div>
  </div></Modal>;
}

function EditTodoModal({todo,tags,onSave,onClose}){
  const[t,sT]=useState(todo.text);const[st,sST]=useState(todo.tags||[]);const[p,sP]=useState(todo.period||"morning");
  const[startT,sStartT]=useState(todo.startTime||"");const[endT,sEndT]=useState(todo.endTime||"");
  const dur=calcDuration(startT,endT);
  const tog=id=>sST(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  return <Modal onClose={onClose}><div style={{background:T.card,borderRadius:16,padding:28,width:"min(400px,calc(100vw - 32px))",border:`1px solid ${T.cardBorder}`,boxShadow:T.shadowMd}}>
    <h3 style={{margin:"0 0 16px",fontSize:16,color:T.text,fontWeight:600}}>编辑待办</h3>
    <input value={t} onChange={e=>sT(e.target.value)} style={{width:"100%",background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>时段</div>
    <div style={{display:"flex",gap:6,marginBottom:14}}>{PERIODS.map(pd=><button key={pd.id} onClick={()=>sP(pd.id)} style={{flex:1,background:p===pd.id?T.card:T.accentSoft,border:p===pd.id?`2px solid ${T.text}`:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"8px 4px",cursor:"pointer",fontSize:12,fontWeight:p===pd.id?600:400,color:p===pd.id?T.text:T.textSec}}>{pd.label}</button>)}</div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>关联标签</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>{tags.map(tg=><button key={tg.id} onClick={()=>tog(tg.id)} style={{background:st.includes(tg.id)?`${tg.color}15`:T.accentSoft,color:st.includes(tg.id)?tg.color:T.textTer,border:st.includes(tg.id)?`2px solid ${tg.color}`:`1px solid ${T.divider}`,borderRadius:16,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:st.includes(tg.id)?600:400}}>{tg.label}</button>)}</div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>⏱ 时间段</div>
    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
      <input type="time" value={startT} onChange={e=>sStartT(e.target.value)} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"8px 12px",color:T.text,fontSize:14,outline:"none"}}/>
      <span style={{color:T.textTer}}>→</span>
      <input type="time" value={endT} onChange={e=>sEndT(e.target.value)} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"8px 12px",color:T.text,fontSize:14,outline:"none"}}/>
    </div>
    {dur>0&&<div style={{fontSize:12,color:"#059669",marginBottom:14,fontWeight:500}}>投入时间：{fmtDur(dur)}</div>}
    {!dur&&<div style={{height:14,marginBottom:14}}/>}
    <div style={{display:"flex",gap:10}}>
      <button onClick={onClose} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 0",color:T.textSec,cursor:"pointer",fontSize:13}}>取消</button>
      <button onClick={()=>{onSave({...todo,text:t.trim()||todo.text,tags:st,period:p,startTime:startT||'',endTime:endT||'',duration:dur});onClose()}} style={{flex:1,background:T.text,border:"none",borderRadius:T.radiusSm,padding:"10px 0",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>保存</button>
    </div>
  </div></Modal>;
}

// ═══ Stat Components ═══
function MiniBar({vals,colors,labels,h=70,onClickBar}){
  const mx=Math.max(...vals,1);
  return <div style={{display:"flex",alignItems:"flex-end",gap:6,height:h}}>
    {vals.map((v,i)=><div key={i} onClick={()=>onClickBar&&onClickBar(i)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1,cursor:onClickBar?"pointer":"default"}}>
      {v>0&&<span style={{fontSize:10,color:T.textSec,fontWeight:500}}>{v}</span>}
      <div style={{width:"100%",maxWidth:28,height:Math.max((v/mx)*h*.65,2),background:colors?.[i]||T.text,borderRadius:4,transition:"all .2s"}}/>
      {labels&&<span style={{fontSize:9,color:T.textTer}}>{labels[i]}</span>}
    </div>)}
  </div>;
}
function SC({title,children}){
  return <div style={{background:T.card,borderRadius:T.radius,padding:16,border:`1px solid ${T.cardBorder}`,boxShadow:T.shadow}}>
    <div style={{fontSize:12,color:T.textTer,marginBottom:8,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.03em"}}>{title}</div>{children}
  </div>;
}

function EntryCard({dk:dateKey,e,hl,tags:tgs=[],onClickDay}){
  const et=e.todos?[...new Set(e.todos.flatMap(t=>t.tags||[]))]:[];
  const dur=getDayDuration(e);
  return <div onClick={()=>onClickDay&&onClickDay(dateKey)} style={{background:T.card,borderRadius:T.radius,padding:18,border:`1px solid ${T.cardBorder}`,boxShadow:T.shadow,borderLeft:hl?`3px solid ${hl}`:"none",cursor:onClickDay?"pointer":"default"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <span style={{fontSize:14,fontWeight:600,color:T.text}}>{dateKey}</span>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {dur>0&&<span style={{fontSize:11,color:"#059669",background:"#05966910",borderRadius:6,padding:"2px 8px",fontWeight:500}}>{fmtDur(dur)}</span>}
        {e.mood&&MOODS.find(m=>m.val===e.mood)&&<span style={{fontSize:16}}>{MOODS.find(m=>m.val===e.mood).emoji}</span>}
        {e.score&&<span style={{background:T.accentSoft,borderRadius:6,padding:"2px 8px",fontSize:12,color:T.textSec,fontWeight:500}}>{e.score}/10</span>}
      </div>
    </div>
    {e.diary&&<div style={{margin:"4px 0 10px",fontSize:13,lineHeight:1.7,color:T.textSec,whiteSpace:"pre-wrap"}}>{e.diary}</div>}
    {et.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
      {et.map(tid=>{const tg=tgs.find(x=>x.id===tid);return tg?<span key={tid} style={{fontSize:10,background:`${tg.color}10`,color:tg.color,borderRadius:6,padding:"2px 8px",fontWeight:500}}>{tg.label}</span>:null})}
    </div>}
  </div>;
}

// ═══ ExpandableList for clickable distribution bars ═══
function ExpandableList({entries,tags,onClickDay,max=5}){
  const[showAll,sShowAll]=useState(false);
  const items=showAll?entries:entries.slice(0,max);
  return <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
    {items.map(([dk,e])=><div key={dk} onClick={()=>onClickDay(dk)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:T.accentSoft,borderRadius:8,cursor:"pointer",fontSize:13}}>
      <span style={{fontWeight:600,color:T.text,width:90}}>{dk}</span>
      <span style={{flex:1,color:T.textSec,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.diary||"—"}</span>
      {e.mood&&<span>{MOODS.find(m=>m.val===e.mood)?.emoji}</span>}
      {e.score&&<span style={{fontSize:11,color:T.textTer}}>{e.score}分</span>}
    </div>)}
    {entries.length>max&&!showAll&&<button onClick={e=>{e.stopPropagation();sShowAll(true)}} style={{background:"none",border:"none",color:"#2563eb",cursor:"pointer",fontSize:12,textAlign:"center",padding:4}}>查看全部 {entries.length} 条</button>}
  </div>;
}

/* ═══ Insight: Tags ═══ */
function InsightTags({data,tags,fTag,sFTag,onClickDay}){
  const ents=Object.entries(data).filter(([_,v])=>v.todos?.some(t=>t.tags?.includes(fTag))).sort(([a],[b])=>b.localeCompare(a));
  const tO=tags.find(t=>t.id===fTag);
  let tagDur=0;ents.forEach(([_,e])=>e.todos?.forEach(t=>{if(t.tags?.includes(fTag))tagDur+=(t.duration||0)}));
  // per-day duration for this tag
  const dayTagDur=(e)=>(e.todos||[]).filter(t=>t.tags?.includes(fTag)).reduce((s,t)=>s+(t.duration||0),0);
  return <>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>{tags.map(t=><button key={t.id} onClick={()=>sFTag(t.id)} style={{background:fTag===t.id?`${t.color}15`:T.accentSoft,color:fTag===t.id?t.color:T.textSec,border:fTag===t.id?`2px solid ${t.color}`:`1px solid ${T.divider}`,borderRadius:20,padding:"6px 16px",cursor:"pointer",fontSize:12,fontWeight:fTag===t.id?600:400}}>{t.label}</button>)}</div>
    {tO&&<div style={{marginBottom:16,padding:"10px 14px",background:`${tO.color}08`,borderRadius:T.radius,border:`1px solid ${tO.color}20`,display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:13,color:tO.color,fontWeight:600}}>{tO.label} 总投入时间：{tagDur>0?fmtDur(tagDur):"暂无记录"}</span>
    </div>}
    {!ents.length?<div style={{textAlign:"center",padding:40,color:T.textTer}}>暂无「{tO?.label}」记录</div>:<div style={{display:"flex",flexDirection:"column",gap:12}}>{ents.map(([d,e])=>{
      const dur=dayTagDur(e);
      return <TagEntryCard key={d} dk={d} e={e} dur={dur} hl={tO?.color} tags={tags} onClickDay={onClickDay}/>;
    })}</div>}
  </>;
}

// EntryCard variant for tag view: shows per-tag duration
function TagEntryCard({dk:dateKey,e,dur,hl,tags:tgs=[],onClickDay}){
  return <div onClick={()=>onClickDay&&onClickDay(dateKey)} style={{background:T.card,borderRadius:T.radius,padding:18,border:`1px solid ${T.cardBorder}`,boxShadow:T.shadow,borderLeft:hl?`3px solid ${hl}`:"none",cursor:"pointer"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <span style={{fontSize:14,fontWeight:600,color:T.text}}>{dateKey}</span>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {dur>0&&<span style={{fontSize:11,color:"#059669",background:"#05966910",borderRadius:6,padding:"2px 8px",fontWeight:500}}>{fmtDur(dur)}</span>}
        {e.mood&&MOODS.find(m=>m.val===e.mood)&&<span style={{fontSize:16}}>{MOODS.find(m=>m.val===e.mood).emoji}</span>}
        {e.score&&<span style={{background:T.accentSoft,borderRadius:6,padding:"2px 8px",fontSize:12,color:T.textSec,fontWeight:500}}>{e.score}/10</span>}
      </div>
    </div>
    {e.diary&&<div style={{margin:"4px 0 10px",fontSize:13,lineHeight:1.7,color:T.textSec,whiteSpace:"pre-wrap"}}>{e.diary}</div>}
  </div>;
}

/* ═══ Insight: Mood ═══ */
function InsightMood({data,tags,fMood,sFMood,onClickDay}){
  const ents=Object.entries(data).filter(([_,v])=>v.mood===fMood).sort(([a],[b])=>b.localeCompare(a));const mO=MOODS.find(m=>m.val===fMood);
  return <>
    <div style={{display:"flex",gap:8,marginBottom:20}}>{MOODS.map(m=><button key={m.val} onClick={()=>sFMood(m.val)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:fMood===m.val?T.card:T.accentSoft,border:fMood===m.val?`2px solid ${m.color}`:`1px solid ${T.divider}`,borderRadius:T.radius,padding:"12px 4px",cursor:"pointer",boxShadow:fMood===m.val?T.shadowMd:"none"}}>
      <span style={{fontSize:24}}>{m.emoji}</span><span style={{fontSize:10,color:fMood===m.val?m.color:T.textTer,fontWeight:500}}>{m.label}</span>
      <span style={{fontSize:16,fontWeight:700,color:fMood===m.val?T.text:T.textTer}}>{Object.values(data).filter(v=>v.mood===m.val).length}</span>
    </button>)}</div>
    {!ents.length?<div style={{textAlign:"center",padding:40,color:T.textTer}}>暂无</div>:<div style={{display:"flex",flexDirection:"column",gap:12}}>{ents.map(([d,e])=><EntryCard key={d} dk={d} e={e} hl={mO?.color} tags={tags} onClickDay={onClickDay}/>)}</div>}
  </>;
}

/* ═══ Insight: Diary ═══ */
function InsightDiary({data,tags,onClickDay}){
  const ents=Object.entries(data).filter(([_,v])=>v.diary?.trim()).sort(([a],[b])=>b.localeCompare(a));
  return !ents.length?<div style={{textAlign:"center",padding:40,color:T.textTer}}>暂无日记</div>:<div style={{display:"flex",flexDirection:"column",gap:12}}>{ents.map(([d,e])=><EntryCard key={d} dk={d} e={e} tags={tags} onClickDay={onClickDay}/>)}</div>;
}

/* ═══ Arrow Selector ═══ */
function ArrowSelector({label,onPrev,onNext}){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:20}}>
    <button onClick={onPrev} style={{width:34,height:34,borderRadius:"50%",background:T.accentSoft,border:`1px solid ${T.divider}`,cursor:"pointer",fontSize:16,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
    <span style={{fontSize:16,fontWeight:600,color:T.text,minWidth:120,textAlign:"center"}}>{label}</span>
    <button onClick={onNext} style={{width:34,height:34,borderRadius:"50%",background:T.accentSoft,border:`1px solid ${T.divider}`,cursor:"pointer",fontSize:16,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
  </div>;
}

/* ═══ Insight: Summary (Monthly/Yearly) ═══ */
function InsightSummary({stats,tags,type,allData,onClickDay}){
  const keys=Object.keys(type==="monthly"?stats.ms:stats.ys).sort();
  const[idx,sIdx]=useState(keys.length-1);
  const[expandMood,sExpandMood]=useState(null);
  const[expandScore,sExpandScore]=useState(null);

  const sel=keys[idx]||"";
  const sm=(type==="monthly"?stats.ms:stats.ys)[sel];

  const prevPeriod=()=>{sIdx(i=>Math.max(0,i-1));sExpandMood(null);sExpandScore(null)};
  const nextPeriod=()=>{sIdx(i=>Math.min(keys.length-1,i+1));sExpandMood(null);sExpandScore(null)};

  const periodLabel=()=>{
    if(!sel)return"暂无数据";
    if(type==="yearly")return sel+"年";
    const[y,m]=sel.split("-");return y+"年"+MO[parseInt(m)-1];
  };

  const periodEntries=useMemo(()=>{
    return Object.entries(allData).filter(([k])=>k.startsWith(sel)).sort(([a],[b])=>b.localeCompare(a));
  },[allData,sel]);

  const moodEntries=(moodVal)=>periodEntries.filter(([_,v])=>v.mood===moodVal);
  const scoreEntries=(scoreIdx)=>periodEntries.filter(([_,v])=>v.score===scoreIdx+1);

  const periodTimeStats=useMemo(()=>{
    if(!sm)return null;
    let totalMins=0;const tagTime={};const taskRank=[];
    periodEntries.forEach(([dk,e])=>{
      e.todos?.forEach(t=>{if(t.duration>0){totalMins+=t.duration;taskRank.push({text:t.text,duration:t.duration,date:dk});t.tags?.forEach(tid=>{tagTime[tid]=(tagTime[tid]||0)+t.duration})}})
    });
    const sortedTagTime=Object.entries(tagTime).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const sortedTasks=taskRank.sort((a,b)=>b.duration-a.duration).slice(0,10);
    const avgPerDay=sm.count?Math.round(totalMins/sm.count):0;
    return{totalMins,avgPerDay,sortedTagTime,sortedTasks};
  },[periodEntries,sm]);

  // Mood index as percentage (1-5 → 0-100%)
  const moodPct=(val)=>val!==null?Math.round((val/5)*100):null;

  if(!keys.length)return<div style={{textAlign:"center",padding:40,color:T.textTer}}>暂无数据</div>;

  return <>
    <ArrowSelector label={periodLabel()} onPrev={prevPeriod} onNext={nextPeriod}/>
    {!sm?<div style={{textAlign:"center",padding:40,color:T.textTer}}>暂无数据</div>:<div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Overview */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
        <SC title="记录天数"><div style={{fontSize:26,fontWeight:700,color:T.text}}>{sm.count}<span style={{fontSize:13,color:T.textTer,fontWeight:400}}> 天</span></div></SC>
        <SC title="心情指数">{sm.avgMood!==null?<div style={{display:"flex",alignItems:"baseline",gap:6}}><span style={{fontSize:26,fontWeight:700,color:T.text}}>{moodPct(sm.avgMood)}%</span><span style={{fontSize:18}}>{MOODS.find(m=>m.val===Math.round(sm.avgMood))?.emoji}</span></div>:<div style={{fontSize:14,color:T.textTer}}>未记录</div>}</SC>
        <SC title="平均评分">{sm.avgScore!==null?<div style={{fontSize:26,fontWeight:700,color:T.text}}>{sm.avgScore.toFixed(1)}<span style={{fontSize:13,color:T.textTer,fontWeight:400}}>/10</span></div>:<div style={{fontSize:14,color:T.textTer}}>未记录</div>}</SC>
        <SC title="完成率"><div style={{fontSize:26,fontWeight:700,color:sm.compRate>=70?"#059669":sm.compRate>=40?"#d97706":"#dc2626"}}>{sm.compRate}%</div><div style={{fontSize:11,color:T.textTer}}>{sm.doneTodos}/{sm.totalTodos}</div></SC>
        {periodTimeStats&&periodTimeStats.totalMins>0&&<SC title="总投入时间"><div style={{fontSize:26,fontWeight:700,color:T.text}}>{fmtDur(periodTimeStats.totalMins)}</div><div style={{fontSize:11,color:T.textTer}}>日均 {fmtDur(periodTimeStats.avgPerDay)}</div></SC>}
      </div>

      {/* Mood distribution - clickable */}
      <SC title="心情分布（点击查看详情）">
        <MiniBar vals={sm.moodDist} colors={MOODS.map(m=>m.color)} labels={MOODS.map(m=>m.emoji)} onClickBar={i=>{sExpandMood(expandMood===i+1?null:i+1);sExpandScore(null)}}/>
        {expandMood&&<ExpandableList entries={moodEntries(expandMood)} tags={tags} onClickDay={onClickDay}/>}
      </SC>

      {/* Score distribution - clickable */}
      <SC title="评分分布（点击查看详情）">
        <MiniBar vals={sm.scoreDist} colors={sm.scoreDist.map((_,i)=>i<3?"#dc2626":i<6?"#d97706":"#059669")} labels={[...Array(10)].map((_,i)=>`${i+1}`)} onClickBar={i=>{sExpandScore(expandScore===i?null:i);sExpandMood(null)}}/>
        {expandScore!==null&&<ExpandableList entries={scoreEntries(expandScore)} tags={tags} onClickDay={onClickDay}/>}
      </SC>

      {/* Tags: frequency + time side by side */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {sm.topTags.length>0&&<SC title="🔥 高频标签"><div style={{display:"flex",flexDirection:"column",gap:6}}>
          {sm.topTags.map(([tid,cnt],i)=>{const tg=tags.find(t=>t.id===tid);return tg?<div key={tid} style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:T.textTer,width:14}}>#{i+1}</span><span style={{fontSize:12,color:tg.color,fontWeight:600,flex:1}}>{tg.label}</span>
            <span style={{fontSize:11,color:T.textSec}}>{cnt}次</span>
          </div>:null})}
        </div></SC>}
        {periodTimeStats&&periodTimeStats.sortedTagTime.length>0&&<SC title="⏱ 投入排行"><div style={{display:"flex",flexDirection:"column",gap:6}}>
          {periodTimeStats.sortedTagTime.map(([tid,mins],i)=>{const tg=tags.find(t=>t.id===tid);return tg?<div key={tid} style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:T.textTer,width:14}}>#{i+1}</span><span style={{fontSize:12,color:tg.color,fontWeight:600,flex:1}}>{tg.label}</span>
            <span style={{fontSize:11,color:"#059669",fontWeight:500}}>{fmtDur(mins)}</span>
          </div>:null})}
        </div></SC>}
      </div>

      {/* Task time leaderboard */}
      {periodTimeStats&&periodTimeStats.sortedTasks.length>0&&<SC title="📋 事项投入排行">
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {periodTimeStats.sortedTasks.map((t,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:11,color:T.textTer,width:18}}>#{i+1}</span>
            <span style={{flex:1,fontSize:13,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</span>
            <span style={{fontSize:11,color:T.textTer,whiteSpace:"nowrap"}}>{t.date}</span>
            <span style={{fontSize:12,color:"#059669",fontWeight:600,width:55,textAlign:"right"}}>{fmtDur(t.duration)}</span>
          </div>)}
        </div>
      </SC>}
    </div>}
  </>;
}

/* ═══════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════ */
export default function LifeLogApp({data,tags,stickyNotes,updateEntry,addTodo,toggleTodo,removeTodo,saveTodo,addTag,onSignOut,userEmail,editTag,deleteTag,addStickyNote,updateStickyNote,deleteStickyNote}){
  const[yr,sYr]=useState(2026);const[mo,sMo]=useState(2);
  const[sel,sSel]=useState(null);
  const[view,sView]=useState("calendar");
  const[insightTab,sIT]=useState("tags");
  const[fTag,sFTag]=useState(null);const[fMood,sFMood]=useState(4);
  const[eDiary,sEDiary]=useState(false);
  const[showMT,sSMT]=useState(false);
  const[showAddTodo,sSAT]=useState(false);const[defaultPeriod,setDefaultPeriod]=useState("morning");
  const[eTIdx,sETIdx]=useState(null);
  const[openP,sOpenP]=useState({morning:false,afternoon:false,evening:false});

  const handleEditTag=editTag||(()=>{});const handleDeleteTag=deleteTag||(()=>{});

  const now=new Date();
  useEffect(()=>{sYr(now.getFullYear());sMo(now.getMonth()+1);if(!fTag&&tags.length)sFTag(tags[0].id)},[]);

  const todayK=dkFn(now.getFullYear(),now.getMonth()+1,now.getDate());
  const dim=new Date(yr,mo,0).getDate();const fd=new Date(yr,mo-1,1).getDay();
  const entry=sel?data[sel]:null;

  const stats=useMemo(()=>{
    const ents=Object.entries(data);const byM={};const byY={};
    ents.forEach(([k,v])=>{const[y,m]=k.split("-");const ym=`${y}-${m}`;if(!byM[ym])byM[ym]=[];byM[ym].push({date:k,...v});if(!byY[y])byY[y]=[];byY[y].push({date:k,...v})});
    const sum=arr=>{if(!arr.length)return null;
      const withMood=arr.filter(e=>e.mood!=null);const withScore=arr.filter(e=>e.score!=null);
      const avgM=withMood.length?withMood.reduce((s,e)=>s+e.mood,0)/withMood.length:null;
      const avgS=withScore.length?withScore.reduce((s,e)=>s+e.score,0)/withScore.length:null;
      const tT=arr.reduce((s,e)=>s+(e.todos?.length||0),0);const dT=arr.reduce((s,e)=>s+(e.todos?.filter(t=>t.done).length||0),0);
      const compRate=tT?Math.round(dT/tT*100):0;
      const tc={};arr.forEach(e=>e.todos?.forEach(t=>t.tags?.forEach(tid=>{tc[tid]=(tc[tid]||0)+1})));
      const md=[0,0,0,0,0];arr.forEach(e=>{if(e.mood>=1&&e.mood<=5)md[e.mood-1]++});
      const sd=Array(10).fill(0);arr.forEach(e=>{if(e.score>=1&&e.score<=10)sd[e.score-1]++});
      const tt=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,5);
      return{count:arr.length,avgMood:avgM,avgScore:avgS,totalTodos:tT,doneTodos:dT,compRate,moodDist:md,scoreDist:sd,topTags:tt,diaryDays:arr.filter(e=>e.diary?.trim()).length}};
    const ms={};Object.entries(byM).forEach(([k,v])=>{ms[k]=sum(v)});
    const ys={};Object.entries(byY).forEach(([k,v])=>{ys[k]=sum(v)});
    return{ms,ys};
  },[data]);

  const prev=()=>{if(mo===1){sYr(yr-1);sMo(12)}else sMo(mo-1);sSel(null)};
  const next=()=>{if(mo===12){sYr(yr+1);sMo(1)}else sMo(mo+1);sSel(null)};
  const handleAddTodo=(text,tgs,startTime,endTime,duration,period)=>{if(!sel)return;addTodo(sel,text,tgs,startTime,endTime,duration,period)};
  const handleToggle=i=>toggleTodo(sel,i);
  const handleRemove=i=>removeTodo(sel,i);
  const handleSaveTodo=(i,u)=>saveTodo(sel,i,u);
  const getDateTags=dk2=>{const e=data[dk2];if(!e?.todos)return[];const s=new Set();e.todos.forEach(t=>t.tags?.forEach(tid=>s.add(tid)));return[...s].slice(0,3).map(tid=>tags.find(t=>t.id===tid)).filter(Boolean)};
  const todosByPeriod=(p)=>(entry?.todos||[]).map((t,i)=>({...t,_idx:i})).filter(t=>t.period===p);
  const togP=p=>sOpenP(prev=>({...prev,[p]:!prev[p]}));
  const goToDay=(dk)=>{sSel(dk);sView("calendar");sEDiary(false);sOpenP({morning:false,afternoon:false,evening:false})};

  const GL=<style>{`@keyframes fadeUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}*{-webkit-tap-highlight-color:transparent}`}</style>;

  const Nav=({showBack,onBack}={})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",flexWrap:"wrap",gap:8,background:T.bg,borderBottom:`1px solid ${T.divider}`,position:"sticky",top:0,zIndex:10}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {showBack&&<button onClick={onBack} style={{background:T.accentSoft,border:`1px solid ${T.divider}`,color:T.textSec,cursor:"pointer",fontSize:12,fontWeight:500,display:"flex",alignItems:"center",gap:4,borderRadius:20,padding:"5px 14px"}}><span style={{fontSize:14}}>‹</span> 返回</button>}
      {!showBack&&<h1 onClick={()=>{sView("calendar");sSel(null)}} style={{margin:0,fontSize:20,fontWeight:700,color:T.text,cursor:"pointer",letterSpacing:"-0.02em"}}>LifeLog</h1>}
      <div style={{display:"flex",gap:4}}>
        {[{id:"calendar",l:"📅 日历"},{id:"insights",l:"💡 洞见"}].map(v=>
          <button key={v.id} onClick={()=>{sView(v.id);sSel(null)}} style={{background:view===v.id&&!sel?T.text:T.accentSoft,color:view===v.id&&!sel?"#fff":T.textSec,border:view===v.id&&!sel?"none":`1px solid ${T.divider}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:view===v.id&&!sel?600:400}}>{v.l}</button>
        )}
        <button onClick={()=>sSMT(true)} style={{background:T.accentSoft,border:`1px solid ${T.divider}`,color:T.textSec,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:12}}>🏷 标签</button>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      {userEmail&&<span style={{fontSize:11,color:T.textTer,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userEmail}</span>}
      {onSignOut&&<button onClick={onSignOut} style={{background:T.accentSoft,border:`1px solid ${T.divider}`,color:T.textTer,borderRadius:20,padding:"5px 10px",cursor:"pointer",fontSize:11}}>登出</button>}
    </div>
  </div>;

  // ── INSIGHTS
  if(view==="insights"&&!sel){
    const tabs=[{id:"tags",l:"🏷️ 标签"},{id:"mood",l:"😊 心情"},{id:"diary",l:"📓 日记"},{id:"monthly",l:"📊 月"},{id:"yearly",l:"📈 年"}];
    return <div style={{minHeight:"100vh",background:T.bg}}>{GL}
      {showMT&&<ManageTagsModal tags={tags} onClose={()=>sSMT(false)} onAdd={addTag} onEdit={handleEditTag} onDelete={handleDeleteTag}/>}
      <Nav/><div style={{maxWidth:920,margin:"0 auto",padding:"16px 16px 80px"}}>
        <div style={{display:"flex",gap:4,marginBottom:20,overflowX:"auto"}}>
          {tabs.map(t=><button key={t.id} onClick={()=>sIT(t.id)} style={{background:insightTab===t.id?T.text:T.accentSoft,color:insightTab===t.id?"#fff":T.textSec,border:insightTab===t.id?"none":`1px solid ${T.divider}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:insightTab===t.id?600:400,whiteSpace:"nowrap"}}>{t.l}</button>)}
        </div>
        {insightTab==="tags"&&<InsightTags data={data} tags={tags} fTag={fTag} sFTag={sFTag} onClickDay={goToDay}/>}
        {insightTab==="mood"&&<InsightMood data={data} tags={tags} fMood={fMood} sFMood={sFMood} onClickDay={goToDay}/>}
        {insightTab==="diary"&&<InsightDiary data={data} tags={tags} onClickDay={goToDay}/>}
        {insightTab==="monthly"&&<InsightSummary stats={stats} tags={tags} type="monthly" allData={data} onClickDay={goToDay}/>}
        {insightTab==="yearly"&&<InsightSummary stats={stats} tags={tags} type="yearly" allData={data} onClickDay={goToDay}/>}
      </div>
    </div>;
  }

  // ── DAY DETAIL
  if(sel){
    const dayDur=getDayDuration(entry);
    return <div style={{minHeight:"100vh",background:T.bg}}>{GL}
      {showMT&&<ManageTagsModal tags={tags} onClose={()=>sSMT(false)} onAdd={addTag} onEdit={handleEditTag} onDelete={handleDeleteTag}/>}
      {showAddTodo&&<AddTodoModal tags={tags} defaultPeriod={defaultPeriod} onAdd={handleAddTodo} onClose={()=>sSAT(false)}/>}
      {eTIdx!==null&&entry?.todos?.[eTIdx]&&<EditTodoModal todo={entry.todos[eTIdx]} tags={tags} onSave={u=>handleSaveTodo(eTIdx,u)} onClose={()=>sETIdx(null)}/>}
      <Nav showBack onBack={()=>{sSel(null);sEDiary(false);sETIdx(null)}}/>
      <div style={{maxWidth:600,margin:"0 auto",padding:"16px 20px 100px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:8}}>
          <button onClick={()=>{const d=new Date(sel+"T00:00:00");d.setDate(d.getDate()-1);sSel(dkFn(d.getFullYear(),d.getMonth()+1,d.getDate()));sEDiary(false);sOpenP({morning:false,afternoon:false,evening:false})}} style={{width:36,height:36,borderRadius:"50%",background:T.accentSoft,border:`1px solid ${T.divider}`,cursor:"pointer",fontSize:16,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:700,color:T.text}}>{sel}</div>
            <div style={{fontSize:13,color:T.textTer}}>{new Date(sel+"T00:00:00").toLocaleDateString("zh-CN",{weekday:"long"})}{sel===todayK&&<span style={{color:"#2563eb",marginLeft:6}}>· 今天</span>}</div>
          </div>
          <button onClick={()=>{const d=new Date(sel+"T00:00:00");d.setDate(d.getDate()+1);sSel(dkFn(d.getFullYear(),d.getMonth()+1,d.getDate()));sEDiary(false);sOpenP({morning:false,afternoon:false,evening:false})}} style={{width:36,height:36,borderRadius:"50%",background:T.accentSoft,border:`1px solid ${T.divider}`,cursor:"pointer",fontSize:16,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        </div>
        {dayDur>0&&<div style={{textAlign:"center",marginBottom:20}}><span style={{fontSize:13,color:"#059669",background:"#05966910",borderRadius:20,padding:"4px 16px",fontWeight:500}}>⏱ 今日投入 {fmtDur(dayDur)}</span></div>}
        {!dayDur&&<div style={{height:16}}/>}

        {/* Todos */}
        <div style={{marginBottom:28}}>
          <div style={{marginBottom:12}}><span style={{fontSize:16,color:T.text,fontWeight:600}}>✅ 待办事项 {entry?.todos?.length>0&&<span style={{color:T.textTer,fontWeight:400,fontSize:14}}>{entry.todos.filter(t=>t.done).length}/{entry.todos.length}</span>}</span></div>
          {PERIODS.map(pd=>{
            const items=todosByPeriod(pd.id);const isOpen=openP[pd.id];
            return <div key={pd.id} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",cursor:"pointer"}} onClick={()=>togP(pd.id)}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:T.textTer,transition:"transform .2s",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                  <span style={{fontSize:16,color:T.text,fontWeight:600}}>{pd.label}</span>
                  <span style={{fontSize:13,color:T.textTer}}>{items.length}</span>
                </div>
                <button onClick={e=>{e.stopPropagation();sSAT(true);setDefaultPeriod(pd.id)}} style={{background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
              {isOpen&&items.length>0&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
                {items.map(todo=><div key={todo.id||todo._idx} style={{background:T.accentSoft,borderRadius:T.radius,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <button onClick={()=>handleToggle(todo._idx)} style={{width:22,height:22,borderRadius:7,border:todo.done?"none":`1.5px solid ${T.textTer}`,background:todo.done?T.text:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,flexShrink:0}}>{todo.done&&"✓"}</button>
                    <span style={{flex:1,fontSize:15,color:todo.done?T.textTer:T.text,textDecoration:todo.done?"line-through":"none"}}>{todo.text}</span>
                    {todo.startTime&&todo.endTime&&<span style={{fontSize:11,color:"#059669",background:"#05966910",borderRadius:6,padding:"2px 8px",fontWeight:500}}>{todo.startTime}-{todo.endTime} {fmtDur(todo.duration)}</span>}
                    <button onClick={()=>sETIdx(todo._idx)} style={{background:"none",border:"none",color:T.textTer,cursor:"pointer",fontSize:13}}>✏️</button>
                    <button onClick={()=>handleRemove(todo._idx)} style={{background:"none",border:"none",color:T.textTer,cursor:"pointer",fontSize:16}}>×</button>
                  </div>
                  {todo.tags?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8,marginLeft:34}}>{todo.tags.map(tid=>{const tg=tags.find(x=>x.id===tid);return tg?<span key={tid} style={{fontSize:12,background:`${tg.color}15`,color:tg.color,borderRadius:8,padding:"3px 10px",fontWeight:600,border:`1px solid ${tg.color}30`}}>{tg.label}</span>:null})}</div>}
                </div>)}
              </div>}
            </div>
          })}
          {!(entry?.todos?.length)&&<div style={{textAlign:"center",padding:24,color:T.textTer,fontSize:14}}>点击时段旁的 + 创建待办</div>}
        </div>

        {/* Diary */}
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:16,color:T.text,fontWeight:600}}>📓 日记 / 总结</span>
            <button onClick={()=>sEDiary(!eDiary)} style={{background:"none",border:"none",color:"#2563eb",cursor:"pointer",fontSize:13,fontWeight:500}}>{eDiary?"完成":"编辑"}</button>
          </div>
          {eDiary?<textarea value={entry?.diary||""} onChange={e=>updateEntry(sel,{diary:e.target.value})} placeholder="记录今天的总结..." style={{width:"100%",minHeight:120,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radius,padding:14,color:T.text,fontSize:15,lineHeight:1.8,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          :<div onClick={()=>sEDiary(true)} style={{background:T.accentSoft,borderRadius:T.radius,padding:16,minHeight:60,cursor:"pointer",fontSize:15,lineHeight:1.8,color:entry?.diary?T.textSec:T.textTer,whiteSpace:"pre-wrap"}}>{entry?.diary||"点击写日记..."}</div>}
        </div>

        {/* Mood - click to toggle, no default */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:14,color:T.textTer,marginBottom:10,fontWeight:500}}>今日心情</div>
          <div style={{display:"flex",gap:8}}>{MOODS.map(m=><button key={m.val} onClick={()=>updateEntry(sel,{mood:entry?.mood===m.val?null:m.val})} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,
            background:entry?.mood===m.val?T.card:T.accentSoft,border:entry?.mood===m.val?`2px solid ${m.color}`:`1px solid ${T.divider}`,
            borderRadius:T.radius,padding:"14px 4px",cursor:"pointer",boxShadow:entry?.mood===m.val?T.shadowMd:"none",
          }}><span style={{fontSize:26}}>{m.emoji}</span><span style={{fontSize:12,color:entry?.mood===m.val?m.color:T.textTer,fontWeight:500}}>{m.label}</span></button>)}</div>
        </div>

        {/* Score - no default */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:14,color:T.textTer,fontWeight:500}}>今日评分</span>
            <span style={{fontSize:24,fontWeight:700,color:entry?.score?T.text:T.textTer}}>{entry?.score||"—"}<span style={{fontSize:14,color:T.textTer,fontWeight:400}}>/10</span></span>
          </div>
          <input type="range" min="1" max="10" value={entry?.score||5} onChange={e=>updateEntry(sel,{score:parseInt(e.target.value)})} style={{width:"100%",accentColor:T.text}}/>
        </div>
      </div>
    </div>;
  }

  // ── CALENDAR
  return <div style={{minHeight:"100vh",background:T.bg}}>{GL}
    {showMT&&<ManageTagsModal tags={tags} onClose={()=>sSMT(false)} onAdd={addTag} onEdit={handleEditTag} onDelete={handleDeleteTag}/>}
    <Nav/><div style={{padding:"8px 12px 80px"}}>
      <div style={{background:T.card,borderRadius:16,padding:"16px 10px",border:`1px solid ${T.cardBorder}`,boxShadow:T.shadow}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"0 8px"}}>
          <button onClick={prev} style={{background:"none",border:"none",color:T.textSec,fontSize:22,cursor:"pointer",padding:"4px 12px"}}>‹</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:600,color:T.text}}>{yr} {MO[mo-1]}</h2>
          <button onClick={next} style={{background:"none",border:"none",color:T.textSec,fontSize:22,cursor:"pointer",padding:"4px 12px"}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4,padding:"0 4px"}}>
          {WK.map(d=><div key={d} style={{textAlign:"center",fontSize:12,color:T.textTer,padding:4,fontWeight:500}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,padding:"0 4px"}}>
          {Array(fd).fill(0).map((_,i)=><div key={`b${i}`}/>)}
          {Array.from({length:dim},(_,i)=>i+1).map(d=>{
            const dK=dkFn(yr,mo,d);const isT=dK===todayK;const has=!!data[dK];
            const mE=has&&data[dK].mood?MOODS.find(m=>m.val===data[dK].mood)?.emoji:null;
            const dateTags=getDateTags(dK);
            return <button key={d} onClick={()=>goToDay(dK)} style={{
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",
              paddingTop:6,gap:2,minHeight:56,
              background:has?T.accentSoft:"transparent",
              border:isT?`2px solid ${T.text}`:"1.5px solid transparent",
              borderRadius:10,cursor:"pointer",color:has?T.text:T.textTer,
              fontSize:14,fontWeight:isT?700:has?500:400,transition:"all .15s",
            }}>
              <span>{d}</span>
              {mE&&<span style={{fontSize:11,lineHeight:1}}>{mE}</span>}
              {dateTags.length>0&&<div style={{display:"flex",gap:2,marginTop:1}}>
                {dateTags.map((tg,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:tg.color}}/>)}
              </div>}
            </button>
          })}
        </div>
      </div>

      {/* Sticky Notes */}
      <div style={{marginTop:16}}>
        {(stickyNotes||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:12}}>
          {(stickyNotes||[]).map(n=><StickyNote key={n.id} note={n} onUpdate={updateStickyNote} onDelete={deleteStickyNote}/>)}
        </div>}
        <button onClick={()=>{
          const color=STICKY_COLORS[(stickyNotes||[]).length%STICKY_COLORS.length];
          addStickyNote({id:"sn_"+Date.now(),text:"",color});
        }} style={{
          width:"100%",padding:"14px 0",background:"#ffffff",border:"2px dashed #e7e5e4",
          borderRadius:12,cursor:"pointer",fontSize:14,color:"#a8a29e",fontWeight:500,
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        }}>+ 便利贴</button>
      </div>
    </div>
  </div>;
}
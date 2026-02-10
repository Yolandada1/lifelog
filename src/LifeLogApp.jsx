import { useState, useEffect, useRef, useMemo } from "react";

const EMOJIS={
  "常用":["📌","🔖","⭐","🎯","📎","🔔","💡","🚀","❤️","✅","🔥","💎","🎉","👍","💬","📝"],
  "表情":["😀","😂","🥰","😎","🤔","😴","🤩","🥳","😇","🤗","😤","🫡","🧐","🤓","😈","👻"],
  "动物":["🐱","🐶","🐼","🦊","🐸","🐵","🦁","🐯","🐰","🐻","🐨","🐮","🐷","🐔","🐙","🦋"],
  "食物":["🍔","🍕","🍜","🍣","🍩","🍰","🧁","☕","🍷","🥗","🍎","🍓","🥑","🌮","🍦","🧋"],
  "运动":["⚽","🏀","🎾","🏋️","🧘","🚴","🏃","🏊","⛷️","🥊","🎯","🏌️","🤸","🧗","🏄","🛹"],
  "旅行":["✈️","🚗","🚀","🏖️","⛰️","🗼","🏕️","🎡","🚢","🗺️","🧳","🌍","🏝️","🚂","🌅","🏔️"],
  "物品":["💼","📚","💰","🏠","🎨","🎵","📷","💻","🎮","📱","🔧","🎁","💊","🛒","📦","🧪"],
  "自然":["🌸","🌿","🌈","🌙","☀️","❄️","🌊","🍂","🌻","🌴","🍀","💐","🌺","🌵","🪴","✨"],
};
const TAG_COLORS=["#2563eb","#7c3aed","#059669","#d97706","#db2777","#6366f1","#0d9488","#ea580c","#dc2626","#65a30d","#0891b2","#9333ea"];

// Mood: 右到左降序，右边最积极（拇指区），默认为"开心"(val=4)
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

/* ═══ Small Components ═══ */
function Toast({msg,onClose}){
  return <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:T.text,color:"#fff",borderRadius:T.radius,padding:"12px 20px",boxShadow:T.shadowMd,display:"flex",alignItems:"center",gap:10,fontSize:13,maxWidth:"90vw",animation:"slideDown .3s ease-out"}}>
    <span style={{fontSize:18}}>🔔</span><span style={{flex:1}}>{msg}</span><button onClick={onClose} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:14,opacity:.6}}>×</button>
  </div>;
}

function Modal({children,onClose}){
  return <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.3)",backdropFilter:"blur(8px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>{children}</div>;
}

function NewTagModal({onClose,onCreate}){
  const[l,sL]=useState("");const[c,sC]=useState(TAG_COLORS[0]);const[ic,sI]=useState("📌");const[cat,sCat]=useState("常用");
  return <Modal onClose={onClose}><div style={{background:T.card,borderRadius:16,padding:28,width:"min(380px,calc(100vw - 32px))",border:`1px solid ${T.cardBorder}`,boxShadow:T.shadowMd,maxHeight:"82vh",overflowY:"auto"}}>
    <h3 style={{margin:"0 0 18px",fontSize:16,color:T.text,fontWeight:600}}>新建标签</h3>
    <input value={l} onChange={e=>sL(e.target.value)} placeholder="标签名称" style={{width:"100%",background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,padding:"8px 14px",background:T.accentSoft,borderRadius:T.radiusSm}}>
      <span style={{fontSize:20}}>{ic}</span><span style={{fontSize:14,color:c,fontWeight:500}}>{l||"预览"}</span>
    </div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>图标</div>
    <div style={{display:"flex",gap:0,marginBottom:8,overflowX:"auto",background:T.accentSoft,borderRadius:T.radiusSm}}>
      {Object.keys(EMOJIS).map(ct=><button key={ct} onClick={()=>sCat(ct)} style={{background:cat===ct?"#fff":"transparent",color:cat===ct?T.text:T.textTer,border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,whiteSpace:"nowrap",fontWeight:cat===ct?600:400,boxShadow:cat===ct?T.shadow:"none"}}>{ct}</button>)}
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:14,maxHeight:130,overflowY:"auto",padding:4}}>
      {(EMOJIS[cat]||[]).map((em,i)=><button key={em+i} onClick={()=>sI(em)} style={{width:36,height:36,borderRadius:T.radiusSm,border:ic===em?`2px solid ${T.text}`:"2px solid transparent",background:ic===em?T.accentSoft:"transparent",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>{em}</button>)}
    </div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>颜色</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>
      {TAG_COLORS.map(cl=><button key={cl} onClick={()=>sC(cl)} style={{width:28,height:28,borderRadius:"50%",border:c===cl?"2.5px solid "+T.text:"2px solid "+T.divider,background:cl,cursor:"pointer"}}/>)}
    </div>
    <div style={{display:"flex",gap:10}}>
      <button onClick={onClose} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 0",color:T.textSec,cursor:"pointer",fontSize:13}}>取消</button>
      <button onClick={()=>{if(l.trim()){onCreate({id:"t_"+Date.now(),label:l.trim(),color:c,icon:ic});onClose()}}} style={{flex:1,background:T.text,border:"none",borderRadius:T.radiusSm,padding:"10px 0",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>创建</button>
    </div>
  </div></Modal>;
}

/* ═══ Add Todo Modal - 添加时就可以选标签/提醒/时段 ═══ */
function AddTodoModal({tags,defaultPeriod,onAdd,onClose}){
  const[t,sT]=useState("");const[st,sST]=useState([]);const[r,sR]=useState("");const[p,sP]=useState(defaultPeriod||"morning");
  const tog=id=>sST(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  return <Modal onClose={onClose}><div style={{background:T.card,borderRadius:16,padding:28,width:"min(380px,calc(100vw - 32px))",border:`1px solid ${T.cardBorder}`,boxShadow:T.shadowMd,maxHeight:"85vh",overflowY:"auto"}}>
    <h3 style={{margin:"0 0 16px",fontSize:16,color:T.text,fontWeight:600}}>添加待办</h3>
    <input value={t} onChange={e=>sT(e.target.value)} placeholder="待办内容" autoFocus style={{width:"100%",background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>时段</div>
    <div style={{display:"flex",gap:6,marginBottom:14}}>
      {PERIODS.map(pd=><button key={pd.id} onClick={()=>sP(pd.id)} style={{flex:1,background:p===pd.id?T.card:T.accentSoft,border:p===pd.id?`2px solid ${T.text}`:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"8px 4px",cursor:"pointer",fontSize:12,fontWeight:p===pd.id?600:400,color:p===pd.id?T.text:T.textSec,boxShadow:p===pd.id?T.shadow:"none"}}>{pd.label}</button>)}
    </div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>关联标签</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
      {tags.map(tg=><button key={tg.id} onClick={()=>tog(tg.id)} style={{background:st.includes(tg.id)?`${tg.color}12`:T.accentSoft,color:st.includes(tg.id)?tg.color:T.textTer,border:st.includes(tg.id)?`1.5px solid ${tg.color}40`:`1px solid ${T.divider}`,borderRadius:16,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:st.includes(tg.id)?500:400}}>{tg.icon} {tg.label}</button>)}
    </div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>⏰ 提醒时间（可选）</div>
    <input type="time" value={r} onChange={e=>sR(e.target.value)} style={{width:"100%",background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",marginBottom:18,boxSizing:"border-box"}}/>
    <div style={{display:"flex",gap:10}}>
      <button onClick={onClose} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 0",color:T.textSec,cursor:"pointer",fontSize:13}}>取消</button>
      <button onClick={()=>{if(t.trim()){onAdd(t.trim(),st,r||null,p);onClose()}}} style={{flex:1,background:T.text,border:"none",borderRadius:T.radiusSm,padding:"10px 0",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>添加</button>
    </div>
  </div></Modal>;
}

function EditTodoModal({todo,tags,onSave,onClose}){
  const[t,sT]=useState(todo.text);const[st,sST]=useState(todo.tags||[]);const[r,sR]=useState(todo.reminder||"");const[p,sP]=useState(todo.period||"morning");
  const tog=id=>sST(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  return <Modal onClose={onClose}><div style={{background:T.card,borderRadius:16,padding:28,width:"min(380px,calc(100vw - 32px))",border:`1px solid ${T.cardBorder}`,boxShadow:T.shadowMd}}>
    <h3 style={{margin:"0 0 16px",fontSize:16,color:T.text,fontWeight:600}}>编辑待办</h3>
    <input value={t} onChange={e=>sT(e.target.value)} style={{width:"100%",background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>时段</div>
    <div style={{display:"flex",gap:6,marginBottom:14}}>
      {PERIODS.map(pd=><button key={pd.id} onClick={()=>sP(pd.id)} style={{flex:1,background:p===pd.id?T.card:T.accentSoft,border:p===pd.id?`2px solid ${T.text}`:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"8px 4px",cursor:"pointer",fontSize:12,fontWeight:p===pd.id?600:400,color:p===pd.id?T.text:T.textSec,boxShadow:p===pd.id?T.shadow:"none"}}>{pd.label}</button>)}
    </div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>关联标签</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
      {tags.map(tg=><button key={tg.id} onClick={()=>tog(tg.id)} style={{background:st.includes(tg.id)?`${tg.color}12`:T.accentSoft,color:st.includes(tg.id)?tg.color:T.textTer,border:st.includes(tg.id)?`1.5px solid ${tg.color}40`:`1px solid ${T.divider}`,borderRadius:16,padding:"5px 12px",cursor:"pointer",fontSize:12}}>{tg.icon} {tg.label}</button>)}
    </div>
    <div style={{fontSize:12,color:T.textSec,marginBottom:6}}>⏰ 提醒时间</div>
    <input type="time" value={r} onChange={e=>sR(e.target.value)} style={{width:"100%",background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",marginBottom:18,boxSizing:"border-box"}}/>
    <div style={{display:"flex",gap:10}}>
      <button onClick={onClose} style={{flex:1,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:T.radiusSm,padding:"10px 0",color:T.textSec,cursor:"pointer",fontSize:13}}>取消</button>
      <button onClick={()=>{onSave({...todo,text:t.trim()||todo.text,tags:st,reminder:r||null,period:p});onClose()}} style={{flex:1,background:T.text,border:"none",borderRadius:T.radiusSm,padding:"10px 0",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>保存</button>
    </div>
  </div></Modal>;
}

function MiniBar({vals,colors,labels,h=70}){
  const mx=Math.max(...vals,1);
  return <div style={{display:"flex",alignItems:"flex-end",gap:6,height:h}}>
    {vals.map((v,i)=><div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1}}>
      {v>0&&<span style={{fontSize:10,color:T.textSec,fontWeight:500}}>{v}</span>}
      <div style={{width:"100%",maxWidth:28,height:Math.max((v/mx)*h*.65,2),background:colors?.[i]||T.text,borderRadius:4}}/>
      {labels&&<span style={{fontSize:9,color:T.textTer}}>{labels[i]}</span>}
    </div>)}
  </div>;
}
function SC({title,children}){
  return <div style={{background:T.card,borderRadius:T.radius,padding:16,border:`1px solid ${T.cardBorder}`,boxShadow:T.shadow}}>
    <div style={{fontSize:12,color:T.textTer,marginBottom:8,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.03em"}}>{title}</div>{children}
  </div>;
}

/* ═══ Insights Sub Views ═══ */
function InsightTags({data,tags,fTag,sFTag}){
  const ents=Object.entries(data).filter(([_,v])=>v.todos?.some(t=>t.tags?.includes(fTag))).sort(([a],[b])=>b.localeCompare(a));
  const tO=tags.find(t=>t.id===fTag);
  return <>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>{tags.map(t=><button key={t.id} onClick={()=>sFTag(t.id)} style={{background:fTag===t.id?`${t.color}10`:T.accentSoft,color:fTag===t.id?t.color:T.textSec,border:fTag===t.id?`1.5px solid ${t.color}40`:`1px solid ${T.divider}`,borderRadius:20,padding:"6px 16px",cursor:"pointer",fontSize:12,fontWeight:fTag===t.id?600:400}}>{t.icon} {t.label}</button>)}</div>
    {!ents.length?<div style={{textAlign:"center",padding:40,color:T.textTer}}>暂无「{tO?.label}」记录</div>:<div style={{display:"flex",flexDirection:"column",gap:12}}>{ents.map(([d,e])=><EntryCard key={d} dk={d} e={e} hl={tO?.color} tags={tags}/>)}</div>}
  </>;
}
function InsightMood({data,tags,fMood,sFMood}){
  const ents=Object.entries(data).filter(([_,v])=>v.mood===fMood).sort(([a],[b])=>b.localeCompare(a));const mO=MOODS.find(m=>m.val===fMood);
  return <>
    <div style={{display:"flex",gap:8,marginBottom:20}}>{MOODS.map(m=><button key={m.val} onClick={()=>sFMood(m.val)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:fMood===m.val?T.card:T.accentSoft,border:fMood===m.val?`2px solid ${m.color}`:`1px solid ${T.divider}`,borderRadius:T.radius,padding:"12px 4px",cursor:"pointer",boxShadow:fMood===m.val?T.shadowMd:"none"}}>
      <span style={{fontSize:24}}>{m.emoji}</span><span style={{fontSize:10,color:fMood===m.val?m.color:T.textTer,fontWeight:500}}>{m.label}</span>
      <span style={{fontSize:16,fontWeight:700,color:fMood===m.val?T.text:T.textTer}}>{Object.values(data).filter(v=>v.mood===m.val).length}</span>
    </button>)}</div>
    {!ents.length?<div style={{textAlign:"center",padding:40,color:T.textTer}}>暂无「{mO?.label}」记录</div>:<div style={{display:"flex",flexDirection:"column",gap:12}}>{ents.map(([d,e])=><EntryCard key={d} dk={d} e={e} hl={mO?.color} tags={tags}/>)}</div>}
  </>;
}
function InsightDiary({data,tags}){
  const ents=Object.entries(data).filter(([_,v])=>v.diary?.trim()).sort(([a],[b])=>b.localeCompare(a));
  return !ents.length?<div style={{textAlign:"center",padding:40,color:T.textTer}}>暂无日记</div>:<div style={{display:"flex",flexDirection:"column",gap:12}}>{ents.map(([d,e])=><EntryCard key={d} dk={d} e={e} tags={tags}/>)}</div>;
}
function InsightSummary({stats,tags,type}){
  const keys=Object.keys(type==="monthly"?stats.ms:stats.ys).sort().reverse();
  const[sel,sSel]=useState(keys[0]||"");
  const sm=(type==="monthly"?stats.ms:stats.ys)[sel];
  const label=k=>{
    if(type==="yearly")return k+"年";
    if(type==="weekly"){const parts=k.split("-");return parts[1]+"月"+parts[2]}
    const[y,m]=k.split("-");return y+"年"+MO[parseInt(m)-1]
  };
  return <>
    <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap",overflowX:"auto"}}>{keys.map(k=><button key={k} onClick={()=>sSel(k)} style={{background:sel===k?T.text:T.accentSoft,color:sel===k?"#fff":T.textSec,border:sel===k?"none":`1px solid ${T.divider}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:sel===k?600:400,whiteSpace:"nowrap"}}>{label(k)}</button>)}</div>
    {!sm?<div style={{textAlign:"center",padding:40,color:T.textTer}}>暂无数据</div>:<SummaryCards sm={sm} tags={tags}/>}
  </>;
}
function SummaryCards({sm,tags}){
  const cr=sm.totalTodos?Math.round(sm.doneTodos/sm.totalTodos*100):0;
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
      <SC title="记录天数"><div style={{fontSize:26,fontWeight:700,color:T.text}}>{sm.count}<span style={{fontSize:13,color:T.textTer,fontWeight:400}}> 天</span></div></SC>
      <SC title="平均心情"><div style={{fontSize:26,fontWeight:700,color:T.text}}>{sm.avgMood.toFixed(1)}<span style={{fontSize:16,marginLeft:4}}>{MOODS.find(m=>m.val===Math.round(sm.avgMood))?.emoji}</span></div></SC>
      <SC title="平均评分"><div style={{fontSize:26,fontWeight:700,color:T.text}}>{sm.avgScore.toFixed(1)}<span style={{fontSize:13,color:T.textTer,fontWeight:400}}>/10</span></div></SC>
      <SC title="完成率"><div style={{fontSize:26,fontWeight:700,color:cr>=70?"#059669":cr>=40?"#d97706":"#dc2626"}}>{cr}%</div><div style={{fontSize:11,color:T.textTer}}>{sm.doneTodos}/{sm.totalTodos}</div></SC>
      <SC title="日记天数"><div style={{fontSize:26,fontWeight:700,color:T.text}}>{sm.diaryDays}</div></SC>
    </div>
    <SC title="心情分布"><MiniBar vals={sm.moodDist} colors={MOODS.map(m=>m.color)} labels={MOODS.map(m=>m.emoji)}/></SC>
    <SC title="评分分布"><MiniBar vals={sm.scoreDist} colors={sm.scoreDist.map((_,i)=>i<3?"#dc2626":i<6?"#d97706":"#059669")} labels={[...Array(10)].map((_,i)=>`${i+1}`)}/></SC>
    {sm.topTags.length>0&&<SC title="高频标签"><div style={{display:"flex",flexDirection:"column",gap:8}}>{sm.topTags.map(([tid,cnt],i)=>{const tg=tags.find(t=>t.id===tid);const mx=sm.topTags[0][1];return tg?<div key={tid} style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:12,color:T.textTer,width:16}}>#{i+1}</span><span style={{fontSize:14}}>{tg.icon}</span><span style={{fontSize:12,color:T.text,width:44,fontWeight:500}}>{tg.label}</span>
      <div style={{flex:1,height:6,background:T.accentSoft,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(cnt/mx)*100}%`,background:tg.color,borderRadius:3}}/></div>
      <span style={{fontSize:11,color:T.textSec,width:20,textAlign:"right"}}>{cnt}</span>
    </div>:null})}</div></SC>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {sm.bestDay&&<SC title="🌟 最佳一天"><div style={{fontSize:13,fontWeight:600,color:"#059669"}}>{sm.bestDay.date}</div><div style={{fontSize:11,color:T.textSec,marginTop:3}}>{sm.bestDay.score}/10 {MOODS.find(m=>m.val===sm.bestDay.mood)?.emoji}</div></SC>}
      {sm.worstDay&&<SC title="💪 需加油"><div style={{fontSize:13,fontWeight:600,color:"#d97706"}}>{sm.worstDay.date}</div><div style={{fontSize:11,color:T.textSec,marginTop:3}}>{sm.worstDay.score}/10 {MOODS.find(m=>m.val===sm.worstDay.mood)?.emoji}</div></SC>}
    </div>
  </div>;
}

function EntryCard({dk:dateKey,e,hl,tags:tgs=[]}){
  const et=e.todos?[...new Set(e.todos.flatMap(t=>t.tags||[]))]:[];
  return <div style={{background:T.card,borderRadius:T.radius,padding:18,border:`1px solid ${T.cardBorder}`,boxShadow:T.shadow,borderLeft:hl?`3px solid ${hl}`:"none"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <span style={{fontSize:14,fontWeight:600,color:T.text}}>{dateKey} <span style={{fontWeight:400,fontSize:12,color:T.textTer}}>{new Date(dateKey+"T00:00:00").toLocaleDateString("zh-CN",{weekday:"short"})}</span></span>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {MOODS.find(m=>m.val===e.mood)&&<span style={{fontSize:16}}>{MOODS.find(m=>m.val===e.mood).emoji}</span>}
        <span style={{background:T.accentSoft,borderRadius:6,padding:"2px 8px",fontSize:12,color:T.textSec,fontWeight:500}}>{e.score}/10</span>
      </div>
    </div>
    {e.diary&&<div style={{margin:"4px 0 10px",fontSize:13,lineHeight:1.7,color:T.textSec,whiteSpace:"pre-wrap"}}>{e.diary}</div>}
    {e.todos?.length>0&&<div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>
      {e.todos.map((t,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:t.done?T.textTer:T.text}}>
        <span>{t.done?"✅":"⬜"}</span><span style={{textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
      </div>)}
    </div>}
    {et.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
      {et.map(tid=>{const tg=tgs.find(x=>x.id===tid);return tg?<span key={tid} style={{fontSize:10,background:`${tg.color}10`,color:tg.color,borderRadius:6,padding:"2px 8px",fontWeight:500}}>{tg.icon} {tg.label}</span>:null})}
    </div>}
  </div>;
}

/* ═══════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════ */
export default function LifeLogApp({data,tags,updateEntry,addTodo,toggleTodo,removeTodo,saveTodo,addTag,onSignOut,userEmail}){
  const[yr,sYr]=useState(2026);const[mo,sMo]=useState(2);
  const[sel,sSel]=useState(null);
  const[view,sView]=useState("calendar"); // calendar | insights
  const[insightTab,sIT]=useState("tags"); // tags|mood|diary|weekly|monthly|yearly
  const[fTag,sFTag]=useState(null);const[fMood,sFMood]=useState(4);
  const[eDiary,sEDiary]=useState(false);const[eNote,sENote]=useState(false);
  const[showNT,sSNT]=useState(false);const[showAddTodo,sSAT]=useState(false);const[defaultPeriod,setDefaultPeriod]=useState("morning");
  const[eTIdx,sETIdx]=useState(null);
  const[toasts,sToasts]=useState([]);
  const fired=useRef(new Set());

  const now=new Date();
  useEffect(()=>{sYr(now.getFullYear());sMo(now.getMonth()+1);if(!fTag&&tags.length)sFTag(tags[0].id)},[]);

  const todayK=dkFn(now.getFullYear(),now.getMonth()+1,now.getDate());
  const dim=new Date(yr,mo,0).getDate();const fd=new Date(yr,mo-1,1).getDay();
  const entry=sel?data[sel]:null;

  const stats=useMemo(()=>{
    const ents=Object.entries(data);const byM={};const byY={};const byW={};
    ents.forEach(([k,v])=>{const[y,m]=k.split("-");const ym=`${y}-${m}`;if(!byM[ym])byM[ym]=[];byM[ym].push({date:k,...v});if(!byY[y])byY[y]=[];byY[y].push({date:k,...v});
      const d=new Date(k+"T00:00:00");const wk=getWeekKey(d);if(!byW[wk])byW[wk]=[];byW[wk].push({date:k,...v})});
    const sum=arr=>{if(!arr.length)return null;
      const avgM=arr.reduce((s,e)=>s+(e.mood||0),0)/arr.length;const avgS=arr.reduce((s,e)=>s+(e.score||0),0)/arr.length;
      const tT=arr.reduce((s,e)=>s+(e.todos?.length||0),0);const dT=arr.reduce((s,e)=>s+(e.todos?.filter(t=>t.done).length||0),0);
      const tc={};arr.forEach(e=>e.todos?.forEach(t=>t.tags?.forEach(tid=>{tc[tid]=(tc[tid]||0)+1})));
      const md=[0,0,0,0,0];arr.forEach(e=>{if(e.mood>=1&&e.mood<=5)md[e.mood-1]++});
      const sd=Array(10).fill(0);arr.forEach(e=>{if(e.score>=1&&e.score<=10)sd[e.score-1]++});
      const tt=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,5);
      const best=arr.reduce((b,e)=>(!b||(e.score||0)>(b.score||0))?e:b,null);
      const worst=arr.reduce((w,e)=>(!w||(e.score||0)<(w.score||0))?e:w,null);
      return{count:arr.length,avgMood:avgM,avgScore:avgS,totalTodos:tT,doneTodos:dT,moodDist:md,scoreDist:sd,topTags:tt,bestDay:best,worstDay:worst,diaryDays:arr.filter(e=>e.diary?.trim()).length}};
    const ms={};Object.entries(byM).forEach(([k,v])=>{ms[k]=sum(v)});
    const ys={};Object.entries(byY).forEach(([k,v])=>{ys[k]=sum(v)});
    const ws={};Object.entries(byW).forEach(([k,v])=>{ws[k]=sum(v)});
    return{ms,ys,ws};
  },[data]);

  // Reminder checker
  useEffect(()=>{
    const iv=setInterval(()=>{const n=new Date();const nk=dkFn(n.getFullYear(),n.getMonth()+1,n.getDate());
      const hm=`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;
      data[nk]?.todos?.forEach((t,i)=>{if(t.reminder&&t.reminder===hm&&!t.done){const uid=`${nk}-${i}-${t.reminder}`;
        if(!fired.current.has(uid)){fired.current.add(uid);sToasts(p=>[...p,{id:Date.now(),msg:t.text,todoKey:nk,todoIdx:i}])}}})},10000);
    return()=>clearInterval(iv);
  },[data]);

  const prev=()=>{if(mo===1){sYr(yr-1);sMo(12)}else sMo(mo-1);sSel(null)};
  const next=()=>{if(mo===12){sYr(yr+1);sMo(1)}else sMo(mo+1);sSel(null)};
  const handleAddTodo=(text,tgs,reminder,period)=>{if(!sel)return;addTodo(sel,text,tgs,reminder,period)};
  const handleToggle=i=>{toggleTodo(sel,i);sToasts(p=>p.filter(t=>!(t.todoKey===sel&&t.todoIdx===i)))};
  const handleRemove=i=>removeTodo(sel,i);
  const handleSaveTodo=(i,u)=>saveTodo(sel,i,u);
  const getDots=dk2=>{const e=data[dk2];return e?.mood?MOODS.find(m=>m.val===e.mood)?.emoji:null};
  const dismissToast=id=>sToasts(p=>p.filter(x=>x.id!==id));

  const GL=<><style>{`@keyframes slideDown{from{transform:translate(-50%,-40px);opacity:0}to{transform:translate(-50%,0);opacity:1}}*{-webkit-tap-highlight-color:transparent}`}</style>{toasts.map(t=><Toast key={t.id} msg={`⏰ ${t.msg}`} onClose={()=>dismissToast(t.id)}/>)}</>;
  const wrap={maxWidth:920,margin:"0 auto",padding:"16px 16px 80px"};

  // ── NAV: 日历 | 洞见 | +标签 | 账号+登出
  const Nav=()=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <h1 onClick={()=>{sView("calendar");sSel(null)}} style={{margin:0,fontSize:22,fontWeight:700,color:T.text,cursor:"pointer",letterSpacing:"-0.02em"}}>LifeLog</h1>
      <div style={{display:"flex",gap:4}}>
        {[{id:"calendar",l:"📅 日历"},{id:"insights",l:"💡 洞见"}].map(v=>
          <button key={v.id} onClick={()=>sView(v.id)} style={{background:view===v.id?T.text:T.accentSoft,color:view===v.id?"#fff":T.textSec,border:view===v.id?"none":`1px solid ${T.divider}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:view===v.id?600:400}}>{v.l}</button>
        )}
        <button onClick={()=>sSNT(true)} style={{background:T.accentSoft,border:`1px solid ${T.divider}`,color:T.textSec,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:12}}>+ 标签</button>
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      {userEmail&&<span style={{fontSize:11,color:T.textTer,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userEmail}</span>}
      {onSignOut&&<button onClick={onSignOut} style={{background:T.accentSoft,border:`1px solid ${T.divider}`,color:T.textTer,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:12}}>登出</button>}
    </div>
  </div>;

  // ── INSIGHTS VIEW
  if(view==="insights"){
    const tabs=[{id:"tags",l:"🏷️ 标签"},{id:"mood",l:"😊 心情"},{id:"diary",l:"📓 日记"},{id:"weekly",l:"📅 周"},{id:"monthly",l:"📊 月"},{id:"yearly",l:"📈 年"}];
    return <div style={{minHeight:"100vh",background:T.bg}}>{GL}
      {showNT&&<NewTagModal onClose={()=>sSNT(false)} onCreate={t=>addTag(t)}/>}
      <div style={wrap}><Nav/>
        <div style={{display:"flex",gap:4,marginBottom:20,overflowX:"auto"}}>
          {tabs.map(t=><button key={t.id} onClick={()=>sIT(t.id)} style={{background:insightTab===t.id?T.text:T.accentSoft,color:insightTab===t.id?"#fff":T.textSec,border:insightTab===t.id?"none":`1px solid ${T.divider}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:insightTab===t.id?600:400,whiteSpace:"nowrap"}}>{t.l}</button>)}
        </div>
        {insightTab==="tags"&&<InsightTags data={data} tags={tags} fTag={fTag} sFTag={sFTag}/>}
        {insightTab==="mood"&&<InsightMood data={data} tags={tags} fMood={fMood} sFMood={sFMood}/>}
        {insightTab==="diary"&&<InsightDiary data={data} tags={tags}/>}
        {insightTab==="weekly"&&<InsightSummary stats={stats} tags={tags} type="weekly"/>}
        {insightTab==="monthly"&&<InsightSummary stats={stats} tags={tags} type="monthly"/>}
        {insightTab==="yearly"&&<InsightSummary stats={stats} tags={tags} type="yearly"/>}
      </div>
    </div>;
  }

  // ── CALENDAR VIEW
  const todosByPeriod=(p)=>(entry?.todos||[]).map((t,i)=>({...t,_idx:i})).filter(t=>t.period===p);
  const[openP,sOpenP]=useState({morning:true,afternoon:true,evening:true});
  const togP=p=>sOpenP(prev=>({...prev,[p]:!prev[p]}));

  return <div style={{minHeight:"100vh",background:T.bg}}>{GL}
    {showNT&&<NewTagModal onClose={()=>sSNT(false)} onCreate={t=>addTag(t)}/>}
    {showAddTodo&&<AddTodoModal tags={tags} defaultPeriod={defaultPeriod} onAdd={handleAddTodo} onClose={()=>sSAT(false)}/>}
    {eTIdx!==null&&entry?.todos?.[eTIdx]&&<EditTodoModal todo={entry.todos[eTIdx]} tags={tags} onSave={u=>handleSaveTodo(eTIdx,u)} onClose={()=>sETIdx(null)}/>}
    <div style={wrap}><Nav/>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        {/* Calendar */}
        <div style={{flex:"1 1 340px",minWidth:280}}>
          <div style={{background:T.card,borderRadius:16,padding:20,border:`1px solid ${T.cardBorder}`,boxShadow:T.shadow}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <button onClick={prev} style={{background:"none",border:"none",color:T.textSec,fontSize:18,cursor:"pointer",padding:"4px 10px"}}>‹</button>
              <h2 style={{margin:0,fontSize:17,fontWeight:600,color:T.text}}>{yr} {MO[mo-1]}</h2>
              <button onClick={next} style={{background:"none",border:"none",color:T.textSec,fontSize:18,cursor:"pointer",padding:"4px 10px"}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
              {WK.map(d=><div key={d} style={{textAlign:"center",fontSize:11,color:T.textTer,padding:3,fontWeight:500}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
              {Array(fd).fill(0).map((_,i)=><div key={`b${i}`}/>)}
              {Array.from({length:dim},(_,i)=>i+1).map(d=>{
                const dK=dkFn(yr,mo,d);const isT=dK===todayK;const isS=dK===sel;const has=!!data[dK];
                const mE=getDots(dK);
                return <button key={d} onClick={()=>{sSel(dK);sEDiary(false);sENote(false);sETIdx(null)}} style={{
                  position:"relative",aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
                  background:isS?T.text:has?T.accentSoft:"transparent",
                  border:isT&&!isS?`1.5px solid ${T.text}`:"1.5px solid transparent",
                  borderRadius:10,cursor:"pointer",color:isS?"#fff":has?T.text:T.textTer,
                  fontSize:13,fontWeight:isS||isT?600:400,transition:"all .15s",
                }}><span>{d}</span>{mE&&<span style={{fontSize:9,lineHeight:1}}>{mE}</span>}
                </button>
              })}
            </div>
          </div>
        </div>

        {/* Detail */}
        <div style={{flex:"1 1 400px",minWidth:300}}>
          {!sel?<div style={{background:T.card,borderRadius:16,padding:44,border:`1px solid ${T.cardBorder}`,boxShadow:T.shadow,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:12,opacity:.4}}>📅</div><p style={{color:T.textTer,fontSize:14,margin:0}}>点击日历中的日期</p><p style={{color:T.textTer,fontSize:12,margin:"4px 0 0",opacity:.6}}>开始记录你的一天</p>
          </div>:(
          <div style={{background:T.card,borderRadius:16,padding:22,border:`1px solid ${T.cardBorder}`,boxShadow:T.shadow,maxHeight:"82vh",overflowY:"auto"}}>
            {/* Date header */}
            <div style={{marginBottom:16}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:600,color:T.text}}>{sel}</h3>
              <p style={{margin:"2px 0 0",fontSize:12,color:T.textTer}}>{new Date(sel+"T00:00:00").toLocaleDateString("zh-CN",{weekday:"long"})}{sel===todayK&&<span style={{color:"#2563eb",marginLeft:8,fontWeight:500}}>· 今天</span>}</p>
            </div>

            {/* 📝 随手记 */}
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,color:T.text,fontWeight:500}}>📝 随手记</span>
                <button onClick={()=>sENote(!eNote)} style={{background:"none",border:"none",color:"#2563eb",cursor:"pointer",fontSize:12,fontWeight:500}}>{eNote?"完成":"编辑"}</button>
              </div>
              {eNote?<textarea value={entry?.note||""} onChange={e=>updateEntry(sel,{note:e.target.value})} placeholder="随便写点什么..." style={{width:"100%",minHeight:70,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:10,padding:12,color:T.text,fontSize:13,lineHeight:1.7,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
              :<div onClick={()=>sENote(true)} style={{background:T.accentSoft,borderRadius:10,padding:14,minHeight:40,cursor:"pointer",fontSize:13,lineHeight:1.7,color:entry?.note?T.textSec:T.textTer,whiteSpace:"pre-wrap"}}>{entry?.note||"点击随手记录..."}</div>}
            </div>

            {/* 待办事项 - 按时段分组 */}
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:13,color:T.text,fontWeight:500}}>✅ 待办事项 {entry?.todos?.length>0&&<span style={{color:T.textTer,fontWeight:400}}>{entry.todos.filter(t=>t.done).length}/{entry.todos.length}</span>}</span>
              </div>
              {PERIODS.map(pd=>{
                const items=todosByPeriod(pd.id);
                const isOpen=openP[pd.id];
                return <div key={pd.id} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",cursor:"pointer"}} onClick={()=>togP(pd.id)}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:10,color:T.textTer,transition:"transform .2s",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                      <span style={{fontSize:14,color:T.text,fontWeight:600}}>{pd.label}</span>
                      <span style={{fontSize:12,color:T.textTer}}>{items.length}</span>
                    </div>
                    <button onClick={e=>{e.stopPropagation();sSAT(true);setDefaultPeriod(pd.id)}} style={{background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:14,color:T.textSec,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                  </div>
                  {isOpen&&items.length>0&&<div style={{display:"flex",flexDirection:"column",gap:5,marginLeft:4}}>
                    {items.map(todo=><div key={todo.id||todo._idx} style={{background:T.accentSoft,borderRadius:10,padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <button onClick={()=>handleToggle(todo._idx)} style={{width:20,height:20,borderRadius:6,border:todo.done?"none":`1.5px solid ${T.textTer}`,background:todo.done?T.text:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,flexShrink:0}}>{todo.done&&"✓"}</button>
                        <span style={{flex:1,fontSize:13,color:todo.done?T.textTer:T.text,textDecoration:todo.done?"line-through":"none"}}>{todo.text}</span>
                        {todo.reminder&&<span style={{fontSize:10,color:"#2563eb",background:"#2563eb10",borderRadius:5,padding:"1px 6px",fontWeight:500}}>⏰{todo.reminder}</span>}
                        <button onClick={()=>sETIdx(todo._idx)} style={{background:"none",border:"none",color:T.textTer,cursor:"pointer",fontSize:12}}>✏️</button>
                        <button onClick={()=>handleRemove(todo._idx)} style={{background:"none",border:"none",color:T.textTer,cursor:"pointer",fontSize:14}}>×</button>
                      </div>
                      {todo.tags?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6,marginLeft:30}}>{todo.tags.map(tid=>{const tg=tags.find(x=>x.id===tid);return tg?<span key={tid} style={{fontSize:10,background:`${tg.color}10`,color:tg.color,borderRadius:6,padding:"2px 8px",fontWeight:500}}>{tg.icon} {tg.label}</span>:null})}</div>}
                    </div>)}
                  </div>}
                </div>
              })}
              {!(entry?.todos?.length)&&<div style={{textAlign:"center",padding:20,color:T.textTer,fontSize:13}}>点击时段旁的 + 创建待办</div>}
            </div>

            {/* 📓 日记/总结 */}
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,color:T.text,fontWeight:500}}>📓 日记 / 总结</span>
                <button onClick={()=>sEDiary(!eDiary)} style={{background:"none",border:"none",color:"#2563eb",cursor:"pointer",fontSize:12,fontWeight:500}}>{eDiary?"完成":"编辑"}</button>
              </div>
              {eDiary?<textarea value={entry?.diary||""} onChange={e=>updateEntry(sel,{diary:e.target.value})} placeholder="记录今天的总结..." style={{width:"100%",minHeight:100,background:T.accentSoft,border:`1px solid ${T.divider}`,borderRadius:10,padding:12,color:T.text,fontSize:13,lineHeight:1.8,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
              :<div onClick={()=>sEDiary(true)} style={{background:T.accentSoft,borderRadius:10,padding:14,minHeight:50,cursor:"pointer",fontSize:13,lineHeight:1.8,color:entry?.diary?T.textSec:T.textTer,whiteSpace:"pre-wrap"}}>{entry?.diary||"点击写日记..."}</div>}
            </div>

            {/* 心情 - 右到左降序 */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,color:T.textTer,marginBottom:8,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.03em"}}>今日心情</div>
              <div style={{display:"flex",gap:6}}>{MOODS.map(m=><button key={m.val} onClick={()=>updateEntry(sel,{mood:m.val})} style={{
                flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                background:entry?.mood===m.val?T.card:T.accentSoft,
                border:entry?.mood===m.val?`2px solid ${m.color}`:`1px solid ${T.divider}`,
                borderRadius:10,padding:"10px 3px",cursor:"pointer",boxShadow:entry?.mood===m.val?T.shadowMd:"none",
              }}><span style={{fontSize:20}}>{m.emoji}</span><span style={{fontSize:10,color:entry?.mood===m.val?m.color:T.textTer,fontWeight:500}}>{m.label}</span></button>)}</div>
            </div>

            {/* 评分 */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,color:T.textTer,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.03em"}}>今日评分</span>
                <span style={{fontSize:20,fontWeight:700,color:T.text}}>{entry?.score||6}<span style={{fontSize:13,color:T.textTer,fontWeight:400}}>/10</span></span>
              </div>
              <input type="range" min="1" max="10" value={entry?.score||6} onChange={e=>updateEntry(sel,{score:parseInt(e.target.value)})} style={{width:"100%",accentColor:T.text}}/>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}

function getWeekKey(date){
  const d=new Date(date);
  const onejan=new Date(d.getFullYear(),0,1);
  const weekNum=Math.ceil(((d-onejan)/86400000+onejan.getDay()+1)/7);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-W${String(weekNum).padStart(2,"0")}`;
}
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Sparkles, CheckCircle2, AlertTriangle, Copy, RotateCcw, ShieldCheck, HelpCircle, WandSparkles} from 'lucide-react';
import './styles.css';

const samples = [
  'Users should be able to export reports.',
  'Managers should be able to export the currently filtered Employee Report as Excel, containing up to 10,000 records. If export fails, show an error message and do not create a partial file.',
  'Restricted users should automatically assign a new employee to their company when they only have access to one company.'
];
function App(){
 const [text,setText]=useState(samples[0]); const [result,setResult]=useState(null); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
 const analyze=async()=>{setLoading(true);setError('');try{const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requirement:text})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Request failed');setResult(d);}catch(e){setError(e.message);}finally{setLoading(false)}};
 const copy=()=>result&&navigator.clipboard.writeText(`Improved Requirement\n${result.improvedRequirement}\n\nAcceptance Criteria\n${result.acceptanceCriteria.map((x,i)=>`${i+1}. ${x}`).join('\n')}`);
 return <main><header><div className="brand"><div className="logo"><Sparkles size={22}/></div><div><h1>RequirementReady <span>AI</span></h1><p>Turn vague requirements into development-ready stories.</p></div></div><div className="pill"><ShieldCheck size={16}/> Pre-development quality gate</div></header>
 <section className="hero"><div><div className="eyebrow">AI REQUIREMENTS QUALITY CHECKER</div><h2>Find ambiguity <em>before</em> it becomes rework.</h2><p>Review clarity, missing business rules, testability and the questions your team should answer before development starts.</p></div><div className="metric"><b>1 click</b><span>Requirement → actionable review</span></div></section>
 <section className="workspace"><div className="inputCard"><div className="cardTitle"><span>1</span><div><b>Enter a requirement</b><small>Use sanitized project information for demos.</small></div></div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Example: Users should be able to export reports."/><div className="sampleRow">Examples: {samples.map((s,i)=><button key={i} onClick={()=>{setText(s);setResult(null)}}>{i===0?'Vague':i===1?'Detailed':'Business rule'}</button>)}</div><button className="primary" disabled={loading} onClick={analyze}><WandSparkles size={18}/>{loading?'Reviewing...':'Review Requirement'}</button>{error&&<div className="error">{error}</div>}</div>
 <div className="outputCard">{!result?<div className="empty"><Sparkles size={34}/><h3>Your review appears here</h3><p>Run the checker to reveal missing details, clarification questions and suggested acceptance criteria.</p></div>:<Results r={result} onCopy={copy}/>}</div></section>
 <footer>Designed for rapid requirement refinement • {result?.mode==='ai'?'AI API mode':'Works in demo mode without an API key'}</footer></main>
}
function Results({r,onCopy}){const color=r.score>=80?'green':r.score>=60?'amber':'red';return <div className="results"><div className="scoreTop"><div className={`score ${color}`}><b>{r.score}</b><span>/100</span></div><div><small>READINESS SCORE</small><h3>{r.status}</h3><p>{r.summary}</p></div></div><div className="grid2"><List title="What's already clear" icon={<CheckCircle2/>} items={r.strengths} tone="good"/><List title="Missing information" icon={<AlertTriangle/>} items={r.missingInformation} tone="warn"/></div><List title="Clarification questions" icon={<HelpCircle/>} items={r.clarificationQuestions} numbered/><div className="improved"><div className="sectionHead"><div><Sparkles/> <b>Suggested improved requirement</b></div><button onClick={onCopy}><Copy size={15}/> Copy</button></div><p>{r.improvedRequirement}</p></div><List title="Suggested acceptance criteria" icon={<CheckCircle2/>} items={r.acceptanceCriteria} numbered/><div className="note"><b>Human review required.</b> The score is a readiness aid, not an approval decision.</div></div>}
function List({title,icon,items=[],tone='',numbered=false}){return <section className={`list ${tone}`}><h4>{icon}{title}</h4>{items?.length?<ul>{items.map((x,i)=><li key={i}>{numbered&&<strong>{i+1}</strong>}<span>{x}</span></li>)}</ul>:<p className="muted">No issues identified.</p>}</section>}
createRoot(document.getElementById('root')).render(<App/>);

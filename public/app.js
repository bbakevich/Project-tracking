const key = 'project-tracker-v1';
const $ = id => document.getElementById(id);
let projects = [], selected, filter = 'all';
try {
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(saved) || !saved.every(p => typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.tasks) && p.tasks.every(t => typeof t.id === 'string' && typeof t.name === 'string' && typeof t.done === 'boolean' && typeof t.date === 'string'))) throw Error();
  projects = saved;
} catch { $('notice').textContent = 'Saved data could not be loaded. Download a backup before making changes if you need to preserve the current session.'; }
selected = projects[0]?.id;
function save() { try { localStorage.setItem(key, JSON.stringify(projects)); $('notice').textContent = ''; } catch { $('notice').textContent = 'Your browser could not save these changes. Download a backup before closing this page.'; } render(); }
function el(tag, text, className) { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; }
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function render() {
  const all = projects.flatMap(p => p.tasks);
  $('summary').replaceChildren(...[[projects.length,'Projects'],[all.filter(t=>!t.done).length,'Tasks to do'],[all.filter(t=>!t.done && t.date && t.date<today()).length,'Overdue']].map(([n,label])=>{ const d=el('div'); d.append(el('strong',String(n)),el('span',label)); return d; }));
  $('projects').replaceChildren(...projects.map(p=>{ const b=el('button',p.name); b.setAttribute('aria-current',String(p.id===selected)); b.onclick=()=>{selected=p.id;render();}; return b; }));
  const project = projects.find(p=>p.id===selected);
  $('project-title').textContent = project?.name || 'Your next big thing';
  $('empty').hidden=!!project; $('project-content').hidden=!project; $('delete-project').hidden=!project;
  if (!project) return;
  const tasks=project.tasks.filter(t=>filter==='all'||(filter==='done'?t.done:!t.done));
  $('no-tasks').textContent=tasks.length?'':(filter==='all'?'No tasks yet. Add your first small step above.':'No tasks in this view.');
  $('tasks').replaceChildren(...tasks.map(t=>{
    const li=el('li',null,'task'+(t.done?' done':'')); const check=el('input'); check.type='checkbox';check.checked=t.done;check.id='task-'+t.id;check.onchange=()=>{t.done=check.checked;save();};
    const label=el('label',t.name);label.htmlFor=check.id;li.append(check,label);
    if(t.date){ const overdue=!t.done&&t.date<today();const date=el('span',(overdue?'Overdue · ':'')+new Date(t.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}),'date'+(overdue?' overdue':''));li.append(date); }
    const remove=el('button','×','quiet');remove.setAttribute('aria-label','Delete task '+t.name);remove.onclick=()=>{project.tasks=project.tasks.filter(x=>x.id!==t.id);save();};li.append(remove);return li;
  }));
}
$('project-form').onsubmit=e=>{e.preventDefault();const name=$('project-name').value.trim();if(!name)return;const p={id:crypto.randomUUID(),name,tasks:[]};projects.push(p);selected=p.id;e.target.reset();save();$('task-name').focus();};
$('task-form').onsubmit=e=>{e.preventDefault();const p=projects.find(p=>p.id===selected),name=$('task-name').value.trim();if(!p||!name)return;p.tasks.push({id:crypto.randomUUID(),name,date:$('task-date').value,done:false});e.target.reset();save();$('task-name').focus();};
$('delete-project').onclick=()=>{const p=projects.find(p=>p.id===selected);if(p&&confirm(`Delete “${p.name}” and all its tasks?`)){projects=projects.filter(x=>x.id!==selected);selected=projects[0]?.id;save();}};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(projects,null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='project-tracker-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
render();

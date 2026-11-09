const key = 'project-tracker-v1';
const $ = id => document.getElementById(id);
let projects = [], employees = [], reminderDays = 30, selected, filter = 'all', storageBlocked = false;
try {
  const state = prepareState(JSON.parse(localStorage.getItem(key) || '[]'));
  projects = state.projects; employees = state.employees; reminderDays = state.reminderDays;
} catch {
  storageBlocked = true;
  $('notice').textContent = 'Saved data could not be loaded. Automatic saving is paused to protect it. Restore a valid backup to continue.';
}
function prepareState(value) {
  if (Array.isArray(value)) return {projects: prepareProjects(value), employees: [], reminderDays: 30};
  if (!value || value.version !== 2 || ![30,60,90].includes(value.reminderDays)) throw Error('Invalid backup');
  return {projects: prepareProjects(value.projects), employees: prepareEmployees(value.employees), reminderDays: value.reminderDays};
}
function stateForBackup() { return {version: 2, projects, employees, reminderDays}; }
function prepareProjects(items) {
  if (!Array.isArray(items) || !items.every(p => p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.tasks) && p.tasks.every(t => t && typeof t.id === 'string' && typeof t.name === 'string' && typeof t.done === 'boolean' && typeof t.date === 'string') && (p.purchases === undefined || (Array.isArray(p.purchases) && p.purchases.every(x => x && ['id','name','vendor','po'].every(k => typeof x[k] === 'string') && ['bidSent','poReceived','received','invoice'].every(k => typeof x[k] === 'boolean')))))) throw Error('Invalid backup');
  return items.map(p => ({...p, archived: p.archived === true, purchases: (p.purchases || []).map(x => ({...x, invoice: x.received && x.invoice}))}));
}
selected = projects.find(p => !p.archived)?.id;
function save() {
  if (!storageBlocked) {
    try { localStorage.setItem(key, JSON.stringify(stateForBackup())); $('notice').textContent = ''; }
    catch { $('notice').textContent = 'Your browser could not save these changes. Download a backup before closing this page.'; }
  }
  render();
}
function el(tag, text, className) { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; }
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function render() {
  const active = projects.filter(p => !p.archived);
  const all = active.flatMap(p => p.tasks);
  renderEvaluations();
  renderAttention();
  $('summary').replaceChildren(...[[active.length,'Active projects'],[all.filter(t=>!t.done).length,'Pending tasks'],[all.filter(t=>!t.done && t.date && t.date<today()).length,'Overdue tasks']].map(([n,label])=>{ const d=el('div'); d.append(el('strong',String(n)),el('span',label)); return d; }));
  function projectButton(p) {
    const b=el('button',p.name); b.setAttribute('aria-current',String(p.id===selected)); b.onclick=()=>{selected=p.id;render();}; return b;
  }
  $('projects').replaceChildren(...active.map(projectButton));
  const history = projects.filter(p => p.archived);
  $('project-history').replaceChildren(...history.map(projectButton));
  $('history-count').textContent = `(${history.length})`;
  const project = projects.find(p=>p.id===selected);
  $('project-title').textContent = project?.name || 'Select a project';
  $('empty').hidden=!!project; $('project-content').hidden=!project; $('delete-project').hidden=!project;
  $('archive-project').hidden = !project;
  $('archive-project').textContent = project?.archived ? 'Restore project' : 'Finish project';
  if (!project) return;
  renderPurchases(project);
  const tasks=project.tasks
    .filter(t=>filter==='all'||(filter==='done'?t.done:!t.done))
    .sort((a,b)=>(a.date || '9999-12-31').localeCompare(b.date || '9999-12-31'));
  $('no-tasks').textContent=tasks.length?'':(filter==='all'?'No tasks yet. Add your first small step above.':'No tasks in this view.');
  $('tasks').replaceChildren(...tasks.map(t=>{
    const li=el('li',null,'task'+(t.done?' done':'')); const check=el('input'); check.type='checkbox';check.checked=t.done;check.id='task-'+t.id;check.onchange=()=>{t.done=check.checked;save();};
    const label=el('label',t.name);label.htmlFor=check.id;li.append(check,label);
    if(t.date){ const overdue=!t.done&&t.date<today();const date=el('span',(overdue?'Overdue · ':'')+new Date(t.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}),'date'+(overdue?' overdue':''));li.append(date); }
    const remove=el('button','×','quiet');remove.setAttribute('aria-label','Delete task '+t.name);remove.onclick=()=>{project.tasks=project.tasks.filter(x=>x.id!==t.id);save();};li.append(remove);return li;
  }));
}
$('project-form').onsubmit=e=>{e.preventDefault();const name=$('project-name').value.trim();if(!name)return;const p={id:crypto.randomUUID(),name,tasks:[],purchases:[],archived:false};projects.push(p);selected=p.id;e.target.reset();save();$('task-name').focus();};
$('task-form').onsubmit=e=>{e.preventDefault();const p=projects.find(p=>p.id===selected),name=$('task-name').value.trim();if(!p||!name)return;p.tasks.push({id:crypto.randomUUID(),name,date:$('task-date').value,done:false});e.target.reset();save();$('task-name').focus();};
$('delete-project').onclick=()=>{const p=projects.find(p=>p.id===selected);if(p&&confirm(`Delete “${p.name}” and all its tasks and purchases?`)){projects=projects.filter(x=>x.id!==selected);selected=projects.find(x=>!x.archived)?.id;save();}};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(stateForBackup(),null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='project-tracker-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function renderPurchases(project) {
  const purchases = project.purchases;
  $('no-purchases').textContent = purchases.length ? '' : 'No purchases yet. Add an item or service above.';
  $('purchase-summary').textContent = purchases.length ? `${purchases.length} purchases · ${purchases.filter(x => !x.received).length} awaiting receipt · ${purchases.filter(x => x.received && !x.invoice).length} awaiting invoice · ${purchases.filter(x => x.invoice).length} complete` : '';
  $('purchases').replaceChildren(...purchases.map(purchase => {
    const card = el('li', null, 'purchase-card');
    const header = el('div', null, 'purchase-heading');
    const info = el('div'); info.append(el('h3', purchase.name));
    const details = [purchase.vendor, purchase.po ? 'PO: ' + purchase.po : ''].filter(Boolean).join(' · ');
    if (details) info.append(el('p', details));
    const remove = el('button', 'Delete', 'quiet'); remove.setAttribute('aria-label', 'Delete purchase ' + purchase.name);
    remove.onclick = () => { if (confirm(`Delete purchase “${purchase.name}”?`)) { project.purchases = project.purchases.filter(x => x.id !== purchase.id); save(); } };
    header.append(info, remove);card.append(header);
    const steps = el('div', null, 'purchase-steps');
    for (const [field, title] of [['bidSent','Bid sheet sent'],['poReceived','PO received'],['received','Item / service received'],['invoice','Invoice received']]) {
      const label = el('label', null, 'purchase-step');
      const check = el('input'); check.type = 'checkbox';check.checked = purchase[field];check.dataset.step = field;
      check.disabled = field === 'invoice' && !purchase.received;
      check.onchange = () => {
        if (field === 'invoice' && !purchase.received) { render(); return; }
        if (field === 'received' && !check.checked && purchase.invoice && !confirm('Removing receipt also clears Invoice received. Continue?')) { render(); return; }
        purchase[field] = check.checked;
        if (!purchase.received) purchase.invoice = false;
        save();
      };
      label.append(check, el('span', title));steps.append(label);
    }
    card.append(steps);
    if (!purchase.received) card.append(el('p', 'Invoice tracking is locked until the item or service is received.', 'purchase-hint'));
    else if (purchase.invoice) card.append(el('p', 'Complete — item or service and invoice received.', 'purchase-hint'));
    return card;
  }));
}
$('purchase-form').onsubmit = e => {
  e.preventDefault(); const project = projects.find(p => p.id === selected), name = $('purchase-name').value.trim();
  if (!project || !name) return;
  project.purchases.push({id: crypto.randomUUID(), name, vendor: $('purchase-vendor').value.trim(), po: $('purchase-po').value.trim(), bidSent: false, poReceived: false, received: false, invoice: false});
  e.target.reset();save();$('purchase-name').focus();
};
$('import').onchange = async e => {
  const file = e.target.files[0];if (!file) return;
  try {
    const raw = JSON.parse(await file.text());
    const imported = prepareState(raw);
    if (confirm('Restore this backup? This replaces your current projects. New backups also replace employees and reminder settings. Download a current backup first if you want to keep them.')) {
      projects = imported.projects;
      if (!Array.isArray(raw)) { employees = imported.employees; reminderDays = imported.reminderDays; }
      selected = projects.find(p => !p.archived)?.id;storageBlocked = false;
      for (const employee of employees) ensureYearReviews(employee,today());
      save();
    }
  } catch { $('notice').textContent = 'Could not restore this file. Choose a valid project tracker JSON backup.'; }
  e.target.value = '';
};
$('archive-project').onclick = () => {
  const p = projects.find(p => p.id === selected); if (!p) return;
  if (!p.archived && !confirm('Move this project to History? Its tasks and purchases will be kept, and it will be removed from active reminders.')) return;
  p.archived = !p.archived;
  if (p.archived) selected = projects.find(x => !x.archived)?.id;
  save();
};
initializeEvaluations();
render();

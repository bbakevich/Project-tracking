// Date-only calculations use UTC so daylight-saving changes cannot shift deadlines.
function validDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value + 'T00:00:00Z').toISOString().slice(0,10) === value;
}
function addMonthsClamped(day, months) {
  const [year, month, date] = day.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date, last));return target.toISOString().slice(0,10);
}
function daysFrom(day, count) { const date = new Date(day + 'T00:00:00Z');date.setUTCDate(date.getUTCDate() + count);return date.toISOString().slice(0,10); }
function makeReviews(type, start, year) {
  const dates = type === 'probationary'
    ? [['Interim 1',addMonthsClamped(start,4)],['Interim 2',addMonthsClamped(start,8)],['Final',daysFrom(addMonthsClamped(start,12),-1)]]
    : [['Interim',`${year}-06-30`],['Final',`${year}-12-31`]];
  const cycle = type === 'probationary' ? 'Probation' : `CY ${year}`;
  const reviews = dates.map(([title,due], i) => ({id:`${cycle}-${i}`,cycle,title,due,done:false,completedOn:''}));
  return [{id:`${cycle}-initiation`,cycle,title:'Initiate EE',due:type==='probationary'?addMonthsClamped(start,1):`${year}-01-31`,done:false,completedOn:''}, ...reviews];
}
function prepareEmployees(items) {
  if (!Array.isArray(items) || !items.every(e => e && typeof e.id === 'string' && typeof e.name === 'string' && ['regular','probationary'].includes(e.type) && (validDay(e.start) || (e.type === 'regular' && e.start === '')) && Number.isInteger(e.firstYear) && e.firstYear >= 2000 && e.firstYear <= 9998 && typeof e.inactive === 'boolean' && Array.isArray(e.reviews) && e.reviews.every(r => r && ['id','cycle','title'].every(k => typeof r[k] === 'string') && validDay(r.due) && typeof r.done === 'boolean' && (r.completedOn === '' || validDay(r.completedOn))))) throw Error('Invalid employee backup');
  return items;
}
function ensureYearReviews(employee, day) {
  if (employee.inactive) return false;
  let changed = false;
  if (employee.type === 'probationary') {
    for (const review of makeReviews('probationary',employee.start,employee.firstYear)) {
      const existing = employee.reviews.find(r => r.id === review.id);
      if (!existing) {employee.reviews.push(review);changed = true;}
      else if (review.title === 'Final' && !existing.done && existing.due >= addMonthsClamped(employee.start,12)) {existing.due = review.due;changed = true;}
    }
    return changed;
  }
  for (let year = employee.firstYear; year <= Number(day.slice(0,4)); year++) {
    for (const review of makeReviews('regular',employee.start,year)) {
      if (!employee.reviews.some(r => r.id === review.id)) { employee.reviews.push(review);changed = true; }
    }
  }
  return changed;
}
function attentionItems(projects, employees, day, days) {
  const limit = daysFrom(day, days), items = [];
  for (const p of projects.filter(p => !p.archived)) {
    for (const t of p.tasks) if (!t.done && t.date && t.date <= limit) items.push({date:t.date,label:`${p.name} — ${t.name}`,projectId:p.id,kind:'Task'});
  }
  for (const e of employees.filter(e => !e.inactive)) {
    const pending = e.reviews.filter(r => !r.done);
    for (const r of pending) if (r.due <= limit) items.push({date:r.due,label:`${e.name} — ${r.cycle} ${r.title}`,employeeId:e.id,kind:'Evaluation'});
    if (!pending.length && e.type === 'probationary') items.push({date:'',label:`${e.name} — probation reviews complete; confirm the move to a calendar-year schedule after ${addMonthsClamped(e.start,12)}.`,employeeId:e.id,kind:'Schedule check'});
    if (!e.reviews.length) items.push({date:'',label:`${e.name} — no reviews scheduled. Check this employee’s schedule.`,employeeId:e.id,kind:'Schedule check'});
  }
  return items.sort((a,b)=>(a.date || '9999-12-31').localeCompare(b.date || '9999-12-31') || a.label.localeCompare(b.label));
}
function formatDay(day) { return new Date(day + 'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); }
function renderAttention() {
  $('reminder-days').value = String(reminderDays);
  const day = today(), items = attentionItems(projects,employees,day,reminderDays);
  const late = items.filter(x => x.date && x.date < day).length;
  $('attention-summary').textContent = items.length ? `${late} overdue · ${items.filter(x => x.date && x.date >= day).length} due within ${reminderDays} days · ${items.filter(x => !x.date).length} schedule checks` : `No overdue items or deadlines in the next ${reminderDays} days. Keep your employee roster up to date.`;
  const expanded = $('show-attention').getAttribute('aria-expanded') === 'true';
  $('show-attention').hidden = items.length <= 5;
  $('show-attention').textContent = expanded ? 'Show fewer' : `Show all ${items.length} reminders`;
  $('attention').replaceChildren(...(expanded ? items : items.slice(0,5)).map(item => {
    const li=el('li',null,'attention-item'); const b=el('button',item.label,'attention-link');
    b.onclick=()=>{
      if (item.projectId) {selected=item.projectId;render();$('project-title').scrollIntoView({block:'center'});}
      else { const card=document.getElementById('employee-'+item.employeeId);if(card){const details=card.querySelector('.employee-details');if(details)details.open=true;card.scrollIntoView({block:'center'});card.focus();} }
    };
    const status=item.date ? (item.date<day?'Overdue':item.date===day?'Due today':'Upcoming') + ' · ' + formatDay(item.date) : 'Action needed';
    li.append(b,el('span',`${item.kind} · ${status}`,'date'+(item.date&&item.date<day?' overdue':'')));return li;
  }));
}
function renderEvaluations() {
  const day=today();
  $('employees').replaceChildren(...employees.filter(e=>!e.inactive).map(employeeCard));
  if (!employees.some(e=>!e.inactive)) $('employees').append(el('li','No employees yet. Add everyone you need to track above.'));
  $('employee-history').replaceChildren(...employees.filter(e=>e.inactive).map(employeeCard));
  function employeeCard(employee) {
    const card=el('li',null,'employee-card');card.id='employee-'+employee.id;card.tabIndex=-1;
    const header=el('div',null,'purchase-heading');const text=el('div');text.append(el('h3',employee.name));
    text.append(el('p',employee.type==='probationary' ? `Probation: ${formatDay(employee.start)} – ${formatDay(addMonthsClamped(employee.start,12))}` : `Calendar-year reviews · tracking from CY ${employee.firstYear}`));
    const archive=el('button',employee.inactive?'Restore employee':'Move to employee history','quiet');
    archive.onclick=()=>{if(!employee.inactive&&!confirm('Move this employee to History and stop their reminders? Their reviews will be kept.'))return;employee.inactive=!employee.inactive;ensureYearReviews(employee,today());save();};
    header.append(text,archive);card.append(header);
    if (!employee.inactive && employee.type==='probationary') {
      const transition=el('button','Switch to calendar-year reviews','quiet');
      transition.disabled=day<addMonthsClamped(employee.start,12)||employee.reviews.some(r=>!r.done);
      transition.title='Available after the first anniversary and completion of all probation reviews.';
      transition.onclick=()=>{if(!confirm('Finish probation tracking and add calendar-year interim and final reviews for this year? Probation history will be kept.'))return;employee.type='regular';employee.firstYear=Number(today().slice(0,4));ensureYearReviews(employee,today());save();};card.append(transition);
    }
    const pending=employee.reviews.filter(r=>!r.done).sort((a,b)=>a.due.localeCompare(b.due));
    const reviewDetails=el('details',null,'employee-details');
    reviewDetails.append(el('summary',`${pending.length} outstanding EE step${pending.length===1?'':'s'} — view schedule`));
    const list=el('ul');list.append(...pending.map(reviewRow));reviewDetails.append(list);card.append(reviewDetails);
    const done=employee.reviews.filter(r=>r.done).sort((a,b)=>b.due.localeCompare(a.due));
    if(done.length){const details=el('details');details.append(el('summary',`Completed reviews (${done.length})`));const list=el('ul');list.append(...done.map(reviewRow));details.append(list);reviewDetails.append(details);}
    return card;
    function reviewRow(review) {
      const li=el('li',null,'review-row');const label=el('label',null,'review-completion');const check=el('input');check.type='checkbox';check.checked=review.done;
      check.setAttribute('aria-label',`${employee.name}: ${review.cycle} ${review.title} completed`);
      check.onchange=()=>{review.done=check.checked;review.completedOn=review.done?today():'';save();};
      label.append(check,el('span',`${review.cycle} — ${review.title}`));li.append(label);
      const dateLabel=el('label','Due date');const input=el('input');input.type='date';input.required=true;input.value=review.due;
      input.setAttribute('aria-label',`${employee.name}: ${review.cycle} ${review.title} due date`);
      if(review.cycle==='Probation' && review.title==='Final') input.max=daysFrom(addMonthsClamped(employee.start,12),-1);
      input.onchange=()=>{if(!validDay(input.value)||(input.max&&input.value>input.max)){input.value=review.due;return;}review.due=input.value;save();};dateLabel.append(input);li.append(dateLabel);
      li.append(el('span',review.done?`Completed ${formatDay(review.completedOn || review.due)}`:review.due<day?'Overdue':review.due===day?'Due today':'Pending','date'+(!review.done&&review.due<day?' overdue':'')));return li;
    }
  }
}
function initializeEvaluations() {
  $('employee-year').value=today().slice(0,4);
  $('schedule-note').textContent='Default dates: probation interims at 4 and 8 months, final the day before the first anniversary. Initiate EE within one month of starting. CY initiation by January 31, interim June 30, final December 31. You can change each due date after adding an employee.';
  $('employee-type').onchange=()=>{$('employee-year-field').hidden=$('employee-type').value==='probationary';$('employee-year').required=$('employee-type').value==='regular';$('employee-start').required=$('employee-type').value==='probationary';};
  $('employee-form').onsubmit=e=>{
    e.preventDefault();const name=$('employee-name').value.trim(),start=$('employee-start').value,type=$('employee-type').value,year=Number($('employee-year').value);
    if(!name || (type==='probationary'&&!validDay(start)) || (start&&(!validDay(start)||Number(start.slice(0,4))<2000||Number(start.slice(0,4))>9997)) || !Number.isInteger(year)||year<2000||year>9998)return;
    if(type==='regular'&&((start&&year<Number(start.slice(0,4)))||year>Number(today().slice(0,4)))){$('employee-message').textContent='Choose a first calendar year between the employee’s start year and the current year.';return;}
    if(employees.some(x=>!x.inactive&&x.name.toLowerCase()===name.toLowerCase()&&x.start===start)){$('employee-message').textContent='This employee and start date are already on the active roster.';return;}
    const employee={id:crypto.randomUUID(),name,start,type,firstYear:year,inactive:false,reviews:type==='probationary'?makeReviews(type,start,year):[]};
    ensureYearReviews(employee,today());employees.push(employee);e.target.reset();$('employee-year').value=today().slice(0,4);$('employee-type').onchange();$('employee-message').textContent='Employee added. Check the suggested due dates and adjust them to your policy.';save();
  };
  $('show-attention').onclick=()=>{const b=$('show-attention');b.setAttribute('aria-expanded',String(b.getAttribute('aria-expanded')!=='true'));renderAttention();};
  $('reminder-days').onchange=()=>{reminderDays=Number($('reminder-days').value);save();};
  function refresh(){let changed=false;for(const employee of employees)if(ensureYearReviews(employee,today()))changed=true;if(changed)save();else render();}
  let added=false;for(const employee of employees)if(ensureYearReviews(employee,today()))added=true;
  if(added)save();
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  // Refresh in an open tab at midnight as well as when returning to the tracker.
  function nextDay(){const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);setTimeout(()=>{refresh();nextDay();},next-now+1000);}nextDay();
}
if (typeof module !== 'undefined' && module.exports) module.exports={validDay,addMonthsClamped,daysFrom,makeReviews,prepareEmployees,ensureYearReviews,attentionItems};

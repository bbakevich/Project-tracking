const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validDay,addMonthsClamped,makeReviews,ensureYearReviews,attentionItems,prepareEmployees}=require('../public/evaluations');
const employee=(type='regular')=>({id:'e',name:'Employee',start:'2026-01-01',firstYear:2026,type,inactive:false,reviews:[]});
test('probation has two interims and an anniversary final, with valid month ends',()=>{
  assert.deepEqual(makeReviews('probationary','2026-10-31',2026).map(r=>r.due),['2027-02-28','2027-06-30','2027-10-31']);
  assert.equal(addMonthsClamped('2024-02-29',12),'2025-02-28');
  assert.equal(validDay('2026-02-30'),false);assert.equal(validDay('2024-02-29'),true);
});
test('calendar year creates one interim and final; year rollover retains completions and overdue history',()=>{
  const e=employee();assert.equal(ensureYearReviews(e,'2026-11-09'),true);
  assert.deepEqual(e.reviews.map(r=>r.due),['2026-06-30','2026-12-31']);
  e.reviews[0].done=true;e.reviews[0].completedOn='2026-06-29';e.reviews[1].due='2026-12-15';
  assert.equal(ensureYearReviews(e,'2027-01-01'),true);assert.equal(e.reviews.length,4);
  assert.equal(e.reviews[0].done,true);assert.equal(e.reviews[1].due,'2026-12-15');
  assert.equal(ensureYearReviews(e,'2027-01-01'),false);assert.equal(e.reviews.length,4);
  assert.ok(attentionItems([], [e],'2027-01-01',30).some(i=>i.date==='2026-12-15'));
});
test('probation is not silently converted and inactive employees get no new annual cycle',()=>{
  const e=employee('probationary');e.reviews=makeReviews(e.type,e.start,2026);
  assert.equal(ensureYearReviews(e,'2027-01-01'),false);assert.equal(e.reviews.length,3);
  e.type='regular';e.inactive=true;assert.equal(ensureYearReviews(e,'2027-01-01'),false);
});
test('reminders include overdue, today and inclusive horizon, exclude completed/archived and sort by date',()=>{
  const e=employee();e.reviews=makeReviews('regular',e.start,2026);
  const tasks=[{id:'1',name:'Due today',date:'2026-12-01',done:false},{id:'2',name:'Beyond',date:'2027-01-01',done:false},{id:'3',name:'Done',date:'2026-01-01',done:true}];
  const p={id:'p',name:'Project',tasks};
  const items=attentionItems([p,{...p,id:'hidden',archived:true}],[e],'2026-12-01',30);
  assert.deepEqual(items.map(i=>i.date),['2026-06-30','2026-12-01','2026-12-31']);
  e.inactive=true;assert.equal(attentionItems([], [e],'2026-12-01',90).length,0);
});
test('completed probation prompts a schedule check; employee backup validation rejects invalid deadlines',()=>{
  const e=employee('probationary');e.reviews=makeReviews(e.type,e.start,2026);e.reviews.forEach(r=>r.done=true);
  assert.equal(attentionItems([], [e],'2027-01-01',30)[0].kind,'Schedule check');
  assert.doesNotThrow(()=>prepareEmployees([e]));e.reviews[0].due='2026-02-30';assert.throws(()=>prepareEmployees([e]));
});

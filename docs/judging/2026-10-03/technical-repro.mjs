// Portable judge reproductions. No real network requests or credential reads.
// Usage: node technical-repro.mjs /absolute/path/to/cover
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]||'.');
process.env.GEMINI_API_KEY=''; process.env.GEMINI_MODEL='';
process.env.PAYPAL_CLIENT_ID='judge-fixture';process.env.PAYPAL_CLIENT_SECRET='judge-fixture';
globalThis.fetch=async()=>{throw Error('External network forbidden by judge fixture')};
const {createStore}=await import(pathToFileURL(path.join(root,'server/store.mjs')));
const {paymentProvider}=await import(pathToFileURL(path.join(root,'server/payments.mjs')));
const {policy,localAssessment}=await import(pathToFileURL(path.join(root,'server/assessment.mjs')));
const draft={company:'Judge fixture',title:'Invoice workflow review',category:'Finance operations',body:'Our invoice reconciliation workflow connects original evidence to accounting decisions for your finance team.',pricing:'$39 monthly',evidence:'https://example.com/demo',feeConsent:true,acceptedPolicy:policy.version,acceptedFee:500};
const consent={accepted:true,dailyBudget:2500,maxOutstanding:2000,perSubmission:500};
const review={disposition:'declined',reason:'The invoice reconciliation workflow overlaps with our current accounting process.',quote:'invoice reconciliation',readConfirmed:true,feeConfirmed:true,action:'capture'};
const setup=async(options={})=>{const store=createStore({seed:false,...options});await store.consent(consent);return store};
const print=(name,result)=>console.log(JSON.stringify({name,...result}));
{
 const store=await setup();const first=await store.submit(draft,'same-key');
 const retry=await store.submit({...draft,pricing:'$999 monthly',evidence:'https://example.com/changed',category:'Developer tools'},'same-key');
 assert.equal(first.id,retry.id);assert.equal(retry.pricing,'$39 monthly');
 print('changed-payload-retry-accepted',{sameId:first.id===retry.id,returnedPricing:retry.pricing,returnedCategory:retry.category});
}
{
 const provider={authorize:async()=>({authorizationId:'A',status:'AUTHORIZED'}),settle:async(s,action)=>{if(action==='refund')throw Error('Unknown refund');return{id:'C',status:'COMPLETED'}},lookup:async()=>({id:'R',status:'COMPLETED'})};
 const store=await setup({provider});const s=await store.submit(draft,'appeal');await store.opened(s.id);await store.review(s.id,review);await store.appeal(s.id,{reason:'The response failed to address our specific submitted evidence.'});await store.refund(s.id,{reason:'Independent review grants refund'});await store.reconcile(s.id);
 const result=(await store.read()).submissions[0];assert.equal(result.status,'REFUNDED');assert.equal(result.appeal.status,'REFUND_PENDING');
 print('reconciled-refund-leaves-appeal-pending',{payment:result.status,appeal:result.appeal.status,earning:result.earning.status});
}
{
 let voidPosts=0,authorizationReads=0,time=Date.now();
 globalThis.fetch=async(url,init={})=>{
  if(url.endsWith('/v1/oauth2/token'))return Response.json({access_token:'fixture',expires_in:3600});
  if(url.endsWith('/void')){voidPosts++;throw Error('Fixture: failed before provider received void')}
  if(url.endsWith('/authorizations/A')){authorizationReads++;return Response.json({id:'A',status:'CREATED'})}
  throw Error('Unexpected fixture URL');
 };
 const adapter=paymentProvider('paypal-sandbox');const provider={...adapter,authorize:async()=>({authorizationId:'A',status:'AUTHORIZED'})};
 const store=await setup({mode:'paypal-sandbox',provider,clock:()=>time});const s=await store.submit(draft,'void');time+=25*3600000;await store.tick();await store.reconcile(s.id);await store.reconcile(s.id);
 const result=await store.read();assert.equal(voidPosts,1);assert.equal(result.submissions[0].status,'VOID_PENDING');assert.equal(result.budget.held,500);
 print('failed-void-cannot-retry',{voidPosts,authorizationReads,status:result.submissions[0].status,held:result.budget.held});
}
{
 globalThis.fetch=async(url,init={})=>{
  if(url.endsWith('/v1/oauth2/token'))return Response.json({access_token:'fixture',expires_in:3600});
  if(url.endsWith('/capture')||url.endsWith('/captures/C'))return Response.json({id:'C',status:'DECLINED'});
  throw Error('Unexpected fixture URL');
 };
 const adapter=paymentProvider('paypal-sandbox');const provider={...adapter,authorize:async()=>({authorizationId:'A',status:'AUTHORIZED'})};
 const store=await setup({mode:'paypal-sandbox',provider});const s=await store.submit(draft,'declined');await store.opened(s.id);await store.review(s.id,review);await store.reconcile(s.id);
 const result=await store.read();assert.equal(result.submissions[0].status,'CAPTURE_PENDING');assert.equal(result.budget.held,500);
 print('terminal-capture-status-treated-as-unknown',{status:result.submissions[0].status,providerStatus:result.operations[0].providerStatus,held:result.budget.held});
}
{
 const assessment=localAssessment({...draft,body:'We do not sell lead lists. We build invoice reconciliation software for finance teams.'});
 assert.equal(assessment.decision,'skip');print('keyword-negation-false-positive',{decision:assessment.decision,label:assessment.label});
}

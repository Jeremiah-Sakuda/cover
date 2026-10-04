// Usage: node technical-http-repro.mjs /absolute/path/to/cover [port]
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'.'),port=process.argv[3]||'33992';
const temp=mkdtempSync(path.join(tmpdir(),'cover-judge-http-'));
const child=spawn(process.execPath,[path.join(root,'server/index.mjs')],{cwd:root,env:{...process.env,PORT:port,PAYMENT_MODE:'demo',DATA_FILE:path.join(temp,'state.json'),GEMINI_API_KEY:'',GEMINI_MODEL:'',PAYPAL_CLIENT_ID:'',PAYPAL_CLIENT_SECRET:''},stdio:['ignore','pipe','pipe']});
let childErrors='';child.stderr.on('data',chunk=>childErrors+=chunk);
const base=`http://127.0.0.1:${port}`;let cookie='';
async function call(route,data,headers={}){return fetch(base+'/api'+route,{method:data===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Cover-Client':'web',Cookie:cookie,...headers},...(data===undefined?{}:{body:JSON.stringify(data)})})}
async function role(role){const r=await call('/session',{role});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0]}
try{
 await new Promise((resolve,reject)=>{child.once('error',reject);child.stdout.once('data',resolve);child.once('exit',code=>reject(Error(`Server exited ${code}: ${childErrors}`)))});
 assert.equal((await call('/state')).status,401);
 await role('sender');assert.equal((await call('/mandate',{accepted:true,dailyBudget:2500,maxOutstanding:2000,perSubmission:500})).status,200);
 const p=await (await call('/policy')).json();
 const r=await call('/submissions',{company:'HTTP judge',title:'Invoice workflow proof',category:'Finance operations',body:'Our invoice reconciliation workflow gives finance teams linked evidence and helps reduce manual bookkeeping.',pricing:'$39 monthly',evidence:'https://example.com/demo',feeConsent:true,acceptedPolicy:p.version,acceptedFee:p.fee},{'Idempotency-Key':'http-fixture'});assert.equal(r.status,200);const s=await r.json();assert.equal(s.status,'AUTHORIZED');
 assert.equal((await call(`/submissions/${s.id}/review`,{})).status,403);
 assert.equal((await call('/mandate/revoke',{}, {Origin:'https://untrusted.example'})).status,403);
 assert.equal((await call('/mandate/revoke',{}, {'Content-Type':'text/plain'})).status,415);
 await role('recipient');assert.equal((await call(`/submissions/${s.id}/open`,{})).status,200);
 const c=await call(`/submissions/${s.id}/review`,{disposition:'declined',reason:'This invoice reconciliation workflow overlaps with our existing accounting software.',quote:'invoice reconciliation',readConfirmed:true,feeConfirmed:true,action:'capture'});assert.equal(c.status,200);assert.equal((await c.json()).status,'CAPTURED');
 assert.equal((await call(`/submissions/${s.id}/refund`,{reason:'No recipient refund permission'})).status,403);
 await role('sender');assert.equal((await call(`/submissions/${s.id}/appeal`,{reason:'This response does not address the submitted evidence.'})).status,200);
 await role('operator');const refund=await call(`/submissions/${s.id}/refund`,{reason:'Independent review confirms the concern'});assert.equal(refund.status,200);assert.equal((await refund.json()).status,'REFUNDED');
 console.log('PASS: isolated HTTP consent, submission, review, appeal, refund; 401, role 403, origin 403, content type 415 checks.');
}finally{if(child.exitCode===null&&child.signalCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');await exited;}rmSync(temp,{recursive:true,force:true})}

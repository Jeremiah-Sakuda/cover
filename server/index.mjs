import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createStore} from './store.mjs';
import {policy} from './assessment.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mode=process.env.PAYMENT_MODE||'demo';
const store=createStore({mode,file:process.env.DATA_FILE||path.join(root,'data',`cover-${mode}.json`)});
const sessions=new Map(),rates=new Map();
const port=Number(process.env.PORT||3102);
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
async function body(req){let s='';for await(const chunk of req){s+=chunk;if(s.length>20000)throw Object.assign(Error('Request too large'),{status:413})}try{return s?JSON.parse(s):{}}catch{throw Object.assign(Error('Invalid JSON'),{status:400})}}
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
 const url=new URL(req.url,'http://127.0.0.1');const route=url.pathname;
 try{
 if(route==='/api/health')return json(res,200,{ok:true,project:'Cover',mode});
 if(route==='/api/policy')return json(res,200,policy);
 if(route.startsWith('/api/')){
  const address=req.socket.remoteAddress;const entry=rates.get(address)||{start:Date.now(),count:0};if(Date.now()-entry.start>60000){entry.start=Date.now();entry.count=0}entry.count++;rates.set(address,entry);if(entry.count>180)return json(res,429,{error:'Too many requests. Try again in a minute.'});
  if(req.method!=='GET'&&req.headers['x-cover-client']!=='web')return json(res,403,{error:'Cover client header required.'});
  if(req.method==='POST'&&route==='/api/session'){
   const {role}=await body(req);if(!['sender','recipient','operator'].includes(role))return json(res,400,{error:'Unknown demo role'});
   const old=req.headers.cookie?.match(/(?:^|; )cover_session=([^;]+)/)?.[1];if(old)sessions.delete(old);
   const id=randomBytes(24).toString('hex');sessions.set(id,{role,expires:Date.now()+8*3600000});res.setHeader('Set-Cookie',`cover_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);return json(res,200,{role,demoIdentity:true});
  }
  const sid=req.headers.cookie?.match(/(?:^|; )cover_session=([^;]+)/)?.[1];const session=sessions.get(sid);if(!session||session.expires<Date.now())return json(res,401,{error:'Select a local demo role to continue.'});
  const requireRole=role=>{if(session.role!==role)throw Object.assign(Error(`This action requires the ${role} role.`),{status:403})};
  if(req.method==='GET'&&route==='/api/state')return json(res,200,{...await store.read(),role:session.role});
  if(req.method==='POST'){
   const input=await body(req);let result;
   if(route==='/api/assess'){requireRole('sender');result=await store.assess(input)}
   else if(route==='/api/mandate'){requireRole('sender');result=await store.consent(input)}
   else if(route==='/api/mandate/revoke'){requireRole('sender');result=await store.revoke()}
   else if(route==='/api/submissions'){requireRole('sender');result=await store.submit(input,req.headers['idempotency-key'])}
   else if(route==='/api/demo/advance'){requireRole('operator');result=await store.advance(input.hours)}
   else {
    const m=route.match(/^\/api\/submissions\/([^/]+)\/(open|review|appeal|refund|reconcile|confirm)$/);if(!m)return json(res,404,{error:'Unknown API route'});const [,id,action]=m;
    requireRole({open:'recipient',review:'recipient',appeal:'sender',refund:'operator',reconcile:'operator',confirm:'sender'}[action]);
    result=await ({open:()=>store.opened(id),review:()=>store.review(id,input),appeal:()=>store.appeal(id,input),refund:()=>store.refund(id,input),reconcile:()=>store.reconcile(id),confirm:()=>store.confirm(id)}[action])();
   }return json(res,200,result);
  }return json(res,404,{error:'Unknown API route'});
 }
 const base=path.join(root,'dist');let target=path.resolve(base,'.'+decodeURIComponent(route));if(!target.startsWith(base+path.sep)&&target!==base)return json(res,403,{error:'Forbidden'});
 if(!fs.existsSync(target)||fs.statSync(target).isDirectory())target=path.join(base,'index.html');if(!fs.existsSync(target)){res.writeHead(503,{'Content-Type':'text/plain'});return res.end('Run npm run dev for development, or npm run build before npm start.');}
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});fs.createReadStream(target).pipe(res);
 }catch(e){json(res,e.status||500,{error:e.status?e.message:'The operation could not complete. Check its status before trying again.'})}
});
server.listen(port,'127.0.0.1',()=>console.log(`Cover ${mode}: http://127.0.0.1:${port}`));
setInterval(()=>store.tick().catch(()=>{}),30000).unref();

import fs from 'node:fs';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {policy,validateDraft,localAssessment,assess} from './assessment.mjs';
import {paymentProvider} from './payments.mjs';
const fail=(message,status=409)=>{throw Object.assign(new Error(message),{status})};
const active=s=>['AUTHORIZED','AWAITING_APPROVAL','AUTHORIZATION_UNKNOWN','CAPTURE_PENDING','VOID_PENDING'].includes(s.status);
export function createStore({file,mode='demo',clock=()=>Date.now(),provider=paymentProvider(mode),seed=true}={}){
 const now=()=>clock()+state.offset;
 let state={version:1,mode,offset:0,mandate:{consented:false,revoked:false,dailyBudget:2500,maxOutstanding:2000,perSubmission:500,recipientId:policy.id},submissions:[],operations:[],events:[]};
 if(file&&fs.existsSync(file)){state=JSON.parse(fs.readFileSync(file,'utf8'));if(state.mode!==mode)throw Error('State/payment mode mismatch');}
 else if(seed&&mode==='demo'){
 const samples=[{company:'Folio',title:'Your finance close, without the busywork',category:'Finance operations',body:'We help small teams automate invoice reconciliation and reduce manual finance work. Folio connects existing accounting exports and flags mismatches for your team to review. Our pilot measured a 35% reduction in review time. I would love your feedback on whether this fits Canopy.',pricing:'$49 per month, 14-day trial',evidence:'https://example.com/folio-case-study'},{company:'Signal Studio',title:'Turn customer interviews into a clear next step',category:'Customer research',body:'Our research workspace helps founders turn customer feedback into a ranked list of product decisions. Every theme links back to an interview quote. We have a short example showing how a five-person team organized twenty interviews.',pricing:'$29 per month',evidence:'https://example.com/signal-demo'},{company:'Orbit',title:'A new way to find your next hundred customers',category:'Customer research',body:'Orbit offers lead lists and outbound campaigns for teams expanding into new markets. We supply 100 targeted contacts and a launch plan. Our team would appreciate a review of our positioning even if this is outside your current priorities.',pricing:'$199 per campaign',evidence:'https://example.com/orbit'}];
 state.submissions=samples.map((d,i)=>({id:randomUUID(),...d,policy:structuredClone(policy),assessment:localAssessment(d),createdAt:clock()-(i+1)*3600000,deadline:clock()+(22-i)*3600000,status:'AUTHORIZED',senderId:'demo-sender',fingerprint:hash(d),payment:{authorizationId:`SIM-FIXTURE-${i+1}`,status:'AUTHORIZED'},events:[{at:clock()-(i+1)*3600000,label:'Fixture authorization · simulated'}]}));
 }
 function hash(d){return createHash('sha256').update(JSON.stringify([d.company,d.title,d.body])).digest('hex')}
 function save(){if(file){fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(state,null,2),{mode:0o600});fs.renameSync(tmp,file)}}
 save();let tail=Promise.resolve();
 function lock(fn){const job=tail.then(async()=>{const result=await fn();save();return result});tail=job.catch(()=>{});return job}
 const sub=id=>state.submissions.find(s=>s.id===id)||fail('Proposal not found',404);
 const event=(s,label)=>s.events.push({at:now(),label});
 function budget(){const day=new Date(now()).toISOString().slice(0,10);return {held:state.submissions.filter(active).reduce((n,s)=>n+s.policy.fee,0),usedToday:state.submissions.filter(s=>new Date(s.createdAt).toISOString().slice(0,10)===day&&!['VOIDED','REFUNDED','CANCELLED'].includes(s.status)).reduce((n,s)=>n+s.policy.fee,0)}}
 function complete(s,op,res){op.providerId=res.id;op.providerStatus=res.status;if(res.status!=='COMPLETED'){op.status='UNKNOWN';s.status=op.action.toUpperCase()+'_PENDING';return}
 op.status='CONFIRMED';op.confirmedAt=now();s.status={capture:'CAPTURED',void:'VOIDED',refund:'REFUNDED'}[op.action];s.payment.status=s.status;
 if(op.action==='capture'){s.payment.captureId=res.id;s.earning={amount:s.policy.recipientShare,status:'PENDING_APPEAL_WINDOW',eligibleAt:now()+s.policy.appealHours*3600000};}
 if(op.action==='refund'&&s.earning)s.earning.status='REVERSED';
 event(s,`${mode==='demo'?'Simulated ':''}${op.action} confirmed`);
 }
 async function settle(s,action){let op=state.operations.find(o=>o.submissionId===s.id&&o.action===action);if(op)return s;
 op={id:randomUUID(),submissionId:s.id,action,status:'REQUESTED',createdAt:now()};state.operations.push(op);s.status=action.toUpperCase()+'_PENDING';save();
 try{complete(s,op,await provider.settle(s,action,op.id))}catch{op.status='UNKNOWN';event(s,`${action} outcome unknown; operator reconciliation required`)}save();return s;
 }
 async function expire(){for(const s of state.submissions){if(s.deadline<=now()&&s.status==='AUTHORIZED')await settle(s,'void');else if(s.deadline<=now()&&s.status==='AWAITING_APPROVAL'){s.status='CANCELLED';event(s,'Checkout admission window expired. Any later authorization must be voided.')}}}
 return {
 read:()=>lock(async()=>{await expire();return structuredClone({...state,now:now(),policy,budget:budget(),aiMode:process.env.GEMINI_API_KEY&&process.env.GEMINI_MODEL?'Gemini connected':'Local rules · demo'})}),
 tick:()=>lock(expire),
 consent:input=>lock(()=>{for(const k of ['dailyBudget','maxOutstanding','perSubmission'])if(!Number.isInteger(input[k])||input[k]<500||input[k]>10000)fail('Budgets must be whole cents from $5 to $100.',400);if(input.accepted!==true)fail('Explicit acceptance is required.',400);state.mandate={...state.mandate,...Object.fromEntries(['dailyBudget','maxOutstanding','perSubmission'].map(k=>[k,input[k]])),consented:true,revoked:false,acceptedAt:now(),policyVersion:policy.version};return state.mandate}),
 revoke:()=>lock(()=>{state.mandate.revoked=true;return state.mandate}),
 async assess(input){return assess(validateDraft(input))},
 submit:(input,key)=>lock(async()=>{
 const d=validateDraft(input);if(!key||key.length>100)fail('A bounded Idempotency-Key is required.',400);
 const existing=state.submissions.find(s=>s.key===key);if(existing){if(existing.fingerprint!==hash(d))fail('Idempotency key already belongs to another proposal.');return existing}
 const m=state.mandate;if(!m.consented||m.revoked)fail('Accept the review agreement and enable your mandate first.',403);
 if(input.acceptedPolicy!==policy.version||input.acceptedFee!==policy.fee||input.feeConsent!==true)fail('Confirm this exact policy and $5 review fee.',400);
 if(state.submissions.some(s=>s.fingerprint===hash(d)))fail('This proposal has already been submitted.');
 if(activeCount()>=policy.capacity)fail('The review queue is full. No payment requested.');const b=budget();if(policy.fee>m.perSubmission||b.usedToday+policy.fee>m.dailyBudget||b.held+policy.fee>m.maxOutstanding)fail('This submission exceeds your budget or outstanding hold limit.');
 const s={id:randomUUID(),...d,key,fingerprint:hash(d),senderId:'demo-sender',policy:structuredClone(policy),assessment:await assess(d),createdAt:now(),deadline:now()+policy.hours*3600000,status:'AUTHORIZATION_UNKNOWN',events:[],payment:{}};state.submissions.unshift(s);save();
 try{s.payment=await provider.authorize(s);s.status=s.payment.status;event(s,mode==='demo'?'Simulated authorization confirmed':'Buyer approval required');}catch{event(s,'Authorization outcome unknown; reservation retained for reconciliation.')}save();return s;
 }),
 confirm:id=>lock(async()=>{const s=sub(id);if(!s.payment.orderId)fail('No PayPal order to confirm.');if(!['AWAITING_APPROVAL','CANCELLED'].includes(s.status))return s;s.payment={...s.payment,...await provider.confirm(s)};s.status='AUTHORIZED';event(s,'PayPal sandbox authorization confirmed');if(s.deadline<=now())await settle(s,'void');return s}),
 opened:id=>lock(()=>{const s=sub(id);if(s.status==='AUTHORIZED'){s.openedAt=now();event(s,'Full proposal opened by recipient')}return s}),
 review:(id,input)=>lock(async()=>{const s=sub(id);await expire();if(s.status!=='AUTHORIZED')fail('Only an active authorization can be reviewed.');if(!s.openedAt||!input.readConfirmed)fail('Open and confirm reading the complete proposal.',400);if(!['interested','not-now','declined'].includes(input.disposition)||!['capture','void'].includes(input.action))fail('Choose a disposition and fee action.',400);if(typeof input.reason!=='string'||input.reason.trim().length<20||input.reason.length>1500)fail('Add a content-specific review reason (20–1500 characters).',400);if(typeof input.quote!=='string'||input.quote.length<8||!s.body.includes(input.quote))fail('Select an exact passage from the proposal (at least 8 characters).',400);if(input.action==='capture'&&input.feeConfirmed!==true)fail('Explicit fee confirmation is required.',400);s.review={disposition:input.disposition,reason:input.reason.trim(),quote:input.quote,completedAt:now(),action:input.action,actor:'recipient'};event(s,'Structured human review completed');return settle(s,input.action)}),
 appeal:(id,input)=>lock(()=>{const s=sub(id);if(s.status!=='CAPTURED'||s.appeal)fail('Only a captured, unappealed review can be appealed.');if(s.earning.eligibleAt<now())fail('The 48-hour appeal window has ended.');if(typeof input.reason!=='string'||input.reason.trim().length<20||input.reason.length>1500)fail('Describe your concern in 20–1500 characters.',400);s.appeal={reason:input.reason.trim(),status:'OPEN',createdAt:now(),assignedTo:'independent-operator'};s.earning.status='ON_HOLD';event(s,'Sender appealed; earnings paused for independent operator');return s}),
 refund:(id,input)=>lock(async()=>{const s=sub(id);if(s.status!=='CAPTURED')fail('Only a confirmed capture can be refunded.');if(typeof input.reason!=='string'||input.reason.trim().length<10)fail('An operator reason is required.',400);s.refundReason=input.reason.trim();const result=await settle(s,'refund');if(s.appeal)s.appeal.status=s.status==='REFUNDED'?'REFUNDED':'REFUND_PENDING';return result}),
 reconcile:id=>lock(async()=>{const s=sub(id);if(s.status==='AUTHORIZATION_UNKNOWN'){if(now()-s.createdAt>5*3600000)fail('This old unknown order requires provider investigation.');try{s.payment=await provider.authorize(s);s.status=s.payment.status;event(s,'Authorization setup reconciled using original request ID');if(s.deadline<=now()&&s.status==='AUTHORIZED')await settle(s,'void')}catch{event(s,'Authorization remains unknown; reservation retained')}return s}const op=state.operations.find(o=>o.submissionId===id&&o.status!=='CONFIRMED');if(!op)fail('No pending settlement operation. Authorization uncertainty requires provider investigation.');try{complete(s,op,await provider.lookup(s,op))}catch{event(s,'Reconciliation still pending; no new financial operation created')}return s}),
 advance:hours=>lock(async()=>{if(mode!=='demo')fail('Time controls are demo-only.',403);if(!Number.isInteger(hours)||hours<1||hours>72)fail('Choose 1–72 demo hours.',400);state.offset+=hours*3600000;await expire();return {now:now()}}),
 };
 function activeCount(){return state.submissions.filter(active).length}
}

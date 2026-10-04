import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {localAssessment,assess} from '../server/assessment.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../eval/opportunities.v1.json',import.meta.url),'utf8'));
const gemini=process.argv.includes('--gemini');
if(gemini&&(!process.env.GEMINI_API_KEY||!process.env.GEMINI_MODEL))throw Error('--gemini requires locally configured GEMINI_API_KEY and GEMINI_MODEL; no comparison was performed.');
const baseline=d=>{const excluded=/lead lists?|seo services?|crypto promotions?/i.test(d.body),hit=/finance|customer feedback|developer|research|invoice|workflow|reconciliation/i.test(d.body);return {decision:excluded?'skip':hit?'submit':'revise',provider:'Frozen cover-rules-v1 baseline',evidence:[]}};
const providers=[['rules-v1',baseline],['rules-v2',localAssessment],...(gemini?[['gemini',assess]]:[])];
const runs=[];
for(const [name,fn] of providers){const rows=[];for(const c of data.cases){const started=performance.now();const result=await fn(c.proposal);rows.push({id:c.id,expected:c.expected,actual:result.decision,correct:result.decision===c.expected,latencyMs:Number((performance.now()-started).toFixed(3)),provider:result.provider,model:result.model||null,fallback:name==='gemini'&&result.provider!=='Gemini',invalidQuotes:(result.evidence||[]).filter(e=>!c.proposal.body.includes(e.quote)).length,usage:result.usage||null});}const correct=rows.filter(r=>r.correct).length;const confusion={};for(const r of rows){confusion[r.expected]??={submit:0,revise:0,skip:0};confusion[r.expected][r.actual]++;}runs.push({name,total:rows.length,correct,accuracy:Number((correct/rows.length).toFixed(4)),falseSubmit:rows.filter(r=>r.actual==='submit'&&r.expected!=='submit').length,fallbacks:rows.filter(r=>r.fallback).length,invalidQuotes:rows.reduce((n,r)=>n+r.invalidQuotes,0),meanLatencyMs:Number((rows.reduce((n,r)=>n+r.latencyMs,0)/rows.length).toFixed(3)),confusion,rows});}
const hash=p=>createHash('sha256').update(fs.readFileSync(new URL(p,import.meta.url))).digest('hex');
const result={generatedAt:new Date().toISOString(),dataset:data.version,labelSource:data.labelSource,casesSha256:hash('../eval/opportunities.v1.json'),assessmentSha256:hash('../server/assessment.mjs'),mode:gemini?'connected-model comparison requested; inspect fallback counts':'local-only, no provider requests',runs};
const out=process.argv.indexOf('--write');if(out!==-1){if(!process.argv[out+1])throw Error('--write requires an output path');fs.writeFileSync(process.argv[out+1],JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify({...result,runs:runs.map(({rows,...r})=>({...r,failures:rows.filter(x=>!x.correct)}))},null,2));

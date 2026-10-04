// Structural assistance, not proof of attention or a model-based payment decision.
export function reviewErrors(body,input){
 const errors={};
 if(!['P1','P2','P3'].includes(input.criterion))errors.criterion='Choose the published policy rule that informed your review.';
 if(typeof input.quote!=='string'||input.quote.trim().length<20||!body.includes(input.quote))errors.quote='Select an exact passage from the proposal (at least 20 characters).';
 if(typeof input.reason!=='string'||input.reason.trim().length<40||input.reason.length>1500)errors.reason='Explain how that passage supports your decision (40–1500 characters).';
 else if(!errors.quote){const terms=input.quote.toLowerCase().match(/[a-z]{5,}/g)||[];if(!terms.some(term=>input.reason.toLowerCase().includes(term)))errors.reason='Discuss a specific detail from your quoted passage in the reason.';}
 if(typeof input.nextStep!=='string'||input.nextStep.trim().length<12||input.nextStep.length>600)errors.nextStep='Give a concrete next step or explain what would need to change (12–600 characters).';
 if(input.readConfirmed!==true)errors.readConfirmed='Confirm reading the full proposal.';
 if(input.action==='capture'&&input.feeConfirmed!==true)errors.feeConfirmed='Explicit fee confirmation is required.';
 return errors;
}

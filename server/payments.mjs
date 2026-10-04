import {randomUUID} from 'node:crypto';
export function paymentProvider(mode='demo'){
 if(!['demo','paypal-sandbox'].includes(mode))throw Error('Only demo or paypal-sandbox payment modes are allowed.');
 let token,expires=0;
 async function request(path,method='GET',body,key){
  if(Date.now()>expires){const r=await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('PayPal sandbox authentication failed');const data=await r.json();token=data.access_token;expires=Date.now()+(data.expires_in-60)*1000;}
  const r=await fetch('https://api-m.sandbox.paypal.com'+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(key?{'PayPal-Request-Id':key}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error(`PayPal sandbox returned ${r.status}; reconcile before retrying.`);return r.status===204?{}:r.json();
 }
 return {mode,
 async authorize(s){if(mode==='demo')return {authorizationId:'SIM-A-'+randomUUID(),status:'AUTHORIZED'};
  if(!process.env.PAYPAL_CLIENT_ID||!process.env.PAYPAL_CLIENT_SECRET)throw Error('PayPal sandbox credentials are required.');
  const order=await request('/v2/checkout/orders','POST',{intent:'AUTHORIZE',purchase_units:[{reference_id:s.id,amount:{currency_code:'USD',value:(s.policy.fee/100).toFixed(2)}}],payment_source:{paypal:{experience_context:{return_url:process.env.APP_URL||'http://127.0.0.1:5172',cancel_url:process.env.APP_URL||'http://127.0.0.1:5172',user_action:'PAY_NOW'}}}},`${s.id}-order`);
  return {orderId:order.id,approvalUrl:order.links?.find(l=>['payer-action','approve'].includes(l.rel))?.href,status:'AWAITING_APPROVAL'};
 },
 async confirm(s){const order=await request(`/v2/checkout/orders/${s.payment.orderId}`);let data=order;if(order.status==='APPROVED')data=await request(`/v2/checkout/orders/${s.payment.orderId}/authorize`,'POST',{},`${s.id}-authorize`);const a=data.purchase_units?.[0]?.payments?.authorizations?.[0];if(!a||a.status!=='CREATED'||a.amount?.currency_code!=='USD'||a.amount?.value!==(s.policy.fee/100).toFixed(2))throw Error('No matching confirmed authorization yet.');return {authorizationId:a.id,status:'AUTHORIZED'};},
 async settle(s,action,key){if(mode==='demo')return {id:`SIM-${action.toUpperCase()}-${randomUUID()}`,status:'COMPLETED'};
  if(action==='capture')return request(`/v2/payments/authorizations/${s.payment.authorizationId}/capture`,'POST',{amount:{currency_code:'USD',value:(s.policy.fee/100).toFixed(2)},final_capture:true},key);
  if(action==='void'){await request(`/v2/payments/authorizations/${s.payment.authorizationId}/void`,'POST',{},key);return {id:s.payment.authorizationId,status:'COMPLETED'}}
  return request(`/v2/payments/captures/${s.payment.captureId}/refund`,'POST',{amount:{currency_code:'USD',value:(s.policy.fee/100).toFixed(2)}},key);
 },
 async lookup(s,op){
  if(mode==='demo')return {status:'COMPLETED',id:op.providerId||'SIM-RECONCILED-'+op.id};
  if(op.action==='void'){const a=await request(`/v2/payments/authorizations/${s.payment.authorizationId}`);return {id:a.id,status:a.status==='VOIDED'?'COMPLETED':a.status}}
  if(op.providerId)return request(`/v2/payments/${op.action==='refund'?'refunds':'captures'}/${op.providerId}`);
  // Repeat the exact idempotent request, never manufacture a new key after an unknown outcome.
  return this.settle(s,op.action,op.id);
 }};
}

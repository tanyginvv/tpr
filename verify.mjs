import assert from 'node:assert/strict';
import './src/math.js';
const M=globalThis.PurchaseMath;
assert.deepEqual(M.demand.map(q=>M.demand.map(d=>M.profit(q,d))),[[10,10,10,10],[-10,20,20,20],[-30,0,30,30],[-50,-20,10,40]]);
assert.deepEqual(M.demand.map(q=>M.expected(q)),[10,15.5,12,-.5]);
assert.equal(M.expected(0),0);assert.equal(M.expected(5),-20.5);
assert.deepEqual(M.demand.map(M.worst),[10,-10,-30,-50]);
assert.deepEqual(M.demand.map(q=>M.demand.map(d=>M.regret(q,d))),[[0,10,20,30],[20,0,10,20],[40,20,0,10],[60,40,20,0]]);
assert.deepEqual(M.demand.map(q=>M.expectedRegret(q)),[16.5,11,14.5,27]);
assert.equal(M.expectedRegret(0),26.5);assert.equal(M.perfectInformation(),26.5);
assert.equal(M.perfectInformation()-Math.max(...M.demand.map(q=>M.expected(q))),11);
assert.deepEqual(M.hodgesLehmann(0).best,[1]);assert.deepEqual(M.hodgesLehmann(1).best,[2]);
assert.deepEqual(M.hodgesLehmann(40/51).best,[1,2]);
assert.throws(()=>M.hodgesLehmann(-.1),RangeError);assert.throws(()=>M.hodgesLehmann(NaN),RangeError);
for(let i=0;i<=1000;i++){const nu=i/1000;assert.deepEqual(M.hodgesLehmann(nu).best,nu<40/51?[1]:[2]);}
const distributions=[[1,0,0,0],[0,0,0,1],[.5,0,.5,0]];
for(let i=0;i<500;i++){const weights=[1+i%7,1+(i*3)%11,1+(i*5)%13,1+(i*7)%17],sum=weights.reduce((a,b)=>a+b);distributions.push(weights.map(v=>v/sum));}
for(const ps of distributions){
 const expected=M.demand.map(q=>M.expected(q,ps)),loss=M.demand.map(q=>M.expectedRegret(q,ps));
 for(let i=0;i<4;i++)assert.ok(Math.abs(expected[i]+loss[i]-M.perfectInformation(ps))<1e-9);
 for(const q of M.hodgesLehmann(1,ps).best)assert.ok(Math.abs(M.expected(q,ps)-Math.max(...expected))<1e-9);
 assert.ok(Math.abs(Math.min(...loss)+Math.max(...expected)-M.perfectInformation(ps))<1e-9);
}
console.log('Verified: profit/loss matrices, expected values, 503 distributions, perfect-information value and 1001 confidence settings.');
await import('./verify-navigation.mjs');

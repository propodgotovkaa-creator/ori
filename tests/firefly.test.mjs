import test from 'node:test';
import assert from 'node:assert/strict';
import {newTrail,advanceTrail,finishFlight,TRAIL,SYLLABLES} from '../firefly.js';
test('only the next light advances; double clicks cannot skip the flight',()=>{const s=newTrail();assert.equal(advanceTrail(s,3),false);assert.ok(advanceTrail(s,1));assert.equal(advanceTrail(s,2),false);assert.equal(finishFlight(s),false);assert.equal(s.step,1);});
test('all four flights complete before release, and a new encounter resets',()=>{const s=newTrail();for(let i=1;i<TRAIL.length;i++){assert.ok(advanceTrail(s,i));assert.equal(finishFlight(s),i===TRAIL.length-1);}assert.ok(s.done);assert.equal(advanceTrail(s,4),false);assert.equal(finishFlight(s),false);assert.deepEqual(newTrail(),{step:0,syllable:'ЛА',moving:false,done:false});assert.deepEqual(SYLLABLES,['ЛА','ЛО','ЛУ']);});

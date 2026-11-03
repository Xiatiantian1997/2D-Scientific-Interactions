/* Syntax and scientific contracts. Runtime event/physics checks are in browser-check.cjs. */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const base=path.join(__dirname,'..'),files=fs.readdirSync(path.join(base,'fragments')).filter(x=>x.endsWith('.html'));
assert.equal(files.length,13);
for(const f of files){const s=fs.readFileSync(path.join(base,'fragments',f),'utf8');for(const m of s.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1],{filename:f});const c=JSON.parse(fs.readFileSync(path.join(base,'contracts',f.replace('.html','.json'))));assert(c.model);assert(s.includes('SciControls.mount(root,{controls:['),f);assert(!/data-play|data-reset-area|type="checkbox"/.test(s),f);}
console.log('PASS: 13 model contracts, scripts and unified host entrypoints');

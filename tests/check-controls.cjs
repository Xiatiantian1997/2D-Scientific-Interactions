const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const s=fs.readFileSync(path.join(__dirname,'../runtime/touch-controls.js'),'utf8');new vm.Script(s);
assert(s.includes('A valid local scope is required'));
assert(!s.includes("key.toLowerCase()==='r'"));
console.log('PASS: shared runtime syntax and scoped reset API');

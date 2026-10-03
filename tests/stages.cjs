const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/questions.js','utf8')+'\n'+fs.readFileSync('dist/app.js','utf8');
function load(storage={}){
 const elements=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){}},setAttribute(){},querySelectorAll(){return[]},addEventListener(){},scrollIntoView(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(id)};
 const ctx=vm.createContext({Intl,console,setTimeout,clearTimeout,document:{getElementById:element,querySelectorAll:()=>[]},localStorage:{getItem:key=>storage[key]??null,setItem:(key,value)=>storage[key]=value}});
 vm.runInContext(source,ctx);return {ctx,storage,elements,run:code=>vm.runInContext(code,ctx)};
}
let game=load();assert.equal(game.run('STAGES.length'),4);assert.equal(game.run('new Set(STAGES.flatMap(s=>s.questions)).size'),20);
assert.throws(()=>game.run('setIndex(5)'),/当前关卡/);
for(let i=0;i<5;i++){game.run(`setIndex(${i});submitGuess(String(QUESTIONS[${i}].min * ${i+1}))`)}
assert.equal(game.run('stageAverage(STAGES[0])'),3);
assert.equal(game.run('state.phase'),'stage-result');assert.equal(game.run('state.unlocked'),0);
game=load(game.storage);assert.equal(game.run('state.phase'),'stage-result');assert.equal(game.run('state.unlocked'),0);
game.elements.get('continue-stage').onclick();assert.equal(game.run('state.unlocked'),1);assert.equal(game.run('state.index'),5);
game.run('submitGuess("123")');game=load(game.storage);assert.equal(game.run('state.index'),5);assert.equal(game.run('Object.keys(state.answers).length'),6);
for(let stage=1;stage<4;stage++){for(let i=stage*5;i<(stage+1)*5;i++)if(game.run(`state.answers[${i}]==null`))game.run(`setIndex(${i});submitGuess(String(QUESTIONS[${i}].min))`);assert.equal(game.run('state.phase'),'stage-result');game.elements.get('continue-stage').onclick()}
assert.equal(game.run('Object.keys(state.answers).length'),20);assert.equal(game.elements.get('summary-dialog').open,true);
const legacy={'youshu-v2':JSON.stringify({currentQuestion:'cloud-water',answers:{'cloud-water':{value:100,revision:1}}})};const migrated=load(legacy);assert.equal(migrated.run('QUESTIONS[state.index].id'),'cloud-water');assert.equal(migrated.run('Object.keys(state.answers).length'),1);
const blocked=load();blocked.ctx.localStorage.setItem=()=>{throw new Error('blocked')};blocked.run('setIndex(0)');assert.match(blocked.elements.get('storage-status').textContent,/无法保存/);
console.log('Passed: four stages, locks, averages, checkpoint reload, continuation, all stages, legacy migration, storage failure.');

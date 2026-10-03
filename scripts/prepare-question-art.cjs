const fs = require('fs');
const path = require('path');
const sharp = require('/Users/LambertLi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '..');
const source = '/tmp/bishu-question-art';
const partial = process.argv.includes('--partial');
const names = ['01-coffee','02-palace','03-sake','04-cloud','05-monkey','06-mosquito','07-venus','08-strawberry','09-robot','10-popcorn','11-beer','12-otter','13-hummingbird','14-brain','15-eye','16-elevator','17-film','18-piano','19-melting-clock','20-cd'];
const motion = {8:'robot',9:'popcorn',10:'beer',14:'eye'};
const overrides = Object.fromEntries(names.map(name=>[name,{source:'artwork/glass-icons/'+name+'.png',name:name+'-glass-v1'}]));
async function main() {
  fs.mkdirSync(path.join(root,'artwork/originals'),{recursive:true});
  fs.mkdirSync(path.join(root,'dist/assets'),{recursive:true});
  const assets = [];
  for (const name of names) {
    const selectedName=overrides[name]?.name||name;
    const png = overrides[name]?path.join(root,overrides[name].source):path.join(source,name+'.png');
    if (!fs.existsSync(png)) {
      if(partial)continue;
      throw new Error('Missing requested artwork: '+name);
    }
    const metadata = await sharp(png).metadata();
    if (!metadata.hasAlpha) throw new Error('Expected transparent asset: '+name);
    fs.copyFileSync(png,path.join(root,'artwork/originals',selectedName+'.png'));
    await sharp(png).resize(512,512,{fit:'inside',withoutEnlargement:true}).webp({quality:85,alphaQuality:95}).toFile(path.join(root,'dist/assets',selectedName+'.webp'));
    assets.push({name,original:'artwork/originals/'+selectedName+'.png',web:'dist/assets/'+selectedName+'.webp'});
  }
  const bank = JSON.parse(fs.readFileSync(path.join(root,'question-bank.json'),'utf8'));
  if (bank.length!==20) throw new Error('Unexpected question count');
  bank.forEach((q,i)=>{
    const selectedName=overrides[names[i]]?.name||names[i];
    if(!fs.existsSync(path.join(root,'dist/assets',selectedName+'.webp')))return;
    q.visual={...q.visual,kind:motion[i]?'motion':'icon',asset:'assets/'+selectedName+'.webp',style:overrides[names[i]]?'translucent-glass':'original soft 3D icon',decorative:true};
    if(motion[i])q.visual.motion=motion[i];
    if(i===11)q.visual.motif='海獭头肩的原创半透明简洁图标；不表示真实毛发密度';
    if(i===18)q.visual.motif='原创融化钟图标；不是达利原作的复制或缩略图，不含尺寸参照';
  });
  fs.writeFileSync(path.join(root,'question-bank.json'),JSON.stringify(bank,null,2)+'\n');
  fs.writeFileSync(path.join(root,'dist/questions.js'),'const QUESTIONS = '+JSON.stringify(bank,null,2)+';\n');
  fs.writeFileSync(path.join(root,'artwork/manifest.json'),JSON.stringify(assets,null,2)+'\n');
  for(const filename of ['prompts.md','prompts.json'])if(fs.existsSync(path.join(source,filename)))fs.copyFileSync(path.join(source,filename),path.join(root,'artwork',filename));
  const localBank=JSON.parse(JSON.stringify(bank));
  localBank.forEach(q=>{if(q.visual?.asset)q.visual.asset='data:image/webp;base64,'+fs.readFileSync(path.join(root,'dist',q.visual.asset)).toString('base64');});
  const js='const QUESTIONS = '+JSON.stringify(localBank)+';\n'+fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
  let html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
  html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+fs.readFileSync(path.join(root,'dist/styles.css'),'utf8')+'</style>')
    .replace('<script src="questions.js" defer></script>','').replace('<script src="app.js" defer></script>','')
    .replace('</body>','<script>'+js.replace(/<\/script/g,'<\\/script')+'</script>\n</body>').replace('href="./"','href="#"');
  for(const filename of ['比数-20题本地试玩.html','有数-20题本地试玩.html'])fs.writeFileSync(path.join(root,'local-preview',filename),html);
  if(partial){console.log('Prepared representative artwork slice: '+assets.length+' finished assets.');return;}
  const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cards=localBank.map((q,i)=>`<figure><img src="${q.visual.asset}" alt="${escape(q.short)}" width="160" height="160"><figcaption><small>${String(i+1).padStart(2,'0')}${motion[i]?' · 网页中带轻动效':''}</small><strong>${escape(q.short)}</strong></figcaption></figure>`).join('');
  const gallery=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>比数 · 20题配图总览</title><style>*{box-sizing:border-box}body{margin:0;padding:40px;font:16px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#243346;background:#e3e9f2}header{max-width:1200px;margin:0 auto 30px}h1{font-size:32px;margin:0 0 8px}p{color:#596c84;margin:0}main{max-width:1200px;margin:auto;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}figure{margin:0;border-radius:24px;border:1px solid #fff;background:#f7f9ff;padding:15px;text-align:center}img{width:100%;height:165px;object-fit:contain}small{display:block;color:#596c84;font-size:12px}strong{display:block;font-size:15px;margin-top:4px}@media(max-width:850px){main{grid-template-columns:repeat(3,minmax(0,1fr))}body{padding:24px}}@media(max-width:500px){main{grid-template-columns:repeat(2,minmax(0,1fr))}img{height:135px}body{padding:16px}}</style><header><h1>比数 · 20题配图</h1><p>蓝白半透明轻玻璃图标 / 原创示意图 / 不展示答案的数量或比例</p></header><main>${cards}</main></html>`;
  fs.writeFileSync(path.join(root,'local-preview/比数-20题配图总览.html'),gallery);
  console.log('Prepared all 20 originals, web assets, quiz metadata, self-contained previews and contact gallery.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});

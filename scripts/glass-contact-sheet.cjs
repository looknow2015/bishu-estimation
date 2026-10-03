const fs=require('fs');
const path=require('path');
const sharp=require('/Users/LambertLi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const bank=JSON.parse(fs.readFileSync(path.join(root,'question-bank.json')));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'artwork/manifest.json')));
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
async function main(){
 const layers=[];
 const cards=bank.map((q,i)=>{const x=40+i%5*304,y=150+Math.floor(i/5)*290;return `<rect x="${x}" y="${y}" width="288" height="270" rx="24" fill="#F4F7FC" stroke="white"/><text x="${x+144}" y="${y+227}" text-anchor="middle" fill="#5B7290" font-size="14">${String(i+1).padStart(2,'0')}</text><text x="${x+144}" y="${y+252}" text-anchor="middle" fill="#26374C" font-size="18">${esc(q.short)}</text>`;}).join('');
 const svg=`<svg width="1600" height="1340" xmlns="http://www.w3.org/2000/svg"><rect width="1600" height="1340" fill="#DFE8F3"/><g font-family="PingFang SC,Arial,sans-serif"><text x="40" y="65" font-size="36" fill="#26374C">比数 · 20 题轻玻璃图标</text><text x="40" y="108" font-size="18" fill="#5B7290">雾蓝渐变 · 乳白边缘 · 半透明质感</text>${cards}</g></svg>`;
 for(let i=0;i<20;i++){const p=path.join(root,manifest[i].web);const buffer=await sharp(p).resize(210,210,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();layers.push({input:buffer,left:79+i%5*304,top:155+Math.floor(i/5)*290});}
 await sharp(Buffer.from(svg)).composite(layers).png().toFile(path.join(root,'local-preview/比数-20题轻玻璃图标总览.png'));
 console.log('Saved full 20-icon contact sheet.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});

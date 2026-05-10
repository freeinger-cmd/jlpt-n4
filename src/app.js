function sh(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function $(id){return document.getElementById(id);}
function tagH(t){const c=TC[t]||TC.tq;return`<span class="c-tag" style="background:${c.bg};color:${c.cl}">${c.l}</span>`;}
function speak(text){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='ja-JP';u.rate=0.85;u.pitch=1;
  const voices=window.speechSynthesis.getVoices();
  const jp=voices.find(v=>v.lang.startsWith('ja'));
  if(jp)u.voice=jp;
  window.speechSynthesis.speak(u);
}
let section='vocab';
let activeTag='all',vMode='flash';
let pool=[...VOCAB],vi=0,vFlipped=false;
let vKnown=new Set(),vForgot=new Set(),vHistory=[];
let qPool=[],qi=0,qAnswered=false;
let kMode='flash',kPool=[],ki=0,kFlipped=false;
let kKnown=new Set(),kForgot=new Set(),kHistory=[];
let kkPool=[],kki=0,kkAnswered=false;
let kmPool=[],kmi=0,kmAnswered=false;
let lPool=[],li=0,lShown=false,lHistory=[];
let lKnown=new Set(),lForgot=new Set();
let gType='te',gi=0,gAnswered=false;
let gPool=[],gKnown=new Set(),gForgot=new Set();
let rTab='vocab';
function save(){
  try{
    localStorage.setItem('n4_vK',JSON.stringify([...vKnown]));
    localStorage.setItem('n4_vF',JSON.stringify([...vForgot]));
    localStorage.setItem('n4_kK',JSON.stringify([...kKnown]));
    localStorage.setItem('n4_kF',JSON.stringify([...kForgot]));
    localStorage.setItem('n4_gK',JSON.stringify([...gKnown]));
    localStorage.setItem('n4_gF',JSON.stringify([...gForgot]));
    localStorage.setItem('n4_lK',JSON.stringify([...lKnown]));
    localStorage.setItem('n4_lF',JSON.stringify([...lForgot]));
  }catch(e){}
}
function load(){
  try{
    const vk=localStorage.getItem('n4_vK');if(vk)vKnown=new Set(JSON.parse(vk));
    const vf=localStorage.getItem('n4_vF');if(vf)vForgot=new Set(JSON.parse(vf));
    const kk=localStorage.getItem('n4_kK');if(kk)kKnown=new Set(JSON.parse(kk));
    const kf=localStorage.getItem('n4_kF');if(kf)kForgot=new Set(JSON.parse(kf));
    const gk=localStorage.getItem('n4_gK');if(gk)gKnown=new Set(JSON.parse(gk));
    const gf=localStorage.getItem('n4_gF');if(gf)gForgot=new Set(JSON.parse(gf));
    const lk=localStorage.getItem('n4_lK');if(lk)lKnown=new Set(JSON.parse(lk));
    const lf=localStorage.getItem('n4_lF');if(lf)lForgot=new Set(JSON.parse(lf));
  }catch(e){}
}
function resetAll(){
  if(!confirm('確定要重置所有進度嗎？'))return;
  [vKnown,vForgot,kKnown,kForgot,gKnown,gForgot,lKnown,lForgot].forEach(s=>s.clear());
  vHistory=[];kHistory=[];lHistory=[];
  vi=0;ki=0;gi=0;li=0;
  try{localStorage.clear();}catch(e){}
  updateVStats();updateKStats();updateGStats();updateLStats();
  renderCard();renderKanaCard();renderReview();
}
function setSection(s){
  section=s;
  document.querySelectorAll('.section').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  $('s-'+s).classList.add('active');
  $('n-'+s).classList.add('active');
  if(s==='listen'){lPool=sh([...pool]);li=0;lShown=false;lHistory=[];renderListen();}
  if(s==='grammar'){buildGPool();renderGTabs();renderGrammar();}
  if(s==='review')renderReview();
  if(s==='kana'){buildKPool();renderKanaCard();}
}
function buildPool(){
  pool=activeTag==='all'?[...VOCAB]:VOCAB.filter(w=>w.tag===activeTag);
  vi=0;vFlipped=false;vHistory=[];
  $('vocab-count').textContent=pool.length+' 個';
  updateVStats();
}
function renderFTags(){
  const tags=['all',...Object.keys(TC)];
  $('ftags').innerHTML=tags.map(t=>{
    if(t==='all')return`<button class="ftag ${activeTag==='all'?'on':''}" onclick="setTag('all')">全部(${VOCAB.length})</button>`;
    const cnt=VOCAB.filter(w=>w.tag===t).length;
    return`<button class="ftag ${activeTag===t?'on':''}" onclick="setTag('${t}')">${TC[t].l}(${cnt})</button>`;
  }).join('');
}
function setTag(t){
  activeTag=t;buildPool();renderFTags();
  if(vMode==='flash'){vKnown.clear();vForgot.clear();renderCard();}
  else{qPool=sh([...pool]);qi=0;renderQCard();}
  lPool=sh([...pool]);li=0;
}
function setVMode(m){
  vMode=m;
  ['flash','quiz'].forEach(x=>{
    $('vm-'+x+'-div').style.display=x===m?'block':'none';
    $('vm-'+x).classList.toggle('active',x===m);
  });
  if(m==='flash'){vi=0;vFlipped=false;vKnown.clear();vForgot.clear();vHistory=[];updateVStats();renderCard();}
  else{qPool=sh([...pool]);qi=0;qAnswered=false;renderQCard();}
}
function renderCard(){
  const prevBtn=$('v-prev');
  if(prevBtn)prevBtn.style.opacity=vi===0?'0.3':'1';
  if(vi>=pool.length){
    $('cfront').innerHTML=`<div class="c-jp" style="font-size:48px">🎉</div><div class="c-rd" style="margin-top:0.5rem">這批全部完成！</div><div style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:0.5rem">去「複習清單」看需要加強的</div>`;
    $('cback').innerHTML='';
    $('vact').style.display='none';$('vflip').style.display='none';
    $('vhint').style.display='none';$('vcnt').textContent=`${pool.length} / ${pool.length}`;return;
  }
  const w=pool[vi];vFlipped=false;
  $('ci').classList.remove('flipped');
  $('vact').style.display='none';$('vflip').style.display='flex';$('vhint').style.display='block';
  $('vcnt').textContent=`${vi+1} / ${pool.length}`;
  $('cfront').innerHTML=`${tagH(w.tag)}<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:0.5rem">這個讀音是哪個漢字？</div><div class="c-jp" style="font-size:38px;letter-spacing:4px">${w.rd}</div><div style="font-size:11px;color:rgba(255,255,255,0.15);margin-top:1rem">點擊翻面確認漢字</div>`;
  $('cback').innerHTML=`${tagH(w.tag)}<div class="c-jp" style="font-size:26px">${w.jp}</div><div class="c-rd">${w.rd}</div><div class="c-mn">${w.mn}</div><div class="mem-box"><div class="mem-label">記憶技巧</div><div class="mem-text">${w.mem}</div></div><div class="ex-text">例：${w.ex}</div>`;
}
function flipCard(){
  vFlipped=!vFlipped;$('ci').classList.toggle('flipped',vFlipped);
  if(vFlipped){$('vact').style.display='flex';$('vflip').style.display='none';$('vhint').style.display='none';}
}
function vAns(ok){
  vHistory.push({idx:vi,ok});
  if(ok)vKnown.add(vi);else vForgot.add(vi);
  vi++;updateVStats();save();renderCard();
}
function vPrev(){
  if(vi===0)return;
  const last=vHistory.pop();
  if(last){if(last.ok)vKnown.delete(last.idx);else vForgot.delete(last.idx);}
  vi--;vFlipped=false;updateVStats();renderCard();
}
function updateVStats(){
  const t=vKnown.size+vForgot.size;
  $('sv-t').textContent=t;$('sv-k').textContent=vKnown.size;$('sv-f').textContent=vForgot.size;
  $('vp').style.width=Math.round((t/Math.max(pool.length,1))*100)+'%';
}
function speakCurrent(){if(vi<pool.length)speak(pool[vi].rd);}
function renderQCard(){
  if(qi>=qPool.length){$('qbox').innerHTML=`<div class="empty-state">🎊 完成！答對 ${vKnown.size}/${qPool.length}</div><button class="next-btn" onclick="qPool=sh([...pool]);qi=0;vKnown.clear();vForgot.clear();renderQCard()">再做一次</button>`;return;}
  const w=qPool[qi];
  const others=pool.filter(v=>v.jp!==w.jp);sh(others);
  const opts=sh([w,...others.slice(0,3)]);
  qAnswered=false;
  $('qbox').innerHTML=`<div class="q-word">${w.jp}</div><div class="q-sub">${w.rd} の意思は？</div><div class="q-opts">${opts.map(o=>`<button class="q-opt" onclick="checkVQ(this,'${o.mn.replace(/'/g,"\\'")}','${w.mn.replace(/'/g,"\\'")}'">${o.mn}</button>`).join('')}</div><div id="qr"></div><button class="next-btn" id="qn" style="display:none" onclick="qi++;renderQCard()">下一題 →</button>`;
}
function checkVQ(el,ch,co){
  if(qAnswered)return;qAnswered=true;
  const w=qPool[qi];
  document.querySelectorAll('#qbox .q-opt').forEach(b=>b.disabled=true);
  if(ch===co){el.classList.add('ok');vKnown.add(qi);$('qr').innerHTML=`<div class="q-res ok">✅ 正確！${w.mem}</div>`;}
  else{el.classList.add('ng');vForgot.add(qi);document.querySelectorAll('#qbox .q-opt').forEach(b=>{if(b.textContent===co)b.classList.add('ok');});$('qr').innerHTML=`<div class="q-res ng">❌ 答錯。正確：${co}<br>${w.mem}</div>`;}
  $('qn').style.display='block';updateVStats();save();
}
function buildKPool(){kPool=sh([...VOCAB]);ki=0;kFlipped=false;kHistory=[];kKnown.clear();kForgot.clear();updateKStats();}
function setKMode(m){
  kMode=m;
  ['flash','kanji','meaning'].forEach(x=>{
    $('km-'+x+'-div').style.display=x===m?'block':'none';
    $('km-'+x).classList.toggle('active',x===m);
  });
  if(m==='flash'){ki=0;kFlipped=false;kHistory=[];kKnown.clear();kForgot.clear();updateKStats();renderKanaCard();}
  if(m==='kanji'){kkPool=sh([...VOCAB]);kki=0;kkAnswered=false;renderKanjiQuiz();}
  if(m==='meaning'){kmPool=sh([...VOCAB]);kmi=0;kmAnswered=false;renderMeaningQuiz();}
}
function renderKanaCard(){
  if(ki>=kPool.length){
    $('kfront').innerHTML=`<div class="c-jp" style="font-size:48px">🎉</div><div class="c-rd">全部完成！</div>`;
    $('kback').innerHTML='';
    $('kact').style.display='none';$('kflip').style.display='none';
    $('khint').style.display='none';$('kcnt').textContent=`${kPool.length}/${kPool.length}`;return;
  }
  const w=kPool[ki];kFlipped=false;
  $('kci').classList.remove('flipped');
  $('kact').style.display='none';$('kflip').style.display='flex';$('khint').style.display='block';
  $('kcnt').textContent=`${ki+1} / ${kPool.length}`;
  $('kfront').innerHTML=`<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:0.5rem">這個讀音對應哪個漢字？</div><div class="c-jp" style="font-size:42px;letter-spacing:4px">${w.rd}</div><div style="font-size:11px;color:rgba(255,255,255,0.15);margin-top:1rem">點擊翻面確認漢字</div>`;
  $('kback').innerHTML=`${tagH(w.tag)}<div class="c-jp" style="font-size:30px">${w.jp}</div><div class="c-rd">${w.rd}</div><div class="c-mn">${w.mn}</div><div class="mem-box"><div class="mem-label">記憶技巧</div><div class="mem-text">${w.mem}</div></div><div class="ex-text">例：${w.ex}</div>`;
}
function flipKana(){
  kFlipped=!kFlipped;$('kci').classList.toggle('flipped',kFlipped);
  if(kFlipped){$('kact').style.display='flex';$('kflip').style.display='none';$('khint').style.display='none';}
}
function kAns(ok){
  kHistory.push({idx:ki,ok});
  if(ok)kKnown.add(ki);else kForgot.add(ki);
  ki++;updateKStats();save();renderKanaCard();
}
function kPrev(){
  if(ki===0)return;
  const last=kHistory.pop();
  if(last){if(last.ok)kKnown.delete(last.idx);else kForgot.delete(last.idx);}
  ki--;kFlipped=false;updateKStats();renderKanaCard();
}
function updateKStats(){
  const t=kKnown.size+kForgot.size;
  $('sk-t').textContent=t;$('sk-k').textContent=kKnown.size;$('sk-f').textContent=kForgot.size;
  $('kp').style.width=Math.round((t/Math.max(kPool.length,1))*100)+'%';
}
function speakKana(){if(ki<kPool.length)speak(kPool[ki].rd);}
function renderKanjiQuiz(){
  if(kki>=kkPool.length){$('kquiz-kanji').innerHTML=`<div class="empty-state">🎊 完成！答對 ${kKnown.size}/${kkPool.length}</div><button class="next-btn" onclick="kkPool=sh([...VOCAB]);kki=0;kKnown.clear();kForgot.clear();renderKanjiQuiz()">再做一次</button>`;return;}
  const w=kkPool[kki];
  const others=VOCAB.filter(v=>v.jp!==w.jp);sh(others);
  const opts=sh([w,...others.slice(0,3)]);
  kkAnswered=false;
  $('kquiz-kanji').innerHTML=`<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:0.5rem">這個平假名對應哪個漢字？</div><div class="q-word" style="font-size:34px;letter-spacing:4px">${w.rd}</div><div class="q-sub">${w.mn}</div><div class="q-opts">${opts.map(o=>`<button class="q-opt" onclick="checkKKQ(this,'${o.jp.replace(/'/g,"\\'")}','${w.jp.replace(/'/g,"\\'")}'">${o.jp}</button>`).join('')}</div><div id="kkr"></div><button class="next-btn" id="kkn" style="display:none" onclick="kki++;renderKanjiQuiz()">下一題 →</button>`;
}
function checkKKQ(el,ch,co){
  if(kkAnswered)return;kkAnswered=true;
  const w=kkPool[kki];
  document.querySelectorAll('#kquiz-kanji .q-opt').forEach(b=>b.disabled=true);
  if(ch===co){el.classList.add('ok');kKnown.add(kki);$('kkr').innerHTML=`<div class="q-res ok">✅ 正確！${w.rd} = ${w.jp}（${w.mn}）</div>`;}
  else{el.classList.add('ng');kForgot.add(kki);document.querySelectorAll('#kquiz-kanji .q-opt').forEach(b=>{if(b.textContent===co)b.classList.add('ok');});$('kkr').innerHTML=`<div class="q-res ng">❌ 答錯。正確：${co}（${w.mn}）<br>${w.mem}</div>`;}
  $('kkn').style.display='block';updateKStats();save();
}
function renderMeaningQuiz(){
  if(kmi>=kmPool.length){$('kquiz-meaning').innerHTML=`<div class="empty-state">🎊 完成！答對 ${kKnown.size}/${kmPool.length}</div><button class="next-btn" onclick="kmPool=sh([...VOCAB]);kmi=0;kKnown.clear();kForgot.clear();renderMeaningQuiz()">再做一次</button>`;return;}
  const w=kmPool[kmi];
  const others=VOCAB.filter(v=>v.jp!==w.jp);sh(others);
  const opts=sh([w,...others.slice(0,3)]);
  kmAnswered=false;
  $('kquiz-meaning').innerHTML=`<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:0.5rem">這個平假名是什麼意思？</div><div class="q-word" style="font-size:34px;letter-spacing:4px">${w.rd}</div><div class="q-sub" style="color:rgba(255,255,255,0.4)">${w.jp}</div><div class="q-opts">${opts.map(o=>`<button class="q-opt" onclick="checkKMQ(this,'${o.mn.replace(/'/g,"\\'")}','${w.mn.replace(/'/g,"\\'")}'">${o.mn}</button>`).join('')}</div><div id="kmr"></div><button class="next-btn" id="kmn" style="display:none" onclick="kmi++;renderMeaningQuiz()">下一題 →</button>`;
}
function checkKMQ(el,ch,co){
  if(kmAnswered)return;kmAnswered=true;
  const w=kmPool[kmi];
  document.querySelectorAll('#kquiz-meaning .q-opt').forEach(b=>b.disabled=true);
  if(ch===co){el.classList.add('ok');kKnown.add(kmi);$('kmr').innerHTML=`<div class="q-res ok">✅ 正確！${w.rd} = ${w.jp}（${w.mn}）</div>`;}
  else{el.classList.add('ng');kForgot.add(kmi);document.querySelectorAll('#kquiz-meaning .q-opt').forEach(b=>{if(b.textContent===co)b.classList.add('ok');});$('kmr').innerHTML=`<div class="q-res ng">❌ 答錯。正確：${co}<br>${w.mem}</div>`;}
  $('kmn').style.display='block';updateKStats();save();
}
function renderListen(){
  if(li>=lPool.length){
    $('lcard').innerHTML=`<div class="listen-num">完成！</div><div class="listen-icon">🎊</div><p class="listen-hint">答對 ${lKnown.size}/${lPool.length}</p><button class="play-btn" onclick="li=0;lKnown.clear();lForgot.clear();lHistory=[];lPool=sh([...VOCAB]);renderListen()">再來一次</button>`;
    $('lact').style.display='none';$('lplay').style.display='none';return;
  }
  const w=lPool[li];
  $('lnum').textContent=`${li+1} / ${lPool.length}`;
  $('lreveal').style.display='none';
  $('lact').style.display='none';$('lplay').style.display='flex';
  $('lcard').querySelector('.listen-hint').textContent='按下播放，聽發音猜單字';
  updateLStats();
}
function playListen(){if(li<lPool.length)speak(lPool[li].rd);}
function showListen(){
  const w=lPool[li];
  $('lreveal').style.display='block';
  $('lreveal').innerHTML=`<div class="l-jp">${w.jp}</div><div class="l-rd">${w.rd}</div><div class="l-mn">${w.mn}</div>`;
  $('lact').style.display='flex';$('lplay').style.display='none';
}
function lAns(ok){
  lHistory.push({idx:li,ok});
  if(ok)lKnown.add(li);else lForgot.add(li);
  li++;updateLStats();save();renderListen();
}
function lPrev(){
  if(li===0)return;
  const last=lHistory.pop();
  if(last){if(last.ok)lKnown.delete(last.idx);else lForgot.delete(last.idx);}
  li--;updateLStats();renderListen();
}
function updateLStats(){
  const t=lKnown.size+lForgot.size;
  $('sl-t').textContent=t;$('sl-k').textContent=lKnown.size;$('sl-f').textContent=lForgot.size;
  $('lp').style.width=Math.round((t/Math.max(lPool.length,1))*100)+'%';
}
function buildGPool(){gPool=sh(GRAMMAR_Q.filter(q=>q.type===gType));gi=0;gKnown.clear();gForgot.clear();updateGStats();}
function renderGTabs(){
  $('gtabs').innerHTML=Object.entries(GRAMMAR_TYPES).map(([k,v])=>`<button class="g-tab ${gType===k?'active':''}" onclick="setGType('${k}')">${v.name}</button>`).join('');
}
function setGType(t){gType=t;buildGPool();renderGTabs();$('grule').innerHTML=GRAMMAR_TYPES[t].rule;renderGrammar();}
function renderGrammar(){
  if(gi>=gPool.length){$('gbox').innerHTML=`<div class="empty-state">🎊 完成！答對 ${gKnown.size}/${gPool.length}</div><button class="next-btn" onclick="buildGPool();renderGrammar()">再做一次</button>`;return;}
  const q=gPool[gi];gAnswered=false;
  const gLabel=q.g===0?'い形容詞':`グループ${q.g}`;
  $('gbox').innerHTML=`<div class="g-question">${q.base}</div><div class="g-type-label">${GRAMMAR_TYPES[gType].name}に変えてください（${gLabel}）</div><input class="g-input" id="ginput" placeholder="ここに入力..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/><button class="g-submit" onclick="checkG()">確認答案</button><div id="gres"></div><button class="next-btn" id="gnext" style="display:none" onclick="gi++;renderGrammar()">次の問題 →</button>`;
  setTimeout(()=>{const el=$('ginput');if(el){el.focus();el.addEventListener('keydown',e=>{if(e.key==='Enter')checkG();});}},100);
  updateGStats();
}
function checkG(){
  if(gAnswered)return;
  const inp=$('ginput');if(!inp)return;
  const val=inp.value.trim();if(!val)return;
  gAnswered=true;inp.disabled=true;
  const q=gPool[gi];
  if(val===q.ans){gKnown.add(gi);$('gres').innerHTML=`<div class="g-res ok">✅ 正確！${q.base} → ${q.ans}</div>`;}
  else{gForgot.add(gi);$('gres').innerHTML=`<div class="g-res ng">❌ 答錯。正確：<strong>${q.ans}</strong></div>`;}
  $('gnext').style.display='block';updateGStats();save();
}
function updateGStats(){
  const t=gKnown.size+gForgot.size;
  $('sg-t').textContent=t;$('sg-k').textContent=gKnown.size;$('sg-f').textContent=gForgot.size;
  $('gp').style.width=Math.round((t/Math.max(gPool.length,1))*100)+'%';
}
function setRTab(t){
  rTab=t;
  ['vocab','kana','grammar'].forEach(x=>{
    $('rv-'+x).style.display=x===t?'block':'none';
    $('rt-'+x).classList.toggle('active',x===t);
  });
}
function renderReview(){
  const vlist=[...vForgot].map(i=>pool[i]).filter(Boolean);
  $('rv-vocab').innerHTML=vlist.length===0?`<div class="empty-state">🎉 沒有需要複習的單字！</div>`:vlist.map(w=>`<div class="rev-item"><div class="rev-row">${tagH(w.tag)}<span class="rev-jp">${w.jp}</span><span class="rev-rd">${w.rd}</span><button class="rev-speak" onclick="speak('${w.rd}')">🔊</button></div><div class="rev-mn">${w.mn}</div><div class="mem-box"><div class="mem-label">記憶技巧</div><div class="mem-text">${w.mem}</div></div></div>`).join('');
  const klist=[...kForgot].map(i=>kPool[i]).filter(Boolean);
  $('rv-kana').innerHTML=klist.length===0?`<div class="empty-state">🎉 沒有需要複習的假名！</div>`:klist.map(w=>`<div class="rev-item"><div class="rev-row"><span class="rev-jp" style="font-size:20px;letter-spacing:2px">${w.rd}</span><button class="rev-speak" onclick="speak('${w.rd}')">🔊</button></div><div style="font-size:17px;font-weight:700;margin-bottom:4px;font-family:'Noto Serif JP',serif">${w.jp}</div><div class="rev-mn">${w.mn}</div><div class="mem-box"><div class="mem-label">記憶技巧</div><div class="mem-text">${w.mem}</div></div></div>`).join('');
  const glist=[...gForgot].map(i=>gPool[i]).filter(Boolean);
  $('rv-grammar').innerHTML=glist.length===0?`<div class="empty-state">🎉 沒有需要複習的文法！</div>`:glist.map(q=>`<div class="rev-item"><div class="rev-row"><span class="rev-jp" style="font-size:20px">${q.base}</span><span style="font-size:12px;color:rgba(255,255,255,0.35)">${GRAMMAR_TYPES[q.type]?.name}</span></div><div class="rev-ans">${q.base} → <strong>${q.ans}</strong></div></div>`).join('');
}
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();deferredPrompt=e;
  const b=document.createElement('div');
  b.className='install-banner';
  b.innerHTML=`<div class="install-text"><strong>加到主畫面</strong>像App一樣使用，可離線學習</div><button class="install-yes" onclick="installApp()">安裝</button><button class="install-no" onclick="this.parentElement.remove()">✕</button>`;
  document.body.appendChild(b);
});
function installApp(){
  if(!deferredPrompt)return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(()=>{deferredPrompt=null;document.querySelector('.install-banner')?.remove();});
}
load();
renderFTags();
buildPool();
renderCard();
$('grule').innerHTML=GRAMMAR_TYPES['te'].rule;
renderGTabs();
buildGPool();
buildKPool();
lPool=sh([...VOCAB]);
if(window.speechSynthesis){window.speechSynthesis.getVoices();window.speechSynthesis.onvoiceschanged=()=>{};}

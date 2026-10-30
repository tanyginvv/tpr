import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Execute the actual browser controller with a small event/DOM adapter. This
// lets repeat events and pending animation frames be tested deterministically.
function mount(initialHash='') {
  const ids=new Map(), roots=new Map(), documentListeners=new Map(), windowListeners=new Map(), frames=[];
  let document;
  class Element {
    constructor(tag='div',attributes={},parent=null){
      this.tagName=tag.toUpperCase();this.attributes={...attributes};this.id=attributes.id??'';
      this.parent=parent;this.children=[];this.dataset={};this.style={};this.listeners=new Map();
      this.textContent='';this.html='';this.writes=0;this.scrollLeft=0;this.scrollTop=0;this.focusCalls=0;
      this.value=attributes.value??'';this.disabled=false;
      for(const [key,value] of Object.entries(attributes))if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;
      const classes=new Set((attributes.class??'').split(/\s+/));
      this.classList={remove:c=>classes.delete(c),toggle:c=>{if(classes.has(c)){classes.delete(c);return false;}classes.add(c);return true;},contains:c=>classes.has(c)};
      if(this.id)ids.set(this.id,this);
    }
    set innerHTML(value){
      this.writes++;
      if(document?.activeElement!==this&&this.contains(document?.activeElement))document.activeElement=document.body;
      for(const child of this.children)if(child.id&&ids.get(child.id)===child)ids.delete(child.id);
      this.html=value;this.children=[];
      for(const match of value.matchAll(/<([a-z][a-z0-9]*)(\s[^<>]*?)?>/gi)){
        const attrs={};for(const a of (match[2]??'').matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];
        const child=new Element(match[1],attrs,this);child.disabled=/\sdisabled(?:\s|$)/.test(match[2]??'');this.children.push(child);
      }
    }
    get innerHTML(){return this.html;}
    contains(element){return !!element&&(element===this||element.parent===this);}
    matches(selectors){return selectors.split(',').some(selector=>{
      const s=selector.trim();
      if(s.startsWith('#'))return this.id===s.slice(1);
      if(s.startsWith('.'))return this.classList.contains(s.slice(1));
      if(s.startsWith('[')){const a=s.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);return !!a&&a[1] in this.attributes&&(a[2]===undefined||this.attributes[a[1]]===a[2]);}
      return this.tagName.toLowerCase()===s;
    });}
    closest(selector){return this.matches(selector)?this:this.parent?.closest(selector)??null;}
    querySelector(selector){return this.querySelectorAll(selector)[0]??null;}
    querySelectorAll(selector){return this.children.filter(child=>child.matches(selector));}
    addEventListener(type,callback){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(callback);}
    setAttribute(key,value){this.attributes[key]=String(value);}
    getAttribute(key){return this.attributes[key]??null;}
    focus(){this.focusCalls++;document.activeElement=this;}
  }
  document={activeElement:null,body:new Element('body'),fullscreenElement:null,
    querySelector(selector){if(selector.startsWith('#'))return ids.get(selector.slice(1))??null;return roots.get(selector)??null;},
    addEventListener(type,callback){if(!documentListeners.has(type))documentListeners.set(type,[]);documentListeners.get(type).push(callback);}};
  for(const id of ['stageContent','stageTitle','stageIntro','stageNav','sectionLabel','stageCounter','overallProgress','stepDots','stepCaption','stepHint','announcer','main','sidebar'])new Element('div',{id});
  for(const id of ['next','prev','revealAll','menuToggle','present'])new Element('button',{id});
  roots.set('.skip',new Element('a'));
  document.activeElement=document.body;
  const location={hash:initialHash}, entries=[initialHash];let cursor=0;
  const emitWindow=type=>{for(const f of windowListeners.get(type)??[])f({type});};
  const history={
    scrollRestoration:'auto',
    replaceState(_state,_title,hash){location.hash=hash;entries[cursor]=hash;},
    pushState(_state,_title,hash){location.hash=hash;entries.splice(++cursor);entries.push(hash);},
    back(){if(cursor>0){location.hash=entries[--cursor];emitWindow('popstate');emitWindow('hashchange');}},
    forward(){if(cursor+1<entries.length){location.hash=entries[++cursor];emitWindow('popstate');emitWindow('hashchange');}}
  };
  const window={scrollX:0,scrollY:0,scrollTo({left=this.scrollX,top=this.scrollY}){this.scrollX=left;this.scrollY=top;},addEventListener(type,callback){if(!windowListeners.has(type))windowListeners.set(type,[]);windowListeners.get(type).push(callback);}};
  const context=vm.createContext({document,window,location,history,URLSearchParams,Intl,console,requestAnimationFrame:f=>frames.push(f),matchMedia:()=>({matches:true})});
  vm.runInContext(fs.readFileSync(new URL('./src/math.js',import.meta.url),'utf8'),context);
  vm.runInContext(fs.readFileSync(new URL('./src/app.js',import.meta.url),'utf8'),context);
  function dispatch(type,target,extra={}){
    const event={type,target,detail:1,repeat:false,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...extra};
    for(const f of target.listeners.get(type)??[])f(event);
    for(const f of documentListeners.get(type)??[])f(event);
    return event;
  }
  function action(action,value,extra={}){
    const target=new Element('button',{'data-action':action,...(value!==undefined?{'data-value':String(value)}:{}),...extra},ids.get('stageContent'));
    target.focus();dispatch('click',target);return target;
  }
  return {ids,document,window,history,location,Element,dispatch,action,
    click:id=>dispatch('click',ids.get(id)),
    go:(stage,step=0)=>{action('goto',stage);if(step)action('step',step);},
    phase:()=>location.hash,
    frame:()=>{const f=frames.shift();if(f)f();},
    finish:()=>{let n=0;while(frames.length){assert.ok(++n<1000,'animation must finish');frames.shift()();}}
  };
}

const h=mount();
h.go(1);h.action('prob',3);assert.equal(h.phase(),'#stage=2&step=1');
h.go(2);const q=h.action('q',3);h.dispatch('keydown',q,{key:'ArrowRight'});assert.equal(h.phase(),'#stage=3&step=1');
h.dispatch('keydown',h.document.body,{key:'ArrowRight',repeat:true});assert.equal(h.phase(),'#stage=3&step=1');
h.dispatch('keydown',h.document.body,{key:'ArrowRight'});assert.equal(h.phase(),'#stage=3&step=2');
h.dispatch('click',h.ids.get('next'),{detail:2});assert.equal(h.phase(),'#stage=3&step=2');
h.history.back();assert.equal(h.phase(),'#stage=3&step=1');
h.history.forward();assert.equal(h.phase(),'#stage=3&step=2');
h.action('q',0);h.go(3);h.action('matrix',undefined,{'data-q':'4','data-d':'1'});h.go(2);
assert.match(h.ids.get('stageContent').innerHTML,/class="choice selected"[^>]*data-action="q"[^>]*data-value="0"/);
h.go(5,1);h.action('loss',4);assert.equal(h.phase(),'#stage=6&step=2');
assert.match(h.ids.get('stageContent').innerHTML,/r\(4,1\) = 10 − \(−50\) = (?:<strong>)?60 руб/);
h.go(6,3);const range=h.ids.get('days'),writes=h.ids.get('stageContent').writes;
range.focus();range.value='12';h.dispatch('input',range);
assert.equal(h.ids.get('days'),range);assert.equal(h.ids.get('stageContent').writes,writes);
assert.equal(h.ids.get('daysIncome').textContent,'186,00 руб.');
const sequence=[3,4,5,3,5,5,5,5,2,3].flatMap((n,stage)=>Array.from({length:n},(_,step)=>'#stage='+(stage+1)+'&step='+(step+1)));
h.go(0);
for(let i=0;i<sequence.length;i++){
 assert.equal(h.phase(),sequence[i]);
 if(i<sequence.length-1)h.click('next');
}
for(let i=sequence.length-1;i>=0;i--){assert.equal(h.phase(),sequence[i]);if(i)h.click('prev');}
for(const hash of ['#stage=2.5&step=1.5','#stage=999&step=-20','#stage=NaN&step=Infinity'])assert.match(mount(hash).phase(),/^#stage=\d+&step=\d+$/);
for(const stage of [4,5,6,7]){
 h.go(stage,4);const html=h.ids.get('stageContent').innerHTML;
 assert.match(html,/Краткая суть метода/);assert.match(html,/Вычислительная сложность/);assert.match(html,/book-citation/);
}
h.go(4,3);assert.match(h.ids.get('stageContent').innerHTML,/E4 = −50 × 0,15 − 20 × 0,30 \+ 10 × 0,30 \+ 40 × 0,25/);
h.go(5,3);const loss=h.ids.get('stageContent').innerHTML;
assert.match(loss,/min\(16,50; 11,00; 14,50; 27,00\)/);assert.match(loss,/26,50 − 15,50 = <strong>11 руб/);
h.go(7,3);const confidence=h.ids.get('confidence'),hlWrites=h.ids.get('stageContent').writes;
confidence.focus();confidence.value='75';h.dispatch('input',confidence);
assert.equal(h.ids.get('confidence'),confidence);assert.equal(h.ids.get('stageContent').writes,hlWrites);
assert.equal(h.ids.get('hlBest').textContent,'q = 1');assert.equal(h.phase(),'#stage=8&step=4');
h.dispatch('keydown',confidence,{key:'ArrowRight'});assert.equal(h.phase(),'#stage=8&step=4');
h.action('confidence',40/51);assert.match(h.ids.get('stageContent').innerHTML,/q = 1 и q = 2/);assert.equal(h.phase(),'#stage=8&step=4');
h.go(8,1);assert.match(h.ids.get('stageContent').innerHTML,/Четыре подхода из учебников/);assert.match(h.ids.get('stageContent').innerHTML,/Peterson M/);
assert.equal((h.ids.get('stageNav').innerHTML.match(/class="nav-item/g)??[]).length,10);
h.go(9,2);h.click('next');assert.equal(h.phase(),'#stage=1&step=1');
console.log('Verified: 40 steps, history, keyboard/double-click guards, both sliders and four textbook approaches.');

const scrolling=mount();
assert.equal(scrolling.history.scrollRestoration,'manual');
scrolling.go(6,1);
const mainFocusCalls=scrolling.ids.get('main').focusCalls;
scrolling.window.scrollX=12;scrolling.window.scrollY=640;
scrolling.ids.get('next').focus();scrolling.click('next');
assert.equal(scrolling.phase(),'#stage=7&step=3');
assert.equal(scrolling.window.scrollY,640,'next step must preserve vertical position');
assert.equal(scrolling.window.scrollX,12,'next step must preserve horizontal position');
assert.equal(scrolling.document.activeElement,scrolling.ids.get('next'),'next button must retain focus');
assert.equal(scrolling.ids.get('main').focusCalls,mainFocusCalls,'step changes must not focus the top of the page');
scrolling.click('prev');assert.equal(scrolling.window.scrollY,640);
scrolling.dispatch('keydown',scrolling.document.body,{key:'ArrowRight'});assert.equal(scrolling.window.scrollY,640);
scrolling.action('step',1);assert.equal(scrolling.window.scrollY,640);
scrolling.click('revealAll');assert.equal(scrolling.window.scrollY,640);
scrolling.click('revealAll');assert.equal(scrolling.window.scrollY,640);
scrolling.history.back();assert.equal(scrolling.window.scrollY,640);
scrolling.history.forward();assert.equal(scrolling.window.scrollY,640);
scrolling.go(7);assert.equal(scrolling.window.scrollY,0,'new section must begin at the top');
assert.equal(scrolling.window.scrollX,0);
scrolling.window.scrollY=500;scrolling.history.back();
assert.equal(scrolling.window.scrollY,0,'history crossing a section boundary must show its beginning');
console.log('Verified scroll preservation for buttons, keyboard, step indicators, reveal/collapse and same-section history; new sections start at the top.');

// Definitions follow the concrete example and precede symbolic calculations.
const lesson=mount();lesson.go(5);
let lessonHTML=lesson.ids.get('stageContent').innerHTML;
assert.ok(lessonHTML.includes('Фактический убыток — 10 руб.'));
assert.ok(!lessonHTML.includes('<dt>b(D)</dt>'));
lesson.click('next');lessonHTML=lesson.ids.get('stageContent').innerHTML;
assert.ok(lessonHTML.indexOf('profit-comparison')<lessonHTML.indexOf('<dt>b(D)</dt>'));
lesson.action('lossCell',undefined,{'data-q':'4','data-d':'3'});
assert.equal(lesson.phase(),'#stage=6&step=2');
assert.match(lesson.ids.get('stageContent').innerHTML,/r\(4,3\) = 30 − \(10\) = 20 руб/);
lesson.go(6,1);lessonHTML=lesson.ids.get('stageContent').innerHTML;
assert.ok(lessonHTML.indexOf('symbol-strip')<lessonHTML.indexOf('Vₜ(0) = max'));
assert.equal(lesson.ids.get('stepHint').textContent,'Что означают V и индексы');
for(let chapter=0;chapter<10;chapter++){lesson.go(chapter);assert.ok(!/NaN|undefined/.test(lesson.ids.get('stageContent').innerHTML));}
console.log('Verified explanation order, interactive regret cells and descriptive step captions.');

const textbook=mount();
for(let stage=0;stage<10;stage++){textbook.go(stage,99);assert.ok(!/Монте-Карло|Предельный анализ|Критическая вероятность|Дополнительный источник/.test(textbook.ids.get('stageContent').innerHTML));}
assert.ok(!/Монте-Карло|Предельный анализ|Критическая вероятность/.test(textbook.ids.get('stageNav').innerHTML));
console.log('Verified removal of supplementary methods from every section.');

const complexityLesson=mount();
for(const stage of [4,5,6,7]){
 complexityLesson.go(stage,3);
 assert.ok(!complexityLesson.ids.get('stageContent').innerHTML.includes('class="method-evaluation"'));
 complexityLesson.click('next');
 const html=complexityLesson.ids.get('stageContent').innerHTML;
 assert.equal(complexityLesson.phase(),'#stage='+(stage+1)+'&step=5');
 assert.equal(complexityLesson.ids.get('stepHint').textContent,'Сложность и сравнение с перебором');
 const visibleHTML=html.replace(/<details\b[\s\S]*?<\/details>/g,'');
 assert.match(visibleHTML,/class="method-evaluation"/);
 assert.match(html,/m — число вариантов закупки/);
 assert.match(html,/Это порядок роста/);
 complexityLesson.click('prev');assert.equal(complexityLesson.phase(),'#stage='+(stage+1)+'&step=4');
}
console.log('Verified all four complexity steps are reached by Next and shown outside collapsed references.');
complexityLesson.go(4);complexityLesson.click('revealAll');
assert.equal(complexityLesson.phase(),'#stage=5&step=5');
assert.match(complexityLesson.ids.get('stageContent').innerHTML,/class="compare-chart"/);
assert.match(complexityLesson.ids.get('stageContent').innerHTML,/class="method-evaluation"/);

(() => {"use strict";
const track=document.getElementById('hero-track');if(!track)return;
const get=id=>document.getElementById(id);
const els={sleep:get('robot-v5'),front:get('robot-front'),angle:get('robot-angle'),side:get('robot-side'),sleepText:get('sleep-copy'),phrase:get('phrase-copy'),meet:get('meet-copy'),physical:get('physical-copy'),finale:get('finale-copy'),light:get('wake-light'),rings:get('voice-rings'),veil:get('dormant-veil'),camera:get('camera-transition'),num:get('scene-number'),progress:get('track-progress')};
const dots=[...document.querySelectorAll('.dots button')];
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
// Each caption has its own non-overlapping display window. All other visual transitions are continuous.
const windowAlpha=(enterStart,enterEnd,exitStart,exitEnd,p)=>smooth(enterStart,enterEnd,p)*(1-smooth(exitStart,exitEnd,p));
const lerp=(a,b,t)=>a+(b-a)*t;
const v=(el,alpha,scale=1,x=0,y=0,brightness=1,blur=0)=>{const onPhone=matchMedia('(max-width:850px)').matches;const mobileLight=onPhone?(el===els.sleep?Math.max(.45,brightness):Math.max(.97,brightness)):brightness;el.style.opacity=alpha.toFixed(4);el.style.transform=`translate3d(${x.toFixed(3)}%,${y.toFixed(3)}%,0) scale(${scale.toFixed(4)})`;el.style.filter=`brightness(${mobileLight.toFixed(3)}) blur(${onPhone?0:blur.toFixed(2)}px)`};
const text=(el,alpha,offset=0)=>{el.style.opacity=alpha.toFixed(4);el.style.transform=matchMedia('(max-width:850px)').matches?`translate3d(0,${offset.toFixed(1)}px,0)`:`translate3d(0,calc(-40% + ${offset.toFixed(1)}px),0)`};
const ranges=[0,.12,.30,.48,.67,.865,1];const anchors=[0,.11,.31,.52,.73,.94];
let last=-1,raf=0;
function paint(){raf=0;const rect=track.getBoundingClientRect();const distance=Math.max(1,track.offsetHeight-innerHeight);const p=clamp(-rect.top/distance);if(Math.abs(p-last)<.00004)return;last=p;
// V13: exactly the dark V5 starting composition. Start deeper in shadow and outside frame,
// then make a continuous slow inward drift throughout standby and the wake phrase.
const inward=smooth(0,.33,p);
const v5out=1-smooth(.34,.57,p);
v(els.sleep,v5out,
  lerp(1.00,.91,inward),
  lerp(0,-9,inward),
  lerp(2,-1,inward),
  lerp(matchMedia('(max-width: 850px)').matches ? .36 : .15,.82,smooth(.05,.35,p)),2.1*windowAlpha(.38,.45,.52,.59,p));
// A secondary veil holds the original sleep scene almost black; only dissolve it
// after the word 'sleeping' appears and the wake phrase starts.
els.veil.style.opacity=((matchMedia('(max-width: 850px)').matches ? .32 : .73)*(1-smooth(.07,.30,p))).toFixed(4);
// Keep the robot spatially grounded between camera angles. Each replacement shot
// emerges over a LONG overlapping interval, with matched pull-back and soft focus.
const frontIn=smooth(.33,.51,p);
const frontOut=1-smooth(.57,.73,p);
const fAlpha=frontIn*frontOut;
v(els.front,fAlpha,
  lerp(matchMedia('(max-width: 850px)').matches?1.08:1.47,.98,smooth(.33,.68,p)),
  lerp(7,-4,smooth(.33,.68,p)),
  lerp(1,-2,smooth(.33,.68,p)),
  lerp(.36,1.06,smooth(.34,.57,p)),3*windowAlpha(.34,.39,.59,.68,p));
const angleIn=smooth(.63,.79,p);
const angleOut=1-smooth(.80,.94,p);
const aAlpha=angleIn*angleOut;
v(els.angle,aAlpha,
  lerp(matchMedia('(max-width: 850px)').matches?1.05:1.28,.99,smooth(.63,.88,p)),
  lerp(8,-3,smooth(.63,.88,p)),
  lerp(-1,0,smooth(.63,.88,p)),
  lerp(.58,1.08,smooth(.63,.83,p)),3*windowAlpha(.63,.67,.81,.90,p));
const sAlpha=smooth(.865,.995,p);
v(els.side,sAlpha,
  lerp(matchMedia('(max-width: 850px)').matches?1.03:1.13,.97,smooth(.86,1,p)),
  lerp(9,-1,smooth(.87,1,p)),0,
  lerp(.62,1.04,smooth(.87,1,p)),2.7*windowAlpha(.865,.90,.955,1,p));
// Controlled broad light bridge at angle changes: dissolve through a continuous
// soft light field rather than a sharp cut between discrete photographic poses.
const bridge1=windowAlpha(.36,.43,.54,.625,p);
const bridge2=windowAlpha(.62,.70,.80,.875,p);
const bridge3=windowAlpha(.85,.90,.95,1,p);
els.camera.style.opacity=(.32*bridge1+.35*bridge2+.30*bridge3).toFixed(4);
const drift=lerp(-10,12,smooth(.32,1,p));
els.camera.style.transform=`translate3d(${drift.toFixed(2)}%,0,0)`;
// The 6 storyboard captions, deliberately separated at the boundaries.
const captions=[
[els.sleepText,1-smooth(.125,.185,p)],
[els.phrase,windowAlpha(.20,.245,.345,.39,p)],
[els.meet,windowAlpha(.49,.53,.60,.645,p)],
[els.physical,windowAlpha(.70,.74,.82,.865,p)],
[els.finale,smooth(.895,.95,p)]
];
for(const [el,alpha] of captions)text(el,alpha,(1-alpha)*16);
// A single light sweep (on activation only); avoids perpetual glowing decoration.
const light=windowAlpha(.24,.30,.45,.55,p);
els.light.style.opacity=(light*.52).toFixed(3);
els.light.style.transform=`translate3d(${lerp(-36,50,smooth(.24,.56,p)).toFixed(1)}%,0,0)`;
const rings=windowAlpha(.24,.29,.36,.46,p);
els.rings.style.opacity=(rings*.55).toFixed(3);
els.rings.style.transform=`translate(-50%,-50%) scale(${lerp(.7,1.22,smooth(.24,.47,p)).toFixed(3)})`;
// Mark six visual states even though the first two share the authentic sleeping image.
const step=p<ranges[1]?0:p<ranges[2]?1:p<ranges[3]?2:p<ranges[4]?3:p<ranges[5]?4:5;
els.num.textContent=String(step+1).padStart(2,'0')+' / 06';els.progress.style.width=(p*100).toFixed(3)+'%';dots.forEach((b,i)=>b.classList.toggle('current',i===step));document.querySelector('.dots').style.opacity=(smooth(.02,.10,p)).toFixed(3);
}
function schedule(){if(!raf)raf=requestAnimationFrame(paint)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
dots.forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.step),top=track.getBoundingClientRect().top+scrollY,distance=Math.max(1,track.offsetHeight-innerHeight);scrollTo({top:top+anchors[i]*distance,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}));
paint();
})();


// Section 02: a vertical-scroll-driven horizontal editorial narrative.
(()=>{'use strict';
const story=document.querySelector('.story'), rail=document.getElementById('story-rail'),windowEl=document.getElementById('story-window');
const current=document.getElementById('story-current'),progress=document.getElementById('story-progress-fill');
const back=document.getElementById('story-back'),next=document.getElementById('story-next');
if(!story||!rail||!windowEl)return;
const mobile=matchMedia('(max-width:860px)');const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));let distance=0,p=0,raf=0;
function measure(){if(mobile.matches){story.style.height='auto';rail.style.transform='none';return}
 distance=Math.max(0,rail.scrollWidth-windowEl.clientWidth); const scrollSpan=Math.max(innerHeight*.85,distance*.90);
 story.style.height=(innerHeight+scrollSpan)+'px';paint(true);
}
function paint(force=false){raf=0;if(mobile.matches)return;
const rect=story.getBoundingClientRect();const travel=Math.max(1,story.offsetHeight-innerHeight);
p=clamp(-rect.top/travel);rail.style.transform=`translate3d(${-p*distance}px,0,0)`;
current.textContent=String(Math.min(3,Math.floor(p*2.99)+1)).padStart(2,'0');progress.style.width=(p*100).toFixed(2)+'%';back.disabled=p<.005;next.disabled=p>.995;
}
function schedule(){if(!raf)raf=requestAnimationFrame(paint)}
function go(to){if(mobile.matches){document.querySelectorAll('.story-panel')[to].scrollIntoView({behavior:'smooth',block:'center'});return}
const top=scrollY+story.getBoundingClientRect().top,travel=Math.max(1,story.offsetHeight-innerHeight);
scrollTo({top:top+clamp(to/2)*travel,behavior:reduced.matches?'instant':'smooth'});
}
back.addEventListener('click',()=>go(Math.max(0,Math.round(p*2)-1)));next.addEventListener('click',()=>go(Math.min(2,Math.round(p*2)+1)));
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});mobile.addEventListener('change',measure);
if('ResizeObserver' in window)new ResizeObserver(measure).observe(windowEl);
measure();
})();

// Section 03: single scroll timeline controls caption and camera motion; mobile uses natural document flow.
(()=>{'use strict';
const section=document.querySelector('.companion');if(!section)return;
const beats=[...section.querySelectorAll('.companion-beat')],front=section.querySelector('.companion-front'),angle=section.querySelector('.companion-angle'),wave=section.querySelector('.companion-wave'),terms=section.querySelector('.companion-terms'),count=document.getElementById('companion-count'),fill=document.getElementById('companion-progress-fill');
const mobile=matchMedia('(max-width:900px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=n=>Math.max(0,Math.min(1,n));const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
const active=(start,end,fadeStart,fadeEnd,p)=>smooth(start,end,p)*(1-smooth(fadeStart,fadeEnd,p));
let frame=0;
function paint(){frame=0;if(mobile.matches||reduced.matches){beats.forEach(b=>{b.style.opacity='';b.style.transform='';});front.style.opacity='';front.style.transform='';angle.style.opacity='';angle.style.transform='';wave.style.opacity='';terms.style.opacity='';return}
const rect=section.getBoundingClientRect(),length=Math.max(1,section.offsetHeight-innerHeight),p=clamp(-rect.top/length);
const a=[1-smooth(.255,.37,p),active(.30,.42,.60,.70,p),smooth(.64,.78,p)];
beats.forEach((b,i)=>{b.style.opacity=a[i].toFixed(3);b.style.transform=`translate3d(0,calc(-50% + ${(1-a[i])*12}px),0)`;b.style.visibility=a[i]<.015?'hidden':'visible';});
const turn=smooth(.58,.83,p);
front.style.opacity=(1-smooth(.65,.85,p)).toFixed(3);front.style.transform=`translate3d(-50%,-50%,0) scale(${(1.14-.2*smooth(0,.6,p)).toFixed(3)})`;
angle.style.opacity=smooth(.66,.87,p).toFixed(3);angle.style.transform=`translate3d(-50%,-50%,0) scale(${(1.13-.1*turn).toFixed(3)})`;
wave.style.opacity=active(.07,.18,.47,.62,p).toFixed(3);terms.style.opacity=smooth(.78,.94,p).toFixed(3);
count.textContent=String(p<.36?1:p<.7?2:3).padStart(2,'0')+' / 03';fill.style.width=(p*100).toFixed(2)+'%';}
function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});mobile.addEventListener('change',schedule);reduced.addEventListener('change',schedule);paint();
})();


// Section 04 — connected four-beat story, including exact approved partner paragraph.
(()=>{'use strict';
const section=document.querySelector('.remote');if(!section)return;
const beats=[...section.querySelectorAll('.remote-beat')],person=section.querySelector('.remote-person'),link=section.querySelector('.remote-link'),machine=section.querySelector('.remote-machine'),counter=document.getElementById('remote-counter'),fill=document.getElementById('remote-progress-fill'),tele=section.querySelector('.remote-note-tele'),tex=section.querySelector('.remote-note-teleex'),glow=section.querySelector('.remote-glow');
const mobile=matchMedia('(max-width:900px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=v=>Math.max(0,Math.min(1,v)),ease=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)},windowed=(a,b,c,d,p)=>ease(a,b,p)*(1-ease(c,d,p));let frame=0;
function paint(){frame=0;
 if(mobile.matches||reduced.matches){beats.forEach(b=>{b.style.opacity='';b.style.visibility='';b.style.transform=''});person.style.opacity='';person.style.transform='';link.style.opacity='';link.style.transform='';machine.style.opacity='';machine.style.transform='';glow.style.filter='';return}
 const rect=section.getBoundingClientRect(),travel=Math.max(1,section.offsetHeight-innerHeight),p=clamp(-rect.top/travel);
 // Holds between phases prevent legible headline collisions.
 const a=[1-ease(.19,.26,p),windowed(.23,.31,.46,.54,p),windowed(.51,.59,.72,.78,p),ease(.76,.84,p)];
 beats.forEach((b,i)=>{b.style.opacity=a[i].toFixed(4);b.style.visibility=a[i]<.012?'hidden':'visible';b.style.transform=`translate3d(0,calc(-50% + ${(1-a[i])*10}px),0)`});
 const connected=ease(.04,.25,p);person.style.opacity=(.56+.44*connected).toFixed(3);person.style.transform=`translate3d(${((1-connected)*-16-6*ease(.76,.94,p)).toFixed(2)}px,0,0) scale(${(1-.06*ease(.76,.94,p)).toFixed(3)})`;
 link.style.transform=`scaleX(${(.05+.95*connected).toFixed(4)})`;link.style.opacity=connected.toFixed(3);
 const pull=ease(.44,.92,p);machine.style.transform=`translate3d(${(16-31*pull).toFixed(2)}px,0,0) scale(${(1.035-.115*pull).toFixed(3)})`;machine.style.opacity=(1-.10*ease(.78,.94,p)).toFixed(3);
 tele.style.opacity=windowed(.26,.33,.45,.54,p).toFixed(3);tex.style.opacity=windowed(.55,.62,.73,.81,p).toFixed(3);
 glow.style.filter=`brightness(${(1+.36*ease(.76,.95,p)).toFixed(3)})`;
 counter.textContent=String(p<.26?1:p<.53?2:p<.80?3:4).padStart(2,'0')+' / 04';fill.style.width=(p*100).toFixed(2)+'%';
}
function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});mobile.addEventListener('change',schedule);reduced.addEventListener('change',schedule);paint();
})();

// Section 05 — real-photo mechanical exploration with reversible scroll timing.
(()=>{'use strict';
const sec=document.querySelector('.engineering');if(!sec)return;
const beats=[...sec.querySelectorAll('.engineering-beat')];
const full=sec.querySelector('.engineering-full'),joint=sec.querySelector('.engineering-joint'),angle=sec.querySelector('.engineering-angle');
const count=document.getElementById('engineering-count'),fill=document.getElementById('engineering-progress-fill'),label=document.getElementById('engineering-detail');
const mobile=matchMedia('(max-width:900px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=v=>Math.max(0,Math.min(1,v)),ease=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)},windowed=(a,b,c,d,p)=>ease(a,b,p)*(1-ease(c,d,p));let frame=0;
function paint(){frame=0;if(mobile.matches||reduced.matches){beats.forEach(b=>{b.style.opacity='';b.style.visibility='';b.style.transform=''});for(const e of [full,joint,angle]){e.style.opacity='';e.style.transform=''}return}
 const rect=sec.getBoundingClientRect(),travel=Math.max(1,sec.offsetHeight-innerHeight),p=clamp(-rect.top/travel);
 const alphas=[1-ease(.30,.39,p),windowed(.39,.47,.63,.70,p),ease(.70,.79,p)];
 beats.forEach((b,i)=>{const a=alphas[i];b.style.opacity=a.toFixed(3);b.style.visibility=a<.015?'hidden':'visible';b.style.transform=`translate3d(0,calc(-50% + ${(1-a)*11}px),0)`});
 const jointOn=windowed(.33,.45,.63,.77,p),angleOn=ease(.66,.80,p);
 full.style.opacity=(1-ease(.33,.45,p)).toFixed(3);full.style.transform=`scale(${(1+.09*ease(.05,.35,p)-.15*ease(.7,.97,p)).toFixed(4)}) translate3d(${(-4*ease(.09,.34,p)).toFixed(2)}%,0,0)`;
 joint.style.opacity=jointOn.toFixed(3);joint.style.transform=`scale(${(1.12-.12*ease(.33,.7,p)).toFixed(4)})`;
 angle.style.opacity=angleOn.toFixed(3);angle.style.transform=`scale(${(1.12-.12*ease(.65,.99,p)).toFixed(4)}) translate3d(${(5-5*ease(.65,.99,p)).toFixed(2)}%,0,0)`;
 label.textContent=p<.37?'ARM STRUCTURE':p<.7?'ARTICULATED JOINTS':'RECONFIGURABLE PLATFORM';
 count.textContent=String(p<.38?1:p<.70?2:3).padStart(2,'0')+' / 03';fill.style.width=(p*100).toFixed(2)+'%';
}
function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});mobile.addEventListener('change',schedule);reduced.addEventListener('change',schedule);paint();
})();

/* Site navigation and contrast-aware header */
(()=>{
 const header=document.querySelector('#site-header');
 const menu=document.querySelector('#nav-toggle');
 const nav=document.querySelector('#site-nav');
 if(!header||!menu||!nav)return;
 menu.addEventListener('click',()=>{const opened=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(opened));menu.setAttribute('aria-label',opened?'Close navigation':'Open navigation');});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}));
 const updateHeader=()=>{const y=window.scrollY+36;const lightSections=['#introduction','#remote-presence','#contact'];const isLight=lightSections.some(sel=>{const el=document.querySelector(sel);return !!el&&y>=el.offsetTop&&y<el.offsetTop+el.offsetHeight-50});header.classList.toggle('on-light',isLight)};
 window.addEventListener('scroll',updateHeader,{passive:true});window.addEventListener('resize',updateHeader,{passive:true});updateHeader();
})();

import { invitation } from '@/content/invitation'
import { dotted, upperTr } from '@/lib/format'
import { CengelWord } from './marks'

/**
 * Açılış: tam ekran, sinematik bir "jenerik".
 * İsimler maskeden yükselir, Ş'nin çengeli kırmızıyla damlar, tarih ve
 * cümle belirir. "Davetiyeyi aç" denince kurdele çekilir, ortadan kesilir
 * ve perde iki yana açılır.
 *
 * Tamamen HTML + CSS + küçük bir satır içi script: React yüklenmeden çalışır.
 */

const script = `(function(){
var d=document.documentElement,o=document.getElementById('opening');
if(!o)return;
function inert(v){var m=document.getElementById('main');if(m)m.inert=v}
function done(){d.classList.add('opening-done');d.classList.remove('opening-active');inert(false)}
function stage(fast){d.classList.add('stage-hero');if(fast)d.classList.add('hero-fast');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#f2ede4')}
if(d.classList.contains('skip-opening')){stage(true);done();return}
d.classList.add('opening-active');
document.addEventListener('DOMContentLoaded',function(){if(!d.classList.contains('opening-done'))inert(true)});
var reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function exit(fast){
 if(o.getAttribute('data-phase')==='exit')return;
 fast=fast||reduced;
 try{sessionStorage.setItem('svs-opened','1')}catch(e){}
 if(fast)o.setAttribute('data-fast','');
 o.setAttribute('data-phase','exit');
 stage(fast);
 document.dispatchEvent(new CustomEvent('svs:enter',{detail:{fast:fast}}));
 setTimeout(done,fast?380:1900);
}
o.addEventListener('click',function(e){
 var t=e.target&&e.target.closest?e.target.closest('[data-opening]'):null;
 if(t){e.preventDefault();exit(t.getAttribute('data-opening')==='skip');return}
 if(o.getAttribute('data-phase')==='intro')o.setAttribute('data-phase','ready');
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!d.classList.contains('opening-done'))exit(true)});
})();`

export function Opening() {
  const { couple, event, copy } = invitation
  return (
    <div
      id="opening"
      className="opening"
      data-phase="intro"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opening-names"
      suppressHydrationWarning
    >
      <div className="opening__panel opening__panel--top" aria-hidden="true" />
      <div className="opening__panel opening__panel--bottom" aria-hidden="true" />
      <div className="opening__grain" aria-hidden="true" />
      <div className="opening__ribbon" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="opening__content">
        <div className="opening__stage">
          <p id="opening-names" className="opening__names">
            <span className="opening__line">
              <span>{upperTr(couple.first)}</span>
            </span>
            <span className="opening__amp">&amp;</span>
            <span className="opening__line">
              <span>
                <CengelWord word={upperTr(couple.second)} />
              </span>
            </span>
          </p>
          <p className="opening__date">
            <time dateTime={event.start}>{dotted(event.start)}</time>
          </p>
          <p className="opening__tagline">{copy.opening.tagline}</p>
        </div>

        <button type="button" className="btn opening__enter" data-opening="enter">
          <span>{copy.opening.enter}</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </button>
        <button type="button" className="t-label opening__skip" data-opening="skip">
          {copy.opening.skip}
        </button>
      </div>

      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  )
}

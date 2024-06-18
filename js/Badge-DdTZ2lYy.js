import{d as B,b as h,a2 as v,w as P,G as C,b6 as S,aI as s,aD as r,b7 as A,aB as f,b8 as I,aC as c,aE as M,b9 as F,ba as W,bb as D,bc as z,aF as X,aG as Y,o as _,bd as V,aN as q,be as L,bf as j,aP as G,bg as U,bh as Z,bi as H,aQ as K,bj as Q}from"./index-DYGX83NG.js";const O=B({name:"SlotMachineNumber",props:{clsPrefix:{type:String,required:!0},value:{type:[Number,String],required:!0},oldOriginalNumber:{type:Number,default:void 0},newOriginalNumber:{type:Number,default:void 0}},setup(e){const o=h(null),i=h(e.value),u=h(e.value),t=h("up"),a=h(!1),m=v(()=>a.value?`${e.clsPrefix}-base-slot-machine-current-number--${t.value}-scroll`:null),g=v(()=>a.value?`${e.clsPrefix}-base-slot-machine-old-number--${t.value}-scroll`:null);P(S(e,"value"),(n,l)=>{i.value=l,u.value=n,C(N)});function N(){const n=e.newOriginalNumber,l=e.oldOriginalNumber;l===void 0||n===void 0||(n>l?w("up"):l>n&&w("down"))}function w(n){t.value=n,a.value=!1,C(()=>{var l;(l=o.value)===null||l===void 0||l.offsetWidth,a.value=!0})}return()=>{const{clsPrefix:n}=e;return s("span",{ref:o,class:`${n}-base-slot-machine-number`},i.value!==null?s("span",{class:[`${n}-base-slot-machine-old-number ${n}-base-slot-machine-old-number--top`,g.value]},i.value):null,s("span",{class:[`${n}-base-slot-machine-current-number`,m.value]},s("span",{ref:"numberWrapper",class:[`${n}-base-slot-machine-current-number__inner`,typeof e.value!="number"&&`${n}-base-slot-machine-current-number__inner--not-number`]},u.value)),i.value!==null?s("span",{class:[`${n}-base-slot-machine-old-number ${n}-base-slot-machine-old-number--bottom`,g.value]},i.value):null)}}}),{cubicBezierEaseOut:x}=A;function J({duration:e=".2s"}={}){return[r("&.fade-up-width-expand-transition-leave-active",{transition:`
 opacity ${e} ${x},
 max-width ${e} ${x},
 transform ${e} ${x}
 `}),r("&.fade-up-width-expand-transition-enter-active",{transition:`
 opacity ${e} ${x},
 max-width ${e} ${x},
 transform ${e} ${x}
 `}),r("&.fade-up-width-expand-transition-enter-to",{opacity:1,transform:"translateX(0) translateY(0)"}),r("&.fade-up-width-expand-transition-enter-from",{maxWidth:"0 !important",opacity:0,transform:"translateY(60%)"}),r("&.fade-up-width-expand-transition-leave-from",{opacity:1,transform:"translateY(0)"}),r("&.fade-up-width-expand-transition-leave-to",{maxWidth:"0 !important",opacity:0,transform:"translateY(60%)"})]}const ee=r([r("@keyframes n-base-slot-machine-fade-up-in",`
 from {
 transform: translateY(60%);
 opacity: 0;
 }
 to {
 transform: translateY(0);
 opacity: 1;
 }
 `),r("@keyframes n-base-slot-machine-fade-down-in",`
 from {
 transform: translateY(-60%);
 opacity: 0;
 }
 to {
 transform: translateY(0);
 opacity: 1;
 }
 `),r("@keyframes n-base-slot-machine-fade-up-out",`
 from {
 transform: translateY(0%);
 opacity: 1;
 }
 to {
 transform: translateY(-60%);
 opacity: 0;
 }
 `),r("@keyframes n-base-slot-machine-fade-down-out",`
 from {
 transform: translateY(0%);
 opacity: 1;
 }
 to {
 transform: translateY(60%);
 opacity: 0;
 }
 `),f("base-slot-machine",`
 overflow: hidden;
 white-space: nowrap;
 display: inline-block;
 height: 18px;
 line-height: 18px;
 `,[f("base-slot-machine-number",`
 display: inline-block;
 position: relative;
 height: 18px;
 width: .6em;
 max-width: .6em;
 `,[J({duration:".2s"}),I({duration:".2s",delay:"0s"}),f("base-slot-machine-old-number",`
 display: inline-block;
 opacity: 0;
 position: absolute;
 left: 0;
 right: 0;
 `,[c("top",{transform:"translateY(-100%)"}),c("bottom",{transform:"translateY(100%)"}),c("down-scroll",{animation:"n-base-slot-machine-fade-down-out .2s cubic-bezier(0, 0, .2, 1)",animationIterationCount:1}),c("up-scroll",{animation:"n-base-slot-machine-fade-up-out .2s cubic-bezier(0, 0, .2, 1)",animationIterationCount:1})]),f("base-slot-machine-current-number",`
 display: inline-block;
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 right: 0;
 opacity: 1;
 transform: translateY(0);
 width: .6em;
 `,[c("down-scroll",{animation:"n-base-slot-machine-fade-down-in .2s cubic-bezier(0, 0, .2, 1)",animationIterationCount:1}),c("up-scroll",{animation:"n-base-slot-machine-fade-up-in .2s cubic-bezier(0, 0, .2, 1)",animationIterationCount:1}),M("inner",`
 display: inline-block;
 position: absolute;
 right: 0;
 top: 0;
 width: .6em;
 `,[c("not-number",`
 right: unset;
 left: 0;
 `)])])])])]),ae=B({name:"BaseSlotMachine",props:{clsPrefix:{type:String,required:!0},value:{type:[Number,String],default:0},max:{type:Number,default:void 0},appeared:{type:Boolean,required:!0}},setup(e){F("-base-slot-machine",ee,S(e,"clsPrefix"));const o=h(),i=h(),u=v(()=>{if(typeof e.value=="string")return[];if(e.value<1)return[0];const t=[];let a=e.value;for(e.max!==void 0&&(a=Math.min(e.max,a));a>=1;)t.push(a%10),a/=10,a=Math.floor(a);return t.reverse(),t});return P(S(e,"value"),(t,a)=>{typeof t=="string"?(i.value=void 0,o.value=void 0):typeof a=="string"?(i.value=t,o.value=void 0):(i.value=t,o.value=a)}),()=>{const{value:t,clsPrefix:a}=e;return typeof t=="number"?s("span",{class:`${a}-base-slot-machine`},s(D,{name:"fade-up-width-expand-transition",tag:"span"},{default:()=>u.value.map((m,g)=>s(O,{clsPrefix:a,key:u.value.length-g-1,oldOriginalNumber:o.value,newOriginalNumber:i.value,value:m}))}),s(W,{key:"+",width:!0},{default:()=>e.max!==void 0&&e.max<t?s(O,{clsPrefix:a,value:"+"}):null})):s("span",{class:`${a}-base-slot-machine`},t)}}}),te=r([r("@keyframes badge-wave-spread",{from:{boxShadow:"0 0 0.5px 0px var(--n-ripple-color)",opacity:.6},to:{boxShadow:"0 0 0.5px 4.5px var(--n-ripple-color)",opacity:0}}),f("badge",`
 display: inline-flex;
 position: relative;
 vertical-align: middle;
 font-family: var(--n-font-family);
 `,[c("as-is",[f("badge-sup",{position:"static",transform:"translateX(0)"},[z({transformOrigin:"left bottom",originalTransform:"translateX(0)"})])]),c("dot",[f("badge-sup",`
 height: 8px;
 width: 8px;
 padding: 0;
 min-width: 8px;
 left: 100%;
 bottom: calc(100% - 4px);
 `,[r("::before","border-radius: 4px;")])]),f("badge-sup",`
 background: var(--n-color);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 color: #FFF;
 position: absolute;
 height: 18px;
 line-height: 18px;
 border-radius: 9px;
 padding: 0 6px;
 text-align: center;
 font-size: var(--n-font-size);
 transform: translateX(-50%);
 left: 100%;
 bottom: calc(100% - 9px);
 font-variant-numeric: tabular-nums;
 z-index: 1;
 display: flex;
 align-items: center;
 `,[z({transformOrigin:"left bottom",originalTransform:"translateX(-50%)"}),f("base-wave",{zIndex:1,animationDuration:"2s",animationIterationCount:"infinite",animationDelay:"1s",animationTimingFunction:"var(--n-ripple-bezier)",animationName:"badge-wave-spread"}),r("&::before",`
 opacity: 0;
 transform: scale(1);
 border-radius: 9px;
 content: "";
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 `)])])]),ne=Object.assign(Object.assign({},Y.props),{value:[String,Number],max:Number,dot:Boolean,type:{type:String,default:"default"},show:{type:Boolean,default:!0},showZero:Boolean,processing:Boolean,color:String,offset:Array}),oe=B({name:"Badge",props:ne,setup(e,{slots:o}){const{mergedClsPrefixRef:i,inlineThemeDisabled:u,mergedRtlRef:t}=X(e),a=Y("Badge","-badge",te,Z,e,i),m=h(!1),g=()=>{m.value=!0},N=()=>{m.value=!1},w=v(()=>e.show&&(e.dot||e.value!==void 0&&!(!e.showZero&&Number(e.value)<=0)||!H(o.value)));_(()=>{w.value&&(m.value=!0)});const n=V("Badge",t,i),l=v(()=>{const{type:b,color:d}=e,{common:{cubicBezierEaseInOut:p,cubicBezierEaseOut:R},self:{[K("color",b)]:$,fontFamily:E,fontSize:T}}=a.value;return{"--n-font-size":T,"--n-font-family":E,"--n-color":d||$,"--n-ripple-color":d||$,"--n-bezier":p,"--n-ripple-bezier":R}}),y=u?q("badge",v(()=>{let b="";const{type:d,color:p}=e;return d&&(b+=d[0]),p&&(b+=Q(p)),b}),l,e):void 0,k=v(()=>{const{offset:b}=e;if(!b)return;const[d,p]=b,R=typeof d=="number"?`${d}px`:d,$=typeof p=="number"?`${p}px`:p;return{transform:`translate(calc(${n?.value?"50%":"-50%"} + ${R}), ${$})`}});return{rtlEnabled:n,mergedClsPrefix:i,appeared:m,showBadge:w,handleAfterEnter:g,handleAfterLeave:N,cssVars:u?void 0:l,themeClass:y?.themeClass,onRender:y?.onRender,offsetStyle:k}},render(){var e;const{mergedClsPrefix:o,onRender:i,themeClass:u,$slots:t}=this;i?.();const a=(e=t.default)===null||e===void 0?void 0:e.call(t);return s("div",{class:[`${o}-badge`,this.rtlEnabled&&`${o}-badge--rtl`,u,{[`${o}-badge--dot`]:this.dot,[`${o}-badge--as-is`]:!a}],style:this.cssVars},a,s(L,{name:"fade-in-scale-up-transition",onAfterEnter:this.handleAfterEnter,onAfterLeave:this.handleAfterLeave},{default:()=>this.showBadge?s("sup",{class:`${o}-badge-sup`,title:j(this.value),style:this.offsetStyle},G(t.value,()=>[this.dot?null:s(ae,{clsPrefix:o,appeared:this.appeared,max:this.max,value:this.value})]),this.processing?s(U,{clsPrefix:o}):null):null}))}});export{oe as N};

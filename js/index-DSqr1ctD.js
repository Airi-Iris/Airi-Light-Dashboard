import{aB as n,aC as d,aD as u,aE as a,d as h,aF as $,aG as T,aH as K,aI as s,aJ as L,aK as q,aL as U,aM as W,a2 as z,aN as A,aO as b,aP as y,aQ as p,aR as G,b as w,o as J,R as _,aS as Q,e as i,g as c,I as X,j as Y,B as Z,i as S,a0 as ee,aT as te,aU as ie,O as ne,m as le,x as oe}from"./index-DrqTzKeg.js";import{u as re}from"./use-houdini-CYNGXBVF.js";import{r as ae}from"./vue.runtime.esm-bundler-37U9lfaj.js";var k={};Object.defineProperty(k,"__esModule",{value:!0});const g=ae,se={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 512 512"},ce=(0,g.createElementVNode)("path",{d:"M290.74 93.24l128.02 128.02l-277.99 277.99l-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22l277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55l128.02 128.02l56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z",fill:"currentColor"},null,-1),me=[ce];var de=k.default=(0,g.defineComponent)({name:"Pen",render:function(o,r){return(0,g.openBlock)(),(0,g.createElementBlock)("svg",se,me)}});const C=1.25,ue=n("timeline",`
 position: relative;
 width: 100%;
 display: flex;
 flex-direction: column;
 line-height: ${C};
`,[d("horizontal",`
 flex-direction: row;
 `,[u(">",[n("timeline-item",`
 flex-shrink: 0;
 padding-right: 40px;
 `,[d("dashed-line-type",[u(">",[n("timeline-item-timeline",[a("line",`
 background-image: linear-gradient(90deg, var(--n-color-start), var(--n-color-start) 50%, transparent 50%, transparent 100%);
 background-size: 10px 1px;
 `)])])]),u(">",[n("timeline-item-content",`
 margin-top: calc(var(--n-icon-size) + 12px);
 `,[u(">",[a("meta",`
 margin-top: 6px;
 margin-bottom: unset;
 `)])]),n("timeline-item-timeline",`
 width: 100%;
 height: calc(var(--n-icon-size) + 12px);
 `,[a("line",`
 left: var(--n-icon-size);
 top: calc(var(--n-icon-size) / 2 - 1px);
 right: 0px;
 width: unset;
 height: 2px;
 `)])])])])]),d("right-placement",[n("timeline-item",[n("timeline-item-content",`
 text-align: right;
 margin-right: calc(var(--n-icon-size) + 12px);
 `),n("timeline-item-timeline",`
 width: var(--n-icon-size);
 right: 0;
 `)])]),d("left-placement",[n("timeline-item",[n("timeline-item-content",`
 margin-left: calc(var(--n-icon-size) + 12px);
 `),n("timeline-item-timeline",`
 left: 0;
 `)])]),n("timeline-item",`
 position: relative;
 `,[u("&:last-child",[n("timeline-item-timeline",[a("line",`
 display: none;
 `)]),n("timeline-item-content",[a("meta",`
 margin-bottom: 0;
 `)])]),n("timeline-item-content",[a("title",`
 margin: var(--n-title-margin);
 font-size: var(--n-title-font-size);
 transition: color .3s var(--n-bezier);
 font-weight: var(--n-title-font-weight);
 color: var(--n-title-text-color);
 `),a("content",`
 transition: color .3s var(--n-bezier);
 font-size: var(--n-content-font-size);
 color: var(--n-content-text-color);
 `),a("meta",`
 transition: color .3s var(--n-bezier);
 font-size: 12px;
 margin-top: 6px;
 margin-bottom: 20px;
 color: var(--n-meta-text-color);
 `)]),d("dashed-line-type",[n("timeline-item-timeline",[a("line",`
 --n-color-start: var(--n-line-color);
 transition: --n-color-start .3s var(--n-bezier);
 background-color: transparent;
 background-image: linear-gradient(180deg, var(--n-color-start), var(--n-color-start) 50%, transparent 50%, transparent 100%);
 background-size: 1px 10px;
 `)])]),n("timeline-item-timeline",`
 width: calc(var(--n-icon-size) + 12px);
 position: absolute;
 top: calc(var(--n-title-font-size) * ${C} / 2 - var(--n-icon-size) / 2);
 height: 100%;
 `,[a("circle",`
 border: var(--n-circle-border);
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 width: var(--n-icon-size);
 height: var(--n-icon-size);
 border-radius: var(--n-icon-size);
 box-sizing: border-box;
 `),a("icon",`
 color: var(--n-icon-color);
 font-size: var(--n-icon-size);
 height: var(--n-icon-size);
 width: var(--n-icon-size);
 display: flex;
 align-items: center;
 justify-content: center;
 `),a("line",`
 transition: background-color .3s var(--n-bezier);
 position: absolute;
 top: var(--n-icon-size);
 left: calc(var(--n-icon-size) / 2 - 1px);
 bottom: 0px;
 width: 2px;
 background-color: var(--n-line-color);
 `)])])]),pe=Object.assign(Object.assign({},T.props),{horizontal:Boolean,itemPlacement:{type:String,default:"left"},size:{type:String,default:"medium"},iconSize:Number}),B=L("n-timeline"),ge=h({name:"Timeline",props:pe,setup(e,{slots:o}){const{mergedClsPrefixRef:r}=$(e),l=T("Timeline","-timeline",ue,q,e,r);return K(B,{props:e,mergedThemeRef:l,mergedClsPrefixRef:r}),()=>{const{value:t}=r;return s("div",{class:[`${t}-timeline`,e.horizontal&&`${t}-timeline--horizontal`,`${t}-timeline--${e.size}-size`,!e.horizontal&&`${t}-timeline--${e.itemPlacement}-placement`]},o)}}}),fe={time:[String,Number],title:String,content:String,color:String,lineType:{type:String,default:"default"},type:{type:String,default:"default"}},ve=h({name:"TimelineItem",props:fe,setup(e){const o=U(B);o||W("timeline-item","`n-timeline-item` must be placed inside `n-timeline`."),re();const{inlineThemeDisabled:r}=$(),l=z(()=>{const{props:{size:m,iconSize:f},mergedThemeRef:v}=o,{type:x}=e,{self:{titleTextColor:P,contentTextColor:N,metaTextColor:R,lineColor:O,titleFontWeight:j,contentFontSize:I,[p("iconSize",m)]:M,[p("titleMargin",m)]:E,[p("titleFontSize",m)]:F,[p("circleBorder",x)]:V,[p("iconColor",x)]:D},common:{cubicBezierEaseInOut:H}}=v.value;return{"--n-bezier":H,"--n-circle-border":V,"--n-icon-color":D,"--n-content-font-size":I,"--n-content-text-color":N,"--n-line-color":O,"--n-meta-text-color":R,"--n-title-font-size":F,"--n-title-font-weight":j,"--n-title-margin":E,"--n-title-text-color":P,"--n-icon-size":G(f)||M}}),t=r?A("timeline-item",z(()=>{const{props:{size:m,iconSize:f}}=o,{type:v}=e;return`${m[0]}${f||"a"}${v[0]}`}),l,o.props):void 0;return{mergedClsPrefix:o.mergedClsPrefixRef,cssVars:r?void 0:l,themeClass:t?.themeClass,onRender:t?.onRender}},render(){const{mergedClsPrefix:e,color:o,onRender:r,$slots:l}=this;return r?.(),s("div",{class:[`${e}-timeline-item`,this.themeClass,`${e}-timeline-item--${this.type}-type`,`${e}-timeline-item--${this.lineType}-line-type`],style:this.cssVars},s("div",{class:`${e}-timeline-item-timeline`},s("div",{class:`${e}-timeline-item-timeline__line`}),b(l.icon,t=>t?s("div",{class:`${e}-timeline-item-timeline__icon`,style:{color:o}},t):s("div",{class:`${e}-timeline-item-timeline__circle`,style:{borderColor:o}}))),s("div",{class:`${e}-timeline-item-content`},b(l.header,t=>t||this.title?s("div",{class:`${e}-timeline-item-content__title`},t||this.title):null),s("div",{class:`${e}-timeline-item-content__content`},y(l.default,()=>[this.content])),s("div",{class:`${e}-timeline-item-content__meta`},y(l.footer,()=>[this.time]))))}}),he={"timeline-grid":"_timeline-grid_hvhis_1"};function xe(e){return typeof e=="function"||Object.prototype.toString.call(e)==="[object Object]"&&!oe(e)}const we=h({setup(){const e=w([]),o=w(!0);J(async()=>{_.api.recently.all.get().then(l=>{e.value=l.data,o.value=!1})});const{create:r}=Q();return()=>{let l;return i("div",{class:"relative -mt-12 flex w-full grow flex-col"},[i("div",{dir:"ltr","data-orientation":"horizontal",class:"flex flex-row sticky top-16 z-[1] -ml-4 h-[42px] -mt-8 w-[calc(100%+2rem)] bg-white/80 backdrop-blur dark:bg-zinc-900/80 border-b-[0.5px] border-zinc-200 dark:border-neutral-900"},[i("h1",{class:"w-[50px] center flex mr-4 ml-4 font-bold text-[16px]"},[c("速记")])]),i("div",{class:"flex mt-16 p-16 pt-0"},[i(ge,null,xe(l=e.value.map(t=>i(ve,{type:"default",key:t.id},{icon(){return i(X,null,{default:()=>[i(de,null,null)]})},default(){return i("div",{class:he["timeline-grid"]},[i("span",null,[t.content]),i("div",{class:"action"},[i(Y,{placement:"left",positiveText:"取消",negativeText:"删除",onNegativeClick:async()=>{await _.api.recently(t.id).delete(),message.success("删除成功"),e.value.splice(e.value.indexOf(t),1)}},{trigger:()=>i(Z,{quaternary:!0,type:"error",size:"tiny"},{default:()=>[c("移除")]}),default:()=>i("span",{class:"max-w-48 break-all"},[c("确定要删除 "),t.content,c(" ?")])})])])},footer(){return i(S,{inline:!0,size:5},{default:()=>[i(ee,{time:t.created},null),i(S,{inline:!0,size:1,align:"center"},{default:()=>[i(te,null,null),c(" "),t.up,i("span",{class:"mx-2"},[c("/")]),i(ie,null,null),c(" "),t.down]})]})}})))?l:{default:()=>[l]})]),i(ne,null,{default:()=>[i(le,{icon:i("i",{class:"icon-[mingcute--add-line] size-[16px]"},null),className:"bg-accent size-[28px]",name:"记录",onClick:()=>{r().then(t=>{t&&e.value.unshift(t)})}},null)]})])}}});export{we as default};

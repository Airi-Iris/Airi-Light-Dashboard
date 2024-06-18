import{s as ne}from"./confetti-D3WRURFJ.js";import{aB as c,aC as U,aD as b,aE as B,dt as k,ce as se,d as h,aF as V,bd as ie,aG as P,aH as j,aI as o,bk as ae,bl as re,aJ as oe,dH as le,aL as q,aM as ue,a2 as y,aN as ce,aO as D,aP as N,dn as de,bv as _,dI as pe,dJ as fe,aQ as m,c6 as R,ax as ve,dK as me,at as he,c1 as ge,r as $,o as xe,R as E,b as z,e,n as be,aX as Ce,B as w,g as C,T as d,s as f,b2 as ye,i as A,p as M,c as ze}from"./index-DrqTzKeg.js";const Ee=c("steps",`
 width: 100%;
 display: flex;
`,[c("step",`
 position: relative;
 display: flex;
 flex: 1;
 `,[U("disabled","cursor: not-allowed"),U("clickable",`
 cursor: pointer;
 `),b("&:last-child",[c("step-splitor","display: none;")])]),c("step-splitor",`
 background-color: var(--n-splitor-color);
 margin-top: calc(var(--n-step-header-font-size) / 2);
 height: 1px;
 flex: 1;
 align-self: flex-start;
 margin-left: 12px;
 margin-right: 12px;
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `),c("step-content","flex: 1;",[c("step-content-header",`
 color: var(--n-header-text-color);
 margin-top: calc(var(--n-indicator-size) / 2 - var(--n-step-header-font-size) / 2);
 line-height: var(--n-step-header-font-size);
 font-size: var(--n-step-header-font-size);
 position: relative;
 display: flex;
 font-weight: var(--n-step-header-font-weight);
 margin-left: 9px;
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `,[B("title",`
 white-space: nowrap;
 flex: 0;
 `)]),B("description",`
 color: var(--n-description-text-color);
 margin-top: 12px;
 margin-left: 9px;
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `)]),c("step-indicator",`
 background-color: var(--n-indicator-color);
 box-shadow: 0 0 0 1px var(--n-indicator-border-color);
 height: var(--n-indicator-size);
 width: var(--n-indicator-size);
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 transition:
 background-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 `,[c("step-indicator-slot",`
 position: relative;
 width: var(--n-indicator-icon-size);
 height: var(--n-indicator-icon-size);
 font-size: var(--n-indicator-icon-size);
 line-height: var(--n-indicator-icon-size);
 `,[B("index",`
 display: inline-block;
 text-align: center;
 position: absolute;
 left: 0;
 top: 0;
 white-space: nowrap;
 font-size: var(--n-indicator-index-font-size);
 width: var(--n-indicator-icon-size);
 height: var(--n-indicator-icon-size);
 line-height: var(--n-indicator-icon-size);
 color: var(--n-indicator-text-color);
 transition: color .3s var(--n-bezier);
 `,[k()]),c("icon",`
 color: var(--n-indicator-text-color);
 transition: color .3s var(--n-bezier);
 `,[k()]),c("base-icon",`
 color: var(--n-indicator-text-color);
 transition: color .3s var(--n-bezier);
 `,[k()])])]),U("vertical","flex-direction: column;",[se("show-description",[b(">",[c("step","padding-bottom: 8px;")])]),b(">",[c("step","margin-bottom: 16px;",[b("&:last-child","margin-bottom: 0;"),b(">",[c("step-indicator",[b(">",[c("step-splitor",`
 position: absolute;
 bottom: -8px;
 width: 1px;
 margin: 0 !important;
 left: calc(var(--n-indicator-size) / 2);
 height: calc(100% - var(--n-indicator-size));
 `)])]),c("step-content",[B("description","margin-top: 8px;")])])])])])]);function we(t,n){return typeof t!="object"||t===null||Array.isArray(t)?null:(t.props||(t.props={}),t.props.internalIndex=n+1,t)}function Be(t){return t.map((n,i)=>we(n,i))}const Se=Object.assign(Object.assign({},P.props),{current:Number,status:{type:String,default:"process"},size:{type:String,default:"medium"},vertical:Boolean,"onUpdate:current":[Function,Array],onUpdateCurrent:[Function,Array]}),H=oe("n-steps"),Fe=h({name:"Steps",props:Se,setup(t,{slots:n}){const{mergedClsPrefixRef:i,mergedRtlRef:a}=V(t),l=ie("Steps",a,i),s=P("Steps","-steps",Ee,le,t,i);return j(H,{props:t,mergedThemeRef:s,mergedClsPrefixRef:i,stepsSlots:n}),{mergedClsPrefix:i,rtlEnabled:l}},render(){const{mergedClsPrefix:t}=this;return o("div",{class:[`${t}-steps`,this.rtlEnabled&&`${t}-steps--rtl`,this.vertical&&`${t}-steps--vertical`]},Be(ae(re(this))))}}),Ie={status:String,title:String,description:String,disabled:Boolean,internalIndex:{type:Number,default:0}},S=h({name:"Step",props:Ie,setup(t){const n=q(H,null);n||ue("step","`n-step` must be placed inside `n-steps`.");const{inlineThemeDisabled:i}=V(),{props:a,mergedThemeRef:l,mergedClsPrefixRef:s,stepsSlots:v}=n,r=y(()=>a.vertical),I=y(()=>{const{status:u}=t;if(u)return u;{const{internalIndex:p}=t,{current:x}=a;if(x===void 0)return"process";if(p<x)return"finish";if(p===x)return a.status||"process";if(p>x)return"wait"}return"process"}),T=y(()=>{const{value:u}=I,{size:p}=a,{common:{cubicBezierEaseInOut:x},self:{stepHeaderFontWeight:K,[m("stepHeaderFontSize",p)]:L,[m("indicatorIndexFontSize",p)]:W,[m("indicatorSize",p)]:J,[m("indicatorIconSize",p)]:G,[m("indicatorTextColor",u)]:Q,[m("indicatorBorderColor",u)]:X,[m("headerTextColor",u)]:Y,[m("splitorColor",u)]:Z,[m("indicatorColor",u)]:ee,[m("descriptionTextColor",u)]:te}}=l.value;return{"--n-bezier":x,"--n-description-text-color":te,"--n-header-text-color":Y,"--n-indicator-border-color":X,"--n-indicator-color":ee,"--n-indicator-icon-size":G,"--n-indicator-index-font-size":W,"--n-indicator-size":J,"--n-indicator-text-color":Q,"--n-splitor-color":Z,"--n-step-header-font-size":L,"--n-step-header-font-weight":K}}),g=i?ce("step",y(()=>{const{value:u}=I,{size:p}=a;return`${u[0]}${p[0]}`}),T,a):void 0,O=y(()=>{if(t.disabled)return;const{onUpdateCurrent:u,"onUpdate:current":p}=a;return u||p?()=>{u&&R(u,t.internalIndex),p&&R(p,t.internalIndex)}:void 0});return{stepsSlots:v,mergedClsPrefix:s,vertical:r,mergedStatus:I,handleStepClick:O,cssVars:i?void 0:T,themeClass:g?.themeClass,onRender:g?.onRender}},render(){const{mergedClsPrefix:t,onRender:n,handleStepClick:i,disabled:a}=this,l=D(this.$slots.default,s=>{const v=s||this.description;return v?o("div",{class:`${t}-step-content__description`},v):null});return n?.(),o("div",{class:[`${t}-step`,a&&`${t}-step--disabled`,!a&&i&&`${t}-step--clickable`,this.themeClass,l&&`${t}-step--show-description`,`${t}-step--${this.mergedStatus}-status`],style:this.cssVars,onClick:i},o("div",{class:`${t}-step-indicator`},o("div",{class:`${t}-step-indicator-slot`},o(de,null,{default:()=>D(this.$slots.icon,s=>{const{mergedStatus:v,stepsSlots:r}=this;return v==="finish"||v==="error"?v==="finish"?o(_,{clsPrefix:t,key:"finish"},{default:()=>N(r["finish-icon"],()=>[o(pe,null)])}):v==="error"?o(_,{clsPrefix:t,key:"error"},{default:()=>N(r["error-icon"],()=>[o(fe,null)])}):null:s||o("div",{key:this.internalIndex,class:`${t}-step-indicator-slot__index`},this.internalIndex)})})),this.vertical?o("div",{class:`${t}-step-splitor`}):null),o("div",{class:`${t}-step-content`},o("div",{class:`${t}-step-content-header`},o("div",{class:`${t}-step-content-header__title`},N(this.$slots.title,()=>[this.title])),this.vertical?null:o("div",{class:`${t}-step-splitor`})),l))}}),Ue="_full_zwx1m_1",ke={full:Ue,"n-step-content__description":"_n-step-content__description_zwx1m_6","bg-image":"_bg-image_zwx1m_9"},Ne=()=>q("configs"),Ve=h({setup(){ve(async()=>{await me(),he()&&ge()});const t=$({});xe(async()=>{const a=await E.api.init.configs.default.get();Object.assign(t,a)}),j("configs",t);const n=z(0),i=a=>n.value>a?"finish":n.value<a?"wait":"process";return()=>e("div",{class:ke.full},[e(be,{title:"初始化",class:"modal-card sm form-card m-auto"},{default:()=>[e(Fe,{onUpdateCurrent:a=>{a<n.value&&(n.value=a)},size:"small",current:n.value},{default:()=>[e(S,{status:n.value>0?"finish":"process",title:"(๑•̀ㅂ•́)و✧",description:"让我们开始吧"},null),e(S,{status:i(1),title:"站点设置",description:"先设置一下站点相关配置吧"},null),e(S,{status:i(2),title:"主人信息",description:"请告诉你的名字"},null),e(S,{status:i(3),title:"(๑•̀ㅂ•́)و✧",description:"一切就绪了"},null)]}),e("div",{class:"mt-[3.5rem]"},[JSON.stringify(t)==="{}"?e("div",{class:"py-4 text-center"},[e(Ce,null,null)]):o([$e,Ae,Te,De][n.value],{onNext(){n.value++}})])]})])}}),F={onNext:{type:Function,required:!0}},$e=h({props:F,setup(t){const n=async()=>{const i=document.createElement("input");i.type="file",i.style.cssText="position: absolute; opacity: 0; z-index: -9999;top: 0; left: 0",i.accept=".zip",document.body.append(i),i.click(),i.addEventListener("change",()=>{const a=i.files[0],l=new FormData;l.append("file",a),E.api.init.restore.post({data:l,timeout:1073741824}).then(()=>{message.success("恢复成功，页面将会重载"),setTimeout(()=>{location.reload()},1e3)})})};return()=>e("div",{class:"flex justify-center space-x-4 text-center"},[e(w,{type:"default",round:!0,onClick:n},{default:()=>[C("还原备份")]}),e(w,{type:"primary",round:!0,onClick:()=>{t.onNext()}},{default:()=>[C("开始")]})])}}),Ae=h({props:F,setup(t){const n=Ne(),i=z(n?.seo?.title||""),a=z(n?.seo?.keywords),l=z(n?.seo?.description||""),s=$({adminUrl:`${location.origin}/qaqdmin`,serverUrl:`${location.origin}/api/v2`,webUrl:location.origin,wsUrl:location.origin}),v=async()=>{await Promise.all([E.api.init.configs("seo").patch({data:{title:i.value,keywords:a.value,description:l.value}}),E.api.init.configs("url").patch({data:{...s}})]),t.onNext()};return()=>e(M,null,{default:()=>[e(d,{label:"站点标题",required:!0},{default:()=>[e(f,{value:i.value,onUpdateValue:r=>void(i.value=r)},null)]}),e(d,{label:"站点描述",required:!0},{default:()=>[e(f,{value:l.value,onUpdateValue:r=>void(l.value=r)},null)]}),e(d,{label:"关键字"},{default:()=>[e(ye,{value:a.value,onUpdateValue:r=>void(a.value=r)},null)]}),e(d,{label:"前端地址"},{default:()=>[e(f,{value:s.webUrl,onInput:r=>void(s.webUrl=r)},null)]}),e(d,{label:"API 地址"},{default:()=>[e(f,{value:s.serverUrl,onInput:r=>void(s.serverUrl=r)},null)]}),e(d,{label:"后台地址"},{default:()=>[e(f,{value:s.adminUrl,onInput:r=>void(s.adminUrl=r)},null)]}),e(d,{label:"Gateway 地址"},{default:()=>[e(f,{value:s.wsUrl,onInput:r=>void(s.wsUrl=r)},null)]}),e(A,{justify:"end"},{default:()=>[e(w,{onClick:v,round:!0,type:"primary",disabled:!i.value||!l.value},{default:()=>[C("下一步")]})]})]})}}),Te=h({props:F,setup(t){const n=$({}),i=z(""),a=ze(),l=async()=>{if(i.value!==n.password){a.error("两次密码不一致");return}for(const s in n)n[s]===""&&(n[s]=void 0);await E.api.user.register.post({data:{...n}}),t.onNext()};return()=>e(M,null,{default:()=>[e(d,{label:"你的名字 (登录凭证)",required:!0},{default:()=>[e(f,{value:n.username,onUpdateValue:s=>{n.username=s}},null)]}),e(d,{label:"昵称"},{default:()=>[e(f,{value:n.name,onUpdateValue:s=>{n.name=s}},null)]}),e(d,{label:"邮箱",required:!0},{default:()=>[e(f,{value:n.mail,onUpdateValue:s=>{n.mail=s}},null)]}),e(d,{label:"密码",required:!0},{default:()=>[e(f,{value:n.password,type:"password",onUpdateValue:s=>{n.password=s}},null)]}),e(d,{label:"确认密码",required:!0},{default:()=>[e(f,{value:i.value,type:"password",onUpdateValue:s=>{i.value=s}},null)]}),e(d,{label:"个人首页"},{default:()=>[e(f,{value:n.url,onUpdateValue:s=>{n.url=s}},null)]}),e(d,{label:"头像"},{default:()=>[e(f,{value:n.avatar,onUpdateValue:s=>{n.avatar=s}},null)]}),e(d,{label:"个人介绍"},{default:()=>[e(f,{value:n.introduce,onUpdateValue:s=>{n.introduce=s}},null)]}),e(A,{justify:"end"},{default:()=>[e(w,{disabled:!n.username||!n.mail||!n.password||!i.value,onClick:l,round:!0,type:"primary"},{default:()=>[C("下一步")]})]})]})}}),De=h({props:F,setup(){return()=>e(A,{class:"text-center",vertical:!0},{default:()=>[e("span",{class:"text-base"},[C("你已经完成了所有的步骤，干得漂亮。")]),e(w,{type:"primary",round:!0,onClick:()=>{localStorage.setItem("to-setting","true"),ne(),setTimeout(()=>{location.reload()},200)}},{default:()=>[C("LINK START")]})]})}});export{Ve as default};

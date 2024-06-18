import{s as ne}from"./confetti-D3WRURFJ.js";import{aB as c,aC as I,aD as w,aE as S,dt as U,ce as se,d as h,aF as V,bd as ae,aG as P,aH as j,aI as o,bk as ie,bl as re,aJ as oe,dH as le,aL as q,aM as ue,a2 as z,aN as ce,aO as D,aP as A,dn as de,bv as _,dI as pe,dJ as fe,aQ as g,c6 as R,ax as ve,dK as ge,at as he,c1 as me,r as N,o as xe,R as y,b as C,e,n as be,aX as we,dh as E,g as m,T as d,s as f,b2 as ze,i as $,p as M,c as Ce,f as ye}from"./index-DYGX83NG.js";const Ee=c("steps",`
 width: 100%;
 display: flex;
`,[c("step",`
 position: relative;
 display: flex;
 flex: 1;
 `,[I("disabled","cursor: not-allowed"),I("clickable",`
 cursor: pointer;
 `),w("&:last-child",[c("step-splitor","display: none;")])]),c("step-splitor",`
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
 `,[S("title",`
 white-space: nowrap;
 flex: 0;
 `)]),S("description",`
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
 `,[S("index",`
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
 `,[U()]),c("icon",`
 color: var(--n-indicator-text-color);
 transition: color .3s var(--n-bezier);
 `,[U()]),c("base-icon",`
 color: var(--n-indicator-text-color);
 transition: color .3s var(--n-bezier);
 `,[U()])])]),I("vertical","flex-direction: column;",[se("show-description",[w(">",[c("step","padding-bottom: 8px;")])]),w(">",[c("step","margin-bottom: 16px;",[w("&:last-child","margin-bottom: 0;"),w(">",[c("step-indicator",[w(">",[c("step-splitor",`
 position: absolute;
 bottom: -8px;
 width: 1px;
 margin: 0 !important;
 left: calc(var(--n-indicator-size) / 2);
 height: calc(100% - var(--n-indicator-size));
 `)])]),c("step-content",[S("description","margin-top: 8px;")])])])])])]);function Be(t,n){return typeof t!="object"||t===null||Array.isArray(t)?null:(t.props||(t.props={}),t.props.internalIndex=n+1,t)}function Se(t){return t.map((n,a)=>Be(n,a))}const Fe=Object.assign(Object.assign({},P.props),{current:Number,status:{type:String,default:"process"},size:{type:String,default:"medium"},vertical:Boolean,"onUpdate:current":[Function,Array],onUpdateCurrent:[Function,Array]}),H=oe("n-steps"),ke=h({name:"Steps",props:Fe,setup(t,{slots:n}){const{mergedClsPrefixRef:a,mergedRtlRef:i}=V(t),l=ae("Steps",i,a),s=P("Steps","-steps",Ee,le,t,a);return j(H,{props:t,mergedThemeRef:s,mergedClsPrefixRef:a,stepsSlots:n}),{mergedClsPrefix:a,rtlEnabled:l}},render(){const{mergedClsPrefix:t}=this;return o("div",{class:[`${t}-steps`,this.rtlEnabled&&`${t}-steps--rtl`,this.vertical&&`${t}-steps--vertical`]},Se(ie(re(this))))}}),Ie={status:String,title:String,description:String,disabled:Boolean,internalIndex:{type:Number,default:0}},F=h({name:"Step",props:Ie,setup(t){const n=q(H,null);n||ue("step","`n-step` must be placed inside `n-steps`.");const{inlineThemeDisabled:a}=V(),{props:i,mergedThemeRef:l,mergedClsPrefixRef:s,stepsSlots:v}=n,r=z(()=>i.vertical),B=z(()=>{const{status:u}=t;if(u)return u;{const{internalIndex:p}=t,{current:b}=i;if(b===void 0)return"process";if(p<b)return"finish";if(p===b)return i.status||"process";if(p>b)return"wait"}return"process"}),T=z(()=>{const{value:u}=B,{size:p}=i,{common:{cubicBezierEaseInOut:b},self:{stepHeaderFontWeight:K,[g("stepHeaderFontSize",p)]:L,[g("indicatorIndexFontSize",p)]:W,[g("indicatorSize",p)]:J,[g("indicatorIconSize",p)]:G,[g("indicatorTextColor",u)]:Q,[g("indicatorBorderColor",u)]:X,[g("headerTextColor",u)]:Y,[g("splitorColor",u)]:Z,[g("indicatorColor",u)]:ee,[g("descriptionTextColor",u)]:te}}=l.value;return{"--n-bezier":b,"--n-description-text-color":te,"--n-header-text-color":Y,"--n-indicator-border-color":X,"--n-indicator-color":ee,"--n-indicator-icon-size":G,"--n-indicator-index-font-size":W,"--n-indicator-size":J,"--n-indicator-text-color":Q,"--n-splitor-color":Z,"--n-step-header-font-size":L,"--n-step-header-font-weight":K}}),x=a?ce("step",z(()=>{const{value:u}=B,{size:p}=i;return`${u[0]}${p[0]}`}),T,i):void 0,O=z(()=>{if(t.disabled)return;const{onUpdateCurrent:u,"onUpdate:current":p}=i;return u||p?()=>{u&&R(u,t.internalIndex),p&&R(p,t.internalIndex)}:void 0});return{stepsSlots:v,mergedClsPrefix:s,vertical:r,mergedStatus:B,handleStepClick:O,cssVars:a?void 0:T,themeClass:x?.themeClass,onRender:x?.onRender}},render(){const{mergedClsPrefix:t,onRender:n,handleStepClick:a,disabled:i}=this,l=D(this.$slots.default,s=>{const v=s||this.description;return v?o("div",{class:`${t}-step-content__description`},v):null});return n?.(),o("div",{class:[`${t}-step`,i&&`${t}-step--disabled`,!i&&a&&`${t}-step--clickable`,this.themeClass,l&&`${t}-step--show-description`,`${t}-step--${this.mergedStatus}-status`],style:this.cssVars,onClick:a},o("div",{class:`${t}-step-indicator`},o("div",{class:`${t}-step-indicator-slot`},o(de,null,{default:()=>D(this.$slots.icon,s=>{const{mergedStatus:v,stepsSlots:r}=this;return v==="finish"||v==="error"?v==="finish"?o(_,{clsPrefix:t,key:"finish"},{default:()=>A(r["finish-icon"],()=>[o(pe,null)])}):v==="error"?o(_,{clsPrefix:t,key:"error"},{default:()=>A(r["error-icon"],()=>[o(fe,null)])}):null:s||o("div",{key:this.internalIndex,class:`${t}-step-indicator-slot__index`},this.internalIndex)})})),this.vertical?o("div",{class:`${t}-step-splitor`}):null),o("div",{class:`${t}-step-content`},o("div",{class:`${t}-step-content-header`},o("div",{class:`${t}-step-content-header__title`},A(this.$slots.title,()=>[this.title])),this.vertical?null:o("div",{class:`${t}-step-splitor`})),l))}}),Ue="_full_zwx1m_1",Ae={full:Ue,"n-step-content__description":"_n-step-content__description_zwx1m_6","bg-image":"_bg-image_zwx1m_9"},Ne=()=>q("configs"),Pe=h({setup(){ve(async()=>{await ge(),he()&&me()});const t=N({});xe(async()=>{const i=await y.api.init.configs.default.get();Object.assign(t,i)}),j("configs",t);const n=C(0),a=i=>n.value>i?"finish":n.value<i?"wait":"process";return()=>e("div",{class:Ae.full},[e(be,{title:"初始化",class:"modal-card sm form-card m-auto card-shadow"},{default:()=>[e(ke,{onUpdateCurrent:i=>{i<n.value&&(n.value=i)},size:"small",current:n.value},{default:()=>[e(F,{status:n.value>0?"finish":"process",title:"(๑•̀ㅂ•́)و✧",description:"让我们开始吧",class:"text-sm"},null),e(F,{status:a(1),title:"站点设置",description:"先设置一下站点相关配置吧",class:"text-sm"},null),e(F,{status:a(2),title:"主人信息",description:"请告诉你的名字",class:"text-sm"},null),e(F,{status:a(3),title:"(๑•̀ㅂ•́)و✧",description:"一切就绪了",class:"text-sm"},null)]}),e("div",{class:"mt-[3.5rem]"},[JSON.stringify(t)==="{}"?e("div",{class:"py-4 text-center"},[e(we,null,null)]):o([$e,Te,De,_e][n.value],{onNext(){n.value++}})])]})])}}),k={onNext:{type:Function,required:!0}},$e=h({props:k,setup(t){const n=async()=>{const a=document.createElement("input");a.type="file",a.style.cssText="position: absolute; opacity: 0; z-index: -9999;top: 0; left: 0",a.accept=".zip",document.body.append(a),a.click(),a.addEventListener("change",()=>{const i=a.files[0],l=new FormData;l.append("file",i),y.api.init.restore.post({data:l,timeout:1073741824}).then(()=>{message.success("恢复成功，页面将会重载"),setTimeout(()=>{location.reload()},1e3)})})};return()=>e("div",{class:"flex justify-center space-x-4 text-center"},[e(E,{variant:"secondary",onClick:n},{default:()=>[e("span",{class:"mx-2"},[m("还原备份")])]}),e(E,{variant:"primary",class:"rounded-full shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur-none transitio dark:ring-white/10 dark:hover:ring-white/20",onClick:()=>{t.onNext()}},{default:()=>[e("span",{class:"mx-2"},[m(" 开始 ")])]})])}}),Te=h({props:k,setup(t){const n=Ne(),a=C(n?.seo?.title||""),i=C(n?.seo?.keywords),l=C(n?.seo?.description||""),s=N({adminUrl:`${location.origin}/qaqdmin`,serverUrl:`${location.origin}/api/v2`,webUrl:location.origin,wsUrl:location.origin}),v=async()=>{await Promise.all([y.api.init.configs("seo").patch({data:{title:a.value,keywords:i.value,description:l.value}}),y.api.init.configs("url").patch({data:{...s}})]),t.onNext()};return()=>e(M,null,{default:()=>[e(d,{label:"站点标题",required:!0},{default:()=>[e(f,{value:a.value,onUpdateValue:r=>void(a.value=r),class:"rounded-lg"},null)]}),e(d,{label:"站点描述",required:!0},{default:()=>[e(f,{value:l.value,onUpdateValue:r=>void(l.value=r),class:"rounded-lg"},null)]}),e(d,{label:"关键字"},{default:()=>[e(ze,{value:i.value,onUpdateValue:r=>void(i.value=r)},{trigger(r){return e(h({setup(){return()=>e("button",{onClick:r.activate},[e("div",{class:ye("border-foreground-400/80 w-fit items-center justify-center !text-[#2080f0] inline-flex space-x-1","transition-colors ease-in-out duration-300 hover:!text-[#4098fc]")},[e("i",{class:"icon-[mingcute--add-line] size-4"},null),e("span",null,[m("添加")])])])}}),null,null)}})]}),e(d,{label:"前端地址"},{default:()=>[e(f,{value:s.webUrl,onInput:r=>void(s.webUrl=r),class:"rounded-lg"},null)]}),e(d,{label:"API 地址"},{default:()=>[e(f,{value:s.serverUrl,onInput:r=>void(s.serverUrl=r),class:"rounded-lg"},null)]}),e(d,{label:"后台地址"},{default:()=>[e(f,{value:s.adminUrl,onInput:r=>void(s.adminUrl=r),class:"rounded-lg"},null)]}),e(d,{label:"Gateway 地址"},{default:()=>[e(f,{value:s.wsUrl,onInput:r=>void(s.wsUrl=r),class:"rounded-lg"},null)]}),e($,{justify:"end"},{default:()=>[e(E,{onClick:v,variant:"primary",class:"rounded-full shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur-none transitio dark:ring-white/10 dark:hover:ring-white/20",disabled:!a.value||!l.value},{default:()=>[e("span",{class:"mx-2"},[m("下一步")])]})]})]})}}),De=h({props:k,setup(t){const n=N({}),a=C(""),i=Ce(),l=async()=>{if(a.value!==n.password){i.error("两次密码不一致");return}for(const s in n)n[s]===""&&(n[s]=void 0);await y.api.user.register.post({data:{...n}}),t.onNext()};return()=>e(M,null,{default:()=>[e(d,{label:"你的名字 (登录凭证)",required:!0},{default:()=>[e(f,{value:n.username,onUpdateValue:s=>{n.username=s},class:"rounded-lg"},null)]}),e(d,{label:"昵称"},{default:()=>[e(f,{value:n.name,onUpdateValue:s=>{n.name=s},class:"rounded-lg"},null)]}),e(d,{label:"邮箱",required:!0},{default:()=>[e(f,{value:n.mail,onUpdateValue:s=>{n.mail=s},class:"rounded-lg"},null)]}),e(d,{label:"密码",required:!0},{default:()=>[e(f,{value:n.password,type:"password",onUpdateValue:s=>{n.password=s},class:"rounded-lg"},null)]}),e(d,{label:"确认密码",required:!0},{default:()=>[e(f,{value:a.value,type:"password",onUpdateValue:s=>{a.value=s},class:"rounded-lg"},null)]}),e(d,{label:"个人首页"},{default:()=>[e(f,{value:n.url,onUpdateValue:s=>{n.url=s},class:"rounded-lg"},null)]}),e(d,{label:"头像"},{default:()=>[e(f,{value:n.avatar,onUpdateValue:s=>{n.avatar=s},class:"rounded-lg"},null)]}),e(d,{label:"个人介绍"},{default:()=>[e(f,{value:n.introduce,onUpdateValue:s=>{n.introduce=s},class:"rounded-lg"},null)]}),e($,{justify:"end"},{default:()=>[e(E,{disabled:!n.username||!n.mail||!n.password||!a.value,onClick:l,variant:"primary",class:"rounded-full shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur-none transitio dark:ring-white/10 dark:hover:ring-white/20"},{default:()=>[e("span",{class:"mx-2"},[m("下一步")])]})]})]})}}),_e=h({props:k,setup(){return()=>e($,{class:"text-center",vertical:!0},{default:()=>[e("span",{class:"text-base"},[m("你已经完成了所有的步骤，干得漂亮。")]),e(E,{variant:"primary",class:"rounded-full shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur-none transitio dark:ring-white/10 dark:hover:ring-white/20",onClick:()=>{localStorage.setItem("to-setting","true"),ne(),setTimeout(()=>{location.reload()},200)}},{default:()=>[e("span",{class:"mx-2"},[m(" LINK START ")])]})]})}});export{Pe as default};

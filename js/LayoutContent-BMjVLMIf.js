import{aJ as g,aB as y,aC as j,d as L,aG as v,b as m,aF as O,aH as z,c4 as I,a2 as S,aN as P,aI as c,c5 as E,c7 as $}from"./index-DYGX83NG.js";const k=g("n-layout-sider"),w={type:String,default:"static"},B=y("layout",`
 color: var(--n-text-color);
 background-color: var(--n-color);
 box-sizing: border-box;
 position: relative;
 z-index: auto;
 flex: auto;
 overflow: hidden;
 transition:
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
`,[y("layout-scroll-container",`
 overflow-x: hidden;
 box-sizing: border-box;
 height: 100%;
 `),j("absolute-positioned",`
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 `)]),N={embedded:Boolean,position:w,nativeScrollbar:{type:Boolean,default:!0},scrollbarProps:Object,onScroll:Function,contentClass:String,contentStyle:{type:[String,Object],default:""},hasSider:Boolean,siderPlacement:{type:String,default:"left"}},K=g("n-layout");function x(d){return L({name:d?"LayoutContent":"Layout",props:Object.assign(Object.assign({},v.props),N),setup(e){const s=m(null),r=m(null),{mergedClsPrefixRef:a,inlineThemeDisabled:i}=O(e),u=v("Layout","-layout",B,$,e,a);function C(t,o){if(e.nativeScrollbar){const{value:l}=s;l&&(o===void 0?l.scrollTo(t):l.scrollTo(t,o))}else{const{value:l}=r;l&&l.scrollTo(t,o)}}z(K,e);let h=0,b=0;const p=t=>{var o;const l=t.target;h=l.scrollLeft,b=l.scrollTop,(o=e.onScroll)===null||o===void 0||o.call(e,t)};I(()=>{if(e.nativeScrollbar){const t=s.value;t&&(t.scrollTop=b,t.scrollLeft=h)}});const T={display:"flex",flexWrap:"nowrap",width:"100%",flexDirection:"row"},R={scrollTo:C},f=S(()=>{const{common:{cubicBezierEaseInOut:t},self:o}=u.value;return{"--n-bezier":t,"--n-color":e.embedded?o.colorEmbedded:o.color,"--n-text-color":o.textColor}}),n=i?P("layout",S(()=>e.embedded?"e":""),f,e):void 0;return Object.assign({mergedClsPrefix:a,scrollableElRef:s,scrollbarInstRef:r,hasSiderStyle:T,mergedTheme:u,handleNativeElScroll:p,cssVars:i?void 0:f,themeClass:n?.themeClass,onRender:n?.onRender},R)},render(){var e;const{mergedClsPrefix:s,hasSider:r}=this;(e=this.onRender)===null||e===void 0||e.call(this);const a=r?this.hasSiderStyle:void 0,i=[this.themeClass,d&&`${s}-layout-content`,`${s}-layout`,`${s}-layout--${this.position}-positioned`];return c("div",{class:i,style:this.cssVars},this.nativeScrollbar?c("div",{ref:"scrollableElRef",class:[`${s}-layout-scroll-container`,this.contentClass],style:[this.contentStyle,a],onScroll:this.handleNativeElScroll},this.$slots):c(E,Object.assign({},this.scrollbarProps,{onScroll:this.onScroll,ref:"scrollbarInstRef",theme:this.mergedTheme.peers.Scrollbar,themeOverrides:this.mergedTheme.peerOverrides.Scrollbar,contentClass:this.contentClass,contentStyle:[this.contentStyle,a]}),this.$slots))}})}const D=x(!1),F=x(!0);export{F as N,k as a,D as b,K as l,w as p};

import{r as d,j as i,L as O,a as H}from"./app-DztS-QGv.js";import{A as J}from"./ApplicationLogo-CCxgl-tO.js";import{K as X}from"./transition-76yCM2aI.js";const F=d.createContext(),j=({children:e})=>{const[t,r]=d.useState(!1),a=()=>{r(o=>!o)};return i.jsx(F.Provider,{value:{open:t,setOpen:r,toggleOpen:a},children:i.jsx("div",{className:"relative",children:e})})},ee=({children:e})=>{const{open:t,setOpen:r,toggleOpen:a}=d.useContext(F);return i.jsxs(i.Fragment,{children:[i.jsx("div",{onClick:a,children:e}),t&&i.jsx("div",{className:"fixed inset-0 z-40",onClick:()=>r(!1)})]})},te=({align:e="right",width:t="48",contentClasses:r="py-1 bg-white",children:a})=>{const{open:o,setOpen:n}=d.useContext(F);let s="origin-top";e==="left"?s="ltr:origin-top-left rtl:origin-top-right start-0":e==="right"&&(s="ltr:origin-top-right rtl:origin-top-left end-0");let l="";return t==="48"&&(l="w-48"),i.jsx(i.Fragment,{children:i.jsx(X,{show:o,enter:"transition ease-out duration-200",enterFrom:"opacity-0 scale-95",enterTo:"opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"opacity-100 scale-100",leaveTo:"opacity-0 scale-95",children:i.jsx("div",{className:`absolute z-50 mt-2 rounded-md shadow-lg ${s} ${l}`,onClick:()=>n(!1),children:i.jsx("div",{className:"rounded-md ring-1 ring-black ring-opacity-5 "+r,children:a})})})})},re=({className:e="",children:t,...r})=>i.jsx(O,{...r,className:"block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none "+e,children:t});j.Trigger=ee;j.Content=te;j.Link=re;function B({active:e=!1,className:t="",children:r,...a}){return i.jsx(O,{...a,className:"inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none "+(e?"border-indigo-400 text-gray-900 focus:border-indigo-700":"border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700")+t,children:r})}function E({active:e=!1,className:t="",children:r,...a}){return i.jsx(O,{...a,className:`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${e?"border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800":"border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800"} text-base font-medium transition duration-150 ease-in-out focus:outline-none ${t}`,children:r})}let se={data:""},ae=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||se},ie=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,oe=/\/\*[^]*?\*\/|  +/g,K=/\n+/g,w=(e,t)=>{let r="",a="",o="";for(let n in e){let s=e[n];n[0]=="@"?n[1]=="i"?r=n+" "+s+";":a+=n[1]=="f"?w(s,n):n+"{"+w(s,n[1]=="k"?"":t)+"}":typeof s=="object"?a+=w(s,t?t.replace(/([^,])+/g,l=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,c=>/&/.test(c)?c.replace(/&/g,l):l?l+" "+c:c)):n):s!=null&&(n=/^--/.test(n)?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=w.p?w.p(n,s):n+":"+s+";")}return r+(t&&o?t+"{"+o+"}":o)+a},b={},W=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+W(e[r]);return t}return e},ne=(e,t,r,a,o)=>{let n=W(e),s=b[n]||(b[n]=(c=>{let m=0,p=11;for(;m<c.length;)p=101*p+c.charCodeAt(m++)>>>0;return"go"+p})(n));if(!b[s]){let c=n!==e?e:(m=>{let p,u,f=[{}];for(;p=ie.exec(m.replace(oe,""));)p[4]?f.shift():p[3]?(u=p[3].replace(K," ").trim(),f.unshift(f[0][u]=f[0][u]||{})):f[0][p[1]]=p[2].replace(K," ").trim();return f[0]})(e);b[s]=w(o?{["@keyframes "+s]:c}:c,r?"":"."+s)}let l=r&&b.g?b.g:null;return r&&(b.g=b[s]),((c,m,p,u)=>{u?m.data=m.data.replace(u,c):m.data.indexOf(c)===-1&&(m.data=p?c+m.data:m.data+c)})(b[s],t,a,l),s},le=(e,t,r)=>e.reduce((a,o,n)=>{let s=t[n];if(s&&s.call){let l=s(r),c=l&&l.props&&l.props.className||/^go/.test(l)&&l;s=c?"."+c:l&&typeof l=="object"?l.props?"":w(l,""):l===!1?"":l}return a+o+(s??"")},"");function z(e){let t=this||{},r=e.call?e(t.p):e;return ne(r.unshift?r.raw?le(r,[].slice.call(arguments,1),t.p):r.reduce((a,o)=>Object.assign(a,o&&o.call?o(t.p):o),{}):r,ae(t.target),t.g,t.o,t.k)}let U,M,I;z.bind({g:1});let v=z.bind({k:1});function de(e,t,r,a){w.p=t,U=e,M=r,I=a}function N(e,t){let r=this||{};return function(){let a=arguments;function o(n,s){let l=Object.assign({},n),c=l.className||o.className;r.p=Object.assign({theme:M&&M()},l),r.o=/ *go\d+/.test(c),l.className=z.apply(r,a)+(c?" "+c:"");let m=e;return e[0]&&(m=l.as||e,delete l.as),I&&m[0]&&I(l),U(m,l)}return t?t(o):o}}var ce=e=>typeof e=="function",D=(e,t)=>ce(e)?e(t):e,ue=(()=>{let e=0;return()=>(++e).toString()})(),Y=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),me=20,_="default",Z=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(s=>s.id===t.toast.id?{...s,...t.toast}:s)};case 2:let{toast:a}=t;return Z(e,{type:e.toasts.find(s=>s.id===a.id)?1:0,toast:a});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(s=>s.id===o||o===void 0?{...s,dismissed:!0,visible:!1}:s)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(s=>s.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let n=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(s=>({...s,pauseDuration:s.pauseDuration+n}))}}},L=[],q={toasts:[],pausedAt:void 0,settings:{toastLimit:me}},y={},Q=(e,t=_)=>{y[t]=Z(y[t]||q,e),L.forEach(([r,a])=>{r===t&&a(y[t])})},V=e=>Object.keys(y).forEach(t=>Q(e,t)),pe=e=>Object.keys(y).find(t=>y[t].toasts.some(r=>r.id===e)),A=(e=_)=>t=>{Q(t,e)},fe={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},ge=(e={},t=_)=>{let[r,a]=d.useState(y[t]||q),o=d.useRef(y[t]);d.useEffect(()=>(o.current!==y[t]&&a(y[t]),L.push([t,a]),()=>{let s=L.findIndex(([l])=>l===t);s>-1&&L.splice(s,1)}),[t]);let n=r.toasts.map(s=>{var l,c,m;return{...e,...e[s.type],...s,removeDelay:s.removeDelay||((l=e[s.type])==null?void 0:l.removeDelay)||(e==null?void 0:e.removeDelay),duration:s.duration||((c=e[s.type])==null?void 0:c.duration)||(e==null?void 0:e.duration)||fe[s.type],style:{...e.style,...(m=e[s.type])==null?void 0:m.style,...s.style}}});return{...r,toasts:n}},he=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(r==null?void 0:r.id)||ue()}),k=e=>(t,r)=>{let a=he(t,e,r);return A(a.toasterId||pe(a.id))({type:2,toast:a}),a.id},g=(e,t)=>k("blank")(e,t);g.error=k("error");g.success=k("success");g.loading=k("loading");g.custom=k("custom");g.dismiss=(e,t)=>{let r={type:3,toastId:e};t?A(t)(r):V(r)};g.dismissAll=e=>g.dismiss(void 0,e);g.remove=(e,t)=>{let r={type:4,toastId:e};t?A(t)(r):V(r)};g.removeAll=e=>g.remove(void 0,e);g.promise=(e,t,r)=>{let a=g.loading(t.loading,{...r,...r==null?void 0:r.loading});return typeof e=="function"&&(e=e()),e.then(o=>{let n=t.success?D(t.success,o):void 0;return n?g.success(n,{id:a,...r,...r==null?void 0:r.success}):g.dismiss(a),o}).catch(o=>{let n=t.error?D(t.error,o):void 0;n?g.error(n,{id:a,...r,...r==null?void 0:r.error}):g.dismiss(a)}),e};var xe=1e3,ye=(e,t="default")=>{let{toasts:r,pausedAt:a}=ge(e,t),o=d.useRef(new Map).current,n=d.useCallback((u,f=xe)=>{if(o.has(u))return;let h=setTimeout(()=>{o.delete(u),s({type:4,toastId:u})},f);o.set(u,h)},[]);d.useEffect(()=>{if(a)return;let u=Date.now(),f=r.map(h=>{if(h.duration===1/0)return;let C=(h.duration||0)+h.pauseDuration-(u-h.createdAt);if(C<0){h.visible&&g.dismiss(h.id);return}return setTimeout(()=>g.dismiss(h.id,t),C)});return()=>{f.forEach(h=>h&&clearTimeout(h))}},[r,a,t]);let s=d.useCallback(A(t),[t]),l=d.useCallback(()=>{s({type:5,time:Date.now()})},[s]),c=d.useCallback((u,f)=>{s({type:1,toast:{id:u,height:f}})},[s]),m=d.useCallback(()=>{a&&s({type:6,time:Date.now()})},[a,s]),p=d.useCallback((u,f)=>{let{reverseOrder:h=!1,gutter:C=8,defaultPosition:R}=f||{},P=r.filter(x=>(x.position||R)===(u.position||R)&&x.height),G=P.findIndex(x=>x.id===u.id),S=P.filter((x,T)=>T<G&&x.visible).length;return P.filter(x=>x.visible).slice(...h?[S+1]:[0,S]).reduce((x,T)=>x+(T.height||0)+C,0)},[r]);return d.useEffect(()=>{r.forEach(u=>{if(u.dismissed)n(u.id,u.removeDelay);else{let f=o.get(u.id);f&&(clearTimeout(f),o.delete(u.id))}})},[r,n]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:m,calculateOffset:p}}},be=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,ve=v`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,je=v`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,we=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${be} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${ve} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${je} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Ne=v`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ke=N("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Ne} 1s linear infinite;
`,Ce=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Ee=v`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,$e=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ce} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Ee} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Le=N("div")`
  position: absolute;
`,De=N("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Oe=v`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ze=N("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Oe} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Ae=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return t!==void 0?typeof t=="string"?d.createElement(ze,null,t):t:r==="blank"?null:d.createElement(De,null,d.createElement(ke,{...a}),r!=="loading"&&d.createElement(Le,null,r==="error"?d.createElement(we,{...a}):d.createElement($e,{...a})))},Pe=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Te=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Me="0%{opacity:0;} 100%{opacity:1;}",Ie="0%{opacity:1;} 100%{opacity:0;}",Fe=N("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,_e=N("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Re=(e,t)=>{let r=e.includes("top")?1:-1,[a,o]=Y()?[Me,Ie]:[Pe(r),Te(r)];return{animation:t?`${v(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${v(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Se=d.memo(({toast:e,position:t,style:r,children:a})=>{let o=e.height?Re(e.position||t||"top-center",e.visible):{opacity:0},n=d.createElement(Ae,{toast:e}),s=d.createElement(_e,{...e.ariaProps},D(e.message,e));return d.createElement(Fe,{className:e.className,style:{...o,...r,...e.style}},typeof a=="function"?a({icon:n,message:s}):d.createElement(d.Fragment,null,n,s))});de(d.createElement);var He=({id:e,className:t,style:r,onHeightUpdate:a,children:o})=>{let n=d.useCallback(s=>{if(s){let l=()=>{let c=s.getBoundingClientRect().height;a(e,c)};l(),new MutationObserver(l).observe(s,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return d.createElement("div",{ref:n,className:t,style:r},o)},Be=(e,t)=>{let r=e.includes("top"),a=r?{top:0}:{bottom:0},o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:Y()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...a,...o}},Ke=z`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,$=16,We=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:o,toasterId:n,containerStyle:s,containerClassName:l})=>{let{toasts:c,handlers:m}=ye(r,n);return d.createElement("div",{"data-rht-toaster":n||"",style:{position:"fixed",zIndex:9999,top:$,left:$,right:$,bottom:$,pointerEvents:"none",...s},className:l,onMouseEnter:m.startPause,onMouseLeave:m.endPause},c.map(p=>{let u=p.position||t,f=m.calculateOffset(p,{reverseOrder:e,gutter:a,defaultPosition:t}),h=Be(u,f);return d.createElement(He,{id:p.id,key:p.id,onHeightUpdate:m.updateHeight,className:p.visible?Ke:"",style:h},p.type==="custom"?D(p.message,p):o?o(p):d.createElement(Se,{toast:p,position:u}))}))},qe=g;function Qe({header:e,children:t}){const r=H().props.auth.user,a=H().props.auth.current_dokan,[o,n]=d.useState(!1);return i.jsxs("div",{className:"min-h-screen bg-gray-100",children:[i.jsx("div",{children:i.jsx(We,{position:"top-right",reverseOrder:!1})}),i.jsxs("nav",{className:"border-b border-gray-100 bg-white",children:[i.jsx("div",{className:"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ",children:i.jsxs("div",{className:"flex h-16 justify-between",children:[i.jsxs("div",{className:"flex",children:[i.jsx("div",{className:"flex shrink-0 items-center",children:i.jsx(O,{href:"/",children:i.jsx(J,{className:"block h-9 w-auto fill-current text-gray-800"})})}),i.jsx("div",{className:"hidden space-x-8 sm:-my-px sm:ms-10 sm:flex",children:i.jsx(B,{href:route("dashboard"),active:route().current("dashboard"),children:"Dashboard"})}),i.jsx("div",{className:"hidden space-x-8 sm:-my-px sm:ms-10 sm:flex",children:i.jsx(B,{href:route("products.index"),active:route().current("products.index"),children:"Products"})})]}),i.jsx("div",{className:"hidden sm:ms-6 sm:flex sm:items-center",children:i.jsx("div",{className:"relative ms-3",children:i.jsxs(j,{children:[i.jsx(j.Trigger,{children:i.jsx("span",{className:"inline-flex rounded-md",children:i.jsxs("button",{type:"button",className:"inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none",children:[r.name,i.jsx("svg",{className:"-me-0.5 ms-2 h-4 w-4",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",children:i.jsx("path",{fillRule:"evenodd",d:"M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",clipRule:"evenodd"})})]})})}),i.jsxs(j.Content,{children:[i.jsx(j.Link,{href:route("profile.edit"),children:"Profile"}),i.jsx(j.Link,{href:route("logout"),method:"post",as:"button",children:"Log Out"})]})]})})}),i.jsx("div",{className:"-me-2 flex items-center sm:hidden",children:i.jsx("button",{onClick:()=>n(s=>!s),className:"inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none",children:i.jsxs("svg",{className:"h-6 w-6",stroke:"currentColor",fill:"none",viewBox:"0 0 24 24",children:[i.jsx("path",{className:o?"hidden":"inline-flex",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M4 6h16M4 12h16M4 18h16"}),i.jsx("path",{className:o?"inline-flex":"hidden",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M6 18L18 6M6 6l12 12"})]})})})]})}),i.jsxs("div",{className:(o?"block":"hidden")+" sm:hidden",children:[i.jsxs("div",{className:"space-y-1 pb-3 pt-2",children:[i.jsx(E,{href:route("dashboard"),active:route().current("dashboard"),children:"Dashboard"}),i.jsx(E,{href:route("products.index"),active:route().current("products.index"),children:"Products"})]}),i.jsxs("div",{className:"border-t border-gray-200 pb-1 pt-4",children:[i.jsxs("div",{className:"px-4",children:[i.jsx("div",{className:"text-base font-medium text-gray-800",children:r.name}),i.jsx("div",{className:"text-sm font-medium text-gray-500",children:r.email})]}),i.jsxs("div",{className:"mt-3 space-y-1",children:[i.jsx(E,{href:route("profile.edit"),children:"Profile"}),i.jsx(E,{method:"post",href:route("logout"),as:"button",children:"Log Out"})]})]})]})]}),e&&i.jsx("header",{className:"bg-white shadow w-full",children:i.jsx("div",{className:"mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8",children:a&&i.jsxs("h2",{className:"text-xl font-semibold leading-tight text-gray-800",children:[a.name," : ",e]})})}),i.jsx("main",{className:"py-6",children:t})]})}export{Qe as A,g as n,qe as z};

!function t(e,n){if("object"==typeof exports&&"object"==typeof module)module.exports=n();else if("function"==typeof define&&define.amd)define([],n);else{var o=n();for(var r in o)("object"==typeof exports?exports:e)[r]=o[r]}}(this,function(){return o={},r.m=n={1:function(t,e,n){"use strict";n.r(e);var o=n(7),p=n.n(o),r=function(){if("string"==typeof self.origin&&~self.origin.indexOf("://"))return self.origin;var t=document.location,e=t.protocol,n=t.host,o;return"".concat(e,"//").concat(n)},i=n(3);n.d(e,"send",function(){return l}),n.d(e,"on",function(){return d}),n.d(e,"off",function(){return y}),n.d(e,"once",function(){return m}),n.d(e,"onRequest",function(){return b}),n.d(e,"request",function(){return v});var a="sqs",c={};function u(e){return Object.freeze(e),Object.getOwnPropertyNames(e).forEach(function(t){!e.hasOwnProperty(t)||null===e[t]||"object"!==p()(e[t])&&"function"!=typeof e[t]||Object.isFrozen(e[t])||u(e[t])}),e}function f(t){return t.origin===r()&&("object"===p()(t.data)&&(t.data.namespace===a&&"string"==typeof t.data.key))}function s(t,e,n){var o;c[t]&&c[t].filter(function(t){return!n||t.signature===n}).forEach(function(t){t.callback.apply(null,[e])})}function l(t,e,n){try{var o={namespace:a,key:t,payload:e,signature:n};window.postMessage(o,r())}catch(t){console.error(t)}}function d(t,e,n){void 0===c[t]&&(c[t]=[]),c[t].push({callback:e,signature:n})}function y(t,e){c[t]=c[t].filter(function(t){return t.callback!==e})}function m(o,e){return new Promise(function(n){var t;d(o,function t(e){y(o,t),n(e)},e)})}function b(e,t,n){d("".concat(e,"-request"),function(){t().then(function(t){l("".concat(e,"-response"),t,n)})},n)}function v(t,e){var n=m("".concat(t,"-response"),e).then(function(t){return t});return l("".concat(t,"-request"),e),n}function g(t,e){var r=[],n=function t(e,n){var o=1<arguments.length&&void 0!==n?n:"";r.push({object:e,path:o})};for(n(t);0<r.length;)for(var o=r.pop(),i=o.object,a=o.path,c,u=0,f=Object.keys(i);u<f.length;u++){var s=f[u],l=i[s],d=""===a?s:"".concat(a,".").concat(s);"object"===p()(l)?n(l,d):i[s]=e(l,d)}return t}function h(t){var e;return u(g(t,function(t,e){return e}))}h(i.a),"undefined"!=typeof window&&window.addEventListener("message",function(t){if(f(t)){var e=t.data,n,o,r;s(e.key,e.payload,e.signature)}})},3:function(t,e,n){"use strict";var o={ready:!0,currency:{active:!0,changed:!0,showOverlay:!0},language:{active:!0,changed:!0,showOverlay:!0},nationality:{isVATApplicable:!0,isInEU:!0}},r={linkClick:!0,loadImages:!0,resize:!0,componentInitialized:!0},i={fetchLogoWall:!0,getTemplate:!0,getCustomerExample:!0},a,c,u,f,s,l={heroHomeNov18:{startAutoplay:!0,stopAutoplay:!0},featuredCustomers:{startAutoplay:!0,stopAutoplay:!0},featureTextGallery:{startAutoplay:!0,stopAutoplay:!0},header:{setDarkBackground:!0,setLightBackground:!0,disableSticky:!0,enableSticky:!0},sideBySideFullBleedSlideshow:{startAutoplay:!0,stopAutoplay:!0}},d=e.a={i18n:o,page:r,taxonomy:i,components:l}},4:function(t,e){function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}t.exports=n},7:function(e,t){function n(t){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function t(e){return typeof e}:function t(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function o(t){return"function"==typeof Symbol&&"symbol"===n(Symbol.iterator)?e.exports=o=function t(e){return n(e)}:e.exports=o=function t(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":n(e)},o(t)}e.exports=o},832:function(t,e,n){"use strict";n.r(e);var o=n(4),r=n.n(o),i=n(94),a=function t(e){r()(this,t);var n={href:e.getAttribute("href"),text:e.textContent,type:e.classList.contains("button")?"button":"link"};e.dataset.identifier&&(n.identifier=e.dataset.identifier),e.dataset.section&&(n.section=e.dataset.section),e.addEventListener("click",function(){window.trackEvents&&window.trackEvents.track({actor:"user",action:"click",product_page:"www",product_design_identifier:window.__collectionName||null,destination_url:n.href,object_type:n.type,object_display_name:n.text,object_identifier:n.identifier||null,product_section:n.section||null})})};Object(i.b)(a,"link")},94:function(t,e,n){"use strict";n.d(e,"b",function(){return o}),n.d(e,"a",function(){return r}),n.d(e,"c",function(){return a});var c=n(1),u=n(3),y,m;function o(t,o,e){try{if(void 0===e){var n,r=Array.from(document.querySelectorAll("[data-component-id]")).filter(function(t){var e=""===t.dataset.componentId,n=t.dataset.componentName===o;return e&&n});if(r.length<=0)throw Error("No uninitialized component containers found.");e=r.pop()}var i=window.componentId();e.dataset.componentId=i;var a=new t(e,i);return c.send(u.a.page.componentInitialized,{id:i}),a}catch(t){console.error("Unable to initialize component.",t)}}function r(t){return t.dataset.componentId}function i(t){return t.dataset.componentName}function a(t){var l=t.template,d=t.content,p=t.parentElement;return new Promise(function(t,e){if(p||e("Must specify parentElement of component."),!y){var n=document.getElementById("cdn-lark");y=n?n.dataset.src.split("assets")[0]:"/"}if(!m){var o=window.__templateVersion;m=o?"?".concat(o):"?"}var r=document.createElement("div"),i,a;r.innerHTML=l(d),"/"!==y&&Array.from(r.getElementsByTagName("link")).forEach(function(t){var e,n=t.getAttribute("href").split("styles")[1],o="".concat(y,"assets/styles").concat(n);t.setAttribute("href",o)});Array.from(r.getElementsByTagName("squarespace:script")).forEach(function(t){var e=t.getAttribute("src"),n="".concat(y,"scripts/").concat(e).concat(m),o=document.createElement("script");o.setAttribute("src",n),t.parentElement.appendChild(o),t.parentElement.removeChild(t)});var c=Array.from(r.children),u=c.find(function(t){return void 0!==t.dataset.componentId}),f=c.find(function(t){return"LINK"===t.tagName}),s=c.find(function(t){return"SCRIPT"===t.tagName});f.addEventListener("load",function(){p.appendChild(u),p.appendChild(s),s.addEventListener("load",function(){t(u)})}),p.appendChild(f)})}}},r.c=o,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function t(){return e.default}:function t(){return e};return r.d(t,"a",t),t},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=832);function r(t){if(o[t])return o[t].exports;var e=o[t]={i:t,l:!1,exports:{}};return n[t].call(e.exports,e,e.exports,r),e.l=!0,e.exports}var n,o});
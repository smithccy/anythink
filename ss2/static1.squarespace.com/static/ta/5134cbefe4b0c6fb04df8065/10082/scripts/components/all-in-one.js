!function t(n,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o=e();for(var r in o)("object"==typeof exports?exports:n)[r]=o[r]}}(this,(function(){return function(t){var n={};function e(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,e),r.l=!0,r.exports}return e.m=t,e.c=n,e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:o})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(e.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var r in t)e.d(o,r,function(n){return t[n]}.bind(null,r));return o},e.n=function(t){var n=t&&t.__esModule?function n(){return t.default}:function n(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="",e(e.s=825)}({2:function(t,n){function e(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}t.exports=e},3:function(t,n,e){"use strict";e.r(n);var o=e(6),r=e.n(o),a=function(){if("string"==typeof self.origin&&~self.origin.indexOf("://"))return self.origin;var t=document.location,n=t.protocol,e=t.host,o;return"".concat(n,"//").concat(e)},c=e(5);e.d(n,"send",(function(){return d})),e.d(n,"on",(function(){return p})),e.d(n,"off",(function(){return y})),e.d(n,"once",(function(){return m})),e.d(n,"onRequest",(function(){return v})),e.d(n,"request",(function(){return b}));var i="sqs",u={};function f(t){return Object.freeze(t),Object.getOwnPropertyNames(t).forEach((function(n){!t.hasOwnProperty(n)||null===t[n]||"object"!==r()(t[n])&&"function"!=typeof t[n]||Object.isFrozen(t[n])||f(t[n])})),t}function s(t){return t.origin===a()&&("object"===r()(t.data)&&("sqs"===t.data.namespace&&"string"==typeof t.data.key))}function l(t,n,e){var o;u[t]&&u[t].filter((function(t){return!e||t.signature===e})).forEach((function(t){t.callback.apply(null,[n])}))}function d(t,n,e){try{var o={namespace:"sqs",key:t,payload:n,signature:e};window.postMessage(o,a())}catch(t){console.error(t)}}function p(t,n,e){void 0===u[t]&&(u[t]=[]),u[t].push({callback:n,signature:e})}function y(t,n){u[t]=u[t].filter((function(t){return t.callback!==n}))}function m(t,n){return new Promise((function(e){var o;p(t,(function n(o){y(t,n),e(o)}),n)}))}function v(t,n,e){p("".concat(t,"-request"),(function(){n().then((function(n){d("".concat(t,"-response"),n,e)}))}),e)}function b(t,n){var e=m("".concat(t,"-response"),n).then((function(t){return t}));return d("".concat(t,"-request"),n),e}function g(t,n){var e=[],o=function t(n){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";e.push({object:n,path:o})};for(o(t);e.length>0;)for(var a=e.pop(),c=a.object,i=a.path,u,f=0,s=Object.keys(c);f<s.length;f++){var l=s[f],d=c[l],p=""===i?l:"".concat(i,".").concat(l);"object"===r()(d)?o(d,p):c[l]=n(d,p)}return t}function h(t){var n;return f(g(t,(function(t,n){return n})))}h(c.a),"undefined"!=typeof window&&window.addEventListener("message",(function(t){if(s(t)){var n=t.data,e,o,r;l(n.key,n.payload,n.signature)}}))},5:function(t,n,e){"use strict";var o={ready:!0,currency:{active:!0,changed:!0,showOverlay:!0},language:{active:!0,changed:!0,showOverlay:!0},nationality:{isVATApplicable:!0,isInEU:!0}},r={linkClick:!0,loadImages:!0,resize:!0,componentInitialized:!0},a={fetchLogoWall:!0,getTemplate:!0,getCustomerExample:!0},c,i,u,f,s={featuredCustomers:{startAutoplay:!0,stopAutoplay:!0},featureTextGallery:{startAutoplay:!0,stopAutoplay:!0},header:{setDarkBackground:!0,setLightBackground:!0,disableSticky:!0,enableSticky:!0},sideBySideFullBleedSlideshow:{startAutoplay:!0,stopAutoplay:!0}},l=n.a={i18n:o,page:r,taxonomy:a,components:s}},6:function(t,n){function e(n){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=e=function t(n){return typeof n}:t.exports=e=function t(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},e(n)}t.exports=e},825:function(t,n,e){"use strict";e.r(n);var o=e(2),r=e.n(o),a=e(85),c=function t(n){r()(this,t)};Object(a.b)(c,"all-in-one")},85:function(t,n,e){"use strict";e.d(n,"b",(function(){return i})),e.d(n,"a",(function(){return u})),e.d(n,"c",(function(){return s}));var o=e(3),r=e(5),a,c;function i(t,n,e){try{if(void 0===e){var a,c=Array.from(document.querySelectorAll("[data-component-id]")).filter((function(t){var e=""===t.dataset.componentId,o=t.dataset.componentName===n;return e&&o}));if(c.length<=0)throw Error("No uninitialized component containers found.");e=c.pop()}var i=window.componentId();e.dataset.componentId=i;var u=new t(e,i);return o.send(r.a.page.componentInitialized,{id:i}),u}catch(t){console.error("Unable to initialize component.",t)}}function u(t){return t.dataset.componentId}function f(t){return t.dataset.componentName}function s(t){var n=t.template,e=t.content,o=t.parentElement;return new Promise((function(t,r){if(o||r("Must specify parentElement of component."),!a){var i=document.getElementById("cdn-lark");a=i?i.dataset.src.split("assets")[0]:"/"}if(!c){var u=window.__templateVersion;c=u?"?".concat(u):"?"}var f=document.createElement("div"),s,l;(f.innerHTML=n(e),"/"!==a)&&Array.from(f.getElementsByTagName("link")).forEach((function(t){var n,e=t.getAttribute("href").split("styles")[1],o="".concat(a,"assets/styles").concat(e);t.setAttribute("href",o)}));Array.from(f.getElementsByTagName("squarespace:script")).forEach((function(t){var n=t.getAttribute("src"),e="".concat(a,"scripts/").concat(n).concat(c),o=document.createElement("script");o.setAttribute("src",e),t.parentElement.appendChild(o),t.parentElement.removeChild(t)}));var d=Array.from(f.children),p=d.find((function(t){return void 0!==t.dataset.componentId})),y=d.find((function(t){return"LINK"===t.tagName})),m=d.find((function(t){return"SCRIPT"===t.tagName}));y.addEventListener("load",(function(){o.appendChild(p),o.appendChild(m),m.addEventListener("load",(function(){t(p)}))})),o.appendChild(y)}))}}})}));
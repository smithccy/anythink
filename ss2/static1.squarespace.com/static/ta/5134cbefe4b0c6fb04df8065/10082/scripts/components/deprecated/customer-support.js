!function t(e,n){if("object"==typeof exports&&"object"==typeof module)module.exports=n();else if("function"==typeof define&&define.amd)define([],n);else{var o=n();for(var r in o)("object"==typeof exports?exports:e)[r]=o[r]}}(this,(function(){return function(t){var e={};function n(o){if(e[o])return e[o].exports;var r=e[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(o,r,function(e){return t[e]}.bind(null,r));return o},n.n=function(t){var e=t&&t.__esModule?function e(){return t.default}:function e(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=894)}({3:function(t,e,n){"use strict";n.r(e);var o=n(6),r=n.n(o),a=function(){if("string"==typeof self.origin&&~self.origin.indexOf("://"))return self.origin;var t=document.location,e=t.protocol,n=t.host,o;return"".concat(e,"//").concat(n)},c=n(5);n.d(e,"send",(function(){return d})),n.d(e,"on",(function(){return p})),n.d(e,"off",(function(){return y})),n.d(e,"once",(function(){return m})),n.d(e,"onRequest",(function(){return v})),n.d(e,"request",(function(){return b}));var i="sqs",u={};function f(t){return Object.freeze(t),Object.getOwnPropertyNames(t).forEach((function(e){!t.hasOwnProperty(e)||null===t[e]||"object"!==r()(t[e])&&"function"!=typeof t[e]||Object.isFrozen(t[e])||f(t[e])})),t}function s(t){return t.origin===a()&&("object"===r()(t.data)&&("sqs"===t.data.namespace&&"string"==typeof t.data.key))}function l(t,e,n){var o;u[t]&&u[t].filter((function(t){return!n||t.signature===n})).forEach((function(t){t.callback.apply(null,[e])}))}function d(t,e,n){try{var o={namespace:"sqs",key:t,payload:e,signature:n};window.postMessage(o,a())}catch(t){console.error(t)}}function p(t,e,n){void 0===u[t]&&(u[t]=[]),u[t].push({callback:e,signature:n})}function y(t,e){u[t]=u[t].filter((function(t){return t.callback!==e}))}function m(t,e){return new Promise((function(n){var o;p(t,(function e(o){y(t,e),n(o)}),e)}))}function v(t,e,n){p("".concat(t,"-request"),(function(){e().then((function(e){d("".concat(t,"-response"),e,n)}))}),n)}function b(t,e){var n=m("".concat(t,"-response"),e).then((function(t){return t}));return d("".concat(t,"-request"),e),n}function g(t,e){var n=[],o=function t(e){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";n.push({object:e,path:o})};for(o(t);n.length>0;)for(var a=n.pop(),c=a.object,i=a.path,u,f=0,s=Object.keys(c);f<s.length;f++){var l=s[f],d=c[l],p=""===i?l:"".concat(i,".").concat(l);"object"===r()(d)?o(d,p):c[l]=e(d,p)}return t}function h(t){var e;return f(g(t,(function(t,e){return e})))}h(c.a),"undefined"!=typeof window&&window.addEventListener("message",(function(t){if(s(t)){var e=t.data,n,o,r;l(e.key,e.payload,e.signature)}}))},5:function(t,e,n){"use strict";var o={ready:!0,currency:{active:!0,changed:!0,showOverlay:!0},language:{active:!0,changed:!0,showOverlay:!0},nationality:{isVATApplicable:!0,isInEU:!0}},r={linkClick:!0,loadImages:!0,resize:!0,componentInitialized:!0},a={fetchLogoWall:!0,getTemplate:!0,getCustomerExample:!0},c,i,u,f,s={featuredCustomers:{startAutoplay:!0,stopAutoplay:!0},featureTextGallery:{startAutoplay:!0,stopAutoplay:!0},header:{setDarkBackground:!0,setLightBackground:!0,disableSticky:!0,enableSticky:!0},sideBySideFullBleedSlideshow:{startAutoplay:!0,stopAutoplay:!0}},l=e.a={i18n:o,page:r,taxonomy:a,components:s}},6:function(t,e){function n(e){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=n=function t(e){return typeof e}:t.exports=n=function t(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n(e)}t.exports=n},85:function(t,e,n){"use strict";n.d(e,"b",(function(){return i})),n.d(e,"a",(function(){return u})),n.d(e,"c",(function(){return s}));var o=n(3),r=n(5),a,c;function i(t,e,n){try{if(void 0===n){var a,c=Array.from(document.querySelectorAll("[data-component-id]")).filter((function(t){var n=""===t.dataset.componentId,o=t.dataset.componentName===e;return n&&o}));if(c.length<=0)throw Error("No uninitialized component containers found.");n=c.pop()}var i=window.componentId();n.dataset.componentId=i;var u=new t(n,i);return o.send(r.a.page.componentInitialized,{id:i}),u}catch(t){console.error("Unable to initialize component.",t)}}function u(t){return t.dataset.componentId}function f(t){return t.dataset.componentName}function s(t){var e=t.template,n=t.content,o=t.parentElement;return new Promise((function(t,r){if(o||r("Must specify parentElement of component."),!a){var i=document.getElementById("cdn-lark");a=i?i.dataset.src.split("assets")[0]:"/"}if(!c){var u=window.__templateVersion;c=u?"?".concat(u):"?"}var f=document.createElement("div"),s,l;(f.innerHTML=e(n),"/"!==a)&&Array.from(f.getElementsByTagName("link")).forEach((function(t){var e,n=t.getAttribute("href").split("styles")[1],o="".concat(a,"assets/styles").concat(n);t.setAttribute("href",o)}));Array.from(f.getElementsByTagName("squarespace:script")).forEach((function(t){var e=t.getAttribute("src"),n="".concat(a,"scripts/").concat(e).concat(c),o=document.createElement("script");o.setAttribute("src",n),t.parentElement.appendChild(o),t.parentElement.removeChild(t)}));var d=Array.from(f.children),p=d.find((function(t){return void 0!==t.dataset.componentId})),y=d.find((function(t){return"LINK"===t.tagName})),m=d.find((function(t){return"SCRIPT"===t.tagName}));y.addEventListener("load",(function(){o.appendChild(p),o.appendChild(m),m.addEventListener("load",(function(){t(p)}))})),o.appendChild(y)}))}},894:function(t,e,n){"use strict";n.r(e);var o=n(85);Object(o.b)((function(){}),"customer-support")}})}));
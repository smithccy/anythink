!function t(e,n){if("object"==typeof exports&&"object"==typeof module)module.exports=n();else if("function"==typeof define&&define.amd)define([],n);else{var r=n();for(var o in r)("object"==typeof exports?exports:e)[o]=r[o]}}(this,(function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function e(){return t.default}:function e(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=883)}({2:function(t,e){function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}t.exports=n},3:function(t,e,n){"use strict";n.r(e);var r=n(6),o=n.n(r),i=function(){if("string"==typeof self.origin&&~self.origin.indexOf("://"))return self.origin;var t=document.location,e=t.protocol,n=t.host,r;return"".concat(e,"//").concat(n)},a=n(5);n.d(e,"send",(function(){return d})),n.d(e,"on",(function(){return p})),n.d(e,"off",(function(){return y})),n.d(e,"once",(function(){return m})),n.d(e,"onRequest",(function(){return v})),n.d(e,"request",(function(){return h}));var c="sqs",u={};function s(t){return Object.freeze(t),Object.getOwnPropertyNames(t).forEach((function(e){!t.hasOwnProperty(e)||null===t[e]||"object"!==o()(t[e])&&"function"!=typeof t[e]||Object.isFrozen(t[e])||s(t[e])})),t}function f(t){return t.origin===i()&&("object"===o()(t.data)&&("sqs"===t.data.namespace&&"string"==typeof t.data.key))}function l(t,e,n){var r;u[t]&&u[t].filter((function(t){return!n||t.signature===n})).forEach((function(t){t.callback.apply(null,[e])}))}function d(t,e,n){try{var r={namespace:"sqs",key:t,payload:e,signature:n};window.postMessage(r,i())}catch(t){console.error(t)}}function p(t,e,n){void 0===u[t]&&(u[t]=[]),u[t].push({callback:e,signature:n})}function y(t,e){u[t]=u[t].filter((function(t){return t.callback!==e}))}function m(t,e){return new Promise((function(n){var r;p(t,(function e(r){y(t,e),n(r)}),e)}))}function v(t,e,n){p("".concat(t,"-request"),(function(){e().then((function(e){d("".concat(t,"-response"),e,n)}))}),n)}function h(t,e){var n=m("".concat(t,"-response"),e).then((function(t){return t}));return d("".concat(t,"-request"),e),n}function b(t,e){var n=[],r=function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";n.push({object:e,path:r})};for(r(t);n.length>0;)for(var i=n.pop(),a=i.object,c=i.path,u,s=0,f=Object.keys(a);s<f.length;s++){var l=f[s],d=a[l],p=""===c?l:"".concat(c,".").concat(l);"object"===o()(d)?r(d,p):a[l]=e(d,p)}return t}function g(t){var e;return s(b(t,(function(t,e){return e})))}g(a.a),"undefined"!=typeof window&&window.addEventListener("message",(function(t){if(f(t)){var e=t.data,n,r,o;l(e.key,e.payload,e.signature)}}))},4:function(t,e){function n(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function r(t,e,r){return e&&n(t.prototype,e),r&&n(t,r),t}t.exports=r},5:function(t,e,n){"use strict";var r={ready:!0,currency:{active:!0,changed:!0,showOverlay:!0},language:{active:!0,changed:!0,showOverlay:!0},nationality:{isVATApplicable:!0,isInEU:!0}},o={linkClick:!0,loadImages:!0,resize:!0,componentInitialized:!0},i={fetchLogoWall:!0,getTemplate:!0,getCustomerExample:!0},a,c,u,s,f={featuredCustomers:{startAutoplay:!0,stopAutoplay:!0},featureTextGallery:{startAutoplay:!0,stopAutoplay:!0},header:{setDarkBackground:!0,setLightBackground:!0,disableSticky:!0,enableSticky:!0},sideBySideFullBleedSlideshow:{startAutoplay:!0,stopAutoplay:!0}},l=e.a={i18n:r,page:o,taxonomy:i,components:f}},6:function(t,e){function n(e){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=n=function t(e){return typeof e}:t.exports=n=function t(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n(e)}t.exports=n},85:function(t,e,n){"use strict";n.d(e,"b",(function(){return c})),n.d(e,"a",(function(){return u})),n.d(e,"c",(function(){return f}));var r=n(3),o=n(5),i,a;function c(t,e,n){try{if(void 0===n){var i,a=Array.from(document.querySelectorAll("[data-component-id]")).filter((function(t){var n=""===t.dataset.componentId,r=t.dataset.componentName===e;return n&&r}));if(a.length<=0)throw Error("No uninitialized component containers found.");n=a.pop()}var c=window.componentId();n.dataset.componentId=c;var u=new t(n,c);return r.send(o.a.page.componentInitialized,{id:c}),u}catch(t){console.error("Unable to initialize component.",t)}}function u(t){return t.dataset.componentId}function s(t){return t.dataset.componentName}function f(t){var e=t.template,n=t.content,r=t.parentElement;return new Promise((function(t,o){if(r||o("Must specify parentElement of component."),!i){var c=document.getElementById("cdn-lark");i=c?c.dataset.src.split("assets")[0]:"/"}if(!a){var u=window.__templateVersion;a=u?"?".concat(u):"?"}var s=document.createElement("div"),f,l;(s.innerHTML=e(n),"/"!==i)&&Array.from(s.getElementsByTagName("link")).forEach((function(t){var e,n=t.getAttribute("href").split("styles")[1],r="".concat(i,"assets/styles").concat(n);t.setAttribute("href",r)}));Array.from(s.getElementsByTagName("squarespace:script")).forEach((function(t){var e=t.getAttribute("src"),n="".concat(i,"scripts/").concat(e).concat(a),r=document.createElement("script");r.setAttribute("src",n),t.parentElement.appendChild(r),t.parentElement.removeChild(t)}));var d=Array.from(s.children),p=d.find((function(t){return void 0!==t.dataset.componentId})),y=d.find((function(t){return"LINK"===t.tagName})),m=d.find((function(t){return"SCRIPT"===t.tagName}));y.addEventListener("load",(function(){r.appendChild(p),r.appendChild(m),m.addEventListener("load",(function(){t(p)}))})),r.appendChild(y)}))}},883:function(t,e,n){"use strict";n.r(e);var r=n(2),o=n.n(r),i=n(4),a=n.n(i),c=n(85),u=function(){function t(e){o()(this,t),this.refs={container:e,desktopContainer:e.querySelector(".style-guide-grid__desktop")},this.visible=!1,this.constrained=!1,this.setupKeyListener()}return a()(t,[{key:"setupKeyListener",value:function t(){var e=this;window.addEventListener("keydown",(function(t){t.ctrlKey&&71===t.keyCode&&(e.visible?!e.constrained&&window.innerWidth>=1400?e.constrainGrid():e.hideGrid():e.showGrid())}))}},{key:"showGrid",value:function t(){this.refs.container.classList.add("is-visible"),this.visible=!0}},{key:"hideGrid",value:function t(){this.refs.container.classList.remove("is-visible"),this.refs.desktopContainer.classList.remove("constrained-width"),this.visible=!1,this.constrained=!1}},{key:"constrainGrid",value:function t(){this.refs.desktopContainer.classList.add("constrained-width"),this.constrained=!0}}]),t}();Object(c.b)(u,"style-guide-grid")}})}));
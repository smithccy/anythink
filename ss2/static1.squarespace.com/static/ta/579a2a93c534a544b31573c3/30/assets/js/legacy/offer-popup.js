// Generated from seed-templates/handlebars-module-template.js
YUI.add('squarespace-offer-popup-template', function(Y) {
  return;
  var Handlebars = Y.Handlebars;
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['offer-popup.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {

  var buffer = "", stack1;
  buffer += "\n  <div class=\"description-wrapper\">\n    <div class=\"description\">\n      <h1>";
  if (stack1 = helpers.header) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.header; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h1>\n      <div class=\"desc-body\">";
  if (stack1 = helpers.body) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.body; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n      <div class=\"desc-footer\">";
  if (stack1 = helpers.footer) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.footer; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n    </div>\n  </div>\n  ";
  return buffer;
  }

  buffer += "<div class=\"close\"><div class=\"icon\"></div></div>\n<div class=\"overlay-wrapper\">\n  <div class=\"body\">\n    <div class=\"logo-wrapper\">\n      <div class=\"logo\">";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    </div>\n  ";
  stack1 = helpers['with'].call(depth0, depth0.description, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  <div class=\"footer\">\n    <div class=\"offer-wrapper\">\n      <div class=\"offer\">\n        <h2>10% Discount code</h2>\n        <div class=\"code\">";
  if (stack1 = helpers.code) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.code; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n      </div>\n    </div>\n  </div> \n</div>\n";
  return buffer;
  });
})();
  var filename = 'offer-popup.html';
  Y.Handlebars.registerPartial(filename.replace('index.html', '.'), Handlebars.templates[filename]);
}, '1.0', {
  requires: [
    "handlebars-base"
  ]
});


YUI.add('squarespace-offer-popup', function(Y) {
  return;
  var Snowbox = Y.namespace('Squarespace').Snowbox = Y.Base.create('snowbox', Y.Overlay, [], {
    initializer: function() {
      this.plug(Y.Plugin.WidgetAnim);
      this.anim.get('animShow').setAttrs({
        'to.opacity': 0.85,
        duration: 0.3,
        easing: Y.Easing.easeOutStrong
      });
    }
  }, {
    ATTRS: {
      align: {
        value: {
          points: [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.TL]
        }
      },
      width: {
        value: '100%'
      },
      height: {
        value: '100%'
      }
    },
    CSS_PREFIX: 'sqs-snowbox'
  });

  var OfferPopup = Y.namespace('Squarespace').OfferPopup = Y.Base.create('offerPopup', Y.Overlay, [], {
    initializer: function() {
      this._snowBox = new Y.Squarespace.Snowbox({ zIndex: this.get('zIndex') - 1, visible: false });
      this.plug(Y.Plugin.WidgetAnim);
      this.anim.get('animShow').setAttrs({
        duration: 0.3,
        easing: Y.Easing.easeOutStrong
      });
    },

    renderUI: function() {
      this._snowBox.render();

      this._snowBox.anim.get('animShow').onceAfter('end', function() {
        this.get('contentBox').setContent(Y.Squarespace.UITemplates.getCompiledTemplate('offer-popup.html')(this.getAttrs()));

        var pct = this.get('customPct');
        if (Y.Lang.isValue(pct)) {
          this.get('contentBox').one('.offer h2').setContent(pct + '% discount code');
        }

        if (this.get('noPct')) {
          this.get('contentBox').one('.offer h2').setContent('discount code');
        }

        var descHeader = this.get('description').subHeader;
        if (descHeader) {
          this.get('contentBox').one('.desc-body').prepend('<p class="description-header">' + descHeader + '</p>');
        }

        var textLogo = this.get('textLogo');
        if (Y.Lang.isValue(textLogo)) {
          this.get('contentBox').one('.logo-wrapper').setContent(textLogo);
        }

        var closeBtn = this.get('contentBox').one('.close');
        closeBtn.on('click', this.destroy, this);

        var snowboxBB = this._snowBox.get('boundingBox');
        snowboxBB.on('click', this.destroy, this);

        this.show();
      }, this);

      this._snowBox.show();
    },

    destructor: function() {
      this._snowBox.destroy();
    }
  }, {
    ATTRS: {
      visible: { value: false },

      title: { },

      code: { },

      noPct: {
        value: false
      },

      description: { },

      width: {
        value: 627
      },

      height: {
        value: 379
      },

      textLogo: {

      },

      zIndex: {
        value: 100000
      },

      customPct: {
      }
    },
    CSS_PREFIX: 'sqs-offer-popup'
  });
}, '1.0', {
  requires: [
    'base',
    'base-build',
    'widget-anim',
    'squarespace-ui-templates',
    'squarespace-offer-popup-template'
  ]
});

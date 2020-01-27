/**
 * DOM Builder
 * @module squarespace-dombuilder
 */
YUI.add('squarespace-dombuilder', function(Y) {

  /**
   * Helper for constructing dom nodes in an ad-hoc fashion
   *
   * @example
   *        var yuiNode = Y.DB.DIV("class-string");
   *        var bigNode = Y.DB.DIV("class1 class2",
   *          Y.DB.INPUT("field-input map-address-line1", {
   *          type: "text", spellcheck: "false"
   *          }),
   *          Y.DB.INPUT("field-input map-address-title", {
   *            type: "text",
   *            spellcheck: "false",
   *            style: "font-weight: bold;"
   *          }));
   *  @class DB
   *  @static
   */
  Y.DB = {

    unpackData: function (n, className) {

      if (n._node) {
        n = n._node;
      }

      if (className) {
        while (n) {
          if (n.data && n.className.indexOf(className) !== -1) {
            return n.data;
          }
          n = n.parentNode;
        }
      } else {
        while (n) {
          if (n.data) { return n.data; }
          n = n.parentNode;
        }
      }

      return (null);

    },

    DIV: function() { return (Y.DB._gen('DIV', Array.prototype.slice.call(arguments))); },
    PARAGRAPH: function() { return (Y.DB._gen('P', Array.prototype.slice.call(arguments))); },
    LI: function() { return (Y.DB._gen('LI', Array.prototype.slice.call(arguments))); },
    SPAN: function() { return (Y.DB._gen('SPAN', Array.prototype.slice.call(arguments))); },
    A: function() { return (Y.DB._gen('A', Array.prototype.slice.call(arguments))); },
    UL: function() { return (Y.DB._gen('UL', Array.prototype.slice.call(arguments))); },
    LABEL: function() { return (Y.DB._gen('LABEL', Array.prototype.slice.call(arguments))); },
    INPUT: function() { return (Y.DB._gen('INPUT', Array.prototype.slice.call(arguments))); },
    TEXTAREA: function() { return (Y.DB._gen('TEXTAREA', Array.prototype.slice.call(arguments))); },
    SELECT: function() { return (Y.DB._gen('SELECT', Array.prototype.slice.call(arguments))); },
    OPTION: function() { return (Y.DB._gen('OPTION', Array.prototype.slice.call(arguments))); },
    IMG: function() { return (Y.DB._gen('IMG', Array.prototype.slice.call(arguments))); },
    TABLE: function() { return (Y.DB._gen('TABLE', Array.prototype.slice.call(arguments))); },
    TBODY: function() { return (Y.DB._gen('TBODY', Array.prototype.slice.call(arguments))); },
    THEAD: function() { return (Y.DB._gen('THEAD', Array.prototype.slice.call(arguments))); },
    TH: function() { return (Y.DB._gen('TH', Array.prototype.slice.call(arguments))); },
    TR: function() { return (Y.DB._gen('TR', Array.prototype.slice.call(arguments))); },
    TD: function() { return (Y.DB._gen('TD', Array.prototype.slice.call(arguments))); },
    VIDEO: function() { return (Y.DB._gen('VIDEO', Array.prototype.slice.call(arguments))); },
    PARAM: function() { return (Y.DB._gen('PARAM', Array.prototype.slice.call(arguments))); },
    OBJECT: function() { return (Y.DB._gen('OBJECT', Array.prototype.slice.call(arguments))); },
    SOURCE: function() { return (Y.DB._gen('SOURCE', Array.prototype.slice.call(arguments))); },
    SUP: function() { return (Y.DB._gen('SUP', Array.prototype.slice.call(arguments))); },
    BUTTON: function() { return (Y.DB._gen('BUTTON', Array.prototype.slice.call(arguments))); },

    _gen: function(tag, args) {

      var n = document.createElement(tag);
      var examineIdx = 0;

      // locate classnames

      if (args.length > examineIdx && typeof (args[examineIdx]) === 'string') {
        n.className = args[examineIdx];
        ++examineIdx;
      }

      // locate extended properties
      // there are more arguments, that look like objects, that are NOT arrays, that are NOT YUI.Node objects

      if (args.length > examineIdx && Y.Lang.isValue(args[examineIdx]) && typeof (args[examineIdx]) === 'object' &&
        !(args[examineIdx] instanceof Array) &&
        !Y.Lang.isValue(args[examineIdx].getAttribute) && !Y.Lang.isValue(args[examineIdx]._node)) {

        var props = args[examineIdx];
        ++examineIdx;

        // construct a deeper object

        for (var k in props) {
          if (k === 'html') {
            n.innerHTML = props[k];
          } else if (k === 'data') {
            n.data = props[k];
          } else if ( k === 'style' && typeof (props[k]) === 'object' ) {
            for ( var cssProp in props[k] ) {
              n.style[ cssProp ] = props[k][cssProp];
            }
          } else {
            n.setAttribute(k, props[k]);
          }
        }

        // defaults for certain objects

        if (tag === 'A') {
          if (!props.href) { n.href = 'javascript:noop();'; } // eslint-disable-line no-script-url
        }

      }

      // append the rest as children

      n = Y.one(n);

      // set the data correctly
      if (n.data && n.data()) {
        n._data = n.data();
      }

      for (var i = examineIdx; i < args.length; ++i) {
        if (args[i] instanceof Array) {
          for (var j = 0; j < args[i].length; ++j) {
            var child = args[i][j];
            n.append(child);
          }
        } else {
          var child = args[i];
          n.append(child);
        }
      }

      return n;
    }
  };

/* BUILDER TEST!
SO COMPREHENSIVE!!!!

var DB = Y.DB;
console.log(

  DB.DIV("grid-container-controls",
    DB.DIV("ok",
      DB.SPAN("hmm", { html: "LABEL!"}),
      DB.SPAN("hmm", { html: "LABEL!"})
      ),
    DB.DIV("control-block", { html: "test" }),
    DB.DIV("control-block", { html: "test" })
  )._node.innerHTML

  );*/

}, '1.0', {
  requires: [
    'node'
  ]
});

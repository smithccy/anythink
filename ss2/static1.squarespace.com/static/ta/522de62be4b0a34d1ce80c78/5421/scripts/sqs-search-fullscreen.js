YUI.add('squarespace-search-fullscreen', function(Y) {


  function renderTemplate(context) {
    var html = '<div class="sqs-search-ui-close test"></div>' +
    '<div id="searchInputBox" class="sqs-search-ui-input"></div>' +
    '<div class="sqs-search-ui-result">';

    if (context.loading) {
      html += '<div class="loading"><div class="spinner-wrapper"></div><div class="desc"> Searching your content... </div></div>';
    } else {
      if (context.notice) {
        html += '<div class="search-notice">' + context.notice + '</div>';
      }

      if (context.error) {
        html += '<div class="search-notice error">' + context.error + '</div>';
      }

      if (context.items) {
        html += '<div class="sqs-search-container-list sqs-search-ui-list">' +
          '<div class="search-results">';

        context.items.forEach(function(item) {
          html += '<div class="search-result" itemid="' + item.id + '">' +
            '<div class="sqs-search-container-item sqs-search-ui-item sqs-post ' + (item.recordTypeName ? 'sqs-post-type-' + item.recordTypeName + '' : '') + ' ' + item.documentType + '">';

          if (item.imageUrl) {
            html += '<div class="sqs-main-image">' +
              '<img src="' + item.imageUrl + '?format=150w">' +
            '</div>';
          }

          html += '<div class="sqs-title">' + item.title;

          if (item.recordTypeName) {
            html += '<span class="record-type">' + item.recordTypeName + '</span>';
          }

          if (item.editable) {
            html += '<span class="edit">Edit</span>';
          }

          html += '</div>';
          
              
          html += '<div class="sqs-content">';

          if (item.highlight) {
            item.highlight.forEach(function(text) {
              html += '<span>&hellip;</span>' +
                '<span>' + text + '</span>';
            });
          }

          html += '</div>';

          html += '</div>' +
            '</div>';
        });

        html += '  </div>' +
        '</div>';
      }
    }

    html += '</div>';

    return html;
  }

  var MIXPANEL_TYPE = 'overlay';

  Y.namespace('Squarespace');
  Y.namespace('Squarespace.Singletons');

  var SearchContainerFullScreen = Y.Base.create('searchContainerFullScreen',
    Y.Squarespace.Widgets.SearchContainer, [], {

    /**
     * - creates and adds the searchInputBox widget
     * - it expects that the scrNode is a child of body
     */
    renderUI: function() {

      SearchContainerFullScreen.superclass.renderUI.call(this);

      this._open = true;

      var contentBox = this.get('contentBox');
      contentBox.addClass('sqs-search-ui');

      var newTemplate = renderTemplate(
        this._getSearchDataModel()
      );
      var html = Y.Node.create(newTemplate);
      contentBox.append(html);

      this.get('boundingBox').plug(Y.Squarespace.Animations.Fadeable, { duration: 0.1, opacity: 0.99 });

      var searchInputBox = new Y.Squarespace.Widgets.SearchInputBox({
        queryString: this.get('queryString'),
        inputType: 'text',
        withSearchSuggest: true
      });

      this.set('searchInputBox', searchInputBox);
      searchInputBox.render(contentBox.one('#searchInputBox'));
      searchInputBox.focus();

      Y.one('body').addClass('sqs-search-ui-fullscreen');

      //this animates the appearance of the fullscreen
      contentBox.show();

      Y.Squarespace.EscManager.addTarget(this);

    },

    bindUI: function() {
      SearchContainerFullScreen.superclass.bindUI.call(this);

      this.scrollTimer = Y.later(250, this, this._infiniteScroll, {}, true);

      this.after('searchFilterChange', this._onSearchFilterChange, this);

      var contentBox = this.get('contentBox');
      contentBox.one('.sqs-search-ui-close').on('click', this._closeClick, this);
      contentBox.delegate(
        'click',
        this._toggleFilter,
        '.sqs-search-ui-filters-group li',
        this
      );
      contentBox.delegate(
        'click',
        this._clickResult,
        '.sqs-search-ui-list .search-result',
        this
      );
      this.get('boundingBox').on('click', this._onClick, this);

    },

    /**
     * Called when the searchResult have been updated.
     * Contains logic to identify if this is a new search or just the
     * next search result page, if so it just appends the new items
     */
    syncUI: function() {

      var contentBox = this.get('contentBox');
      var page = this.get('page');

      var html = Y.Node.create(this._getResultsTemplate());

      if (page === 0) {
        contentBox.one('.sqs-search-ui-result').replace(html.one('.sqs-search-ui-result'));
      } else {
        var currentList = contentBox.one('.sqs-search-ui-list .search-results');
        var currentListLength = currentList.get('children').size();
        var newList = html.one('.sqs-search-ui-list .search-results').get('children');
        newList = newList.splice(currentListLength);
        currentList.append(newList);
      }

      var listEl = contentBox.one('.sqs-search-ui-list');
      if (Y.Lang.isValue(listEl)) {
        listEl.plug(Y.Squarespace.Plugin.ScrollLock);
      }

      if (Y.Lang.isValue(this.get('loading'))) {
        this._spinner = new Y.Squarespace.Spinner({
          color: 'dark',
          size: 'large',
          render: contentBox.one('.spinner-wrapper')
        });
      }

    },

    destructor: function() {
      if (!Y.Lang.isValue(this.scrollTimer)) {
        this.scrollTimer.cancel();
      }
      this.get('searchInputBox').destroy();
      Y.Squarespace.EscManager.removeTarget(this);
    },

    /**
     * Provides the visualization of the results to resync the UI
     *
     * @method _getResultsTemplate
     * @private
     * @return {String} the html of the results
     */
    _getResultsTemplate: function() {
      return renderTemplate(
        this._getSearchDataModel()
      );
    },

    /**
     * Goes over existing filters and remove the filter that match
     * The change will trigger a searchFilterChange
     *
     * @method removeFilter
     * @param {String} filterName the name of the filter we want to remove
     */
    removeFilter: function(filterName) {

      var filters = this.get('searchFilter');
      filters = Y.Array.filter(filters, function(item) {
        return (item.name === filterName);
      });
      this.set('searchFilter', filters);

    },

    /**
     * Adds a new filter.
     * The change will trigger a searchFilterChange
     *
     * @method addFilter
     * @param {Object} newFilter the object containing the name and value of the filter
     */
    addFilter: function(newFilter) {
      var filter = this.get('searchFilter');
      filter.push(newFilter);
      this.set('searchFilter', filter);
    },

    /**
     * Closes the fullscreen
     *
     * @method  _closeClick
     * @private
     */
    _closeClick: function(e) {
      e.stopPropagation();
      this._close();
    },
    /**
     * Tells us if the fullscreen is opened
     *
     * @method isOpen
     * @return {Boolean}
     */
    isOpen: function() {
      return this._open;
    },

    /**
     * Called by the EscManager to close
     *
     * @method close
     */
    close: function() {
      this._close();
    },

    /**
     * internal close method to actually close the down
     *
     * @method _close
     * @private
     */
    _close: function(hard) {

      this._open = false;
      Y.one('body').removeClass('no-scroll');
      Y.one('body').removeClass('sqs-search-ui-fullscreen');

      if (hard) {
        this.destroy(true);
      }
      else {
        var boundingBox = this.get('boundingBox');
        boundingBox.once('hidden', function() {
          this.destroy();
        }, this);
        boundingBox.hide();
        boundingBox.remove();
      }

    },

    /**
     * Called when a filter is clicked on
     * Identifies if you want to remove or add the filter
     *
     * @method _toggleFilter
     * @private
     */
    _toggleFilter: function(e) {

      e.preventDefault();
      var target = e.target.ancestor('li', true);
      if (!Y.Lang.isValue(target)) {
        return;
      }
      var value = target.getAttribute('filter');
      var name = target.ancestor('.sqs-search-ui-filters-group').getAttribute('name');

      if (target.hasClass('active')) {
        this.removeFilter(name);
      } else {
        this.addFilter({
          displayName: target.getAttribute('displayname'),
          value: value,
          name: name
        });
      }

    },

    /**
     * Handler for when we click anywhere on the fullscreen page
     * @method  _onClick
     * @param   {[type]} e
     * @private
     * @return  {[type]}
     */
    _onClick: function(e) {

      e.stopPropagation();
      this.get('searchInputBox').focus();
    },

    /**
     * Handler for when a search result is clicked on and opens up the item
     *
     * @method _clickResult
     * @private
     */
    _clickResult: function(e) {

      e.halt();

      Y.Squarespace.Analytics.trackInternal('engagement_search_result_clicked', {
        edit: Y.Lang.isValue(e.target.ancestor('.edit', true))
      });

      var resultEl = e.target.ancestor('.search-result', true);
      if (!Y.Lang.isValue(resultEl)) {
        return;
      }

      if (Y.Lang.isValue(e.target.ancestor('.edit', true))) {

        var itemId = resultEl.getAttribute('itemid');
        if (!Y.Lang.isValue(itemId)) {
          return;
        }

        var item = this._getSearchResultObject(itemId);

        // edit the item

        if (Y.Lang.isValue(item.recordType)) {

          // it's an item

          var model = new Y.Squarespace.Models.ContentItem(item);

          model.load(function() {
            var editor = new (Y.Squarespace.ContentItemEditorFactory.getEditor(model))({
              model: model
            });

            editor.show();
          });

        } else {

          // it's a collection

          if (Y.Lang.isValue(CONFIG_PANEL)) { // we're on the backend

            CONFIG_PANEL.getHistory().replace({
              'module': 'content',
              'collectionId': item.collectionId
            });

          }

        }

      } else {

        // visit the item
        this._redirect(this._getSearchItemUrl(resultEl));

      }

      this._close(true);

    },

    /**
     * This method is called on a timer to check where the scollPosition is
     * to decide if the next search result page should be requested
     *
     * @method _infiniteScroll
     * @private
     */
    _infiniteScroll: function() {

      var node = this.get('contentBox').one('.sqs-search-ui-list');
      if (Y.Lang.isValue(node)) {
        var contentHeight = node.get('scrollHeight');
        var scrollPos = node.get('scrollTop');
        var viewPortHeight = node.get('offsetHeight');
        var scrollLeft = contentHeight - viewPortHeight - scrollPos;
        var searchResult = this.get('resultItems');
        var totalCount = this.get('totalCount');
        if (!Y.Lang.isValue(searchResult)) {
          return;
        }
        if (scrollLeft < 100 && totalCount > searchResult.length) {
          this._nextPage();
        }
      }
    }

  },
  {
    /*
     * Handlebars template name. Name is the same as the HTML file that can be
     * found in src/main/webapp/template-v6/handlebars/
     * After Template has changed an ant script have to be run to put the template in
     * a JS file that will be loaded. # ant compile-handlebars-template
     * The last step should be automated like the LESS compilation so you just can
     * update the template and don't worry about anything else.
     */
    TEMPLATE_NAME: 'SearchContainerFullScreen.html',
    ATTRS: {

    }
  });


  /**
   * Simple search singleton
   * This doesn't include the block code
   */
  Y.Squarespace.Singletons.Search = new (Y.Base.create('searchSingleton', Y.Base, [], {

    /**
     * Tracks the search launch and opens the fullscreen
     *
     * @method  _onButtonClick
     * @private
     */
    _onButtonClick: function(e) {

      e.stopPropagation();

      if (Static.IN_BACKEND) {
        e.preventDefault();
      }

      Y.use(
        'widget',
        'autocomplete',
        'squarespace-ui-templates',
        'squarespace-animations',
        Y.bind(function(Y) {

          Y.Squarespace.Analytics.trackInternal('engagement_search_open', {
            source: e.currentTarget.getAttribute('data-source'),
            type: MIXPANEL_TYPE
          });

          this.show();

        }, this)
      );

    },

    /**
     * Instantiates the fullscreen mode and renders it
     *
     * @method show
     */
    show: function() {

      var containerWidget = this.containerWidget;
      if (Y.Lang.isValue(containerWidget) && containerWidget.isOpen()) {
        return;
      }

      this.containerWidget = new SearchContainerFullScreen({censusEnabled: false});
      this.containerWidget.render();

      if (Y.Lang.isValue(this._searchInput)) {
        this._searchInput.set('value', '');
      }

    },

    /**
     * Binds the search button for fullscreen display
     *
     * @method attach
     */
    attach: function(inputNode) {


      if (typeof inputNode === 'string') {
        inputNode = Y.one(inputNode);
      }

      if (!Y.Lang.isValue(inputNode)) {
        return;
      }

      var targetSelector = '';
      Y.Array.each(inputNode.get('className').split(' '), function(className) {
        targetSelector += '.' + className;
      });

      this._searchInput = inputNode.one('.search-input');
      if (Y.Lang.isValue(this._searchInput)) {

        this._searchInput.addClass('disabled');
        this._searchInput.on('focus', this._searchInput.blur, this._searchInput); // blur immediately.

      }

      this._eventHandle = Y.one(Y.config.doc.body).delegate(
        Y.UA.mobile ? 'tap' : 'click',
        this._onButtonClick,
        targetSelector,
        this
      );
    }
  },
  {
    ATTRS: {
      /*
       * The current search query
       * @attribute searchQuery
       * @type String
       * @default ''
       */
      searchQuery: {
        validator: Y.Squarespace.AttrValidators.isString,
        value: ''
      },

      /*
       * The collection id we filter the search by
       *
       * @attribute collectionFilter
       * @type String
       * @default null
       */
      collectionFilter: {
        value: '',
        validator: Y.Squarespace.AttrValidators.isNullOrString
      }
    }
  }))();

}, '1.0', { requires: [
  'base',
  'event',
  'datasource',
  'autocomplete-plugin',
  'squarespace-ss-widget',
  'squarespace-animations',
  'squarespace-search',
  'squarespace-plugin-scroll-lock',
  'squarespace-util'
] });
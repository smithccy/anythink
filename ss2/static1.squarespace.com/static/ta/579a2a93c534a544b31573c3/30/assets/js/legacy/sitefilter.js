YUI.add('squarespace-sitefilter', function(Y) {

  // some basic constants
  var SIGNUP_EVENT = 'marketplace_signup_started';
  var SIGNUP_FORM_SHOWN_EVENT = 'marketplace_signup_view';

  Y.namespace('Squarespace.FrontSite').SiteFilter = Class.create({

    initialize: function() {
      this.scrollPos;

      // constants
      this.MIN_QUERY_LENGTH = 2;
      this.PAGE_MAX = 8;
      this.TAGS_MAX = 5;
      this.MIN_REPORTABLE_MISSED_QUERY_LENGTH = 5;
      this.MIN_EXAMPLES = 1;
      this.randomized = false; // we haven't shuffled yet

      this.blacklist = ['Beatrice', 'Boutique', 'Devlin', 'Five', 'Hudson', 'Takk'];

      // settings
      this.params = {
        renderRelatedCustomersWithNoScore: false,
        moveNewTemplatesToFront: false
      };

      this._ready = false;

      // history support
      this.history = new Y.History({
        initialState: {
          search: ''
        }
      });

      // log seemingly failed queries on an interval
      this.logFailures = Y.later(1000, this, function() {

        if (!this.inputEl) {
          return;
        }

        var rawQuery = this.inputEl.get('value');

        if (this.state == 'no-results' && rawQuery != this.lastLoggedMissedQuery && rawQuery.length > this.MIN_REPORTABLE_MISSED_QUERY_LENGTH) { // we're in no results, and it was different than our last logged no results
          this.trackQuery(0, 0);
          this.lastLoggedMissedQuery = rawQuery;
        }

      }, null, true);

      this.history.on('searchChange', this.onQueryChange, this);

      // key handliers
      Y.one(document).on("keydown", function(e) {
        if (this.state == 'direct' && Y.all('.dialog-squarespace-signup, .designs-details--browserdemo, .designs-details--mobiledemo, .sitefilter-profile').size() === 0) {
          if (e.keyCode == 37) {
            if (Y.one(".designs-details-previous")) {
              this.simulateArrow("left");
            }
          } else if (e.keyCode == 39) {
            if (Y.one(".designs-details-next")) {
              this.simulateArrow("right");
            }
          }
        }
      }, this);

      // synonym processing
      // ensure the first word completes the sentence, using sites for __________
      this.synonymSets = [
        ["stores", "commerce", "store", "ecommerce", "sell", "shop"],
        ["blogging", "blogs", "weblog", "weblogs", "blogger"],
        ["photography", "photographer", "photo", "camera", "photos"],
        ["restaurants", "restaurant", "food"],
        ["art", "artist"],
        ["music", "musician"],
        ["video", "animation", "motion"],
        ["architecture", "architect"],
        ["illustration", "illustrator"],
        ["law", "lawyer", "law firm"]
      ];

      this.filteredWords = ["website", "site", "in", "a", "the", "for", "builder"];

      this.synonymTable = {

      };

      this.websitesByTag = {

      };

      this.storeTemplatesByTag = {
        // ishimoto -> template
        // wells -> template
      };

      this.lastQuery = "";
      this.lastQueryTags = [];
      this.lastLoggedMissedQuery = null;

      this.originalTags = {}; // un-stemmed tag set
      this.tagsInOrder = [];

      this.buildSynonymTable();

      // turn filtered words into assoc aray
      var filtered = {};
      for (var i = 0; i < this.filteredWords.length; ++i) {
        filtered[this.filteredWords[i]] = true;
      }
      this.filteredWords = filtered;

      // change call depending on environment
      var apiRoot = '';

      /*if (document.location.href.endsWith(".squarespace.com")) {
        apiRoot = '';
      } else {
        debugger;
        console.log("[SiteFilter] Initializing using live data...");
        apiRoot = 'http://www.squarespace.com';
      }*/

    },

    simulateArrow: function(mode) {
      if (mode === 'left') {
        this.designsPage.one('.designs-details--has-previous') && Y.one(".designs-details-previous").simulate("click");
      } else if (mode === 'right') {
        this.designsPage.one('.designs-details--has-next') && Y.one(".designs-details-next").simulate("click");
      }
    },

    load: function(callback, loadSpecs) {
      this.cachedSpecs = null;

      if (window.CACHED_SITEFILTER_DATA) {
        callback && callback();
      } else {
        (function(self) {

          var cacheStamp = Y.Squarespace.FrontSite.CacheStamp;
          var siteFilterDataPath = '//static.squarespace.com/static/ta/5134cbefe4b0c6fb04df8065/' + cacheStamp + '/scripts/sitefilter-data.js';

          Y.Get.load(siteFilterDataPath, function(err) {
            self.parseData(window.CACHED_SITEFILTER_DATA);
            callback && callback();
          });
        })(this);
      }

      if (loadSpecs) {
        this.cacheSpecs();
      }
    },

    onQueryChange: function(e) {

      this.setValue(e.newVal);

    },

    trackQuery: function(templates, examples) {

      var rawQuery = this.inputEl.get('value');
      var normalizedQuery = this.lastQueryTags.join(" ");

      console.log("Queried: " + rawQuery + " -> " + normalizedQuery + " (" + templates + " templates, " + examples + " examples).");

      // SB tracking
      Y.Squarespace.Analytics.trackInternal('marketplace_query', {
        rawQuery: rawQuery,
        normalizedQuery: normalizedQuery,
        templates: templates,
        examples: examples
      });

      if (window._gaq) {
        window._gaq.push(['_trackEvent', 'marketplace_query', 'rawQuery', rawQuery]);
      }

    },

    trackEvent: function(eventName, templateId, extraParams) {
      var trackingParams;

      try {

        templateId = (templateId === 'inherit') ? Y.one('.designs-details').getAttribute('data-websiteId') : templateId;
        trackingParams = templateId && this._getTrackEventParams(templateId, extraParams);
        trackingParams = Y.merge(trackingParams, extraParams);

        console.log("----- EVENT -----");
        console.log("Event tracked: " + eventName);
        console.log("Parameters:");
        console.log(trackingParams);
        console.log("\n");

        // this event is tracked in signup.js in the v6 code.
        if (eventName !== SIGNUP_FORM_SHOWN_EVENT) {
          // SB Tracking
          Y.Squarespace.Analytics.trackInternal(eventName, trackingParams);
        }

        if (window._gaq) {
          if (eventName === SIGNUP_EVENT) {
            window._gaq.push(['_trackEvent', eventName, 'Signup for ' + trackingParams.template_name + ' via ' + trackingParams.trial_start_origin, (trackingParams.customer_site_identifier ? '(customer site: ' + trackingParams.customer_site_identifier + ')' : '')]);
          } else if (eventName === SIGNUP_FORM_SHOWN_EVENT) {
            window._gaq.push(['_trackEvent', eventName, 'Signup form shown for ' + trackingParams.template_name + ' via ' + trackingParams.trial_start_origin, (trackingParams.customer_site_identifier ? '(customer site: ' + trackingParams.customer_site_identifier + ')' : '')]);
          } else {
            window._gaq.push(['_trackEvent', eventName, 'Searched for ' + trackingParams.raw_tags, 'Previewed ' + trackingParams.template_name]);
          }
        }

      } catch (e) {
        console.log('Error tracking ' + eventName + '(' + e + ')');
      }

    },

    _getTrackEventParams: function(templateId, extraParams) {
      var raw_tags = this.inputEl && this.inputEl.get("value");
      var normalized_tags = this.lastQueryTags.join(" ");

      var template = this.websitesById[templateId];

      return Y.merge({
        raw_tags: raw_tags,
        normalized_tags: normalized_tags,
        template_name: template.displayName,
        template_website_identifier: template.websiteIdentifier

        // query: query,
        // templates: templates,
        // examples: examples
      }, extraParams);

    },

    reset: function() {
      this.setValue('');

      // focus
      this.inputEl.focus();

      // history
      this.history.addValue("search", "", {
        url: "/templates/"
      });

    },

    // speed up synonym processing
    buildSynonymTable: function() {
      for (var i = 0; i < this.synonymSets.length; ++i) { // for each set
        var set = this.synonymSets[i];
        var keyword = set[0];
        for (var j = 1; j < set.length; ++j) { // make all other words in the set equivalent to the first word
          this.synonymTable[set[j]] = keyword;
        }
      }
    },

    // go through a list of words, normalize all down to the first of the synonym set
    normalizeTags: function(words) {
      if (!words) {
        return;
      }
      for (var i = 0; i < words.length; ++i) {
        var word = words[i];
        var normalizedWord = this.synonymTable[word];
        if (normalizedWord) {
          words[i] = normalizedWord;
        } else {
          words[i] = words[i].toLowerCase();
        }
      }
    },

    stemTags: function(words) {
      if (!words) {
        return;
      }
      for (var i = 0; i < words.length; ++i) {
        words[i] = this.stem(words[i]);
      }
    },

    assoicateTags: function(tags, template) {

      if (!tags) {
        return;
      }

      for (var i = 0; i < tags.length; ++i) {
        var tag = tags[i];
        var stem = this.stem(tag);
        var existingMap = this.websitesByTag[stem];
        if (!existingMap) {
          existingMap = {};
          this.websitesByTag[stem] = existingMap;
        }
        this.originalTags[tag] = true;
        existingMap[template.id] = true;
      }

    },

    stem: function(word) {
      return new Y.Squarespace.FrontSite.Stemmer(word).stem().getResult();
    },

    removeAccents: function(text) {

      var patternLetters = /[öäüÖÄÜáàâéèêúùûóòôÁÀÂÉÈÊÚÙÛÓÒÔß]/g;
      var lookupLetters = {
        "ä": "a",
        "ö": "o",
        "ü": "u",
        "Ä": "A",
        "Ö": "O",
        "Ü": "U",
        "á": "a",
        "à": "a",
        "â": "a",
        "é": "e",
        "è": "e",
        "ê": "e",
        "ú": "u",
        "ù": "u",
        "û": "u",
        "ó": "o",
        "ò": "o",
        "ô": "o",
        "Á": "A",
        "À": "A",
        "Â": "A",
        "É": "E",
        "È": "E",
        "Ê": "E",
        "Ú": "U",
        "Ù": "U",
        "Û": "U",
        "Ó": "O",
        "Ò": "O",
        "Ô": "O",
        "ß": "s"
      };

      var letterTranslator = function(match) {
          return lookupLetters[match] || match;
        };

      return text.replace(patternLetters, letterTranslator);

    },

    getFeaturedCustomers: function() {
      return this.featuredCustomers;
    },

    templateNameToTag: function(name) {
      // inlined Y.Squarespace.Utils.slugify
      var val;

      val = name.replace('-demo', "");

      // copied from Y.Squarespace.UrlUtils
      // createUrl()
      var v = val;

      v = v.replace(/\//g, '');

      // createUrlWithSlash()
      v = v.trim()
        .replace(new RegExp('[ ]+', 'g'), ' ')
        .replace(new RegExp('[ ]', 'g'), '-')
        .replace(new RegExp('[^a-zA-Z0-9/\\-]', 'g'), '')
        .replace(new RegExp('[\\.\\-]{2,}', 'g'), '-')
        .replace(new RegExp('[\\.\\/]{2,}', 'g'), 'index.html')
        .toLowerCase();

      // return v;
      return v;
    },

    isStoreTemplate: function(name) {
      for (var t = 0; t < this.storeWebsites.length; t++) {
        if (this.storeWebsites[t].displayName.toLowerCase().replace('é', 'e') === name) {
          return true;
        }
      }

      return false;
    },

    parseData: function(data) {

      this.storeWebsites = [];
      this.customerWebsites = [];
      this.featuredCustomers = [];
      this.websitesById = {};

      for (var i = 0; i < data.length; ++i) {
        var entry = data[i];

        // sanity
        if (entry.displayName === '') {
          //console.warn("[SiteFilter] '" + entry.websiteIdentifier + ".squarespace.com' (" + entry.websiteId + ") missing display name, can't include in customer index.", entry);
          continue;
        }
        if (!entry.thumbnailId) {
          //console.warn("[SiteFilter] '" + entry.websiteIdentifier + ".squarespace.com' (" + entry.websiteId + ") missing thumbnail image, can't include in customer index.", entry);
          continue;
        }
        if (!entry.websiteId) {
          //console.warn("[SiteFilter] '" + entry.websiteIdentifier + ".squarespace.com' (" + entry.websiteId + ") missing websiteId image, can't include in customer index.", entry);
          continue;
        }
        if (!entry.inStore && !entry.inDirectory) {
          //console.warn("[SiteFilter] '" + entry.websiteIdentifier + ".squarespace.com' (" + entry.websiteId + ") is no longer indexed.", entry);
          continue;
        }
        if (!entry.inStore && entry.templateWebsiteId == entry.websiteId) {
          // exclude custom developed templates
          //console.warn("[SiteFilter] '" + entry.websiteIdentifier + ".squarespace.com' (" + entry.websiteId + ") excluded from results (developer toggle enabled).", entry);
          continue;
        }
        // customer has opted out of the directory
        if (entry.promotionAllowed === false) { // accept null or true here
          continue;
        }

        // normalize URLs
        if (!entry.websiteUrl) {
          entry.websiteUrl = "http://" + entry.websiteIdentifier + ".squarespace.com";
        }

        // force non-null tags
        if (!entry.tags) {
          entry.tags = [];
        }

        // save original tags
        entry.originalTags = entry.tags.slice(0); // clone

        // flatten synonym sets
        this.normalizeTags(entry.tags);

        // for every term, associate this template with it
        this.assoicateTags(entry.tags, entry);

        // save the stemmed versions
        this.stemTags(entry.tags);

        // is customer front site featured?
        if (entry.featured) {
          this.featuredCustomers.push(entry);
        }

        // store in one of two places
        if (entry.inStore) {
          // desc
          if (!entry.description) {
            entry.description = "Donec id elit non mi porta gravida at eget metus. Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est consectetur at lobortis.";
          }
          if (!entry.createdOn) {
            entry.createdOn = 1351160074453;
          }

          // autotag
          var autotag = this.templateNameToTag(entry.websiteIdentifier);

          // index the name as a tag
          this.assoicateTags([autotag], entry);

          // it's a store website
          if (Y.Squarespace.FrontSite.TemplateFilters.weddings.indexOf(this.stripDemoSuffix(entry.websiteIdentifier)) != -1) {
            // if (Y.Cookie.get('SS_weddingtemplates') === 'true') {
              this.matchVariantToMaster(entry);
              this.storeWebsites.push(entry);
            // }
          }
          else {
            this.matchVariantToMaster(entry);
            this.storeWebsites.push(entry);
          }

          entry.customerExampleSites = [];

          // save it properly
          this.storeTemplatesByTag[autotag] = entry;

        } else if (entry.inDirectory) {

          this.customerWebsites.push(entry);

          // index the parent template name as a tag
          this.assoicateTags([this.templateNameToTag(entry.templateWebsiteIdentifier)], entry);

        }

        // all tag
        this.assoicateTags(['all'], entry);

        // associate by id
        this.websitesById[entry.websiteId] = entry;

      }

      // for every store template, embed customer templates that use that template within
      for (var i = 0; i < this.customerWebsites.length; ++i) {
        var customerWebsite = this.customerWebsites[i];
        var parentWebsiteId = customerWebsite.templateWebsiteId;
        var parentWebsite = this.websitesById[parentWebsiteId];
        if (!parentWebsite) {
          //console.warn("[SiteFilter] '" + customerWebsite.websiteIdentifier + ".squarespace.com' (" + customerWebsite.websiteId + ") missing parent template (" + customerWebsite.templateWebsiteIdentifier + "), can't include in customer index.", customerWebsite);
          continue;
        }
        if (!parentWebsite.customerExampleSites) {
          //console.warn("[SiteFilter] '" + customerWebsite.websiteIdentifier + ".squarespace.com' (" + customerWebsite.websiteId + ") has an invalid parent template (" + customerWebsite.templateWebsiteIdentifier + "), can't include in customer index.", customerWebsite);
          continue;
        }
        if (!parentWebsite.inStore) {
          //console.warn("[SiteFilter] '" + customerWebsite.websiteIdentifier + ".squarespace.com' (" + customerWebsite.websiteId + ") is referencing a template that is no longer in the store (" + customerWebsite.templateWebsiteIdentifier + "), can't include in customer index.", customerWebsite);
          continue;
        }
        parentWebsite.customerExampleSites.push(customerWebsite);
      }

      // report status
      for (var i = 0; i < this.storeWebsites.length; ++i) {
        var storeWebsite = this.storeWebsites[i];
        //console.log("[SiteFilter] Base Template Loaded: " + storeWebsite.displayName  + " via " + storeWebsite.websiteIdentifier + ".squarespace.com (" + storeWebsite.websiteId + ")");
      }

      // start with the tags we've seen in an unstemmed form
      this.tagsInOrder = Y.Object.keys(this.originalTags);

      // add synonyms to autocomplete
      for (var i = 0; i < this.synonymSets.length; ++i) {
        var set = this.synonymSets[i];
        for (var j = 0; j < set.length; ++j) {
          var word = set[j];
          if (!this.websitesByTag[word]) {
            this.tagsInOrder.push(word); // add the synonym for auto-complete purposes
          }
        }
      }

      // store the tags in alpha order too
      this.tagsInOrder.sort();

      // report
      //console.log("[SiteFilter] Loaded " + data.length + " records (" + this.storeWebsites.length + " templates, " + this.customerWebsites.length + " customers, " + this.tagsInOrder.length + " tags, " + this.featuredCustomers.length + " featured customers).");
      this._ready = true;
      this.fire('ready');

    },

    matchVariantToMaster: function (entry) {
      if (entry.websiteId !== entry.templateWebsiteId) {
        entry.templateWebsiteId = entry.websiteId;
      }

      if (entry.websiteIdentifier !== entry.templateWebsiteIdentifier) {
        entry.templateWebsiteIdentifier = entry.websiteIdentifier;
      }
    },

    isReady: function() {
      return this._ready;
    },

    render: function() {

      // attach
      this.el = Y.one('.designs-body'); // Y.one(".sitefilter-canvas");
      this.lastQuery = "";
      this.lastQueryTags = [];
      this.state = "";

      if (!this.el) {
        console.error('.designs-body not found. Can\'t initialize sitefilter.');
        return;
      }

      this.inputEl = Y.one('#sitefilter-input');

      // clear
      this.clearEl = Y.DB.DIV("clear-search");
      this.clearEl.on("click", function() {
        this.reset();
      }, this);
      Y.one(".sitefilter-input-wrapper").append(this.clearEl);

      // auto-search
      Y.all(".search-suggestions .tag").each(function(n) {
        n.on("click", function(e) {
          if (e.target.ancestor(".clear-search", true)) {
            this.reset();
          } else {
            this.setValue(e.currentTarget.get("innerHTML"));
          }
        }, this);
      }, this);

      // suggestion el
      this.suggestionEl = Y.one("#sitefilter-input-suggestion");
      this.suggestionEl.on("focus", function() {
        this.inputEl.focus();
      }, this);

      var urlParams = Y.QueryString.parse(document.location.search.substring(1));
      if (urlParams.q) {
        this.initialQuery = urlParams.q;
      } else {
        this.initialQuery = "";
      }


      this.designsPage = Y.one('.designs');

      this.resultsEl = Y.DB.DIV("designs-templates clearfix");
      this.el.append(this.resultsEl);

      this.inputEl.on("keyup", this.onKeyUp, this);
      this.inputEl.on("keydown", this.onKeyDown, this);
      this.inputEl.focus();


      this.resultsEl.on("click", this.onClick, this);

      if (this.initialQuery.length > 0) {
        if (!this.isActiveFilter()) {
          this.setValue(this.initialQuery);
        }
      } else {
        this.clear();
      }

    },

    isActiveFilter: function() {
      var urlParams = Y.QueryString.parse(document.location.search.substring(1)),
        first = urlParams.q && urlParams.q.split(' ')[0],
        activeFilter = first && Y.one('[data-filter="' + first + '"]'),
        results;

      if (activeFilter) {
        results = this.findRelevantTemplates(new Array(first), true);
        return !this.isStoreTemplate(first) && results.length > 0 && results;
      }
    },

    stripDemoSuffix: function(tag) {

      if (tag.endsWith("-demo")) {
        tag = tag.substring(0, tag.length - 5);
      }

      return tag;

    },

    getNextTemplate: function(mode, templateWebsiteId) {
      var idx = this.getTemplateIndexById(templateWebsiteId),
        switchTo = this.storeWebsites[idx + (mode === 'next' ? 1 : -1)],
        template = switchTo && this.stripDemoSuffix(switchTo.websiteIdentifier);

      if (!template) {
        // Test -- show/hide arrows
        return false;
      }

      if (Y.Squarespace.FrontSite.ActiveTemplateFilters && !this.templateInCategory(template, Y.Squarespace.FrontSite.ActiveTemplateFilters)) {
        return this.getNextTemplate(mode, switchTo.templateWebsiteId);
      }

      return template;
    },

    onClick: function(e) {
      // TODO -- cleanup. Direct vs. search states
      // context
      var customerEl = e.target.ancestor(".designs-template", true) || e.target.ancestor(".designs-details", true) || e.target.ancestor(".designs-details-overlay--customer", true),
        websiteId, website;

      if (customerEl) {
        websiteId = customerEl.getAttribute("data-websiteId");
        website = this.websitesById[websiteId];
      }

      // logic
      if (e.target.hasClass("designs-details-signup", true) || e.target.hasClass("designs-details-overlay-signup", true)) {
        e.halt();

        if (e.target.hasClass('designs-details-overlay-view')) {
          this.closeProfile();
          SQUARESPACE_IS_AWESOME._routeBodyClicks(e);
        } else {

          Y.Squarespace.Signup.allowDamaskSignup();

          this.trackEvent(SIGNUP_FORM_SHOWN_EVENT, website.templateWebsiteId, {
            trial_start_origin: 'template-card',
            templateWebsiteIdentifier: website.templateWebsiteIdentifier
          });

          Y.Squarespace.Signup.show({
            cloneIdentifier: website.templateWebsiteIdentifier,
            page: "product",
            lifeCycleTrialEventData: this._getTrackEventParams(website.templateWebsiteId, { // deprecated. remove this.
              trial_start_origin: 'template-card'
            }),
            lifeCycleTrialEventFn: Y.bind(function() {
              this.trackEvent(SIGNUP_EVENT, website.templateWebsiteId, {
                trial_start_origin: 'template-card'
              });
            }, this)
          });
        }

      } else if (e.target.ancestor(".designs-template--template", true)) {

        e.halt();

        if (this.state == 'direct') {

          if (e.target.ancestor(".designs-template-info")) {
            return;
          }

          // if we're in the template overview page -- show the template on click
          this.currentProfile = website;
          this.showProfile({
            title: website.displayName,
            identifier: website.websiteIdentifier,
            url: website.websiteUrl,
            baseTemplate: website.displayName,
            masterTemplate: true
          });

          // track
          this.trackEvent('marketplace_template_full_view', website.id);

        } else {

          var templates = Y.all('.designs-template--template');
          var total = templates.size();
          var index = templates.indexOf(e.target.hasClass('designs-template--template') ? e.target : e.target.ancestor('.designs-template--template'));

          if (this.state == 'search') {
            this.setValue(this.stripDemoSuffix(website.websiteIdentifier) + " " + this.lastQuery);
          } else {
            this.setValue(this.stripDemoSuffix(website.websiteIdentifier) + this.getActiveFilter());
          }

          this.trackEvent('frontsite_template_view', 'inherit', {
            scroll: false,
            fromURL: oldReferrer,
            template_order: index + 1,
            templates_in_array: total
          });

          // track
          this.trackEvent('marketplace_template_click', website.id);

        }

      } else if (e.target.ancestor(".designs-template--customer", true)) {

        e.halt();

        if (e.target.ancestor(".direct-match")) {
          return;
        }

        var template = this.websitesById[website.templateWebsiteId];
        this.currentProfile = website;

        this.showProfile({
          title: website.displayName,
          url: website.websiteUrl,
          identifier: website.websiteIdentifier,
          baseTemplate: template.displayName,
          cloneId: template.id,
          customer: true
        });

        this.trackEvent('frontsite_template_example_view', 'inherit', {
          newWindow: false,
          customerIdentifier: website.websiteIdentifier
        });

        // track
        this.trackEvent('marketplace_example_site_thumbnail_click', template.id, {
          customerIdentifier: website.websiteIdentifier
        });

      } else if (e.target.hasClass("designs-details-next") || e.target.hasClass("designs-details-previous") || e.target.ancestor().hasClass("designs-details-next") || e.target.ancestor().hasClass("designs-details-previous")) {
        var rowEl = e.target.ancestor(".designs-details", true);
        var templateWebsiteId = rowEl.getAttribute("data-websiteid");
        var state = this.resultsByTemplate[templateWebsiteId];

        if (e.target.ancestor(".direct-match")) {
          // scroll templates
          var switchTo = this.getNextTemplate((e.target.hasClass("designs-details-next") || e.target.ancestor().hasClass("designs-details-next")) ? 'next' : 'previous', templateWebsiteId);

          this.setValue(switchTo + this.getActiveFilter());

          this.trackEvent('frontsite_template_view', 'inherit', {
            scroll: true,
            fromURL: oldReferrer
          });
        }
      } else if (e.target.hasClass("designs-customers-trigger") || e.target.ancestor(".designs-customers-trigger")) {
        this.customersTrigger.addClass('is--hidden');
        Y.one('.designs-customers-intro').removeClass('is--hidden');
        this.renderCustomerTemplates(this.cachedCustomerExamples[0], this.cachedCustomerExamples[1], 5);

        this.cachedCustomerExamples[0].all('.designs-template-image').each(function(img) {
          SQUARESPACE_IS_AWESOME.lazyLoader.push(img);
        });
      }

    },

    getTemplateIndexById: function(templateWebsiteId) {

      for (var i = 0; i < this.storeWebsites.length; ++i) {
        var s = this.storeWebsites[i];
        if (s.templateWebsiteId == templateWebsiteId) {
          return i;
        }
      }

      return -1;

    },

    onKeyDown: function(e) {
      if (e.keyCode == 39 || e.keyCode == 13) {
        this.skipNextKeyUp = true;
        if (this.suggestionEl.get('value') != "") {
          this.inputEl.set('value', this.suggestionEl.get('value'));
        }
      }
    },

    cacheSpecs: function(wrapper) {
      Y.Data.get({
        url: '/feature-index/',
        responseFormat: 'raw',
        success: Y.bind(function(data) {
          this.cachedSpecs = Y.DOM.create(data);
          this.cachedSpecs = Y.Selector.query('.features', this.cachedSpecs, true);

          // Y.Data took too long?
          var profile = Y.one('.sitefilter-profile--features');
          if (profile) {
            profile.setContent(this.cachedSpecs);
          }
        }, this)
      });
    },

    chromeDemo: function(mode, url) {
      var details = Y.one('.designs-details'),
        container = details && details.one('.container'),
        //beep = Y.one('.signal-beep'),
        liveOverlay = details && details.one('.designs-details-live'),
        iphone = details && details.one('.iphone'),
        browser = details && details.one('.browser'),
        shots = details && details.one('.designs-details-shots'),
        link = Y.one('.designs-details-overlay-link'),
        header = Y.one('.header'),
        navActions = Y.one('.navigation-actions'),
        signup = Y.one('.designs-details-overlay-signup'),
        content;


      if (document.body.clientWidth <= 1020 && mode !== 'reset') {
        var link = Y.Node.create('<a target="_blank" href="' + url + '"></a>');
        link.simulate('click');
      } else {
        if (mode !== 'reset') {
          details.setStyle('height', window.innerHeight);
          SQUARESPACE_IS_AWESOME.fixedLayout(true, null, true);
          link.setAttribute('target', '_blank');
          link.setAttribute('href', url);
          link.set('innerHTML', url.replace('http://', ''));
          header.addClass('header--slide');
          navActions.addClass('navigation-actions--slide');
        }

        if (mode === 'iphone') {
          content = iphone.one('.iphone-content');
          details.addClass('designs-details--mobiledemo');

          iphone.setStyles({
            'left': document.body.clientWidth / 2,
            'marginLeft': -360 / 2,
            'top': (window.innerHeight / 2) - (750 / 2) - container.getY()
          })

          iphone.addClass('iphone--large');

          liveOverlay.setStyles({
            'left': (document.body.clientWidth / 2) + 250,
            'top': (window.innerHeight / 2) - (640 / 2) - container.getY() + 334
          });

          signup.setStyles({
            // 'left': (document.body.clientWidth / 2) - signup.get('clientWidth') - 230,
            // 'top': (window.innerHeight / 2) - (640 / 2) - container.getY() + 330
            'left': (document.body.clientWidth / 2) + 250,
            'top': (window.innerHeight / 2) - (640 / 2) - container.getY() + 454
          });

          link.setStyles({
            // 'left': parseInt(signup.getComputedStyle('left')) + signup.get('clientWidth') - link.get('clientWidth'),
            // 'top': (window.innerHeight / 2) - (640 / 2) - container.getY() + 385,
            // 'marginLeft': -29
            'left': (document.body.clientWidth / 2) + 250,
            'top': (window.innerHeight / 2) - (640 / 2) - container.getY() + 514,
            'marginLeft': 0
          });

          //beep.addClass('signal-beep--play');

        } else if (mode === 'browser') {
          content = browser.one('.browser-content');

          details.addClass('designs-details--browserdemo-animating');

          // Set width before animation. Thank you, Safari.
          // browser.setStyle('width', browser.get('clientWidth'));

          console.log(container.getComputedStyle('width'));
          // browser.setStyles({
          //   // 'width': container.getComputedStyle('width'),
          //   // 'height': window.innerHeight - browser.getY()
          // });
          content.setStyle('height', window.innerHeight - browser.getY() - 20);
          details.addClass('designs-details--browserdemo');
          details.removeClass('designs-details--browserdemo-animating');
          //beep.addClass('signal-beep--play');

        } else if (iphone && details && browser && mode === 'reset') {

          // Just in case the iframe is not yet loaded
          var iframe = iphone.one('iframe') || browser.one('iframe');
          if (iframe) {
            iframe.addClass('is--transparent');
            setInterval(function() {
              iframe.remove()
            }, 700);
          }

          SQUARESPACE_IS_AWESOME.fixedLayout(false);

          if (details.hasClass('designs-details--mobiledemo')) {
            // iphone.setStyles({
            //   'left': browser.get('clientWidth') - ((!iphone.hasClass('iphone--small') ? 228 : 152) * 0.2),
            //   'top': browser.get('clientHeight') - ((!iphone.hasClass('iphone--small') ? 480 : 320) * 0.68),
            //   'marginLeft': null
            // });
            iphone.setAttribute('style', '');
          }

          details.removeClass('designs-details--mobiledemo').removeClass('designs-details--browserdemo');
          iphone.removeClass('iphone--large');

          iphone.one('.iphone-content') && iphone.one('.iphone-content').setStyle('height', null);
          browser.one('.browser-content') && browser.one('.browser-content').setStyle('height', null);


          browser.setStyles({
            'height': null,
            'width': null //shots.get('clientWidth') // Use px -- thank you, Safari
          });

          liveOverlay.setStyles({
            'top': null,
            'left': null
          });

          signup.setStyles({
            'top': null,
            'left': null
          });

          link.setStyles({
            'top': null,
            'left': null,
            'marginLeft': null
          });


          header.removeClass('header--slide');
          navActions.removeClass('navigation-actions--slide');

          //beep.removeClass('signal-beep--play');
          Y.later(1000, this, function() {
            details.setStyle('height', container.get('clientHeight'));
            Y.later(1000, this, function() {
              details.setStyle('height', null);
            });
          });
          SQUARESPACE_IS_AWESOME.escTarget('remove', 'preview');
        }


        // Iframe stuff
        if (mode !== 'reset') {
          SQUARESPACE_IS_AWESOME.escTarget('add', 'preview', this);

          setTimeout(function() {
            if (Y.one('.designs-details--mobiledemo') || Y.one('.designs-details--browserdemo')) {
              var iframe = Y.Node.create('<iframe class="designs-details-iframe" src="' + url.substring(url.indexOf('//')) + '?nochrome=true"></iframe>')
              iframe.appendTo(content);

              //iframe.on('load', function (e) {
              //setTimeout(function () {
              // iframe.setStyle('width', 50 + (Math.random() * 10) + '%');
              //}, 2000);
              //}, this);
            }
          }, mode === 'iphone' ? 1000 : 1100);
        }
      }
    },

    renderRow: function(template, examples) {

      var details = Y.one('.designs-details');

      if (details) {
        details.remove();
      }

      var el = Y.DB.DIV("designs-details" + (this.state == 'direct' ? " direct-match" : ""), {
        "data-websiteid": template.websiteId
      });
      el.append(Y.DB.DIV('container container--fluid clearfix', this.renderResult(template, {
        mode: 'details'
      })));

      el.one('.designs-details-info').append(Y.Node.create('<a class="designs-customers-trigger is--hidden"><span class="designs-customers-trigger-text">Show Customer Examples</span><span class="icon"></span></a>'));
      this.customersTrigger = el.one('.designs-customers-trigger');
      this.customersTrigger.on("click", this.onClick, this);

      el.one('.designs-details-overlay').on('click', function(e) {
        if (!e.target.hasClass('designs-details-overlay-signup') && (!e.target.hasClass('designs-details-overlay-link'))) {
          this.chromeDemo('reset');
        } else if (e.target.hasClass('designs-details-overlay-link')) {

          this.trackEvent('frontsite_template_live_view', 'inherit', {
            mobile: Y.one('.designs-details--mobiledemo') ? true : false,
            newWindow: true
          });

        } else if (e.target.hasClass('designs-details-overlay-signup')) {
          this.onClick(e);
        }
      }, this);

      //var them = Y.DB.DIV("them");
      //var themWrapper = Y.DB.DIV("them-wrapper", them);
      //el.append(themWrapper);

      //el.append(Y.DB.DIV("designs-details-next"));
      //el.append(Y.DB.DIV("designs-details-previous"));
      el.delegate('click', this.onClick, '.designs-details-signup, .designs-details-next, .designs-details-previous', this);

      el.one('.designs-details-specs').on('click', function(e) {
        if (document.body.clientWidth > 1020) {
          e.halt();
          SQUARESPACE_IS_AWESOME.siteFilter.load(function () {
            SQUARESPACE_IS_AWESOME.siteFilter.showProfile({
              specs: true,
              title: 'Features'
            });
          }, true);
        }
      }, this);

      el.delegate('click', function(e) {
        e.halt();

        this.trackEvent('frontsite_template_live_view', 'inherit', {
          mobile: false,
          newWindow: false
        });

        this.chromeDemo('browser', template.websiteUrl);
      }, '.browser, .designs-details-demo--link', this);

      el.one('.iphone').on('click', function(e) {
        e.halt();

        this.trackEvent('frontsite_template_live_view', 'inherit', {
          mobile: true,
          newWindow: false
        });

        this.chromeDemo('iphone', template.websiteUrl);
      }, this);

      return el;
    },

    prepareArrows: function() {
      var el = Y.one('.designs-details'),
        websiteId = el.getAttribute('data-websiteid');

      /*if (examples.length > this.PAGE_MAX) {
        el.addClass("designs-details--has-next");
      }*/

      if (this.state == 'direct') {
        el.removeClass('designs-details--has-next').removeClass('designs-details--has-previous');

        if (Y.Squarespace.FrontSite.ActiveTemplateFilters) {
          this.getNextTemplate('next', websiteId) && el.addClass("designs-details--has-next");
          this.getNextTemplate('previous', websiteId) && el.addClass("designs-details--has-previous");
        } else {
          var idx = this.getTemplateIndexById(websiteId);

          if ((idx + 1) < this.storeWebsites.length) {
            el.addClass("designs-details--has-next");
          }

          if (idx > 0) {
            el.addClass("designs-details--has-previous");
          }
        }
      }
    },

    scrollTop: function() {
      window.scrollTo(0, 0);

    },

    cleanUrl: function(url) {

      if (url.startsWith("http://")) {
        url = url.substring(7);
      } else if (url.startsWith("https:///")) {
        url = url.substring(8);
      }

      var slashIdx = url.indexOf("index.html");
      if (slashIdx != -1) {
        url = url.substring(0, slashIdx);
      }

      return url;

    },

    showProfile: function(data) {
      Y.Squarespace.FrontSiteUtils.ShowProfile(data);
    },

    close: function() { // for EscManager
      this.chromeDemo('reset');

      if (this.frameEl) {
        this.closeProfile();
      }
    },

    onProfileClick: function(e) {
      if (e.target.hasClass("site-profile-overlay") || e.target.hasClass("designs-details-overlay") || e.target.hasClass("close-profile") || e.target.hasClass('icon')) {
        this.closeProfile();
      } else if (e.target.hasClass('designs-details-overlay-link')) {
        if (this.currentProfile) {
          this.trackEvent('frontsite_template_example_view', 'inherit', {
            newWindow: true,
            customerIdentifier: this.currentProfile.websiteIdentifier
          });
        }
      }

    },

    /*onSiteDescriptionClick: function(e) {

      if (e.target.hasClass("create-button")) {
        var dataToTrack;
        if (this.currentProfile.templateWebsiteId == this.currentProfile.websiteId) {
          dataToTrack = {
            trial_start_origin: 'template-preview'
          };
        } else {
          dataToTrack = {
            trial_start_origin: 'customer-preview',
            customer_site_identifier: this.currentProfile.websiteIdentifier
          };
        }

        Y.Squarespace.Signup.show({
          cloneIdentifier: this.currentProfile.templateWebsiteIdentifier,
          page: "product",
          lifeCycleTrialEventData: this._getTrackEventParams(this.currentProfile.templateWebsiteId, dataToTrack), // deprecated
          lifeCycleTrialEventFn: Y.bind(function() {
            this.trackEvent(SIGNUP_EVENT, this.currentProfile.templateWebsiteId, dataToTrack);
          }, this)
        });
      }

      if (e.target.ancestor(".visit-site", true)) {
        window.open(this.currentProfile.websiteUrl);

        this.trackEvent('marketplace_example_site_full_view', this.currentProfile.templateWebsiteId, {
          customerIdentifier: this.currentProfile.websiteIdentifier
        });
      }

      if (e.target.hasClass("template-title")) {
        this.closeProfile();
        this.setValue(this.stripDemoSuffix(this.currentProfile.templateWebsiteIdentifier));
      }

      e.halt();

    },*/

    closeProfile: function() {
      Y.Squarespace.FrontSiteUtils.closeProfile();
    },

    renderCustomerTemplates: function(parentEl, examples, max) {
      var total = (max && (max + 1)) || examples.length;

      // clear existing examples
      parentEl.all(".designs-template--customer").each(function(n) {
        n.addClass("remove");
      }, this);

      // add examples
      if (examples && examples.length >= this.MIN_EXAMPLES) {
        var fragment = Y.Node.create('<div class="clearfix"></div>');
        for (var i = 0; i < total; ++i) {
          var ex = examples[i];
          var customerEl = this.renderResult(ex, {
            mode: 'customer'
          });
          customerEl.appendTo(fragment);
        }

        SQUARESPACE_IS_AWESOME.renderChromes(fragment);
        parentEl.append(fragment);
      }
    },

    renderExamples: function(parentEl, examples) {
      if (screen && screen.availHeight <= 600) {
        this.cachedCustomerExamples = [parentEl, examples];
        this.customersTrigger.removeClass('is--hidden');
      } else {
        this.customersTrigger.addClass('is--hidden');
        this.renderCustomerTemplates(parentEl, examples);

        var templateFilters = parentEl.one('.designs-customers-intro');
        templateFilters && templateFilters.removeClass('is--hidden');
      }
    },

    getImage: function(assetUrl, width) {

      // inlined from Y.Squarespace.Utils
      var isProductionEnvironment = function(){
        var appDomain = Y.Object.getValue(Y.config.win, 'Static.SQUARESPACE_CONTEXT.appDomain'.split('.'));
        if (
          Y.Lang.isString(appDomain) &&
          (appDomain.indexOf('sqsp.com') != -1 || appDomain.indexOf('squarespace.com') != -1)
        ) {
          return true;
        }
        return false;
      }

      if (!isProductionEnvironment()) {
        assetUrl = assetUrl.replace('.staging.squarespace.net', '.squarespace.com');
      }

      return assetUrl + (width ? "?format=" + width + "w" : '');
    },

    tagDescription: function(desc) {

      var dotIdx = desc.indexOf(".");
      if (dotIdx != -1) {
        return '<span class="main">' + desc.substring(0, dotIdx + 1) + '</span><span class="extended">' + desc.substring(dotIdx + 1) + '</span>';
      } else {
        return desc;
      }

    },

    renderResult: function(entry, params) {
      var output, plainText = Y.Node.create('<div>' + entry.description + '</div>'),
        // Remove unwanted Tags
        stop;

      plainText = plainText.get('innerText') || plainText.get('textContent');

      if (plainText) {
        stop = plainText.indexOf('.') + 1;

        // Divide description into 2 sections
        plainText = [plainText.slice(0, stop), '<span>', plainText.slice(stop)].join('');
        plainText += '</span>';
      }

      if (params && params.mode && params.mode === 'details') {
        output = Y.DB.DIV('wrapper', Y.DB.DIV('designs-details-shots', Y.DB.DIV('browser browser--dark browser--fluid browser--gallery' + ((entry.displayName === 'Momentum' || entry.displayName === 'Frontrow') ? ' browser--bottom' : ''), Y.DB.DIV('browser-slide', Y.DB.IMG('designs-details-screenshot', {
          // "data-image-dimensions": "100x100",
          "data-src": this.getImage(entry.thumbnailAssetUrl)
        })), Y.DB.DIV('designs-template-info', Y.Node.create('<div class="button--centered"><a class="button button-square button-square-small button-square-filled button-square-light">Live Preview</a><div>'))),

        Y.DB.DIV('designs-details-overlay', Y.DB.DIV('designs-details-overlay-signup button button-square button-square-filled button-square-dark', {
          html: SQUARESPACE_LANG.TEMPLATE_CALL_TO_ACTION
        }), Y.DB.A('designs-details-overlay-link'),

        Y.DB.DIV('designs-details-live', Y.DB.DIV('signal-text', {
          html: 'Live <span>Mobile</span> Preview'
        }), Y.DB.PARAGRAPH('designs-details-live-text', {
          html: 'Every Squarespace design includes a built-in mobile experience, ensuring your website will look great on every device.'
        })), Y.DB.DIV('designs-details-overlay-close', Y.DB.SPAN('icon'))), Y.DB.DIV('designs-details-shots-collections', Y.DB.SPAN('designs-details-shots-collection', Y.DB.SPAN('icon')), Y.DB.SPAN('designs-details-shots-collection', Y.DB.SPAN('icon')), Y.DB.SPAN('designs-details-shots-collection', Y.DB.SPAN('icon')), Y.DB.SPAN('designs-details-shots-collection', Y.DB.SPAN('icon')), Y.DB.SPAN('designs-details-shots-collection', Y.DB.SPAN('icon')))),


        Y.DB.DIV('iphone iphone--dark', Y.DB.IMG('designs-details-screenshot', {
          // "data-image-dimensions": "100x100",
          "data-src": this.getImage(entry.mobileImageAssetUrl)
        }), Y.DB.DIV('designs-template-info', Y.Node.create('<div class="button--centered"><a class="button button-square button-square-very-small button-square-filled button-square-light">Mobile View</a></div>'))),

        Y.Node.create('<h1 class="designs-details-title--mobile">' + entry.displayName + '</h1>'), Y.DB.DIV('designs-details-info', Y.Node.create('<h1 class="designs-details-title">' + entry.displayName + '</h1><div class="designs-details-links"><a class="designs-details-demo--link">Live Preview</a><a href="/feature-index/" target="_blank" class="designs-details-specs">Feature Index</a></div><p class="designs-details-description">' + plainText + '</p>'), Y.Node.create('<div class="designs-details-actions"><a class="designs-details-signup button button-square button-square-large button-square-filled button-square-dark">' + SQUARESPACE_LANG.TEMPLATE_CALL_TO_ACTION + '</a></div>'), Y.DB.DIV('designs-details-next', Y.DB.SPAN('icon')), Y.DB.DIV('designs-details-previous', Y.DB.SPAN('icon')))

        ); // Wrapper
        output = output.get('children');
      } else if (params && params.mode && params.mode === 'customer') {
        output = Y.DB.DIV("designs-template " + (entry.inStore ? "designs-template--template" : "designs-template--customer") + (entry.isNew ? " new" : "") + " website-" + entry.websiteId, {
          "data-websiteId": entry.websiteId,
          "data-name": entry.displayName.toLowerCase()
        }, Y.DB.DIV("browser browser--small browser--fluid browser--shadow", Y.DB.IMG("designs-template-image", {
          // "data-image-dimensions": "100x100",
          "data-src": this.getImage(entry.thumbnailAssetUrl, 500),
          "data-load": "viewport"
        }), Y.DB.DIV("designs-template-info", Y.DB.DIV("button--centered", Y.DB.DIV("button button-square button-square-small button-square-filled button-square-light", {
          html: 'View Example'
        })))));

        output.appendChild(Y.Node.create('<span class="designs-template-mobile">View Example</span>'));
      } else {
        output = Y.DB.DIV("designs-template " + (entry.inStore ? "designs-template--template" : "designs-template--customer") + (entry.isNew ? " new" : "") + " website-" + entry.websiteId, {
          "data-websiteId": entry.websiteId,
          "data-name": entry.displayName.toLowerCase()
        }, Y.DB.DIV("designs-template-header", Y.DB.SPAN("designs-template-recommended", Y.DB.SPAN('icon'))), Y.DB.DIV("browser browser--small browser--fluid browser--shadow" + ((entry.displayName === 'Momentum' || entry.displayName === 'Frontrow') ? ' browser--bottom' : ''), Y.DB.IMG("designs-template-image", {
          // "data-image-dimensions": "100x100",
          "data-src": this.getImage(entry.thumbnailAssetUrl, 500),
          "data-load": "viewport",
          "alt": entry.displayName
        }), (entry.isNew ? Y.DB.DIV("new-tag", {
          html: "NEW"
        }) : null), Y.DB.DIV("designs-template-info", Y.DB.DIV("button--centered", Y.DB.DIV("button button-square button-square-small button-square-filled button-square-light", {
          html: 'View ' + entry.displayName
        })))));

        output.appendChild(Y.Node.create('<span class="designs-template-mobile">View ' + entry.displayName + '</span>'));
      }

      return output;

    },

    shuffleStoreSites: function() {

      var i = this.storeWebsites.length;
      if (i == 0) return false;
      while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        var tempi = this.storeWebsites[i];
        var tempj = this.storeWebsites[j];
        this.storeWebsites[i] = tempj;
        this.storeWebsites[j] = tempi;
      }

    },

    clear: function() {

      if ((this.lastQuery.length == 0 || this.invalidQuery) && this.state != 'overview') {

        this.lastQueryTags = [];

        // shuffle
        if (!this.randomized) {
          this.shuffleStoreSites();
          this.randomized = true;
        }

        // put any new templates at the front of the list
        if (this.params.moveNewTemplatesToFront) {
          var lastPromotedIndex = 0;
          for (var i = 0; i < this.storeWebsites.length; ++i) {
            var site = this.storeWebsites[i];
            if (site.isNew) {
              // swap it to front
              var existingTemplate = this.storeWebsites[lastPromotedIndex];
              this.storeWebsites[lastPromotedIndex] = site;
              this.storeWebsites[i] = existingTemplate;
              // increment
              ++lastPromotedIndex;
            }
          }
        }

        // render overview
        this.resultsEl.setContent('');

        var fragment = document.createDocumentFragment();
        for (var i = 0; i < this.storeWebsites.length; ++i) {
          var e = this.storeWebsites[i];
          var templateEl = this.renderResult(e);
          //this.resultsEl.append(templateEl);
          fragment.appendChild(templateEl._node);
        }

        this.resultsEl._node.appendChild(fragment);

        this.suggestionEl.set('value', '');
        this.enterState('overview');

      } else {

        this.setMessage("No matching templates.", "We couldn\'t find any templates that matched your search.");
        this.enterState('no-results');

      }

    },

    setMessage: function(title, desc) {

      this.resultsEl.setContent('<div class="message">' + title + '</div><div class="sub-message">' + desc + '</div>');

    },

    enterState: function(state) {

      if (state == 'overview') {
        Y.one(".clear-search").removeClass('visible');
        this.resultsEl.addClass("overview");
      } else {
        Y.one(".clear-search").addClass('visible');
        this.resultsEl.removeClass("overview");
      }

      this.state = state;

    },

    setValue: function(query) {
      if (this.inputEl) {
        this.inputEl.set('value', query);
        this.onKeyUp();
        //this.scrollTop();
      } else {
        console.warn('this.inputEl is empty');
      }
    },

    onKeyUp: function(e) {

      if (this.skipNextKeyUp) {
        this.skipNextKeyUp = false;
        return;
      }

      var newQuery = this.inputEl.get("value").trim();
      if (newQuery == this.lastQuery) {
        return;
      }
      this.lastQuery = newQuery;

      if (this.lastQuery.length < this.MIN_QUERY_LENGTH) {
        this.clear();
        return;
      } // too short
      this.search(this.lastQuery.toLowerCase().split(" "));

    },

    matchesAllNonTemplateTags: function(template, queryTags) {

      // for each tag, make sure it's present on the template
      for (var i = 0; i < queryTags.length; ++i) {

        var rootTag = this.storeTemplatesByTag[queryTags[i]] ? queryTags[i] : this.stem(queryTags[i]);
        var found = false;
        // if this is a website tag, ignore it
        if (this.storeTemplatesByTag[rootTag]) {
          continue;
        }

        // find this tag
        if (template.tags) {
          for (var j = 0; j < template.tags.length; ++j) { // slow -- mapify this latter?
            var templateTag = template.tags[j];
            if (templateTag == rootTag) {
              found = true;
            }
          }
        }

        if (!found) { // a required tag was missing
          return false;
        }

      }

      return true;

    },

    getActiveFilter: function() {
      var mode = '';

      if (Y.Squarespace.FrontSite.ActiveTemplateFilters && Y.Squarespace.FrontSite.ActiveTemplateFilters !== 'featured') {
        mode = ' ' + Y.Squarespace.FrontSite.ActiveTemplateFilters;
      }

      return mode;
    },

    hasEnoughCustomerExamples: function(template) {
      var template = this.storeTemplatesByTag[template];
      return template && template.customerExampleSites && template.customerExampleSites.length >= this.MIN_EXAMPLES ? true : false;
    },

    templateInCategory: function(template, category) {
      var tag = category,
        templateTag, hits, wantedTags;

      category = Y.Squarespace.FrontSite.TemplateFilters[category];
      template = template.toLowerCase();

      if (category) {
        for (var t = 0; t < category.length; t++) {
          if (category[t] === template) {
            tag = this.stem(tag);
            hits = 0;

            // Get template
            template = this.storeTemplatesByTag[template];

            for (var c = 0; c < template.customerExampleSites.length; c++) {
              wantedTags = {};

              for (var t = 0; t < template.customerExampleSites[c].tags.length; t++) {
                templateTag = template.customerExampleSites[c].tags[t];

                if (!wantedTags[templateTag]) {
                  wantedTags[templateTag] = true;

                  if (templateTag === tag) {
                    hits++;
                    wantedTags[tag] = true;
                  }

                  if (hits >= this.MIN_EXAMPLES) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }

      return false;
    },

    // find source templates that match certain tags
    findRelevantTemplates: function(queryTags, returnResults, keepTop) {
      if (!returnResults && !this.isStoreTemplate(queryTags[0])) {
        //this.history.addValue("search", this.lastQuery, { url: "/templates/"});
        SQUARESPACE_IS_AWESOME.changeUrl('templates/index.html');
        return;
      }

      // reset counts
      for (var i = 0; i < this.storeWebsites.length; ++i) {
        var storeWebsite = this.storeWebsites[i];
        storeWebsite.hits = 0;
      }

      // clear state
      this.state = "empty";

      var consumerScores = {}; // template -> score
      var storeScores = {}; // template -> score
      var tagCounts = {}; // tag -> match count
      var templatesFound = [];
      var directTemplateMatch = null;
      this.resultsByTemplate = {}; // results cache, for pagination

      // for every tag
      for (var i = 0; i < queryTags.length; ++i) {
        var tag = this.storeTemplatesByTag[queryTags[i]] ? queryTags[i] : this.stem(queryTags[i]);

        // find templates that are tagged with this term
        var templates = this.websitesByTag[this.stem(tag)];

        // was a template tag present?  enter direct mode
        var match = this.storeTemplatesByTag[tag];
        if (match) {
          this.enterState('direct');
          directTemplateMatch = match;
        }

        // take those templates and record how many tags match
        for (templateId in templates) {

          var template = this.websitesById[templateId];

          if (typeof template === "undefined") continue;

          // deal with template match
          if (template.inStore) {

            // we matched a parent template
            var templateScore = storeScores[template.websiteId];
            if (!templateScore) {
              storeScores[template.websiteId] = 1;
              templatesFound.push(template);
            } else {
              storeScores[template.websiteId] = templateScore + 1;
            }

            template.hits++;

          } else {

            // this is a customer site match

            // but make sure they match all in the query!
            if (!this.matchesAllNonTemplateTags(template, queryTags)) {
              continue;
            }

            // score one for the template...
            var templateScore = consumerScores[template.websiteId];
            if (!templateScore) {
              consumerScores[template.websiteId] = 1;
            } else {
              consumerScores[template.websiteId] = templateScore + 1;
            }

            // and one for the parent...
            template = this.websitesById[template.templateWebsiteId];
            if (template) {

              var templateScore = storeScores[template.websiteId];
              if (!templateScore) {
                storeScores[template.websiteId] = 1;
                templatesFound.push(template);
              } else {
                storeScores[template.websiteId] = templateScore + 1;
              }

              template.hits++;

            }

          }

        }
      }

      // if we have a direct match -- boost that template's score so it wins
      if (directTemplateMatch) {
        this.websitesById[directTemplateMatch.websiteId].hits = 1000000;
      }

      var matches = 0,
        examples = 0;

      // sort by hits
      templatesFound.sort(function(a, b) {
        return b.hits - a.hits;
      });

      if (returnResults) {
        return templatesFound;
      }

      // for each scored template that was in the store
      for (var j = 0; j < templatesFound.length; ++j) {

        var template = templatesFound[j];

        console.log("(q=" + queryTags + ") matches template " + template.websiteIdentifier + " (" + template.hits + ") +" + template.customerExampleSites.length + " consumer variants");

        // count templates
        ++matches;

        // attach scores to each template
        for (var i = 0; i < template.customerExampleSites.length; ++i) {
          var exampleSite = template.customerExampleSites[i];
          var score = consumerScores[exampleSite.websiteId];
          if (!score) {
            score = 0;
          }
          if (score > 0 && exampleSite.rating) {
            score += exampleSite.rating;
          } // rating boosts a template's score, but only if it scored something
          // console.log("  - example: " + exampleSite.websiteIdentifier + " (" + score + " +" + exampleSite.rating + ")");
          exampleSite.score = score;
        }

        // filter score = 0
        var relevantSites = Y.Array.filter(template.customerExampleSites, function(o) {
          return o.score != 0;
        });

        // count examples
        examples += relevantSites.length;

        // save tags from examples
        for (var k = 0; k < template.customerExampleSites.length; ++k) {
          var site = template.customerExampleSites[k];
          // save tags
          for (var kk = 0; kk < site.originalTags.length; ++kk) {
            var tag = site.originalTags[kk];
            if (!tagCounts[tag]) {
              tagCounts[tag] = 0;
            }
            tagCounts[tag]++;
          }
        }

        // sort by score
        relevantSites.sort(function(a, b) {
          return b.score - a.score;
        });

        // render result row
        !keepTop && this.designsPage.prepend(this.renderRow(template, relevantSites));
        this.prepareArrows();

        // save results by template
        this.resultsByTemplate[template.websiteId] = {
          page: 0,
          relevantSites: relevantSites
        };

        // only render the direct match
        if (this.state == 'direct') {

          // render extended results
          var extendedExamplesEl = Y.DB.DIV("designs-customers");

          var suffix = "";
          var tagWords = [];

          // build a suffix from non-template terms
          for (var i = 1; i < this.lastQueryTags.length; ++i) {
            var tag = this.lastQueryTags[i];
            if (!this.storeTemplatesByTag[this.stem(tag)]) {
              tagWords.push(tag);
            }
          }

          // show top tags
          var tagsEl = Y.DB.DIV("designs-customers-tags", Y.DB.SPAN("designs-customers-tag" + (tagWords.length === 0 ? " designs-customers-tag--active" : ""), {
            html: tagWords.length === 0 ? "Show" : "All"
          }));
          var active = false;

          for (var filter in Y.Squarespace.FrontSite.TemplateFilters) {
            if (this.templateInCategory(template.displayName, filter || Y.Squarespace.FrontSite.ActiveTemplateFilters)) {
              active = tagWords.length > 0 && (filter || Y.Squarespace.FrontSite.ActiveTemplateFilters) === tagWords[0] ? true : false;
              tagsEl.append(Y.DB.SPAN("designs-customers-tag set" + (active ? " designs-customers-tag--active" : ""), {
                "data-tag": filter,
                html: filter
              }));
            }
          }

          var top = Y.Node.create('<div class="designs-customers-intro is--hidden clearfix"></div>');

          // render
          if (tagsEl && template.customerExampleSites.length !== 0) {
            top.appendChild(tagsEl);

            if (tagsEl.get('children').size() <= 1) {
              top.addClass('designs-customers-intro--nofilter');
            }
          }

          if (!Y.Squarespace.FrontSite.ActiveTemplateFilters || Y.Squarespace.FrontSite.ActiveTemplateFilters === 'personal' || Y.Squarespace.FrontSite.ActiveTemplateFilters === 'featured') {
            top.prepend(Y.Node.create('<h3 class="designs-customers-using">Customer websites using ' + directTemplateMatch.displayName + suffix + '</h3>'));
          } else if (!Y.Squarespace.FrontSite.ActiveTemplateFilters || Y.Squarespace.FrontSite.ActiveTemplateFilters === 'weddings') {
            top.prepend(Y.Node.create('<h3 class="designs-customers-using">Couples using ' + directTemplateMatch.displayName + suffix + '</h3>'));
          } else {
            top.prepend(Y.Node.create('<h3 class="designs-customers-using">' + Y.Squarespace.FrontSite.ActiveTemplateFilters.capitalize() + ' using ' + directTemplateMatch.displayName + suffix + '</h3>'));
          }

          extendedExamplesEl.prepend(top);

          if (relevantSites.length < this.MIN_EXAMPLES) {
            if (!this.hasEnoughCustomerExamples(this.stripDemoSuffix(template.templateWebsiteIdentifier))) {
              extendedExamplesEl.append(Y.Node.create('<div class="designs-customers-message"><div class="message">New template &mdash; no customer examples yet.</div><div class="sub-message">This template is new to our template store, so we don\'t have any customer examples to show you quite yet. Check back soon!</div></div>'));
              extendedExamplesEl.addClass('is--hidden');
            } else {
              extendedExamplesEl.append(Y.Node.create('<div class="designs-customers-message"><div class="message">No customer examples yet.</div><div class="sub-message">We have not listed any customer examples in the selected category for this template.  Please try a less specific search.</div></div>'));
              extendedExamplesEl.addClass('is--hidden');
            }
          } else {
            extendedExamplesEl.removeClass('is--hidden');
          }

          // click to remove tags
          extendedExamplesEl.on("click", function(e) {

            if (e.target.hasClass('designs-customers-tag') && !e.target.hasClass('designs-customers-tag--active')) {

              this.scrollPos = SQUARESPACE_IS_AWESOME._winY();
              var el = e.target.ancestor("[data-tag]", true);

              this.prepareArrows();

              if (el) {
                // Use a filter
                var tag = el.getAttribute("data-tag");
                Y.Squarespace.FrontSite.ActiveTemplateFilters = tag;

                this.trackEvent('frontsite_template_sort', null, {
                  page: 'template',
                  filter: tag
                });

                if (el.hasClass("set")) {
                  this.setValue(this.templateNameToTag(directTemplateMatch.websiteIdentifier) + " " + tag);
                } else {
                  var query = this.lastQueryTags.slice(0); // clone
                  var tagIdx = query.indexOf(tag);

                  if (tagIdx != -1) {
                    query.splice(tagIdx, 1);
                  }
                  this.setValue(query.join(" "));
                }
              } else {
                // Reset
                el = extendedExamplesEl.one('.designs-customers-tag');

                this.trackEvent('frontsite_template_sort', null, {
                  page: 'template',
                  filter: 'all'
                });

                if (!el.hasClass('designs-customers-tag--active')) {
                  Y.Squarespace.FrontSite.ActiveTemplateFilters = '';
                  this.setValue(this.templateNameToTag(directTemplateMatch.websiteIdentifier));
                }
              }

              Y.one('.designs-body').setStyle('minHeight', window.innerHeight - Y.one('.footer').get('clientHeight'));
              window.scrollTo(0, this.scrollPos);
            }

          }, this);

          this.renderExamples(extendedExamplesEl, relevantSites);
          this.resultsEl.append(extendedExamplesEl);

          // trace query
          this.trackQuery(queryTags.join(" "), matches, examples);

          return; // complete here
        }

      }

      // display no results
      if (!matches) {
        this.clear();
      } else {

        this.enterState('search');

        // track non failed searches
        this.trackQuery(matches, examples);

      }

      // caption
      if (this.state == "search") {

        this.resultsEl.prepend(Y.DB.DIV("caption clear", Y.DB.DIV("lhs", {
          html: "Recommended Templates"
        }), Y.DB.DIV("rhs", "Customers Using This Template for " + queryTags.join(" "))));
        this.showCaption(this.resultsEl.one(".caption"));

      }


    },

    showCaption: function(o) {
      Y.later(200, o, o.addClass, "show");
    },

    _commonPrefixLength: function(search, against) {
      var i = 0;
      if (search.length > against.length) {
        return -1;
      }
      while (true) {
        if (i == search.length) {
          break;
        }
        if (i == against.length) {
          break;
        }
        if (search.charAt(i) != against.charAt(i)) {
          return -1;
        }++i;
      }
      return i;
    },


    updateSuggestionState: function(queryTags) {

      var lastTag = queryTags[queryTags.length - 1];
      var firstLetter = lastTag.charAt(0);
      var letterIndex = 0,
        bestPrefix = 0;
      var currentTags = {};
      var match = null;

      // save curernt tags in an associative array
      for (var i = 0; i < queryTags.length - 1; ++i) {
        currentTags[queryTags[i]] = true;
      }

      // find new matches
      for (var i = 0; i < this.tagsInOrder.length; ++i) {
        var possibleTag = this.tagsInOrder[i];
        // first, scan for hitting the correct first letter of the string we're matching for
        if (possibleTag.charAt(0) == firstLetter) {
          if (possibleTag == lastTag) {
            // exact match -- don't suggest anything
            match = null;
            break;
          }
          // we're a possible match -- check common prefix count
          var p = this._commonPrefixLength(lastTag, possibleTag);
          if (p > bestPrefix && !currentTags[possibleTag] && possibleTag != lastTag) { // this is a better match than the last one we had, and we have not used the word before
            bestPrefix = p;
            match = possibleTag;
          }
        }
        if (possibleTag.charAt(0) > firstLetter) {
          // we went too far
          break;
        }
      }

      var suggestedTags;

      console.log("suggestion update", queryTags, "matched " + match + " currentTags", currentTags);

      if (match) {
        // add the match we found to the suggestion state
        suggestedTags = queryTags.slice(0, queryTags.length - 1);
        suggestedTags.push(match);
      } else {
        // no match -- just use what we had
        suggestedTags = queryTags;
      }

      // show what is suggested
      this.suggestionEl.set('value', suggestedTags.join(' '));

      return suggestedTags;

    },


    topLevelFilter: function(filter) {
      var results = filter ? this.findRelevantTemplates(new Array(filter), true) : this.storeWebsites;
      var wrapper = Y.one('.designs-templates');

      wrapper.empty();

      var fragment = document.createDocumentFragment();
      for (var i = 0; i < results.length; i++) {
        fragment.appendChild(this.renderResult(results[i])._node);
      }
      wrapper._node.appendChild(fragment);
    },


    // search some typed in tags
    search: function(queryTags) {

      // update suggestions -- actually query from suggestions
      queryTags = this.updateSuggestionState(queryTags);

      // filter common words
      queryTags = Y.Array.filter(queryTags, function(o) {
        return !this.filteredWords[o];
      }, this);

      // bail if we were totally filtered
      if (queryTags.length == 0) {
        this.invalidQuery = true;
        this.clear();
        return;
      } else {
        this.invalidQuery = false;
      }

      // map words to equivalent ones
      this.normalizeTags(queryTags);

      // is this search different from our last one?
      var same = true;
      var sameTemplate = true;

      if (queryTags[0] !== this.lastQueryTags[0]) {
        sameTemplate = false;
      } else {
        Y.one('.designs-details-info').addClass('designs-details-info--no-refresh');
      }

      if (queryTags.length == this.lastQueryTags.length) {
        for (var i = 0; i < queryTags.length; ++i) {
          if (queryTags[i] != this.lastQueryTags[i]) {
            same = false;
            break;
          }
        }
      } else {
        same = false;
      }

      // did something change?
      if (!same) {

        this.resultsEl.setContent('');

        // save
        this.lastQueryTags = queryTags;

        // search
        this.findRelevantTemplates(queryTags, null, sameTemplate);

        // history
        this.history.addValue("search", this.lastQuery, {
          url: "/templates/?q=" + this.lastQuery
        });
      }

    }

  });

  Y.augment(Y.Squarespace.FrontSite.SiteFilter, Y.EventTarget);




  /**
   * Stemmer, implementing the Porter Stemming Algorithm
   *
   * The Stemmer class transforms a word into its root form.  The input
   * word can be provided a character at time (by calling add()), or at once
   * by calling one of the various stem(something) methods.
   * The original paper is in
   *
   *   Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14,
   *   no. 3, pp 130-137,
   *
   *  http://www.tartarus.org/~martin/PorterStemmer
   *  http://tartarus.org/~martin/PorterStemmer/java.txt
   */

  Y.namespace('Squarespace.FrontSite').Stemmer = Class.create({

    initialize: function(word) {
      this.INC = 50;
      this.b = word; // word to stem
      this.i = word.length; // offset into buffer
      this.i_end = 0; // offset to end of stemmed word
      this.j = 0;
      this.k = 0;
    },

    getResult: function() {
      return this.b.substring(0, this.i_end);
    },

    /* cons(i) is true <=> b[i] is a consonant. */
    cons: function(i) {
      switch (this.b[i]) {
      case 'a':
      case 'e':
      case 'i':
      case 'o':
      case 'u':
        return false;
      case 'y':
        return (i == 0) ? true : !this.cons(i - 1);
      default:
        return true;
      }
    },

    /* m() measures the number of consonant sequences between 0 and j. if c is
       a consonant sequence and v a vowel sequence, and <..> indicates arbitrary
       presence,

          <c><v>       gives 0
          <c>vc<v>     gives 1
          <c>vcvc<v>   gives 2
          <c>vcvcvc<v> gives 3
          ....
    */
    m: function() {
      var n = 0;
      var i = 0;
      while (true) {
        if (i > this.j) return n;
        if (!this.cons(i)) break;
        i++;
      }
      i++;
      while (true) {
        while (true) {
          if (i > this.j) return n;
          if (this.cons(i)) break;
          i++;
        }
        i++;
        n++;
        while (true) {
          if (i > this.j) return n;
          if (!this.cons(i)) break;
          i++;
        }
        i++;
      }
    },

    /* vowelinstem() is true <=> 0,...j contains a vowel */
    vowelinstem: function() {
      var i;
      for (i = 0; i <= this.j; i++) if (!this.cons(i)) return true;
      return false;
    },

    /* doublec(j) is true <=> j,(j-1) contain a double consonant. */
    doublec: function(j) {
      if (j < 1) return false;
      if (this.b[j] != this.b[j - 1]) return false;
      return this.cons(j);
    },

    /* cvc(i) is true <=> i-2,i-1,i has the form consonant - vowel - consonant
       and also if the second c is not w,x or y. this is used when trying to
       restore an e at the end of a short word. e.g.

          cav(e), lov(e), hop(e), crim(e), but
          snow, box, tray.

    */
    cvc: function(i) {
      if (i < 2 || !this.cons(i) || this.cons(i - 1) || !this.cons(i - 2)) return false; {
        var ch = this.b[i];
        if (ch == 'w' || ch == 'x' || ch == 'y') return false;
      }
      return true;
    },

    ends: function(s) {
      var l = s.length;
      var o = this.k - l + 1;
      if (o < 0) return false;
      for (var i = 0; i < l; i++) if (this.b[o + i] != s.charAt(i)) return false;
      this.j = this.k - l;
      return true;
    },

    /* setto(s) sets (j+1),...k to the characters in the string s, readjusting
       k. */

    setto: function(s) {
      var l = s.length;
      var o = this.j + 1;
      for (var i = 0; i < l; i++) this.b[o + i] = s.charAt(i);
      this.k = this.j + l;
    },

    /* r(s) is used further down. */
    r: function(s) {
      if (this.m() > 0) this.setto(s);
    },

    /* step1() gets rid of plurals and -ed or -ing. e.g.

           caresses  ->  caress
           ponies    ->  poni
           ties      ->  ti
           caress    ->  caress
           cats      ->  cat

           feed      ->  feed
           agreed    ->  agree
           disabled  ->  disable

           matting   ->  mat
           mating    ->  mate
           meeting   ->  meet
           milling   ->  mill
           messing   ->  mess

           meetings  ->  meet

    */
    step1: function() {
      if (this.b[this.k] == 's') {
        if (this.ends("sses")) this.k -= 2;
        else if (this.ends("ies")) this.setto("i");
        else if (this.b[this.k - 1] != 's') this.k--;
      }
      if (this.ends("eed")) {
        if (this.m() > 0) this.k--;
      } else if ((this.ends("ed") || this.ends("ing")) && this.vowelinstem()) {
        this.k = this.j;
        if (this.ends("at")) this.setto("ate");
        else if (this.ends("bl")) this.setto("ble");
        else if (this.ends("iz")) this.setto("ize");
        else if (this.doublec(this.k)) {
          this.k--; {
            var ch = this.b[this.k];
            if (ch == 'l' || ch == 's' || ch == 'z') this.k++;
          }
        } else if (this.m() == 1 && this.cvc(this.k)) this.setto("e");
      }
    },

    /* step2() turns terminal y to i when there is another vowel in the stem. */

    step2: function() {
      if (this.ends("y") && this.vowelinstem()) this.b[this.k] = 'i';
    },

    /* step3() maps double suffices to single ones. so -ization ( = -ize plus
       -ation) maps to -ize etc. note that the string before the suffix must give
       m() > 0. */

    step3: function() {
      if (this.k == 0) return; /* For Bug 1 */
      switch (this.b[this.k - 1]) {
      case 'a':
        if (this.ends("ational")) {
          this.r("ate");
          break;
        }
        if (this.ends("tional")) {
          this.r("tion");
          break;
        }
        break;
      case 'c':
        if (this.ends("enci")) {
          this.r("ence");
          break;
        }
        if (this.ends("anci")) {
          this.r("ance");
          break;
        }
        break;
      case 'e':
        if (this.ends("izer")) {
          this.r("ize");
          break;
        }
        break;
      case 'l':
        if (this.ends("bli")) {
          this.r("ble");
          break;
        }
        if (this.ends("alli")) {
          this.r("al");
          break;
        }
        if (this.ends("entli")) {
          this.r("ent");
          break;
        }
        if (this.ends("eli")) {
          this.r("e");
          break;
        }
        if (this.ends("ousli")) {
          this.r("ous");
          break;
        }
        break;
      case 'o':
        if (this.ends("ization")) {
          this.r("ize");
          break;
        }
        if (this.ends("ation")) {
          this.r("ate");
          break;
        }
        if (this.ends("ator")) {
          this.r("ate");
          break;
        }
        break;
      case 's':
        if (this.ends("alism")) {
          this.r("al");
          break;
        }
        if (this.ends("iveness")) {
          this.r("ive");
          break;
        }
        if (this.ends("fulness")) {
          this.r("ful");
          break;
        }
        if (this.ends("ousness")) {
          this.r("ous");
          break;
        }
        break;
      case 't':
        if (this.ends("aliti")) {
          this.r("al");
          break;
        }
        if (this.ends("iviti")) {
          this.r("ive");
          break;
        }
        if (this.ends("biliti")) {
          this.r("ble");
          break;
        }
        break;
      case 'g':
        if (this.ends("logi")) {
          this.r("log");
          break;
        }
      }
    },

    /* step4() deals with -ic-, -full, -ness etc. similar strategy to step3. */

    step4: function() {
      switch (this.b[this.k]) {
      case 'e':
        if (this.ends("icate")) {
          this.r("ic");
          break;
        }
        if (this.ends("ative")) {
          this.r("");
          break;
        }
        if (this.ends("alize")) {
          this.r("al");
          break;
        }
        break;
      case 'i':
        if (this.ends("iciti")) {
          this.r("ic");
          break;
        }
        break;
      case 'l':
        if (this.ends("ical")) {
          this.r("ic");
          break;
        }
        if (this.ends("ful")) {
          this.r("");
          break;
        }
        break;
      case 's':
        if (this.ends("ness")) {
          this.r("");
          break;
        }
        break;
      }
    },

    /* step5() takes off -ant, -ence etc., in context <c>vcvc<v>. */

    step5: function() {
      if (this.k == 0) return; /* for Bug 1 */
      switch (this.b[this.k - 1]) {
      case 'a':
        if (this.ends("al")) break;
        return;
      case 'c':
        if (this.ends("ance")) break;
        if (this.ends("ence")) break;
        return;
      case 'e':
        if (this.ends("er")) break;
        return;
      case 'i':
        if (this.ends("ic")) break;
        return;
      case 'l':
        if (this.ends("able")) break;
        if (this.ends("ible")) break;
        return;
      case 'n':
        if (this.ends("ant")) break;
        if (this.ends("ement")) break;
        if (this.ends("ment")) break;
        /* element etc. not stripped before the m */
        if (this.ends("ent")) break;
        return;
      case 'o':
        if (this.ends("ion") && this.j >= 0 && (this.b[this.j] == 's' || this.b[this.j] == 't')) break;
        /* j >= 0 fixes Bug 2 */
        if (this.ends("ou")) break;
        return;
        /* takes care of -ous */
      case 's':
        if (this.ends("ism")) break;
        return;
      case 't':
        if (this.ends("ate")) break;
        if (this.ends("iti")) break;
        return;
      case 'u':
        if (this.ends("ous")) break;
        return;
      case 'v':
        if (this.ends("ive")) break;
        return;
      case 'z':
        if (this.ends("ize")) break;
        return;
      default:
        return;
      }
      if (this.m() > 1) this.k = this.j;
    },

    /* step6() removes a final -e if m() > 1. */

    step6: function() {
      this.j = this.k;
      if (this.b[this.k] == 'e') {
        var a = this.m();
        if (a > 1 || a == 1 && !this.cvc(this.k - 1)) this.k--;
      }
      if (this.b[this.k] == 'l' && this.doublec(this.k) && this.m() > 1) this.k--;
    },

    /** Stem the word placed varo the Stemmer buffer through calls to add().
     * Returns true if the stemming process resulted in a word different
     * from the input.  You can retrieve the result with
     * getResultLength()/getResultBuffer() or toString().
     */
    stem: function() {
      this.k = this.i - 1;
      if (this.k > 1) {
        this.step1();
        this.step2();
        this.step3();
        this.step4();
        this.step5();
        this.step6();
      }
      this.i_end = this.k + 1;
      this.i = 0;
      return this;
    }

  });


}, '1.1', {
  requires: ['base', 'squarespace-image-loader', 'history', 'datatype-date-format', 'squarespace-signup', 'squarespace-utils-yui']
});

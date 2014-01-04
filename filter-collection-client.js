Meteor.FilterCollection = function (collection, settings) {
  self = this;

  self._collection = collection;

  self._options = settings || {};
  self._options.filters = self._options.filters || [];
  self._options.pager = self._options.pager || {};

  self._filters = {};

  self._pager = {
    itemsPerPage: 5,
    currentPage: 1,
    itemsPerPageOptions: [{
      value: 2
    }, {
      value: 5
    }, {
      value: 10
    }, {
      value: 15
    }, {
      value: 20
    }, {
      value: 25
    }, {
      value: 50
    }, ]
  };

  self._settings = {};
  self._settings = _.extend(self._settings, _.omit(settings, 'pager', 'filters'));

  self._filters = _.extend(self._filters, self._options.filters);

  self._pager = _.extend(self._pager, self._options.pager);

  self._deps = new Deps.Dependency();

  /**
   * Collection cursor handler.
   */

  self.items = function () {
    Deps.depend(self._deps);

    // console.log('settings: ', self._settings);
    // console.log('pager: ', self._pager);
    // console.log('filters: ', self._filters);
    // console.log('self.getFilters: ', self.getFilters());

    return self._collection.find(
      self.getFilters(), {
        skip: self.skipItems(),
        limit: self._pager.itemsPerPage
      }
    );
  };

  /**
   * Filter methods
   */

  self.setFilter = function (key, filter) {

    var allowed = false;

    if (_.has(self._filters, key))
      allowed = true;

    if (!allowed)
      throw new Error("Filter Collection: Not allowed filter.");

    self._filters[key] = _.extend(self._filters[key], filter);

    return self._filters;
  };

  self.getFilters = function () {

    var query = {};

    _.each(self._filters, function (filter, key) {

      if (filter.value) {
        var segment = {}, group = {};
        segment[key] = {};

        if (filter.operator && filter.operator.name) {
          segment[key][filter.operator.name] = filter.value;
          if (filter.operator.options)
            segment[key].$options = filter.operator.options;
        } else {
          segment[key] = filter.value;
        }

        if (filter.group && filter.group !== '') {
          group[filter.group] = [];
          group[filter.group].push(segment);
        }

        query = _.extend(query, (!_.isEmpty(group) ? group : segment));
      }
    });

    return query;
  };

  self.currentFilters = function () {

    var filters = [];

    _.each(self._filters, function (filter, key) {
      if (filter.value)
        filters.push({
          title: filter.title,
          value: filter.value,
          key: key
        });
    });

    return filters;
  };

  self.activeFilters = function(){
    var activeFilters = [];
    _.each(self._filters, function (filter, key) {
      if (filter.value)
        activeFilters.push(key);
    });

    return activeFilters;
  };

  self.clearFilters = function () {
    _.each(self._filters, function (filter, key) {
      if (filter.value)
        self._filters[key].value = undefined;
    });
  };

  self.filter = function () {
    self._pager.currentPage = 1;
    self._deps.changed();
  };

  self.searchableFilters

  /**
   * Pager methods
   */

  self.itemsPerPage = function () {
    _.each(self._pager.itemsPerPageOptions, function (v) {
      v.status = (self._pager.itemsPerPage === v.value) ? 'selected' : '';
    });
    return self._pager.itemsPerPageOptions;
  };

  self.skipItems = function () {
    if (self._pager.currentPage !== 1)
      return (self._pager.currentPage - 1) * self._pager.itemsPerPage;
    else
      return 0;
  };

  self.showNext = self.showLast = function () {
    return (self._pager.currentPage < self.totalPages());
  };

  self.moveNext = function () {
    if (self._pager.currentPage < self.totalPages()) {
      self._pager.currentPage++;
      self._deps.changed();
    }
  };

  self.moveLast = function () {
    if (self._pager.currentPage < self.totalPages()) {
      self._pager.currentPage = self.totalPages();
      self._deps.changed();
    }
  };

  self.showPrevious = self.showFirst = function () {
    return (self._pager.currentPage > 1);
  };

  self.movePrevious = function () {
    if (self._pager.currentPage > 1) {
      self._pager.currentPage--;
      self._deps.changed();
    }
  };

  self.moveFirst = function () {
    if (self._pager.currentPage > 1) {
      self._pager.currentPage = 1;
      self._deps.changed();
    }
  };

  self.totalItems = function () {
    self._pager.totalItems = self._collection.find(
      self.getFilters()
    ).count();
    return self._pager.totalItems;
  };

  self.pages = function () {
    var pages = [];
    for (var i = 1; i <= self.totalPages(); i++) {
      var status = (self._pager.currentPage === i) ? 'active' : '';
      pages.push({
        page: i,
        status: status
      });
    }
    return pages;
  };

  self.totalPages = function () {
    return Math.ceil(self._pager.totalItems / self._pager.itemsPerPage);
  };

  self.pageOffset = function () {
    var offset = self.skipItems() + self._pager.itemsPerPage;
    return (offset > self.totalItems()) ? self.totalItems() : offset;
  };

  if (Template[self._settings.template]) {

    /**
     * Template helpers.
     */

    Template[self._settings.template].helpers({
      fc: function () {
        return self;
      }
    });

    /**
     * Template behaviours.
     */

    Template[self._settings.template].events({

      /** Pager **/
      'change .fc-items-per-page': function (event) {
        event.preventDefault();
        self._pager.itemsPerPage = parseInt(event.target.value, 10) || self._pager.itemsPerPage;
        self._pager.currentPage = 1;
        self._deps.changed();
      },
      'click .fc-pager .fc-page': function (event) {
        event.preventDefault();
        self._pager.currentPage = this.page;
        self._deps.changed();
      },
      'click .fc-pager .fc-first': function (event) {
        event.preventDefault();
        self.moveFirst();
      },
      'click .fc-pager .fc-prev': function (event) {
        event.preventDefault();
        self.movePrevious();
      },
      'click .fc-pager .fc-next': function (event) {
        event.preventDefault();
        self.moveNext();
      },
      'click .fc-pager .fc-last': function (event) {
        event.preventDefault();
        self.moveLast();
      },

      /** Filters **/
      'click .fc-filter a': function (event) {
        event.preventDefault();
        var field = event.target.getAttribute('data-fc-field');
        var value = event.target.getAttribute('data-fc-value');

        self.setFilter(field, {
          value: value
        });

        self.filter();
      },
      'click .fc-search': function (event, template) {
        event.preventDefault();
        var field = template.find('.fc-search-box').getAttribute('data-fc-field');
        var value = template.find('.fc-search-box').value;

        self.setFilter(field, {
          value: value
        });

        self.filter();
      },
      'click .fc-current-filters': function (event) {
        event.preventDefault();
        if(self._filters[this.key])
          self._filters[this.key].value = undefined;
        self.filter();
      },
      'click .fc-clear-filter': function (event) {
        event.preventDefault();
        if(self.activeFilters().length)
          self.clearFilters();
        self.filter();
      }
    });
  }
};

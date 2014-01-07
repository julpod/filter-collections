Meteor.FilterCollections = function (id, collection, settings) {
  var self = this;

  self._id = id;
  self._idCount = self._id + '-count';
  self._idCollectionCount = self._id + 'CollectionCount';
  self._collectionCount = new Meteor.Collection(self._idCollectionCount);

  self._collection = collection;
  self._count = self._collectionCount;

  self._options = settings || {};
  self._options.filters = self._options.filters || [];
  self._options.pager = self._options.pager || {};

  self._filters = {};
  self._search = {};
  self._sort = {};

  self._pager = {
    itemsPerPage: 10,
    currentPage: 1,
    itemsPerPageOptions: [2, 5, 10, 15, 20, 25, 50]
  };

  self._settings = {};
  self._settings = _.extend(self._settings, _.omit(settings, 'pager', 'filters'));

  self._filters = _.extend(self._filters, self._options.filters);

  self._pager = _.extend(self._pager, self._options.pager);

  self._deps = {};
  self._deps.items = new Deps.Dependency();
  self._deps.search = new Deps.Dependency();
  self._deps.templateData = new Deps.Dependency();

  /**
   * Sort
   */

  self.getSort = function () {

    var sort = {};
    if (self._sort.field && self._sort.order) {
      sort['sort'] = {};
      sort['sort'][self._sort.field] = self._sort.order;
    }

    return sort;
  };

  self.setSort = function (field) {
    var currentSort = self._sort;

    self._sort = {
      field: field,
      order: (currentSort.order) ? currentSort.order * -1 : 1
    };

    self._deps.items.changed();
  };

  self.sortStatus = function () {

    var sortStatus = {};

    sortStatus[self._sort.field] = {
      desc: (self._sort.order === 1) ? true : false,
      asc: (self._sort.order === -1) ? true : false
    };

    return sortStatus;
  };

  /**
   * Search
   */

  self.activeSearch = function () {
    Deps.depend(self._deps.search);

    if (_.isEmpty(self._search)) {
      _.each(self._filters, function (filter, key) {
        if (filter.search && filter.search.enabled)
          self._search[key] = {
            title: filter.title || key,
            active: (filter.search.mandatory) ? true : (filter.search.active || false),
            mandatory: filter.search.mandatory || false
          };
      });
    }

    var activeSearch = [];
    _.each(self._search, function (field, key) {
      if (!field.mandatory)
        activeSearch.push(_.extend(field, {
          key: key
        }));
    });

    return activeSearch;
  };

  self.setActiveSearch = function (key, active) {
    self._search[key].active = active;
    self._deps.search.changed();
  };

  /**
   * Filter
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
    var group = {};

    _.each(self._filters, function (filter, key) {

      if (filter.value) {

        var segment = {};
        segment[key] = {};

        if (filter.operator && filter.operator.name) {
          segment[key][filter.operator.name] = filter.value;
          if (filter.operator.options)
            segment[key].$options = filter.operator.options;
        } else {
          segment[key] = filter.value;
        }

        if (filter.group && filter.group !== '') {
          group[filter.group] = group[filter.group] || [];
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

  self.activeFilters = function () {
    var activeFilters = [];
    _.each(self._filters, function (filter, key) {
      if (filter.value)
        activeFilters.push(key);
    });

    return activeFilters;
  };

  self.clearFilters = function (key) {
    if(key){
      self._filters[key].value = undefined;
      if(_.isEmpty(self.currentFilters()))
        self.searchValue = '';
    }else{
      self.searchValue = '';
      _.each(self._filters, function (filter, key) {
        if (filter.value)
          self._filters[key].value = undefined;
      });
    }
  };

  /**
   * Pager
   */

  self.getPager = function () {
    return {
      skip: self.skipItems(),
      limit: self._pager.itemsPerPage
    };
  };

  self.itemsPerPage = function () {
    var itemsPerPageList = [];
    var totalItems = self.totalItems();
    var appendLast = false;
    var selected = false;
    _.each(self._pager.itemsPerPageOptions, function (value) {
      if(totalItems >= value){
        selected = (self._pager.itemsPerPage === value) ? true : false;
        itemsPerPageList.push({
          value: value,
          status: (selected) ? 'selected' : ''
        });
      }else
        appendLast = true;
    });

    if (appendLast)
      itemsPerPageList.push({
        value: totalItems,
        status: (!selected) ? 'selected' : ''
      });

    return itemsPerPageList;
  };

  self.skipItems = function () {
    return (self._pager.currentPage - 1) * self._pager.itemsPerPage;
  };

  self.moveTo = function(page){
    self._pager.currentPage = page;
    self._deps.items.changed();
  };

  self.hasNext = function () {
    return (self._pager.currentPage < self.totalPages());
  };

  self.moveNext = function () {
    if (self._pager.currentPage < self.totalPages()) {
      self._pager.currentPage++;
      self._deps.items.changed();
    }
  };

  self.moveLast = function () {
    if (self._pager.currentPage < self.totalPages()) {
      self._pager.currentPage = self.totalPages();
      self._deps.items.changed();
    }
  };

  self.hasPrevious = function () {
    return (self._pager.currentPage > 1);
  };

  self.movePrevious = function () {
    if (self._pager.currentPage > 1) {
      self._pager.currentPage--;
      self._deps.items.changed();
    }
  };

  self.moveFirst = function () {
    if (self._pager.currentPage > 1) {
      self._pager.currentPage = 1;
      self._deps.items.changed();
    }
  };

  self.pages = function () {
    var pages = [];
    var allPages = [];

    var totalPages = self.totalPages();
    var currentPage = self._pager.currentPage;
    var showPages = 5;

    var start = (currentPage - 1) - Math.floor(showPages / 2);
    if (start < 0) start = 0;
    var end = start + showPages;
    if (end > totalPages) {
      end = totalPages;
      start = end - showPages;
      if (start < 0) start = 0;
    }

    for (var i = start; i < end; i++) {
      var status = (currentPage === i + 1) ? 'active' : '';
      pages.push({
        page: i + 1,
        status: status
      });
    }
    return pages;
  };

  self.totalPages = function () {
    return Math.ceil(self._pager.totalItems / self._pager.itemsPerPage);
  };

  self.totalItems = function () {
    return self._pager.totalItems;
  };

  self.pageOffset = function () {
    var offset = self.skipItems() + self._pager.itemsPerPage;
    return (offset > self.totalItems()) ? self.totalItems() : offset;
  };

  /**
   * Reactive subscriptions.
   */

   self.getQuery = function(){
    Deps.depend(self._deps.items);

    self.queryFields = self.getFilters();
    self.queryOptions = _.extend(self.getSort(), self.getPager());

    Meteor.subscribe(self._id, self.queryFields, self.queryOptions);
    Meteor.subscribe(self._idCount, self.queryFields);

    var totalItems = self._collectionCount.findOne() || {};
    self._pager.totalItems = totalItems.count || 0;

    self._deps.templateData.changed();
   };

  Deps.autorun(function(){
    self.getQuery();
  });

  /**
   * Meteor Template.
   */

  if (Template[self._settings.template]) {

    /**
     * Template helpers.
     */

    var helpers = {};

    helpers['fc'] = function () {
      Deps.depend(self._deps.templateData);
      return self;
    };

    helpers[self._id] = function(){
      return self._collection.find({}, self.getSort());
    };

    Template[self._settings.template].helpers(helpers);

    /**
     * Template behaviours.
     */

    Template[self._settings.template].events({

      /** Pager **/
      'change .fc-items-per-page': function (event) {
        event.preventDefault();
        self._pager.itemsPerPage = parseInt(event.target.value, 10) || self._pager.itemsPerPage;
        self.moveTo(1);
      },
      'click .fc-pager .fc-page': function (event) {
        event.preventDefault();
        self.moveTo(this.page);
      },
      'click .fc-pager .fc-first': function (event) {
        event.preventDefault();
        if (self.hasPrevious())
          self.moveFirst();
      },
      'click .fc-pager .fc-prev': function (event) {
        event.preventDefault();
        if (self.hasPrevious())
          self.movePrevious();
      },
      'click .fc-pager .fc-next': function (event) {
        event.preventDefault();
        if (self.hasNext())
          self.moveNext();
      },
      'click .fc-pager .fc-last': function (event) {
        event.preventDefault();
        if (self.hasNext())
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

        self.moveTo(1);
      },
      'click .fc-clear-filter': function (event) {
        event.preventDefault();
        if (self._filters[this.key])
          self.clearFilters(this.key);

        self.moveTo(1);
      },
      'click .fc-clear-filters': function (event) {
        event.preventDefault();
        if (self.activeFilters().length)
          self.clearFilters();

        self.moveTo(1);
      },

      /** Search **/
      'click .fc-search': function (event, template) {
        event.preventDefault();

        self.searchValue = template.find('.fc-search-box').value || '';

        _.each(self._search, function (field, key) {
          if (field.active)
            self.setFilter(key, {
              value: self.searchValue
            });
        });

        self.moveTo(1);
      },
      'click .fc-searchable-filter': function (event, template) {
        event.preventDefault();

        var status = (self._search[this.key] && self._search[this.key].active) ? false : true;
        self.setActiveSearch(this.key, status);
      },

      /** Sort **/
      'click .fc-sort': function (event, template) {
        event.preventDefault();

        var field = event.target.getAttribute('data-fc-sort');
        self.setSort(field);

        self._deps.items.changed();
      }
    });
  }
};

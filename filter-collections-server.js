Meteor.FilterCollections = {};

Meteor.FilterCollections.publish = function (collection, options) {

  options = options || {};

  callbacks = options.callbacks || {};

  var cursor = {};

  var name = (options.name) ? options.name : self._collection._name;

  var publisherResultsId = 'fc-' + name + '-results';
  var publisherCountId = 'fc-' + name + '-count';
  var publisherCountCollectionName = name + 'CountFC';

  /**
   * Publish query results.
   */

  Meteor.publish(publisherResultsId, function (query) {

    var allow = true;

    if (options.allow && _.isFunction(callbacks.allow))
      allow = callbacks.allow(query, this);

    if(!allow){
      throw new Meteor.Error(417, 'Not allowed');
    }

    query = (query && !_.isEmpty(query)) ? query : {};

    query.selector = query.selector || {};

    query.options = query.options || {
      sort: [],
      skip: 0,
      limit: 10
    };

    if (callbacks.beforePublish && _.isFunction(callbacks.beforePublish))
      query = callbacks.beforePublish(query, this) || query;

    cursor = collection.find(query.selector, query.options);

    if (callbacks.afterPublish && _.isFunction(callbacks.afterPublish))
      cursor = callbacks.afterPublish(cursor) || cursor;

    return cursor;
  });

  /**
   * Publish result count.
   */

  Meteor.publish(publisherCountId, function (query) {
    var self = this;
    var allow = true;

    if (callbacks.allow && _.isFunction(callbacks.allow))
      allow = callbacks.allow(query, this);

    if(!allow){
      throw new Meteor.Error(417, 'Not allowed');
    }

    query = (query && !_.isEmpty(query)) ? query : {};
    query.selector = query.selector || {};

    if(callbacks.beforePublish && _.isFunction(callbacks.beforePublish))
      query = callbacks.beforePublish(query, this) || query;

    count = collection.find(query.selector).count() || 0;

    if(callbacks.afterPublish && _.isFunction(callbacks.afterPublish))
      cursor = callbacks.afterPublish(cursor) || cursor;

    self.added(publisherCountCollectionName, Meteor.uuid(), {
      count: count,
      query: query
    });

    this.ready();
  });
};

Meteor.FilterCollections = {};

Meteor.FilterCollections.publish = function (collection, callbacks) {

  callbacks = callbacks || {};

  var cursor = {};
  var publisherResultsId = 'fc-' + collection._name + '-results';
  var publisherCountId = 'fc-' + collection._name + '-count';
  var publisherCountCollectionName = collection._name + 'CountFC';

  /**
   * Publish query results.
   */

  Meteor.publish(publisherResultsId, function (query) {

    query = (query && !_.isEmpty(query)) ? query : {};

    query.selector = query.selector || {};

    query.options = query.options || {
      sort: [],
      skip: 0,
      limit: 10
    };

    if (callbacks.beforePublish && _.isFunction(callbacks.beforePublish))
      query = callbacks.beforePublish(query) || query;

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

    query = (query && !_.isEmpty(query)) ? query : {};
    query.selector = query.selector || {};

    if(callbacks.beforePublish && _.isFunction(callbacks.beforePublish))
      query = callbacks.beforePublish(query) || query;

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

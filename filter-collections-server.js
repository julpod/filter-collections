Meteor.FilterCollections = {};

Meteor.FilterCollections.publish = function (id, collection, callbacks) {

  _id = id;
  _idCount = _id + 'Count';
  _idCollectionCount = _id + 'CollectionCount';
  _collection = collection;
  _callbacks = callbacks || {};

  Meteor.publish(_id, function (query) {

    query = query || {};
    query.selector = query.selector || {};
    query.options = query.options || {
      skip: 0,
      limit: 10
    };

    if (_callbacks.beforePublish && _.isFunction(_callbacks.beforePublish))
      query = _callbacks.beforePublish(this, query) || query;

    return _collection.find(query.selector, query.options);
  });

  Meteor.publish(_idCount, function (query) {

    query = query || {};
    query.selector = query.selector || {};

    if (_callbacks.beforePublish && _.isFunction(_callbacks.beforePublish))
      query = _callbacks.beforePublish(this, query) || query;

    var count = _collection.find(query.selector).count() || 0;

    this.added(_idCollectionCount, 'count', {
      count: count
    });

    this.ready();
  });



};

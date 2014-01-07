Meteor.FilterCollections = {};

Meteor.FilterCollections.publish = function (id, collection, callbacks) {

  _id = id;
  _idCount = _id + '-count';
  _idCollectionCount = _id + 'CollectionCount';
  _collection = collection;
  _callbacks = callbacks || {};

  Meteor.publish(_id, function (queryFields, queryOptions) {

    queryFields = queryFields || {};
    queryOptions = queryOptions || {
      skip: 0,
      limit: 10
    };

    if(_callbacks.beforeQueryFields && _.isFunction(_callbacks.beforeQueryFields))
      queryFields = _callbacks.beforeQueryFields(queryFields, this) || queryFields;

    if(_callbacks.beforeQueryOptions && _.isFunction(_callbacks.beforeQueryOptions))
      queryOptions = _callbacks.beforeQueryOptions(queryOptions, this) || queryOptions;

    return _collection.find(queryFields, queryOptions);
  });

  Meteor.publish(_idCount, function (queryFields) {

    queryFields = queryFields || {};

    if(_callbacks.beforeQueryFields && _.isFunction(_callbacks.beforeQueryFields))
      queryFields = _callbacks.beforeQueryFields(queryFields, this) || queryFields;

    if(_callbacks.beforeQueryOptions && _.isFunction(_callbacks.beforeQueryOptions))
      queryOptions = _callbacks.beforeQueryOptions(queryOptions, this) || queryOptions;

    var count = _collection.find(queryFields).count() || 0;
    this.added(_idCollectionCount, 'count', {
      count: count
    });
  });



};

Package.describe({
  name: "tooit:filter-collections",
  summary: "Smart package for Meteor that adds filter and pager behavior to our Meteor's collections.",
  version: "1.0.3",
  git: "https://github.com/julianmontagna/filter-collections"
});

Package.onUse(function (api) {
  api.versionsFrom(['METEOR@0.9.3', 'METEOR@0.9.4', 'METEOR@1.0']);

  api.use([
    'underscore',
    'ejson'
  ], [
    'client',
    'server'
  ]);

  api.addFiles('filter-collections-client.js', ['client']);
  api.addFiles('filter-collections-server.js', ['server']);
  api.export('FilterCollections')
});

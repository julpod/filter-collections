Package.describe({
  summary: " Smart package for Meteor that adds filter and pager behavior to our Meteor's collections.",
  version: "0.1.5",
  git: "https://github.com/tsega/filter-collections"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.2.2');

  api.use('underscore', ['client', 'server']);

  api.addFiles('tsega:filter-collections-client.js', ['client']);
  api.addFiles('tsega:filter-collections-server.js', ['server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('tsega:filter-collections');
  api.addFiles('tsega:filter-collections-tests.js');
});

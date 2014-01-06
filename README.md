Filter Collections
==================

Smart package for Meteor that adds filter and pager behavior to our Meteor's collections.

Features
========

Please, let me know if you have any feedback (suggestions, bug, feature request, implementation, contribute, etc).
You can write me at j@tooit.com.

Filtering
---------

- Simple filter specifying allowed fields.
- Advance filtering with Comparison, Logical, Element, Evaluation Query Operators (see http://docs.mongodb.org/manual/reference/operator/query/)
- Search behaviours within multiple fields.
- Current filter list and management.

Pager
-----

- Numeric pager with next, previous, first and last behavior.
- Items per page selector and status.

Sorting
-------

- Sort results by alowed sort collection's field.

Layout
------

- Flexible layout with no template provided but a lot of usefull helpers)


Install
=======

```
mrt add filter-collections
```

Usage
=====

Js
```javascript

PeopleFilter = new Meteor.FilterCollection(People, {
  template: 'peopleList',

  filters: {
    category: {
      title: 'Type'
    },
    name: {
      title: 'Name',
      operator: {
        name: '$regex',
        options: 'i'
      },
      searchable: true
    },
    company: {
      title: 'Corporate Group',
      operator: {
        name: '',
        options: ''
      },
      group: '$or',
      searchable: true
    },
    balance: {
      title: 'Balance',
      operator: {
        name: '$gt'
      }
    }
  }
});

Template.peopleList.helpers({
  people: function () {
    return PeopleFilter.items();
  }
});

```

HTML

```html
  <!-- filter-menu -->
    <ul class="fc-filter">
      <li><a href="#" data-fc-field="some_collection_field_1" data-fc-value="filter_value_1">Filter Value 1</a></li>
      <li><a href="#" data-fc-field="some_collection_field_2" data-fc-value="filter_value_2">Filter Value 2</a></li>
    </ul>
  <!-- /filter-menu -->

  <!-- search -->
    <form>
      <input type="text" class="form-control fc-search-box" data-fc-field="name">
      <button type="submit" class="fc-search">Search</button>
    </form>
  <!-- /search -->

  <!-- current-filters -->
    {{#each fc.currentFilters}}
      <button href="#" class="fc-current-filter">{{title}} : {{value}}</button>
    {{/each}}

    {{#with fc.activeFilters}}
      <button href="#" class="fc-clear-filter">Clear All</button>
    {{/with}}
  <!-- /current-filters -->

  <!-- item-list -->
    {{#each people}}
    <div>
      <div data-fc-sort="collection_field_name">{{name}}</div>
      <div data-fc-sort="collection_field_category">{{category}}</div>
      <div data-fc-sort="collection_field_company">{{company}}</div>
      <div data-fc-sort="collection_field_balance">{{balance}}</div>
    </div>
    {{/each}}
  <!-- /item-list -->

  <!-- pagination -->

    <label>Items per page</label>
    <select style="width: 60px;" class="input-sm form-control input-s-sm inline fc-items-per-page m-r-sm">
      {{#each fc.itemsPerPage}}
        <option value="{{value}}" {{status}}>{{value}}</option>
      {{/each}}
    </select>
    <small class="text-muted inline m-t-sm m-b-sm">showing {{fc.skipItems}} - {{fc.pageOffset}} of {{fc.totalItems}} items</small>

    <ul class="fc-pager">
      {{#if fc.showPrevious}}<li><a href="#" class="fc-prev">Previous</a></li>{{/if}}
      {{#each fc.pages}}<li class="{{status}}"><a href="#" class="fc-page">{{page}}</a></li>{{/each}}
      {{#if fc.showNext}}<li><a href="#" class="fc-next">Next</a></li>{{/if}}
    </ul>

  <!-- /pagination -->
```




todo
====

[ ] improve help.
[ ] write application examples.
[ ] write tests.


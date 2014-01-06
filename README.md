#Filter Collections
Filter Collections is a Smart package for Meteor that adds Filter and Paging and Sorting behavior to our collections.
Works well (but independently) with simple-schema and collection2.

---------------------------------------

##Features
Please, let me know if you have any feedback (suggestions, bug, feature request, implementation, contribute, etc).
You can write me at j@tooit.com.

###Filtering
- Publish and Subscribe Meteor's method management to avoid sending the entire collection to the client. Hook implementation on publishers (for permission filtering or custom alters).
- Simple filter by allowed collection's fields.
- Advance filtering with Comparison, Logical, Element and Evaluation Query Operators (see http://docs.mongodb.org/manual/reference/operator/query/)

###Search
- Search like filters for single and multiple fileds at once.
- Current filter helper to view/remove selected filter fields.

###Pager
- Classic pager with page index, next, previous, first and last behavior.
- Items per page selector.

###Sorting
Sorts results by alowed collection's fields.

###Layout
- Flexible layout with no template provided but a lot of usefull helpers.

---------------------------------------

##Install

###From atmosphere.meteor.com
```
mrt add filter-collections
```

###From github.com
```
git clone https://github.com/julianmontagna/filter-collections
```

---------------------------------------

##Usage

Considering the "People" Collection created with...
```javascript
People = new Meteor.Collection("people")
```
...or...
```javascript
People = new Meteor.Collection2("people", {...schema...})
```

### JS (Meteor Server side)
```javascript
Meteor.FilterCollections.publish('people', People, {
  beforeQueryFields: function(queryFields, publisher){

    if (Roles.userIsInRole(publisher.userId, ['root']))
      return _.omit(queryFields, 'deleted_at');

    if (Roles.userIsInRole(publisher.userId, ['administrator']))
      return _.extend(queryFields, {deleted_at: null});
  },
  beforeQueryOptions: function(queryOptions, publisher){
    // Alter other query options here ...
  }
});
```

### JS (Meteor Client side)
```javascript
PeopleFilter = new Meteor.FilterCollections('people', People, {
  template: 'peopleList',

  filters: {
    type: {
      title: 'Type'
    },
    name: {
      title: 'Name',
      operator: {
        name: '$regex',
        options: 'i'
      },
      group: '$and',
      search: {
        enabled: true,
        active: true,
        mandatory: true
      }
    },
    corporate_group: {
      title: 'Corporate Group',
      operator: {
        name: '$regex',
        options: 'i'
      },
      group: '$and',
      search: {
        enabled: true
      }
    }
  }
});
```
(Template argument is optional but handy. If you specify a real template, this package will add helpers like specified below.)

### HTML
```html

  <!-- filter-list -->
    <ul class="fc-filter">
      <li><a href="#" data-fc-field="some_collection_field_1" data-fc-value="filter_value_1">Filter Value 1</a></li>
      <li><a href="#" data-fc-field="some_collection_field_2" data-fc-value="filter_value_2">Filter Value 2</a></li>
    </ul>
  <!-- /filter-list -->

  <!-- search -->
    <form>
      <input type="text" class="fc-search-box" data-fc-field="name">
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

  <!-- sort -->
  <th class="fc-sort {{#if fc.sortStatus.name}}active{{/if}}" data-fc-sort="name">
    Name
    {{#if fc.sortStatus.name}}
      {{#if fc.sortStatus.name.asc}}<i class="icon-arrow-up"></i>{{/if}}
      {{#if fc.sortStatus.name.desc}}<i class="icon-arrow-down"></i>{{/if}}
    {{/if}}
  </th>
  <!-- /sort -->

  <!-- item-list (this helper is called as the Filter Collections Id provided as the first argument) -->
    {{#each people}}
    <div>
      <div>{{name}}</div>
      <div>{{category}}</div>
      <div>{{company}}</div>
      <div>{{balance}}</div>
    </div>
    {{/each}}
  <!-- /item-list -->

  <!-- pagination status -->
    <label>Items per page</label>
    <select class="fc-items-per-page">
      {{#each fc.itemsPerPage}}
        <option value="{{value}}" {{status}}>{{value}}</option>
      {{/each}}
    </select>
    <small>Showing {{fc.skipItems}} - {{fc.pageOffset}} of {{fc.totalItems}} items.</small>
  <!-- /pagination status -->

  <!-- pager -->
    <ul class="fc-pager">
      <li><a href="#" class="fc-first">First</a></li>
      <li><a href="#" class="fc-prev">Previous</a></li>
      {{#each fc.pages}}<li class="{{status}}"><a href="#" class="fc-page">{{page}}</a></li>{{/each}}
      <li><a href="#" class="fc-next">Next</a></li>
      <li><a href="#" class="fc-last">Last</a></li>
    </ul>
  <!-- /pager -->
```

---------------------------------------

##todo
* Improve README.md.
* Write application examples.
* Write tests.


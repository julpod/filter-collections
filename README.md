#Meteor's Filter Collections
Filter Collections is a Smart package for Meteor that adds Sorting, Paging, Filter and Search capabilities for our collections.
Works well (but not necessarily) with [Collection2](https://github.com/aldeed/meteor-collection2  "Collection2").

---------------------------------------

##Features

###Sort
Order results by single or multiple collection's fields.

###Pager
Manipulate Meteor's Collection results with a classic pager and items per page results.

###Filter
Manage subscribe/publication methods smartly, considering collections with very long datasets avoiding to send the entire collection to the client.

###Search
Filtering capabilities also let us build basic and complex search areas and perform simple and multiple field search operations.

###Queries
Use package methods to build your own queries and manage results sorted, paginated and filtered.

###Template helpers
This module does not attach any template. Instead, it provides useful helpers to work with.

---------------------------------------

##Install

###From atmosphere.meteor.com
```
mrt add filter-collections
```

###From github.com
```
git clone https://github.com/julianmontagna/filter-collections.git
```

---------------------------------------

##Application Example

There is work-in-progress application example at:

Demo: [http://filtercollections.meteor.com/ ](http://filtercollections.meteor.com/ "http://filtercollections.meteor.com/ ")

GitHub: [https://github.com/krishamoud/filter-collections-example](https://github.com/krishamoud/filter-collections-example "https://github.com/krishamoud/filter-collections-example")

Thanks [krishamoud](https://github.com/krishamoud "krishamoud")!

---------------------------------------

##Usage

Considering the "People" Collection created:
```javascript
People = new Meteor.Collection("people")
```
Or with [Collection2](https://github.com/aldeed/meteor-collection2 "Collection2")
```javascript
People = new Meteor.Collection2("people", {...schema...});
```

### Meteor Server side
This package will handle its own publishers (server side) and subscribers (client side) so let's start adding needed configuration on the server.
```javascript
Meteor.FilterCollections.publish(People, {
  name: 'someName',
  callbacks: {/*...*/}
});
```

### Meteor Client side
Now let's add your collection configuration anywhere you need on the client side.
```javascript
PeopleFilter = new Meteor.FilterCollections(People, {
  template: 'peopleList'
  // Other arguments explained later. See Configuration.
});
```
**template**: (optional) a valid template name where to attach package helpers. If not specified, you are still capable of using package methods manually.

**name**: (optional) setting a name to a Filter Collection instance, let you have multiple instances of Filters sharing the same Collection. If it's specified, the same value should be used on Filter Collection`s publisher methods.

Then in your html you will have available **fcResults** helper to iterate for:

```html
<table>
...
  {{#each fcResults}}
  <tr>
    <td>{{alias}}</td>
    <td>{{name}}</td>
    <td>{{mail}}</td>
    <td>{{created_at}}</td>
  </tr>
  {{/each}}
  ...
</table>
```

With this basic setup you will have the package working for People's Collection.

---------------------------------------

##Configuration
Let's see some package configuration.

* [Sorting](#sorting)
* [Paginating](#paginating)
* [Filtering](#filtering)
* [Searching](#searching)
* [Queries](#queries)
* [Callbacks](#callbacks)

---------------------------------------

#Sorting

This package lets you sort results in an easy way. You can sort by one or multiple fields at a time and each one will have three states: `null` (not sorted), `'asc'` (ascending) or `'desc'` (descending). For more information see [Specifiers](http://docs.meteor.com/#sortspecifiers "Specifiers").

You can provide default collection sorting with the following:

```javascript
PeopleFilter = new Meteor.FilterCollections(People, {
  ...
  sort:{
    order: ['desc', 'asc'],
    defaults: [
      ['created_at', 'desc'],
      ['company', 'asc'],
      ['name', 'asc'],
    ]
  },
  ...
});
```

**order**: (optional) by default, the order values are `['asc', 'desc']` but if needed, you can set `['desc', 'asc']` so the states will be `null`, `'desc'`, and `'asc'`.

**defaults**: (optional) if you need to load the results in a certain order when the collection is first loaded, this is the place.

*Note: If none of these are specified, default (mongodb) sort order will be provided and you will capable anyway to sort your results later with DOM elements o package methods.*

##Templates helpers

The CSS class *fc-sort* indicates that the package will sort the collection results by *data-fc-sort* value on click event. The attribute *data-fc-sort should* be any valid field key in your collection.

You will also have *fcSort*, a reactive template helper, to detect current sorting values.

###Sortable table headers

```html
<th class="fc-sort" data-fc-sort="name">
  Some text
  {{#if fcSort.name.desc}}desc{{/if}}
  {{#if fcSort.name.asc}}asc{{/if}}
</th>
```

###Clear Sorts
```html
<a href="#" class="fc-sort-clear">Clear sorting</a><!-- to put outside of the <table></table> balises as all the following elements-->
```

## Methods

### .sort.set(field, order, triggerUpdate)

**field**: is a valid key in your collection.

**order**: 'desc', 'asc' or null.

**triggerUpdate**: boolean indicating if the subscriber must be updated after setting the new values.

```javascript
PeopleFilter.sort.set(someCollectionField, 'desc', true); // this will set the field order to 'desc'.
PeopleFilter.sort.set(someCollectionField, null, true); // this will loop over the sort stages described above (default: null, asc, desc)
```

This will change object sorting and will trigger a collection update (all at once) but you can also control the process yourself.

...
PeopleFilter.sort.set(someCollectionField1, 'desc');
PeopleFilter.sort.set(someCollectionField2, 'desc');
PeopleFilter.sort.set(someCollectionField3, 'asc');
PeopleFilter.sort.set(someCollectionField4, 'desc');
PeopleFilter.sort.run();
```

### .sort.get()

Will return the current sort status as an object.

```javascript
var sortStatus = PeopleFilter.sort.get();

// sortStatus will be something like:
// {
//   account_balance: {desc: true},
//   created_at: {asc: true},
//   name: {asc: true},
// }
```

### .sort.run()

Will take the current sorting status and trigger a query update to the subscriber to update results.

```javascript
PeopleFilter.sort.run();
```

### .sort.clear()

Will remove all sorting values.

```javascript
PeopleFilter.sort.clear(); // Will remove values only.
PeopleFilter.sort.clear(true); // Will remove values and trigger a query update.
```

---------------------------------------

#Paginating

This package provides various pager methods and template helpers to easly manipulate your collection results. You can use all these features together or only some of them, based on your application needs.

You can provide default collection sorting as:

```javascript
PeopleFilter = new Meteor.FilterCollections(People, {
  //...
  pager: {
    options: [5, 10, 15, 25, 50],
    itemsPerPage: 5,
    currentPage: 1,
    showPages: 5,
  }
  //...
});
```

**options**: (optional, default is [10, 20, 30, 40, 50]) an array containing the allowed values to limit the collection results.

**itemsPerPage**: (optional, default is 10) is the default limit applied to collection results. This will prevent us from loading all the collection documents at once and could be easly combined with pager.options values as described above setting the CSS class "fc-pager-options".

**currentPage**: (optional, default is 1) will set the default page where the collection pager cursor must be at startup.

**showPages**: (optional, default is 10) this argument represents the numbers of pages to be displayed on the classic pager.

##Templates helpers

Then in your template you can do the following:

### Items per page

Build a dropdown menu or custom links to let the user select the amount of results that should be displayed.

```html
<!-- items per page -->
<select class="fc-pager-options">
  {{#each fcPager.options}}
    <option value="{{value}}" {{status}}>{{value}}</option>
  {{/each}}
</select>
<!-- /items per page -->
```

**fcPager.options.value**: contains the row option value.

**fcPager.options.status**: contains the row status (selected or an empty string).

You can also add itemsPerPage behaviour with links or any DOM clickeable element if you specify the class "fc-pager-option" and a custom html attribute "data-fc-pager-page".

```html
<!-- items per page -->
  <a href="#" class="fc-pager-option" data-fc-pager-page="10">ten</a>
  <a href="#" class="fc-pager-option" data-fc-pager-page="20">twenty</a>
  <a href="#" class="fc-pager-option" data-fc-pager-page="30">thirty</a>
  <a href="#" class="fc-pager-option" data-fc-pager-page="40">fourty</a>
  <a href="#" class="fc-pager-option" data-fc-pager-page="50">fifty</a>
<!-- /items per page -->
```

### Pager status.

You can use package reactive datasources to notify the user where the current pager status.

```html
  <!-- pager status -->
  <ul>
    <li>Current page is: {{fcPager.currentPage}}.</li>
    <li>We are displaying {{fcPager.itemsPerPage}} results.</li>
    <li>From <strong>{{fcPager.offsetStart}}</strong> to <strong>{{fcPager.offsetEnd}}</strong>.</li>
    <li>We have found a total of <strong>{{fcPager.totalItems}}</strong> documents.</li>
  </ul>
  <!-- /pager status -->
```

### Classic Pager

```html
  <!-- numbered pager -->
  <ul>
    <li><a href="#" class="fc-pager-first">&lt;&lt;</a></li>
    <li><a href="#" class="fc-pager-previous">&lt;</a></li>
    {{#each fcPager.pages}}
      <li class="{{status}}"><a href="#" class="fc-pager-page" data-fc-pager-page="{{page}}">{{page}}</a></li>
    {{/each}}
    <li><a href="#" class="fc-pager-next">&gt;</a></li>
    <li><a href="#" class="fc-pager-last">&gt;&gt;</a></li>
  </ul>
  <!-- /numbered pager -->
```

* **fc-pager-first** will move the currentPage value to the first page if possible.
* **fc-pager-previous** will move the currentPage value to the previous page if possible.
* **fc-pager-next** will move the currentPage value to the next page if present page if possible.
* **fc-pager-first** will move the currentPage value to the last page if possible.
* **fc-pager-page** will move the currentPage value to the specified number at "data-fc-pager-page" html attribute.

**fcPager.pages.status**: active or an empty string.

**fcPager.pages.page**: the current page number.

## Full pager example:

### Javascript

```javascript
PeopleFilter = new Meteor.FilterCollections(People, {
  //...
  pager: {
    options: [5, 10, 15, 25, 50],
    itemsPerPage: 5,
    currentPage: 1,
    showPages: 5,
  }
  //...
});
```

### Template

```html
  <!-- items per page -->
  <select class="fc-pager-options">
    {{#each fcPager.options}}
      <option value="{{value}}" {{status}}>{{value}}</option>
    {{/each}}
  </select>
  <!-- /items per page -->
  <!-- pager status -->
  <ul>
    <li>Current page is: {{fcPager.currentPage}}.</li>
    <li>We are displaying {{fcPager.itemsPerPage}} results.</li>
    <li>From <strong>{{fcPager.offsetStart}}</strong> to <strong>{{fcPager.offsetEnd}}</strong>.</li>
    <li>We have found a total of <strong>{{fcPager.totalItems}}</strong> documents.</li>
  </ul>
  <!-- /pager status -->
  <!-- numbered pager -->
  <ul>
    <li><a href="#" class="fc-pager-first">&lt;&lt;</a></li>
    <li><a href="#" class="fc-pager-previous">&lt;</a></li>
    {{#each fcPager.pages}}
      <li class="{{status}}"><a href="#" class="fc-pager-page" data-fc-pager-page="{{page}}">{{page}}</a></li>
    {{/each}}
    <li><a href="#" class="fc-pager-next">&gt;</a></li>
    <li><a href="#" class="fc-pager-last">&gt;&gt;</a></li>
  </ul>
  <!-- /numbered pager -->
```

## Methods

### .pager.set(triggerUpdate)

Will update pager template data based on current _pager status.

**triggerUpdate**: boolean indicating if the subscriber must be updated after setting the new values.

```javascript
PeopleFilter.pager.set(); // Will update template data only.
PeopleFilter.pager.set(true); // Will update template data and collection results based on pager current status.
```

### .pager.get()

Will return the current _pager object.

```javascript
var pagerStatus = PeopleFilter.pager.get();
```

### .pager.run()

Will filter collection results based on the current pager status.

```javascript
PeopleFilter.pager.run();
```

### .pager.moveTo(page)

Will request collection publisher for update results for page.

**page**: the page number to move the cursor.

```javascript
PeopleFilter.pager.moveTo(4);
```

### .pager.movePrevious()

Will request collection publisher to update results for the previous page (if cursos is not in the first page already).

```javascript
PeopleFilter.pager.movePrevious();
```

### .pager.moveFirst()

Will request collection publisher to update results for the first page (if cursos is not in the first page already).

```javascript
PeopleFilter.pager.moveFirst();
```

### .pager.moveNext()

Will request collection publisher to update results for the next page (if cursos is not in the last page already).

```javascript
PeopleFilter.pager.moveNext();
```

### .pager.moveLast()

Will request collection publisher to update results for the last page (if cursos is not in the last page already).

```javascript
PeopleFilter.pager.moveLast();
```

### .pager.setItemsPerPage(itemsNumber, triggerUpdate)

Will request collection publisher to update results based on this limit.

**itemsNumber**: the amount of items to be displayed.

**triggerUpdate**: boolean indicating if the subscriber must be updated after setting the new values.

```javascript
PeopleFilter.pager.setItemsPerPage(5); // Will update pager only.
PeopleFilter.pager.setItemsPerPage(5, true); // Will update pager and collection results based on current status.
```

### .pager.setCurrentPage(page, triggerUpdate)

Will request collection publisher for update results for page. This differs from .pager.moveTo because there is no validation before moving the page cursor.

**page**: the page number to move the cursor.

**triggerUpdate**: boolean indicating if the subscriber must be updated after setting the new values.

```javascript
PeopleFilter.pager.setCurrentPage(5); // Will update pager only.
PeopleFilter.pager.setCurrentPage(5, true); // Will update pager and collection results based on current status.
```

---------------------------------------

#Filtering

This package brings easy configurable filters to play with Meteor Collections's documents.
To allow filtering, the package needs to know what fields are allowed to filter by. So:

```javascript
PeopleFilter = new Meteor.FilterCollections(People, {
  //...
  filters: {
    name: {
      title: 'Complete name',
      operator: ['$regex', 'i'],
      condition: '$and',
      searchable: true
    },
    account_balance: {
      title: 'Person Account Balance',
      condition: '$and',
      transform: function (value) {
        return parseFloat(value);
      },
      sort: 'desc'
    },
    type: {
      title: 'People Types'
    },
    "contacts.name": {
      title: 'ContactName'
    }
  },
  //...
});
```

Each filter setup have the following structure:

key: {
  title: ...
  operator: ...
  condition: ...
  transform: ...
  searchable: ...
  sort: ...
}

**key**: the Collection's document field name. We can use also Mongo dot notation to work with nested fields as "contacts.name" for example.

**title**: some human redable text to name the field for better display.

**operator**: an array containig MongoDB operators for advance filtering. See [Mongo operators](http://docs.mongodb.org/manual/reference/operator/query/ "Mongo operators").

**condition**: also a MongoDB operator but to group filter criteria. (eg. {$and: [{field1: value},{field2: value}]}).

**transform**: is a callback used to alter the filter value before performing a new subscription update (helpful if, for example, you have a price as number or float in your document and need to tranform your form value comming as string).

**sort**: 'desc' or 'asc'. After the collection is filtered will clear current sort status and results will be sorted by this field.

**searchable**: 'required' or 'optional'. If 'required', any search done will add a condition considering this field. If 'optional' you will have to activate this filter manually when searching. See Search below.

*Note: the result of this configuration is a dynamic query passed to a subscriber and its publisher returning only filtered results based on recieved criteria.*

##Templates helpers

### Filter links

```html
<!-- custom filter links-->
  <a href="#" class="fc-filter" data-fc-filter-field="type" data-fc-filter-value="customer" >
    Show me my Customers
  </a>
  <a href="#" class="fc-filter" data-fc-filter-field="type" data-fc-filter-value="suppliers" >
    Show me my Suppliers
  </a>
  <a href="#" class="fc-filter"
    data-fc-filter-field="account_balance"
    data-fc-filter-value="0"
    data-fc-filter-operator="$lt"
    data-fc-filter-sort="desc">
    People who owe me money
  </a>
  <a href="#" class="fc-filter"
    data-fc-filter-field="account_balance"
    data-fc-filter-value="0"
    data-fc-filter-operator="$gt"
    data-fc-filter-sort="asc">
    People to whom I owe money
  </a>
<!-- /custom filter links -->
```

Also you can use a custom list to build your filter links.

```javascript
Template.peopleFilter.helpers({
  //...
  categories: function(){
    return [
      {
        label: 'Category One',
        field: 'account_balance',
        value: 0,
        operator: '$gt',
        sort: 'desc'
      },
      {
        label: 'Category Two',
        field: 'account_balance',
        value: 0,
        operator: '$lt'
      }
    ];
  },
  //...
});
```

```html
<!-- custom filter dynamic-->
  {{#each categories}}
    <a href="# "
      class="fc-filter"
      data-fc-filter-field="{{field}}"
      data-fc-filter-value="{{value}}"
      data-fc-filter-operator="{{operator}}">
      {{label}}
    </a>
  {{/each}}
<!-- /custom filter dynamic -->
```

You can add the following attributes to any clickeable DOM element with the css class "fc-filter" attached.

* **data-fc-filter-field**: required
* **data-fc-filter-value**: required
* **data-fc-filter-operator**: optional
* **data-fc-filter-options**: optional
* **data-fc-filter-sort**: optional

Why do I have to specify filter setup twice?
Well, first of all, you don't 'have' to. Attributes used in DOM will override the ones provided in configuration. The main idea for this package is to be flexible and let you use filters on HTML and JS at the same time or independently.

For getting filter status from template (to set active classes for example), I've provided a template helper 'fcFilterObj' and 'fcPagerObj' to use object methods from your template. Example:

```html
<!-- custom filter links-->
  <a href="#" class="fc-filter {{#if fcFilterObj.isActive 'type' 'customer'}}active{{/if}}" data-fc-filter-field="type" data-fc-filter-value="customer" >
    Show me my Customers
  </a>
  <a href="#" class="fc-filter {{#if fcFilterObj.isActive 'type' 'suppliers'}}active{{/if}}" data-fc-filter-field="type" data-fc-filter-value="suppliers" >
    Show me my Suppliers
  </a>
<!-- /custom filter links -->
```

or

```html
<!-- custom filter dynamic-->
  {{#each categories}}
    <a href="# "
      class="fc-filter {{#if ../fcFilterObj.isActive field value operator}}active{{/if}}"
      data-fc-filter-field="{{field}}"
      data-fc-filter-value="{{value}}"
      data-fc-filter-operator="{{operator}}">
      {{label}}
      {{#if isActiveFilter field value operator}}This filter is active{{/if}}
    </a>
  {{/each}}
<!-- /custom filter dynamic -->
```

### Filter pills

You have available **fcFilterActive** helper with a reactive datasource for display current filter status.

```html
<h4>Active Filters</h4>
{{#each fcFilterActive}}
  <button href="#" class="fc-filter-clear">
    {{title}}: {{operator}} {{value}}
  </button>
{{/each}}
<button href="#" class="fc-filter-reset">Reset all filters</button>
```

## Methods

### .filter.get()

Will return the allowed filter object with current status.

```javascript
var filterDefinition = PeopleFilter.filter.get();
```

### .filter.set(key, filter, triggerUpdate)

Will add or overwrite a filter.

**key**: Collection field name.

**filter**: an object to replace or add to the filter list (eg. {value: 1234, condition: '$or'})

**triggerUpdate**: boolean indicating if the subscriber must be updated after setting the new values.

```javascript
PeopleFilter.filter.set('name', {value:'John', operator: ['$neq']}); // Will update the filter and perform a query update.
PeopleFilter.filter.set('account_balance', {value:0, operator: ['$gt']}, false); // Will set the update but without performing a query update.
```

### .filter.isActive(field, value, operator)

Will return the allowed filter object with current status.

**field**: the active filter key to check.

**value**: the value to check for.

**operator**: (optional) operator assigned (if not present, verification will be made only with field and value).

```javascript
PeopleFilter.filter.isActive('name', 'John');
PeopleFilter.filter.isActive('account_balance', 0, '$lt');
PeopleFilter.filter.isActive('account_balance', 0, '$gt');
```

### .filter.run()

Build the query with the current filter status and run a subscription update.

```javascript
PeopleFilter.filter.run();
```

### .filter.clear(key, triggerUpdate)

Clear active filters if no argument is recieved.

**key**: Collection field name to be deleted from filters.

**triggerUpdate**: boolean indicating if the subscriber must be updated after setting the new values.

```javascript
PeopleFilter.filter.clear('name');
PeopleFilter.filter.clear();
```

---------------------------------------

#Searching

With the filter functionality we are able to set custom searches in no time.

```html
<form>
  <input type="text" value="{{fcFilterSearchable.criteria}}" data-fc-search-target="search-box">
  {{#if fcFilterSearchable.criteria}}<button type="button" class="fc-search-clear">Reset</button>{{/if}}
  <button type="submit" class="fc-search-trigger" data-fc-search-trigger="search-box">Search</button>
</form>
```

When **fc-search-trigger** is clicked, the package will take the value **data-fc-search-trigger** and will look for a DOM element **data-fc-search-target** that match the value.
Once there, will take all filters with the **searchable** value *('required' or 'optional')* and will perform a subscription update.

##Template helpers

There is a **fcFilterSearchable** helper with **criteria** and **available** as childs.

**criteria**: will maintain the value of the current search.

**available**: is a list with all "searchable" fields.

###Toggle Search fields

```html
{{#each available}}
  <a href="#" class="fc-search-fields">{{#if active}}Disable{{else}}Enable{{/if}} {{title}} filter</a>
{{/each}}
```

##Methods

### .search.getFields(required)

Returns all searchable fields.

**required**: boolean indicating if the method should return all searchable fields 'required' and 'optional' (true) or only 'optional' (null or false)

```javascript
var fields = PeopleFilter.search.getFields(true);
```

### .search.setField(key)

Will set the passed key as an active searchable filter. This will override default setup.

**key**: a valid filter key.

```javascript
PeopleFilter.search.setField('name');
PeopleFilter.search.setField('account_balance');
```

### .search.setCriteria(criteria, triggerUpdate)

Will update the search value.

**criteria**: value to be searched within searchable fields.

**triggerUpdate**: boolean indicating if the subscriber must be updated after setting the new values (false by default).

```javascript
PeopleFilter.search.setCriteria('Lorem Ipsum', true); //Will set the criteria and perform a subscription update
PeopleFilter.search.setCriteria('Lorem Ipsum'); //Will only set the criteria
```

### .search.getCriteria()

Will return the current search value.

```javascript
var search = PeopleFilter.search.getCriteria();
```

### .search.run()

Build the query with the current search status and run a subscription update.

```javascript
PeopleFilter.search.run();
```

### .search.clear(key, triggerUpdate)

Clear active search if no argument is recieved.

**key**: Collection field name to be deleted from search.

**triggerUpdate**: boolean indicating if the subscriber must be updated after setting the new values.

```javascript
PeopleFilter.search.clear('name'); // Will unset only the name field.
PeopleFilter.search.clear(); // will unset all the active search and filters.
```

---------------------------------------

#Callbacks

##Client side

You can intercept the query object before sent to the server and you can also intercept the subscription once is ready.

```javascript
PeopleFilter = new Meteor.FilterCollections(People, {
  //...
  callbacks: {
    beforeSubscribe: function (query) {
      Session.set('loading', true);
      //return query (optional)
    },
    afterSubscribe: function (subscription) {
      Session.set('loading', false);
    },
    beforeResults: function(query){
      query.selector._id = {$ne: Meteor.userId()};
      return query;
    },
    afterResults: function(cursor){
      var alteredResults = cursor.fetch();
      _.each(alteredResults, function(result, idx){
        alteredResults[idx].name = alteredResults[idx].name.toUpperCase();
      });
      return alteredResults;
    },
    templateCreated: function(template){},
    templateRendered: function(template){},
    templateDestroyed: function(template){}
  }
  //...
});
```

**beforeSubscribe**: you can use the passed query object for your own purpose or modify it before the request (this last one needs to return the query object).

**afterSubscribe**: you can play with the subscription object and handle your own `ready()` statements.

**templateCreated**: append behaviours to Template.name.created.

**templateRendered**: append behaviours to Template.name.rendered.

**templateDestroyed**: append behaviours to Template.name.destroyed.

##Server side

```javascript
Meteor.FilterCollections.publish(People, {
  name: 'someName',
  callbacks: {
    allow: function(query, handler){

      //... do some custom validation (like user permissions)...

      return false;
    },
    beforePublish: function(query, handler){

      if (Roles.userIsInRole(handler.userId, ['root']))
        query.selector = _.omit(query.selector, 'deleted_at');

      if (Roles.userIsInRole(handler.userId, ['administrator']))
        query.selector =  _.extend(query.selector, {deleted_at: { $exists: false }});

      return query;
    },
    afterPublish: function(cursor){

      //... your cursor modifier code goes here ...

      return cursor;
    }
  }
});
```

**allow**: (true by default) allow callback will prevent the publisher to be executed. Should be helpful to do some custom validation from server-side.

**beforePublish**: you can alter the query object before doing any Mongo stuff.

**afterPublish**: you can play with the returned Collection Cursor object to alter the resulset.

---------------------------------------

#Queries

To perform custom queries and still get paging, filter and other package functionalities, there is a public reactive data source available to use with the following methods.

## .query.get()

Will return the current query object.

```javascript
PeopleFilter.query.get();
```

## .query.set(value)

Will set a new query and update subscription results.

**value**: an object with two properties **selector** and **options**.

```javascript
  var myQuery = {
    selector: {
      name: 'Lorem Ipsum'
    },
    options: {
      limit: 300,
      skip: 0
    }
  };
  PeopleFilter.query.set(myQuery);
```

---------------------------------------

#Contributors

I've developed this module for a personal project when noticed that there was no tool at the moment that solve this common needs.

Because of that I'll be glad to share ideas, consider suggestions and let contributors to help me maintain and improve the package to help the Meteor's Community.

Let me know if you have any feedback (suggestions, bug, feature request, implementation, contribute, etc) and you can write me at [j@tooit.com](mailto:j@tooit.com "j@tooit.com").

Thanks for reading!,

---------------------------------------

#Donate

An easy and effective way to support the continued maintenance of this package and the development of new and useful packages is to donate through [Gittip](https://www.gittip.com/julianmontagna/ "Gittip"). or [Paypal](http://www.julianmontagna.com.ar/filter-collections.html "Paypal").

Gittip is a platform for sustainable crowd-funding. https://www.gittip.com/about/faq.html

Help build an ecosystem of well maintained, quality Meteor packages by joining the Gittip Meteor Community. https://www.gittip.com/for/meteor/

---------------------------------------

#Hire

Need support, debugging, or development for your project? You can [hire](http://www.linkedin.com/in/julianmontagna "hire") me to help out.

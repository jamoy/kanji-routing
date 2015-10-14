# KANJI/ROUTING

The routing utlity is based on laravel's implementation. See below for usage.

#### Usage

```js
var Router = require("kanji/router").Router,
    router = new Router();

//or register to the GLOBAL context
var router = require("kanji/router");
```

requiring it directly will put router into the GLOBAL context.

```js
// basic dispatching
router.get("foo/bar", function* (next) {
    this.body = "Hello world";
    yield next;
});

// with options
router.get("foo/bar", {
    prefix: "api/v1" 
}, function* (next) {
    this.body = "Hello world";
    yield next;
});
```

###### HTTP verbs

GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS are supported.

Support custom verbs by using `MATCH`

```js
router.match(["CUSTOM_VERB"], function*() {});
```

###### Options

1. `prefix` - prefix the URL with the value given.
2. `middleware` - run an array of generator functions along with the main callback.
3. `domain` - match a particular request with a domain

###### Grouping

You can group your routes by using the `group` method.

```js
router.group({prefix:"test"}, function(router) {
    router.get("foo/bar", function* () {});
});
// this would respond to a request to test/foo/bar
```

###### Callback Resolution

You can invoke a callback by passing a function as the last parameter or the `uses` directive.
 
```js
// testing/foo.js

class foo
{
    *Bar(next) {
        this.body = "Hello World";
        yield next;
    }
}

// routes.js
router.get("foo/bar", function* Bar(next) {
    this.body = "Hello World";
    yield next;
});

// or 
router.get("foo/bar", {namespace: "testing", uses: "foo@bar"});

// would both yield `Hello World`; 

```

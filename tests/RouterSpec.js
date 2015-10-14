/*globals describe, it */

"use strict";

var assert = require("chai").assert,
    Router = require("../router").Router,
    co = require("co"),
    compose = require("koa-compose");

describe("Router", function()
{

    describe("Basic Dispatching", function()
    {

        it("Parse /", function (done)
        {
            var router = new Router();
            router.get("/", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "GET", url: ""}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("Parse URL with preceding /", function (done)
        {
            var router = new Router();
            router.get("/foo", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "GET", url: "foo"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("Parse URL without preceding /", function (done)
        {
            var router = new Router();
            router.get("foo", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "GET", url: "foo"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("GET dispatch", function (done)
        {
            var router = new Router();
            router.get("foo/bar", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "GET", url: "foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("POST dispatch", function (done)
        {
            var router = new Router();
            router.post("foo/bar", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "POST", url: "foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        describe("URI Parameters", function()
        {

            it("With 1 segment", function (done)
            {
                var router = new Router();
                router.post("foo/:bar", function* (next) { this.body = this.params.bar; yield next; });

                var context = {request:{method: "POST", url: "foo/swift"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("swift", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

            it("With 2 segments", function (done)
            {
                var router = new Router();
                router.post("foo/:bar/:baz", function* (next) { this.body = this.params.bar + this.params.baz; yield next; });

                var context = {request:{method: "POST", url: "foo/swift/taylor"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("swifttaylor", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

        });

        describe("Optional Parameter", function()
        {
            it("is empty", function (done)
            {
                var router = new Router();
                router.get("foo(/:baz)", function* (next) { this.body = this.params.baz || 25; yield next; });

                var context = {request:{method: "GET", url: "foo"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("25", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

            it("is filled", function (done)
            {
                var router = new Router();
                router.get("foo(/:baz)", function* (next) { this.body = this.params.baz || 25; yield next; });

                var context = {request:{method: "GET", url: "foo/30"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("30", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

            it("is after a required segment but empty", function (done)
            {
                var router = new Router();
                router.get("foo/:bar(/:baz)", function* (next) { this.body = this.params.bar + this.params.baz; yield next; });

                var context = {request:{method: "GET", url: "foo/swift"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("swiftundefined", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

            it("is after a required segment but filled", function (done)
            {
                var router = new Router();
                router.get("foo/:bar(/:baz)", function* (next) { this.body = this.params.bar + this.params.baz; yield next; });

                var context = {request:{method: "GET", url: "foo/swift/25"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("swift25", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

        });

        describe("Deep Nested Optional Parameter", function()
        {
            it("is empty", function (done)
            {
                var router = new Router();
                router.get("bar(/:foo(/:baz))", function* (next) { this.body = (this.params.bar + this.params.baz) || 25; yield next; });

                var context = {request:{method: "GET", url: "bar"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("25", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });


            it("is both filled", function (done)
            {
                var router = new Router();
                router.get("bar(/:foo(/:baz))", function* (next) { this.body = (this.params.foo + this.params.baz) || 25; yield next; });

                var context = {request:{method: "GET", url: "bar/swift/25"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("swift25", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });


            it("is missing 2nd segment", function (done)
            {
                var router = new Router();
                router.get("bar(/:foo(/:baz))", function* (next) { this.body = (this.params.foo + this.params.baz) || 25; yield next; });

                var context = {request:{method: "GET", url: "bar/swift"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("swiftundefined", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

        });

        it("HEAD Dispatch", function (done)
        {
            var router = new Router();
            router.head("foo/bar", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "HEAD", url: "foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.isNull(context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("ANY Dispatch", function (done)
        {
            var router = new Router();
            router.any("foo/bar", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "HEAD", url: "foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.isNull(context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("Named Route", function (done)
        {
            var router = new Router();
            router.patch("foo/bar", {as: "foo"}, function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "PATCH", url: "foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("foo", router.currentRouteName());
                assert.equal("hello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("Nested Route", function (done)
        {
            var router = new Router();
            router.put("foo/bar", function* (next) { this.body = "first"; yield next; });
            router.put("foo/bar", function* (next) { this.body = "second"; yield next; });

            var context = {request:{method: "PUT", url: "foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("second", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("UTF8 Encoding", function (done)
        {
            var router = new Router();
            router.delete("foo/bar/åαф", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "DELETE", url: "foo/bar/%C3%A5%CE%B1%D1%84"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("Page not found", function ()
        {
            var router = new Router();
            router.get("foo/bar", function* (next) { this.body = "hello"; yield next; });
            var context = {request:{method: "GET", url: "foo/buzz"}};
            assert.throws(router.dispatch.bind(router, context), "Page not found");
        });

        it("Method not found", function ()
        {
            var router = new Router();
            router.get("foo/bar", function* (next) { this.body = "hello"; yield next; });
            var context = {request:{method: "DELETE", url: "foo/bar"}};
            assert.throws(router.dispatch.bind(router, context), "Method not allowed");
        });

        it("Resolve a string callback", function (done)
        {
            var router = new Router({
                namespace: __dirname + "/routing",
                uses: "mock2@test" // should be deleted to gain coverage
            });
            router.get("foo/bar", {uses: "mock@test"});

            var context = {request:{method: "GET", url: "foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("Failed resolution from string callback", function ()
        {
            var router = new Router({
                namespace: __dirname + "/routing"
            });
            router.get("foo/bar", {uses: "mock@test2"});

            var context = {request:{method: "GET", url: "foo/bar"}};
            assert.throws(router.dispatch.bind(router, context), "Route action could not be found from " + __dirname + "/routing/mock");
        });

        it("Failed resolution with no resolvable action", function ()
        {
            var router = new Router();
            router.get("foo/bar", {});

            var context = {request:{method: "GET", url: "foo/bar"}};
            assert.throws(router.dispatch.bind(router, context), "Route requires action");
        });

        it("Domain matching", function (done)
        {
            var router = new Router({
                domain: "test.tld"
            });
            router.get("foo/bar", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "GET", url: "foo/bar", headers: {host: "test.tld"}}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("Failed domain match", function ()
        {
            var router = new Router({
                domain: "test.tld"
            });
            router.get("foo/bar", function* (next) { this.body = "hello"; yield next; });

            var context = {request:{method: "GET", url: "foo/bar", headers: {host: "other.tld"}}};
            assert.throws(router.dispatch.bind(router, context), "Page not found");
        });

    });

    describe("Grouping", function()
    {

        describe("Basic", function()
        {

            var router = new Router();
            router.group({
                prefix: "foo"
            }, function(Router) {
                Router.get("bar", function* (next) { this.body = "hello"; yield next; });
                Router.get("bar", {prefix: "buzz"}, function* (next) { this.body = "hello"; yield next; });
            });

            it("1 Segment", function (done)
            {
                var context = {request:{method:"GET", url:"foo/bar"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("hello", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

            it("2 Segments", function (done)
            {

                var context = {request:{method:"GET", url:"foo/buzz/bar"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("hello", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

        });

        describe("Nested", function()
        {

            var router = new Router();

            router.group({
                prefix: "foo",
                meta: "moo"
            }, function(Router) {
                Router.get("bar", function* (next) { this.body = "hello"; yield next; });

                Router.group({prefix: "fizz"}, function(Router)
                {
                    Router.get("buzz", function* (next) { this.body = "hello"; yield next; });

                    Router.group({prefix: "fiz2z"}, function(Router)
                    {
                        Router.get("buzz", {prefix:"mord"}, function* (next) { this.body = "hello"; yield next; });
                    });
                });
            });

            it("1 Segment", function (done)
            {

                var context = {request:{method:"GET", url:"foo/bar"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("hello", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

            it("2 Segments", function (done)
            {

                var context = {request:{method:"GET", url:"foo/fizz/buzz"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("hello", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

            it("4 Segments", function (done)
            {

                var context = {request:{method:"GET", url:"foo/fizz/fiz2z/mord/buzz"}},
                    callables = co.wrap(compose(router.dispatch(context)));
                callables.call(context).then(function() {
                    assert.equal("hello", context.body);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });

            it("Inherited option", function ()
            {
                var context = {request:{method:"GET", url:"foo/fizz/buzz"}};

                router.dispatch(context);
                assert.equal("moo", router.currentRouteOptions().meta);
            });

        });

    });

    describe("Middleware", function()
    {

        it("Basic", function(done)
        {
            var router = new Router(),
                foo = function* (next) {
                    this.body = "hello";
                    yield next;
                };
            router.get("foo/bar", {middleware: [foo]}, function* (next) { this.body = this.body + " world"; yield next; });
            var context = {request:{method:"GET", url:"foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello world", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("AFTER middleware", function(done)
        {
            var router = new Router(),
                foo = function* (next) {
                    yield next;
                    this.body = this.body + "hello";
                };
            router.get("foo/bar", {middleware: [foo]}, function* (next) { this.body = " world"; yield next; });
            var context = {request:{method:"GET", url:"foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal(" worldhello", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("Nested", function(done)
        {
            var router = new Router(),
                foo = function* (next) {
                    this.body = "hello";
                    yield next;
                };

            router.group({prefix:"foo", middleware: [foo]}, function(router)
            {
                router.get("bar", {middleware: [foo]}, function* (next) { this.body = this.body + " world"; yield next; });
            });

            var context = {request:{method:"GET", url:"foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello world", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it("Deep Nested", function(done)
        {
            var router = new Router(),
                foo = function* Foo(next) {
                    this.body = "hello";
                    yield next;
                },
                bar = function* Bar(next) {
                    this.body = this.body + " again";
                    yield next;
                },
                buzz = function* Buzz(next) {
                    this.body = this.body + ",";
                    yield next;
                };

            router.group({prefix:"foo", middleware: [foo]}, function(router)
            {
                router.get("bar", {middleware: [foo]}, function* (next) { this.body = this.body + " world"; yield next; });

                router.group({prefix:"foo", middleware: [bar]}, function(router)
                {
                    router.get("bar", {middleware: [buzz]}, function* (next) { this.body = this.body + " world"; yield next; });
                });
            });

            var context = {request:{method:"GET", url:"foo/foo/bar"}},
                callables = co.wrap(compose(router.dispatch(context)));
            callables.call(context).then(function() {
                assert.equal("hello again, world", context.body);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

    })

});

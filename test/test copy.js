var undef;

// Some shims for IE
if (!Object.keys) {
    Object.keys = function(obj) {
        var arr = [];
        for (var key in obj) {
            arr.push(key);
        }

        return arr;
    };
}

var EmptyModule = Stapes.subclass();

test("subclassing", function() {
    var Car = Stapes.subclass();
    var SuperCar = Car.subclass();
    var UltraSuperCar = SuperCar.subclass();

    var car = new Car();
    var superCar = new SuperCar();
    var ultraSuperCar = new UltraSuperCar();

    ok( car instanceof Car, "direct instancof");
    ok( superCar instanceof Car, "second inheritance");
    ok( ultraSuperCar instanceof UltraSuperCar, "third inheritance");
    ok( !(car instanceof UltraSuperCar), "other way around should not work");

    var ClassOnly = Stapes.subclass({}, true);
    var c = new ClassOnly();
    ok( !('get' in c), "No get in classOnly classes");
    ok( 'subclass' in ClassOnly, "subclass in classOnly classes");
});

test("change events", function() {
    expect(12);

    var module = new EmptyModule();

    module.set('name', 'Johnny');

    module.on({
        'change' : function(key) {
            ok(
                key === 'name' ||
                key === 'instrument' ||
                key === 'screamingobject'
            , 'change event when name is set');

            if (key === "silent" || key === "silentobject") {
                ok(false, "Silent event should not trigger");
            }
        },

        'change:silent' : function(key) {
            ok(false, "Silent event should not trigger");
        },

        'change:silentobject' : function() {
            ok(false, "Silent event should not trigger for object");
        },

        'change:name' : function(value) {
            equal(value, 'Emmylou', 'name attribute changed');
        },

        'change:screamingobject' : function() {
            ok(true, "Screaming object triggered");
        },

        'mutate' : function(value) {
            ok(
                value.key !== undef && value.newValue !== undef && value.oldValue !== undef,
                "mutate event throws a lot of extra info"
            );
        },

        'mutate:name' : function(value) {
            deepEqual(
                value,
                {
                    key : "name",
                    newValue : "Emmylou",
                    oldValue : "Johnny"
                },
                "mutate namespaed event throws a lot of extra info"
            );
        },

        'create' : function(key) {
            ok(key === 'instrument' || key === 'screamingobject'
            , 'create event on attribute addition');
        },

        'update' : function(key) {
            equal(key, 'name', 'Name was updated');
        }
    });

    module.set('name', 'Emmylou');
    module.set('instrument', 'guitar');
    module.set('instrument', 'guitar'); // Change event should only be thrown once!
    module.set('silent', 'silent', true); // silent events should not trigger anything

    module.set({
        silentobject : true
    }, true /* no events for silent objects as well */);

    module.set({
        screamingobject : true
    }); /* but we do want them for non-silent objects */
});



test("update", function() {
    var module = new EmptyModule();

    module.set('name', 'Johnny');
    module.set('instruments', {
        "vocal" : true,
        "guitar" : true
    });
    module.set('silent', true);

    module.on('change:name', function(value) {
        ok(value === "Emmylou", "update triggers change namespaced event");
    });

    module.on('change:silent', function() {
        ok(false, "silent flag should not trigger any events");
    });

    module.update('name', function(oldValue) {
        return "Emmylou";
    });

    module.update('instruments', function(oldValue, key) {
        ok(this === module, "this should refer to the module being updated");
        ok(key === "instruments", "second argument of update should be original key");

        return {
            "vocal" : true,
            "guitar" : true
        };
    });

    module.update('silent', function(val) {
        return "silent";
    }, true /* silent flag */);
});



test("remove", function() {
    var module = new EmptyModule();
    module.set('foo', 'bar');
    module.set('silent', 'silent');
    module.set({
        'remove1' : true,
        'remove2' : true
    });

    function isKey(key) {
        return (key === 'foo' || key === 'remove1' || key === 'remove2');
    }

    module.on({
        'change': function( key ){
            ok(isKey(key), 'change event with key of attribute');
        },

        'change:foo': function(key, e){
            ok(e.type === 'change:foo', 'change:key event');
        },

        'remove': function( key ){
            ok(isKey(key), 'remove event with key of attribute');
        },

        'remove:foo': function(key, e){
            ok(e.type === 'remove:foo', 'change:key event');
        },

        'remove:silent' : function() {
            ok(false, 'silent event should not trigger');
        }
    });

    module.remove('foo');
    module.remove('silent', true); // should not trigger because of silent flag
    module.remove('  remove1   remove2'); // note the extra spaces to FU the parser :)
    ok(module.size() === 0, 'all attributes should be removed');
})



test("each and map with a single object", function() {
    var module = new EmptyModule();
    module.set({
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3'
    });

    var values = [];
    var keys = [];
    module.each(function(value, key) {
        values.push(value);
        keys.push(key);
    });
    deepEqual(values, ['value1', 'value2', 'value3'], "iterates over values");
    deepEqual(keys, ['key1', 'key2', 'key3'], "and keys");

    var newList = module.map(function(value, key) {
        return value + ':' + key;
    });

    deepEqual(newList, ['value1:key1', 'value2:key2', 'value3:key3'], "map() should return an array of new items");
});

test("context of each() is set to current module", function() {
    var module = new EmptyModule();
    var module2 = new EmptyModule();

    module.push(1);

    module.each(function() {
        ok(this === module, "each should have context of module set");
    });

    module.map(function() {
        ok(this === module, "map should have context of module set");
    });

    module.each(function() {
        ok(this === module2, "context of each should be overwritable");
    }, module2);

    module.map(function() {
        ok(this === module2, "context of map should be overwritable");
    }, module2);
});

test("each with an array", function() {
    var module = new EmptyModule();
    module.push([
       'value1',
       'value2',
       'value3'
    ]);

    var values = [];
    module.each(function(value, key) {
        values.push(value);
    });
    deepEqual(values, ['value1', 'value2', 'value3'], "iterates over values");
});

test("filter", function() {
    var module = new EmptyModule();
    module.set({
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3'
    });

    var module2 = new EmptyModule();
    module2.set('key', 'value');

    module2.filter(function(value, key) {
        ok(value === "value", "Value should be value");
        ok(key === "key", "Key should be the second argument");
    });

    var values = [];
    module.filter(function(value) {
        values.push(value);
    });
    deepEqual(values, ['value1', 'value2', 'value3'], "iterates over values");

    var filtered = module.filter(function(value) {
        return value == 'value1';
    });
    deepEqual(filtered, ['value1'], "returns one item");

    filtered = module.filter(function(value) {
        return value == 'value1' || value == 'value2';
    });
    deepEqual(filtered, ['value1', 'value2'], "returns several items");

    filtered = module.filter(function(value) {
        return value == 'nonexistent';
    });
    deepEqual(filtered, [], "when does not matches anything returns an empty array");
});

test("_.typeof", function() {
    ok(Stapes._.typeOf( {} ) === "object", "typeof {} = object");
    ok(Stapes._.typeOf( [] ) === "array", "typeof [] = array");
    ok(Stapes._.typeOf( function(){} ) === "function", "typeof function(){} = function");
    ok(Stapes._.typeOf( true ) === "boolean", "typeof true = boolean");
    ok(Stapes._.typeOf( 1 ) === "number", "typeof 1 = number");
    ok(Stapes._.typeOf( '' ) === "string", "typeof '' = string");
    ok(Stapes._.typeOf( null ) === "null", "typeof null = null");
    ok(Stapes._.typeOf( undefined ) === "undefined", "typeof undefined = undefined");
});



test("off", function() {
    var module = new EmptyModule();

    var handler = function(){};

    module.on({
        "foo" : handler,
        "bar" : function(){}
    });

    var events = Stapes._.eventHandlers[module._guid];

    ok(Object.keys(events).length === 2, "Event handlers are set");

    module.off("foo", handler);

    ok(!events.foo.length, "foo handler removed");

    module.off("bar");

    ok(!events.bar, "bar handler removed");

    module.off();

    ok(Object.keys(Stapes._.eventHandlers[module._guid]).length === 0, "no handlers for module");
});

test("Stapes.mixinEvents", function() {
    ok(typeof Stapes.mixinEvents() === "object", "Stapes.mixinEvents() without any arguments should return an object");

    var F = function() {
        Stapes.mixinEvents(this);
    }

    var f = new F();

    ok(typeof f.on === "function", "mixinEvents should add 'on' to a newly created class");

    var g = new F();

    ok(f._guid !== g._guid, "_guid of two newly created objects should not be the same");

    Stapes.on('foo', function(data, e) {
        ok(e.type === "foo", "Check if local events bubble through the Stapes object");
    });

    g.emit('foo');
});

test("event scope", function() {
    var module1 = new EmptyModule();
    var module2 = new EmptyModule();
    var firstDone = false;

    module1.on('eventscope', function(data, e) {
        ok(e.scope === module1, "Scope of event should be the emitting model");
    });

    module2.on('eventscope', function(data, e) {
        ok(e.scope === module2, "Scope of event should be the emitting model");
    });

    Stapes.on('eventscope', function(data, e) {
        if (firstDone) {
            ok(e.scope !== module1, "Scope of event from global Stapes object should not be the mixed with other models");
            ok(e.scope === module2, "Scope of event from global Stapes object should be the emitting model");
        } else {
            ok(e.scope === module1, "Scope of event from global Stapes object should be the emitting model");
            firstDone = true;
        }
    });

    Stapes.on('all', function(data, e) {
        if (e.type === "eventscope") {
            // Prevent other events from other tests getting here
            ok(e.scope === module1 || e.scope === module2, "Scope event from on 'all' handler on Stapes.on should be emitting model");
        }
    });

    module1.emit('eventscope');
    module2.emit('eventscope');
});

test("events on subclasses", function() {
    expect(3);

    var Parent = Stapes.subclass({
        constructor : function(id) {
            this.id = id;
        },

        getId : function() {
            this.emit('id', this.id);
        }
    });

    var Child = Parent.subclass({
        constructor : Parent.prototype.constructor
    });

    var parent = new Parent('parent');
    var parent2 = new Parent('parent2');
    var child = new Child('child');

    parent.on('id', function(id) {
        ok(id === 'parent', 'id of parent should be parent');
    });

    parent2.on('id', function(id) {
        ok(id === 'parent2', 'id of parent2 should be parent2');
    });

    child.on('id', function(id) {
        ok(id === 'child', 'id of child should be child');
    });

    parent.getId();
    parent2.getId();
    child.getId();
});

test("chaining", function() {
    var module = new EmptyModule();
    module.set('foo', true);

    ok(!!module.get && module.get('foo'), "set() should return the object");
    module = module.update('foo', function() { return true; });
    ok(!!module.get && module.get('foo'), "update() should return the object");
    module  = module.remove('foo');
    ok(!!module.get && module.get('foo') === null, "remove() should return the object");
    module = module.push(true);
    ok(!!module.get && module.size() === 1, "push() should return the object");
});

test("get", function() {
    var module = new EmptyModule();

    module.set({
        'title' : 'Ring of Fire',
        'artist' : 'Johnny',
        'instrument' : 'guitar'
    });

    ok( module.get('artist') === 'Johnny', "simple get");
    ok( module.get('undefined') === null, "undefined returns null");

    // Note how the function variaty of get() is pretty much useless
    // because it returns values instead of key/values
    // For now, we leave it in Stapes, but it might be deprecated
    ok(
        module.get(function(a) {
            return a === 'guitar';
        }) === 'guitar',
        "get with a function"
    );

    // The 'pick' like variety of get() is a lot more useful
    var props = module.get('artist', 'instrument');
    deepEqual(props, { 'artist' : 'Johnny', 'instrument' : 'guitar'}, "get works with multiple string arguments");
});

test("Extending Stapes (plugins)", function() {
    expect(1);

    Stapes.extend({
        foo : function() {
            ok(true, "New function can be called");
        }
    });

    var Module = Stapes.subclass();
    var module = new Module();

    module.foo();
});

test("push", function() {
    expect(0);

    var module = new ( Stapes.subclass() );

    // Issue #39, silent flag ignored in an array
    module.on('change', function() {
        ok(false, "Silent flag should be ignored with array");
    });

    module.push(true, true);
    module.push([1,2,3], true);
});

test("remove", function() {
    expect(5);

    var module = new ( Stapes.subclass() );

    module.set({
        'foo' : 1,
        'bar' : 2,
        'baz' : 3,
        'qux' : 4
    });

    module.on({
        'change:foo remove:foo' : function() {
            ok(true, 'remove with a key argument');
        },

        'change:bar remove:bar' : function() {
            ok(true, 'remove with a function argument');
        }
    });

    module.remove('foo');

    module.remove(function(val) {
        return val === 2;
    });

    module.on({
        'remove' : function() {
            ok( module.size() === 0, 'remove with no arguments, all attributes removed');
        }
    });

    module.remove();
});

// Not really a bug, but leave this in for documentation purposes
// Issue #40
test("private variables", function() {
    var Module = (function() {
        return Stapes.subclass({
            constructor : function( v ) {
                this._val = v;
            },

            getVal : function() {
                return this._val;
            }
        });
    })();

    var a = new Module('a');
    var b = new Module('b');

    ok( a.getVal() === 'a');
    ok( b.getVal() === 'b');
});
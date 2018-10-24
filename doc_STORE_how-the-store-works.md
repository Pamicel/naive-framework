# THE STORE
 
The store is accessible to every component through the handle `$store`

Every component has access to :
- `$store.set(key, value)` to mutate a value or create a new key in the store
- `$store.remove(key)` to remove a key from the store
- `$store.watch(key, fn)` to add a watcher function called when a specific key is modified
- `$store.unwatch(key, fn)` to remove that watcher
- `$store.state` to get a _copy_ of the current state

## The four parts

### 1 - Store.initialise (optional)
 
The store can be initialised once at the beggining of the session (preferably in \_\_main\_\_) by calling `Store.initialise(storeObject)`.
 
`storeObject` can actually be any object, and if it contains setters and getters, they will be kept as such.
 
`Store.initialise` and the `storeObject` essentially serve the purpose of defining some predetermined state variables at the beggining of a session (a 'session' here is the time the user spends on the page without recharging it) and to design them with specific descriptors.
 
Any new key can be added, any initialized key can be removed as long as it is not a getter or a setter.
 
Initialisation throws an error if the state (represented by `_state` inside the Store, accessible through `$store.state`) contains at least one key.
 
### 2 - Watchers
 
Components can set and unset an arbitrary number of watchers (functions that are triggered when the key they are watching is mutated in the _state).
 
All watchers set inside the component are deleted when the component is closed (NB : this not taken enforced by the Store but by the Doorman).
 
This means that watchers set outside of the 'open' hooks (cf component lifecycle) will exist only on the first instanciation of the component, and be killed for the rest of the window session the first time the component is unloaded (ie closed/destroyed). Watchers set inside the 'open' hooks will be recreated every time the component is loaded (id opened/created).
 
### 3 - State mutations
 
Mutations of the state are done through `$store.set(key, value)` and `$store.remove(key)`
 
`$store.state[key] = value` will only mutate an ephemeral copy of the state without modifying the actual state.

If a key is removed, all the watchers on this key are removed also.

### 4 - Store Front

Every component is given the handle `$store`, which is actually a _StoreFront_ used for keeping track of all watchers set and unset by the component and for deleting all watchers when the component is closed

## Methods returned by Store

The Store can be initialized with `Store.initialise`.

The Doorman creates and removes StoreFronts using `Store.create` and `Store.remove`
 
## Anatomy

```javascript
  const Store = (function () {

    /* 
      This is where the state and the watchers are stored
      Since Store is created with an IIFE, _state and _watchers remain private 
      (i.e. visible only inside this scope)
    */
    const _state = {};
    const _watchers = {};


    /*
      1 - INITIALISATION

      The three next function are usefull for the *initialisation* of the store

      Initialisation consists in passing an object that is used as the basis for the store
      during a window session.
      
      The initialisation object is useful for defining properties with precise descriptors,
      it is not exclusive, the store can have other properties in the future.
    */
    
    /*
      passDescriptor passes a property from origin to target by passing
      its complete descriptor rather than just its computed value.

      eg

      origin ::
      {
        set current(name) {
          this.log.push(name);
        },
        log: []
      }
      target :: {}

      ↓
      passDescriptor(origin, target, 'current')
      ↓

      origin ::
      {
        set current(name) {
          this.log.push(name);
        },
        log: []
      }
      target ::
      {
        set current(name) {
          this.log.push(name);
        }
      }
    */
    const passDescriptor = curry((target, origin, key) => {
      var propertyDescriptor = Object.getOwnPropertyDescriptor(origin, key);
      Object.defineProperty(target, key, propertyDescriptor);
    });

    /*
      objectAssignDescriptors copies all the properties of origin into target
      using passDescriptor
    */
    const objectAssignDescriptors = (target, origin) => {
      Object.getOwnPropertyNames(origin).map(passDescriptor(target, origin));
      return (target);
    };

    /*
      initialise is the function behind the property Store.initialise,
      it takes an initialObject that it copies using objectAssignDescriptors
    */
    const initialise = (initialObject) => {
      if (Object.keys(_state).length !== 0)
        throw Error('Global state initialisation error : global state has already been mutated');
      objectAssignDescriptors(_state, initialObject);
    };


    /*
      2 - WATCHERS

      A watcher is a function that is triggered when the property it watches
      changes value in _state.
      
      There can be arbitrarely many watchers on a single property/key

      _watchers must respect a structure that might look something like this :
      
      {
        'keyA' : [ [domElement0, functionA], [domElement1, functionB] ],
        'keyB' : [ [domElement1, functionC] ],
        ...
      }
    */

    /*
      trigger calls all watchers associated with a property/key passing the new value
    */
    const trigger = (key, value) => {
      if (_watchers[key])
        _watchers[key].map((tuple) => tuple[1](value));
    };

    /*

      setWatcher pushes a new watcher to _watchers[key]

      A watcher looks like this [dom, callback] and is inserted in the array at
      _watchers[key]

      'dom' is used to associate the watcher to a component (it is effectively 
      the root of the component) so that the watcher can follow the component's
      lifecycle.
      
      eg

      inside _watchers :
      {
        'keyA' : [ [domElement0, functionA], [domElement1, functionB] ],
        'keyB' : [ [domElement1, functionC] ]
      }

      ↓
      setWatcher(domElement1, keyA, functionD)
      ↓

      inside _watchers :
      {
        'keyA' : [ [domElement0, functionA], [domElement1, functionB], [domElement1, functionD] ],
        'keyB' : [ [domElement1, functionC] ]
      }

    */
    const setWatcher = curry((dom, key, callback) => {
      if (typeof callback !== 'function') throw new Error('Callback not a function');
      if (typeof key !== 'string') throw new Error('Name not a string');
      if (!_watchers[key]) _watchers[key] = [];
      _watchers[key].push([dom, callback]);
    });

    /*
      deleteWatcher removes all watchers that feature 'dom' from _watchers[key]

      eg

      inside _watchers :
      {
        'keyA' : [ [domElement0, functionA], [domElement1, functionB], [domElement1, functionD] ],
        'keyB' : [ [domElement1, functionC] ]
      }

      ↓
      deleteWatcher(domElement1, keyA)
      ↓

      inside _watchers :
      {
        'keyA' : [ [domElement0, functionA] ],
        'keyB' : [ [domElement1, functionC] ]
      }
    */
    const deleteWatcher = curry((dom, key) => {
      if (!_watchers[key]) return;
      _watchers[key] = _watchers[key].filter((tuple) => tuple[0] !== dom);
    });

    /*
      deleteWatcher simply removes all watchers associated with key

      eg

      inside _watchers :
      {
        'keyA' : [ [domElement0, functionA], [domElement1, functionB], [domElement1, functionD] ],
        'keyB' : [ [domElement1, functionC] ]
      }

      ↓
      deleteWatcher(keyA)
      ↓

      inside _watchers :
      {
        'keyB' : [ [domElement1, functionC] ]
      }
    */
    const deleteAllWatchers = (key) => {
      if (_watchers[key]) delete _watchers[key];
    }


    /*
      3 - STATE MUTATIONS
    */

    /*
      set state key
    */
    const set = (key, value) => {
      _state[key] = value;
      trigger(key, value);
    };

    /*
      delete state key

      Important to note here that if the property has a setter or
      a getter or both, it wont be deleted

      Nothing in place to treat non-writables differently,
      it was not a need in this project
    */
    const remove = (key) => {
      if (_state[key]) {
        var desc = Object.getOwnPropertyDescriptor(_state, key);
        if (desc.get || desc.set)
          _state[key] = null; // Do not delete a setter or a getter
        else
          delete _state[key];
      }
      deleteAllWatchers(key);
    }


    /*
      4 - STORE FRONT (handle used inside a component)

      each component can use the store and set and unset watchers using
      $store, which is an instanciation of a StoreFront using the root of
      the component
      
      i.e. all uses of $store.watch and $store.unwatch create watchers
      that feature the root of the component as there first element
      ('dom', cf setWatcher)
    */

    /*
      StoreFront constructor
    
      Important, every call to $store.state creates a new object
      which is fully writable, but won't affect the actual _state.
    */
    const StoreFront = (dom) => {
      // watch fn
      const watch = setWatcher(dom);
      // unwatch fn
      const unwatch = deleteWatcher(dom);

      return ({
        set,
        remove,
        watch,
        unwatch,
        get state() {return (Object.assign({}, _state));}
      })
    }

    /*
      removeStoreFront removes all watchers associated with the root of
      the component the storefront was instatiated for.
    */
    const removeStoreFront = (dom) => {
      Object.keys(_watchers).map(key => (_watchers[key] = _watchers[key].filter((tuple) => tuple[0] !== dom)));
    }
    
    /*
      The Store can be initialized with Store.initialise
      The Doorman creates and removes StoreFronts using Store.create and Store.remove
    */

    return ({ initialise, create: StoreFront, remove: removeStoreFront });
  })();
```

"use strict";

const app = (function () {

  const curry = function curry(fn) {
    var arity = fn.length;
    return function $curry() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (args.length < arity) {
        return $curry.bind.apply($curry, [null].concat(args));
      }
      return fn.call.apply(fn, [null].concat(args));
    };
  };

  const prop = curry((p, obj) => obj[p]);

  /*
    .d88888b    dP
    88.    "'   88
    `Y88888b. d8888P .d8888b. 88d888b. .d8888b.
          `8b   88   88'  `88 88'  `88 88ooood8
    d8'   .8P   88   88.  .88 88       88.  ...
    Y88888P    dP   `88888P' dP       `88888P'
  */

  const Store = (function () {

    // state Obj
    const _state = {};
    // watchers Obj
    const _watchers = {};

    // Initialise global state

    // This permits the use of getters and setters in the initialiser
    const passDescriptor = curry((target, origin, key) => {
      var propertyDescriptor = Object.getOwnPropertyDescriptor(origin, key);
      Object.defineProperty(target, key, propertyDescriptor);
    });
    const ObjectAssignDescriptors = (target, origin) => {
      Object.keys(origin).map(passDescriptor(target, origin));
      return (target);
    };

    const initialiseGlobalState = (initialiser) => {
      if (Object.keys(_state).length !== 0)
        throw Error('Global state initialisation error : global state has already been mutated');
      ObjectAssignDescriptors(_state, initialiser);
    };


    // trigger fn
    const trigger = (key, value) => {
      if (_watchers[key])
        _watchers[key].map((tuple) => tuple[1](value));
    };

    // set watcher
    const setWatcher = curry((dom, key, callback) => {
      if (typeof callback !== 'function') throw new Error('Callback not a function');
      if (typeof key !== 'string') throw new Error('Name not a string');
      if (!_watchers[key]) _watchers[key] = [];
      _watchers[key].push([dom, callback]);
    });

    // delete watcher
    const deleteWatcher = curry((dom, key, fn) => {
      if (!_watchers[key]) return;
      _watchers[key] = _watchers[key].filter((tuple) => (tuple[0] !== dom || tuple[1] !== fn));
    });

    // delete all watchers
    const deleteAllWatchers = (key) => {
      if (_watchers[key]) delete _watchers[key];
    }

    // set state key
    const set = (key, value) => {
      _state[key] = value;
      trigger(key, value);
    };

    // delete state key
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

    // storeFront constructor
    const storeFront = (dom) => {
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

    // const removeStoreFront
    const removeStoreFront = (dom) => {
      Object.keys(_watchers).map(key => (_watchers[key] = _watchers[key].filter((tuple) => tuple[0] !== dom)));
    }

    return ({ initialise: initialiseGlobalState, create: storeFront, remove: removeStoreFront });
  })();

  /*
    .d888888  dP                     dP
    d8'    88  88                     88
    88aaaaa88a 88 .d8888b. 88d888b. d8888P .d8888b.
    88     88  88 88ooood8 88'  `88   88   Y8ooooo.
    88     88  88 88.  ... 88         88         88
    88     88  dP `88888P' dP         dP   `88888P'
  */

  // Set alert initial state
  const resetAlert = () => {
    const alertEl = document.getElementById('alert');
    const closeButton = document.querySelector('#alert .alert__buttons__close');
    const actionButton = document.querySelector('#alert .alert__buttons__action');
    const messageEl = document.querySelector('#alert .alert__message');

    alertEl.classList.remove('on');
    actionButton.classList.remove('on');
    actionButton.onclick = undefined;
    closeButton.onclick = undefined;
    actionButton.innerHTML = "";
    closeButton.innerHTML = "";
    messageEl.innerHTML = "";
    document.body.style.overflow = "";
  };

  // Display an alert
  const displayAlert = function ( message, closeButtonDesc = "Ok", actionButtonDesc ) {

    const alertEl = document.getElementById('alert');
    const closeButton = document.querySelector('#alert .alert__buttons__close');
    const messageEl = document.querySelector('#alert .alert__message');
    
    // Change alert state to 'on'
    requestAnimationFrame(() => {
      alertEl.classList.add('on', 'enter');
      requestAnimationFrame(() => {
        alertEl.classList.remove('enter');
      });
    });
    
    // Set up close button
    if (typeof closeButtonDesc === 'object') {
      closeButton.innerHTML = closeButtonDesc.buttonText;
      closeButton.onclick = (event) => {
        event.stopPropagation();
        if (closeButtonDesc.fn) {
          return (closeButtonDesc.fn().then((res) => {
            resetAlert();
            return (Promise.resolve(res));
          }));
        } else {
          resetAlert();
        }
      };
    } else {
      closeButton.innerHTML = closeButtonDesc;
      closeButton.onclick = (event) => {
        event.stopPropagation();
        resetAlert();
      };
    }

    var actionButton = document.querySelector('#alert .alert__buttons__action');
    // Set up action button. If an alert object was given
    if (actionButtonDesc && actionButtonDesc.fn) {
      if (actionButtonDesc.singleButton === true) {
        // If option singleButton is on, use closeButton as actionButton
        actionButton = closeButton;
      } else {
        // Otherwise show actionButton
        actionButton.classList.add('on');
        // And give it a text
        actionButton.innerHTML = actionButtonDesc.buttonText;
      }
      actionButton.onclick = (event) => actionButtonDesc.fn(event).then(() => resetAlert());
    }

    // Fill the message
    messageEl.innerHTML = message;

    // Prevent scrolling of the rest of the body
    document.body.style.overflow = 'hidden';

    // Focus the button
    closeButton.focus();

    // Quit when keydown is esc
    const escapeAlert = (e) => {
      if (e.key === 'Escape') {
        document.body.removeEventListener('keydown', escapeAlert);
        if (typeof closeButtonDesc === 'object' && closeButtonDesc.fn) {
          closeButtonDesc.fn().then((res) => {
            resetAlert();
          });
        } else {
          resetAlert();
        }
      }
    }
    document.body.addEventListener('keydown', escapeAlert);
  };

  /*
     a88888b.                                                                             dP
    d8'   `88                                                                             88
    88        .d8888b. 88d8b.d8b. 88d888b. 88d888b. .d8888b. 88d888b. .d8888b. 88d888b. d8888P .d8888b.
    88        88'  `88 88'`88'`88 88'  `88 88'  `88 88'  `88 88'  `88 88ooood8 88'  `88   88   Y8ooooo.
    Y8.   .88 88.  .88 88  88  88 88.  .88 88       88.  .88 88    88 88.  ... 88    88   88         88
     Y88888P' `88888P' dP  dP  dP 88Y888P' dP       `88888P' dP    dP `88888P' dP    dP   dP   `88888P'
                                  88
                                  dP
    
     888888ba
     88    `8b
    a88aaaa8P' 88d888b. .d8888b. dP.  .dP dP    dP
     88        88'  `88 88'  `88  `8bd8'  88    88
     88        88       88.  .88  .d88b.  88.  .88
     dP        dP       `88888P' dP'  `dP `8888P88
                                               .88
                                           d8888P
  */

  const ComponentsProxy = (function() {
    const collection = {};

    function fetchComponent (name) {
      return (
        fetch('/comp', {
          body: JSON.stringify({ name }),
          method: 'POST',
          credentials: 'same-origin',
          headers: {'Content-Type': 'application/json'}
        })
        .then((res) => res.json())
        .catch(() => Promise.reject("Problème lors de la connection au server"))
        .then((res) => res.info.component)
      );
    }

    function getComponent (name) {
      if (!contains(name)) {
        return (
          fetchComponent(name)
          .then(function (content) {
            var component = createComponent(content);
            // Memoize the component only if it bears the correct name
            if (content.name === name) memoizeComponent(name, content);
            return (Promise.resolve(component));
          })
          .catch(function (err) {
            return (Promise.reject(new Error(`Could not load component. Request : { name: ${name} }`)));
          })
        );
      }
      return Promise.resolve(Object.assign({}, collection[name]));
    }

    // Component creator
    function createComponent (content) {
      var isValid = content.hasOwnProperty("template") && content.hasOwnProperty("script");
      return (
        isValid
        ? Object.assign({}, content)
        : null
      );
    }

    function memoizeComponent (name, component) {
      if (!contains(name) || changed(name, component)) {
        collection[name] = component;
      }
    };

    function restrict () {
      for (var key in collection)
        if (collection[key].restricted)
          delete collection[key];
    };

    function contains (name) {
      return (collection.hasOwnProperty(name));
    };

    function changed (name, { template, script, restricted }) {
      return (
        !contains(name) ||
        (template !== undefined && collection[name].template !== template) ||
        (script !== undefined && collection[name].script !== script) ||
        (restricted !== undefined && collection[name].restricted !== restricted)
      );
    };

    return({
      get : getComponent,
      restrict
    })
  })();

  const components = ComponentsProxy;


/*

  888888ba
  88    `8b
  88     88 .d8888b. .d8888b. 88d888b. 88d8b.d8b. .d8888b. 88d888b.
  88     88 88'  `88 88'  `88 88'  `88 88'`88'`88 88'  `88 88'  `88
  88    .8P 88.  .88 88.  .88 88       88  88  88 88.  .88 88    88
  8888888P  `88888P' `88888P' dP       dP  dP  dP `88888P8 dP    dP

*/

  ////////////////////////// DOORMAN FUNCTIONS

  // summoner + summoner helpers

  const mountSelector = curry(function (mount, query) {

    var pre = '#' + mount.id + ' ';
    var result = document.querySelectorAll(pre + query);

    if (result.length && result.length === 1)
      return (result[0]);
    return (result);

  });

  const createEmiters = function (on) {
    if (!on)
      return ;

    return (function () {
      var args = Array.prototype.slice.call(arguments);
      var name = args[0];
      if (on[name])
        return (on[name].apply(null, args.slice(1)));
      else
        throw Error(`Emiter ${name} not defined.`);
    });

  }

  const summonComponent = curry(function (mount, dom, component) {

    const $ = mountSelector(mount);
    const $mount = mount;
    const $name = component.name;
    const $options = component.opt;
    const $emit = createEmiters(component.on);
    const $life = {};
    const $alert = displayAlert;
    const $router = appInterface.router;
    const $store = Store.create(dom);
    // Must be called last
    const $open = eval(component.script)();

    // Return for later use by the doorman
    return ({open: $open, life: $life});

  });

  // Parse Component

  const templateToDOM = function (template) {

    const PARSER = new DOMParser();

    var dom;
    dom = PARSER.parseFromString(template, 'text/html');
    // Check that the parsed DOM subtree has childNodes. Only the firstChild is considered.
    dom = dom.body.childNodes.length >= 1 ? dom.body.firstChild : null;

    return (dom);

  };

  // Attach component

  const attachNewComponent = curry(function (mount, dom) {
    if (mount.firstChild) mount.removeChild(mount.firstChild);
    mount.appendChild(dom);
  });

  // Curried spawn function for components

  const spawner = curry(function (_current, summon, attach, component, data) {
    // NB : _current must be a reference.

    var dom = component.dom = component.dom || templateToDOM(component.template);
    if (_current.name != component.comp) attach(dom);

    var logic = component.logic = component.logic || summon(dom, component);

    var openResult = logic.open(data);

    // Just realised fat arrow functions came out before Chrome 46 and FF 41 !
    const resolveSpawn = (iface) => Promise.resolve(Object.assign({ interface: iface }, component));

    // Components which opening is asynchronous are handled, BUT, thanks to
    // this below, you don't have to put a dummy Promise in all your components
    if (openResult instanceof Promise)
      return (openResult.then(resolveSpawn));
    return (resolveSpawn(openResult));

  });

  // Create ejector

  const clearMount = (mount, _current) => () => {
    // NB : _current must be a reference.
    if (typeof _current.close === "function") _current.close();
    if (_current.close instanceof Array) _current.close.map((fn) => { if (typeof fn === "function") fn(); });
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }
  };

  ////////////////////////// DOORMAN CONSTRUCTOR

  const createDoormanUtility = ( ComponentsProxy ) => ( mount, routes, settings = {} ) => {

    routes = Object.freeze(routes);
    settings = Object.freeze(settings);

    // Validity check
    for (var key in routes) {
      if (!routes[key].comp || typeof routes[key].comp !== 'string')
        throw (new Error("Some routes don't specify a component name in 'comp'"));
    }

    const _instances = {};

    function getInstance (name) {
      return (
        _instances.hasOwnProperty(name)
        ? _instances[name]
        : {}
      );
    }

    function setInstance (name, instance) {
      // If actual component different from expected => not memoized
      if (name !== instance.dom.getAttribute('name'))
        return ;

      // Else, memoized
      if (!_instances[name]) {
        _instances[name] = {
          dom: instance.dom,
          logic: instance.logic,
          restricted: instance.restricted
        }
      }
    }

    const _current = {
      get name() {
        if (!mount.firstChild)
          return ;
        return (mount.firstChild.getAttribute('name'));
      }
    };

    function updateCurrent (component) {
      delete _current.close;
      _current.close = function () {

        // Delete the storefront
        Store.remove(component.dom);

        // Trigger the outter life.close
        if (component.life && component.life.close) {
          if (typeof component.life.close === 'function') component.life.close();
          else if (component.life.close instanceof Array) component.life.close.map((fn) => { if (typeof fn === 'function') fn(); });
        }

        // Trigger the inner life.close
        if (component.logic && component.logic.life && component.logic.life.close) {
          if (typeof component.logic.life.close === 'function') component.logic.life.close();
          else if (component.logic.life.close instanceof Array) component.logic.life.close.map((fn) => { if (typeof fn === 'function') fn(); });
        }

      }
    }

    // clear : Removes the current attached component from the mount.
    const clear = clearMount(mount, _current);

    // inject : Fetches the component and then instantiates it.
    const summon = summonComponent(mount);
    const attach = attachNewComponent(mount);
    const spawn = spawner(_current, summon, attach);

    const inject = (routeInfo, data) => {
      var opt = routeInfo && routeInfo.opt ? routeInfo.opt : {};
      data.$query = routeInfo.query || "";
      return (
        ComponentsProxy.get(routeInfo.comp)
        .then(rawComponent => {
          var component = Object.assign({}, rawComponent, getInstance(routeInfo.comp), routeInfo);
          return (spawn(component, data));
        })
        .then(component => {
          // Additionnal 'open' outer hook
          var outerHooks = component.life;
          if (outerHooks && outerHooks.open) outerHooks.open();

          updateCurrent(component);
          setInstance(routeInfo.comp, component);
          return (Promise.resolve(component.interface));
        })
      );
    };


    // load : Fetches and injects

    const routeRepr = ( where, routes ) => Object.assign({}, routes[where.route], where);

    const loadFunction = ( settings, routes ) => ( where, data = {} ) => {

      // 'where' can be a single string that actually designates where.route
      if (typeof where === 'string' || where === undefined) where = { route: where };
      // If no route in 'where' OR doorman does not have the route, use default
      if (!where.route || !routes[where.route]) where.route = settings.default;

      // In case routes.length === 1, neither where nor default need to be specified,
      // simply calling the function with no parameter brings to the single route.
      if (!where.route && Object.keys(routes).length === 1) where.route = routes[Object.keys(routes)[0]];

      if (routes[where.route]) {
        clear();
        return (inject(routeRepr(where, routes), data));
      }
      return (Promise.reject(new Error('No route specified')));
    };

    const load = loadFunction(settings, routes);

    function restrict () {
      ComponentsProxy.restrict();
      for (let key in _instances) if (_instances[key].restricted) delete _instances[key];
    }

    function preload (names) {
      if (names instanceof Array)
        names.map(function (name) { ComponentsProxy.get(name); });
      else
        ComponentsProxy.get(name);
    }

    return ({
      load,
      unload: clear,
      restrict,
      preload
    });

  };

  const Doorman = createDoormanUtility(ComponentsProxy);

  /*
  
     888888ba                      dP
     88    `8b                     88
    a88aaaa8P' .d8888b. dP    dP d8888P .d8888b. 88d888b.
     88   `8b. 88'  `88 88    88   88   88ooood8 88'  `88
     88     88 88.  .88 88.  .88   88   88.  ... 88
     dP     dP `88888P' `88888P'   dP   `88888P' dP
  
  */

  const Router = ( mount, routes, settings ) => {

    // StateObject constructor
    const toStateObject = (where) => {
      if (typeof where === 'string')
        return ({ route: where });
      return (where);
    };

    // Function that handles url and history
    //   settings :: Object - Router settings
    //   where :: StateObject - Route to push
    //   componentInterface :: Object - Returned by component that was just spun
    const createPushState = curry((settings, where, componentInterface) => {

      // Create the url
      var url = window.location.origin + '/' + where.route;
      if (where.query) url += '?' + where.query;
      if (where.hash) url += '#' + where.hash;

      // Take the current state
      var current = history.state;
      // Remove it's 'previous' key
      delete current.previous;
      // Make it 'previous' in the state that will be pushed
      where.previous = current;
      // Push the state
      history.pushState(where, null, url);

      // Reset the alert
      resetAlert();
      // Chain the componentInterface
      return (Promise.resolve(componentInterface));
    });
    const pushState = createPushState(settings);

    // Router inner Doorman
    const dm = Doorman(mount, routes, settings);

    // On user action on history
    window.onpopstate = function (event) {
      // Reset the alert
      resetAlert();
      // If initial state handle first url
      // Else load saved state
      if (window.location.pathname === '/' || event.state === null)
        handleFirstUrl();
      else
        dm.load(event.state);
    };

    // to -> Load the component and then change the url and save the state
    const to = (where, data) => dm.load(where, data).then(pushState(toStateObject(where)));

    // Router must have a home
    if (!settings.home) throw new Error('Router could not be created, settings.home not defined');
    const home = () => to(settings.home);


    // History state initialiser
    function handleFirstUrl () {
      // Isolate the first part of the pathname
      var where = {
        route : window.location.pathname.split('/')[1],
        query : window.location.search.split('?')[1]
      }
      if (!where.route) where = toStateObject(settings.home);

      var url = window.location.origin + '/' + where.route;
      if (where.query) url += '?' + where.query;

      // Save the state
      history.replaceState(where, null, url);
      // Load the component
      dm.load(where);
    };

    // Initialise the state
    handleFirstUrl();

    return (Object.assign(dm, {to, home}));
  }

  ////////////////////////////////

  const appInterface = { components };

  // Call main script
  Doorman(
    // Mount
    document.getElementById('mount-main'),
    // Routes
    {'main' : {comp: '__main__'}}
  )
  .load('main')
  .then(function (componentInterface) {
    // Update the interface with the router and the auth
    Object.assign(appInterface, componentInterface);
  })
  .catch(function (err) {
    throw (new Error(err));
  });

  return (appInterface);

})();

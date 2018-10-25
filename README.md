# The not so naive framework

# ⚠️  Documentation in progress ⚠️
The objective of this project was to make the most declarative, simple to use, boiler plate I could to build a project I had to do for school. The project was to build a very dull _"Instagram-like"_ app. It was meant to be mostly PHP (pure PHP, no frameworks or libraries), and the front end was to be pure Vanilla, HTML and CSS (and it had to be compatible with at least Chrome 41 and Firefox 46, which is probably just an arbitrary constrain).

I don't like PHP that much, don't read me as a Javascript diehard, but I believe PHP (pure PHP with no framework or library that is) enforces concepts that are pretty antiquated, I am learning web development and I did not feel like spending my learning time on that.  Moreover I had stumbled on Vue a few months earlier for a personnal project, and the clarity and simplicity Vue really stuck me. I essentially wanted to see how far I could go, with my understanding of JS, into building something that, even if it would likely take more time to build, would _in fine_ simplify the development of the app.

## What is a doorman

A doorman is an object that deals with __inserting and changing components inside a given div__ (called a __mount__)

A new doorman is instanciated like this :
```javascript
const dm = Doorman(

  // Mount
  $("#mount-abcd"),

  // Routes
  {
    'route-a': {
      comp : 'component-a',
      on: { emiterA: doSomething },
    },

    'route-b': {
      comp : 'component-b',
      hooks : { open: doSomething }
    },

    'route-c': {
      comp : 'component-c',
      on: { emiterC: doSomething },
    }
  },

  // Doorman options
  { optionA: value }

)
```

The 'routes' are all the components that the doorman is allowed to _load_ and _unload_ inside the mount.

Each route is comprised of the following :
- `name` : a component name
- (optional) `on: { emiterName: fn, ... }` : functions defined on the parent component that the child component can call (aka emiters, cd doc_COMPONENTS.md)
- (optional) `hooks { open:..., close:... }` : functions that are called when the component is _loaded_ or _unloaded_ from the mount

You can create as many doormen as you want inside a component (as of now nothing prevents you from defining two doormen on the same mount, but it is not a good idea).


## app

The entry page is /naive.html. It has a main empty *mount div* ```<div id='mount-main'></div>```
which is handled and filled with content by /naive.js.

/naive.js serves as the entry point (and the scope) for all components

It is made of three main parts :
  - the Components Proxy
  - the Doorman utility
  - the Store

And a fourth part that is a wrapper arount the Doorman utility :
  - the Router constructor.

### Components

#### Prerequisite

Back end expected behaviour :

A POST request as such : `curl -d '{"name":"componentName"}' -H "Content-Type: application/json" -X POST /comp` should yield either an error if the component is not found, or a component as follows :

```JSON
  {
    "name": "componentName",
    "template": "<div name='componentName'> ... component template ... </div>",
    "script": "(function () { ... component script ... })",
    "restricted": false
  }
```

#### Behaviour

The Components Proxy is the service that fetches the components for the app (and memoizes them to avoid multiple server calls)

##### ComponentsProxy.get
  resolves to a component

##### ComponentsProxy.restrict
  If `restricted` is `true` in a component, the component will be removed from local memory when `ComponentsProxy.restrict` is called, this is useful after a logout, in order to avoid keeping around components that are intended only for logged in users.

  rq : `ComponentsProxy.restrict` is not a security feature (it only makes sure logged out users don't accidentally load a component that calls api endpoints that do not work for them)

### Doorman

  A Doorman acts as a router for a given DOMElement (called the 'mount'), it injects or ejects components from it, gives the component special methods and objects.

#### Special methods and objects passed to a component
  - $
  - $mount
  - $name
  - $options
  - $emit
  - $hooks
  - $alert
  - $router
  - $store
  - $open

#### Methods
  - load
  - unload
  - restrict
  - preload

#### The way the Doorman represents data

```javascript
routes =        // All the routes
{
    routeName : {
        comp : 'componentName',                     // required
        on : { emiterName : emiterFunction, ... },  // optional
        opt : { stuff: thing },                     // optional
        hooks : {                                   // optional
          open : function () { /* Do stuff */ }
        }
    }
    // ...
}

rawComponent =  // component as sent by the server
{
    name : String,
    template : htmlString,      // Valid HTML representation of a component
    script : javascriptString,  // Valid component script
    restricted : Boolean
}

componentInstance =
{
    dom : DOMNode,       // dom structure parsed from the component's template
    logic : Object,      // result of the component's script after it was evaled
    restricted : Boolean
}

routeInfo =
{
    route : 'routeName',
    ...routes[routeName]
}

component =     // as represented inside a doorman
{
    ...routeInfo,
    ...rawComponent,
    ...componentInstance,
    interface : Object // returned by the components initializer
}
```


### Router

  The Router is a Doorman that affects window.location (the url) and the browser history.

### Store

cf doc_STORE[...].md

### A typical components folder

```
components
├── 404
│   ├── script.js
│   └── template.html
├── __main__
│   ├── script.js
│   └── template.html
│
├── name-1
│   ├── script.js
│   └── template.html
├── name-2
│   ├── script.js
│   └── template.html
├── name-3
│   ├── script.js
│   └── template.html
...
└── name-z
    ├── script.js
    └── template.html
```
__\_\_main\_\___ is compulsory and __404__ is recommended

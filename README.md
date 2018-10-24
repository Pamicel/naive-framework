# The most naive framework

# ⚠️  Documentation in progress ⚠️

## app

The entry page is /app.html. It has a main empty *mount div* ```<div id='mount-main'></div>```
which is handled and filled with content by /app.js.

/app.js serves as the entry point (and the scope) for all components

It is made of three main parts :
  - the Components Proxy
  - the Doorman utility
  - the Store

And a fourth part that is a wrapper arount the Doorman utility :
  - the Router constructor.

### Component Proxy

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

cf doc_STORE.md

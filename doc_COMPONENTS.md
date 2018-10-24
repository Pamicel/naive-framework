# Components

## What is a component

A typical components folder is as such
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

Every component has to have a __template__ and a __script__.

It is exepected by the framework that the backend respect this static discipline :

A POST request at '/comp' like this one : `curl -d '{"name": "componentName"}' -H "Content-Type: application/json" -X POST /comp` should yield either an error if the component is not found, or a component as follows :

```JSON
  {
    "name": "componentName",
    "template": "<div name='componentName'> ... component template ... </div>",
    "script": "(function () { ... component script ... })",
    "restricted": false
  }
```

### template.html

Every template is a simple html markdown, that must be encapsulated in
```html
<div class='component' name='compName'>
  <!-- content of template.html -->
</div>
```

### script.js

Every script is as such
```javascript
(function () {

  /* stuff */

  // Compulsory "open" function that is called every time the component is spawned
  const open = function () {

    /* Do stuff */

    return ( /* "componentInterface" that the parent component might utilize */ );
  };

  return (open);
})
```

## The way the Doorman represents data

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

## Component lifecycle

The component has action triggers when opened and other action triggers when closed, those are called hooks, there are two kinds of hooks

### Inner hooks

**Inner hooks** are added to the *$hooks* object from inside the component, say like this :

```javascript
(function () {

  /* stuff */

  const open = function () {

    /* Do stuff */

    $hooks.close = function () { /* Do other stuff */}

    /* Do other other stuff */

  };

  return (open);
})
```

or like this :

```javascript
(function () {

  /* stuff */

  $hooks.close = function () { /* Do stuff */}

  /* stuff */

  const open = function () { /* Do other stuff */ };

  return (open);
})
```

The only existing inner hook at the time of writing is the *close* hook : it is called right before the component is ejected from the mount.

NB : the open function present in all components, is the mother of all inner hooks, the definition of a $hooks.open function is thus ignored by design.

### Outer hooks

**Outer hooks** are added to "hooks" in the route object, like so :

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

      hooks : { open: doSomething } // Like this

    },

    'route-c': {
      comp : 'component-c',
      on: { emiterC: doSomething },

      hooks : { open: doStuff } // Like this

    }
  },
  // Options
  { history: 'hash' }
)
```

There are two outer hooks : *open* (which is called just after the inner open function) and *close* (which is called at the same time as its inner counterpart)

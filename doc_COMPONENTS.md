# Components reference

## Component structure

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

### template.html

Every template is a simple html markdown, no specific constrains

When sent to the client, the template of component found in a dir with name *compName* is encapsulated in
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

## Doorman inner data representations

```javascript
var routes =        // All the routes
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

var rawComponent =  // component as sent by the server
{
    template : htmlString,      // Valid HTML representation of a component
    script : javascriptString,  // Valid component script
    restricted : Boolean
}

var componentInstance =
{
    dom : DOMNode,       // dom structure parsed from the component's template
    logic : Object,      // result of the component's script after it was evaled
    restricted : Boolean
}

var routeInfo =
{
    route : 'routeName',
    ...routes[routeName]
}

var component =     // as represented inside a doorman
{
    ...routeInfo,
    ...rawComponent,
    ...componentInstance,
    interface : Object // returned by the components initializer
}
```

## Hooks

There are two kinds of hooks

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
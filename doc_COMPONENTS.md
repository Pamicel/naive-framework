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

  // Options (Optional)
  { history: 'hash' }
)
```

There are two outer hooks : *open* (which is called just after the inner open function) and *close* (which is called at the same time as its inner counterpart)

## Communication between components

Parents/children communication can be hard, but not for components.

Because I believed it was cleaner, children are not scoped inside their parent component. There are instead systems in place that give a parent and a child the ability to trigger actions inside one another.

### Emiters
All components have a handle called `$emit` that lets them use a function that they expect the parent to give them (through `on: {...}` in the parent doorman).

eg :
```javascript
'route-c': {
  comp : 'component-c',
  on: { emiterC: doSomething }
}
```
Here `'component-c'` is expected to use `$emit('emiterC', arg1, arg2, ...)` somewhere in its script, so the parent component gives a function (`doSomething`) that corresponds to that action.

This can make the child mutate something inside its parent or pass/access informations from its parent.

### Passing data on component loads
Say the parent has a doorman `dm` that features a route `routeX` that represents a component `componentX`. To load componentX inside the doorman's mount, the parent has to call `dm.load('routeX')`. If the parent wants to pass __data__ to the component, it can call `dm.load('routeX', data)`

TLDR;
```javascript
// The parent component

(function () {

  const dm1 = Doorman(
    $("#mount-abcd"),
    'routeX': {
      comp : 'componentX',
    }
  )

  const open = () => {

    /* do stuff */

    dm1.load('routeX', {greet: 'hello'});
    
    /* do stuff */

  }

  return (open);
})
```

```javascript
// The child component

(function () {

  const open = (data) => {
    // Every time the child is loaded, it will console "hello"
    console.log(data.greet);
  }

  return (open);
})
```

Passing data on load is a secondary way to pass functions to the child, which can prove useful.

### Using the child's interface
The compulsory function `open` (which you can actually call however you want, it just has to be the only thing returned by the component script) returns an object that is the argument passed to the `doorman.load` Promise response :

IDUP; (I don't understand, Paul)
```javascript
// The child component

(function () {

  const open = (data) => {
    return (data);
  }

  return (open);
})
```

```javascript
// The parent component

(function () {

  const dm1 = Doorman(
    $("#mount-abcd"),
    'routeX': {
      comp : 'componentX',
    }
  )


  const open = () => {

    /* do stuff */

    // Every time the child is loaded, this will console "hello"
    dm1.load('routeX', {greet: 'hello'})
      .then(interface => console.log(interface.greet));
    
    /* do stuff */

  }

  return (open);
})
```
This rather useful parent child combo will print 'hello' to the console.
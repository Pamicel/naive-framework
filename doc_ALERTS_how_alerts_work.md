# Alerts

Alerts are an UI element built into the framework. This is probably not the best idea, but it was useful for solving the project this was built for.

As of now the framework takes for granted that the app structure contains exactly this somewhere
```html
<div id="alert">
    <div class="alert__container">
        <p class="alert__message"></p>
        <div class="alert__buttons">
            <button class="alert__buttons__close"></button>
            <button class="alert__buttons__action"></button>
        </div>
    </div>
</div>
```
The style can be set anywhere (but preferably in \_\_main\_\_).

### buttons
There are two buttons (described in usage below) : `.alert__buttons__close` and `.alert__buttons__action`

The latter should be 'hidden' by default and only shown if it features the class `.on`, this is the minimal recommended css for `.alert__buttons__action` :
```css
.alert__buttons__action { display: none; }
.alert__buttons__action.on { display: unset; /* or 'block' or 'inline-block' or anything that cancels 'none' */ }
```

**NB** : clicking any of the two buttons closes the alert.

## Usage of `$alert`

Components can use the handle `$alert(message, closeButtonDesc, actionButtonDesc)`

- `message` is a string, displayed as the main message. At the time of writing, the message can be an html string (e.g. `<h1>Hello</h1>`, or even `<script>alert('hello')</script>` but the latter would miss the point), there is no restriction. An idea for the future would be to have an initialiser for \_\_main\_\_ that sets up a common style (some declarative way to define something like "there is always at least a title which is a h1, and there can be a subtitle that would be a h2")...

- `closeButtonDesc` is either a String that is used as the button's face, or a descriptor like this :
```javascript
{
    // Button's face
    buttonText: "Close the alert",
    // What happens when the button is pressed (redirection, api call, ...)
    fn: event => make.something.happen() // ⚠️  Must return a Promise
}
```

- `actionButtonDesc` can only be as follows
```javascript
{
    // Button's face
    buttonText: "Do something",
    // What happens when the button is pressed
    fn: event => make.something.different.happen() // ⚠️  Must return a Promise
}
```

**NB** : if `actionButtonDesc` is `undefined` (or just falsy) the second button is not switched on (thus not displayed).

## Lifecycle

When it is triggered, `#alert` recieves the class `.on`, then `.on` is stripped when it is closed. This is the minimal recommended css for `#alert`:
```css
#alert { display: none; }
#alert.on { display: unset; /* or 'block' or 'inline-block' or anything that cancels 'none' */ }
```

### Animation
For one frame when it is triggered, `#alert` is `#alert.enter`, then at the second frame `.enter` is removed, this gives the oportunity for an animation. The following for example is a nice _lift and appear_ :
```css
#alert .alert__container {
    transition: transform 300ms, opacity 200ms ease-in;
}
#alert.enter .alert__container {
    opacity: 0;
    transform: translateY(50px);
}
#alert .alert__container {
    opacity: 1;
    transform: translateY(0);
}
```

### Different ways to close an alert
The only ways for an alert to disapear are
- by user action (clicking a button or pressing escape)
- when the router swithes component
- when an other alert is called (which is probably not the best design)


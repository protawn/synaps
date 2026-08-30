# SynapsJS
A tiny reactive DOM micro engine with declarative animation support. Built by Protawn, it delivers maximum power with minimum footprint.

## Overview
SynapsJS binds JavaScript state directly to the DOM. When a state property changes, SynapsJS updates the DOM automatically. It can also animate those updates with precision.

- No templates.
- No directives.
- No virtual DOM.
- No build step.
- Just JavaScript.

SynapsJS is designed for developers who want reactive UI behavior without the weight of a full framework and value simplicity, readability, and ease of adoption.

## Key Features
### Reactive State
Assigning to `synaps.foo` automatically updates bound DOM elements.

```js
synaps.bind({ count: ".js-count" });
synaps.count = 42;
```

### Content Unchanged Guard
SynapsJS automatically skips DOM updates and animations when the new value is structurally identical to the previous value. This prevents flicker, double animations, and unnecessary work.

### Declarative Animation Pipeline
SynapsJS treats animation as a first-class feature.

**Code**
```
out -> swap -> in -> cleanup -> onComplete
```

**Supports:**
- CSS animation classes
- Custom JS animation functions
- GSAP
- Web Animations API
- Any animation library

Animations never run on initial assignment. They only run when content actually changes. Animation functions may be synchronous or asynchronous. SynapsJS awaits asynchronous animation functions such as those using the Web Animations API.

### Nested Update Helper
Preserves animation blocks when updating nested values.

```js
synaps.update("price", "text", "22.99");
```

### Computed Properties
Define reactive derived values.

```js
synaps.addComputed("total", s => s.qty * s.price, ["qty", "price"]);
```

### Validators
Enforce constraints on state values.

```js
synaps.addValidator("qty", v => v >= 0);
```

### Lifecycle Hooks
Minimal but powerful.

- `onBeforeMount`
- `onMounted`
- `onBeforeUpdate`
- `onUpdated`

### Abortable Fetch Hydration
Hydrate state directly from API responses.

```js
synaps.ajax.fetch("/api/data", { hydrate: true });
```

### Zero Dependencies
SynapsJS is about 200 lines of optimized JavaScript.

## Quick Start
### Include SynapsJS

```html
<script src="src/synaps.js"></script>
```

### Bind state to DOM

```js
synaps.bind({ status: ".js-status" });
```

### Update state

```js
synaps.status = "Loading...";
```

### Animate updates

```js
synaps.status = {
  text: "Updated",
  animate: {
    out: "anim-fadeOut",
    in: "anim-fadeIn",
    duration: 300,
    swap: "text"
  }
};
```

Animations will run only when the content changes.

### Animation Payload Structure

```js
animate: {
  out: "className" | function(el){...},
  in: "className" | function(el){...},
  duration: 300,
  delay: 0,
  easing: "ease",
  swap: "text" | "html" | "attrs" | "classes" | "styles",
  onComplete(el){ ... }
}
```

Animation functions may return a Promise. SynapsJS will await it.

### Swap Modes
swap | Behavior
--- | ---
text | updates textContent
html | updates innerHTML
attrs | sets or removes attributes
classes | toggles classes
styles | applies inline styles

## Examples
See the examples folder for standalone HTML files that follow the recommended pattern: stable initial object, nested updates, animation only on content change.

## How SynapsJS Compares
SynapsJS is not trying to replace React, Vue, or Svelte. It fills a gap they do not address: reactive DOM updates and animation control with almost no footprint.

### Compared to big frameworks
- They offer full component systems, routing, SSR, and tooling.
- SynapsJS offers reactive DOM and animation in under 5 kb.

### Compared to Alpine.js and Petite Vue
- They use HTML directives and templating.
- SynapsJS is pure JavaScript, smaller, and animation native.

### Compared to jQuery
- jQuery manipulates DOM manually.
- SynapsJS reactively updates DOM and animates changes.

**SynapsJS is not a framework. It is a micro engine.**

## Design Philosophy
Protawn builds software with a simple belief: maximum power, minimum footprint.

SynapsJS embodies that philosophy.

- Tiny, readable code
- Zero dependencies
- Zero magic
- Zero ceremony
- Predictable behavior
- Animation native design
- Approachable for newcomers
- Powerful for advanced developers

## Installation
### Manual
Copy `src/synaps.js` or `src/synaps.min.js` into your project.

## API Reference
### synaps.bind(map)
Bind state keys to CSS selectors.

### synaps.update(key, sub, val)
Nested update helper.

### synaps.addComputed(key, getter, deps)
Computed properties.

### synaps.addValidator(key, fn)
Validators.

### synaps.ajax.fetch(url, options, onError)
Abortable fetch hydration.

### Lifecycle Hooks
- `synaps.onBeforeMount(fn)`
- `synaps.onMounted(fn)`
- `synaps.onBeforeUpdate(fn)`
- `synaps.onUpdated(fn)`

### synaps.inject(key, value)
Internal injection for plugins.

### synaps.reset()
Reset SynapsJS to a clean state.

## Contributing
See `CONTRIBUTING.md` for guidelines.

## License
MIT. See `LICENSE`.

## Final Note
SynapsJS is intentionally small, intentionally simple, and intentionally powerful. It gives you reactive UI behavior and animation control without the weight of a framework and without asking you to learn anything beyond JavaScript.

**Built by Protawn. Made for developers. Approachable for everyone.**

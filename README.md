# SynapsJS
A tiny reactive DOM micro-engine with declarative animation and native event binding. Built by Protawn, SynapsJS delivers maximum power with minimum footprint. It's modern tool for developers who want reactive interfaces without the weight or ceremony of a framework.

## Overview
SynapsJS binds JavaScript state directly to the DOM and updates markup in response to API interactions. It does this without templates, without directives, without components, and without virtual DOM. Your HTML stays HTML. Your JavaScript stays JavaScript. The concerns remain permanently separated.

SynapsJS is designed for developers who want reactive UI behavior without adopting a framework, and who value clarity, simplicity, and true separation of concerns.

## What SynapsJS Solves
Modern UI tools claim to separate concerns, but they never truly do. Templates mix HTML and JavaScript. Directives mix HTML and JavaScript. Components mix HTML and JavaScript. Virtual DOM mixes HTML and JavaScript. Hydration mixes HTML and JavaScript.

SynapsJS finally achieves the separation that everyone talked about but never delivered.

SynapsJS updates markup in response to API data without re-rendering, without templating, and without embedding logic inside markup. Your HTML remains declarative. Your JavaScript remains imperative. The two never bleed into each other.

This makes SynapsJS ideal for API-driven interfaces, dashboards, forms, and SPAs that want perfect SEO because all markup is present at load.

## Key Features
### Reactive State
Assigning to `synaps.foo` automatically updates bound DOM elements.

```js
synaps.bind({ count: ".js-count" });
synaps.count = 42;
```

### Native Event Binding
Bind events to DOM selectors without touching the DOM directly. No queries, no boilerplate, no mixing concerns.

```js
synaps.bindEvents({ inc: "#inc" });
synaps.on("inc", "click", (el, evt) => {
  synaps.count++;
});
```

### Content Unchanged Guard
SynapsJS automatically skips DOM updates and animations when the new value is structurally identical to the previous value. This prevents flicker, double animations, and unnecessary work.

### True Separation of Concerns
SynapsJS keeps markup and logic permanently separate. HTML stays declarative. JavaScript stays imperative. No templates, no directives, no components, no virtual DOM.

### Declarative Animation Pipeline
SynapsJS includes a minimal animation pipeline that enhances API-driven UI updates. Animations never run on initial assignment and only run when content actually changes. Animation functions may be synchronous or asynchronous.

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
Minimal but powerful: `onBeforeMount`, `onMounted`, `onBeforeUpdate`, `onUpdated`.

### Abortable Fetch Hydration
Hydrate state directly from API responses.

```js
synaps.ajax.fetch("/api/data", { hydrate: true });
```

### Zero Dependencies
SynapsJS is roughly 300 lines of optimized JavaScript. No dependencies, no build step, no ceremony.

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

Animations run only when content changes.

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

Animation functions may return a Promise; SynapsJS will await it.

### Swap Modes
swap | Behavior
--- | ---
text | updates textContent
html | updates innerHTML
attrs | sets or removes attributes
classes | toggles classes
styles | applies inline styles

## Examples
Examples are published at:
[https://developer.protawn.com/projects/synaps](https://developer.protawn.com/projects/synaps)

## How SynapsJS Compares
SynapsJS is not trying to replace React, Vue, or Svelte. It fills a gap they do not address: updating markup in response to API data with perfect clarity and zero ceremony. SynapsJS does this without templates, without directives, without components, and without virtual DOM.

SynapsJS is not a framework. It is a micro-engine.

## Design Philosophy
Protawn builds software with a simple belief: maximum power, minimum footprint. SynapsJS embodies a principle that has been talked about for decades but never achieved: true separation of concerns between markup and logic.

SynapsJS is:
- Tiny
- Readable
- Dependency-free
- Predictable
- Animation-native
- Approachable for newcomers
- Powerful for advanced developers

## Installation
Manual installation: copy `synaps.js` or `synaps.min.js` into your project.

## API Reference
- `synaps.bind(map)` — bind state keys to CSS selectors
- `synaps.bindEvents(map)` — bind event targets to selectors
- `synaps.on(key, event, fn)` — attach event handlers
- `synaps.off(key, event)` — remove event handlers
- `synaps.update(key, sub, val)` — nested update helper
- `synaps.addComputed(key, getter, deps)` — computed properties
- `synaps.addValidator(key, fn)` — validators
- `synaps.ajax.fetch(url, options, onError)` — abortable fetch hydration
- `synaps.onBeforeMount(fn)` — lifecycle hook
- `synaps.onMounted(fn)` — lifecycle hook
- `synaps.onBeforeUpdate(fn)` — lifecycle hook
- `synaps.onUpdated(fn)` — lifecycle hook
- `synaps.inject(key, value)` — internal injection
- `synaps.reset()` — reset SynapsJS to a clean state

## Contributing
See `CONTRIBUTING.md` for guidelines.

## License
MIT. See `LICENSE`.

## Final Note
SynapsJS is intentionally small, intentionally simple, and intentionally powerful. It gives you reactive UI behavior and animation control without the weight of a framework and without asking you to learn anything beyond JavaScript.

Built by Protawn. Made for developers. Approachable for everyone.

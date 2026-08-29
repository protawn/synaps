# SynapsJS
A tiny reactive DOM micro-engine with declarative animation support. Built by Protawn, it delivers maximum power with minimum footprint.

## Overview
SynapsJS is a micro-framework that binds JavaScript state directly to the DOM. When a state property changes, SynapsJS updates the DOM automatically. It can also animate those updates with precision.

- No templates.
- No directives.
- No virtual DOM.
- No build step.
- Just JavaScript.

SynapsJS is designed for developers who want reactive UI behavior without the weight or ceremony of a full framework and value simplicity, readability and ease of adoption.

## Key Features
### Reactive State
Assigning to synaps.foo automatically updates bound DOM elements.

```js
synaps.bind({ count: ".js-count" });
synaps.count = 42;
```

### Declarative Animation Pipeline
SynapsJS treats animation as a first-class feature.

```
out → swap → in → cleanup → onComplete
```

**Supports:**

- CSS animation classes
- Custom JS animation functions
- GSAP
- Web Animations API
- Any animation library

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
Minimal but powerful:

- onBeforeMount
- onMounted
- onBeforeUpdate
- onUpdated

### Abortable Fetch Hydration
Hydrate state directly from API responses.

```js
synaps.ajax.fetch("/api/data", { hydrate: true });
```

### Zero Dependencies
SynapsJS is ~200 lines of pure JavaScript.

## Quick Start
1. Include SynapsJS

```html
<script src="src/synaps.js"></script>
```

2. Bind state to DOM

```js
synaps.bind({ status: ".js-status" });
```

3. Update state

```js
synaps.status = "Loading...";
```

4. Animate updates

```js
synaps.status = {
  text: "Updated!",
  animate: {
    out: "anim-fadeOut",
    in: "anim-fadeIn",
    duration: 300,
    swap: "text"
  }
};
```

## Animation Payload Structure

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

### Swap Modes
swap | Behavior
--- | ---
text | updates textContent
html | updates innerHTML
attrs | sets/removes attributes
classes | toggles classes
styles | applies inline styles

## Examples
See the examples/ folder for:

- Basic binding
- Animated updates
- GSAP integration
- Web Animations API
- Nested update helper

Each example is a standalone HTML file.

## How SynapsJS compares
SynapsJS isn’t trying to replace React, Vue, or Svelte. It fills a gap they don’t address: reactive DOM updates and animation control with almost no footprint.

### Compared to big frameworks (React / Vue / Svelte)
- They offer full component systems, routing, SSR, and tooling.
- SynapsJS offers reactive DOM + animation in ~4 kb.

### Compared to Alpine.js / Petite-Vue
- They use HTML directives and templating.
- SynapsJS is pure JavaScript, smaller, and animation-native.

### Compared to jQuery
- jQuery manipulates DOM manually.
- SynapsJS reactively updates DOM and animates changes.

**SynapsJS is not a framework — it’s a micro-engine.**

## Design Philosophy (Protawn)
Protawn builds software with a simple belief:

- Maximum power, minimum footprint.

SynapsJS embodies that philosophy:

- Tiny, readable code
- Zero dependencies
- Zero magic
- Zero ceremony
- Predictable behavior
- Animation-native design
- Approachable for newcomers
- Powerful for advanced developers

## Installation
### CDN (coming soon)
Will be available after public release.

### Manual
Copy src/synaps.js or src/synaps.min.js into your project.

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
- synaps.onBeforeMount(fn)
- synaps.onMounted(fn)
- synaps.onBeforeUpdate(fn)
- synaps.onUpdated(fn)

### synaps.inject(key, value)
Internal injection for plugins.

### synaps.reset()
Reset SynapsJS to a clean state.

## Roadmap
See ROADMAP.md for planned features, including:

- Plugin system
- Devtools inspector
- Optional component helpers
- Optional build pipeline
- CDN + NPM distribution

## Contributing
See CONTRIBUTING.md for guidelines.

## Security
See SECURITY.md for vulnerability reporting instructions.

## License
MIT — see LICENSE.

## Final Note
SynapsJS is intentionally small, intentionally simple, and intentionally powerful. It gives you reactive UI behavior and animation control without the weight of a framework — and without asking you to learn anything beyond JavaScript.

Built by Protawn. Made for developers. Approachable for everyone.

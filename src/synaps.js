/**
 * synaps — A tiny reactive DOM micro‑engine with declarative animation support.
 * Designed for maximum power with minimum footprint.
 * © 2026 Protawn — MIT License
 
 * Core Features:
 * - Reactive state via Proxy
 * - DOM binding (state → selector)
 * - Declarative animation pipeline (out → swap → in → cleanup)
 * - Computed properties
 * - Validators
 * - Lifecycle hooks
 * - Nested update helper
 * - Abortable fetch hydration
 * - Plugin injection
 *
 * No templates. No directives. No virtual DOM. No build step.
 * Just JavaScript.
 */

let synaps = {};

(() => {

  // ---------------------------------------------------------------------------
  // Internal State
  // ---------------------------------------------------------------------------

  const bindings = new Map();      // key → CSS selector
  const handler = {
    previousState: {},
    isExecuting: false,
    pendingDOMUpdates: [],
    rafScheduled: false,

    computed: {},                  // key → { getter, dependencies }
    validators: {},                // key → validator function

    lifecycle: {
      beforeMount: [],
      mounted: [],
      beforeUpdate: [],
      updated: []
    },

    dependencies: {},
    errorHandler: null,

    // -------------------------------------------------------------------------
    // Bind state keys to DOM selectors
    // -------------------------------------------------------------------------
    bind(map) {
      if (!map || typeof map !== "object") return;
      for (const k in map) bindings.set(k, map[k]);
    },

    // -------------------------------------------------------------------------
    // Batch DOM updates using requestAnimationFrame
    // -------------------------------------------------------------------------
    scheduleDOMUpdate(fn) {
      this.pendingDOMUpdates.push(fn);

      if (!this.rafScheduled) {
        this.rafScheduled = true;

        requestAnimationFrame(() => {
          const queue = this.pendingDOMUpdates.slice();
          this.pendingDOMUpdates.length = 0;
          this.rafScheduled = false;

          for (const f of queue) f();
        });
      }
    },

    // -------------------------------------------------------------------------
    // Update DOM elements bound to a selector
    // Supports:
    // - Simple text/number payloads
    // - Structured payloads (text, html, attrs, classes, styles)
    // - Declarative animation pipeline
    // -------------------------------------------------------------------------
    updateDOM(selector, payload) {
      if (typeof selector !== "string") return;

      const els = document.querySelectorAll(selector);
      if (!els.length) return;

      this.scheduleDOMUpdate(() => {
        els.forEach(el => {
          if (payload == null) return;

          // ---------------------------------------------------------------
          // Animated payload
          // ---------------------------------------------------------------
          if (payload.animate) {
            const a = payload.animate;

            const out = a.out || null;
            const inn = a.in || null;
            const dur = a.duration || 300;
            const del = a.delay || 0;
            const ease = a.easing || "ease";
            const swap = a.swap || "text";
            const done = a.onComplete || null;

            el.style.animationDuration = dur + "ms";
            el.style.animationDelay = del + "ms";
            el.style.animationTimingFunction = ease;

            // Apply "out" animation
            if (typeof out === "string") el.classList.add("anim", out);
            else if (typeof out === "function") out(el);

            el.addEventListener("animationend", function hOut() {
              el.removeEventListener("animationend", hOut);

              // Swap content
              if (swap === "text" && payload.text !== undefined) el.textContent = payload.text;
              if (swap === "html" && payload.html !== undefined) el.innerHTML = payload.html;

              if (swap === "attrs" && payload.attrs)
                for (const n in payload.attrs) {
                  const v = payload.attrs[n];
                  v == null ? el.removeAttribute(n) : el.setAttribute(n, v);
                }

              if (swap === "classes" && payload.classes)
                for (const n in payload.classes) el.classList.toggle(n, !!payload.classes[n]);

              if (swap === "styles" && payload.styles)
                for (const n in payload.styles) el.style[n] = payload.styles[n];

              // Remove "out" animation class
              if (typeof out === "string") el.classList.remove(out);

              // Apply "in" animation
              if (typeof inn === "string") el.classList.add(inn);
              else if (typeof inn === "function") inn(el);

              el.addEventListener("animationend", function hIn() {
                el.removeEventListener("animationend", hIn);

                // Cleanup animation styles
                el.style.animationDuration = "";
                el.style.animationDelay = "";
                el.style.animationTimingFunction = "";

                if (typeof inn === "string") el.classList.remove(inn);
                if (typeof done === "function") done(el);
              });
            });

            return;
          }

          // ---------------------------------------------------------------
          // Simple payload (string or number)
          // ---------------------------------------------------------------
          if (typeof payload === "string" || typeof payload === "number") {
            el.textContent = payload;
            return;
          }

          // ---------------------------------------------------------------
          // Structured payload
          // ---------------------------------------------------------------
          if (payload.text !== undefined) el.textContent = payload.text;
          if (payload.html !== undefined) el.innerHTML = payload.html;

          if (payload.attrs)
            for (const n in payload.attrs) {
              const v = payload.attrs[n];
              v == null ? el.removeAttribute(n) : el.setAttribute(n, v);
            }

          if (payload.classes)
            for (const n in payload.classes) el.classList.toggle(n, !!payload.classes[n]);

          if (payload.styles)
            for (const n in payload.styles) el.style[n] = payload.styles[n];
        });
      });
    },

    // -------------------------------------------------------------------------
    // Run effect functions safely (prevent infinite loops)
    // -------------------------------------------------------------------------
    runEffect(fn) {
      if (typeof fn !== "function") return;

      if (this.isExecuting) {
        console.warn("Potential infinite loop detected. Effect skipped.");
        return;
      }

      this.isExecuting = true;
      try { fn() } finally { this.isExecuting = false }
    },

    // -------------------------------------------------------------------------
    // Create an abortable fetch wrapper
    // -------------------------------------------------------------------------
    createAbortableFetch() {
      const c = new AbortController();
      const f = url => fetch(url, { signal: c.signal }).then(r => r.json());
      f.abort = () => c.abort();
      return f;
    },

    // -------------------------------------------------------------------------
    // Proxy setter — the heart of synaps
    // Handles:
    // - DOM updates
    // - Computed properties
    // - Validators
    // - Lifecycle hooks
    // - Effects
    // -------------------------------------------------------------------------
    set(target, prop, val) {
      const old = target[prop];
      target[prop] = val;

      if (old === val) return true;

      // Validators
      const validator = this.validators[prop];
      if (validator && !validator(val)) {
        console.warn(`Validation failed for "${prop}"`);
        return true;
      }

      // Computed properties
      for (const [key, fn] of Object.entries(handler.computed)) {
        if (fn.dependencies.includes(prop)) {
          target[key] = fn.getter(target);
        }
      }

      // DOM binding
      const sel = bindings.get(prop);
      if (sel) this.updateDOM(sel, val);

      // Effects
      if (typeof val === "function") this.runEffect(val);
      else if (val && typeof val.perform === "function") this.runEffect(val.perform);

      this.previousState[prop] = val;
      return true;
    }
  };

  // Wrap synaps in Proxy
  synaps = new Proxy(synaps, handler);

  // ---------------------------------------------------------------------------
  // AJAX helper
  // ---------------------------------------------------------------------------
  synaps.ajax = {
    fetch(url, opt = {}, onErr) {
      const f = handler.createAbortableFetch();

      f(url)
        .then(data => {
          if (opt.hydrate) {
            for (const k in data) synaps[k] = data[k];
          } else if (typeof opt.onData === "function") {
            opt.onData(data, synaps);
          }
        })
        .catch(err => {
          if (typeof onErr === "function") onErr(err, synaps);
        });

      return f;
    }
  };

  // ---------------------------------------------------------------------------
  // Nested update helper — preserves animation blocks
  // ---------------------------------------------------------------------------
  synaps.update = function(key, sub, val) {
    const old = synaps[key] || {};
    const obj = { ...old, [sub]: val };

    if (old.animate) obj.animate = old.animate;
    synaps[key] = obj;
  };

  // ---------------------------------------------------------------------------
  // Public API bindings
  // ---------------------------------------------------------------------------
  synaps.bind = handler.bind.bind(handler);

  synaps.addComputed = function(key, getter, dependencies) {
    handler.computed[key] = { getter, dependencies };
  };

  synaps.addValidator = function(key, validator) {
    handler.validators[key] = validator;
  };

  synaps.onBeforeMount = fn => handler.lifecycle.beforeMount.push(fn);
  synaps.onMounted     = fn => handler.lifecycle.mounted.push(fn);
  synaps.onBeforeUpdate = fn => handler.lifecycle.beforeUpdate.push(fn);
  synaps.onUpdated      = fn => handler.lifecycle.updated.push(fn);

  synaps.setErrorHandler = fn => handler.errorHandler = fn;

  synaps.inject = function(key, value) {
    handler[key] = value;
  };

  // ---------------------------------------------------------------------------
  // Reset synaps to a clean state
  // ---------------------------------------------------------------------------
  synaps.reset = function() {
    handler.previousState = {};
    handler.isExecuting = false;
    handler.pendingDOMUpdates = [];
    handler.rafScheduled = false;
    handler.computed = {};
    handler.validators = {};
    handler.lifecycle = {
      beforeMount: [],
      mounted: [],
      beforeUpdate: [],
      updated: []
    };
    handler.dependencies = {};
    handler.errorHandler = null;

    synaps = new Proxy(synaps, handler);
  };

})();

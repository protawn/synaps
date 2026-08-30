/**
 * SynapsJS — Optimized Full Build
 * Tiny reactive DOM micro-engine with declarative animation support.
 * © 2026 Protawn — MIT License
 */

let synaps = {};

(() => {

  const bindings = new Map();

  const handler = {
    previousState: {},
    isExecuting: !1,
    pendingDOMUpdates: [],
    rafScheduled: !1,
    computed: {},
    validators: {},
    lifecycle: { beforeMount: [], mounted: [], beforeUpdate: [], updated: [] },
    dependencies: {},
    errorHandler: null,

    // Event system
    eventBindings: new Map(),
    eventListeners: new Map(),

    // Unified shallow comparison
    same(o, n) {
      if (!o || !n || typeof o !== "object" || typeof n !== "object") return !1;
      if (o.text !== n.text || o.html !== n.html) return !1;

      const cmp = (a, b) => {
        if (!a && !b) return !0;
        if (!a || !b) return !1;
        const ak = Object.keys(a), bk = Object.keys(b);
        if (ak.length !== bk.length) return !1;
        for (const k of ak) if (a[k] !== b[k]) return !1;
        return !0;
      };

      return cmp(o.attrs, n.attrs) &&
             cmp(o.classes, n.classes) &&
             cmp(o.styles, n.styles);
    },

    bind(map) {
      if (!map || typeof map !== "object") return;
      for (const k in map) bindings.set(k, map[k]);
    },

    bindEvents(map) {
      if (!map || typeof map !== "object") return;
      for (const key in map) {
        this.eventBindings.set(key, map[key]);
      }
    },

    scheduleDOMUpdate(fn) {
      this.pendingDOMUpdates.push(fn);
      if (!this.rafScheduled) {
        this.rafScheduled = !0;
        requestAnimationFrame(() => {
          const q = this.pendingDOMUpdates.slice();
          this.pendingDOMUpdates.length = 0;
          this.rafScheduled = !1;
          for (const f of q) f();
        });
      }
    },
    updateDOM(sel, p) {
      if (typeof sel !== "string") return;
      const els = document.querySelectorAll(sel);
      if (!els.length) return;

      this.scheduleDOMUpdate(() => {

        els.forEach(el => {
          if (p == null) return;

          // Animation block
          if (p.animate) {
            const a = p.animate,
                  out = a.out || null,
                  inn = a.in || null,
                  dur = a.duration || 300,
                  del = a.delay || 0,
                  ease = a.easing || "ease",
                  swap = a.swap || "text",
                  done = a.onComplete || null;

            el.style.animationDuration = dur + "ms";
            el.style.animationDelay = del + "ms";
            el.style.animationTimingFunction = ease;

            if (typeof out === "string") el.classList.add("anim", out);
            else if (typeof out === "function") out(el);

            el.addEventListener("animationend", function h() {
              el.removeEventListener("animationend", h);

              if (swap === "text" && p.text !== undefined) el.textContent = p.text;
              if (swap === "html" && p.html !== undefined) el.innerHTML = p.html;

              if (swap === "attrs" && p.attrs)
                for (const k in p.attrs) {
                  const v = p.attrs[k];
                  v == null ? el.removeAttribute(k) : el.setAttribute(k, v);
                }

              if (swap === "classes" && p.classes)
                for (const k in p.classes) el.classList.toggle(k, !!p.classes[k]);

              if (swap === "styles" && p.styles)
                for (const k in p.styles) el.style[k] = p.styles[k];

              if (typeof out === "string") el.classList.remove(out);

              if (typeof inn === "string") el.classList.add(inn);
              else if (typeof inn === "function") inn(el);

              el.addEventListener("animationend", function h2() {
                el.removeEventListener("animationend", h2);
                el.style.animationDuration = "";
                el.style.animationDelay = "";
                el.style.animationTimingFunction = "";
                if (typeof inn === "string") el.classList.remove(inn);
                if (typeof done === "function") done(el);
              });
            });

            return;
          }

          // Simple payload
          if (typeof p === "string" || typeof p === "number") {
            el.textContent = p;
            return;
          }

          // Structured payload
          if (p.text !== undefined) el.textContent = p.text;
          if (p.html !== undefined) el.innerHTML = p.html;

          if (p.attrs)
            for (const k in p.attrs) {
              const v = p.attrs[k];
              v == null ? el.removeAttribute(k) : el.setAttribute(k, v);
            }

          if (p.classes)
            for (const k in p.classes) el.classList.toggle(k, !!p.classes[k]);

          if (p.styles)
            for (const k in p.styles) el.style[k] = p.styles[k];
        });

      });
    },

    runEffect(fn) {
      if (typeof fn !== "function") return;
      if (this.isExecuting) {
        console.warn("Potential infinite loop detected. Effect skipped.");
        return;
      }
      this.isExecuting = !0;
      try { fn() } finally { this.isExecuting = !1 }
    },

    createAbortableFetch() {
      const c = new AbortController();
      const f = u => fetch(u, { signal: c.signal }).then(r => r.json());
      f.abort = () => c.abort();
      return f;
    },

    set(target, prop, val) {
      const old = target[prop];
      target[prop] = val;

      // Primitive equality
      if (old === val) return !0;

      // Shallow content equality
      if (typeof old === "object" && typeof val === "object" && this.same(old, val))
        return !0;

      // Validator
      const v = this.validators[prop];
      if (v && !v(val)) {
        console.warn(`Validation failed for "${prop}"`);
        return !0;
      }

      // Computed
      for (const k in this.computed) {
        const c = this.computed[k];
        if (c.dependencies && c.dependencies.includes(prop))
          target[k] = c.getter(target);
      }

      // DOM binding
      const sel = bindings.get(prop);
      if (sel) this.updateDOM(sel, val);

      // Effects
      if (typeof val === "function") this.runEffect(val);
      else if (val && typeof val.perform === "function") this.runEffect(val.perform);

      this.previousState[prop] = val;
      return !0;
    },
    // Event binding
    on(key, event, handlerFn) {
      const sel = this.eventBindings.get(key);
      if (!sel) return;

      const els = document.querySelectorAll(sel);
      if (!els.length) return;

      const records = [];

      els.forEach(el => {
        const wrapped = evt => handlerFn(el, evt);
        el.addEventListener(event, wrapped);
        records.push({ el, event, wrapped });
      });

      this.eventListeners.set(key, records);
    },

    off(key, event) {
      const records = this.eventListeners.get(key);
      if (!records) return;

      records.forEach(r => {
        if (r.event === event) {
          r.el.removeEventListener(r.event, r.wrapped);
        }
      });

      this.eventListeners.set(
        key,
        records.filter(r => r.event !== event)
      );
    }
  };

  synaps = new Proxy(synaps, handler);

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

  synaps.update = function (key, sub, val) {
    const old = synaps[key] || {};
    const obj = { ...old, [sub]: val };
    if (old.animate) obj.animate = old.animate;
    synaps[key] = obj;
  };

  synaps.bind = handler.bind.bind(handler);
  synaps.bindEvents = handler.bindEvents.bind(handler);
  synaps.on = handler.on.bind(handler);
  synaps.off = handler.off.bind(handler);

  synaps.addComputed = (k, g, d) => handler.computed[k] = { getter: g, dependencies: d };
  synaps.addValidator = (k, v) => handler.validators[k] = v;

  synaps.onBeforeMount = f => handler.lifecycle.beforeMount.push(f);
  synaps.onMounted = f => handler.lifecycle.mounted.push(f);
  synaps.onBeforeUpdate = f => handler.lifecycle.beforeUpdate.push(f);
  synaps.onUpdated = f => handler.lifecycle.updated.push(f);

  synaps.setErrorHandler = f => handler.errorHandler = f;
  synaps.inject = (k, v) => handler[k] = v;
  synaps.reset = function () {

    // Clear previous state
    handler.previousState = {};
    handler.isExecuting = !1;
    handler.pendingDOMUpdates = [];
    handler.rafScheduled = !1;

    // Clear computed + validators
    handler.computed = {};
    handler.validators = {};

    // Clear lifecycle hooks
    handler.lifecycle = {
      beforeMount: [],
      mounted: [],
      beforeUpdate: [],
      updated: []
    };

    handler.dependencies = {};
    handler.errorHandler = null;

    // Remove all event listeners
    for (const [key, records] of handler.eventListeners) {
      records.forEach(r => {
        r.el.removeEventListener(r.event, r.wrapped);
      });
    }

    handler.eventListeners.clear();
    handler.eventBindings.clear();

    // Re-proxy synaps
    synaps = new Proxy(synaps, handler);
  };

})();

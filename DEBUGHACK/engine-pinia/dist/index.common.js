/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 959:
/***/ ((__unused_webpack_module, exports) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
// runtime helper for setting properties on components
// in a tree-shakable way
exports.Z = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
        target[key] = val;
    }
    return target;
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  ImageSetLayerState: () => (/* reexport */ ImageSetLayerState),
  ImagesetInfo: () => (/* reexport */ ImagesetInfo),
  SpreadSheetLayerInfo: () => (/* reexport */ SpreadSheetLayerInfo),
  WWTAwareComponent: () => (/* reexport */ WWTAwareComponent),
  WWTComponent: () => (/* reexport */ Component),
  engineStore: () => (/* reexport */ engineStore),
  wwtPinia: () => (/* reexport */ wwtPinia)
});

;// CONCATENATED MODULE: ../node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
/* eslint-disable no-var */
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var currentScript = window.document.currentScript
  if (false) { var getCurrentScript; }

  var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)
  if (src) {
    __webpack_require__.p = src[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ const setPublicPath = (null);

;// CONCATENATED MODULE: external {"commonjs":"vue","commonjs2":"vue","root":"Vue"}
const external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject = require("vue");
;// CONCATENATED MODULE: ../node_modules/vue-demi/lib/index.mjs


var lib_isVue2 = false
var isVue3 = true
var Vue2 = (/* unused pure expression or super */ null && (undefined))

function install() {}

function lib_set(target, key, val) {
  if (Array.isArray(target)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  target[key] = val
  return val
}

function del(target, key) {
  if (Array.isArray(target)) {
    target.splice(key, 1)
    return
  }
  delete target[key]
}




;// CONCATENATED MODULE: ../node_modules/@vue/devtools-api/lib/esm/env.js
function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
}
function getTarget() {
    // @ts-ignore
    return (typeof navigator !== 'undefined' && typeof window !== 'undefined')
        ? window
        : typeof __webpack_require__.g !== 'undefined'
            ? __webpack_require__.g
            : {};
}
const isProxyAvailable = typeof Proxy === 'function';

;// CONCATENATED MODULE: ../node_modules/@vue/devtools-api/lib/esm/const.js
const HOOK_SETUP = 'devtools-plugin:setup';
const HOOK_PLUGIN_SETTINGS_SET = 'plugin:settings:set';

;// CONCATENATED MODULE: ../node_modules/@vue/devtools-api/lib/esm/time.js
let supported;
let perf;
function isPerformanceSupported() {
    var _a;
    if (supported !== undefined) {
        return supported;
    }
    if (typeof window !== 'undefined' && window.performance) {
        supported = true;
        perf = window.performance;
    }
    else if (typeof __webpack_require__.g !== 'undefined' && ((_a = __webpack_require__.g.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
        supported = true;
        perf = __webpack_require__.g.perf_hooks.performance;
    }
    else {
        supported = false;
    }
    return supported;
}
function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
}

;// CONCATENATED MODULE: ../node_modules/@vue/devtools-api/lib/esm/proxy.js


class ApiProxy {
    constructor(plugin, hook) {
        this.target = null;
        this.targetQueue = [];
        this.onQueue = [];
        this.plugin = plugin;
        this.hook = hook;
        const defaultSettings = {};
        if (plugin.settings) {
            for (const id in plugin.settings) {
                const item = plugin.settings[id];
                defaultSettings[id] = item.defaultValue;
            }
        }
        const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
        let currentSettings = Object.assign({}, defaultSettings);
        try {
            const raw = localStorage.getItem(localSettingsSaveId);
            const data = JSON.parse(raw);
            Object.assign(currentSettings, data);
        }
        catch (e) {
            // noop
        }
        this.fallbacks = {
            getSettings() {
                return currentSettings;
            },
            setSettings(value) {
                try {
                    localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
                }
                catch (e) {
                    // noop
                }
                currentSettings = value;
            },
            now() {
                return now();
            },
        };
        if (hook) {
            hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
                if (pluginId === this.plugin.id) {
                    this.fallbacks.setSettings(value);
                }
            });
        }
        this.proxiedOn = new Proxy({}, {
            get: (_target, prop) => {
                if (this.target) {
                    return this.target.on[prop];
                }
                else {
                    return (...args) => {
                        this.onQueue.push({
                            method: prop,
                            args,
                        });
                    };
                }
            },
        });
        this.proxiedTarget = new Proxy({}, {
            get: (_target, prop) => {
                if (this.target) {
                    return this.target[prop];
                }
                else if (prop === 'on') {
                    return this.proxiedOn;
                }
                else if (Object.keys(this.fallbacks).includes(prop)) {
                    return (...args) => {
                        this.targetQueue.push({
                            method: prop,
                            args,
                            resolve: () => { },
                        });
                        return this.fallbacks[prop](...args);
                    };
                }
                else {
                    return (...args) => {
                        return new Promise(resolve => {
                            this.targetQueue.push({
                                method: prop,
                                args,
                                resolve,
                            });
                        });
                    };
                }
            },
        });
    }
    async setRealTarget(target) {
        this.target = target;
        for (const item of this.onQueue) {
            this.target.on[item.method](...item.args);
        }
        for (const item of this.targetQueue) {
            item.resolve(await this.target[item.method](...item.args));
        }
    }
}

;// CONCATENATED MODULE: ../node_modules/@vue/devtools-api/lib/esm/index.js






function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
        hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    }
    else {
        const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
        const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
        list.push({
            pluginDescriptor: descriptor,
            setupFn,
            proxy,
        });
        if (proxy)
            setupFn(proxy.proxiedTarget);
    }
}

;// CONCATENATED MODULE: ../node_modules/pinia/dist/pinia.mjs
/*!
 * pinia v2.1.6
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */



/**
 * setActivePinia must be called to handle SSR at the top of functions like
 * `fetch`, `setup`, `serverPrefetch` and others
 */
let activePinia;
/**
 * Sets or unsets the active pinia. Used in SSR and internally when calling
 * actions and getters
 *
 * @param pinia - Pinia instance
 */
// @ts-expect-error: cannot constrain the type of the return
const setActivePinia = (pinia) => (activePinia = pinia);
/**
 * Get the currently active pinia if there is any.
 */
const getActivePinia = () => (hasInjectionContext() && inject(piniaSymbol)) || activePinia;
const piniaSymbol = (( false) ? 0 : /* istanbul ignore next */ Symbol());

function isPlainObject(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
o) {
    return (o &&
        typeof o === 'object' &&
        Object.prototype.toString.call(o) === '[object Object]' &&
        typeof o.toJSON !== 'function');
}
// type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> }
// TODO: can we change these to numbers?
/**
 * Possible types for SubscriptionCallback
 */
var MutationType;
(function (MutationType) {
    /**
     * Direct mutation of the state:
     *
     * - `store.name = 'new name'`
     * - `store.$state.name = 'new name'`
     * - `store.list.push('new item')`
     */
    MutationType["direct"] = "direct";
    /**
     * Mutated the state with `$patch` and an object
     *
     * - `store.$patch({ name: 'newName' })`
     */
    MutationType["patchObject"] = "patch object";
    /**
     * Mutated the state with `$patch` and a function
     *
     * - `store.$patch(state => state.name = 'newName')`
     */
    MutationType["patchFunction"] = "patch function";
    // maybe reset? for $state = {} and $reset
})(MutationType || (MutationType = {}));

const IS_CLIENT = typeof window !== 'undefined';
/**
 * Should we add the devtools plugins.
 * - only if dev mode or forced through the prod devtools flag
 * - not in test
 * - only if window exists (could change in the future)
 */
const USE_DEVTOOLS =  false && 0;

/*
 * FileSaver.js A saveAs() FileSaver implementation.
 *
 * Originally by Eli Grey, adapted as an ESM module by Eduardo San Martin
 * Morote.
 *
 * License : MIT
 */
// The one and only way of getting global scope in all environments
// https://stackoverflow.com/q/3277182/1008999
const _global = /*#__PURE__*/ (() => typeof window === 'object' && window.window === window
    ? window
    : typeof self === 'object' && self.self === self
        ? self
        : typeof global === 'object' && global.global === global
            ? global
            : typeof globalThis === 'object'
                ? globalThis
                : { HTMLElement: null })();
function bom(blob, { autoBom = false } = {}) {
    // prepend BOM for UTF-8 XML and text/* types (including HTML)
    // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
    if (autoBom &&
        /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
        return new Blob([String.fromCharCode(0xfeff), blob], { type: blob.type });
    }
    return blob;
}
function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function () {
        console.error('could not download file');
    };
    xhr.send();
}
function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    // use sync to avoid popup blocker
    xhr.open('HEAD', url, false);
    try {
        xhr.send();
    }
    catch (e) { }
    return xhr.status >= 200 && xhr.status <= 299;
}
// `a.click()` doesn't work for all browsers (#465)
function click(node) {
    try {
        node.dispatchEvent(new MouseEvent('click'));
    }
    catch (e) {
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
        node.dispatchEvent(evt);
    }
}
const _navigator = 
 typeof navigator === 'object' ? navigator : { userAgent: '' };
// Detect WebView inside a native macOS app by ruling out all browsers
// We just need to check for 'Safari' because all other browsers (besides Firefox) include that too
// https://www.whatismybrowser.com/guides/the-latest-user-agent/macos
const isMacOSWebView = /*#__PURE__*/ (() => /Macintosh/.test(_navigator.userAgent) &&
    /AppleWebKit/.test(_navigator.userAgent) &&
    !/Safari/.test(_navigator.userAgent))();
const saveAs = !IS_CLIENT
    ? () => { } // noop
    : // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
        typeof HTMLAnchorElement !== 'undefined' &&
            'download' in HTMLAnchorElement.prototype &&
            !isMacOSWebView
            ? downloadSaveAs
            : // Use msSaveOrOpenBlob as a second approach
                'msSaveOrOpenBlob' in _navigator
                    ? msSaveAs
                    : // Fallback to using FileReader and a popup
                        fileSaverSaveAs;
function downloadSaveAs(blob, name = 'download', opts) {
    const a = document.createElement('a');
    a.download = name;
    a.rel = 'noopener'; // tabnabbing
    // TODO: detect chrome extensions & packaged apps
    // a.target = '_blank'
    if (typeof blob === 'string') {
        // Support regular links
        a.href = blob;
        if (a.origin !== location.origin) {
            if (corsEnabled(a.href)) {
                download(blob, name, opts);
            }
            else {
                a.target = '_blank';
                click(a);
            }
        }
        else {
            click(a);
        }
    }
    else {
        // Support blobs
        a.href = URL.createObjectURL(blob);
        setTimeout(function () {
            URL.revokeObjectURL(a.href);
        }, 4e4); // 40s
        setTimeout(function () {
            click(a);
        }, 0);
    }
}
function msSaveAs(blob, name = 'download', opts) {
    if (typeof blob === 'string') {
        if (corsEnabled(blob)) {
            download(blob, name, opts);
        }
        else {
            const a = document.createElement('a');
            a.href = blob;
            a.target = '_blank';
            setTimeout(function () {
                click(a);
            });
        }
    }
    else {
        // @ts-ignore: works on windows
        navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
}
function fileSaverSaveAs(blob, name, opts, popup) {
    // Open a popup immediately do go around popup blocker
    // Mostly only available on user interaction and the fileReader is async so...
    popup = popup || open('', '_blank');
    if (popup) {
        popup.document.title = popup.document.body.innerText = 'downloading...';
    }
    if (typeof blob === 'string')
        return download(blob, name, opts);
    const force = blob.type === 'application/octet-stream';
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || 'safari' in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || (force && isSafari) || isMacOSWebView) &&
        typeof FileReader !== 'undefined') {
        // Safari doesn't allow downloading of blob URLs
        const reader = new FileReader();
        reader.onloadend = function () {
            let url = reader.result;
            if (typeof url !== 'string') {
                popup = null;
                throw new Error('Wrong reader.result type');
            }
            url = isChromeIOS
                ? url
                : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
            if (popup) {
                popup.location.href = url;
            }
            else {
                location.assign(url);
            }
            popup = null; // reverse-tabnabbing #460
        };
        reader.readAsDataURL(blob);
    }
    else {
        const url = URL.createObjectURL(blob);
        if (popup)
            popup.location.assign(url);
        else
            location.href = url;
        popup = null; // reverse-tabnabbing #460
        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 4e4); // 40s
    }
}

/**
 * Shows a toast or console.log
 *
 * @param message - message to log
 * @param type - different color of the tooltip
 */
function toastMessage(message, type) {
    const piniaMessage = '🍍 ' + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === 'function') {
        // No longer available :(
        __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    }
    else if (type === 'error') {
        console.error(piniaMessage);
    }
    else if (type === 'warn') {
        console.warn(piniaMessage);
    }
    else {
        console.log(piniaMessage);
    }
}
function isPinia(o) {
    return '_a' in o && 'install' in o;
}

/**
 * This file contain devtools actions, they are not Pinia actions.
 */
// ---
function checkClipboardAccess() {
    if (!('clipboard' in navigator)) {
        toastMessage(`Your browser doesn't support the Clipboard API`, 'error');
        return true;
    }
}
function checkNotFocusedError(error) {
    if (error instanceof Error &&
        error.message.toLowerCase().includes('document is not focused')) {
        toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', 'warn');
        return true;
    }
    return false;
}
async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
        return;
    try {
        await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
        toastMessage('Global state copied to clipboard.');
    }
    catch (error) {
        if (checkNotFocusedError(error))
            return;
        toastMessage(`Failed to serialize the state. Check the console for more details.`, 'error');
        console.error(error);
    }
}
async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
        return;
    try {
        loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
        toastMessage('Global state pasted from clipboard.');
    }
    catch (error) {
        if (checkNotFocusedError(error))
            return;
        toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, 'error');
        console.error(error);
    }
}
async function actionGlobalSaveState(pinia) {
    try {
        saveAs(new Blob([JSON.stringify(pinia.state.value)], {
            type: 'text/plain;charset=utf-8',
        }), 'pinia-state.json');
    }
    catch (error) {
        toastMessage(`Failed to export the state as JSON. Check the console for more details.`, 'error');
        console.error(error);
    }
}
let fileInput;
function getFileOpener() {
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
    }
    function openFile() {
        return new Promise((resolve, reject) => {
            fileInput.onchange = async () => {
                const files = fileInput.files;
                if (!files)
                    return resolve(null);
                const file = files.item(0);
                if (!file)
                    return resolve(null);
                return resolve({ text: await file.text(), file });
            };
            // @ts-ignore: TODO: changed from 4.3 to 4.4
            fileInput.oncancel = () => resolve(null);
            fileInput.onerror = reject;
            fileInput.click();
        });
    }
    return openFile;
}
async function actionGlobalOpenStateFile(pinia) {
    try {
        const open = getFileOpener();
        const result = await open();
        if (!result)
            return;
        const { text, file } = result;
        loadStoresState(pinia, JSON.parse(text));
        toastMessage(`Global state imported from "${file.name}".`);
    }
    catch (error) {
        toastMessage(`Failed to import the state from JSON. Check the console for more details.`, 'error');
        console.error(error);
    }
}
function loadStoresState(pinia, state) {
    for (const key in state) {
        const storeState = pinia.state.value[key];
        if (storeState) {
            Object.assign(storeState, state[key]);
        }
    }
}

function formatDisplay(display) {
    return {
        _custom: {
            display,
        },
    };
}
const PINIA_ROOT_LABEL = '🍍 Pinia (root)';
const PINIA_ROOT_ID = '_root';
function formatStoreForInspectorTree(store) {
    return isPinia(store)
        ? {
            id: PINIA_ROOT_ID,
            label: PINIA_ROOT_LABEL,
        }
        : {
            id: store.$id,
            label: store.$id,
        };
}
function formatStoreForInspectorState(store) {
    if (isPinia(store)) {
        const storeNames = Array.from(store._s.keys());
        const storeMap = store._s;
        const state = {
            state: storeNames.map((storeId) => ({
                editable: true,
                key: storeId,
                value: store.state.value[storeId],
            })),
            getters: storeNames
                .filter((id) => storeMap.get(id)._getters)
                .map((id) => {
                const store = storeMap.get(id);
                return {
                    editable: false,
                    key: id,
                    value: store._getters.reduce((getters, key) => {
                        getters[key] = store[key];
                        return getters;
                    }, {}),
                };
            }),
        };
        return state;
    }
    const state = {
        state: Object.keys(store.$state).map((key) => ({
            editable: true,
            key,
            value: store.$state[key],
        })),
    };
    // avoid adding empty getters
    if (store._getters && store._getters.length) {
        state.getters = store._getters.map((getterName) => ({
            editable: false,
            key: getterName,
            value: store[getterName],
        }));
    }
    if (store._customProperties.size) {
        state.customProperties = Array.from(store._customProperties).map((key) => ({
            editable: true,
            key,
            value: store[key],
        }));
    }
    return state;
}
function formatEventData(events) {
    if (!events)
        return {};
    if (Array.isArray(events)) {
        // TODO: handle add and delete for arrays and objects
        return events.reduce((data, event) => {
            data.keys.push(event.key);
            data.operations.push(event.type);
            data.oldValue[event.key] = event.oldValue;
            data.newValue[event.key] = event.newValue;
            return data;
        }, {
            oldValue: {},
            keys: [],
            operations: [],
            newValue: {},
        });
    }
    else {
        return {
            operation: formatDisplay(events.type),
            key: formatDisplay(events.key),
            oldValue: events.oldValue,
            newValue: events.newValue,
        };
    }
}
function formatMutationType(type) {
    switch (type) {
        case MutationType.direct:
            return 'mutation';
        case MutationType.patchFunction:
            return '$patch';
        case MutationType.patchObject:
            return '$patch';
        default:
            return 'unknown';
    }
}

// timeline can be paused when directly changing the state
let isTimelineActive = true;
const componentStateTypes = [];
const MUTATIONS_LAYER_ID = 'pinia:mutations';
const INSPECTOR_ID = 'pinia';
const { assign: assign$1 } = Object;
/**
 * Gets the displayed name of a store in devtools
 *
 * @param id - id of the store
 * @returns a formatted string
 */
const getStoreType = (id) => '🍍 ' + id;
/**
 * Add the pinia plugin without any store. Allows displaying a Pinia plugin tab
 * as soon as it is added to the application.
 *
 * @param app - Vue application
 * @param pinia - pinia instance
 */
function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
        id: 'dev.esm.pinia',
        label: 'Pinia 🍍',
        logo: 'https://pinia.vuejs.org/logo.svg',
        packageName: 'pinia',
        homepage: 'https://pinia.vuejs.org',
        componentStateTypes,
        app,
    }, (api) => {
        if (typeof api.now !== 'function') {
            toastMessage('You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.');
        }
        api.addTimelineLayer({
            id: MUTATIONS_LAYER_ID,
            label: `Pinia 🍍`,
            color: 0xe5df88,
        });
        api.addInspector({
            id: INSPECTOR_ID,
            label: 'Pinia 🍍',
            icon: 'storage',
            treeFilterPlaceholder: 'Search stores',
            actions: [
                {
                    icon: 'content_copy',
                    action: () => {
                        actionGlobalCopyState(pinia);
                    },
                    tooltip: 'Serialize and copy the state',
                },
                {
                    icon: 'content_paste',
                    action: async () => {
                        await actionGlobalPasteState(pinia);
                        api.sendInspectorTree(INSPECTOR_ID);
                        api.sendInspectorState(INSPECTOR_ID);
                    },
                    tooltip: 'Replace the state with the content of your clipboard',
                },
                {
                    icon: 'save',
                    action: () => {
                        actionGlobalSaveState(pinia);
                    },
                    tooltip: 'Save the state as a JSON file',
                },
                {
                    icon: 'folder_open',
                    action: async () => {
                        await actionGlobalOpenStateFile(pinia);
                        api.sendInspectorTree(INSPECTOR_ID);
                        api.sendInspectorState(INSPECTOR_ID);
                    },
                    tooltip: 'Import the state from a JSON file',
                },
            ],
            nodeActions: [
                {
                    icon: 'restore',
                    tooltip: 'Reset the state (with "$reset")',
                    action: (nodeId) => {
                        const store = pinia._s.get(nodeId);
                        if (!store) {
                            toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, 'warn');
                        }
                        else if (typeof store.$reset !== 'function') {
                            toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, 'warn');
                        }
                        else {
                            store.$reset();
                            toastMessage(`Store "${nodeId}" reset.`);
                        }
                    },
                },
            ],
        });
        api.on.inspectComponent((payload, ctx) => {
            const proxy = (payload.componentInstance &&
                payload.componentInstance.proxy);
            if (proxy && proxy._pStores) {
                const piniaStores = payload.componentInstance.proxy._pStores;
                Object.values(piniaStores).forEach((store) => {
                    payload.instanceData.state.push({
                        type: getStoreType(store.$id),
                        key: 'state',
                        editable: true,
                        value: store._isOptionsAPI
                            ? {
                                _custom: {
                                    value: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toRaw)(store.$state),
                                    actions: [
                                        {
                                            icon: 'restore',
                                            tooltip: 'Reset the state of this store',
                                            action: () => store.$reset(),
                                        },
                                    ],
                                },
                            }
                            : // NOTE: workaround to unwrap transferred refs
                                Object.keys(store.$state).reduce((state, key) => {
                                    state[key] = store.$state[key];
                                    return state;
                                }, {}),
                    });
                    if (store._getters && store._getters.length) {
                        payload.instanceData.state.push({
                            type: getStoreType(store.$id),
                            key: 'getters',
                            editable: false,
                            value: store._getters.reduce((getters, key) => {
                                try {
                                    getters[key] = store[key];
                                }
                                catch (error) {
                                    // @ts-expect-error: we just want to show it in devtools
                                    getters[key] = error;
                                }
                                return getters;
                            }, {}),
                        });
                    }
                });
            }
        });
        api.on.getInspectorTree((payload) => {
            if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
                let stores = [pinia];
                stores = stores.concat(Array.from(pinia._s.values()));
                payload.rootNodes = (payload.filter
                    ? stores.filter((store) => '$id' in store
                        ? store.$id
                            .toLowerCase()
                            .includes(payload.filter.toLowerCase())
                        : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase()))
                    : stores).map(formatStoreForInspectorTree);
            }
        });
        api.on.getInspectorState((payload) => {
            if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
                const inspectedStore = payload.nodeId === PINIA_ROOT_ID
                    ? pinia
                    : pinia._s.get(payload.nodeId);
                if (!inspectedStore) {
                    // this could be the selected store restored for a different project
                    // so it's better not to say anything here
                    return;
                }
                if (inspectedStore) {
                    payload.state = formatStoreForInspectorState(inspectedStore);
                }
            }
        });
        api.on.editInspectorState((payload, ctx) => {
            if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
                const inspectedStore = payload.nodeId === PINIA_ROOT_ID
                    ? pinia
                    : pinia._s.get(payload.nodeId);
                if (!inspectedStore) {
                    return toastMessage(`store "${payload.nodeId}" not found`, 'error');
                }
                const { path } = payload;
                if (!isPinia(inspectedStore)) {
                    // access only the state
                    if (path.length !== 1 ||
                        !inspectedStore._customProperties.has(path[0]) ||
                        path[0] in inspectedStore.$state) {
                        path.unshift('$state');
                    }
                }
                else {
                    // Root access, we can omit the `.value` because the devtools API does it for us
                    path.unshift('state');
                }
                isTimelineActive = false;
                payload.set(inspectedStore, path, payload.state.value);
                isTimelineActive = true;
            }
        });
        api.on.editComponentState((payload) => {
            if (payload.type.startsWith('🍍')) {
                const storeId = payload.type.replace(/^🍍\s*/, '');
                const store = pinia._s.get(storeId);
                if (!store) {
                    return toastMessage(`store "${storeId}" not found`, 'error');
                }
                const { path } = payload;
                if (path[0] !== 'state') {
                    return toastMessage(`Invalid path for store "${storeId}":\n${path}\nOnly state can be modified.`);
                }
                // rewrite the first entry to be able to directly set the state as
                // well as any other path
                path[0] = '$state';
                isTimelineActive = false;
                payload.set(store, path, payload.state.value);
                isTimelineActive = true;
            }
        });
    });
}
function addStoreToDevtools(app, store) {
    if (!componentStateTypes.includes(getStoreType(store.$id))) {
        componentStateTypes.push(getStoreType(store.$id));
    }
    setupDevtoolsPlugin({
        id: 'dev.esm.pinia',
        label: 'Pinia 🍍',
        logo: 'https://pinia.vuejs.org/logo.svg',
        packageName: 'pinia',
        homepage: 'https://pinia.vuejs.org',
        componentStateTypes,
        app,
        settings: {
            logStoreChanges: {
                label: 'Notify about new/deleted stores',
                type: 'boolean',
                defaultValue: true,
            },
            // useEmojis: {
            //   label: 'Use emojis in messages ⚡️',
            //   type: 'boolean',
            //   defaultValue: true,
            // },
        },
    }, (api) => {
        // gracefully handle errors
        const now = typeof api.now === 'function' ? api.now.bind(api) : Date.now;
        store.$onAction(({ after, onError, name, args }) => {
            const groupId = runningActionId++;
            api.addTimelineEvent({
                layerId: MUTATIONS_LAYER_ID,
                event: {
                    time: now(),
                    title: '🛫 ' + name,
                    subtitle: 'start',
                    data: {
                        store: formatDisplay(store.$id),
                        action: formatDisplay(name),
                        args,
                    },
                    groupId,
                },
            });
            after((result) => {
                activeAction = undefined;
                api.addTimelineEvent({
                    layerId: MUTATIONS_LAYER_ID,
                    event: {
                        time: now(),
                        title: '🛬 ' + name,
                        subtitle: 'end',
                        data: {
                            store: formatDisplay(store.$id),
                            action: formatDisplay(name),
                            args,
                            result,
                        },
                        groupId,
                    },
                });
            });
            onError((error) => {
                activeAction = undefined;
                api.addTimelineEvent({
                    layerId: MUTATIONS_LAYER_ID,
                    event: {
                        time: now(),
                        logType: 'error',
                        title: '💥 ' + name,
                        subtitle: 'end',
                        data: {
                            store: formatDisplay(store.$id),
                            action: formatDisplay(name),
                            args,
                            error,
                        },
                        groupId,
                    },
                });
            });
        }, true);
        store._customProperties.forEach((name) => {
            (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.watch)(() => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(store[name]), (newValue, oldValue) => {
                api.notifyComponentUpdate();
                api.sendInspectorState(INSPECTOR_ID);
                if (isTimelineActive) {
                    api.addTimelineEvent({
                        layerId: MUTATIONS_LAYER_ID,
                        event: {
                            time: now(),
                            title: 'Change',
                            subtitle: name,
                            data: {
                                newValue,
                                oldValue,
                            },
                            groupId: activeAction,
                        },
                    });
                }
            }, { deep: true });
        });
        store.$subscribe(({ events, type }, state) => {
            api.notifyComponentUpdate();
            api.sendInspectorState(INSPECTOR_ID);
            if (!isTimelineActive)
                return;
            // rootStore.state[store.id] = state
            const eventData = {
                time: now(),
                title: formatMutationType(type),
                data: assign$1({ store: formatDisplay(store.$id) }, formatEventData(events)),
                groupId: activeAction,
            };
            if (type === MutationType.patchFunction) {
                eventData.subtitle = '⤵️';
            }
            else if (type === MutationType.patchObject) {
                eventData.subtitle = '🧩';
            }
            else if (events && !Array.isArray(events)) {
                eventData.subtitle = events.type;
            }
            if (events) {
                eventData.data['rawEvent(s)'] = {
                    _custom: {
                        display: 'DebuggerEvent',
                        type: 'object',
                        tooltip: 'raw DebuggerEvent[]',
                        value: events,
                    },
                };
            }
            api.addTimelineEvent({
                layerId: MUTATIONS_LAYER_ID,
                event: eventData,
            });
        }, { detached: true, flush: 'sync' });
        const hotUpdate = store._hotUpdate;
        store._hotUpdate = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.markRaw)((newStore) => {
            hotUpdate(newStore);
            api.addTimelineEvent({
                layerId: MUTATIONS_LAYER_ID,
                event: {
                    time: now(),
                    title: '🔥 ' + store.$id,
                    subtitle: 'HMR update',
                    data: {
                        store: formatDisplay(store.$id),
                        info: formatDisplay(`HMR update`),
                    },
                },
            });
            // update the devtools too
            api.notifyComponentUpdate();
            api.sendInspectorTree(INSPECTOR_ID);
            api.sendInspectorState(INSPECTOR_ID);
        });
        const { $dispose } = store;
        store.$dispose = () => {
            $dispose();
            api.notifyComponentUpdate();
            api.sendInspectorTree(INSPECTOR_ID);
            api.sendInspectorState(INSPECTOR_ID);
            api.getSettings().logStoreChanges &&
                toastMessage(`Disposed "${store.$id}" store 🗑`);
        };
        // trigger an update so it can display new registered stores
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.getSettings().logStoreChanges &&
            toastMessage(`"${store.$id}" store installed 🆕`);
    });
}
let runningActionId = 0;
let activeAction;
/**
 * Patches a store to enable action grouping in devtools by wrapping the store with a Proxy that is passed as the
 * context of all actions, allowing us to set `runningAction` on each access and effectively associating any state
 * mutation to the action.
 *
 * @param store - store to patch
 * @param actionNames - list of actionst to patch
 */
function patchActionForGrouping(store, actionNames, wrapWithProxy) {
    // original actions of the store as they are given by pinia. We are going to override them
    const actions = actionNames.reduce((storeActions, actionName) => {
        // use toRaw to avoid tracking #541
        storeActions[actionName] = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toRaw)(store)[actionName];
        return storeActions;
    }, {});
    for (const actionName in actions) {
        store[actionName] = function () {
            // the running action id is incremented in a before action hook
            const _actionId = runningActionId;
            const trackedStore = wrapWithProxy
                ? new Proxy(store, {
                    get(...args) {
                        activeAction = _actionId;
                        return Reflect.get(...args);
                    },
                    set(...args) {
                        activeAction = _actionId;
                        return Reflect.set(...args);
                    },
                })
                : store;
            // For Setup Stores we need https://github.com/tc39/proposal-async-context
            activeAction = _actionId;
            const retValue = actions[actionName].apply(trackedStore, arguments);
            // this is safer as async actions in Setup Stores would associate mutations done outside of the action
            activeAction = undefined;
            return retValue;
        };
    }
}
/**
 * pinia.use(devtoolsPlugin)
 */
function devtoolsPlugin({ app, store, options }) {
    // HMR module
    if (store.$id.startsWith('__hot:')) {
        return;
    }
    // detect option api vs setup api
    store._isOptionsAPI = !!options.state;
    patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
    // Upgrade the HMR to also update the new actions
    const originalHotUpdate = store._hotUpdate;
    (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toRaw)(store)._hotUpdate = function (newStore) {
        originalHotUpdate.apply(this, arguments);
        patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
    };
    addStoreToDevtools(app, 
    // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
    store);
}

/**
 * Creates a Pinia instance to be used by the application
 */
function createPinia() {
    const scope = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.effectScope)(true);
    // NOTE: here we could check the window object for a state and directly set it
    // if there is anything like it with Vue 3 SSR
    const state = scope.run(() => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.ref)({}));
    let _p = [];
    // plugins added before calling app.use(pinia)
    let toBeInstalled = [];
    const pinia = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.markRaw)({
        install(app) {
            // this allows calling useStore() outside of a component setup after
            // installing pinia's plugin
            setActivePinia(pinia);
            if (!lib_isVue2) {
                pinia._a = app;
                app.provide(piniaSymbol, pinia);
                app.config.globalProperties.$pinia = pinia;
                /* istanbul ignore else */
                if (USE_DEVTOOLS) {
                    registerPiniaDevtools(app, pinia);
                }
                toBeInstalled.forEach((plugin) => _p.push(plugin));
                toBeInstalled = [];
            }
        },
        use(plugin) {
            if (!this._a && !lib_isVue2) {
                toBeInstalled.push(plugin);
            }
            else {
                _p.push(plugin);
            }
            return this;
        },
        _p,
        // it's actually undefined here
        // @ts-expect-error
        _a: null,
        _e: scope,
        _s: new Map(),
        state,
    });
    // pinia devtools rely on dev only features so they cannot be forced unless
    // the dev build of Vue is used. Avoid old browsers like IE11.
    if (USE_DEVTOOLS && typeof Proxy !== 'undefined') {
        pinia.use(devtoolsPlugin);
    }
    return pinia;
}

/**
 * Checks if a function is a `StoreDefinition`.
 *
 * @param fn - object to test
 * @returns true if `fn` is a StoreDefinition
 */
const isUseStore = (fn) => {
    return typeof fn === 'function' && typeof fn.$id === 'string';
};
/**
 * Mutates in place `newState` with `oldState` to _hot update_ it. It will
 * remove any key not existing in `newState` and recursively merge plain
 * objects.
 *
 * @param newState - new state object to be patched
 * @param oldState - old state that should be used to patch newState
 * @returns - newState
 */
function patchObject(newState, oldState) {
    // no need to go through symbols because they cannot be serialized anyway
    for (const key in oldState) {
        const subPatch = oldState[key];
        // skip the whole sub tree
        if (!(key in newState)) {
            continue;
        }
        const targetValue = newState[key];
        if (isPlainObject(targetValue) &&
            isPlainObject(subPatch) &&
            !isRef(subPatch) &&
            !isReactive(subPatch)) {
            newState[key] = patchObject(targetValue, subPatch);
        }
        else {
            // objects are either a bit more complex (e.g. refs) or primitives, so we
            // just set the whole thing
            if (isVue2) {
                set(newState, key, subPatch);
            }
            else {
                newState[key] = subPatch;
            }
        }
    }
    return newState;
}
/**
 * Creates an _accept_ function to pass to `import.meta.hot` in Vite applications.
 *
 * @example
 * ```js
 * const useUser = defineStore(...)
 * if (import.meta.hot) {
 *   import.meta.hot.accept(acceptHMRUpdate(useUser, import.meta.hot))
 * }
 * ```
 *
 * @param initialUseStore - return of the defineStore to hot update
 * @param hot - `import.meta.hot`
 */
function acceptHMRUpdate(initialUseStore, hot) {
    // strip as much as possible from iife.prod
    if (true) {
        return () => { };
    }
    return (newModule) => {
        const pinia = hot.data.pinia || initialUseStore._pinia;
        if (!pinia) {
            // this store is still not used
            return;
        }
        // preserve the pinia instance across loads
        hot.data.pinia = pinia;
        // console.log('got data', newStore)
        for (const exportName in newModule) {
            const useStore = newModule[exportName];
            // console.log('checking for', exportName)
            if (isUseStore(useStore) && pinia._s.has(useStore.$id)) {
                // console.log('Accepting update for', useStore.$id)
                const id = useStore.$id;
                if (id !== initialUseStore.$id) {
                    console.warn(`The id of the store changed from "${initialUseStore.$id}" to "${id}". Reloading.`);
                    // return import.meta.hot.invalidate()
                    return hot.invalidate();
                }
                const existingStore = pinia._s.get(id);
                if (!existingStore) {
                    console.log(`[Pinia]: skipping hmr because store doesn't exist yet`);
                    return;
                }
                useStore(pinia, existingStore);
            }
        }
    };
}

const noop = () => { };
function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
        const idx = subscriptions.indexOf(callback);
        if (idx > -1) {
            subscriptions.splice(idx, 1);
            onCleanup();
        }
    };
    if (!detached && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.getCurrentScope)()) {
        (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.onScopeDispose)(removeSubscription);
    }
    return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
        callback(...args);
    });
}

const fallbackRunWithContext = (fn) => fn();
function mergeReactiveObjects(target, patchToApply) {
    // Handle Map instances
    if (target instanceof Map && patchToApply instanceof Map) {
        patchToApply.forEach((value, key) => target.set(key, value));
    }
    // Handle Set instances
    if (target instanceof Set && patchToApply instanceof Set) {
        patchToApply.forEach(target.add, target);
    }
    // no need to go through symbols because they cannot be serialized anyway
    for (const key in patchToApply) {
        if (!patchToApply.hasOwnProperty(key))
            continue;
        const subPatch = patchToApply[key];
        const targetValue = target[key];
        if (isPlainObject(targetValue) &&
            isPlainObject(subPatch) &&
            target.hasOwnProperty(key) &&
            !(0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.isRef)(subPatch) &&
            !(0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.isReactive)(subPatch)) {
            // NOTE: here I wanted to warn about inconsistent types but it's not possible because in setup stores one might
            // start the value of a property as a certain type e.g. a Map, and then for some reason, during SSR, change that
            // to `undefined`. When trying to hydrate, we want to override the Map with `undefined`.
            target[key] = mergeReactiveObjects(targetValue, subPatch);
        }
        else {
            // @ts-expect-error: subPatch is a valid value
            target[key] = subPatch;
        }
    }
    return target;
}
const skipHydrateSymbol = ( false)
    ? 0
    : /* istanbul ignore next */ Symbol();
const skipHydrateMap = /*#__PURE__*/ new WeakMap();
/**
 * Tells Pinia to skip the hydration process of a given object. This is useful in setup stores (only) when you return a
 * stateful object in the store but it isn't really state. e.g. returning a router instance in a setup store.
 *
 * @param obj - target object
 * @returns obj
 */
function skipHydrate(obj) {
    return isVue2
        ? // in @vue/composition-api, the refs are sealed so defineProperty doesn't work...
            /* istanbul ignore next */ skipHydrateMap.set(obj, 1) && obj
        : Object.defineProperty(obj, skipHydrateSymbol, {});
}
/**
 * Returns whether a value should be hydrated
 *
 * @param obj - target variable
 * @returns true if `obj` should be hydrated
 */
function shouldHydrate(obj) {
    return lib_isVue2
        ? /* istanbul ignore next */ !skipHydrateMap.has(obj)
        : !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
}
const { assign: pinia_assign } = Object;
function isComputed(o) {
    return !!((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.isRef)(o) && o.effect);
}
function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store;
    function setup() {
        if (!initialState && ( true || 0)) {
            /* istanbul ignore if */
            if (lib_isVue2) {
                lib_set(pinia.state.value, id, state ? state() : {});
            }
            else {
                pinia.state.value[id] = state ? state() : {};
            }
        }
        // avoid creating a state in pinia.state.value
        const localState =  false
            ? // use ref() to unwrap refs inside state TODO: check if this is still necessary
                0
            : (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toRefs)(pinia.state.value[id]);
        return pinia_assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
            if (false) {}
            computedGetters[name] = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.markRaw)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.computed)(() => {
                setActivePinia(pinia);
                // it was created just before
                const store = pinia._s.get(id);
                // allow cross using stores
                /* istanbul ignore next */
                if (lib_isVue2 && !store._r)
                    return;
                // @ts-expect-error
                // return getters![name].call(context, context)
                // TODO: avoid reading the getter while assigning with a global variable
                return getters[name].call(store, store);
            }));
            return computedGetters;
        }, {}));
    }
    store = createSetupStore(id, setup, options, pinia, hot, true);
    return store;
}
function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = pinia_assign({ actions: {} }, options);
    /* istanbul ignore if */
    if (false) {}
    // watcher options for $subscribe
    const $subscribeOptions = {
        deep: true,
        // flush: 'post',
    };
    /* istanbul ignore else */
    if (false) {}
    // internal state
    let isListening; // set to true at the end
    let isSyncListening; // set to true at the end
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    // avoid setting the state for option stores if it is set
    // by the setup
    if (!isOptionsStore && !initialState && ( true || 0)) {
        /* istanbul ignore if */
        if (lib_isVue2) {
            lib_set(pinia.state.value, $id, {});
        }
        else {
            pinia.state.value[$id] = {};
        }
    }
    const hotState = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.ref)({});
    // avoid triggering too many listeners
    // https://github.com/vuejs/pinia/issues/1129
    let activeListener;
    function $patch(partialStateOrMutator) {
        let subscriptionMutation;
        isListening = isSyncListening = false;
        // reset the debugger events since patches are sync
        /* istanbul ignore else */
        if ((false)) {}
        if (typeof partialStateOrMutator === 'function') {
            partialStateOrMutator(pinia.state.value[$id]);
            subscriptionMutation = {
                type: MutationType.patchFunction,
                storeId: $id,
                events: debuggerEvents,
            };
        }
        else {
            mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
            subscriptionMutation = {
                type: MutationType.patchObject,
                payload: partialStateOrMutator,
                storeId: $id,
                events: debuggerEvents,
            };
        }
        const myListenerId = (activeListener = Symbol());
        (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.nextTick)().then(() => {
            if (activeListener === myListenerId) {
                isListening = true;
            }
        });
        isSyncListening = true;
        // because we paused the watcher, we need to manually call the subscriptions
        triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore
        ? function $reset() {
            const { state } = options;
            const newState = state ? state() : {};
            // we use a patch to group all changes into one single subscription
            this.$patch(($state) => {
                pinia_assign($state, newState);
            });
        }
        : /* istanbul ignore next */
            ( false)
                ? 0
                : noop;
    function $dispose() {
        scope.stop();
        subscriptions = [];
        actionSubscriptions = [];
        pinia._s.delete($id);
    }
    /**
     * Wraps an action to handle subscriptions.
     *
     * @param name - name of the action
     * @param action - action to wrap
     * @returns a wrapped action to handle subscriptions
     */
    function wrapAction(name, action) {
        return function () {
            setActivePinia(pinia);
            const args = Array.from(arguments);
            const afterCallbackList = [];
            const onErrorCallbackList = [];
            function after(callback) {
                afterCallbackList.push(callback);
            }
            function onError(callback) {
                onErrorCallbackList.push(callback);
            }
            // @ts-expect-error
            triggerSubscriptions(actionSubscriptions, {
                args,
                name,
                store,
                after,
                onError,
            });
            let ret;
            try {
                ret = action.apply(this && this.$id === $id ? this : store, args);
                // handle sync errors
            }
            catch (error) {
                triggerSubscriptions(onErrorCallbackList, error);
                throw error;
            }
            if (ret instanceof Promise) {
                return ret
                    .then((value) => {
                    triggerSubscriptions(afterCallbackList, value);
                    return value;
                })
                    .catch((error) => {
                    triggerSubscriptions(onErrorCallbackList, error);
                    return Promise.reject(error);
                });
            }
            // trigger after callbacks
            triggerSubscriptions(afterCallbackList, ret);
            return ret;
        };
    }
    const _hmrPayload = /*#__PURE__*/ (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.markRaw)({
        actions: {},
        getters: {},
        state: [],
        hotState,
    });
    const partialStore = {
        _p: pinia,
        // _s: scope,
        $id,
        $onAction: addSubscription.bind(null, actionSubscriptions),
        $patch,
        $reset,
        $subscribe(callback, options = {}) {
            const removeSubscription = addSubscription(subscriptions, callback, options.detached, () => stopWatcher());
            const stopWatcher = scope.run(() => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.watch)(() => pinia.state.value[$id], (state) => {
                if (options.flush === 'sync' ? isSyncListening : isListening) {
                    callback({
                        storeId: $id,
                        type: MutationType.direct,
                        events: debuggerEvents,
                    }, state);
                }
            }, pinia_assign({}, $subscribeOptions, options)));
            return removeSubscription;
        },
        $dispose,
    };
    /* istanbul ignore if */
    if (lib_isVue2) {
        // start as non ready
        partialStore._r = false;
    }
    const store = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.reactive)(( false) || USE_DEVTOOLS
        ? pinia_assign({
            _hmrPayload,
            _customProperties: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.markRaw)(new Set()), // devtools custom properties
        }, partialStore
        // must be added later
        // setupStore
        )
        : partialStore);
    // store the partial store now so the setup of stores can instantiate each other before they are finished without
    // creating infinite loops.
    pinia._s.set($id, store);
    const runWithContext = (pinia._a && pinia._a.runWithContext) || fallbackRunWithContext;
    // TODO: idea create skipSerialize that marks properties as non serializable and they are skipped
    const setupStore = pinia._e.run(() => {
        scope = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.effectScope)();
        return runWithContext(() => scope.run(setup));
    });
    // overwrite existing actions to support $onAction
    for (const key in setupStore) {
        const prop = setupStore[key];
        if (((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.isRef)(prop) && !isComputed(prop)) || (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.isReactive)(prop)) {
            // mark it as a piece of state to be serialized
            if (false) {}
            else if (!isOptionsStore) {
                // in setup stores we must hydrate the state and sync pinia state tree with the refs the user just created
                if (initialState && shouldHydrate(prop)) {
                    if ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.isRef)(prop)) {
                        prop.value = initialState[key];
                    }
                    else {
                        // probably a reactive object, lets recursively assign
                        // @ts-expect-error: prop is unknown
                        mergeReactiveObjects(prop, initialState[key]);
                    }
                }
                // transfer the ref to the pinia state to keep everything in sync
                /* istanbul ignore if */
                if (lib_isVue2) {
                    lib_set(pinia.state.value[$id], key, prop);
                }
                else {
                    pinia.state.value[$id][key] = prop;
                }
            }
            /* istanbul ignore else */
            if ((false)) {}
            // action
        }
        else if (typeof prop === 'function') {
            // @ts-expect-error: we are overriding the function we avoid wrapping if
            const actionValue =  false ? 0 : wrapAction(key, prop);
            // this a hot module replacement store because the hotUpdate method needs
            // to do it with the right context
            /* istanbul ignore if */
            if (lib_isVue2) {
                lib_set(setupStore, key, actionValue);
            }
            else {
                // @ts-expect-error
                setupStore[key] = actionValue;
            }
            /* istanbul ignore else */
            if ((false)) {}
            // list actions so they can be used in plugins
            // @ts-expect-error
            optionsForPlugin.actions[key] = prop;
        }
        else if ((false)) {}
    }
    // add the state, getters, and action properties
    /* istanbul ignore if */
    if (lib_isVue2) {
        Object.keys(setupStore).forEach((key) => {
            lib_set(store, key, setupStore[key]);
        });
    }
    else {
        pinia_assign(store, setupStore);
        // allows retrieving reactive objects with `storeToRefs()`. Must be called after assigning to the reactive object.
        // Make `storeToRefs()` work with `reactive()` #799
        pinia_assign((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toRaw)(store), setupStore);
    }
    // use this instead of a computed with setter to be able to create it anywhere
    // without linking the computed lifespan to wherever the store is first
    // created.
    Object.defineProperty(store, '$state', {
        get: () => ( false ? 0 : pinia.state.value[$id]),
        set: (state) => {
            /* istanbul ignore if */
            if (false) {}
            $patch(($state) => {
                pinia_assign($state, state);
            });
        },
    });
    // add the hotUpdate before plugins to allow them to override it
    /* istanbul ignore else */
    if ((false)) {}
    if (USE_DEVTOOLS) {
        const nonEnumerable = {
            writable: true,
            configurable: true,
            // avoid warning on devtools trying to display this property
            enumerable: false,
        };
        ['_p', '_hmrPayload', '_getters', '_customProperties'].forEach((p) => {
            Object.defineProperty(store, p, pinia_assign({ value: store[p] }, nonEnumerable));
        });
    }
    /* istanbul ignore if */
    if (lib_isVue2) {
        // mark the store as ready before plugins
        store._r = true;
    }
    // apply all plugins
    pinia._p.forEach((extender) => {
        /* istanbul ignore else */
        if (USE_DEVTOOLS) {
            const extensions = scope.run(() => extender({
                store,
                app: pinia._a,
                pinia,
                options: optionsForPlugin,
            }));
            Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
            pinia_assign(store, extensions);
        }
        else {
            pinia_assign(store, scope.run(() => extender({
                store,
                app: pinia._a,
                pinia,
                options: optionsForPlugin,
            })));
        }
    });
    if (false) {}
    // only apply hydrate to option stores with an initial state in pinia
    if (initialState &&
        isOptionsStore &&
        options.hydrate) {
        options.hydrate(store.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store;
}
function defineStore(
// TODO: add proper types from above
idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === 'function';
    if (typeof idOrOptions === 'string') {
        id = idOrOptions;
        // the option store setup will contain the actual options in this case
        options = isSetupStore ? setupOptions : setup;
    }
    else {
        options = idOrOptions;
        id = idOrOptions.id;
        if (false) {}
    }
    function useStore(pinia, hot) {
        const hasContext = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.hasInjectionContext)();
        pinia =
            // in test mode, ignore the argument provided as we can always retrieve a
            // pinia instance with getActivePinia()
            ( false ? 0 : pinia) ||
                (hasContext ? (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.inject)(piniaSymbol, null) : null);
        if (pinia)
            setActivePinia(pinia);
        if (false) {}
        pinia = activePinia;
        if (!pinia._s.has(id)) {
            // creating the store registers it in `pinia._s`
            if (isSetupStore) {
                createSetupStore(id, setup, options, pinia);
            }
            else {
                createOptionsStore(id, options, pinia);
            }
            /* istanbul ignore else */
            if ((false)) {}
        }
        const store = pinia._s.get(id);
        if (false) {}
        if (false) {}
        // StoreGeneric cannot be casted towards Store
        return store;
    }
    useStore.$id = id;
    return useStore;
}

let mapStoreSuffix = 'Store';
/**
 * Changes the suffix added by `mapStores()`. Can be set to an empty string.
 * Defaults to `"Store"`. Make sure to extend the MapStoresCustomization
 * interface if you are using TypeScript.
 *
 * @param suffix - new suffix
 */
function setMapStoreSuffix(suffix // could be 'Store' but that would be annoying for JS
) {
    mapStoreSuffix = suffix;
}
/**
 * Allows using stores without the composition API (`setup()`) by generating an
 * object to be spread in the `computed` field of a component. It accepts a list
 * of store definitions.
 *
 * @example
 * ```js
 * export default {
 *   computed: {
 *     // other computed properties
 *     ...mapStores(useUserStore, useCartStore)
 *   },
 *
 *   created() {
 *     this.userStore // store with id "user"
 *     this.cartStore // store with id "cart"
 *   }
 * }
 * ```
 *
 * @param stores - list of stores to map to an object
 */
function mapStores(...stores) {
    if (false) {}
    return stores.reduce((reduced, useStore) => {
        // @ts-expect-error: $id is added by defineStore
        reduced[useStore.$id + mapStoreSuffix] = function () {
            return useStore(this.$pinia);
        };
        return reduced;
    }, {});
}
/**
 * Allows using state and getters from one store without using the composition
 * API (`setup()`) by generating an object to be spread in the `computed` field
 * of a component.
 *
 * @param useStore - store to map from
 * @param keysOrMapper - array or object
 */
function mapState(useStore, keysOrMapper) {
    return Array.isArray(keysOrMapper)
        ? keysOrMapper.reduce((reduced, key) => {
            reduced[key] = function () {
                return useStore(this.$pinia)[key];
            };
            return reduced;
        }, {})
        : Object.keys(keysOrMapper).reduce((reduced, key) => {
            // @ts-expect-error
            reduced[key] = function () {
                const store = useStore(this.$pinia);
                const storeKey = keysOrMapper[key];
                // for some reason TS is unable to infer the type of storeKey to be a
                // function
                return typeof storeKey === 'function'
                    ? storeKey.call(this, store)
                    : store[storeKey];
            };
            return reduced;
        }, {});
}
/**
 * Alias for `mapState()`. You should use `mapState()` instead.
 * @deprecated use `mapState()` instead.
 */
const mapGetters = (/* unused pure expression or super */ null && (mapState));
/**
 * Allows directly using actions from your store without using the composition
 * API (`setup()`) by generating an object to be spread in the `methods` field
 * of a component.
 *
 * @param useStore - store to map from
 * @param keysOrMapper - array or object
 */
function mapActions(useStore, keysOrMapper) {
    return Array.isArray(keysOrMapper)
        ? keysOrMapper.reduce((reduced, key) => {
            // @ts-expect-error
            reduced[key] = function (...args) {
                return useStore(this.$pinia)[key](...args);
            };
            return reduced;
        }, {})
        : Object.keys(keysOrMapper).reduce((reduced, key) => {
            // @ts-expect-error
            reduced[key] = function (...args) {
                return useStore(this.$pinia)[keysOrMapper[key]](...args);
            };
            return reduced;
        }, {});
}
/**
 * Allows using state and getters from one store without using the composition
 * API (`setup()`) by generating an object to be spread in the `computed` field
 * of a component.
 *
 * @param useStore - store to map from
 * @param keysOrMapper - array or object
 */
function mapWritableState(useStore, keysOrMapper) {
    return Array.isArray(keysOrMapper)
        ? keysOrMapper.reduce((reduced, key) => {
            // @ts-ignore
            reduced[key] = {
                get() {
                    return useStore(this.$pinia)[key];
                },
                set(value) {
                    // it's easier to type it here as any
                    return (useStore(this.$pinia)[key] = value);
                },
            };
            return reduced;
        }, {})
        : Object.keys(keysOrMapper).reduce((reduced, key) => {
            // @ts-ignore
            reduced[key] = {
                get() {
                    return useStore(this.$pinia)[keysOrMapper[key]];
                },
                set(value) {
                    // it's easier to type it here as any
                    return (useStore(this.$pinia)[keysOrMapper[key]] = value);
                },
            };
            return reduced;
        }, {});
}

/**
 * Creates an object of references with all the state, getters, and plugin-added
 * state properties of the store. Similar to `toRefs()` but specifically
 * designed for Pinia stores so methods and non reactive properties are
 * completely ignored.
 *
 * @param store - store to extract the refs from
 */
function storeToRefs(store) {
    // See https://github.com/vuejs/pinia/issues/852
    // It's easier to just use toRefs() even if it includes more stuff
    if (isVue2) {
        // @ts-expect-error: toRefs include methods and others
        return toRefs(store);
    }
    else {
        store = toRaw(store);
        const refs = {};
        for (const key in store) {
            const value = store[key];
            if (isRef(value) || isReactive(value)) {
                // @ts-expect-error: the key is state or getter
                refs[key] =
                    // ---
                    toRef(store, key);
            }
        }
        return refs;
    }
}

/**
 * Vue 2 Plugin that must be installed for pinia to work. Note **you don't need
 * this plugin if you are using Nuxt.js**. Use the `buildModule` instead:
 * https://pinia.vuejs.org/ssr/nuxt.html.
 *
 * @example
 * ```js
 * import Vue from 'vue'
 * import { PiniaVuePlugin, createPinia } from 'pinia'
 *
 * Vue.use(PiniaVuePlugin)
 * const pinia = createPinia()
 *
 * new Vue({
 *   el: '#app',
 *   // ...
 *   pinia,
 * })
 * ```
 *
 * @param _Vue - `Vue` imported from 'vue'.
 */
const PiniaVuePlugin = function (_Vue) {
    // Equivalent of
    // app.config.globalProperties.$pinia = pinia
    _Vue.mixin({
        beforeCreate() {
            const options = this.$options;
            if (options.pinia) {
                const pinia = options.pinia;
                // HACK: taken from provide(): https://github.com/vuejs/composition-api/blob/main/src/apis/inject.ts#L31
                /* istanbul ignore else */
                if (!this._provided) {
                    const provideCache = {};
                    Object.defineProperty(this, '_provided', {
                        get: () => provideCache,
                        set: (v) => Object.assign(provideCache, v),
                    });
                }
                this._provided[piniaSymbol] = pinia;
                // propagate the pinia instance in an SSR friendly way
                // avoid adding it to nuxt twice
                /* istanbul ignore else */
                if (!this.$pinia) {
                    this.$pinia = pinia;
                }
                pinia._a = this;
                if (IS_CLIENT) {
                    // this allows calling useStore() outside of a component setup after
                    // installing pinia's plugin
                    setActivePinia(pinia);
                }
                if (USE_DEVTOOLS) {
                    registerPiniaDevtools(pinia._a, pinia);
                }
            }
            else if (!this.$pinia && options.parent && options.parent.$pinia) {
                this.$pinia = options.parent.$pinia;
            }
        },
        destroyed() {
            delete this._pStores;
        },
    });
};



;// CONCATENATED MODULE: ../node_modules/tslib/tslib.es6.mjs
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function tslib_es6_values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}

/** @deprecated */
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}

/** @deprecated */
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
  function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof tslib_es6_values === "function" ? tslib_es6_values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose;
    if (async) {
        if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
        dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
        if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
        dispose = value[Symbol.dispose];
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  function next() {
    while (env.stack.length) {
      var rec = env.stack.pop();
      try {
        var result = rec.dispose && rec.dispose.call(rec.value);
        if (rec.async) return Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
      }
      catch (e) {
          fail(e);
      }
    }
    if (env.hasError) throw env.error;
  }
  return next();
}

/* harmony default export */ const tslib_es6 = ({
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values: tslib_es6_values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
});

;// CONCATENATED MODULE: ../astro/dist/src/index.js
// Copyright 2020 the .NET Foundation
// Licensed under the MIT License
/** The mathematical constant pi, around 3.14. */
var PI = 3.14159265358979;
/** Two times the mathematical constan pi, around 6.28. */
var TWOPI = 2 * PI;
/** Radians-to-degrees conversion factor.
 *
 * ```
 * let degrees = radians * R2D;
 * ```
 */
var R2D = 180 / PI;
/** Degrees-to-radians conversion factor.
 *
 * ```
 * let radians = degrees * D2R;
 * ```
 */
var D2R = PI / 180;
/** Radians-to-hours conversion factor.
 *
 * ```
 * let hours = radians * R2H;
 * ```
 */
var R2H = 12 / PI;
/** Hours-to-radians conversion factor.
 *
 * ```
 * let radians = hours * H2R;
 * ```
 */
var H2R = PI / 12;
/** Degrees-to-hours conversion factor.
 *
 * ```
 * let hours = degrees * D2H;
 * ```
 */
var D2H = 12. / 180;
/** Hours-to-degrees conversion factor.
 *
 * ```
 * let degrees = hours * H2D;
 * ```
 */
var H2D = 15;
/** Normalize an angle in radians to lie between 0 and 2pi.
 *
 * @param angleRad The input angle, in radians.
 * @returns An equivalent angle, also in radians.
 */
function angnorm(angleRad) {
    while (angleRad < 0)
        angleRad += TWOPI;
    while (angleRad >= TWOPI)
        angleRad -= TWOPI;
    return angleRad;
}
/**
 * Find the great-circle distance between two points
 *
 * This implementation uses a special case of the Vincenty formula
 * See the last formula in https://en.wikipedia.org/wiki/Great-circle_distance#Computational_formulas
 *
 * @param ra1 The right ascension of the first point, in radians
 * @param dec1 The declination of the first point, in radians
 * @param ra2 The right ascension of the second point, in radians
 * @param dec2 The declination of the second point, in radians
 * @returns The great-circle distance
 */
function distance(ra1, dec1, ra2, dec2) {
    var dAbsRA = Math.abs(ra1 - ra2);
    var nt1 = Math.pow((Math.cos(dec2) * Math.sin(dAbsRA)), 2);
    var nt2 = Math.pow((Math.cos(dec1) * Math.sin(dec2) - Math.sin(dec1) * Math.cos(dec2) * Math.cos(dAbsRA)), 2);
    var num = Math.sqrt(nt1 + nt2);
    var den = Math.sin(dec1) * Math.sin(dec2) + Math.cos(dec1) * Math.cos(dec2) * Math.cos(dAbsRA);
    return Math.atan2(num, den);
}
function _formatSexagesimal(value, showPlus, padWhole, sep1, sep2, precision) {
    var prefix = "";
    if (value < 0) {
        value = -value;
        prefix = "-";
    }
    else if (showPlus) {
        prefix = "+";
    }
    var whole = Math.floor(value);
    value = (value - whole) * 60;
    var minutes = Math.floor(value);
    value = (value - minutes) * 60;
    var seconds = Math.floor(value);
    var remainder = value - seconds;
    var wText = String(whole).padStart(padWhole, '0');
    var mText = String(minutes).padStart(2, '0');
    var sText = String(seconds).padStart(2, '0');
    var rText = remainder.toFixed(precision).slice(1); // drop the leading "0"
    return "".concat(prefix).concat(wText).concat(sep1).concat(mText).concat(sep2).concat(sText).concat(rText);
}
/** Format an angle, measured in radians, as sexagesimal hours.
 *
 * Before formatting, the angle is normalized to lie within 0-2pi.
 *
 * @param angleRad The angle in radians.
 * @param sep1 The text to put between the hours and the minutes. Defaults to
 * `":"`.
 * @param sep2 The text to put between the minutes and the seconds. Defaults to
 * `":"`.
 * @param precision The number of places of decimal precision to include in the
 * result. Defaults to 0.
 * @returns The formatted angle.
 */
function fmtHours(angleRad, sep1, sep2, precision) {
    if (sep1 === void 0) { sep1 = ":"; }
    if (sep2 === void 0) { sep2 = ":"; }
    if (precision === void 0) { precision = 0; }
    return _formatSexagesimal(angnorm(angleRad) * R2H, false, 2, sep1, sep2, precision);
}
/** Format a latitudinal angle, measured in radians, as sexagesimal degrees.
 *
 * If the number is not in the range [-pi, pi], `" ??${sep1}??${sep2}??"` is
 * returned.
 *
 * @param angleRad The latitude in radians.
 * @param sep1 The text to put between the degrees and the arcminutes. Defaults
 * to `":"`.
 * @param sep2 The text to put between the arcminutes and the arcseconds.
 * Defaults to `":"`.
 * @param precision The number of places of decimal precision to include in the
 * result. Defaults to 0.
 * @returns The formatted angle.
 */
function fmtDegLat(angleRad, sep1, sep2, precision) {
    if (sep1 === void 0) { sep1 = ":"; }
    if (sep2 === void 0) { sep2 = ":"; }
    if (precision === void 0) { precision = 0; }
    if (angleRad < -PI || angleRad > PI)
        return " ??".concat(sep1, "??").concat(sep2, "??");
    return _formatSexagesimal(angleRad * R2D, true, 2, sep1, sep2, precision);
}
/** Format a longitudinal angle, measured in radians, as sexagesimal degrees.
 *
 * Before formatting, the angle is normalized to lie within 0-2pi. The output
 * will be zero-padded to three digits, e.g. `"000:01:30"` or `"359:59:59.123"`.
 *
 * @param angleRad The longitude in radians.
 * @param sep1 The text to put between the degrees and the arcminutes. Defaults
 * to `":"`.
 * @param sep2 The text to put between the arcminutes and the arcseconds.
 * Defaults to `":"`.
 * @param precision The number of places of decimal precision to include in the
 * result. Defaults to 0.
 * @returns The formatted angle.
 */
function fmtDegLon(angleRad, sep1, sep2, precision) {
    if (sep1 === void 0) { sep1 = ":"; }
    if (sep2 === void 0) { sep2 = ":"; }
    if (precision === void 0) { precision = 0; }
    return _formatSexagesimal(angnorm(angleRad) * R2D, false, 3, sep1, sep2, precision);
}
//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../engine-types/dist/src/index.js
/* eslint-disable no-unused-vars */

// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
//
// Based types used in the WWT WebGL engine.
//
// Try to keep everything alphabetized.
var AltTypes;
(function (AltTypes) {
    AltTypes[AltTypes["depth"] = 0] = "depth";
    AltTypes[AltTypes["altitude"] = 1] = "altitude";
    AltTypes[AltTypes["distance"] = 2] = "distance";
    AltTypes[AltTypes["seaLevel"] = 3] = "seaLevel";
    AltTypes[AltTypes["terrain"] = 4] = "terrain";
})(AltTypes || (AltTypes = {}));
var AltUnits;
(function (AltUnits) {
    AltUnits[AltUnits["meters"] = 1] = "meters";
    AltUnits[AltUnits["feet"] = 2] = "feet";
    AltUnits[AltUnits["inches"] = 3] = "inches";
    AltUnits[AltUnits["miles"] = 4] = "miles";
    AltUnits[AltUnits["kilometers"] = 5] = "kilometers";
    AltUnits[AltUnits["astronomicalUnits"] = 6] = "astronomicalUnits";
    AltUnits[AltUnits["lightYears"] = 7] = "lightYears";
    AltUnits[AltUnits["parsecs"] = 8] = "parsecs";
    AltUnits[AltUnits["megaParsecs"] = 9] = "megaParsecs";
    AltUnits[AltUnits["custom"] = 10] = "custom";
})(AltUnits || (AltUnits = {}));
var BandPass;
(function (BandPass) {
    BandPass[BandPass["gamma"] = 0] = "gamma";
    BandPass[BandPass["xRay"] = 1] = "xRay";
    BandPass[BandPass["ultraviolet"] = 2] = "ultraviolet";
    BandPass[BandPass["visible"] = 3] = "visible";
    BandPass[BandPass["hydrogenAlpha"] = 4] = "hydrogenAlpha";
    BandPass[BandPass["IR"] = 4] = "IR";
    BandPass[BandPass["microwave"] = 5] = "microwave";
    BandPass[BandPass["radio"] = 6] = "radio";
    BandPass[BandPass["visibleNight"] = 6] = "visibleNight";
})(BandPass || (BandPass = {}));
var Classification;
(function (Classification) {
    Classification[Classification["star"] = 1] = "star";
    Classification[Classification["supernova"] = 2] = "supernova";
    Classification[Classification["blackHole"] = 4] = "blackHole";
    Classification[Classification["neutronStar"] = 8] = "neutronStar";
    Classification[Classification["doubleStar"] = 16] = "doubleStar";
    Classification[Classification["multipleStars"] = 32] = "multipleStars";
    Classification[Classification["asterism"] = 64] = "asterism";
    Classification[Classification["constellation"] = 128] = "constellation";
    Classification[Classification["openCluster"] = 256] = "openCluster";
    Classification[Classification["globularCluster"] = 512] = "globularCluster";
    Classification[Classification["nebulousCluster"] = 1024] = "nebulousCluster";
    Classification[Classification["nebula"] = 2048] = "nebula";
    Classification[Classification["emissionNebula"] = 4096] = "emissionNebula";
    Classification[Classification["planetaryNebula"] = 8192] = "planetaryNebula";
    Classification[Classification["reflectionNebula"] = 16384] = "reflectionNebula";
    Classification[Classification["darkNebula"] = 32768] = "darkNebula";
    Classification[Classification["giantMolecularCloud"] = 65536] = "giantMolecularCloud";
    Classification[Classification["supernovaRemnant"] = 131072] = "supernovaRemnant";
    Classification[Classification["interstellarDust"] = 262144] = "interstellarDust";
    Classification[Classification["quasar"] = 524288] = "quasar";
    Classification[Classification["galaxy"] = 1048576] = "galaxy";
    Classification[Classification["spiralGalaxy"] = 2097152] = "spiralGalaxy";
    Classification[Classification["irregularGalaxy"] = 4194304] = "irregularGalaxy";
    Classification[Classification["ellipticalGalaxy"] = 8388608] = "ellipticalGalaxy";
    Classification[Classification["knot"] = 16777216] = "knot";
    Classification[Classification["plateDefect"] = 33554432] = "plateDefect";
    Classification[Classification["clusterOfGalaxies"] = 67108864] = "clusterOfGalaxies";
    Classification[Classification["otherNGC"] = 134217728] = "otherNGC";
    Classification[Classification["unidentified"] = 268435456] = "unidentified";
    Classification[Classification["solarSystem"] = 536870912] = "solarSystem";
    Classification[Classification["unfiltered"] = 1073741823] = "unfiltered";
    Classification[Classification["stellar"] = 63] = "stellar";
    Classification[Classification["stellarGroupings"] = 2032] = "stellarGroupings";
    Classification[Classification["nebulae"] = 523264] = "nebulae";
    Classification[Classification["galactic"] = 133693440] = "galactic";
    Classification[Classification["other"] = 436207616] = "other";
})(Classification || (Classification = {}));
var CoordinatesType;
(function (CoordinatesType) {
    CoordinatesType[CoordinatesType["spherical"] = 0] = "spherical";
    CoordinatesType[CoordinatesType["rectangular"] = 1] = "rectangular";
    CoordinatesType[CoordinatesType["orbital"] = 2] = "orbital";
})(CoordinatesType || (CoordinatesType = {}));
var DataTypes;
(function (DataTypes) {
    DataTypes[DataTypes["byteT"] = 0] = "byteT";
    DataTypes[DataTypes["int16T"] = 1] = "int16T";
    DataTypes[DataTypes["int32T"] = 2] = "int32T";
    DataTypes[DataTypes["floatT"] = 3] = "floatT";
    DataTypes[DataTypes["doubleT"] = 4] = "doubleT";
    DataTypes[DataTypes["none"] = 5] = "none";
})(DataTypes || (DataTypes = {}));
var FadeType;
(function (FadeType) {
    FadeType[FadeType["fadeIn"] = 1] = "fadeIn";
    FadeType[FadeType["fadeOut"] = 2] = "fadeOut";
    FadeType[FadeType["both"] = 3] = "both";
    FadeType[FadeType["none"] = 4] = "none";
})(FadeType || (FadeType = {}));
var FolderGroup;
(function (FolderGroup) {
    FolderGroup[FolderGroup["explorer"] = 0] = "explorer";
    FolderGroup[FolderGroup["tour"] = 1] = "tour";
    FolderGroup[FolderGroup["search"] = 2] = "search";
    FolderGroup[FolderGroup["constellation"] = 3] = "constellation";
    FolderGroup[FolderGroup["view"] = 4] = "view";
    FolderGroup[FolderGroup["goTo"] = 5] = "goTo";
    FolderGroup[FolderGroup["community"] = 6] = "community";
    FolderGroup[FolderGroup["context"] = 7] = "context";
    FolderGroup[FolderGroup["voTable"] = 8] = "voTable";
    FolderGroup[FolderGroup["imageStack"] = 9] = "imageStack";
})(FolderGroup || (FolderGroup = {}));
var FolderRefreshType;
(function (FolderRefreshType) {
    FolderRefreshType[FolderRefreshType["interval"] = 0] = "interval";
    FolderRefreshType[FolderRefreshType["conditionalGet"] = 1] = "conditionalGet";
    FolderRefreshType[FolderRefreshType["viewChange"] = 2] = "viewChange";
})(FolderRefreshType || (FolderRefreshType = {}));
var FolderType;
(function (FolderType) {
    FolderType[FolderType["earth"] = 0] = "earth";
    FolderType[FolderType["planet"] = 1] = "planet";
    FolderType[FolderType["sky"] = 2] = "sky";
    FolderType[FolderType["panorama"] = 3] = "panorama";
})(FolderType || (FolderType = {}));
var ImageSetType;
(function (ImageSetType) {
    ImageSetType[ImageSetType["earth"] = 0] = "earth";
    ImageSetType[ImageSetType["planet"] = 1] = "planet";
    ImageSetType[ImageSetType["sky"] = 2] = "sky";
    ImageSetType[ImageSetType["panorama"] = 3] = "panorama";
    ImageSetType[ImageSetType["solarSystem"] = 4] = "solarSystem";
    ImageSetType[ImageSetType["sandbox"] = 5] = "sandbox";
})(ImageSetType || (ImageSetType = {}));
var MarkerScales;
(function (MarkerScales) {
    MarkerScales[MarkerScales["screen"] = 0] = "screen";
    MarkerScales[MarkerScales["world"] = 1] = "world";
})(MarkerScales || (MarkerScales = {}));
var PlotTypes;
(function (PlotTypes) {
    PlotTypes[PlotTypes["gaussian"] = 0] = "gaussian";
    PlotTypes[PlotTypes["point"] = 1] = "point";
    PlotTypes[PlotTypes["circle"] = 2] = "circle";
    PlotTypes[PlotTypes["square"] = 3] = "square";
    PlotTypes[PlotTypes["pushPin"] = 4] = "pushPin";
    PlotTypes[PlotTypes["custom"] = 5] = "custom";
})(PlotTypes || (PlotTypes = {}));
var PointScaleTypes;
(function (PointScaleTypes) {
    PointScaleTypes[PointScaleTypes["linear"] = 0] = "linear";
    PointScaleTypes[PointScaleTypes["power"] = 1] = "power";
    PointScaleTypes[PointScaleTypes["log"] = 2] = "log";
    PointScaleTypes[PointScaleTypes["constant"] = 3] = "constant";
    PointScaleTypes[PointScaleTypes["stellarMagnitude"] = 4] = "stellarMagnitude";
})(PointScaleTypes || (PointScaleTypes = {}));
var ProjectionType;
(function (ProjectionType) {
    ProjectionType[ProjectionType["mercator"] = 0] = "mercator";
    ProjectionType[ProjectionType["equirectangular"] = 1] = "equirectangular";
    ProjectionType[ProjectionType["tangent"] = 2] = "tangent";
    ProjectionType[ProjectionType["tan"] = 2] = "tan";
    ProjectionType[ProjectionType["toast"] = 3] = "toast";
    ProjectionType[ProjectionType["spherical"] = 4] = "spherical";
    ProjectionType[ProjectionType["skyImage"] = 5] = "skyImage";
    ProjectionType[ProjectionType["plotted"] = 6] = "plotted";
})(ProjectionType || (ProjectionType = {}));
var RAUnits;
(function (RAUnits) {
    RAUnits[RAUnits["hours"] = 0] = "hours";
    RAUnits[RAUnits["degrees"] = 1] = "degrees";
})(RAUnits || (RAUnits = {}));
var ReferenceFrames;
(function (ReferenceFrames) {
    ReferenceFrames[ReferenceFrames["sky"] = 0] = "sky";
    ReferenceFrames[ReferenceFrames["ecliptic"] = 1] = "ecliptic";
    ReferenceFrames[ReferenceFrames["galactic"] = 2] = "galactic";
    ReferenceFrames[ReferenceFrames["sun"] = 3] = "sun";
    ReferenceFrames[ReferenceFrames["mercury"] = 4] = "mercury";
    ReferenceFrames[ReferenceFrames["venus"] = 5] = "venus";
    ReferenceFrames[ReferenceFrames["earth"] = 6] = "earth";
    ReferenceFrames[ReferenceFrames["mars"] = 7] = "mars";
    ReferenceFrames[ReferenceFrames["jupiter"] = 8] = "jupiter";
    ReferenceFrames[ReferenceFrames["saturn"] = 9] = "saturn";
    ReferenceFrames[ReferenceFrames["uranus"] = 10] = "uranus";
    ReferenceFrames[ReferenceFrames["neptune"] = 11] = "neptune";
    ReferenceFrames[ReferenceFrames["pluto"] = 12] = "pluto";
    ReferenceFrames[ReferenceFrames["moon"] = 13] = "moon";
    ReferenceFrames[ReferenceFrames["io"] = 14] = "io";
    ReferenceFrames[ReferenceFrames["europa"] = 15] = "europa";
    ReferenceFrames[ReferenceFrames["ganymede"] = 16] = "ganymede";
    ReferenceFrames[ReferenceFrames["callisto"] = 17] = "callisto";
    ReferenceFrames[ReferenceFrames["custom"] = 18] = "custom";
    ReferenceFrames[ReferenceFrames["identity"] = 19] = "identity";
    ReferenceFrames[ReferenceFrames["sandbox"] = 20] = "sandbox";
})(ReferenceFrames || (ReferenceFrames = {}));
var ReferenceFrameTypes;
(function (ReferenceFrameTypes) {
    ReferenceFrameTypes[ReferenceFrameTypes["fixedSherical"] = 0] = "fixedSherical";
    ReferenceFrameTypes[ReferenceFrameTypes["orbital"] = 1] = "orbital";
    ReferenceFrameTypes[ReferenceFrameTypes["trajectory"] = 2] = "trajectory";
    ReferenceFrameTypes[ReferenceFrameTypes["synodic"] = 3] = "synodic";
})(ReferenceFrameTypes || (ReferenceFrameTypes = {}));
var ScaleTypes;
(function (ScaleTypes) {
    ScaleTypes[ScaleTypes["linear"] = 0] = "linear";
    ScaleTypes[ScaleTypes["log"] = 1] = "log";
    ScaleTypes[ScaleTypes["power"] = 2] = "power";
    ScaleTypes[ScaleTypes["squareRoot"] = 3] = "squareRoot";
    ScaleTypes[ScaleTypes["histogramEqualization"] = 4] = "histogramEqualization";
})(ScaleTypes || (ScaleTypes = {}));
var SolarSystemObjects;
(function (SolarSystemObjects) {
    SolarSystemObjects[SolarSystemObjects["sun"] = 0] = "sun";
    SolarSystemObjects[SolarSystemObjects["mercury"] = 1] = "mercury";
    SolarSystemObjects[SolarSystemObjects["venus"] = 2] = "venus";
    SolarSystemObjects[SolarSystemObjects["mars"] = 3] = "mars";
    SolarSystemObjects[SolarSystemObjects["jupiter"] = 4] = "jupiter";
    SolarSystemObjects[SolarSystemObjects["saturn"] = 5] = "saturn";
    SolarSystemObjects[SolarSystemObjects["uranus"] = 6] = "uranus";
    SolarSystemObjects[SolarSystemObjects["neptune"] = 7] = "neptune";
    SolarSystemObjects[SolarSystemObjects["pluto"] = 8] = "pluto";
    SolarSystemObjects[SolarSystemObjects["moon"] = 9] = "moon";
    SolarSystemObjects[SolarSystemObjects["io"] = 10] = "io";
    SolarSystemObjects[SolarSystemObjects["europa"] = 11] = "europa";
    SolarSystemObjects[SolarSystemObjects["ganymede"] = 12] = "ganymede";
    SolarSystemObjects[SolarSystemObjects["callisto"] = 13] = "callisto";
    SolarSystemObjects[SolarSystemObjects["ioShadow"] = 14] = "ioShadow";
    SolarSystemObjects[SolarSystemObjects["europaShadow"] = 15] = "europaShadow";
    SolarSystemObjects[SolarSystemObjects["ganymedeShadow"] = 16] = "ganymedeShadow";
    SolarSystemObjects[SolarSystemObjects["callistoShadow"] = 17] = "callistoShadow";
    SolarSystemObjects[SolarSystemObjects["sunEclipsed"] = 18] = "sunEclipsed";
    SolarSystemObjects[SolarSystemObjects["earth"] = 19] = "earth";
    SolarSystemObjects[SolarSystemObjects["custom"] = 20] = "custom";
    SolarSystemObjects[SolarSystemObjects["undefined"] = 65536] = "undefined";
})(SolarSystemObjects || (SolarSystemObjects = {}));
// I'm not aware of any smart TypeScripty way to automate the construction of this table :-(
var baseEngineSettingTypeInfo = {
    "actualPlanetScale/boolean": true,
    "constellations/boolean": true,
    "constellationBoundryColor/string": true,
    "constellationFigureColor/string": true,
    "constellationsEnabled/string": true,
    "constellationSelectionColor/string": true,
    "crosshairsColor/string": true,
    "earthCutawayView/boolean": true,
    //"fovCamera/number": true,  // skipping because not settable
    //"fovEyepiece/number": true,  // skipping because not settable
    //"fovTelescope/number": true,  // skipping because not settable
    "localHorizonMode/boolean": true,
    "galacticMode/boolean": true,
    "locationAltitude/number": true,
    "locationLat/number": true,
    "locationLng/number": true,
    "milkyWayModel/boolean": true,
    "showAltAzGrid/boolean": true,
    "showAltAzGridText/boolean": true,
    //"showClouds/boolean": true,  // skipping because not settable
    "showConstellations/boolean": true,
    "showConstellationBoundries/boolean": true,
    "showConstellationFigures/boolean": true,
    "showConstellationLabels/boolean": true,
    "showConstellationPictures/boolean": true,
    "showConstellationSelection/boolean": true,
    "showCrosshairs/boolean": true,
    "showEarthSky/boolean": true,
    "showEcliptic/boolean": true,
    "showEclipticGrid/boolean": true,
    "showEclipticGridText/boolean": true,
    "showEclipticOverviewText/boolean": true,
    "showElevationModel/boolean": true,
    "showEquatorialGridText/boolean": true,
    //"showFieldOfView/boolean": true,  // skipping because not settable
    "showGalacticGrid/boolean": true,
    "showGalacticGridText/boolean": true,
    "showGrid/boolean": true,
    "showHorizon/boolean": true,
    //"showHorizonPanorama/boolean": true,  // skipping because not settable
    "showISSModel/boolean": true,
    //"showMoonsAsPointSource/boolean": true,  // skipping because not settable
    "showPrecessionChart/boolean": true,
    "showSkyGrids/boolean": true,
    "showSkyNode/boolean": true,
    "showSkyOverlays/boolean": true,
    "showSkyOverlaysIn3d/boolean": true,
    "showSolarSystem/boolean": true,
    "smoothPan/boolean": true,
    "solarSystemCMB/boolean": true,
    "solarSystemCosmos/boolean": true,
    "solarSystemMilkyWay/boolean": true,
    "solarSystemOrbits/boolean": true,
    "solarSystemOverlays/boolean": true,
    "solarSystemLighting/boolean": true,
    "solarSystemMultiRes/boolean": true,
    "solarSystemMinorPlanets/boolean": true,
    "solarSystemMinorOrbits/boolean": true,
    "solarSystemPlanets/boolean": true,
    "solarSystemStars/boolean": true,
    "minorPlanetsFilter/number": true,
    "planetOrbitsFilter/number": true,
    "solarSystemScale/number": true,
};
/** Type guard function for BaseEngineSetting. */
function src_isBaseEngineSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return (key in baseEngineSettingTypeInfo);
}
var baseLayerSettingTypeInfo = {
    "astronomical/boolean": true,
    "enabled/boolean": true,
    "fadeSpan/number": true,
    "name/string": true,
    "opacity/number": true,
    "opened/boolean": true,
    "referenceFrame/string": true,
    "version/number": true,
};
/** Type guard function for BaseLayerSetting. */
function src_isBaseLayerSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return key in baseLayerSettingTypeInfo;
}
var baseImageSetLayerSettingTypeInfo = {
    "colorMapperName/string": true,
    "overrideDefaultLayer/boolean": true,
};
/** Type guard function for BaseImageSetLayerSetting. */
function src_isBaseImageSetLayerSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return (key in baseImageSetLayerSettingTypeInfo) || src_isBaseLayerSetting(obj);
}
// See implementation below -- we need to handle enums specially
// to make sure that inputs are in-range.
var baseSpreadSheetLayerSettingTypeInfo = {
    "altColumn/number": "",
    "altType/number": "AltTypes",
    "altUnit/number": "AltUnits",
    "barChartBitmask/number": "",
    "beginRange/Date": "",
    "cartesianCustomScale/number": "",
    "cartesianScale/number": "AltUnits",
    "colorMapColumn/number": "",
    "colorMapperName/string": "",
    "coordinatesType/number": "CoordinatesType",
    "decay/number": "",
    "dynamicColor/boolean": "",
    "dynamicData/boolean": "",
    "endDateColumn/number": "",
    "endRange/Date": "",
    "geometryColumn/number": "",
    "hyperlinkColumn/number": "",
    "hyperlinkFormat/string": "",
    "latColumn/number": "",
    "lngColumn/number": "",
    "markerColumn/number": "",
    "markerIndex/number": "",
    "markerScale/number": "",
    "nameColumn/number": "",
    "normalizeColorMap/boolean": "",
    "normalizeColorMapMax/number": "",
    "normalizeColorMapMin/number": "",
    "normalizeSize/boolean": "",
    "normalizeSizeClip/boolean": "",
    "normalizeSizeMax/number": "",
    "normalizeSizeMin/number": "",
    "plotType/number": "PlotTypes",
    "pointScaleType/number": "PointScaleTypes",
    "raUnits/number": "RAUnits",
    "scaleFactor/number": "",
    "showFarSide/boolean": "",
    "sizeColumn/number": "",
    "startDateColumn/number": "",
    "timeSeries/boolean": "",
    "xAxisColumn/number": "",
    "xAxisReverse/boolean": "",
    "yAxisColumn/number": "",
    "yAxisReverse/boolean": "",
    "zAxisColumn/number": "",
    "zAxisReverse/boolean": "",
};
/** Type guard function for BaseSpreadSheetLayerSetting. */
function src_isBaseSpreadSheetLayerSetting(obj) {
    if (src_isBaseLayerSetting(obj))
        return true;
    // We want to be able to properly recognize Date objects
    var type = obj[1] instanceof Date ? 'Date' : typeof obj[1];
    var key = obj[0] + "/" + type;
    var enumType = baseSpreadSheetLayerSettingTypeInfo[key];
    if (enumType === undefined) {
        return false;
    }
    else if (enumType == "") {
        return true;
    }
    else if (enumType == "AltTypes") {
        return obj[1] in AltTypes;
    }
    else if (enumType == "AltUnits") {
        return obj[1] in AltUnits;
    }
    else if (enumType == "CoordinatesType") {
        return obj[1] in CoordinatesType;
    }
    else if (enumType == "PlotTypes") {
        return obj[1] in PlotTypes;
    }
    else if (enumType == "PointScaleTypes") {
        return obj[1] in PointScaleTypes;
    }
    else if (enumType == "RAUnits") {
        return obj[1] in RAUnits;
    }
    else {
        throw new Error('internal bug isBaseSpreadSheetLayerSetting');
    }
}
// See implementation below -- we need to handle enums specially
// to make sure that inputs are in-range.
var baseVoTableLayerSettingTypeInfo = {
    "altColumn/number": "",
    "altType/number": "AltTypes",
    "altUnit/number": "AltUnits",
    "beginRange/Date": "",
    "cartesianCustomScale/number": "",
    "cartesianScale/number": "AltUnits",
    "colorMapColumn/number": "",
    "coordinatesType/number": "CoordinatesType",
    "dataSourceUrl/string": "",
    "decay/number": "",
    "dynamicData/boolean": "",
    "endDateColumn/number": "",
    "endRange/Date": "",
    "hyperlinkColumn/number": "",
    "hyperlinkFormat/string": "",
    "latColumn/number": "",
    "lngColumn/number": "",
    "markerColumn/number": "",
    "markerIndex/number": "",
    "markerScale/number": "",
    "nameColumn/number": "",
    "plotType/number": "PlotTypes",
    "pointScaleType/number": "PointScaleTypes",
    "raUnits/number": "RAUnits",
    "scaleFactor/number": "",
    "showFarSide/boolean": "",
    "sizeColumn/number": "",
    "startDateColumn/number": "",
    "timeSeries/boolean": "",
    "xAxisColumn/number": "",
    "xAxisReverse/boolean": "",
    "yAxisColumn/number": "",
    "yAxisReverse/boolean": "",
    "zAxisColumn/number": "",
    "zAxisReverse/boolean": "",
};
/** Type guard function for BaseVoTableLayerSetting. */
function src_isBaseVoTableLayerSetting(obj) {
    if (src_isBaseLayerSetting(obj))
        return true;
    var key = obj[0] + "/" + typeof obj[1];
    var enumType = baseVoTableLayerSettingTypeInfo[key];
    if (enumType === undefined) {
        return false;
    }
    else if (enumType == "") {
        return true;
    }
    else if (enumType == "AltTypes") {
        return obj[1] in AltTypes;
    }
    else if (enumType == "AltUnits") {
        return obj[1] in AltUnits;
    }
    else if (enumType == "CoordinatesType") {
        return obj[1] in CoordinatesType;
    }
    else if (enumType == "PlotTypes") {
        return obj[1] in PlotTypes;
    }
    else if (enumType == "PointScaleTypes") {
        return obj[1] in PointScaleTypes;
    }
    else if (enumType == "RAUnits") {
        return obj[1] in RAUnits;
    }
    else {
        throw new Error('internal bug isBaseVoTableLayerSetting');
    }
}
function keysOf(o) { return Object.keys(o); } // eslint-disable-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
function enumLookup(stringEnum, s) {
    var e_1, _a;
    try {
        for (var _b = __values(keysOf(stringEnum)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var enumKey = _c.value;
            if (stringEnum[enumKey] === s) {
                return stringEnum[enumKey];
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return undefined;
}
//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: external {"amd":"@wwtelescope/engine","commonjs2":"@wwtelescope/engine","commonjs":"@wwtelescope/engine","root":"wwtlib"}
const engine_root_wwtlib_namespaceObject = require("@wwtelescope/engine");
;// CONCATENATED MODULE: ../engine-helpers/dist/src/layer.js
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling generic layers settings. */


/** A list of the names of the available settings for generic layers. */
var layerSettingNames = [
    "astronomical",
    "color",
    "enabled",
    "fadeSpan",
    "name",
    "opacity",
    "opened",
    "referenceFrame",
    "version",
];
var layerSettingTypeInfo = {
    "color/Color": true,
};
/** Type guard function for `LayerSetting`. */
function layer_isLayerSetting(obj) {
    var typekey = typeof obj[1];
    if (obj[1] instanceof Color) {
        typekey = "Color";
    }
    var key = obj[0] + "/" + typekey;
    return (key in layerSettingTypeInfo) || isBaseLayerSetting(obj);
}
/** Apply a setting to a generic `Layer` or equivalent. */
function applyLayerSetting(layer, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    layer[funcName](value);
}
/** Extract all of the current settings of a `Layer` or equivalent. */
function layer_extractLayerSettings(layer) {
    var e_1, _a;
    var s = [];
    try {
        for (var layerSettingNames_1 = __values(layerSettingNames), layerSettingNames_1_1 = layerSettingNames_1.next(); !layerSettingNames_1_1.done; layerSettingNames_1_1 = layerSettingNames_1.next()) {
            var n = layerSettingNames_1_1.value;
            s.push([n, layer["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (layerSettingNames_1_1 && !layerSettingNames_1_1.done && (_a = layerSettingNames_1.return)) _a.call(layerSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `Layer`, or equivalent, to another. */
function copyLayerSettings(source, dest) {
    var e_2, _a;
    try {
        for (var layerSettingNames_2 = tslib_es6_values(layerSettingNames), layerSettingNames_2_1 = layerSettingNames_2.next(); !layerSettingNames_2_1.done; layerSettingNames_2_1 = layerSettingNames_2.next()) {
            var n = layerSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (layerSettingNames_2_1 && !layerSettingNames_2_1.done && (_a = layerSettingNames_2.return)) _a.call(layerSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `LayerSettingsInterface`. */
var LayerState = /** @class */ (function () {
    // Maybe possible to use remapped keys to create this type?:
    // https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as
    // Don't think we can implement functions, though, and we're currently (Aug
    // 2021) on TypeScript 3.9, while the above requires 4.1.
    function LayerState(source) {
        copyLayerSettings(source, this);
    }
    LayerState.prototype.get_astronomical = function () {
        return this.astronomical;
    };
    LayerState.prototype.set_astronomical = function (v) {
        this.astronomical = v;
        return v;
    };
    LayerState.prototype.get_color = function () {
        return this.color;
    };
    LayerState.prototype.set_color = function (v) {
        this.color = v;
        return v;
    };
    LayerState.prototype.get_enabled = function () {
        return this.enabled;
    };
    LayerState.prototype.set_enabled = function (v) {
        this.enabled = v;
        return v;
    };
    LayerState.prototype.get_endTime = function () {
        return this.endTime;
    };
    LayerState.prototype.set_endTime = function (v) {
        this.endTime = v;
        return v;
    };
    LayerState.prototype.get_fadeSpan = function () {
        return this.fadeSpan;
    };
    LayerState.prototype.set_fadeSpan = function (v) {
        this.fadeSpan = v;
        return v;
    };
    LayerState.prototype.get_fadeType = function () {
        return this.fadeType;
    };
    LayerState.prototype.set_fadeType = function (v) {
        this.fadeType = v;
        return v;
    };
    LayerState.prototype.get_name = function () {
        return this.name;
    };
    LayerState.prototype.set_name = function (v) {
        this.name = v;
        return v;
    };
    LayerState.prototype.get_opacity = function () {
        return this.opacity;
    };
    LayerState.prototype.set_opacity = function (v) {
        this.opacity = v;
        return v;
    };
    LayerState.prototype.get_opened = function () {
        return this.opened;
    };
    LayerState.prototype.set_opened = function (v) {
        this.opened = v;
        return v;
    };
    LayerState.prototype.get_referenceFrame = function () {
        return this.referenceFrame;
    };
    LayerState.prototype.set_referenceFrame = function (v) {
        this.referenceFrame = v;
        return v;
    };
    LayerState.prototype.get_startTime = function () {
        return this.startTime;
    };
    LayerState.prototype.set_startTime = function (v) {
        this.startTime = v;
        return v;
    };
    LayerState.prototype.get_version = function () {
        return this.version;
    };
    LayerState.prototype.set_version = function (v) {
        this.version = v;
        return v;
    };
    return LayerState;
}());

//# sourceMappingURL=layer.js.map
;// CONCATENATED MODULE: ../engine-helpers/dist/src/imagesetlayer.js
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling imageset layer settings. */


var justImageSetLayerSettingNames = [
    "colorMapperName",
    "overrideDefaultLayer",
];
/** A list of the names of the available settings for `ImageSetLayer`
 * instances and their equivalents (things implementing
 * [[ImageSetLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
var imageSetLayerSettingNames = layerSettingNames.concat(justImageSetLayerSettingNames);
/** Type guard function for `ImageSetLayerSetting`. */
function isImageSetLayerSetting(obj) {
    // No special settings specific to non-base ImageSetLayerSetting.
    return isLayerSetting(obj) || isBaseImageSetLayerSetting(obj);
}
/** Apply a setting to a `ImageSetLayer` or equivalent. */
function applyImageSetLayerSetting(layer, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    layer[funcName](value);
}
/** Extract all of the current settings of a `ImageSetLayer` or equivalent. */
function extractImageSetLayerSettings(layer) {
    var e_1, _a;
    var s = extractLayerSettings(layer);
    try {
        for (var justImageSetLayerSettingNames_1 = __values(justImageSetLayerSettingNames), justImageSetLayerSettingNames_1_1 = justImageSetLayerSettingNames_1.next(); !justImageSetLayerSettingNames_1_1.done; justImageSetLayerSettingNames_1_1 = justImageSetLayerSettingNames_1.next()) {
            var n = justImageSetLayerSettingNames_1_1.value;
            s.push([n, layer["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justImageSetLayerSettingNames_1_1 && !justImageSetLayerSettingNames_1_1.done && (_a = justImageSetLayerSettingNames_1.return)) _a.call(justImageSetLayerSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `ImageSetLayer`, or equivalent, to another. */
function copyImageSetLayerSettings(source, dest) {
    var e_2, _a;
    copyLayerSettings(source, dest);
    try {
        for (var justImageSetLayerSettingNames_2 = tslib_es6_values(justImageSetLayerSettingNames), justImageSetLayerSettingNames_2_1 = justImageSetLayerSettingNames_2.next(); !justImageSetLayerSettingNames_2_1.done; justImageSetLayerSettingNames_2_1 = justImageSetLayerSettingNames_2.next()) {
            var n = justImageSetLayerSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justImageSetLayerSettingNames_2_1 && !justImageSetLayerSettingNames_2_1.done && (_a = justImageSetLayerSettingNames_2.return)) _a.call(justImageSetLayerSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `ImageSetLayerSettingsInterface`. */
var imagesetlayer_ImageSetLayerState = /** @class */ (function (_super) {
    __extends(ImageSetLayerState, _super);
    function ImageSetLayerState(source) {
        var _this = 
        // Here we redundantly copy the generic Layer settings, but TypeScript
        // requires the super() call. Oh well.
        _super.call(this, source) || this;
        copyImageSetLayerSettings(source, _this);
        return _this;
    }
    ImageSetLayerState.prototype.get_colorMapperName = function () {
        return this.colorMapperName;
    };
    ImageSetLayerState.prototype.set_colorMapperName = function (v) {
        this.colorMapperName = v;
        return v;
    };
    ImageSetLayerState.prototype.get_overrideDefaultLayer = function () {
        return this.overrideDefaultLayer;
    };
    ImageSetLayerState.prototype.set_overrideDefaultLayer = function (v) {
        this.overrideDefaultLayer = v;
        return v;
    };
    return ImageSetLayerState;
}(LayerState));

//# sourceMappingURL=imagesetlayer.js.map
;// CONCATENATED MODULE: ../engine-helpers/dist/src/spreadsheetlayer.js
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling "spreadsheet" layer settings. */


var justSpreadSheetLayerSettingNames = [
    "altColumn",
    "altType",
    "altUnit",
    "barChartBitmask",
    "beginRange",
    "cartesianCustomScale",
    "cartesianScale",
    "colorMapColumn",
    "colorMapperName",
    "coordinatesType",
    "decay",
    "dynamicColor",
    "dynamicData",
    "endDateColumn",
    "endRange",
    "geometryColumn",
    "hyperlinkColumn",
    "hyperlinkFormat",
    "latColumn",
    "lngColumn",
    "markerColumn",
    "markerIndex",
    "markerScale",
    "nameColumn",
    "normalizeColorMap",
    "normalizeColorMapMax",
    "normalizeColorMapMin",
    "normalizeSize",
    "normalizeSizeClip",
    "normalizeSizeMax",
    "normalizeSizeMin",
    "plotType",
    "pointScaleType",
    "raUnits",
    "scaleFactor",
    "showFarSide",
    "sizeColumn",
    "startDateColumn",
    "timeSeries",
    "xAxisColumn",
    "xAxisReverse",
    "yAxisColumn",
    "yAxisReverse",
    "zAxisColumn",
    "zAxisReverse",
];
/** A list of the names of the available settings for `SpreadSheetLayer`
 * instances and their equivalents (things implementing
 * [[SpreadSheetLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
var spreadSheetLayerSettingNames = layerSettingNames.concat(justSpreadSheetLayerSettingNames);
/** Type guard function for `SpreadSheetLayerSetting`. */
function isSpreadSheetLayerSetting(obj) {
    // No special settings specific to non-base SpreadSheetLayerSetting.
    return isLayerSetting(obj) || isBaseSpreadSheetLayerSetting(obj);
}
/** Apply a setting to a `SpreadSheetLayer` or equivalent. */
function applySpreadSheetLayerSetting(layer, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1]; // eslint-disable-line @typescript-eslint/no-explicit-any
    layer[funcName](value); // eslint-disable-line @typescript-eslint/no-explicit-any
}
/** Extract all of the current settings of a `SpreadSheetLayer` or equivalent. */
function extractSpreadSheetLayerSettings(layer) {
    var e_1, _a;
    var s = extractLayerSettings(layer);
    try {
        for (var justSpreadSheetLayerSettingNames_1 = __values(justSpreadSheetLayerSettingNames), justSpreadSheetLayerSettingNames_1_1 = justSpreadSheetLayerSettingNames_1.next(); !justSpreadSheetLayerSettingNames_1_1.done; justSpreadSheetLayerSettingNames_1_1 = justSpreadSheetLayerSettingNames_1.next()) {
            var n = justSpreadSheetLayerSettingNames_1_1.value;
            s.push([n, layer["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justSpreadSheetLayerSettingNames_1_1 && !justSpreadSheetLayerSettingNames_1_1.done && (_a = justSpreadSheetLayerSettingNames_1.return)) _a.call(justSpreadSheetLayerSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `SpreadSheetLayer`, or equivalent, to another. */
function copySpreadSheetLayerSettings(source, dest) {
    var e_2, _a;
    copyLayerSettings(source, dest);
    try {
        for (var justSpreadSheetLayerSettingNames_2 = tslib_es6_values(justSpreadSheetLayerSettingNames), justSpreadSheetLayerSettingNames_2_1 = justSpreadSheetLayerSettingNames_2.next(); !justSpreadSheetLayerSettingNames_2_1.done; justSpreadSheetLayerSettingNames_2_1 = justSpreadSheetLayerSettingNames_2.next()) {
            var n = justSpreadSheetLayerSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justSpreadSheetLayerSettingNames_2_1 && !justSpreadSheetLayerSettingNames_2_1.done && (_a = justSpreadSheetLayerSettingNames_2.return)) _a.call(justSpreadSheetLayerSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `SpreadSheetLayerSettingsInterface`. */
var SpreadSheetLayerState = /** @class */ (function (_super) {
    __extends(SpreadSheetLayerState, _super);
    function SpreadSheetLayerState(source) {
        var _this = 
        // Here we redundantly copy the generic Layer settings, but TypeScript
        // requires the super() call. Oh well.
        _super.call(this, source) || this;
        copySpreadSheetLayerSettings(source, _this);
        return _this;
    }
    SpreadSheetLayerState.prototype.get_altColumn = function () {
        return this.altColumn;
    };
    SpreadSheetLayerState.prototype.set_altColumn = function (v) {
        this.altColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_altType = function () {
        return this.altType;
    };
    SpreadSheetLayerState.prototype.set_altType = function (v) {
        this.altType = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_altUnit = function () {
        return this.altUnit;
    };
    SpreadSheetLayerState.prototype.set_altUnit = function (v) {
        this.altUnit = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_barChartBitmask = function () {
        return this.barChartBitmask;
    };
    SpreadSheetLayerState.prototype.set_barChartBitmask = function (v) {
        this.barChartBitmask = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_beginRange = function () {
        return this.beginRange;
    };
    SpreadSheetLayerState.prototype.set_beginRange = function (v) {
        this.beginRange = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_cartesianCustomScale = function () {
        return this.cartesianCustomScale;
    };
    SpreadSheetLayerState.prototype.set_cartesianCustomScale = function (v) {
        this.cartesianCustomScale = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_cartesianScale = function () {
        return this.cartesianScale;
    };
    SpreadSheetLayerState.prototype.set_cartesianScale = function (v) {
        this.cartesianScale = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_colorMapColumn = function () {
        return this.colorMapColumn;
    };
    SpreadSheetLayerState.prototype.set_colorMapColumn = function (v) {
        this.colorMapColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_colorMapperName = function () {
        return this.colorMapperName;
    };
    SpreadSheetLayerState.prototype.set_colorMapperName = function (v) {
        this.colorMapperName = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_coordinatesType = function () {
        return this.coordinatesType;
    };
    SpreadSheetLayerState.prototype.set_coordinatesType = function (v) {
        this.coordinatesType = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_decay = function () {
        return this.decay;
    };
    SpreadSheetLayerState.prototype.set_decay = function (v) {
        this.decay = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_dynamicColor = function () {
        return this.dynamicColor;
    };
    SpreadSheetLayerState.prototype.set_dynamicColor = function (v) {
        this.dynamicColor = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_dynamicData = function () {
        return this.dynamicData;
    };
    SpreadSheetLayerState.prototype.set_dynamicData = function (v) {
        this.dynamicData = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_endDateColumn = function () {
        return this.endDateColumn;
    };
    SpreadSheetLayerState.prototype.set_endDateColumn = function (v) {
        this.endDateColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_endRange = function () {
        return this.endRange;
    };
    SpreadSheetLayerState.prototype.set_endRange = function (v) {
        this.endRange = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_geometryColumn = function () {
        return this.geometryColumn;
    };
    SpreadSheetLayerState.prototype.set_geometryColumn = function (v) {
        this.geometryColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_hyperlinkColumn = function () {
        return this.hyperlinkColumn;
    };
    SpreadSheetLayerState.prototype.set_hyperlinkColumn = function (v) {
        this.hyperlinkColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_hyperlinkFormat = function () {
        return this.hyperlinkFormat;
    };
    SpreadSheetLayerState.prototype.set_hyperlinkFormat = function (v) {
        this.hyperlinkFormat = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_latColumn = function () {
        return this.latColumn;
    };
    SpreadSheetLayerState.prototype.set_latColumn = function (v) {
        this.latColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_lngColumn = function () {
        return this.lngColumn;
    };
    SpreadSheetLayerState.prototype.set_lngColumn = function (v) {
        this.lngColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_markerColumn = function () {
        return this.markerColumn;
    };
    SpreadSheetLayerState.prototype.set_markerColumn = function (v) {
        this.markerColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_markerIndex = function () {
        return this.markerIndex;
    };
    SpreadSheetLayerState.prototype.set_markerIndex = function (v) {
        this.markerIndex = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_markerScale = function () {
        return this.markerScale;
    };
    SpreadSheetLayerState.prototype.set_markerScale = function (v) {
        this.markerScale = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_nameColumn = function () {
        return this.nameColumn;
    };
    SpreadSheetLayerState.prototype.set_nameColumn = function (v) {
        this.nameColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeColorMap = function () {
        return this.normalizeColorMap;
    };
    SpreadSheetLayerState.prototype.set_normalizeColorMap = function (v) {
        this.normalizeColorMap = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeColorMapMax = function () {
        return this.normalizeColorMapMax;
    };
    SpreadSheetLayerState.prototype.set_normalizeColorMapMax = function (v) {
        this.normalizeColorMapMax = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeColorMapMin = function () {
        return this.normalizeColorMapMin;
    };
    SpreadSheetLayerState.prototype.set_normalizeColorMapMin = function (v) {
        this.normalizeColorMapMin = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeSize = function () {
        return this.normalizeSize;
    };
    SpreadSheetLayerState.prototype.set_normalizeSize = function (v) {
        this.normalizeSize = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeSizeClip = function () {
        return this.normalizeSizeClip;
    };
    SpreadSheetLayerState.prototype.set_normalizeSizeClip = function (v) {
        this.normalizeSizeClip = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeSizeMax = function () {
        return this.normalizeSizeMax;
    };
    SpreadSheetLayerState.prototype.set_normalizeSizeMax = function (v) {
        this.normalizeSizeMax = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeSizeMin = function () {
        return this.normalizeSizeMin;
    };
    SpreadSheetLayerState.prototype.set_normalizeSizeMin = function (v) {
        this.normalizeSizeMin = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_plotType = function () {
        return this.plotType;
    };
    SpreadSheetLayerState.prototype.set_plotType = function (v) {
        this.plotType = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_pointScaleType = function () {
        return this.pointScaleType;
    };
    SpreadSheetLayerState.prototype.set_pointScaleType = function (v) {
        this.pointScaleType = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_raUnits = function () {
        return this.raUnits;
    };
    SpreadSheetLayerState.prototype.set_raUnits = function (v) {
        this.raUnits = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_scaleFactor = function () {
        return this.scaleFactor;
    };
    SpreadSheetLayerState.prototype.set_scaleFactor = function (v) {
        this.scaleFactor = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_showFarSide = function () {
        return this.showFarSide;
    };
    SpreadSheetLayerState.prototype.set_showFarSide = function (v) {
        this.showFarSide = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_sizeColumn = function () {
        return this.sizeColumn;
    };
    SpreadSheetLayerState.prototype.set_sizeColumn = function (v) {
        this.sizeColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_startDateColumn = function () {
        return this.startDateColumn;
    };
    SpreadSheetLayerState.prototype.set_startDateColumn = function (v) {
        this.startDateColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_timeSeries = function () {
        return this.timeSeries;
    };
    SpreadSheetLayerState.prototype.set_timeSeries = function (v) {
        this.timeSeries = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_xAxisColumn = function () {
        return this.xAxisColumn;
    };
    SpreadSheetLayerState.prototype.set_xAxisColumn = function (v) {
        this.xAxisColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_xAxisReverse = function () {
        return this.xAxisReverse;
    };
    SpreadSheetLayerState.prototype.set_xAxisReverse = function (v) {
        this.xAxisReverse = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_yAxisColumn = function () {
        return this.yAxisColumn;
    };
    SpreadSheetLayerState.prototype.set_yAxisColumn = function (v) {
        this.yAxisColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_yAxisReverse = function () {
        return this.yAxisReverse;
    };
    SpreadSheetLayerState.prototype.set_yAxisReverse = function (v) {
        this.yAxisReverse = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_zAxisColumn = function () {
        return this.zAxisColumn;
    };
    SpreadSheetLayerState.prototype.set_zAxisColumn = function (v) {
        this.zAxisColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_zAxisReverse = function () {
        return this.zAxisReverse;
    };
    SpreadSheetLayerState.prototype.set_zAxisReverse = function (v) {
        this.zAxisReverse = v;
        return v;
    };
    return SpreadSheetLayerState;
}(LayerState));

//# sourceMappingURL=spreadsheetlayer.js.map
;// CONCATENATED MODULE: ../engine-helpers/dist/src/annotation.js
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/** A list of the names of the available settings for annotations. */
var annotationSettingNames = [
    "id",
    "label",
    "opacity",
    "showHoverLabel",
    "tag",
];
var annotationSettingTypeInfo = {
    "id/string": true,
    "label/string": true,
    "opacity/number": true,
    "showHoverLabel/boolean": true,
    "tag/string": true,
};
/** Type guard function for `AnnotationSetting`. */
function annotation_isAnnotationSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return key in annotationSettingTypeInfo;
}
/** Apply a setting to a generic `Annotation` or equivalent. */
function applyAnnotationSetting(annotation, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    annotation[funcName](value);
}
/** Extract all of the current settings of a `Annotation` or equivalent. */
function annotation_extractAnnotationSettings(annotation) {
    var e_1, _a;
    var s = [];
    try {
        for (var annotationSettingNames_1 = __values(annotationSettingNames), annotationSettingNames_1_1 = annotationSettingNames_1.next(); !annotationSettingNames_1_1.done; annotationSettingNames_1_1 = annotationSettingNames_1.next()) {
            var n = annotationSettingNames_1_1.value;
            s.push([n, annotation["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (annotationSettingNames_1_1 && !annotationSettingNames_1_1.done && (_a = annotationSettingNames_1.return)) _a.call(annotationSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `Annotation`, or equivalent, to another. */
function copyAnnotationSettings(source, dest) {
    var e_2, _a;
    try {
        for (var annotationSettingNames_2 = tslib_es6_values(annotationSettingNames), annotationSettingNames_2_1 = annotationSettingNames_2.next(); !annotationSettingNames_2_1.done; annotationSettingNames_2_1 = annotationSettingNames_2.next()) {
            var n = annotationSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (annotationSettingNames_2_1 && !annotationSettingNames_2_1.done && (_a = annotationSettingNames_2.return)) _a.call(annotationSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `AnnotationSettingsInterface`. */
var AnnotationState = /** @class */ (function () {
    function AnnotationState(source) {
        copyAnnotationSettings(source, this);
    }
    AnnotationState.prototype.get_id = function () {
        return this.id;
    };
    AnnotationState.prototype.set_id = function (v) {
        this.id = v;
        return v;
    };
    AnnotationState.prototype.get_label = function () {
        return this.label;
    };
    AnnotationState.prototype.set_label = function (v) {
        this.label = v;
        return v;
    };
    AnnotationState.prototype.get_opacity = function () {
        return this.opacity;
    };
    AnnotationState.prototype.set_opacity = function (v) {
        this.opacity = v;
        return v;
    };
    AnnotationState.prototype.get_showHoverLabel = function () {
        return this.showHoverLabel;
    };
    AnnotationState.prototype.set_showHoverLabel = function (v) {
        this.showHoverLabel = v;
        return v;
    };
    AnnotationState.prototype.get_tag = function () {
        return this.tag;
    };
    AnnotationState.prototype.set_tag = function (v) {
        this.tag = v;
        return v;
    };
    return AnnotationState;
}());

//# sourceMappingURL=annotation.js.map
;// CONCATENATED MODULE: ../engine-helpers/dist/src/circleannotation.js
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License


var justCircleAnnotationSettingNames = [
    "fill",
    "fillColor",
    "lineColor",
    "lineWidth",
    "radius",
    "skyRelative",
];
/** A list of the names of the available settings for `CircleAnnotation`
 * instances and their equivalents (things implementing
 * [[CircleAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
var circleAnnotationSettingNames = annotationSettingNames.concat(justCircleAnnotationSettingNames);
var circleAnnotationSettingTypeInfo = {
    "fill/boolean": true,
    "fillColor/string": true,
    "lineColor/string": true,
    "lineWidth/number": true,
    "radius/number": true,
    "skyRelative/boolean": true,
};
/** Type guard function for `CircleAnnotationSetting`. */
function isCircleAnnotationSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return (key in circleAnnotationSettingTypeInfo) || isAnnotationSetting(obj);
}
/** Apply a setting to a generic `CircleAnnotation` or equivalent. */
function applyCircleAnnotationSetting(circle, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    circle[funcName](value);
}
/** Extract all of the current settings of a `CircleAnnotation` or equivalent. */
function extractCircleAnnotationSettings(circle) {
    var e_1, _a;
    var s = extractAnnotationSettings(circle);
    try {
        for (var justCircleAnnotationSettingNames_1 = __values(justCircleAnnotationSettingNames), justCircleAnnotationSettingNames_1_1 = justCircleAnnotationSettingNames_1.next(); !justCircleAnnotationSettingNames_1_1.done; justCircleAnnotationSettingNames_1_1 = justCircleAnnotationSettingNames_1.next()) {
            var n = justCircleAnnotationSettingNames_1_1.value;
            s.push([n, circle["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justCircleAnnotationSettingNames_1_1 && !justCircleAnnotationSettingNames_1_1.done && (_a = justCircleAnnotationSettingNames_1.return)) _a.call(justCircleAnnotationSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `CircleAnnotation`, or equivalent, to another. */
function copyCircleAnnotationSettings(source, dest) {
    var e_2, _a;
    copyAnnotationSettings(source, dest);
    try {
        for (var justCircleAnnotationSettingNames_2 = tslib_es6_values(justCircleAnnotationSettingNames), justCircleAnnotationSettingNames_2_1 = justCircleAnnotationSettingNames_2.next(); !justCircleAnnotationSettingNames_2_1.done; justCircleAnnotationSettingNames_2_1 = justCircleAnnotationSettingNames_2.next()) {
            var n = justCircleAnnotationSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justCircleAnnotationSettingNames_2_1 && !justCircleAnnotationSettingNames_2_1.done && (_a = justCircleAnnotationSettingNames_2.return)) _a.call(justCircleAnnotationSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `CircleAnnotationSettingsInterface`. */
var CircleAnnotationState = /** @class */ (function (_super) {
    __extends(CircleAnnotationState, _super);
    function CircleAnnotationState(source) {
        var _this = _super.call(this, source) || this;
        copyCircleAnnotationSettings(source, _this);
        return _this;
    }
    CircleAnnotationState.prototype.get_fill = function () {
        return this.fill;
    };
    CircleAnnotationState.prototype.set_fill = function (v) {
        this.fill = v;
        return v;
    };
    CircleAnnotationState.prototype.get_fillColor = function () {
        return this.fillColor;
    };
    CircleAnnotationState.prototype.set_fillColor = function (v) {
        this.fillColor = v;
        return v;
    };
    CircleAnnotationState.prototype.get_lineColor = function () {
        return this.lineColor;
    };
    CircleAnnotationState.prototype.set_lineColor = function (v) {
        this.lineColor = v;
        return v;
    };
    CircleAnnotationState.prototype.get_lineWidth = function () {
        return this.lineWidth;
    };
    CircleAnnotationState.prototype.set_lineWidth = function (v) {
        this.lineWidth = v;
        return v;
    };
    CircleAnnotationState.prototype.get_radius = function () {
        return this.radius;
    };
    CircleAnnotationState.prototype.set_radius = function (v) {
        this.radius = v;
        return v;
    };
    CircleAnnotationState.prototype.get_skyRelative = function () {
        return this.skyRelative;
    };
    CircleAnnotationState.prototype.set_skyRelative = function (v) {
        this.skyRelative = v;
        return v;
    };
    return CircleAnnotationState;
}(AnnotationState));

//# sourceMappingURL=circleannotation.js.map
;// CONCATENATED MODULE: ../engine-helpers/dist/src/engine.js
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling core engine settings. */


/** A list of the names of the core engine settings. */
var engineSettingNames = [
    "actualPlanetScale",
    "altAzGridColor",
    "constellationArtFilter",
    "constellationBoundariesFilter",
    "constellationFigureColor",
    "constellationFiguresFilter",
    "constellationBoundryColor",
    "constellationNamesFilter",
    "constellationLabelsHeight",
    "constellations",
    "constellationSelectionColor",
    "constellationsEnabled",
    "crosshairsColor",
    "earthCutawayView",
    "eclipticColor",
    "eclipticGridColor",
    "equatorialGridColor",
    "galacticGridColor",
    "galacticMode",
    "localHorizonMode",
    "locationAltitude",
    "locationLat",
    "locationLng",
    "milkyWayModel",
    "minorPlanetsFilter",
    "planetOrbitsFilter",
    "precessionChartColor",
    "showAltAzGrid",
    "showAltAzGridText",
    "showConstellationBoundries",
    "showConstellationFigures",
    "showConstellationLabels",
    "showConstellationPictures",
    "showConstellations",
    "showConstellationSelection",
    "showCrosshairs",
    "showEarthSky",
    "showEcliptic",
    "showEclipticGrid",
    "showEclipticGridText",
    "showEclipticOverviewText",
    "showElevationModel",
    "showEquatorialGridText",
    "showGalacticGrid",
    "showGalacticGridText",
    "showGrid",
    "showHorizon",
    "showISSModel",
    "showPrecessionChart",
    "showSkyGrids",
    "showSkyOverlays",
    "showSkyOverlaysIn3d",
    "showSkyNode",
    "showSolarSystem",
    "smoothPan",
    "solarSystemCMB",
    "solarSystemCosmos",
    "solarSystemLighting",
    "solarSystemMilkyWay",
    "solarSystemMinorPlanets",
    "solarSystemMultiRes",
    "solarSystemOrbits",
    "solarSystemOverlays",
    "solarSystemPlanets",
    "solarSystemScale",
    "solarSystemStars",
    "solarSystemMinorOrbits",
];
var engineSettingTypeInfo = {
    "altAzGridColor/Color": true,
    "constellationArtFilter/ConstellationFilter": true,
    "constellationBoundariesFilter/ConstellationFilter": true,
    "constellationBoundryColor/Color": true,
    "constellationFigureColor/Color": true,
    "constellationFiguresFilter/ConstellationFilter": true,
    "constellationNamesFilter/ConstellationFilter": true,
    "constellationSelectionColor/Color": true,
    "crosshairsColor/Color": true,
    "eclipticColor/Color": true,
    "eclipticGridColor/Color": true,
    "equatorialGridColor/Color": true,
    "galacticGridColor/Color": true,
    "precessionChartColor/Color": true,
};
/** Type guard function for `EngineSetting`. */
function isEngineSetting(obj) {
    var typekey = typeof obj[1];
    if (obj[1] instanceof Color) {
        typekey = "Color";
    }
    else if (obj[1] instanceof ConstellationFilter) {
        typekey = "ConstellationFilter";
    }
    var key = obj[0] + "/" + typekey;
    return isBaseEngineSetting(obj) || (key in engineSettingTypeInfo);
}
/** Apply a setting to the engine or an equivalent. */
function applyEngineSetting(engine, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    engine[funcName](value);
}
/** Extract all of the current settings of the engine or an equivalent. */
function extractEngineSettings(engine) {
    var e_1, _a;
    var s = [];
    try {
        for (var engineSettingNames_1 = __values(engineSettingNames), engineSettingNames_1_1 = engineSettingNames_1.next(); !engineSettingNames_1_1.done; engineSettingNames_1_1 = engineSettingNames_1.next()) {
            var n = engineSettingNames_1_1.value;
            s.push([n, engine["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (engineSettingNames_1_1 && !engineSettingNames_1_1.done && (_a = engineSettingNames_1.return)) _a.call(engineSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from the engine, or an equivalent, to another. */
function copyEngineSettings(source, dest) {
    var e_2, _a;
    try {
        for (var engineSettingNames_2 = tslib_es6_values(engineSettingNames), engineSettingNames_2_1 = engineSettingNames_2.next(); !engineSettingNames_2_1.done; engineSettingNames_2_1 = engineSettingNames_2.next()) {
            var n = engineSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (engineSettingNames_2_1 && !engineSettingNames_2_1.done && (_a = engineSettingNames_2.return)) _a.call(engineSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `EngineSettingsInterface`. */
var EngineState = /** @class */ (function () {
    function EngineState(source) {
        copyEngineSettings(source, this);
    }
    EngineState.prototype.get_actualPlanetScale = function () {
        return this.actualPlanetScale;
    };
    EngineState.prototype.set_actualPlanetScale = function (v) {
        this.actualPlanetScale = v;
        return v;
    };
    EngineState.prototype.get_constellationArtFilter = function () {
        return this.constellationArtFilter;
    };
    EngineState.prototype.set_constellationArtFilter = function (v) {
        this.constellationArtFilter = v;
        return v;
    };
    EngineState.prototype.get_constellationBoundariesFilter = function () {
        return this.constellationBoundariesFilter;
    };
    EngineState.prototype.set_constellationBoundariesFilter = function (v) {
        this.constellationBoundariesFilter = v;
        return v;
    };
    EngineState.prototype.get_constellationFigureColor = function () {
        return this.constellationFigureColor;
    };
    EngineState.prototype.set_constellationFigureColor = function (v) {
        this.constellationFigureColor = v;
        return v;
    };
    EngineState.prototype.get_constellationFiguresFilter = function () {
        return this.constellationFiguresFilter;
    };
    EngineState.prototype.set_constellationFiguresFilter = function (v) {
        this.constellationFiguresFilter = v;
        return v;
    };
    EngineState.prototype.get_constellationBoundryColor = function () {
        return this.constellationBoundryColor;
    };
    EngineState.prototype.set_constellationBoundryColor = function (v) {
        this.constellationBoundryColor = v;
        return v;
    };
    EngineState.prototype.get_constellationNamesFilter = function () {
        return this.constellationNamesFilter;
    };
    EngineState.prototype.set_constellationNamesFilter = function (v) {
        this.constellationNamesFilter = v;
        return v;
    };
    EngineState.prototype.get_constellations = function () {
        return this.constellations;
    };
    EngineState.prototype.set_constellations = function (v) {
        this.constellations = v;
        return v;
    };
    EngineState.prototype.get_constellationSelectionColor = function () {
        return this.constellationSelectionColor;
    };
    EngineState.prototype.set_constellationSelectionColor = function (v) {
        this.constellationSelectionColor = v;
        return v;
    };
    EngineState.prototype.get_constellationsEnabled = function () {
        return this.constellationsEnabled;
    };
    EngineState.prototype.set_constellationsEnabled = function (v) {
        this.constellationsEnabled = v;
        return v;
    };
    EngineState.prototype.get_crosshairsColor = function () {
        return this.crosshairsColor;
    };
    EngineState.prototype.set_crosshairsColor = function (v) {
        this.crosshairsColor = v;
        return v;
    };
    EngineState.prototype.get_earthCutawayView = function () {
        return this.earthCutawayView;
    };
    EngineState.prototype.set_earthCutawayView = function (v) {
        this.earthCutawayView = v;
        return v;
    };
    EngineState.prototype.get_galacticMode = function () {
        return this.galacticMode;
    };
    EngineState.prototype.set_galacticMode = function (v) {
        this.galacticMode = v;
        return v;
    };
    EngineState.prototype.get_localHorizonMode = function () {
        return this.localHorizonMode;
    };
    EngineState.prototype.set_localHorizonMode = function (v) {
        this.localHorizonMode = v;
        return v;
    };
    EngineState.prototype.get_locationAltitude = function () {
        return this.locationAltitude;
    };
    EngineState.prototype.set_locationAltitude = function (v) {
        this.locationAltitude = v;
        return v;
    };
    EngineState.prototype.get_locationLat = function () {
        return this.locationLat;
    };
    EngineState.prototype.set_locationLat = function (v) {
        this.locationLat = v;
        return v;
    };
    EngineState.prototype.get_locationLng = function () {
        return this.locationLng;
    };
    EngineState.prototype.set_locationLng = function (v) {
        this.locationLng = v;
        return v;
    };
    EngineState.prototype.get_milkyWayModel = function () {
        return this.milkyWayModel;
    };
    EngineState.prototype.set_milkyWayModel = function (v) {
        this.milkyWayModel = v;
        return v;
    };
    EngineState.prototype.get_minorPlanetsFilter = function () {
        return this.minorPlanetsFilter;
    };
    EngineState.prototype.set_minorPlanetsFilter = function (v) {
        this.minorPlanetsFilter = v;
        return v;
    };
    EngineState.prototype.get_planetOrbitsFilter = function () {
        return this.planetOrbitsFilter;
    };
    EngineState.prototype.set_planetOrbitsFilter = function (v) {
        this.planetOrbitsFilter = v;
        return v;
    };
    EngineState.prototype.get_showAltAzGrid = function () {
        return this.showAltAzGrid;
    };
    EngineState.prototype.set_showAltAzGrid = function (v) {
        this.showAltAzGrid = v;
        return v;
    };
    EngineState.prototype.get_showAltAzGridText = function () {
        return this.showAltAzGridText;
    };
    EngineState.prototype.set_showAltAzGridText = function (v) {
        this.showAltAzGridText = v;
        return v;
    };
    EngineState.prototype.get_showConstellationBoundries = function () {
        return this.showConstellationBoundries;
    };
    EngineState.prototype.set_showConstellationBoundries = function (v) {
        this.showConstellationBoundries = v;
        return v;
    };
    EngineState.prototype.get_showConstellationFigures = function () {
        return this.showConstellationFigures;
    };
    EngineState.prototype.set_showConstellationFigures = function (v) {
        this.showConstellationFigures = v;
        return v;
    };
    EngineState.prototype.get_showConstellationLabels = function () {
        return this.showConstellationLabels;
    };
    EngineState.prototype.set_showConstellationLabels = function (v) {
        this.showConstellationLabels = v;
        return v;
    };
    EngineState.prototype.get_showConstellationPictures = function () {
        return this.showConstellationPictures;
    };
    EngineState.prototype.set_showConstellationPictures = function (v) {
        this.showConstellationPictures = v;
        return v;
    };
    EngineState.prototype.get_showConstellations = function () {
        return this.showConstellations;
    };
    EngineState.prototype.set_showConstellations = function (v) {
        this.showConstellations = v;
        return v;
    };
    EngineState.prototype.get_showConstellationSelection = function () {
        return this.showConstellationSelection;
    };
    EngineState.prototype.set_showConstellationSelection = function (v) {
        this.showConstellationSelection = v;
        return v;
    };
    EngineState.prototype.get_showCrosshairs = function () {
        return this.showCrosshairs;
    };
    EngineState.prototype.set_showCrosshairs = function (v) {
        this.showCrosshairs = v;
        return v;
    };
    EngineState.prototype.get_showEarthSky = function () {
        return this.showEarthSky;
    };
    EngineState.prototype.set_showEarthSky = function (v) {
        this.showEarthSky = v;
        return v;
    };
    EngineState.prototype.get_showEcliptic = function () {
        return this.showEcliptic;
    };
    EngineState.prototype.set_showEcliptic = function (v) {
        this.showEcliptic = v;
        return v;
    };
    EngineState.prototype.get_showEclipticGrid = function () {
        return this.showEclipticGrid;
    };
    EngineState.prototype.set_showEclipticGrid = function (v) {
        this.showEclipticGrid = v;
        return v;
    };
    EngineState.prototype.get_showEclipticGridText = function () {
        return this.showEclipticGridText;
    };
    EngineState.prototype.set_showEclipticGridText = function (v) {
        this.showEclipticGridText = v;
        return v;
    };
    EngineState.prototype.get_showEclipticOverviewText = function () {
        return this.showEclipticOverviewText;
    };
    EngineState.prototype.set_showEclipticOverviewText = function (v) {
        this.showEclipticOverviewText = v;
        return v;
    };
    EngineState.prototype.get_showElevationModel = function () {
        return this.showElevationModel;
    };
    EngineState.prototype.set_showElevationModel = function (v) {
        this.showElevationModel = v;
        return v;
    };
    EngineState.prototype.get_showEquatorialGridText = function () {
        return this.showEquatorialGridText;
    };
    EngineState.prototype.set_showEquatorialGridText = function (v) {
        this.showEquatorialGridText = v;
        return v;
    };
    EngineState.prototype.get_showGalacticGrid = function () {
        return this.showGalacticGrid;
    };
    EngineState.prototype.set_showGalacticGrid = function (v) {
        this.showGalacticGrid = v;
        return v;
    };
    EngineState.prototype.get_showGalacticGridText = function () {
        return this.showGalacticGridText;
    };
    EngineState.prototype.set_showGalacticGridText = function (v) {
        this.showGalacticGridText = v;
        return v;
    };
    EngineState.prototype.get_showGrid = function () {
        return this.showGrid;
    };
    EngineState.prototype.set_showGrid = function (v) {
        this.showGrid = v;
        return v;
    };
    EngineState.prototype.get_showHorizon = function () {
        return this.showHorizon;
    };
    EngineState.prototype.set_showHorizon = function (v) {
        this.showHorizon = v;
        return v;
    };
    EngineState.prototype.get_showISSModel = function () {
        return this.showISSModel;
    };
    EngineState.prototype.set_showISSModel = function (v) {
        this.showISSModel = v;
        return v;
    };
    EngineState.prototype.get_showPrecessionChart = function () {
        return this.showPrecessionChart;
    };
    EngineState.prototype.set_showPrecessionChart = function (v) {
        this.showPrecessionChart = v;
        return v;
    };
    EngineState.prototype.get_showSkyGrids = function () {
        return this.showSkyGrids;
    };
    EngineState.prototype.set_showSkyGrids = function (v) {
        this.showSkyGrids = v;
        return v;
    };
    EngineState.prototype.get_showSkyOverlays = function () {
        return this.showSkyOverlays;
    };
    EngineState.prototype.set_showSkyOverlays = function (v) {
        this.showSkyOverlays = v;
        return v;
    };
    EngineState.prototype.get_showSkyOverlaysIn3d = function () {
        return this.showSkyOverlaysIn3d;
    };
    EngineState.prototype.set_showSkyOverlaysIn3d = function (v) {
        this.showSkyOverlaysIn3d = v;
        return v;
    };
    EngineState.prototype.get_showSkyNode = function () {
        return this.showSkyNode;
    };
    EngineState.prototype.set_showSkyNode = function (v) {
        this.showSkyNode = v;
        return v;
    };
    EngineState.prototype.get_showSolarSystem = function () {
        return this.showSolarSystem;
    };
    EngineState.prototype.set_showSolarSystem = function (v) {
        this.showSolarSystem = v;
        return v;
    };
    EngineState.prototype.get_smoothPan = function () {
        return this.smoothPan;
    };
    EngineState.prototype.set_smoothPan = function (v) {
        this.smoothPan = v;
        return v;
    };
    EngineState.prototype.get_solarSystemCMB = function () {
        return this.solarSystemCMB;
    };
    EngineState.prototype.set_solarSystemCMB = function (v) {
        this.solarSystemCMB = v;
        return v;
    };
    EngineState.prototype.get_solarSystemCosmos = function () {
        return this.solarSystemCosmos;
    };
    EngineState.prototype.set_solarSystemCosmos = function (v) {
        this.solarSystemCosmos = v;
        return v;
    };
    EngineState.prototype.get_solarSystemLighting = function () {
        return this.solarSystemLighting;
    };
    EngineState.prototype.set_solarSystemLighting = function (v) {
        this.solarSystemLighting = v;
        return v;
    };
    EngineState.prototype.get_solarSystemMilkyWay = function () {
        return this.solarSystemMilkyWay;
    };
    EngineState.prototype.set_solarSystemMilkyWay = function (v) {
        this.solarSystemMilkyWay = v;
        return v;
    };
    EngineState.prototype.get_solarSystemMinorPlanets = function () {
        return this.solarSystemMinorPlanets;
    };
    EngineState.prototype.set_solarSystemMinorPlanets = function (v) {
        this.solarSystemMinorPlanets = v;
        return v;
    };
    EngineState.prototype.get_solarSystemMultiRes = function () {
        return this.solarSystemMultiRes;
    };
    EngineState.prototype.set_solarSystemMultiRes = function (v) {
        this.solarSystemMultiRes = v;
        return v;
    };
    EngineState.prototype.get_solarSystemOrbits = function () {
        return this.solarSystemOrbits;
    };
    EngineState.prototype.set_solarSystemOrbits = function (v) {
        this.solarSystemOrbits = v;
        return v;
    };
    EngineState.prototype.get_solarSystemOverlays = function () {
        return this.solarSystemOverlays;
    };
    EngineState.prototype.set_solarSystemOverlays = function (v) {
        this.solarSystemOverlays = v;
        return v;
    };
    EngineState.prototype.get_solarSystemPlanets = function () {
        return this.solarSystemPlanets;
    };
    EngineState.prototype.set_solarSystemPlanets = function (v) {
        this.solarSystemPlanets = v;
        return v;
    };
    EngineState.prototype.get_solarSystemScale = function () {
        return this.solarSystemScale;
    };
    EngineState.prototype.set_solarSystemScale = function (v) {
        this.solarSystemScale = v;
        return v;
    };
    EngineState.prototype.get_solarSystemStars = function () {
        return this.solarSystemStars;
    };
    EngineState.prototype.set_solarSystemStars = function (v) {
        this.solarSystemStars = v;
        return v;
    };
    EngineState.prototype.get_solarSystemMinorOrbits = function () {
        return this.solarSystemMinorOrbits;
    };
    EngineState.prototype.set_solarSystemMinorOrbits = function (v) {
        this.solarSystemMinorOrbits = v;
        return v;
    };
    return EngineState;
}());

//# sourceMappingURL=engine.js.map
;// CONCATENATED MODULE: ../engine-helpers/dist/src/polyannotation.js
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License


var justPolyAnnotationSettingNames = [
    "fill",
    "fillColor",
    "lineColor",
    "lineWidth",
];
/** A list of the names of the available settings for `PolyAnnotation`
 * instances and their equivalents (things implementing
 * [[PolyAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
var polyAnnotationSettingNames = annotationSettingNames.concat(justPolyAnnotationSettingNames);
var polyAnnotationSettingTypeInfo = {
    "fill/boolean": true,
    "fillColor/string": true,
    "lineColor/string": true,
    "lineWidth/number": true,
};
/** Type guard function for `PolyAnnotationSetting`. */
function isPolyAnnotationSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return (key in polyAnnotationSettingTypeInfo) || isAnnotationSetting(obj);
}
/** Apply a setting to a generic `PolyAnnotation` or equivalent. */
function applyPolyAnnotationSetting(poly, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    poly[funcName](value);
}
/** Extract all of the current settings of a `PolyAnnotation` or equivalent. */
function extractPolyAnnotationSettings(poly) {
    var e_1, _a;
    var s = extractAnnotationSettings(poly);
    try {
        for (var justPolyAnnotationSettingNames_1 = __values(justPolyAnnotationSettingNames), justPolyAnnotationSettingNames_1_1 = justPolyAnnotationSettingNames_1.next(); !justPolyAnnotationSettingNames_1_1.done; justPolyAnnotationSettingNames_1_1 = justPolyAnnotationSettingNames_1.next()) {
            var n = justPolyAnnotationSettingNames_1_1.value;
            s.push([n, poly["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justPolyAnnotationSettingNames_1_1 && !justPolyAnnotationSettingNames_1_1.done && (_a = justPolyAnnotationSettingNames_1.return)) _a.call(justPolyAnnotationSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `PolyAnnotation`, or equivalent, to another. */
function copyPolyAnnotationSettings(source, dest) {
    var e_2, _a;
    copyAnnotationSettings(source, dest);
    try {
        for (var justPolyAnnotationSettingNames_2 = tslib_es6_values(justPolyAnnotationSettingNames), justPolyAnnotationSettingNames_2_1 = justPolyAnnotationSettingNames_2.next(); !justPolyAnnotationSettingNames_2_1.done; justPolyAnnotationSettingNames_2_1 = justPolyAnnotationSettingNames_2.next()) {
            var n = justPolyAnnotationSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justPolyAnnotationSettingNames_2_1 && !justPolyAnnotationSettingNames_2_1.done && (_a = justPolyAnnotationSettingNames_2.return)) _a.call(justPolyAnnotationSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `PolyAnnotationSettingsInterface`. */
var PolyAnnotationState = /** @class */ (function (_super) {
    __extends(PolyAnnotationState, _super);
    function PolyAnnotationState(source) {
        var _this = _super.call(this, source) || this;
        copyPolyAnnotationSettings(source, _this);
        return _this;
    }
    PolyAnnotationState.prototype.get_fill = function () {
        return this.fill;
    };
    PolyAnnotationState.prototype.set_fill = function (v) {
        this.fill = v;
        return v;
    };
    PolyAnnotationState.prototype.get_fillColor = function () {
        return this.fillColor;
    };
    PolyAnnotationState.prototype.set_fillColor = function (v) {
        this.fillColor = v;
        return v;
    };
    PolyAnnotationState.prototype.get_lineColor = function () {
        return this.lineColor;
    };
    PolyAnnotationState.prototype.set_lineColor = function (v) {
        this.lineColor = v;
        return v;
    };
    PolyAnnotationState.prototype.get_lineWidth = function () {
        return this.lineWidth;
    };
    PolyAnnotationState.prototype.set_lineWidth = function (v) {
        this.lineWidth = v;
        return v;
    };
    return PolyAnnotationState;
}(AnnotationState));

//# sourceMappingURL=polyannotation.js.map
;// CONCATENATED MODULE: ../engine-helpers/dist/src/polylineannotation.js
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License


var justPolyLineAnnotationSettingNames = [
    "lineColor",
    "lineWidth",
];
/** A list of the names of the available settings for `PolyLineAnnotation`
 * instances and their equivalents (things implementing
 * [[PolyLineAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
var polyLineAnnotationSettingNames = annotationSettingNames.concat(justPolyLineAnnotationSettingNames);
var polyLineAnnotationSettingTypeInfo = {
    "lineColor/string": true,
    "lineWidth/number": true,
};
/** Type guard function for `PolyLineAnnotationSetting`. */
function isPolyLineAnnotationSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return (key in polyLineAnnotationSettingTypeInfo) || isAnnotationSetting(obj);
}
/** Apply a setting to a generic `PolyLineAnnotation` or equivalent. */
function applyPolyLineAnnotationSetting(poly, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    poly[funcName](value);
}
/** Extract all of the current settings of a `PolyLineAnnotation` or equivalent. */
function extractPolyLineAnnotationSettings(poly) {
    var e_1, _a;
    var s = extractAnnotationSettings(poly);
    try {
        for (var justPolyLineAnnotationSettingNames_1 = __values(justPolyLineAnnotationSettingNames), justPolyLineAnnotationSettingNames_1_1 = justPolyLineAnnotationSettingNames_1.next(); !justPolyLineAnnotationSettingNames_1_1.done; justPolyLineAnnotationSettingNames_1_1 = justPolyLineAnnotationSettingNames_1.next()) {
            var n = justPolyLineAnnotationSettingNames_1_1.value;
            s.push([n, poly["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justPolyLineAnnotationSettingNames_1_1 && !justPolyLineAnnotationSettingNames_1_1.done && (_a = justPolyLineAnnotationSettingNames_1.return)) _a.call(justPolyLineAnnotationSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `PolyLineAnnotation`, or equivalent, to another. */
function copyPolyLineAnnotationSettings(source, dest) {
    var e_2, _a;
    copyAnnotationSettings(source, dest);
    try {
        for (var justPolyLineAnnotationSettingNames_2 = tslib_es6_values(justPolyLineAnnotationSettingNames), justPolyLineAnnotationSettingNames_2_1 = justPolyLineAnnotationSettingNames_2.next(); !justPolyLineAnnotationSettingNames_2_1.done; justPolyLineAnnotationSettingNames_2_1 = justPolyLineAnnotationSettingNames_2.next()) {
            var n = justPolyLineAnnotationSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justPolyLineAnnotationSettingNames_2_1 && !justPolyLineAnnotationSettingNames_2_1.done && (_a = justPolyLineAnnotationSettingNames_2.return)) _a.call(justPolyLineAnnotationSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `PolyLineAnnotationSettingsInterface`. */
var PolyLineAnnotationState = /** @class */ (function (_super) {
    __extends(PolyLineAnnotationState, _super);
    function PolyLineAnnotationState(source) {
        var _this = _super.call(this, source) || this;
        copyPolyLineAnnotationSettings(source, _this);
        return _this;
    }
    PolyLineAnnotationState.prototype.get_lineColor = function () {
        return this.lineColor;
    };
    PolyLineAnnotationState.prototype.set_lineColor = function (v) {
        this.lineColor = v;
        return v;
    };
    PolyLineAnnotationState.prototype.get_lineWidth = function () {
        return this.lineWidth;
    };
    PolyLineAnnotationState.prototype.set_lineWidth = function (v) {
        this.lineWidth = v;
        return v;
    };
    return PolyLineAnnotationState;
}(AnnotationState));

//# sourceMappingURL=polylineannotation.js.map
;// CONCATENATED MODULE: ../engine-helpers/dist/src/votablelayer.js
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling "spreadsheet" layer settings. */


var justVoTableLayerSettingNames = [
    "altColumn",
    "altType",
    "altUnit",
    "autoUpdate",
    "beginRange",
    "cartesianCustomScale",
    "cartesianScale",
    "colorMapColumn",
    "coordinatesType",
    "dataSourceUrl",
    "decay",
    "dynamicData",
    "endDateColumn",
    "endRange",
    "hyperlinkColumn",
    "hyperlinkFormat",
    "latColumn",
    "lngColumn",
    "markerColumn",
    "markerIndex",
    "markerScale",
    "nameColumn",
    "plotType",
    "pointScaleType",
    "raUnits",
    "scaleFactor",
    "showFarSide",
    "sizeColumn",
    "startDateColumn",
    "timeSeries",
    "xAxisColumn",
    "xAxisReverse",
    "yAxisColumn",
    "yAxisReverse",
    "zAxisColumn",
    "zAxisReverse",
];
/** A list of the names of the available settings for `VoTableLayer`
 * instances and their equivalents (things implementing
 * [[VoTableLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
var voTableLayerSettingNames = layerSettingNames.concat(justVoTableLayerSettingNames);
/** Type guard function for `VoTableLayerSetting`. */
function isVoTableLayerSetting(obj) {
    // No special settings specific to non-base VoTableLayerSetting.
    return isLayerSetting(obj) || isBaseVoTableLayerSetting(obj);
}
/** Apply a setting to a `VoTableLayer` or equivalent. */
function applyVoTableLayerSetting(layer, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1]; // eslint-disable-line @typescript-eslint/no-explicit-any
    layer[funcName](value); // eslint-disable-line @typescript-eslint/no-explicit-any
}
/** Extract all of the current settings of a `VoTableLayer` or equivalent. */
function extractVoTableLayerSettings(layer) {
    var e_1, _a;
    var s = extractLayerSettings(layer);
    try {
        for (var justVoTableLayerSettingNames_1 = __values(justVoTableLayerSettingNames), justVoTableLayerSettingNames_1_1 = justVoTableLayerSettingNames_1.next(); !justVoTableLayerSettingNames_1_1.done; justVoTableLayerSettingNames_1_1 = justVoTableLayerSettingNames_1.next()) {
            var n = justVoTableLayerSettingNames_1_1.value;
            s.push([n, layer["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justVoTableLayerSettingNames_1_1 && !justVoTableLayerSettingNames_1_1.done && (_a = justVoTableLayerSettingNames_1.return)) _a.call(justVoTableLayerSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `VoTableLayer`, or equivalent, to another. */
function copyVoTableLayerSettings(source, dest) {
    var e_2, _a;
    copyLayerSettings(source, dest);
    try {
        for (var justVoTableLayerSettingNames_2 = tslib_es6_values(justVoTableLayerSettingNames), justVoTableLayerSettingNames_2_1 = justVoTableLayerSettingNames_2.next(); !justVoTableLayerSettingNames_2_1.done; justVoTableLayerSettingNames_2_1 = justVoTableLayerSettingNames_2.next()) {
            var n = justVoTableLayerSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justVoTableLayerSettingNames_2_1 && !justVoTableLayerSettingNames_2_1.done && (_a = justVoTableLayerSettingNames_2.return)) _a.call(justVoTableLayerSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `VoTableLayerSettingsInterface`. */
var VoTableLayerState = /** @class */ (function (_super) {
    __extends(VoTableLayerState, _super);
    function VoTableLayerState(source) {
        var _this = 
        // Here we redundantly copy the generic Layer settings, but TypeScript
        // requires the super() call. Oh well.
        _super.call(this, source) || this;
        copyVoTableLayerSettings(source, _this);
        return _this;
    }
    VoTableLayerState.prototype.get_altColumn = function () {
        return this.altColumn;
    };
    VoTableLayerState.prototype.set_altColumn = function (v) {
        this.altColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_altType = function () {
        return this.altType;
    };
    VoTableLayerState.prototype.set_altType = function (v) {
        this.altType = v;
        return v;
    };
    VoTableLayerState.prototype.get_altUnit = function () {
        return this.altUnit;
    };
    VoTableLayerState.prototype.set_altUnit = function (v) {
        this.altUnit = v;
        return v;
    };
    VoTableLayerState.prototype.get_autoUpdate = function () {
        return this.autoUpdate;
    };
    VoTableLayerState.prototype.set_autoUpdate = function (v) {
        this.autoUpdate = v;
        return v;
    };
    VoTableLayerState.prototype.get_beginRange = function () {
        return this.beginRange;
    };
    VoTableLayerState.prototype.set_beginRange = function (v) {
        this.beginRange = v;
        return v;
    };
    VoTableLayerState.prototype.get_cartesianCustomScale = function () {
        return this.cartesianCustomScale;
    };
    VoTableLayerState.prototype.set_cartesianCustomScale = function (v) {
        this.cartesianCustomScale = v;
        return v;
    };
    VoTableLayerState.prototype.get_cartesianScale = function () {
        return this.cartesianScale;
    };
    VoTableLayerState.prototype.set_cartesianScale = function (v) {
        this.cartesianScale = v;
        return v;
    };
    VoTableLayerState.prototype.get_colorMapColumn = function () {
        return this.colorMapColumn;
    };
    VoTableLayerState.prototype.set_colorMapColumn = function (v) {
        this.colorMapColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_coordinatesType = function () {
        return this.coordinatesType;
    };
    VoTableLayerState.prototype.set_coordinatesType = function (v) {
        this.coordinatesType = v;
        return v;
    };
    VoTableLayerState.prototype.get_dataSourceUrl = function () {
        return this.dataSourceUrl;
    };
    VoTableLayerState.prototype.set_dataSourceUrl = function (v) {
        this.dataSourceUrl = v;
        return v;
    };
    VoTableLayerState.prototype.get_decay = function () {
        return this.decay;
    };
    VoTableLayerState.prototype.set_decay = function (v) {
        this.decay = v;
        return v;
    };
    VoTableLayerState.prototype.get_dynamicData = function () {
        return this.dynamicData;
    };
    VoTableLayerState.prototype.set_dynamicData = function (v) {
        this.dynamicData = v;
        return v;
    };
    VoTableLayerState.prototype.get_endDateColumn = function () {
        return this.endDateColumn;
    };
    VoTableLayerState.prototype.set_endDateColumn = function (v) {
        this.endDateColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_endRange = function () {
        return this.endRange;
    };
    VoTableLayerState.prototype.set_endRange = function (v) {
        this.endRange = v;
        return v;
    };
    VoTableLayerState.prototype.get_hyperlinkColumn = function () {
        return this.hyperlinkColumn;
    };
    VoTableLayerState.prototype.set_hyperlinkColumn = function (v) {
        this.hyperlinkColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_hyperlinkFormat = function () {
        return this.hyperlinkFormat;
    };
    VoTableLayerState.prototype.set_hyperlinkFormat = function (v) {
        this.hyperlinkFormat = v;
        return v;
    };
    VoTableLayerState.prototype.get_latColumn = function () {
        return this.latColumn;
    };
    VoTableLayerState.prototype.set_latColumn = function (v) {
        this.latColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_lngColumn = function () {
        return this.lngColumn;
    };
    VoTableLayerState.prototype.set_lngColumn = function (v) {
        this.lngColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_markerColumn = function () {
        return this.markerColumn;
    };
    VoTableLayerState.prototype.set_markerColumn = function (v) {
        this.markerColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_markerIndex = function () {
        return this.markerIndex;
    };
    VoTableLayerState.prototype.set_markerIndex = function (v) {
        this.markerIndex = v;
        return v;
    };
    VoTableLayerState.prototype.get_markerScale = function () {
        return this.markerScale;
    };
    VoTableLayerState.prototype.set_markerScale = function (v) {
        this.markerScale = v;
        return v;
    };
    VoTableLayerState.prototype.get_nameColumn = function () {
        return this.nameColumn;
    };
    VoTableLayerState.prototype.set_nameColumn = function (v) {
        this.nameColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_plotType = function () {
        return this.plotType;
    };
    VoTableLayerState.prototype.set_plotType = function (v) {
        this.plotType = v;
        return v;
    };
    VoTableLayerState.prototype.get_pointScaleType = function () {
        return this.pointScaleType;
    };
    VoTableLayerState.prototype.set_pointScaleType = function (v) {
        this.pointScaleType = v;
        return v;
    };
    VoTableLayerState.prototype.get_raUnits = function () {
        return this.raUnits;
    };
    VoTableLayerState.prototype.set_raUnits = function (v) {
        this.raUnits = v;
        return v;
    };
    VoTableLayerState.prototype.get_scaleFactor = function () {
        return this.scaleFactor;
    };
    VoTableLayerState.prototype.set_scaleFactor = function (v) {
        this.scaleFactor = v;
        return v;
    };
    VoTableLayerState.prototype.get_showFarSide = function () {
        return this.showFarSide;
    };
    VoTableLayerState.prototype.set_showFarSide = function (v) {
        this.showFarSide = v;
        return v;
    };
    VoTableLayerState.prototype.get_sizeColumn = function () {
        return this.sizeColumn;
    };
    VoTableLayerState.prototype.set_sizeColumn = function (v) {
        this.sizeColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_startDateColumn = function () {
        return this.startDateColumn;
    };
    VoTableLayerState.prototype.set_startDateColumn = function (v) {
        this.startDateColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_timeSeries = function () {
        return this.timeSeries;
    };
    VoTableLayerState.prototype.set_timeSeries = function (v) {
        this.timeSeries = v;
        return v;
    };
    VoTableLayerState.prototype.get_xAxisColumn = function () {
        return this.xAxisColumn;
    };
    VoTableLayerState.prototype.set_xAxisColumn = function (v) {
        this.xAxisColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_xAxisReverse = function () {
        return this.xAxisReverse;
    };
    VoTableLayerState.prototype.set_xAxisReverse = function (v) {
        this.xAxisReverse = v;
        return v;
    };
    VoTableLayerState.prototype.get_yAxisColumn = function () {
        return this.yAxisColumn;
    };
    VoTableLayerState.prototype.set_yAxisColumn = function (v) {
        this.yAxisColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_yAxisReverse = function () {
        return this.yAxisReverse;
    };
    VoTableLayerState.prototype.set_yAxisReverse = function (v) {
        this.yAxisReverse = v;
        return v;
    };
    VoTableLayerState.prototype.get_zAxisColumn = function () {
        return this.zAxisColumn;
    };
    VoTableLayerState.prototype.set_zAxisColumn = function (v) {
        this.zAxisColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_zAxisReverse = function () {
        return this.zAxisReverse;
    };
    VoTableLayerState.prototype.set_zAxisReverse = function (v) {
        this.zAxisReverse = v;
        return v;
    };
    return VoTableLayerState;
}(LayerState));

//# sourceMappingURL=votablelayer.js.map
;// CONCATENATED MODULE: ../engine-helpers/dist/src/index.js
// Copyright 2020-2023 the .NET Foundation
// Licensed under the MIT License






// Settings-related re-exports









var SavedPromise = /** @class */ (function () {
    function SavedPromise(payload, resolve, reject) {
        this.payload = payload;
        this.resolve = resolve;
        this.reject = reject;
    }
    return SavedPromise;
}());
var WWTInstance = /** @class */ (function () {
    /** Create a WWT control, attaching it to a DOM element.
     *
     * @param options Options to apply to the control.
     *
     * Compared to the underlying library, this class provides a more JavaScript-y
     * API.
     */
    function WWTInstance(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        // Ready promises
        this.readyPromises = [];
        this.readyFired = false;
        // Arrival promises
        this.arrivePromises = [];
        this.arriveSeqnum = 0;
        // Collection-loaded promises. To simplify the handling, we never load the
        // same URL more than once. Otherwise, all of the timing issues about multiple
        // requests for the same URL get gnarly to handle. And as far as the engine is
        // concerned, collection loads are idempotent.
        this.collectionLoadedPromises = [];
        this.collectionRequests = new Map();
        this.tourReadyPromises = [];
        this.tourReadySeqnum = 0;
        /** A callback to be invoked when a tour completes playing. */
        this.tourEndedCallback = null;
        var builder = new engine_root_wwtlib_namespaceObject.WWTControlBuilder(options.elId || "wwt");
        if (options.startInternalRenderLoop !== undefined) {
            builder.startRenderLoop(options.startInternalRenderLoop);
        }
        if (options.freestandingAssetBaseurl !== undefined) {
            builder.freestandingMode(options.freestandingAssetBaseurl);
        }
        if (options.startLatDeg !== undefined && options.startLngDeg !== undefined) {
            var zoom = options.startZoomDeg || 360;
            builder.initialView(options.startLatDeg, options.startLngDeg, zoom);
        }
        if (options.startMode !== undefined) {
            builder.initialMode(options.startMode);
        }
        // We pretend that these objects aren't all singletons. One day.
        this.si = builder.create();
        this.ctl = engine_root_wwtlib_namespaceObject.WWTControl.singleton;
        this.lm = engine_root_wwtlib_namespaceObject.LayerManager;
        this.stc = engine_root_wwtlib_namespaceObject.SpaceTimeController;
        // Override some defaults
        this.applySetting(["showConstellationBoundries", false]);
        this.applySetting(["showConstellationFigures", false]);
        this.applySetting(["showConstellationSelection", false]);
        this.applySetting(["showCrosshairs", false]);
        // Ready promise initialization:
        this.si.add_ready(function (_si) {
            var e_1, _a;
            try {
                for (var _b = tslib_es6_values(_this.readyPromises), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var p = _c.value;
                    p.resolve();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            _this.readyFired = true;
            _this.readyPromises = [];
        });
        // Arrival promise initialization:
        this.si.add_arrived(function (_si, _args) {
            var e_2, _a;
            try {
                for (var _b = tslib_es6_values(_this.arrivePromises), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var p = _c.value;
                    if (p.payload < _this.arriveSeqnum) {
                        p.reject("superseded");
                    }
                    else {
                        p.resolve();
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            _this.arrivePromises = [];
        });
        // TourReady promise init:
        this.si.add_tourReady(function (_si) {
            var e_3, _a;
            try {
                for (var _b = tslib_es6_values(_this.tourReadyPromises), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var p = _c.value;
                    if (p.payload < _this.tourReadySeqnum) {
                        p.reject("superseded");
                    }
                    else {
                        p.resolve();
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            _this.tourReadyPromises = [];
        });
        // TourEnded event init:
        engine_root_wwtlib_namespaceObject.TourPlayer.add_tourEnded(function (_tpclass) {
            var tp = _this.getActiveTourPlayer();
            if (tp !== null && _this.tourEndedCallback !== null) {
                _this.tourEndedCallback(tp);
            }
        });
    }
    WWTInstance.prototype.waitForReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.readyFired) {
                            resolve();
                        }
                        else {
                            _this.readyPromises.push(new SavedPromise(null, resolve, reject));
                        }
                    })];
            });
        });
    };
    WWTInstance.prototype.makeArrivePromise = function (instantResolve) {
        var e_4, _a;
        var _this = this;
        this.arriveSeqnum += 1;
        var seq = this.arriveSeqnum;
        try {
            for (var _b = tslib_es6_values(this.arrivePromises), _c = _b.next(); !_c.done; _c = _b.next()) {
                var p = _c.value;
                p.reject("superseded");
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        this.arrivePromises = [];
        return new Promise(function (resolve, reject) {
            if (_this.arriveSeqnum > seq) {
                reject("superseded");
            }
            else if (instantResolve) {
                resolve();
            }
            else {
                _this.arrivePromises.push(new SavedPromise(seq, resolve, reject));
            }
        });
    };
    /** Navigate the camera to the specified position, asynchronously.
     *
     * This wraps the underlying engine function of the same name, but homogenizing some
     * of the angular arguments to use radians.
     *
     * @param raRad The RA to seek to, in radians
     * @param decRad The declination to seek to, in radians
     * @param zoomDeg The zoom setting, in *degrees*
     * @param instant Whether to snap the camera instantly, or pan it
     * @param rollRad If specified, the roll of the target camera position, in radians
     * @returns A void promise that resolves when the camera arrives at the target position.
     */
    WWTInstance.prototype.gotoRADecZoom = function (raRad, decRad, zoomDeg, instant, rollRad) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ctl.gotoRADecZoom(raRad * R2H, decRad * R2D, zoomDeg, instant, rollRad);
                return [2 /*return*/, this.makeArrivePromise(instant)];
            });
        });
    };
    /** Returns how long moving to a given position will take, in seconds.
     *
     * This wraps the underlying engine function of the same name, but homogenizing some
     * of the angular arguments to use radians.
     *
     * @param raRad The RA of the target position, in radians
     * @param decRad The declination of the target position, in radians
     * @param zoomDeg The zoom setting, in *degrees*
     * @param rollRad If specified, the roll of the target camera position, in radians
     * @returns The amount of time, in seconds, that moving to the given position would take.
     */
    WWTInstance.prototype.timeToRADecZoom = function (raRad, decRad, zoomDeg, rollRad) {
        var time = this.ctl.timeToRADecZoom(raRad * R2H, decRad * R2D, zoomDeg, rollRad);
        return time;
    };
    /** Command the view to show a Place.
     *
     * @param options The options for the goto command.
     */
    WWTInstance.prototype.gotoTarget = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ctl.gotoTarget(options.place, options.noZoom, options.instant, options.trackObject);
                return [2 /*return*/, this.makeArrivePromise(options.instant)];
            });
        });
    };
    /** Add an imageset directly into the engine's database.
     *
     * If an imageset with the same URL has already been loaded, this is a no-op.
     *
     * @param imgset The imageset to add
     * @returns Either the input argument, if it was added to the engine's
     *   database, or the pre-existing imageset. The pre-existing imageset will
     *   have the same URL but might differ in other respects, such as its name.
     */
    WWTInstance.prototype.addImagesetToRepository = function (imgset) {
        return engine_root_wwtlib_namespaceObject.WWTControl.addImageSetToRepository(imgset);
    };
    /** Load a WTML collection and the imagesets that it contains.
    *
    * This function triggers a download of the specified URL, which should return
    * an XML document in the [WTML collection][wtml] format. Any `ImageSet`
    * entries in the collection, or `Place` entries containing image sets, will
    * be added to the WWT instance’s list of available imagery. Subsequent calls
    * to functions like [[setForegroundImageByName]] will be able to locate the
    * new imagesets and display them to the user.
    *
    * Each unique URL is only requested once. Once a given URL has been
    * successfully loaded, the promise returned by additional calls will resolve
    * immediately. URL uniqueness is tested with simple string equality, so if
    * you really want to load the same URL more than once you could add a
    * fragment specifier.
    *
    * If the URL is not accessible due to CORS restrictions, the request will
    * automatically be routed through the WWT’s CORS proxying service.
    *
    * [wtml]: https://docs.worldwidetelescope.org/data-guide/1/data-file-formats/collections/
    *
    * @param url: The URL of the WTML collection file to load.
    * @param loadChildFolders When true, this method will recursively
    * download and unpack the content of all Folders contained in the WTML file.
    * @returns: A promise that resolves to an initialized Folder object.
    */
    WWTInstance.prototype.loadImageCollection = function (url, loadChildFolders) {
        return __awaiter(this, void 0, void 0, function () {
            var curState, holder_1;
            var _this = this;
            return __generator(this, function (_a) {
                curState = this.collectionRequests.get(url);
                // If we've already loaded the folder, insta-resolve to it.
                if (curState !== undefined && curState !== null) {
                    return [2 /*return*/, Promise.resolve(curState)];
                }
                // If we haven't even issued the request, do so.
                if (curState === undefined) {
                    // Mark this URL as having an in-flight request.
                    this.collectionRequests.set(url, null);
                    holder_1 = { f: null };
                    if (loadChildFolders === undefined) {
                        loadChildFolders = false;
                    }
                    holder_1.f = engine_root_wwtlib_namespaceObject.Wtml.getWtmlFile(url, function () {
                        // The folder at this URL is now fully loaded.
                        var f = holder_1.f;
                        _this.collectionRequests.set(url, f);
                        _this.collectionLoadedPromises = _this.collectionLoadedPromises.filter(function (p) {
                            if (p.payload == url) {
                                p.resolve(f);
                                return false;
                            }
                            // Don't filter out promises for other URLs.
                            return true;
                        });
                    }, loadChildFolders);
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var curState = _this.collectionRequests.get(url);
                        // By the time this promise callback is called, maybe the Folder has fully
                        // loaded?
                        if (curState !== undefined && curState !== null) {
                            resolve(curState);
                        }
                        else {
                            // If not, queue ourselves up to be resolved when the data finally come
                            // through.
                            _this.collectionLoadedPromises.push(new SavedPromise(url, resolve, reject));
                        }
                    })];
            });
        });
    };
    // Layers
    /** Load an image set or a remote FITS file into a data layer and display it.
     *
     * The FITS file must be downloaded and processed, so this API is
     * asynchronous, and is not appropriate for files that might be large.
     *
     * The image set must have previously been created with [[loadImageCollection]]
     */
    WWTInstance.prototype.addImageSetLayer = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, _reject) {
                        _this.si.addImageSetLayer(options.url, options.mode, options.name, options.goto, function (layer) {
                            resolve(layer);
                        });
                    })];
            });
        });
    };
    /** Change the ImageSetLayer position in the layer stack. */
    WWTInstance.prototype.setImageSetLayerOrder = function (options) {
        this.si.setImageSetLayerOrder(options.id, options.order);
    };
    /** Change the "stretch" settings of a FITS image layer. */
    WWTInstance.prototype.stretchFitsLayer = function (options) {
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof engine_root_wwtlib_namespaceObject.ImageSetLayer) {
            layer.setImageScalePhysical(options.stretch, options.vmin, options.vmax);
            // This is kind of random, but follows the pywwt API implementation.
            var fits = layer.getFitsImage();
            if (fits !== null) {
                layer.get_imageSet().get_fitsProperties().transparentBlack = false;
            }
        }
    };
    /** Change the colormap settings of a FITS image layer. */
    WWTInstance.prototype.setFitsLayerColormap = function (options) {
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof engine_root_wwtlib_namespaceObject.ImageSetLayer) {
            layer.set_colorMapperName(options.name);
        }
    };
    /** Apply settings to a FITS image layer. */
    WWTInstance.prototype.applyFitsLayerSettings = function (options) {
        var e_5, _a;
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof engine_root_wwtlib_namespaceObject.ImageSetLayer) {
            try {
                for (var _b = tslib_es6_values(options.settings), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var setting = _c.value;
                    applyImageSetLayerSetting(layer, setting);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
    };
    /** Update the data within a tabular data layer. */
    WWTInstance.prototype.updateTableLayer = function (options) {
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof engine_root_wwtlib_namespaceObject.SpreadSheetLayer) {
            layer.updateData(options.dataCsv, true, true, true);
        }
    };
    /** Apply settings to a tabular data layer. */
    WWTInstance.prototype.applyTableLayerSettings = function (options) {
        var e_6, _a;
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof engine_root_wwtlib_namespaceObject.SpreadSheetLayer) {
            try {
                for (var _b = tslib_es6_values(options.settings), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var setting = _c.value;
                    applySpreadSheetLayerSetting(layer, setting);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
        }
    };
    /** Add a new HiPS catalog to the view, by name.
     *
     * The promise will resolve when the catalog metadata have fully downloaded.
     * It will reject if the name is unrecognized.
     *
     * HiPS catalogs are something of an awkward hybrid. They are managed like
     * imagesets, but rendered like spreadsheet layers. To get the
     * `SpreadSheetLayer` associated with a HiPS catalog imageset, access:
     *
     * ```
     * imgset.get_hipsProperties().get_catalogSpreadSheetLayer()
     * ```
     *
     * You can use methods like [[applyTableLayerSettings]] to modify the settings
     * of this layer by extracting its ID string with `layer.id.toString()`.
     *
     * The contents of this catalog will update dynamically as the user navigates
     * the WWT view.
     */
    WWTInstance.prototype.addCatalogHipsByName = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var imgset = _this.ctl.getImagesetByName(options.name);
                        if (imgset === null) {
                            reject();
                        }
                        else {
                            _this.ctl.renderContext.addCatalogHips(imgset, function () {
                                resolve(imgset);
                            });
                        }
                    })];
            });
        });
    };
    /** Fetch the subset of catalog HiPS data contained within the current view.
     *
     * The imageset should have been loaded with the [[addCatalogHipsByName]]
     * call. The *limit* option should almost always be true, since if it is false
     * the data-fetch operation can potentially attempt to download and return
     * gigabytes of data.
     * */
    WWTInstance.prototype.getCatalogHipsDataInView = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, _reject) {
                        _this.ctl.renderContext.getCatalogHipsDataInView(options.imageset, options.limit, function (msg) {
                            resolve(msg);
                        });
                    })];
            });
        });
    };
    // "Mutator" type operations -- not async.
    WWTInstance.prototype.applySetting = function (setting) {
        var funcName = "set_" + setting[0];
        var value = setting[1]; // eslint-disable-line @typescript-eslint/no-explicit-any
        this.si.settings[funcName](value); // eslint-disable-line @typescript-eslint/no-explicit-any
    };
    WWTInstance.prototype.setBackgroundImageByName = function (imagesetName) {
        this.ctl.setBackgroundImageByName(imagesetName);
    };
    WWTInstance.prototype.setForegroundImageByName = function (imagesetName) {
        this.ctl.setForegroundImageByName(imagesetName);
    };
    /** Set the opacity with which the foreground imageset is rendered.
     *
     * @param opacity The opacity, between 0 (invisible) and 100 (fully opaque).
     */
    WWTInstance.prototype.setForegroundOpacity = function (opacity) {
        this.si.setForegroundOpacity(opacity);
    };
    /** Set up the view to instantaneously display the specified imageset.
     *
     * This function aspires to provide a one-stop shop for configuring the engine
     * to show one arbitrary imageset. It aims to automatically choose the right,
     * or at least justifiable, values for things like the background imageset,
     * the camera position, and the zoom level.
     *
     * Because this function makes instantaneous changes, it is not appropriate
     * for interactive use. It is intended to be used as a WWT view is being
     * initialized.
     *
     * @param imageset The imageset to display.
     */
    WWTInstance.prototype.setupForImageset = function (options) {
        var bkg;
        if (options.background) {
            bkg = options.background;
        }
        else {
            bkg = this.ctl.getDefaultImageset(options.foreground.get_dataSetType(), options.foreground.get_bandPass());
        }
        var imageHeightDeg;
        if (options.foreground.get_levels() > 0) {
            // For tiled images, baseTileDegrees gives the image angular height
            // directly, modulo a factor of two uncertainty depending on how the image
            // pixel height rounds up to a power of two.
            imageHeightDeg = options.foreground.get_baseTileDegrees();
        }
        else {
            // Unfortunately, for untiled images we don't have the information needed
            // to assess the image's angular height reliably. In many cases offsetY
            // will be about half of the pixel height, but it could be anything.
            imageHeightDeg = options.foreground.get_baseTileDegrees() * options.foreground.get_offsetY() * 2;
        }
        var place = new engine_root_wwtlib_namespaceObject.Place();
        place.set_type(options.foreground.get_dataSetType());
        place.set_backgroundImageset(bkg);
        place.set_studyImageset(options.foreground);
        var noZoom = false;
        switch (options.foreground.get_dataSetType()) {
            case ImageSetType.sky:
                if (imageHeightDeg == 180) {
                    // All-sky image -- special behavior
                    noZoom = true;
                }
                else {
                    place.set_RA(options.foreground.get_centerX() * D2H);
                    place.set_dec(options.foreground.get_centerY());
                    place.set_zoomLevel(imageHeightDeg * 6);
                }
                break;
            case ImageSetType.earth:
            case ImageSetType.planet:
                place.set_zoomLevel(120); // a pleasing default, according to me
                if (imageHeightDeg != 180) {
                    // need to verify that this is right
                    place.set_lng(options.foreground.get_centerX());
                    place.set_lat(options.foreground.get_centerY());
                }
                break;
            default:
                // TODO: more cases ...
                place.set_zoomLevel(360);
                break;
        }
        this.ctl.renderContext.set_backgroundImageset(bkg);
        this.ctl.gotoTarget(place, noZoom, true, // instant
        true // trackObject
        );
    };
    // Tours
    /** If the tour playback mode is active, get the active TourPlayer object. */
    WWTInstance.prototype.getActiveTourPlayer = function () {
        if (this.ctl.uiController === null)
            return null;
        if (this.ctl.uiController instanceof engine_root_wwtlib_namespaceObject.TourPlayer)
            return this.ctl.uiController;
        return null;
    };
    /** Find out whether a tour is playing.
     *
     * For obscure reasons, this is a static method in WWT that is not attached to
     * a TourPlayer instance. We take one as an argument for future-proofiness.
     */
    WWTInstance.prototype.getIsTourPlaying = function (_player) {
        return engine_root_wwtlib_namespaceObject.TourPlayer.get_playing();
    };
    /** Load a tour from a URL.
     *
     * Once the tour has loaded, you can use [[getActiveTourPlayer]] to get the
     * tour player controller and the underlying tour document.
     *
     * @param url The URL of the tour to load and play.
     * @returns A promise that resolves when the tour has loaded.
     */
    WWTInstance.prototype.loadTour = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, _a, _b, p;
            var e_7, _c;
            var _this = this;
            return __generator(this, function (_d) {
                this.ctl.loadTour(url);
                this.tourReadySeqnum += 1;
                seq = this.tourReadySeqnum;
                try {
                    for (_a = tslib_es6_values(this.tourReadyPromises), _b = _a.next(); !_b.done; _b = _a.next()) {
                        p = _b.value;
                        p.reject("superseded");
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                this.tourReadyPromises = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.tourReadySeqnum > seq) {
                            reject("superseded");
                        }
                        else {
                            _this.tourReadyPromises.push(new SavedPromise(seq, resolve, reject));
                        }
                    })];
            });
        });
    };
    /** Load a tour from a URL and start playing it.
     *
     * @param url The URL of the tour to load and play.
     * @returns A promise that resolves when the tour has loaded and started
     * playing.
     */
    WWTInstance.prototype.loadAndPlayTour = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, _a, _b, p;
            var e_8, _c;
            var _this = this;
            return __generator(this, function (_d) {
                this.ctl.playTour(url);
                this.tourReadySeqnum += 1;
                seq = this.tourReadySeqnum;
                try {
                    for (_a = tslib_es6_values(this.tourReadyPromises), _b = _a.next(); !_b.done; _b = _a.next()) {
                        p = _b.value;
                        p.reject("superseded");
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                this.tourReadyPromises = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.tourReadySeqnum > seq) {
                            reject("superseded");
                        }
                        else {
                            _this.tourReadyPromises.push(new SavedPromise(seq, resolve, reject));
                        }
                    })];
            });
        });
    };
    /** Find out how far we have progressed into the tour, in seconds.
     *
     * This number does not necessarily progress monotonically due to the way that
     * WWT measures tour playback progress. We associate a start time with each
     * "stop" in the tour, and can measure progress through a stop, but stops do
     * not necessarily transition from one to another in linear fashion.
     *
     * That being said, this number should range between 0 and the runtime of the
     * current tour. If no tour is loaded, it will be zero.
     */
    WWTInstance.prototype.getEffectiveTourTimecode = function () {
        var player = this.getActiveTourPlayer();
        if (player === null)
            return 0.0;
        var tour = player.get_tour();
        if (tour === null)
            return 0.0;
        var idx = tour.get_currentTourstopIndex();
        if (idx < 0)
            return 0.0;
        var base = tour.elapsedTimeTillTourstop(idx);
        var stop = tour.get_tourStops()[idx];
        var delta = stop.get_tweenPosition() * stop.get_duration() * 0.001; // ms => s
        var value = base + delta;
        // It's possible for our math to yield a value slightly larger than the
        // nominal tour runtime, which can upset code that expects the value to stay
        // rigorously within that bound. So, clamp it to be sure.
        if (value < 0)
            return 0.0;
        var runTime = tour.get_runTime() * 0.001; // ms => s
        if (value > runTime)
            return runTime;
        return value;
    };
    /** "Seek" tour playback to approximately the specified timecode (in seconds).
     *
     * The tour will start playing back.
     *
     * This operation is approximate because WWT can only resume playback from the
     * beginning of a "tour stop". So, if the desired timecode is in the middle of
     * such a stop, playback will start there, not at the exact value that was
     * commanded. This can be a little annoying when a slide is long.
     *
     * If no tour or tour player is active, nothing happens.
     */
    WWTInstance.prototype.seekToTourTimecode = function (value) {
        var player = this.getActiveTourPlayer();
        if (player === null)
            return;
        var tour = player.get_tour();
        if (tour === null)
            return;
        // Figure out the stop index that best matches the specified timecode.
        var stops = tour.get_tourStops();
        var index = stops.length - 1;
        for (var i = 0; i < stops.length; i++) {
            var tStart = tour.elapsedTimeTillTourstop(i);
            if (tStart >= value) {
                index = i - 1;
                break;
            }
        }
        if (index < 0) {
            index = 0;
        }
        // Apply the change.
        player.playFromTourstop(stops[index]);
    };
    /** Capture the current frame as an image.
     *
     * This function returns a Promise whose resolved value is the image
     * represented as a `Blob`.
    */
    WWTInstance.prototype.captureFrame = function (options) {
        var _this = this;
        return new Promise(function (resolve, _reject) {
            _this.ctl.captureFrame(function (blob) { return resolve(blob); }, options.width, options.height, options.format);
        });
    };
    /** Capture a video as a sequence of frames using the given parameters
     *
     * This function returns a readable stream whose values are the exported frames.
    */
    WWTInstance.prototype.captureVideo = function (options) {
        var wwtControl = this.ctl;
        var videoStream = new ReadableStream({
            start: function (controller) {
                function stream() {
                    var received = 0;
                    wwtControl.captureVideo(function (blob) {
                        received++;
                        controller.enqueue(blob);
                        if (received >= options.totalFrames) {
                            controller.close();
                        }
                    }, options.width, options.height, options.framesPerSecond, options.totalFrames, options.format);
                }
                return stream();
            }
        });
        return videoStream;
    };
    return WWTInstance;
}());

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ./src/store.ts
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

// The high-level docs in `wwtaware.ts` contain the developer-friendly
// descriptions of pretty much everything in this file. Update those docs when
// adding new features here.





var WWTGlobalState = /** @class */ (function () {
    function WWTGlobalState() {
        this.inst = null;
        this.onLinkedCallbacks = [];
    }
    WWTGlobalState.prototype.link = function (inst) {
        var e_1, _a;
        if (this.inst !== null)
            throw new Error("must unlink WWT Pinia global state before relinking");
        this.inst = inst;
        try {
            for (var _b = tslib_es6_values(this.onLinkedCallbacks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var cb = _c.value;
                cb();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.onLinkedCallbacks = [];
    };
    WWTGlobalState.prototype.unlink = function () {
        this.inst = null;
    };
    return WWTGlobalState;
}());

/** This class holds basic information about an imageset.
 *
 * Discover imagesets through the [[WWTAwareComponent.wwtAvailableImagesets]]
 * state variable. In standard practice there will be hundreds of available
 * imagesets of many different kinds.
 *
 * Imagesets may be uniquely identified by their associated image data [[url]].
 * (If you really need to have multiple imagesets associated with the same URL,
 * add a `#fragment` to the end.)
 */
var ImagesetInfo = /** @class */ (function () {
    function ImagesetInfo(url, name, type, description, extension, id) {
        if (id === void 0) { id = null; }
        this.url = url;
        this.name = name;
        this.type = type;
        this.description = description;
        this.extension = extension;
        this.id = id;
    }
    ImagesetInfo.fromImageset = function (imageset) {
        var _a, _b;
        return new ImagesetInfo(imageset.get_url(), imageset.get_name(), imageset.get_dataSetType(), imageset.get_creditsText(), imageset.get_extension(), (_b = (_a = imageset.get_hipsProperties()) === null || _a === void 0 ? void 0 : _a.get_catalogSpreadSheetLayer().id.toString()) !== null && _b !== void 0 ? _b : null);
    };
    return ImagesetInfo;
}());

var SpreadSheetLayerInfo = /** @class */ (function () {
    function SpreadSheetLayerInfo(id, referenceFrame, name) {
        this.id = id;
        this.referenceFrame = referenceFrame;
        this.name = name !== null && name !== void 0 ? name : id;
    }
    SpreadSheetLayerInfo.prototype.setName = function (name) {
        this.name = name;
    };
    return SpreadSheetLayerInfo;
}());

/** Information about an active imageset layer. */
var ImageSetLayerState = /** @class */ (function () {
    function ImageSetLayerState(source) {
        this.guidText = source.id.toString();
        this.settings = new imagesetlayer_ImageSetLayerState(source);
        var fits = source.get_imageSet().get_fitsProperties();
        this.scaleType = fits.scaleType;
        this.vmin = fits.lowerCut;
        this.vmax = fits.upperCut;
        this.colormapName = fits.colorMapName;
    }
    ImageSetLayerState.prototype.getGuid = function () {
        return this.guidText;
    };
    return ImageSetLayerState;
}());

/** This function creates the list of currently active layers.
 * Keeping this functionality outside of the store allows us to use it from
 * inside either an action or a mutation.
 */
function activeLayersList(wwt) {
    if (wwt.inst === null)
        throw new Error('cannot get activeLayersList without linking to WWTInstance');
    var layers = [];
    function accum(lm) {
        var e_2, _a, e_3, _b;
        try {
            for (var _c = tslib_es6_values(lm.layers), _d = _c.next(); !_d.done; _d = _c.next()) {
                var layer = _d.value;
                layers.push(layer.id.toString());
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        try {
            for (var _e = tslib_es6_values(Object.entries(lm.childMaps)), _f = _e.next(); !_f.done; _f = _e.next()) {
                var _g = __read(_f.value, 2), _mapname = _g[0], sublm = _g[1];
                accum(sublm);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    var rootlm = wwt.inst.lm.get_allMaps()[wwt.inst.ctl.getCurrentReferenceFrame()];
    if (rootlm) {
        accum(rootlm);
    }
    return layers;
}
/** This function creates the list of currently available imagesets.
 * Keeping this functionality outside of the store allows us to use it from
 * inside either an action or a mutation.
 */
function availableImagesets() {
    return engine_root_wwtlib_namespaceObject.WWTControl.getImageSets().map(ImagesetInfo.fromImageset);
}
/** The WWT Pinia implementation.
 *
 * See [[WWTAwareComponent]] for an organized overview of the state variables,
 * getters, and actions exposed by this module.
 */
var engineStore = defineStore('wwt-engine', {
    // NOTE: We were originally alphabetizing these all, but now I think it will be
    // better to group topically related fields.
    state: function () { return ({
        activeLayers: [],
        availableImagesets: [],
        backgroundImageset: null,
        clockDiscontinuities: 0,
        clockRate: 1.0,
        currentTime: new Date(),
        decRad: 0.0,
        foregroundImageset: null,
        foregroundOpacity: 100,
        imagesetLayers: {},
        isTourPlayerActive: false,
        isTourPlaying: false,
        raRad: 0.0,
        renderType: ImageSetType.sky,
        rollRad: 0,
        spreadSheetLayers: {},
        timeAtStartup: Date.now(),
        tourCompletions: 0,
        tourRunTime: null,
        tourStopStartTimes: [],
        tourTimecode: 0.0,
        showWebGl2Warning: false,
        zoomDeg: 0.0,
    }); },
    getters: {
        lookupImageset: function (_state) {
            var _this = this;
            return function (imagesetName) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot lookupImageset without linking to WWTInstance');
                return _this.$wwt.inst.ctl.getImagesetByName(imagesetName);
            };
        },
        findRADecForScreenPoint: function (_state) {
            var _this = this;
            return function (pt) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot findRADecForScreenPoint without linking to WWTInstance');
                var coords = _this.$wwt.inst.ctl.getCoordinatesForScreenPoint(pt.x, pt.y);
                return { ra: (15 * coords.x + 720) % 360, dec: coords.y };
            };
        },
        findScreenPointForRADec: function (_state) {
            var _this = this;
            return function (pt) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot findScreenPointForRADec without linking to WWTInstance');
                return _this.$wwt.inst.ctl.getScreenPointForCoordinates(pt.ra / 15, pt.dec);
            };
        },
        imagesetStateForLayer: function (state) {
            return function (guidtext) {
                return state.imagesetLayers[guidtext] || null;
            };
        },
        activeImagesetLayerStates: function () {
            var e_4, _a;
            var states = [];
            try {
                for (var _b = tslib_es6_values(this.activeLayers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var guid = _c.value;
                    var layerState = this.imagesetLayers[guid];
                    if (layerState) {
                        states.push(layerState);
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return states;
        },
        catalogLayerKey: function (_state) {
            return function (catalog) {
                var _a;
                return (_a = catalog.id) !== null && _a !== void 0 ? _a : "";
            };
        },
        imagesetForLayer: function (_state) {
            var _this = this;
            return function (guidtext) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot get imagesetForLayer without linking to WWTInstance');
                var layer = _this.$wwt.inst.lm.get_layerList()[guidtext];
                if (layer !== null && layer instanceof engine_root_wwtlib_namespaceObject.ImageSetLayer) {
                    return layer.get_imageSet();
                }
                else {
                    return null;
                }
            };
        },
        imagesetLayerById: function (_state) {
            var _this = this;
            return function (id) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot get imagesetLayerById without linking to WWTInstance');
                var layer = _this.layerById(id);
                if (layer !== null && layer instanceof engine_root_wwtlib_namespaceObject.ImageSetLayer) {
                    return layer;
                }
                else {
                    return null;
                }
            };
        },
        layerForHipsCatalog: function (_state) {
            var _this = this;
            return function (name) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot get layerForHipsCatalog without linking to WWTInstance');
                var id = engine_root_wwtlib_namespaceObject.Guid.createFrom(name).toString();
                return _this.spreadSheetLayerById(id);
            };
        },
        layerById: function (_state) {
            var _this = this;
            return function (id) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot get layerById without linking to WWTInstance');
                return _this.$wwt.inst.lm.get_layerList()[id];
            };
        },
        spreadsheetStateForHipsCatalog: function (state) {
            var _this = this;
            return function (name) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot get spreadsheetStateForHipsCatalog without linking to WWTInstance');
                var id = engine_root_wwtlib_namespaceObject.Guid.createFrom(name).toString();
                return state.spreadSheetLayers[id] || null;
            };
        },
        spreadSheetLayerById: function (_state) {
            var _this = this;
            return function (id) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot get spreadsheetLayerById without linking to WWTInstance');
                var layer = _this.layerById(id);
                if (layer !== null && layer instanceof engine_root_wwtlib_namespaceObject.SpreadSheetLayer) {
                    return layer;
                }
                else {
                    return null;
                }
            };
        },
        spreadsheetStateById: function (state) {
            return function (id) {
                return state.spreadSheetLayers[id] || null;
            };
        },
        spreadSheetLayer: function (_state) {
            var _this = this;
            return function (catalog) {
                if (_this.$wwt.inst === null)
                    throw new Error('cannot get spreadSheetLayer without linking to WWTInstance');
                var key = _this.catalogLayerKey(catalog);
                return _this.spreadSheetLayerById(key);
            };
        },
        spreadsheetState: function (state) {
            var _this = this;
            return function (catalog) {
                var key = _this.catalogLayerKey(catalog);
                return state.spreadSheetLayers[key] || null;
            };
        }
    },
    actions: {
        internalLinkToInstance: function (wwt) {
            this.$wwt.link(wwt);
        },
        internalUnlinkFromInstance: function () {
            this.$wwt.unlink();
        },
        internalUpdate: function () {
            if (this.$wwt.inst === null)
                throw new Error('cannot internalUpdate without linking to WWTInstance');
            var wwt = this.$wwt.inst;
            var raRad = wwt.si.getRA() * H2R;
            if (this.raRad != raRad)
                this.raRad = raRad;
            var decRad = wwt.si.getDec() * D2R;
            if (this.decRad != decRad)
                this.decRad = decRad;
            var zoomDeg = wwt.ctl.renderContext.viewCamera.zoom;
            if (this.zoomDeg != zoomDeg)
                this.zoomDeg = zoomDeg;
            var rollRad = wwt.ctl.renderContext.viewCamera.rotation;
            if (this.rollRad != rollRad)
                this.rollRad = rollRad;
            var bg = wwt.ctl.renderContext.get_backgroundImageset() || null; // TEMP
            if (this.backgroundImageset != bg)
                this.backgroundImageset = bg;
            var time = wwt.stc.get_now();
            if (this.currentTime != time)
                this.currentTime = time;
            var fg = wwt.ctl.renderContext.get_foregroundImageset() || null; // TEMP
            if (this.foregroundImageset != fg)
                this.foregroundImageset = fg;
            if (this.foregroundOpacity != wwt.ctl.renderContext.viewCamera.opacity)
                this.foregroundOpacity = wwt.ctl.renderContext.viewCamera.opacity;
            if (this.renderType != wwt.ctl.renderType)
                this.renderType = wwt.ctl.renderType;
            var player = wwt.getActiveTourPlayer();
            this.tourTimecode = wwt.getEffectiveTourTimecode();
            if (player !== null) {
                this.isTourPlayerActive = true;
                this.isTourPlaying = wwt.getIsTourPlaying(player);
            }
            else {
                this.isTourPlayerActive = false;
                this.isTourPlaying = false;
            }
            var showWebGl2Warning = !wwt.si.isUsingWebGl2()
                && (Date.now() - this.timeAtStartup) < 15000;
            if (this.showWebGl2Warning != showWebGl2Warning) {
                this.showWebGl2Warning = showWebGl2Warning;
            }
        },
        internalIncrementTourCompletions: function () {
            this.tourCompletions += 1;
        },
        applySetting: function (setting) {
            if (this.$wwt.inst === null)
                throw new Error('cannot applySetting without linking to WWTInstance');
            this.$wwt.inst.applySetting(setting);
        },
        setBackgroundImageByName: function (imagesetName) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setBackgroundImageByName without linking to WWTInstance');
            this.$wwt.inst.setBackgroundImageByName(imagesetName);
        },
        setForegroundImageByName: function (imagesetName) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setForegroundImageByName without linking to WWTInstance');
            this.$wwt.inst.setForegroundImageByName(imagesetName);
        },
        setForegroundOpacity: function (opacity) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setForegroundOpacity without linking to WWTInstance');
            this.$wwt.inst.setForegroundOpacity(opacity);
            this.foregroundOpacity = opacity;
        },
        setupForImageset: function (options) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setupForImageset without linking to WWTInstance');
            this.$wwt.inst.setupForImageset(options);
        },
        zoom: function (factor) {
            if (this.$wwt.inst === null)
                throw new Error('cannot zoom without linking to WWTInstance');
            this.$wwt.inst.ctl.zoom(factor);
        },
        move: function (args) {
            if (this.$wwt.inst === null)
                throw new Error('cannot move without linking to WWTInstance');
            this.$wwt.inst.ctl.move(args.x, args.y);
        },
        tilt: function (args) {
            if (this.$wwt.inst === null)
                throw new Error('cannot tilt without linking to WWTInstance');
            this.$wwt.inst.ctl._tilt(args.x, args.y);
        },
        setTime: function (time) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setTime without linking to WWTInstance');
            this.$wwt.inst.stc.set_now(time);
            this.clockDiscontinuities += 1;
        },
        setClockRate: function (rate) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setClockRate without linking to WWTInstance');
            if (this.$wwt.inst.stc.get_timeRate() != rate) {
                this.$wwt.inst.stc.set_timeRate(rate);
                this.clockRate = rate;
                this.clockDiscontinuities += 1;
            }
        },
        setClockSync: function (isSynced) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setClockSync without linking to WWTInstance');
            if (this.$wwt.inst.stc.get_syncToClock() != isSynced) {
                this.$wwt.inst.stc.set_syncToClock(isSynced);
                if (isSynced) {
                    this.clockRate = this.$wwt.inst.stc.get_timeRate();
                }
                else {
                    this.clockRate = 0;
                }
                this.clockDiscontinuities += 1;
            }
        },
        startTour: function () {
            if (this.$wwt.inst === null)
                throw new Error('cannot start tour without linking to WWTInstance');
            var player = this.$wwt.inst.getActiveTourPlayer();
            if (player === null)
                throw new Error('no tour to start');
            player.play();
        },
        toggleTourPlayPauseState: function () {
            if (this.$wwt.inst === null)
                throw new Error('cannot play/pause tour without linking to WWTInstance');
            var player = this.$wwt.inst.getActiveTourPlayer();
            if (player === null)
                throw new Error('no tour to play/pause');
            // Despite the unclear name, this function does toggle play/pause state.
            player.pauseTour();
        },
        setTourPlayerLeaveSettingsWhenStopped: function (value) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setTourPlayerLeaveSettingsWhenStopped without linking to WWTInstance');
            var player = this.$wwt.inst.getActiveTourPlayer();
            if (player === null)
                throw new Error('no tour player to control');
            player.set_leaveSettingsWhenStopped(value);
        },
        seekToTourTimecode: function (value) {
            if (this.$wwt.inst === null)
                throw new Error('cannot seekToTourTimecode without linking to WWTInstance');
            this.$wwt.inst.seekToTourTimecode(value);
        },
        viewAsTourXml: function (name) {
            return __awaiter(this, void 0, void 0, function () {
                var editor, tour, blob, reader, tourXml;
                return __generator(this, function (_a) {
                    engine_root_wwtlib_namespaceObject.WWTControl.singleton.createTour(name || "");
                    editor = engine_root_wwtlib_namespaceObject.WWTControl.singleton.tourEdit;
                    editor.addSlide(false);
                    tour = editor.get_tour();
                    if (tour === null) {
                        return [2 /*return*/, Promise.resolve(null)];
                    }
                    blob = tour.saveToBlob();
                    reader = new FileReader();
                    reader.readAsText(blob);
                    tourXml = "";
                    return [2 /*return*/, new Promise(function (resolve, _reject) {
                            reader.onloadend = function () {
                                tourXml += reader.result;
                                resolve(tourXml);
                            };
                        })];
                });
            });
        },
        waitForReady: function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    if (this.$wwt.inst !== null) {
                        return [2 /*return*/, this.$wwt.inst.waitForReady()];
                    }
                    else {
                        return [2 /*return*/, new Promise(function (resolve, _reject) {
                                var waitThenResolve = function () {
                                    _this.$wwt.inst.waitForReady().then(resolve);
                                };
                                if (_this.$wwt.inst !== null) {
                                    waitThenResolve();
                                }
                                else {
                                    _this.$wwt.onLinkedCallbacks.push(waitThenResolve);
                                }
                            })];
                    }
                    return [2 /*return*/];
                });
            });
        },
        gotoRADecZoom: function (_a) {
            var raRad = _a.raRad, decRad = _a.decRad, zoomDeg = _a.zoomDeg, instant = _a.instant, rollRad = _a.rollRad;
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    if (this.$wwt.inst === null)
                        throw new Error('cannot gotoRADecZoom without linking to WWTInstance');
                    return [2 /*return*/, this.$wwt.inst.gotoRADecZoom(raRad, decRad, zoomDeg, instant, rollRad)];
                });
            });
        },
        timeToRADecZoom: function (_a) {
            var raRad = _a.raRad, decRad = _a.decRad, zoomDeg = _a.zoomDeg, rollRad = _a.rollRad;
            if (this.$wwt.inst === null)
                throw new Error('cannot get timeToRADecZoom without linking to WWTInstance');
            return this.$wwt.inst.timeToRADecZoom(raRad, decRad, zoomDeg, rollRad);
        },
        gotoTarget: function (options) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (this.$wwt.inst === null)
                        throw new Error('cannot gotoTarget without linking to WWTInstance');
                    return [2 /*return*/, this.$wwt.inst.gotoTarget(options)];
                });
            });
        },
        setTrackedObject: function (obj) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setTrackedObject without linking to WWTInstance');
            this.$wwt.inst.ctl.renderContext.set_solarSystemTrack(obj);
        },
        loadTour: function (_a) {
            var url = _a.url, play = _a.play;
            return __awaiter(this, void 0, void 0, function () {
                var tourRunTime, tourStopStartTimes, player, tour, nStops, i;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (this.$wwt.inst === null)
                                throw new Error('cannot loadTour without linking to WWTInstance');
                            if (!play) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.$wwt.inst.loadAndPlayTour(url)];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.$wwt.inst.loadTour(url)];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            tourRunTime = null;
                            tourStopStartTimes = [];
                            player = this.$wwt.inst.getActiveTourPlayer();
                            if (player !== null) {
                                tour = player.get_tour();
                                if (tour !== null) {
                                    tourRunTime = tour.get_runTime() * 0.001; // ms => s
                                    nStops = tour.get_tourStops().length;
                                    for (i = 0; i < nStops; i++) {
                                        tourStopStartTimes.push(tour.elapsedTimeTillTourstop(i));
                                    }
                                }
                            }
                            return [2 /*return*/, { tourRunTime: tourRunTime, tourStopStartTimes: tourStopStartTimes }];
                    }
                });
            });
        },
        loadImageCollection: function (_a) {
            var url = _a.url, loadChildFolders = _a.loadChildFolders;
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (this.$wwt.inst === null)
                                throw new Error('cannot loadImageCollection without linking to WWTInstance');
                            return [4 /*yield*/, this.$wwt.inst.loadImageCollection(url, loadChildFolders)];
                        case 1:
                            result = _b.sent();
                            this.availableImagesets = availableImagesets();
                            return [2 /*return*/, result];
                    }
                });
            });
        },
        addImagesetToRepository: function (imgset) {
            if (this.$wwt.inst === null)
                throw new Error('cannot addImagesetToRepository without linking to WWTInstance');
            return this.$wwt.inst.addImagesetToRepository(imgset);
        },
        // General layers
        deleteLayer: function (id) {
            if (this.$wwt.inst === null)
                throw new Error('cannot deleteLayer without linking to WWTInstance');
            var stringId = "";
            if (typeof id === "string") {
                stringId = id;
                var guid = engine_root_wwtlib_namespaceObject.Guid.fromString(id);
                this.$wwt.inst.lm.deleteLayerByID(guid, true, true);
            }
            else {
                stringId = id.toString();
                this.$wwt.inst.lm.deleteLayerByID(id, true, true);
            }
            // Mirror modification in the reactive system. Here we just
            // delete willy-nilly and ignore any missing cases.
            delete this.imagesetLayers[stringId];
            delete this.spreadSheetLayers[stringId];
            this.activeLayers = activeLayersList(this.$wwt);
        },
        // Imageset layers, including FITS layers
        addImageSetLayer: function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var wwtLayer, guidText;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.$wwt.inst === null)
                                throw new Error('cannot addImageSetLayer without linking to WWTInstance');
                            return [4 /*yield*/, this.$wwt.inst.addImageSetLayer(options)];
                        case 1:
                            wwtLayer = _a.sent();
                            guidText = wwtLayer.id.toString();
                            this.imagesetLayers[guidText] = new ImageSetLayerState(wwtLayer);
                            this.activeLayers = activeLayersList(this.$wwt);
                            return [2 /*return*/, wwtLayer];
                    }
                });
            });
        },
        // deprecated, but maintained for compatibility:
        loadFitsLayer: function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var addImageSetLayerOptions;
                return __generator(this, function (_a) {
                    if (this.$wwt.inst === null)
                        throw new Error('cannot loadFitsLayer without linking to WWTInstance');
                    addImageSetLayerOptions = {
                        url: options.url,
                        mode: "fits",
                        name: options.name,
                        goto: options.gotoTarget
                    };
                    return [2 /*return*/, this.$wwt.inst.addImageSetLayer(addImageSetLayerOptions)];
                });
            });
        },
        setImageSetLayerOrder: function (options) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setImageSetLayerOrder without linking to WWTInstance');
            this.$wwt.inst.setImageSetLayerOrder(options);
            this.activeLayers = activeLayersList(this.$wwt);
        },
        stretchFitsLayer: function (options) {
            if (this.$wwt.inst === null)
                throw new Error('cannot stretchFitsLayer without linking to WWTInstance');
            this.$wwt.inst.stretchFitsLayer(options);
            // Update the reactive mirror.
            var state = this.imagesetLayers[options.id];
            if (state) {
                state.scaleType = options.stretch;
                state.vmin = options.vmin;
                state.vmax = options.vmax;
            }
        },
        setFitsLayerColormap: function (options) {
            if (this.$wwt.inst === null)
                throw new Error('cannot setFitsLayerColormap without linking to WWTInstance');
            this.$wwt.inst.setFitsLayerColormap(options);
            // Update the reactive mirror.
            var state = this.imagesetLayers[options.id];
            if (state) {
                state.colormapName = options.name;
            }
        },
        applyFitsLayerSettings: function (options) {
            var e_5, _a;
            if (this.$wwt.inst === null)
                throw new Error('cannot applyFitsLayerSettings without linking to WWTInstance');
            this.$wwt.inst.applyFitsLayerSettings(options);
            // Update the reactive mirror.
            var state = this.imagesetLayers[options.id];
            if (state) {
                try {
                    for (var _b = tslib_es6_values(options.settings), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var s = _c.value;
                        applyImageSetLayerSetting(state.settings, s);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        },
        // Spreadsheet layers
        createTableLayer: function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var layer, prom, wwtLayer, guidText;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.$wwt.inst === null)
                                throw new Error('cannot createTableLayer without linking to WWTInstance');
                            layer = this.$wwt.inst.lm.createSpreadsheetLayer(options.referenceFrame, options.name, options.dataCsv);
                            // Value-add init copied from the pywwt JS component.
                            // Override any column guesses:
                            layer.set_lngColumn(-1);
                            layer.set_latColumn(-1);
                            layer.set_altColumn(-1);
                            layer.set_sizeColumn(-1);
                            layer.set_colorMapColumn(-1);
                            layer.set_startDateColumn(-1);
                            layer.set_endDateColumn(-1);
                            layer.set_xAxisColumn(-1);
                            layer.set_yAxisColumn(-1);
                            layer.set_zAxisColumn(-1);
                            layer.set_altUnit(AltUnits.meters);
                            layer.set_referenceFrame(options.referenceFrame);
                            if (options.referenceFrame == 'Sky') {
                                layer.set_astronomical(true);
                            }
                            prom = Promise.resolve(layer);
                            return [4 /*yield*/, prom];
                        case 1:
                            wwtLayer = _a.sent();
                            guidText = wwtLayer.id.toString();
                            this.spreadSheetLayers[guidText] = new SpreadSheetLayerState(wwtLayer);
                            this.activeLayers = activeLayersList(this.$wwt);
                            return [2 /*return*/, wwtLayer];
                    }
                });
            });
        },
        applyTableLayerSettings: function (options) {
            var e_6, _a;
            if (this.$wwt.inst === null)
                throw new Error('cannot applyTableLayerSettings without linking to WWTInstance');
            this.$wwt.inst.applyTableLayerSettings(options);
            // Mirror changes in the reactive framework.
            var state = this.spreadSheetLayers[options.id];
            if (state !== undefined) {
                try {
                    for (var _b = tslib_es6_values(options.settings), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var s = _c.value;
                        applySpreadSheetLayerSetting(state, s);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
        },
        updateTableLayer: function (options) {
            if (this.$wwt.inst === null)
                throw new Error('cannot updateTableLayer without linking to WWTInstance');
            this.$wwt.inst.updateTableLayer(options);
            // Nothing to mirror in reactive-land -- this call affects the table data.
        },
        // Progressive HiPS catalogs.
        //
        // These have some characteristics of imagesets, and some characteristics
        // of spreadsheet layers.
        addCatalogHipsByName: function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var imgset, hips, wwtLayer, guidText, info;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.$wwt.inst == null)
                                throw new Error('cannot addCatalogHipsByName without linking to WWTInstance');
                            return [4 /*yield*/, this.$wwt.inst.addCatalogHipsByName(options)];
                        case 1:
                            imgset = _a.sent();
                            hips = imgset.get_hipsProperties();
                            if (hips !== null) {
                                wwtLayer = hips.get_catalogSpreadSheetLayer();
                                guidText = wwtLayer.id.toString();
                                this.spreadSheetLayers[guidText] = new SpreadSheetLayerState(wwtLayer);
                                info = availableImagesets().find(function (x) { return x.name === options.name; });
                                if (info !== undefined) {
                                    info.id = guidText;
                                }
                            }
                            this.activeLayers = activeLayersList(this.$wwt);
                            return [2 /*return*/, imgset];
                    }
                });
            });
        },
        getCatalogHipsDataInView: function (options) {
            if (this.$wwt.inst == null)
                throw new Error('cannot getCatalogHipsDataInView without linking to WWTInstance');
            return this.$wwt.inst.getCatalogHipsDataInView(options);
        },
        removeCatalogHipsByName: function (name) {
            if (this.$wwt.inst == null)
                throw new Error('cannot removeCatalogHipsByName without linking to WWTInstance');
            this.$wwt.inst.ctl.removeCatalogHipsByName(name);
            var id = engine_root_wwtlib_namespaceObject.Guid.createFrom(name).toString();
            delete this.spreadSheetLayers[id];
            this.activeLayers = activeLayersList(this.$wwt);
        },
        // Annotations
        addAnnotation: function (ann) {
            if (this.$wwt.inst === null)
                throw new Error('cannot addAnnotation without linking to WWTInstance');
            this.$wwt.inst.si.addAnnotation(ann);
        },
        removeAnnotation: function (ann) {
            if (this.$wwt.inst === null)
                throw new Error('cannot removeAnnotation without linking to WWTInstance');
            this.$wwt.inst.si.removeAnnotation(ann);
        },
        clearAnnotations: function () {
            if (this.$wwt.inst === null)
                throw new Error('cannot clearAnnotations without linking to WWTInstance');
            this.$wwt.inst.si.clearAnnotations();
        },
        // Capturing the current display
        captureFrame: function (options) {
            if (this.$wwt.inst === null)
                throw new Error('cannot captureThumbnail without linking to WWTInstance');
            return this.$wwt.inst.captureFrame(options);
        },
        // Capturing a video as a readable stream
        captureVideo: function (options) {
            if (this.$wwt.inst === null)
                throw new Error("cannot captureVideo without linking to WWTInstance");
            return this.$wwt.inst.captureVideo(options);
        }
    },
});

;// CONCATENATED MODULE: ./src/wwtaware.ts
// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License




/** A class for Vue components that wish to interact with a [[WWTComponent]]
 * through the Pinia state management system.
 *
 * Skip to [The WWT Pinia Interface](#the-wwt-pinia-interface) for a quick summary
 * of how WWT's state is exposed and controlled in Pinia.
 *
 * ## Introduction
 *
 * Vue applications are composed of multiple [components]. In a WWT-powered app,
 * one of those components will be a `<WorldWideTelescope>` component containing
 * the actual WWT rendering window. The other components of the app will wish to
 * monitor or alter the state of the WWT rendering window. The
 * [[WWTAwareComponent]] class provides a convenient framework for doing so.
 *
 * [components]: https://vuejs.org/v2/guide/components.html
 *
 * In particular, if your component [extends] this class, it
 * will automatically be set up with fields and methods allowing you to interact
 * with the WWT engine’s state. A minimal example:
 *
 * [extends]: https://vuejs.org/api/options-composition.html#extends
 *
 * ```vue
 * <template>
 *   <div id="app">
 *     <WorldWideTelescope wwt-namespace="mywwt"></WorldWideTelescope>
 *     <p class="coord-overlay">{{ coordText }}</p>
 *   </div>
 * </template>
 *
 * <script lang="ts">
 *   import { defineComponent } from "vue";
 *   import { fmtDegLat, fmtHours } from "@wwtelescope/astro";
 *   import { WWTAwareComponent } from "@wwtelescope/engine-pinia";
 *
 *   export default App = defineComponent({
 *     extends: WWTAwareComponent,
 *
 *     computed: {
 *      coordText() {
 *        return `${fmtHours(this.wwtRARad)} ${fmtDegLat(this.wwtDecRad)}`;
 *      }
 *     }
 *   });
 * </script>
 * ```
 *
 * This simple `App` component will display the coordinates of the current center
 * of the WWT view, and the coordinate readout will update automagically as the
 * user interacts with the view.
 *
 * ## Props
 *
 * Classes inheriting from [[WWTAwareComponent]] automatically define a prop
 * named [[wwtNamespace]]. This should be set to the namespace of the [Pinia
 * module] used to track the `<WorldWideTelescope>` component’s state — that is,
 * it should have the same value as that component’s own `wwtNamespace` prop.
 * The default value is `"wwt"`.
 *
 * [Pinia module]: https://pinia.vuejs.org/core-concepts/
 *
 * ## The WWT Pinia Interface
 *
 * Your [[WWTAwareComponent]] can monitor or manipulate the state of the WWT
 * renderer using the following interfaces, grouped by category. As a reminder,
 * in the Pinia paradigm, state is expressed in [state variables] and [getters],
 * and modified either directly or through [actions] (which can be asynchronous).
 *
 * [state variables]: https://pinia.vuejs.org/core-concepts/state.html
 * [getters]: https://pinia.vuejs.org/core-concepts/getters.html
 * [actions]: https://pinia.vuejs.org/core-concepts/actions.html
 *
 * ### Initialization
 *
 * Actions:
 *
 * - [[waitForReady]]
 * - [[setupForImageset]]
 *
 * ### Basic View Information
 *
 * State:
 *
 * - [[wwtCurrentTime]]
 * - [[wwtClockDiscontinuities]]
 * - [[wwtClockRate]]
 * - [[wwtDecRad]]
 * - [[wwtRARad]]
 * - [[wwtZoomDeg]]
 *
 * Getters:
 *
 * - [[findRADecForScreenPoint]]
 *
 * Actions:
 *
 * - [[gotoRADecZoom]]
 * - [[gotoTarget]]
 * - [[setClockRate]]
 * - [[setClockSync]]
 * - [[setTime]]
 * - [[setTrackedObject]]
 * - [[zoom]]
 *
 * ### Image Sets
 *
 * State:
 *
 * - [[wwtAvailableImagesets]]
 * - [[wwtBackgroundImageset]]
 * - [[wwtForegroundImageset]]
 * - [[wwtForegroundOpacity]]
 * - [[wwtRenderType]]
 *
 * Getters:
 *
 * - [[lookupImageset]]
 *
 * Actions:
 *
 * - [[loadImageCollection]]
 * - [[setBackgroundImageByName]]
 * - [[setForegroundImageByName]]
 * - [[setForegroundOpacity]]
 * - [[setupForImageset]]
 * - [[updateAvailableImagesets]]
 *
 * ### Imageset Layers (including FITS imagery)
 *
 * State:
 *
 * - [[wwtActiveLayers]]
 * - [[wwtImagesetLayers]]
 *
 * Getters:
 *
 * - [[activeImagesetLayerStates]]
 * - [[imagesetForLayer]]
 * - [[imagesetStateForLayer]]
 *
 * Actions:
 *
 * - [[addImageSetLayer]]
 * - [[loadFitsLayer]] (deprecated)
 * - [[applyFitsLayerSettings]]
 * - [[setFitsLayerColormap]]
 * - [[stretchFitsLayer]]
 * - [[setImageSetLayerOrder]]
 * - [[deleteLayer]]
 *
 * ### Tabular Data Layers
 *
 * State:
 *
 * - [[wwtActiveLayers]]
 * - [[wwtSpreadSheetLayers]]
 *
 * Actions:
 *
 * - [[createTableLayer]]
 * - [[applyTableLayerSettings]]
 * - [[updateTableLayer]]
 * - [[deleteLayer]]
 *
 * ### Annotations
 *
 * Actions:
 *
 * - [[addAnnotation]]
 * - [[clearAnnotations]]
 * - [[removeAnnotation]]
 *
 * ### Progressive HiPS Catalogs
 *
 * These have some characteristics of both imagesets and tabular ("spreadsheet") data
 * layers.
 *
 * Getters:
 *
 * - [[layerForHipsCatalog]]
 * - [[spreadsheetStateForHipsCatalog]]
 *
 * Actions:
 *
 * - [[addCatalogHipsByName]]
 * - [[applyTableLayerSettings]]
 * - [[getCatalogHipsDataInView]]
 * - [[removeCatalogHipsByName]]
 *
 * ### Tours
 *
 * State:
 *
 * - [[wwtIsTourPlayerActive]]
 * - [[wwtIsTourPlaying]]
 * - [[wwtTourCompletions]]
 * - [[wwtTourRunTime]]
 * - [[wwtTourStopStartTimes]]
 * - [[wwtTourTimecode]]
 *
 * Actions:
 *
 * - [[loadTour]]
 * - [[seekToTourTimecode]]
 * - [[setTourPlayerLeaveSettingsWhenStopped]]
 * - [[startTour]]
 * - [[toggleTourPlayPauseState]]
 *
 * ### Miscellaneous
 *
 * State:
 *
 * - [[showWebGl2Warning]]
 *
 * Actions:
 *
 * - [[applySetting]]
 **/
var WWTAwareComponent = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.defineComponent)({
    props: {
        /** The namespace of the Pinia module used to track the WWT component’s state.
         * This prop should have the same value in all components in the app that
         * reference WWT.
         */
        wwtNamespace: { type: String, default: "wwt", required: true },
        wwtFreestandingAssetBaseurl: String,
    },
    computed: __assign(__assign({}, mapState(engineStore, {
        /** The GUIDs of all rendered layers, in their draw order.
         *
         * This list gives the GUIDs of the layers that are currently candidates for
         * rendering. This list is determined by the hierarchy of "layer maps"
         * registered with the engine and its current rendering mode. Layers in this
         * list might not be actually rendered if their `enabled` flag is false, if
         * they are fully transparent, and so on.
         **/
        wwtActiveLayers: 'activeLayers',
        /** Information about the imagesets that are available to be used as a background.
           *
           * The info includes the name, which can then be used to set the background image
           * via the [[setBackgroundImageByName]] mutation.
           */
        wwtAvailableImagesets: 'availableImagesets',
        /** The current background [Imageset](../../engine/classes/imageset.html), or
         * null if it is undefined.
         *
         * You can cause this state variable to change using the
         * [[setBackgroundImageByName]] mutation.
         * **/
        wwtBackgroundImageset: 'backgroundImageset',
        /** The current time of WWT internal clock. In normal operation this variable
         * will change with every rendered WWT frame, or every 30 ms or so.
         */
        wwtCurrentTime: 'currentTime',
        /** The number of times that the progression of the WWT internal clock has
         * been changed discontinuously.
         *
         * The main use of this state variable is that you can
         * [watch](https://vuejs.org/api/reactivity-core.html#watch) for changes to it and be alerted
         * when the clock has been altered. */
        wwtClockDiscontinuities: 'clockDiscontinuities',
        /** The rate at which the WWT internal clock progresses compared to real time.
         * If the WWT clock is paused, this will be zero. Negative and fractional
         * values are both possible. */
        wwtClockRate: 'clockRate',
        /** The current declination of the center of the WWT view, in radians.
         *
         * TODO: define the meaning here for view modes other than "sky."
         */
        wwtDecRad: 'decRad',
        /** The current foreground [Imageset](../../engine/classes/imageset.html), or
         * null if it is undefined.
         *
         * You can cause this state variable to change using the
         * [[setForegroundImageByName]] mutation.
         * **/
        wwtForegroundImageset: 'foregroundImageset',
        /** The opacity of the foreground imageset. Values range between 0 (invisible)
          * and 100 (fully opaque). */
        wwtForegroundOpacity: 'foregroundOpacity',
        /** A table of activated imageset layers.
         *
         * Use [[imagesetStateForLayer]] to access information about a particular
         * layer.
         */
        wwtImagesetLayers: 'imagesetLayers',
        /** Whether a tour has been loaded up and is available for playback. */
        wwtIsTourPlayerActive: 'isTourPlayerActive',
        /** Whether a tour is actively playing back right now. This can spontaneously become
          * false if the tour completes playing. */
        wwtIsTourPlaying: 'isTourPlaying',
        /** The current right ascension of the center of the WWT view, in radians.
         *
         * TODO: define the meaning here for view modes other than "sky."
         */
        wwtRARad: 'raRad',
        /** The current mode of the WWT renderer.
         *
         * This is derived from the "type" of the active background imageset. To
         * change the mode, change the background imageset with
         * [[setBackgroundImageByName]].
         */
        wwtRenderType: 'renderType',
        /** The current roll of the view camera, in radians */
        wwtRollRad: 'rollRad',
        /** Whether or not to show a warning about recommending WebGL 2 */
        wwtShowWebGl2Warning: 'showWebGl2Warning',
        /** A table of activated imageset layers.
         *
         * Use [[imagesetStateForLayer]] to access information about a particular
         * layer.
         */
        wwtSpreadSheetLayers: 'spreadSheetLayers',
        /** The number of times that a WWT tour has completed playing.
         *
         * The main use of this state variable is that you can
         * [watch](https://vuejs.org/api/reactivity-core.html#watch) for changes to it and be alerted
         * when a tour finishes. Watching [[wwtIsTourPlaying]] doesn't suffice because
         * that will trigger when a tour is paused. */
        wwtTourCompletions: 'tourCompletions',
        /** The total runtime of the current tour, in seconds, if there is one. */
        wwtTourRunTime: 'tourRunTime',
        /** The timecodes at which the current tour’s "stops" begin, in seconds.
         *
         * Each WWT tour is composed of one or more "stops", each of which has a fixed
         * wall-clock duration. This variable gives the start times of the stops under
         * the assumption that they all follow one another in sequence. It is possible
         * to have nonlinear flow from one stop to the next.
         *
         * If no tour is loaded, this is an empty array.
         */
        wwtTourStopStartTimes: 'tourStopStartTimes',
        /** The "timecode" of the current tour playback progression.
         *
         * The "timecode" is approximately the number of seconds elapsed since tour
         * playback began. More precisely, however, it is the start time of the
         * current tour stop, plus however much wall-clock time has elapsed while at
         * that stop. Because it is possible for stops to link to each other
         * non-linearly, it is also possible for the timecode to progress non-linearly
         * even when the tour plays back without user interaction.
         *
         * In combination with [[wwtTourStopStartTimes]], you can use this value to
         * determine the index number of the currently active tour stop.
         *
         * If no tour is loaded, this is zero.
         */
        wwtTourTimecode: 'tourTimecode',
        /** The WWT zoom level, in degrees.
         *
         * TODO: define the semantics here in 3D and other modes.
         *
         * In 2D sky mode, the zoom level is the angular height of the viewport,
         * *times six*.
         */
        wwtZoomDeg: 'zoomDeg',
    })), mapState(engineStore, [
        /** Get the reactive state for the active imageset layers
         *
         * These layers are created using the [[addImageSetLayer]] action. The state
         * structures returned by this function are part of the reactive store, so
         * you can wire them up to your UI and they will update correctly. The list is
         * returned in the engine's render order.
         *
         * @returns The layer states
         */
        "activeImagesetLayerStates",
        /** Get the right ascension and declination, in degrees, for x, y coordinates on the screen */
        "findRADecForScreenPoint",
        /** Given an RA and Dec position, return the x, y coordinates of the screen point */
        "findScreenPointForRADec",
        /** Look up the WWT engine object for an active imageset layer.
         *
         * This getter gets the WWT `Imageset` object associated with an imageset
         * layer. The returned object is *not* part of the Vue(x) reactivity system,
         * so you shouldn't use it to set up UI elements, but you can obtain more
         * detailed information about the imageset than is stored in the state
         * management system. For UI purposes, use [[imagesetStateForLayer]].
         *
         * @param guidtext The GUID of the layer to query, as a string
         * @returns The layer's underlying imageset, or null if the GUID is
         * unrecognized
         */
        "imagesetForLayer",
        /** Look up the reactive state for an active imageset layer.
         *
         * These layers are created using the [[addImageSetLayer]] action. The state
         * returned by this function is part of the reactive store, so you can
         * wire it up to your UI and it will update as the layer settings are changed.
         * If you need "runtime" state not captured in the reactivity system, you may
         * need to use [[imagesetForLayer]] instead.
         *
         * @param guidtext The GUID of the layer to query, as a string
         * @returns The layer state, or null if the GUID is unrecognized
         */
        "imagesetStateForLayer",
        /** Get the actual WWT `SpreadSheetLayer` for the named HiPS catalog.
         *
         * Do not use this function for UI purposes -- the WWT layer object is not
         * integrated into the reactive state system, and so if you use it as a basis
         * for UI elements, those elements will not be updated properly if/when the
         * layer's settings change. Use [[spreadsheetStateForHipsCatalog]] instead.
         *
         * @param name The `datasetName` of the HiPS catalog
         */
        "layerForHipsCatalog",
        /** Look up an [Imageset](../../engine/classes/imageset.html) in the engine’s
         * table of ones with registered names.
         *
         * This delegates to
         * [WWTControl.getImagesetByName()](../../engine/wwtcontrol.html#getimagesetbyname),
         * which has very eager name-matching rules. But if nothing matches, null is
         * returned.
         *
         * Imagesets are not added to the engine’s list of names automatically. In
         * order for an imageset to be findable by this function, its containing
         * folder must have been loaded using the [[loadImageCollection]] action.
         */
        "lookupImageset",
        /** Get the actual WWT `SpreadSheetLayer` for the table layer with the given ID.
         *
         * Do not use this function for UI purposes -- the WWT layer object is not
         * integrated into the reactive state system, and so if you use it as a basis
         * for UI elements, those elements will not be updated properly if/when the
         * layer's settings change. Use [[spreadsheetState]] instead.
         *
         * @param id The table layer's identifier.
         */
        "spreadSheetLayerById",
        /** Get the actual WWT `SpreadSheetLayer` for the table layer corresponding
         * to the given CatalogLayerInfo.
         *
         * Do not use this function for UI purposes -- the WWT layer object is not
         * integrated into the reactive state system, and so if you use it as a basis
         * for UI elements, those elements will not be updated properly if/when the
         * layer's settings change. Use [[spreadsheetState]] instead.
         *
         * @param id The table layer's identifier.
         */
        "spreadSheetLayer",
        /** Get reactive `SpreadSheetLayer` settings for the table layer corresponding to
         * the given CatalogLayerInfo.
         *
         * The returned data structure is a component of the app's reactive state. You can
         * therefore use the settings to construct UI elements, and they will update
         * reactively as the state evolves. The actual data structures used by WWT are
         * separate, but the two mirror each other.
         *
         * @param catalog A CatalogLayerInfo object corresponding to the layer.
         */
        "spreadsheetState",
        /** Get reactive `SpreadSheetLayer` settings for the table layer with the given ID.
         *
         * The returned data structure is a component of the app's reactive state. You can
         * therefore use the settings to construct UI elements, and they will update
         * reactively as the state evolves. The actual data structures used by WWT are
         * separate, but the two mirror each other.
         *
         * @param id The identifier of the table layer.
         */
        "spreadsheetStateById",
        /** Get reactive `SpreadSheetLayer` settings for the named HiPS catalog.
         *
         * The returned data structure is a component of the app's reactive state. You can
         * therefore use the settings to construct UI elements, and they will update
         * reactively as the state evolves. The actual data structures used by WWT are
         * separate, but the two mirror each other.
         *
         * @param name The `datasetName` of the HiPS catalog
         */
        "spreadsheetStateForHipsCatalog",
    ])),
    methods: __assign({}, mapActions(engineStore, [
        /** Add a "catalog HiPS" dataset to the current view, by name.
         *
         * If the catalog name is not in the engine's registry, the promise rejects.
         */
        "addCatalogHipsByName",
        /** Request the creation of a tabular data layer.
         *
         * The action resolves to a new [SpreadSheetLayer](../../engine/classes/spreadsheetlayer.html) instance.
         */
        "createTableLayer",
        /** Request an export of the catalog HiPS data within the current viewport. */
        "getCatalogHipsDataInView",
        /** Command the view to steer to a specific configuration.
         *
         * The async action completes when the view arrives, or when
         * a subsequent view command overrides this one.
         *
         * TODO: document semantics when not in 2D sky mode!
         */
        "gotoRADecZoom",
        /** Returns the time it would take, in seconds, to navigate to the given target. */
        "timeToRADecZoom",
        /** Command the view to steer as specified in
         * [the options](../../engine-helpers/interfaces/gototargetoptions.html).
         *
         * The async action completes when the view arrives, or when
         * a subsequent view command overrides this one.
         */
        "gotoTarget",
        /** Request the engine to load the specified image collection.
         *
         * The image collection is a [WTML file](https://docs.worldwidetelescope.org/data-guide/1/data-file-formats/collections/)
         * Images in collections loaded this way become usable for name-based lookup
         * by interfaces such as [[setForegroundImageByName]].
         *
         * The action resolves to a [Folder](../../engine/classes/folder.html) instance.
         * It’s asynchronous because the specified WTML file has to be downloaded.
         */
        "loadImageCollection",
        /** Add an imageset directly into the engine's database.
         *
         * If an imageset with the same URL has already been loaded, this is a
         * no-op.
         *
         * This returns the imageset that ultimately resides in the engine's
         * database. It could either be the input argument, if it was newly added,
         * or a pre-existing imageset in the no-op condition.
         */
        "addImagesetToRepository",
        /** Deprecated. Use addImageSetLayer instead.
         * Request the creation of a FITS image layer.
         *
         * The action resolves to a new [ImageSetLayer](../../engine/classes/imagesetlayer.html) instance.
         * It’s asynchronous because the requested FITS file has to be downloaded.
         */
        "loadFitsLayer",
        /** Request the creation of a image layer. Either a single FITS or an image set.
         *
         * The action resolves to a new [ImageSetLayer](../../engine/classes/imagesetlayer.html) instance.
         * It’s asynchronous because the requested url has to be downloaded.
         */
        "addImageSetLayer",
        /** Request the engine to load a tour file.
         *
         * The action resolves when the load is complete. It’s asynchronous because
         * the full WTT tour file has to be downloaded.
        */
        "loadTour",
        /** Get the current view as a one-slide tour, serialized to XML */
        "viewAsTourXml",
        /** Wait for the WWT engine to become ready for usage.
         *
         * You should invoke this action and wait for is completion before trying to
         * do anything else with a WWT-aware component. The action resolves when the
         * WWT engine has completed its initialization, which involes the download of
         * some supporting data files.
         */
        "waitForReady",
        // Formerly mutations
        // TODO: Alphabetize this into one big list
        /** Add an [Annotation](../../engine/classes/annotation.html) to the view. */
        "addAnnotation",
        /** Alter one or more settings of the specified FITS image layer as specified
         * in [the options](../../engine-helpers/interfaces/applyfitslayersettingsoptions.html).
         */
        "applyFitsLayerSettings",
        /** Alter one or more settings of the specified tabular data layers as specified
         * in [the options](../../engine-helpers/interfaces/applytablelayersettingsoptions.html).
         */
        "applyTableLayerSettings",
        /** Alter one [WWT engine setting](../../engine/modules.html#enginesetting). */
        "applySetting",
        /** Capture the current frame as an image `Blob` with the desired width, height, and format.
         * The first argument is a callback function to execute on the created `Blob`. */
        'captureFrame',
        /** Capture a video as a stream of image `Blob`s with the desired width, height and format.
         * The number of frames per second and total frame count are specified as well. */
        'captureVideo',
        /** Clear all [Annotations](../../engine/classes/annotation.html) from the view. */
        "clearAnnotations",
        /** Delete the specified layer from the layer manager.
         *
         * A layer may be identified by either its name or its [id](../../engine/classes/layer.html#id).
         */
        "deleteLayer",
        /** Remove the specified [Annotation](../../engine/classes/annotation.html) from the view. */
        "removeAnnotation",
        /** Remove a "catalog HiPS" dataset to the current view, by name. */
        "removeCatalogHipsByName",
        /** Seek tour playback to the specified timecode.
         *
         * See [[wwtTourTimecode]] for a definition of the tour timecode.
         *
         * An important limitation is that the engine can only seek to the very
         * beginning of a tour stop. If you request a timecode in the middle of a
         * slide, the seek will actually occur to the start time of that slide.
         */
        "seekToTourTimecode",
        /** Set the current background [Imageset](../../engine/classes/imageset.html)
         * based on its name.
         *
         * The name lookup here is effectively done using [[lookupImageset]]. If
         * the name is not found, the current background imageset remains unchanged.
         *
         * Changing the background imageset may change the value of [[wwtRenderType]],
         * and the overall "mode" of the WWT renderer.
         */
        "setBackgroundImageByName",
        /** Set the rate at which the WWT clock progresses compared to wall-clock time.
         *
         * A value of 10 means that the WWT clock progresses ten times faster than
         * real time. A value of -0.1 means that the WWT clock moves backwards, ten
         * times slower than real time.
         *
         * Altering this causes an increment in [[wwtClockDiscontinuities]].
         */
        "setClockRate",
        /** Set whether the WWT clock should progress with real time.
         *
         * See
         * [SpaceTimeController.set_syncToClock()](../../engine/modules/spacetimecontroller.html#set_synctoclock).
         * This interface effectively allows you to pause the WWT clock.
         *
         * Altering this causes an increment in [[wwtClockDiscontinuities]].
         */
        "setClockSync",
        /** Set the colormap used for a FITS image layer according to
         * [the options](../../engine-helpers/interfaces/setfitslayercolormapoptions.html).
         */
        "setFitsLayerColormap",
        /** Set the current foreground [Imageset](../../engine/classes/imageset.html)
         * based on its name.
         *
         * The name lookup here is effectively done using [[lookupImageset]]. If
         * the name is not found, the current foreground imageset remains unchanged.
         */
        "setForegroundImageByName",
        /** Set the opacity of the foreground imageset.
         *
         * Valid values are between 0 (invisible) and 100 (fully opaque).
         */
        "setForegroundOpacity",
        /** Change the [ImageSetLayer](../../engine/classes/imagesetlayer.html)
         * position in the draw cycle.
         */
        "setImageSetLayerOrder",
        /** Set whether the renderer settings of tours should remain applied after
         * those tours finish playing back.
         *
         * This specialized option helps avoid jarring visual effects when tours
         * finish playing. If a tour activates a renderer option like "local horizon
         * mode", by default that option will turn off when the tour finishes, causing
         * the view to suddenly change. If this option is set to True, that setting
         * will remain active, preventing the sudden change.
         */
        "setTourPlayerLeaveSettingsWhenStopped",
        /** Set the current time of WWT's internal clock.
         *
         * Altering this causes an increment in [[wwtClockDiscontinuities]].
         */
        "setTime",
        /** Set the "tracked object" in the 3D solar system view.
         *
         * Allowed values are
         * [defined in @wwtelescope/engine-types](../../engine-types/enums/solarsystemobjects.html).
         */
        "setTrackedObject",
        /** Set up the background and foreground imagesets according to
         * [the options](../../engine-helpers/interfaces/setupforimagesetoptions.html)
         *
         * The main use of this interface is that it provides a mechanism to guess
         * the appropriate background imageset given a foreground imageset that you
         * want to show.
         */
        "setupForImageset",
        /** Start playback of the currently loaded tour.
         *
         * Nothing happens if no tour is loaded.
         */
        "startTour",
        /** Alter the "stretch" of a FITS image layer according to
         * [the options](../../engine-helpers/interfaces/stretchfitslayeroptions.html).
         */
        "stretchFitsLayer",
        /** Toggle the play/pause state of the current tour.
         *
         * Nothing happens if no tour is loaded.
         */
        "toggleTourPlayPauseState",
        /** Update the contents of a tabular data layer according to
         * [the options](../../engine-helpers/interfaces/updatetablelayeroptions.html).
         */
        "updateTableLayer",
        //"updateAvailableImagesets",
        /** Set the zoom level of the view.
         *
         * This action may result in an action that takes a perceptible amount of
         * time to resolve, if the "smooth pan" renderer option is enabled. To have
         * proper asynchronous feedback about when the zoom operation completes, use
         * [[gotoRADecZoom]].
         */
        "zoom",
        /** Moves the position of the view */
        "move",
        /** Tilts the position of the view */
        "tilt",
    ]))
});

;// CONCATENATED MODULE: ../node_modules/ts-loader/index.js??clonedRuleSet-40.use[0]!../node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/Component.vue?vue&type=template&id=78a35556&ts=true

var _hoisted_1 = ["id"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
        id: _ctx.uniqueId,
        class: "wwtelescope-component"
    }, null, 8, _hoisted_1));
}

;// CONCATENATED MODULE: ./src/Component.vue?vue&type=template&id=78a35556&ts=true

;// CONCATENATED MODULE: ../node_modules/ts-loader/index.js??clonedRuleSet-40.use[0]!../node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/Component.vue?vue&type=script&lang=ts





var idCounter = 0;
/** This is the component docstring. */
/* harmony default export */ const Componentvue_type_script_lang_ts = ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.defineComponent)({
    props: {
        wwtNamespace: { type: String, default: "wwt", required: true },
        wwtFreestandingAssetBaseurl: String,
    },
    data: function () {
        return {
            uniqueId: "",
            wwt: undefined,
            renderLoopId: undefined
        };
    },
    methods: __assign({}, mapActions(engineStore, [
        "internalIncrementTourCompletions",
        "internalLinkToInstance",
        "internalUnlinkFromInstance",
        "internalUpdate",
        "waitForReady",
    ])),
    created: function () {
        // Create a globally unique ID for the div that the WWT engine can latch onto.
        var uid = "wwtcmpt".concat(idCounter);
        Object.defineProperties(this, {
            uniqueId: { get: function () { return uid; } },
        });
        idCounter += 1;
    },
    mounted: function () {
        var _this = this;
        this.wwt = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.markRaw)(new WWTInstance({
            elId: this.uniqueId,
            startInternalRenderLoop: false,
            // Start at the Galactic Center by default. RA of the GC ~= 266.4 deg; in WWT, lng = 360 - RA.
            startLatDeg: -28.9,
            startLngDeg: 93.6,
            freestandingAssetBaseurl: this.wwtFreestandingAssetBaseurl,
        }));
        // TODO: The build fails with a TypeScript error without "as WWTInstance"
        // Figure out why!
        this.internalLinkToInstance(this.wwt);
        var render = function () {
            var wwt = _this.wwt;
            _this.renderLoopId = window.requestAnimationFrame(render);
            wwt.ctl.renderOneFrame();
            _this.internalUpdate();
        };
        // Wait for the WWT engine to signal readiness, then wait another tick, then
        // start the rendering loop. This way, if a user wants to do some
        // initialization that has to wait for the ready signal, we won't flash any
        // weirdly-initialized content.
        this.waitForReady().then(function () {
            (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.nextTick)().then(function () {
                _this.renderLoopId = window.requestAnimationFrame(render);
            });
        });
        this.wwt.tourEndedCallback = (function (_tp) {
            _this.internalIncrementTourCompletions();
        });
    },
    unmounted: function () {
        if (this.renderLoopId !== undefined) {
            window.cancelAnimationFrame(this.renderLoopId);
            this.renderLoopId = undefined;
        }
        if (this.wwt !== undefined) {
            this.wwt.tourEndedCallback = null;
        }
        this.internalUnlinkFromInstance();
    }
}));

;// CONCATENATED MODULE: ./src/Component.vue?vue&type=script&lang=ts
 
// EXTERNAL MODULE: ../node_modules/vue-loader/dist/exportHelper.js
var exportHelper = __webpack_require__(959);
;// CONCATENATED MODULE: ./src/Component.vue




;
const __exports__ = /*#__PURE__*/(0,exportHelper/* default */.Z)(Componentvue_type_script_lang_ts, [['render',render]])

/* harmony default export */ const Component = (__exports__);
;// CONCATENATED MODULE: ./src/index.ts
// Copyright 2020 the .NET Foundation
// Licensed under the MIT License






var wwtPinia = createPinia();
wwtPinia.use(function (_a) {
    var store = _a.store;
    store.$wwt = new WWTGlobalState();
});

;// CONCATENATED MODULE: ../node_modules/@vue/cli-service/lib/commands/build/entry-lib-no-default.js



})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.common.js.map
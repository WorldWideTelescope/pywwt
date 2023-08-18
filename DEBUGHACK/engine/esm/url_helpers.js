// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The helper class for rewriting URLs. This gets complicated, because we might
// need to proxy for CORS headers and/or HTTPS support, *and* we sometimes also
// want to change the host and/or path to allow the engine or the webclient to
// swap out the data backend or the frontend.

import { registerType, registerEnum } from "./typesystem.js";
import { ss } from "./ss.js";
import { freestandingMode } from "./data_globals.js";

var DomainHandling = {
    wwtFlagship: 0, // this host is worldwidetelescope.org or an equivalent
    localhost: 1, // this host is localhost or an equivalent
    neverProxy: 2, // this host is known to never need proxying
    tryNoProxy: 3,  // none of the above, and we hope that we can get data from it without needing to use our proxy
    proxy: 4, // none of the above, and we need to proxy it for HTTPS/CORS reasons
}

// wwtlib.URLRewriteMode

export var URLRewriteMode = {
    asIfAbsolute: 0, // act as if this URL is absolute even if it is missing a domain
    originRelative: 1, // if this URL is relative, treat it as relative to the browser origin
};

registerType("URLRewriteMode", URLRewriteMode);
registerEnum("URLRewriteMode", URLRewriteMode);


// wwtlib.URLHelpers

export function URLHelpers() {
    // this will be "http:" or "https:"
    this._origin_protocol = typeof window === "undefined" ? "https:" : window.location.protocol;
    this._force_https = (this._origin_protocol === 'https:');

    // host name, no port number
    this._origin_domain = typeof window === "undefined" ? "" : window.location.hostname;


    this._domain_handling = {};
    this._domain_handling['worldwidetelescope.org'] = DomainHandling.wwtFlagship;
    this._domain_handling['www.worldwidetelescope.org'] = DomainHandling.wwtFlagship;
    this._domain_handling['cdn.worldwidetelescope.org'] = DomainHandling.wwtFlagship;
    this._domain_handling['content.worldwidetelescope.org'] = DomainHandling.wwtFlagship;
    this._domain_handling['beta.worldwidetelescope.org'] = DomainHandling.wwtFlagship;
    this._domain_handling['beta-cdn.worldwidetelescope.org'] = DomainHandling.wwtFlagship;
    this._domain_handling['wwtstaging.azurewebsites.net'] = DomainHandling.wwtFlagship;
    this._domain_handling['wwtfiles.blob.core.windows.net'] = DomainHandling.neverProxy;
    this._domain_handling['wwttiles.blob.core.windows.net'] = DomainHandling.neverProxy;
    this._domain_handling['web.wwtassets.org'] = DomainHandling.neverProxy;
    this._domain_handling['data1.wwtassets.org'] = DomainHandling.neverProxy;
    this._domain_handling['localhost'] = DomainHandling.localhost;
    this._domain_handling['127.0.0.1'] = DomainHandling.localhost;

    switch (this._origin_domain) {
        case 'worldwidetelescope.org':
        case 'www.worldwidetelescope.org':
        case 'cdn.worldwidetelescope.org':
            this._core_static_baseurl = this._origin_protocol + '//cdn.worldwidetelescope.org';
            this._core_dynamic_baseurl = this._origin_protocol + '//worldwidetelescope.org';
            break;
        case 'beta.worldwidetelescope.org':
        case 'beta-cdn.worldwidetelescope.org':
            this._core_static_baseurl = this._origin_protocol + '//beta-cdn.worldwidetelescope.org';
            this._core_dynamic_baseurl = this._origin_protocol + '//beta.worldwidetelescope.org';
            break;
        default:
            this._core_static_baseurl = this._origin_protocol + '//cdn.worldwidetelescope.org';
            this._core_dynamic_baseurl = this._origin_protocol + '//worldwidetelescope.org';
            break;
    }

    this._engine_asset_baseurl = this._origin_protocol + '//web.wwtassets.org/engine/assets';

    // this should be a set, but ScriptSharp had trouble with that.
    this._flagship_static_lcpaths = {};
    this._flagship_static_lcpaths['/wwtweb/2massoct.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/bingdemtile.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/bingdemtile2.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/catalog.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/catalog2.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/dem.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/dembath.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/demmars.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/demtile.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/dss.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/dsstoast.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/dusttoast.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/earthblend.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/earthmerbath.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/fixedaltitudedemtile.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/g360.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/galex4far.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/galex4near.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/galextoast.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/gettile.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/gettour.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/gettourfile.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/gettours.aspx'] = true; // maybe not?
    this._flagship_static_lcpaths['/wwtweb/glimpse.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/halphatoast.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/hirise.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/hirisedem2.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/hirisedem3.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/jupiter.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/mandel.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/mandel1.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/mars.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/marsdem.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/marshirise.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/marsmoc.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/martiantile.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/martiantile2.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/mipsgal.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/moondem.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/moonoct.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/moontoast.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/moontoastdem.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/postmars.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/postmarsdem.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/postmarsdem2.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/rasstoast.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/sdsstoast.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/sdsstoast2.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/sdsstoast2.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/thumbnail.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/tiles.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/tiles2.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/tilesthumb.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/twomasstoast.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/tychooct.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/veblend.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/vlsstoast.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/wmap.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/wmsmoon.aspx'] = true;
    this._flagship_static_lcpaths['/wwtweb/wmstoast.aspx'] = true;
}

var URLHelpers$ = {
    overrideAssetBaseurl: function (baseurl) {
        this._engine_asset_baseurl = baseurl;
    },

    rewrite: function (url, rwmode) {
        // Sadly, we can't take advantage of JS/browser URL parsing
        // because this function might be passed template URLs like
        // "http://r{S:2}.ortho.tiles.virtualearth.net/..." that won't
        // parse. So we have to split up the URL manually.
        var lc = url.toLowerCase();
        var lcproto;
        var url_no_protocol;

        if (ss.startsWith(lc, 'http://')) {
            lcproto = 'http:';
            url_no_protocol = url.substring(7);
        } else if (ss.startsWith(lc, 'https://')) {
            lcproto = 'https:';
            url_no_protocol = url.substring(8);
        } else if (ss.startsWith(lc, '//')) {
            lcproto = '';
            url_no_protocol = url.substring(2);
        } else if (ss.startsWith(lc, 'blob:')) {
            // The web client uses URL.createObjectURL() to ingest local
            // disk files into the web app. That function creates blob
            // URLs, and it turns out that we definitely don't want to
            // rewrite them!
            return url;
        } else {
            switch (rwmode) {
                case URLRewriteMode.asIfAbsolute:
                default:
                    // Treat `foo/bar` as a domain name of `foo` and a
                    // path of `/bar`. Really we should demand that the
                    // caller always pass us an absolute URL, but URLs
                    // will be coming from random data sources and we're
                    // not currently rigorous enough to guarantee that
                    // this function will get validated inputs -- and in
                    // such cases, throwing exceptions won't help.
                    lcproto = '';
                    url_no_protocol = url;
                    break;

                case URLRewriteMode.originRelative:
                    // Treat `foo/bar` as a URL relative to the window
                    // origin. Since it looks relative, any weird
                    // templating stuff in the URL text *ought* not cause
                    // problems for the browser URL parsing ...
                    url = (new URL(url, window.location.href)).toString();
                    return this.rewrite(url, 0);
            }
        }

        // If we're freestanding, we can't use the proxy and we don't want
        // to forcibly rewrite URLs to potentially point at any core WWT
        // domains, so there is nothing more to do (now that we've potentially
        // handled origin-relative URLs).
        if (freestandingMode) {
            return url;
        }

        var domain;
        var rest; // potentially "/foo/CASE/bar?q=1&b=1#fragment"
        var slash_index = url_no_protocol.indexOf('/');

        if (slash_index < 0) {
            domain = url_no_protocol;
            rest = '/';
        } else {
            domain = url_no_protocol.substring(0, slash_index);
            rest = url_no_protocol.substring(slash_index); // starts with "/"
        }

        var lcdomain = domain.toLowerCase();
        var lcpath = rest.toLowerCase().split('?')[0];

        if (!ss.keyExists(this._domain_handling, lcdomain)) {
            // Domains include nonstandard port specifications, so it's
            // possible that we could get here with a discernably
            // localhost-y domain.
            if (ss.startsWith(lcdomain, 'localhost:') || ss.startsWith(lcdomain, '127.0.0.1:')) {
                this._domain_handling[lcdomain] = DomainHandling.localhost;
            } else {
                this._domain_handling[lcdomain] = DomainHandling.tryNoProxy;
            }
        }

        var mode = this._domain_handling[lcdomain];

        switch (mode) {
            case DomainHandling.localhost:
                return url;  // can't proxy, so we'll just have to hope it works

            case DomainHandling.neverProxy:
            case DomainHandling.tryNoProxy:
            default:
                if (this._force_https && lcproto !== 'https:') {
                    // Force HTTPS and we'll see what happens. If
                    // downloading fails, we'll set a flag and use our
                    // proxy to launder the security.
                    //
                    // NOTE: it is important that we use `domain` and not
                    // `lcdomain`, even though domain names are
                    // case-insensitive, because we might be processing a
                    // template URL containing text like `{S}`, and WWT's
                    // replacements *are* case-sensitive. Yes, I did learn
                    // this the hard way.
                    return 'https://' + domain + rest;
                }
                return url;

            case DomainHandling.proxy:
                if (!lcproto) {
                    // Make sure that we give the proxy a real absolute
                    // URL. Guess http, and if the proxy is forced to
                    // upgrade, so be it.
                    url = 'http://' + url;
                }

                // We need to encode the URL as a query-string parameter
                // to pass to the proxy. However, the encoding will turn
                // "{}" into "%7B%7D", so that *if* this URL is then going
                // to be fed into the templating system,
                // search-and-replace for e.g. "{0}" will break. So we
                // un-encode those particular characters, since it ought
                // to be safe to do so anyway.
                url = ss.replaceString(ss.replaceString(encodeURIComponent(url), '%7B', '{'), '%7D', '}');
                return this._core_dynamic_baseurl + '/webserviceproxy.aspx?targeturl=' + url;

            case DomainHandling.wwtFlagship:
                // Rewrite "flagship"/core URLs to go through whatever our
                // core bases are. Assume that URLs are dynamic (=> are
                // not loaded through the CDN) unless proven otherwise.
                var is_static = false;

                if (ss.startsWith(lcpath, '/data/')) {
                    is_static = true;
                } else if (ss.keyExists(this._flagship_static_lcpaths, lcpath)) {
                    is_static = true;
                } else if (ss.startsWith(lcpath, '/content/')) {
                    is_static = true;
                } else if (ss.startsWith(lcpath, '/engine/assets/')) {
                    is_static = true;
                }

                if (is_static) {
                    return this._core_static_baseurl + rest;
                }

                return this._core_dynamic_baseurl + rest;
        }
    },

    // Call this when you have tried to load a url via XMLHttpRequest or
    // something along those lines, and the attempt has failed. We will mark the
    // domain as needing proxying, and will return a new proxy-enabled URL to try.
    // The exception is for flagship website URLs, which we know that the proxy
    // won't help with. For those, null is returned.
    activateProxy: function (url) {
        // If we're freestanding, we never proxy.
        if (freestandingMode) {
            return null;
        }

        // Get the domain. XXX copy/pastey from the above.

        var lc = url.toLowerCase();
        var url_no_protocol;

        if (ss.startsWith(lc, 'http://')) {
            url_no_protocol = url.substring(7);
        } else if (ss.startsWith(lc, 'https://')) {
            url_no_protocol = url.substring(8);
        } else if (ss.startsWith(lc, '//')) {
            url_no_protocol = url.substring(2);
        } else {
            url_no_protocol = url;
        }

        var lcdomain;
        var slash_index = url_no_protocol.indexOf('/');

        if (slash_index < 0) {
            lcdomain = url_no_protocol;
        } else {
            lcdomain = url_no_protocol.substring(0, slash_index).toLowerCase();
        }

        // Is this a flagship or never-proxy URL? If so, don't bother proxying.

        if (!ss.keyExists(this._domain_handling, lcdomain)) {
            if (ss.startsWith(lcdomain, 'localhost:') || ss.startsWith(lcdomain, '127.0.0.1:')) {
                this._domain_handling[lcdomain] = DomainHandling.localhost;
            }
            else {
                this._domain_handling[lcdomain] = DomainHandling.tryNoProxy;
            }
        }

        var mode = this._domain_handling[lcdomain];
        if (mode === DomainHandling.wwtFlagship || mode === DomainHandling.neverProxy || mode === DomainHandling.localhost) {
            return null;
        }

        // OK, we should try proxying. So:
        this._domain_handling[lcdomain] = DomainHandling.proxy;
        return this.rewrite(url, 0);
    },

    engineAssetUrl: function (subpath) {
        return ss.format('{0}/{1}', this._engine_asset_baseurl, subpath);
    },

    coreDynamicUrl: function (subpath) {
        return ss.format('{0}/{1}', this._core_dynamic_baseurl, subpath);
    },

    coreStaticUrl: function (subpath) {
        return ss.format('{0}/{1}', this._core_static_baseurl, subpath);
    }
};

registerType("URLHelpers", [URLHelpers, URLHelpers$, null]);

URLHelpers.singleton = new URLHelpers();

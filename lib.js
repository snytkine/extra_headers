var STORAGE = chrome.storage.local;
var DEFAULT_HEADER_NAME = "X-Extra-Header";
var STORAGE_KEY = "my_extra_headers";
var DOMAINS_KEY = "domains";
var HEADERS_KEY = "headers";
var BADGE_TITLE = "Extra Headers";
var REQUEST_TYPES_KEY = "types";

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
function parseUri (str) {
    var	o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

/**
 * Make string with id based
 * on current time in milliseconds
 * @return {String}
 */
var makeId = function () {
    return 'h' + (new Date()).getTime();
}


String.prototype.startsWithDot = function () {
    return "." === this.charAt(0);
}

String.prototype.stripDot = function () {
    if ("." === this.charAt(0)) {
        return this.substring(1);
    }

    return this;
}

String.prototype.endsWithDomain = function (s) {
    return this.indexOf(s, this.length - s.length) !== -1;
}


function getStoredItem() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY))
    } catch (e) {
    }
    return null
}

function persist(value, f) {
    if (!value) {
        value = ""
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    if(f && typeof f === 'function'){
        f();
    }
}

function getHostname(url) {

    var uri = parseUri(url);

    return uri['host'].toLowerCase();
}

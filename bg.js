/**
 * Created with JetBrains PhpStorm.
 * User: admin
 * Date: 2/28/13
 * Time: 8:09 PM
 * To change this template use File | Settings | File Templates.
 */

var icons, iconImg, oData = {};
oData[DOMAINS_KEY] = [];
oData[HEADERS_KEY] = [
    {hname:DEFAULT_HEADER_NAME, value:"", id:makeId()}
];
oData[REQUEST_TYPES_KEY] = ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"];

iconImg = document.createElement('img');
iconImg.src = 'ninja_ghost.png';

var addHeader = function (url, allHeaders) {
    var sent = 0, i, j, ret = [], aExtraHeaders, myIcon, hostname, aHosts, domain, mydomain = false;


    chrome.browserAction.setTitle({title:BADGE_TITLE});


    /**
     * Get stored Data
     * if not set or value is empty
     * then nothing to do - just return back allHeaders
     *
     * Check url value for domain to match one of domain
     * in setting. If no match then return back allHeaders
     *
     * if match then add our extra header name/value
     * to allHeaders and return allHeaders
     */
    aExtraHeaders = oData[HEADERS_KEY];
    aHosts = oData[DOMAINS_KEY];

    if (!aExtraHeaders || aExtraHeaders.length < 1) {
        console.log('38 NO EXTRA HEADERS');
        return allHeaders;
    }

    hostname = getHostname(url);
    console.log('hostname: ' + hostname);
    console.log('aHosts count: ' + aHosts.length);
    console.log('extra headers count: ' + aExtraHeaders.length);


    if (aHosts.length > 0) {
        for (j = 0; j < aHosts.length; j += 1) {
            domain = aHosts[j];
            if (domain.startsWithDot()) {
                if (hostname.endsWithDomain(domain) || domain.stripDot() === hostname) {
                    mydomain = true;
                    break;
                }
            } else {
                if (hostname === domain) {
                    mydomain = true;
                    break;
                }
            }
        }
    }

    console.log('mydomain: ' + mydomain);
    if (!mydomain) {

        return allHeaders;
    }

    ret = allHeaders.slice();

    for (i = 0; i < aExtraHeaders.length; i += 1) {
        if (aExtraHeaders[i].value) {
            ret.push({name:aExtraHeaders[i].hname, value:aExtraHeaders[i].value});
            sent += 1;
        }
    }

    if (sent > 0) {
        console.log(sent + " Extra Header" + ((sent > 1) ? 's' : ''));
        myIcon = IconCreator.paintIcon(iconImg, '#0000FF');
        console.log('myIcon: ' + myIcon);
        chrome.browserAction.setIcon({imageData:myIcon});
        chrome.browserAction.setTitle({title:sent + " Extra Header" + ((sent > 1) ? 's' : '')});
    }

    return ret;
}

var initpgpage = function (reload) {
    var temp = getStoredItem();
    if (temp && temp[HEADERS_KEY]) {
        oData = temp;
        console.log('initialized oData: ' + oData[HEADERS_KEY].length);
        if(!oData.hasOwnProperty(REQUEST_TYPES_KEY)){
            oData[REQUEST_TYPES_KEY] = ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"];
        }
    } else {
        console.log('oData not in storage');
    }


    var requestListener = function (details) {
        return{requestHeaders:addHeader(details.url, details.requestHeaders)}
    };

    chrome.tabs.onActivated.addListener(function (o) {
        chrome.browserAction.setTitle({title:BADGE_TITLE})
        chrome.browserAction.setIcon({path:'ninja_ghost.png'});
    });
    if (reload) {
        chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);
    }
    chrome.webRequest.onBeforeSendHeaders.addListener(requestListener, {urls:["<all_urls>"], types:oData[REQUEST_TYPES_KEY]}, ["requestHeaders", "blocking"]);
}

initpgpage();

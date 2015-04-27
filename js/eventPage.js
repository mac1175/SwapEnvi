/**
 * Created by mitch on 4/25/2015.
 */

if (!chrome.runtime) {
    // Chrome 20-21
    chrome.runtime = chrome.extension;
} else if (!chrome.runtime.onMessage) {
    // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
}

function changeTabUrlByDomain(tab, domain) {
    var url = new URL(tab.url);
    url.host = domain.url.host;
    url.protocol = domain.url.protocol;
    //if (domain2.url.port != "")
    //    url.port = domain2.url.port;
    chrome.tabs.update(tab.id, {url: url.href});
};
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request);
        chrome.contextMenus.removeAll(function () {
            var domains = _.sortBy(request.domains, "label");
            /*var root = chrome.contextMenus.create({
             title: 'Envi Options', "contexts": ['page']
             });*/

            _.forEach(domains, function (domain) {
                var targetUrl = domain.matchByHostOnly ? '*' + domain.url.host + '*' : domain.url.origin + '/*';
                var parent = chrome.contextMenus.create({
                    title: domain.label + '[' + domain.url.origin + ']',
                    documentUrlPatterns: [targetUrl],
                    "contexts": ['page']//,
                    //parentId: root
                });
                var otherDomains = _.reject(domains, {label: domain.label}),
                    otherUrls = _.map(_.pluck(otherDomains, 'url.origin'), function (u) {
                        return u + '/*';
                    });
                _.forEach(otherDomains, function (domain2) {
                    chrome.contextMenus.create({
                        title: 'Change to ' + domain2.label + '[' + domain2.url.origin + ']',
                        "contexts": ['page'],
                        "parentId": parent,
                        onclick: function () {
                            chrome.tabs.query({url: targetUrl}, function (tabs) {
                                _.forEach(tabs, function (tab) {
                                    changeTabUrlByDomain(tab, domain2);
                                });
                            });
                        }
                    });

                });
                console.log('otherUrls',otherUrls)
                chrome.contextMenus.create({
                    title: 'Change ALL other environments to this one. ',
                    "contexts": ['page'],
                    "parentId": parent,
                    onclick: function () {
                        chrome.tabs.query({url: otherUrls}, function (tabs) {
                            _.forEach(tabs, function (tab) {
                                changeTabUrlByDomain(tab, domain);
                            });
                        });

                    }
                });
                chrome.contextMenus.create({
                    title: 'Open ALL other environments using their host. ',
                    "contexts": ['page'],
                    "parentId": parent,
                    onclick: function () {
                        chrome.tabs.getCurrent(function (tab) {
                            chrome.tabs.duplicate(tab.id, function (dupeTab) {
                                _.forEach(otherDomains, function (dd) {
                                    changeTabUrlByDomain(dupeTab, dd);
                                });
                            });
                        });
                    }
                });
            });
        });
    });
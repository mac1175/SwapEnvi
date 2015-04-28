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

function changeTabUrlByDomain(tab, domain, keepPath) {
    var url = new URL(tab.url);
    url.host = domain.url.host;
    url.protocol = domain.url.protocol;
    //if (domain2.url.port != "")
    //    url.port = domain2.url.port;
    var href= keepPath ? url.href : url.origin;
    chrome.tabs.update(tab.id, {url: href });
};
chrome.tabs.onActivated.addListener(function () {
    chrome.storage.sync.get('savedDomains', function (data) {
        var error = chrome.runtime.lastError;
        if (error) {
            console.log(error.message);

        } else {
            var domains = data.savedDomains;
            console.log('saved:', domains);
            loadDomains(domains);
        }
    });
});
function loadDomains(d) {
    var domains = _.sortBy(d, "label");
    chrome.contextMenus.removeAll(function () {


        _.forEach(domains, function (domain) {
            var targetUrl = domain.url.origin + '/*';

            var otherDomains = _.reject(domains, {label: domain.label}),
                otherUrls = _.map(_.pluck(otherDomains, 'url.origin'), function (u) {
                    return u + '/*';
                });

            _.forEach(otherDomains, function (domain2) {
                console.log("domain2", domain2);
                console.log("targetUrl", targetUrl);
                var root = chrome.contextMenus.create({
                    title: 'Go to \''+domain2.label + '\' ...',
                    documentUrlPatterns: [targetUrl],
                    "contexts": ['all']
                });
                chrome.contextMenus.create({
                    title: 'With current path',
                    documentUrlPatterns: [targetUrl],
                    parentId: root,
                    "contexts": ['all'],
                    onclick: function () {
                        //asume documentUrlPatterns worked, we don't need targetUrl
                        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                            _.forEach(tabs, function (tab) {
                                changeTabUrlByDomain(tab, domain2,true);
                            });
                        });
                    }
                });
                chrome.contextMenus.create({
                    title: 'Without current path',
                    documentUrlPatterns: [targetUrl],
                    "contexts": ['all'],
                    parentId: root,
                    onclick: function () {
                        //asume documentUrlPatterns worked, we don't need targetUrl
                        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                            _.forEach(tabs, function (tab) {
                                changeTabUrlByDomain(tab, domain2);
                            });
                        });
                    }
                });
            });
            chrome.contextMenus.create({
                title: 'Change ALL other tabs with the other selected hosts to use this one.',
                documentUrlPatterns: [targetUrl],
                "contexts": ['all'],
                onclick: function () {
                    chrome.tabs.query({url: otherUrls}, function (tabs) {
                        _.forEach(tabs, function (tab) {
                            changeTabUrlByDomain(tab, domain,true);
                        });
                    });
                }
            });
            chrome.contextMenus.create({
                title: 'Open ALL other environments using their host. ',
                documentUrlPatterns: [targetUrl],
                "contexts": ['all'],
                onclick: function () {
                    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                        var tab = tabs[0];
                        if (tab) {
                            _.forEach(otherDomains, function (domain2) {
                                chrome.tabs.duplicate(tab.id, function (dupeTab) {
                                    changeTabUrlByDomain(dupeTab, domain2,true);
                                });
                            });
                        }
                    });
                }
            });

        });
    });
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request);

    });

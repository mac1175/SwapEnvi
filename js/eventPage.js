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


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request);
        chrome.contextMenus.removeAll(function () {
            var domains = _.sortBy(request.domains, "label");
            var root = chrome.contextMenus.create({
                title: 'Envi Options', "contexts": ['page']
            });
            _.forEach(domains, function (domain) {
                var parent = chrome.contextMenus.create({
                    title: domain.label,
                    "contexts": ['page'],
                    parentId: root
                });

                _.forEach(domains, function (domain2) {
                    if (domain2.label != domain.label) {
                        chrome.contextMenus.create({
                            title: 'Change to ' + domain2.label + '['+domain2.url.origin+']',
                            "contexts": ['page'],
                            "parentId": parent,
                            onclick: function () {
                                chrome.tabs.query({url: domain.url.origin + '/*'}, function (tabs) {
                                    _.forEach(tabs, function (tab) {
                                        var url = new URL(tab.url);
                                        url.host = domain2.url.host;
                                        url.protocol = domain2.url.protocol;
                                        //if (domain2.url.port != "")
                                        //    url.port = domain2.url.port;
                                        chrome.tabs.update(tab.id, {url: url.href});
                                    });
                                });
                            }
                        });
                    }
                });
                chrome.contextMenus.create({
                    title: 'Change ALL other environments to ths one. ',
                    "contexts": ['page'],
                    "parentId": parent,
                    onclick: function () {

                    }
                });
            });
        });
    });

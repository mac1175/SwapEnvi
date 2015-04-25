window.app = angular.module('envi', []);

/**
 * Created by mitch on 4/24/2015.
 */

window.app
    .controller('domainManagerCtrl', ['$scope', function ($scope) {
        var self = this;
        self.domains = [];
        self.tabs = [];
        self.checkTabs = function () {
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                self.tabs = tabs;
                //console.log(self.tabs);
                $scope.$digest();
            });
        };
        self.addDomain = function () {
            self.domains.push({url: self.newUrl, label: self.newLabel});
            self.saveDomains();
            $scope.$digest();
        };
        self.clearDomains = function () {
            self.domains = [];
        };
        self.saveDomains = function () {
            chrome.storage.sync.set({'savedDomains': {domains: self.domains || []}}, function () {
                console.log('saved:', arguments);
            });
        };
        chrome.tabs.onRemoved.addListener(self.checkTabs);
        chrome.tabs.onCreated.addListener(self.checkTabs);
        chrome.storage.sync.get('savedDomains', function (data) {
            console.log(arguments);
            self.domains = data['savedDomains'] || [];
        });

        return self;


    }]);




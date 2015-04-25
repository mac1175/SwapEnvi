window.app = angular.module('envi', []);

/**
 * Created by mitch on 4/24/2015.
 */

window.app
    .directive('optionsClass', function ($parse) {
        return {
            require: 'select',
            link: function(scope, elem, attrs, ngSelect) {
                // get the source for the items array that populates the select.
                var optionsSourceStr = attrs.ngOptions.split(' ').pop(),
                // use $parse to get a function from the options-class attribute
                // that you can use to evaluate later.
                    getOptionsClass = $parse(attrs.optionsClass);

                scope.$watch(optionsSourceStr, function(items) {
                    // when the options source changes loop through its items.
                    angular.forEach(items, function(item, index) {
                        // evaluate against the item to get a mapping object for
                        // for your classes.
                        var classes = getOptionsClass(item),
                        // also get the option you're going to need. This can be found
                        // by looking for the option with the appropriate index in the
                        // value attribute.
                            option = elem.find('option[value=' + index + ']');

                        // now loop through the key/value pairs in the mapping object
                        // and apply the classes that evaluated to be truthy.
                        angular.forEach(classes, function(add, className) {
                            if(add) {
                                angular.element(option).addClass(className);
                            }
                        });
                    });
                });
            }
        };
    })
    .controller('domainManagerCtrl', ['$scope', function ($scope) {
        var self = this;
        self.domains = [];
        self.labels=['default', 'primary', 'success', 'info', 'warning', 'danger'];
        self.newLabelStyle ='default';
        self.domainMatrix = [];
        $scope.$watch(function () {
            return self.newUrl;
        }, function () {
            self.dupeError = _.some(self.domains, {url: self.newUrl}) ? 'This url already exists!' : '';
        });

        self.tabs = [];
        self.checkTabs = function () {
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                self.tabs = tabs;
                console.log(self.tabs);
                $scope.$digest();
            });
        };
        self.addDomain = function () {
            if (!_.some(self.domains, {url: self.newUrl}) && self.newUrl && self.newLabel) {
                self.domains.push({url: self.newUrl, label: self.newLabel,style: self.newLabelStyle});
                self.newUrl='';
                self.newLabel='';
                self.newLabelStyle ='default';

                self.saveDomains();
            }
        };
        self.clearDomains = function () {
            self.domains = [];
        };

        self.remove=function(domain){
            self.domains = _.reject(self.domains,domain);
        };
        self.saveDomains = function () {
            chrome.storage.sync.set({'savedDomains': {domains: self.domains || []}}, function () {
                console.log('saved:', arguments);
            });
        };

        self.swapAllTabsToSelectedLabel = function () {

        };
        chrome.tabs.onRemoved.addListener(self.checkTabs);
        chrome.tabs.onCreated.addListener(self.checkTabs);
        chrome.storage.sync.get('savedDomains', function (data) {
            console.log(arguments);
            if (data.savedDomains && data.savedDomains.domains) {
                //self.domains = data.savedDomains.domains || [];
            }
        });

        return self;


    }]);




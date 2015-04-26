window.app = angular.module('envi', []);

/**
 * Created by mitch on 4/24/2015.
 */

window.app
    .directive('optionsClass', function ($parse) {
        return {
            require: 'select',
            link: function (scope, elem, attrs, ngSelect) {
                // get the source for the items array that populates the select.
                var optionsSourceStr = attrs.ngOptions.split(' ').pop(),
                // use $parse to get a function from the options-class attribute
                // that you can use to evaluate later.
                    getOptionsClass = $parse(attrs.optionsClass);

                scope.$watch(optionsSourceStr, function (items) {
                    // when the options source changes loop through its items.
                    angular.forEach(items, function (item, index) {
                        // evaluate against the item to get a mapping object for
                        // for your classes.
                        var classes = getOptionsClass(item),
                        // also get the option you're going to need. This can be found
                        // by looking for the option with the appropriate index in the
                        // value attribute.
                            option = elem.find('option[value=' + index + ']');

                        // now loop through the key/value pairs in the mapping object
                        // and apply the classes that evaluated to be truthy.
                        angular.forEach(classes, function (add, className) {
                            if (add) {
                                angular.element(option).addClass(className);
                            }
                        });
                    });
                });
            }
        };
    })
    .service('domainSvc', [function () {
        var _domains = [];
        return {

            getDomains: function () {
                return _domains;
            },
            exists: function (domain) {
                return _.some(_domains, domain);
            },
            validateUrl: function (url) {
                var error = '';
                try {
                    new URL(url);
                    error = _.some(_domains, {url: url}) ? 'This url already exists!' : '';
                } catch (e) {
                    error = e.message;
                }
                return error;
            },
            empty: function () {
                _domains = [];
            },
            add: function (domain) {
                _domains.push(domain);
                chrome.runtime.sendMessage({"domains": _domains});
            },
            remove: function (domain) {
                _domains = _.reject(_domains, domain);

                chrome.runtime.sendMessage({"domains": _domains});
            },
            loadDomainsFromStorage: function () {
                chrome.storage.sync.get('savedDomains', function (data) {
                    console.log(arguments);
                    if (data.savedDomains && data.savedDomains.domains) {
                        _domains = data.savedDomains.domains || [];
                    }
                });

            },
            saveDomains: function () {
                /*
                 chrome.storage.sync.set({'savedDomains': {domains: self.domains || []}}, function () {
                 console.log('saved:', arguments);
                 });
                 */

            }
        };
    }
    ])
    .controller('domainManagerCtrl', ['$scope', 'domainSvc', function ($scope, domainSvc) {
        var self = this;
        self.domains = domainSvc.domains || [];
        self.labels = ['default', 'primary', 'success', 'info', 'warning', 'danger'];
        self.newLabelStyle = 'default';
        self.domainMatrix = [];
        self.newUrl = 'http://example.com';
        $scope.$watch(function () {
            return self.newUrl;
        }, function () {
            if (self.newUrl) {
                self.Error = domainSvc.validateUrl(self.newUrl);
            }
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
            if (!domainSvc.exists({url: self.newUrl}) && self.newUrl && self.newLabel) {
                domainSvc.add({url: new URL(self.newUrl), label: self.newLabel, style: self.newLabelStyle});
                self.newUrl = '';
                self.newLabel = '';
                self.newLabelStyle = 'default';
                self.domains = domainSvc.getDomains();

                domainSvc.saveDomains();
            }
        };


        self.remove = function (domain) {
            domainSvc.remove(domain);
            self.domains = domainSvc.getDomains();
        };


        chrome.tabs.onRemoved.addListener(self.checkTabs);
        chrome.tabs.onCreated.addListener(self.checkTabs);

        return self;


    }]);




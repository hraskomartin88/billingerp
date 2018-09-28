'use strict';

// Declare app level module which depends on filters, and services

angular.module('billingErp', [
  'billingErp.controllers',
  'billingErp.filters',
  'billingErp.services',
  'billingErp.directives',
  'smart-table',
  'ngRoute',
  'angular-loading-bar',
  'flow',
  'ui.bootstrap',
  'angular.filter',
  'nvd3',
  'AngularPrint'
]).
config(function ($routeProvider, $locationProvider, cfpLoadingBarProvider) {
    $routeProvider.
    /*when('/view1', {
      templateUrl: 'partials/partial1',
      controller: 'MyCtrl1'
    }).*/
    when('/customers/', {
        templateUrl: 'partials/custview1',
        controller: 'CustCtrl'
    }).
    when('/invoices/', {
        templateUrl: 'partials/invview1',
        controller: 'InvCtrl'
    }).
    when('/custreference/:id/', {
        templateUrl: 'partials/custview2',
        controller: 'CustRefCtrl'
    }).
    when('/custprice/:id/', {
        templateUrl: 'partials/custprice',
        controller: 'CustPriceCtrl'
    }).
    when('/invoices/unid/:invno/', {
        templateUrl: 'partials/invviewunid',
        controller: 'InvCtrlUnid'
    }).
    when('/invoices/iden/:invno/', {
        templateUrl: 'partials/invviewiden',
        controller: 'InvCtrlIden'
    }).
    when('/invoices/unidsur/:invno/', {
        templateUrl: 'partials/invviewunidsur',
        controller: 'InvCtrlUnidSur'
    }).
    when('/invoices/idensur/:invno/', {
        templateUrl: 'partials/invviewidensur',
        controller: 'InvCtrlIdenSur'
    }).
    when('/maninvoices/shipments/:id', {
        templateUrl: 'partials/maninvshpmnt',
        controller: 'ManInvShpmntCtrl'
    }).
    when('/maninvoices/surcharges/:id', {
        templateUrl: 'partials/maninvsrchg',
        controller: 'ManInvSrchgCtrl'
    }).
    when('/upload/', {
        templateUrl: 'partials/upload',
        controller: 'UploadCtrl'
    }).
    when('/download/', {
        templateUrl: 'partials/download',
        controller: 'DownloadCtrl'
    }).
    when('/settings/', {
        templateUrl: 'partials/settings',
        controller: 'SettingsCtrl'
    }).
    when('/addmanually', {
        templateUrl: 'partials/addmanually',
        controller: 'ManuallyCtrl'
    }).
    when('/statistics', {
        templateUrl: 'partials/statistics',
        controller: 'StatisticsCtrl'
    }).
    when('/todo/', {
        templateUrl: 'partials/todo',
        controller: 'TodoListCtrl'
    }).
    when('/billed/', {
        templateUrl: 'partials/billed',
        controller: 'BilledCtrl'
    }).
    when('/profit/', {
        templateUrl: 'partials/profit',
        controller: 'profitCtrl'
    }).
    otherwise({
        redirectTo: '/'
    });


    $locationProvider.html5Mode(true);
    cfpLoadingBarProvider.includeSpinner = false;
}).
config(['flowFactoryProvider', function (flowFactoryProvider) {
    flowFactoryProvider.defaults = {
        target: '/api/upload',
        permanentErrors: [404, 500, 501],
        successStatuses: [200, 201, 202],
        chunkSize: 1024 * 1024 * 1024,
        progressCallbacksInterval: 1000,
        maxChunkRetries: 1,
        chunkRetryInterval: 5000,
        simultaenousUploads: 1,
        singleFile: false,
        testChunks: false
    };
    flowFactoryProvider.on('catchAll', function (event) {
        //console.log('catchAll', arguments);
    });
}]).
config(['$provide', function ($provide) {
    $provide.decorator('$locale', ['$delegate', function ($delegate) {
        if ($delegate.id == 'en-us') {
            $delegate.NUMBER_FORMATS.PATTERNS[1].negPre = '-\u00A4';
            $delegate.NUMBER_FORMATS.PATTERNS[1].negSuf = '';
        }
        return $delegate;
  }]);
}]);

'use strict';

// Declare app level module which depends on filters, and services
var cloudscalers = angular.module('cloudscalers', [
  'cloudscalers.services',
  'cloudscalers.controllers',
  'ngRoute',
  'angular-szn-autocomplete',
  'ui.bootstrap'
]);

cloudscalers
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/decks', {
      templateUrl: 'Portal/Decks/Decks.html',
      title: 'Decks'
    });
    $routeProvider.when('/list', {
      templateUrl: 'shared/list.html',
      controller: 'MachineController',
      title: 'List'
    });
    $routeProvider.when('/new', {
      templateUrl: 'Portal/Decks/MachineDeck/pages/new.html',
      title: 'New'
    });
    $routeProvider.when('/edit/:machineId/:activeTab?', {
      templateUrl: 'shared/details.html',
      controller: 'MachineEditController',
      title: 'MachineDeck'
    });
    $routeProvider.when('/CloudSpaceSettings', {
      templateUrl: 'Portal/Admin/CloudSpaceSettings/CloudSpaceSettings.html',
      controller: 'CloudSpaceManagementController',
      title: 'CloudSpaceSettings'
    });
    $routeProvider.when('/AccountSettings', {
      templateUrl: 'Portal/Admin/AccountSettings/AccountSettings.html',
      controller: 'AccountSettingsController',
      title: 'AccountSettings'
    });
    $routeProvider.when('/GettingStarted', {
      templateUrl: 'Portal/Support/getting-started/getting-started.html',
      title: 'GettingStarted'
    });
    $routeProvider.when('/ApiDocs', {
      templateUrl: 'Portal/Support/ApiDocs/ApiDocs.html',
      title: 'ApiDocs'
    });
    $routeProvider.when('/Support', {
      templateUrl: 'Portal/Support/Support.html',
      title: 'Support'
    });
    $routeProvider.when('/MachineDeck', {
      templateUrl: 'shared/list.html',
      controller: 'MachineController',
      title: 'MachineDeck'
    });
    $routeProvider.when('/Portforwarding', {
      templateUrl: 'Portal/Decks/NetworkDeck/Portforwarding.html',
      controller: 'PortforwardingController',
      title: 'Portforwarding'
    });
    $routeProvider.when('/NetworkDeck', {
      templateUrl: 'Portal/Decks/NetworkDeck/NetworkDeck.html',
      controller: 'NetworkController',
      title: 'NetworkDeck'
    });
    $routeProvider.when('/Consumption', {
      templateUrl: 'Portal/Admin/Consumption/Consumption.html',
      controller: 'AccountController',
      title: 'Consumption'
    });
    $routeProvider.when('/Billing', {
      templateUrl: 'Portal/Admin/AccountSettings/Billing.html',
      controller: 'BillingController',
      title: 'Billing'
    });
    $routeProvider.when('/Profile', {
      templateUrl: 'Portal/Admin/Profile/Profile.html',
      controller: 'UsersController',
      title: 'Profile'
    });
    $routeProvider.when('/ResetPassword', {
      templateUrl: 'Public/Authentication/Login/ResetPassword.html',
      controller: 'ResetPasswordController',
      title: 'ResetPassword'
    });
    $routeProvider.when('/Activation', {
      templateUrl: 'Activation.html',
      controller: 'ActivateUserController',
      title: 'Activation'
    });
    // Docs
    $routeProvider.when('/Docs', {
      templateUrl: 'Portal/Docs/Docs.html',
      title: 'Docs'
    });
    $routeProvider.when('/Docs/access-your-cloud-space-using-openvpn', {
      templateUrl: 'Portal/Docs/TechnicalTutorials/access-your-cloud-space-using-openvpn.html',
      title: 'Access your Cloud Space using OpenVPN'
    });
    $routeProvider.when('/Docs/enable-root-access-on-ubuntu-over-ssh', {
      templateUrl: 'Portal/Docs/TechnicalTutorials/enable-root-access-on-ubuntu-over-ssh.html',
      title: 'Enable Root Access on ubuntu over SSH'
    });
    $routeProvider.when('/Docs/getting-started-with-jumpscale', {
      templateUrl: 'Portal/Docs/TechnicalTutorials/getting-started-with-jumpscale.html',
      title: 'Getting Started with JumpScale'
    });
    $routeProvider.when('/Docs/how-to-configure-ubuntu-to-connect-to-openvpn', {
      templateUrl: 'Portal/Docs/TechnicalTutorials/how-to-configure-ubuntu-to-connect-to-openvpn/tutorial.html',
      title: 'How to configure Ubuntu to connect to OpenVPN'
    });
    $routeProvider.when('/Docs/my-first-machine-linux', {
      templateUrl: 'Portal/Docs/TechnicalTutorials/my-first-machine-linux/tutorial.html',
      title: 'My First Machine Linux'
    });
    $routeProvider.when('/Docs/my-first-machine-windows', {
      templateUrl: 'Portal/Docs/TechnicalTutorials/my-first-machine-windows/tutorial.html',
      title: 'My First Machine Windows'
    });
    $routeProvider.when('/Docs/pptp-connection-to-space-from-windows10', {
      templateUrl: 'Portal/Docs/TechnicalTutorials/pptp-connection-to-space-from-windows10/tutorial.html',
      title: 'Setup a PPTP connection to Space from Windows10'
    });

    $routeProvider.otherwise({redirectTo: '/decks'});
  }])
  .config(['$interpolateProvider','$compileProvider', function($interpolateProvider, $compileProvider) {
    // Angular uses {{}} for data-binding. This operator will conflict with JumpScale macro syntax.
    // Use {[]} instead.
    $interpolateProvider.startSymbol('{[').endSymbol(']}');
    //Accept bitcoin and litecoin urls
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|bitcoin|litecoin):/);
  }]);

angular.module('cloudscalers.services', ['ng'])
  .config(['$httpProvider',function($httpProvider) {
    $httpProvider.interceptors.push('authenticationInterceptor');
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
    $httpProvider.defaults.headers.post['Accept'] = 'application/json';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
  }]);

var cloudscalersControllers = angular.module('cloudscalers.controllers', [
  'ui.slider',
  'cloudscalers.services',
  'cloudscalers.directives',
  'angular-tour',
  'ipCookie'
]);

if (cloudspaceconfig.apibaseurl === '') {
  cloudscalersControllers.config(function($provide) {
    $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
  });
  cloudscalersControllers.run(defineApiStub);
}

// So we can inject our own functions instead of the builtin functions
cloudscalers.value('confirm', window.confirm);
cloudscalers.factory('$alert', function($modal) {
  return function(message) {
    var ModalInstanceCtrl = function($scope, $modalInstance) {
      $scope.message = message.replace('\n', '<br>');
      $scope.ok = function() {
        $modalInstance.close();
      };
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    };

    $modal.open({
      templateUrl: 'myModalContent.html',
      controller: ModalInstanceCtrl,
      resolve: {}
    });
  };
});
cloudscalers.factory('$ErrorResponseAlert', function($alert) {
  return function(reason) {
    if (reason.status === 500 || reason.status === 502 || reason.status === 504 || reason.data === null) {
      $alert('An unexpected error has occurred');
    } else if (reason.status === 401) {
      $alert('Please login to access full functionality');
    } else {
      var message = '';
      try {
        message = JSON.parse(reason.data);
        if (typeof message !== 'string') {
          message = reason.data;
        }
      } catch (e) {
        message = reason.data;
        //data is not JSON
      }
      $alert(message);
    }
  };
});

cloudscalers.run(function($templateCache, $rootScope) {
  $templateCache.put('autocomplete-result-template.html',
        '<ul ng-show="show" class="szn-autocomplete-results"> ' +
          '<li ' +
              'szn-autocomplete-result ' +
              'ng-repeat="result in results" ' +
              'ng-class="{selected: highlightIndex === $index}" ' +
              'ng-show="results.length"> ' +
              '<div class="text-left"> ' +
                  '<img class="gravatar" ng-show="result.gravatarurl" ng-src="{[result.gravatarurl]}" /> ' +
                  '<span ng-show="!result.validEmail" ' +
                  'view-as-html="result.value | sznAutocompleteBoldMatch:query"></span> ' +
                  '<span ng-show="result.validEmail">Invite: <strong>{[result.value]}</strong></span> ' +
              '</div> ' +
          '</li> ' +
      '</ul>'
  );
  $rootScope.$on('$routeChangeSuccess', function(event, currentRoute) {
    $rootScope.title = currentRoute.title;
  });
});

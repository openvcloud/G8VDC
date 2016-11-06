(function() {
  'use strict';
  //jshint latedef: nofunc
  angular
    .module('cloudscalers.controllers')
    .controller('CloudSpaceNavigatorController', CloudSpaceNavigatorController)
    .filter('nospace', nospace);

  function CloudSpaceNavigatorController($scope, $modal, LocationsService, CloudSpace, Account,
    LoadingDialog, $timeout, $ErrorResponseAlert, $window) {
    $scope.isCollapsed = true;
    $scope.locations = {};
    $scope.noAccount = false;
    $scope.AccountCloudSpaceHierarchy = undefined;
    $scope.createNewCloudSpace = createNewCloudSpace;
    $scope.goToAccountSettings = goToAccountSettings;
    // Binding and Watch
    $scope.$watch('cloudspaces + accounts', cloudspacesAndAccounts);

    // Initialization: Functions invokation logic
    listLocationsAndAccounts();

    // Functions
    function listLocationsAndAccounts() {
      if ($scope.currentUser === undefined) {
        return; // we are not logged in skip listing accounts
      }
      LocationsService.list().then(function(locations) {
        $scope.locations = locations;
      });
      Account.list().then(function(accounts) {
        $scope.accounts = accounts;
      });
    }

    $scope.fixDropdown = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      var anchor = $($event.currentTarget);
      $(anchor.attr('href')).toggleClass('collapse');
      $(anchor.attr('href')).toggleClass('open');
      anchor.parents('.panel-group').find('.panel-heading.open')
        .not(anchor.parents('.panel-heading')).removeClass('open');
      anchor.parents('.panel-heading').toggleClass('open');
    };

    function buildAccountCloudSpaceHierarchy() {
      var cloudspacesGroups = _.groupBy($scope.cloudspaces, 'accountId');
      var accountCloudSpaceHierarchy = [];
      for (var accountId in cloudspacesGroups) {
        var firstCloudSpace = cloudspacesGroups[accountId][0];
        var account = {
          id: accountId,
          name: firstCloudSpace['accountName'],
          DCLocation: firstCloudSpace['accountDCLocation']
        };
        if ('accountAcl' in firstCloudSpace) {
          account.acl = firstCloudSpace['accountAcl'];
        }
        if ($scope.accounts) {
          var currentAccountInAccountList = _.find($scope.accounts, (function(currentAccount) {
            return function(accountInList) {
              return accountInList.id === currentAccount.id;
            };
          }(account)));
          account.currentAccountInAccountList = '';
          if (!currentAccountInAccountList) {
            account.currentAccountInAccountList = 'NoAccessOnAccount';
          }
        }
        account.cloudspaces = cloudspacesGroups[accountId];
        accountCloudSpaceHierarchy.push(account);
      }
      // for (var idx in $scope.accounts) {
      //     var account = $scope.accounts[idx];
      //     var accountfound = false;
      //     for (var accountidx in accountCloudSpaceHierarchy) {
      //         var hierarchyaccount = accountCloudSpaceHierarchy[accountidx];
      //         if (hierarchyaccount.id === account.id) {
      //             accountfound = true;
      //             break;
      //         }
      //     }
      //     if (!accountfound) {
      //         var hierarchyaccount = {
      //           id: account.id,
      //           name: account.name,
      //           cloudspaces: [],
      //           acl: account.acl,
      //         };
      //         accountCloudSpaceHierarchy.push(hierarchyaccount);
      //     }
      // }
      $scope.noAccount = accountCloudSpaceHierarchy.length === 0;
      $scope.AccountCloudSpaceHierarchy = accountCloudSpaceHierarchy;
    }
    function cloudspacesAndAccounts() {
      if ($scope.currentUser === undefined) {
        return; // skip when not logged in
      }
      buildAccountCloudSpaceHierarchy();
    }
    function CreateCloudSpaceController($scope, $modalInstance) {
      var selectedAccount = _.find($scope.accounts, function(account1) {
        return account1.id === $scope.currentAccount.id;
      });
      if (selectedAccount === null) {
        selectedAccount = $scope.accounts[0];
      }
      $scope.newCloudSpace = {
        name: '',
        account: selectedAccount
      };
      $scope.submit = function() {
        $modalInstance.close({
          name: $scope.newCloudSpace.name,
          accountId: $scope.newCloudSpace.account.id,
          selectedLocation: $scope.selectedLocation
        });
      };
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.selectedLocation = $scope.locations[0].locationCode;

      $scope.changeLocation = function(location) {
        $scope.selectedLocation = location.locationCode;
      };
    }
    function createNewCloudSpace() {
      var modalInstance = $modal.open({
        templateUrl: 'createNewCloudSpaceDialog.html',
        controller: CreateCloudSpaceController,
        resolve: {},
        scope: $scope,
        backdrop: 'static'
      });

      modalInstance.result.then(function(space) {
        LoadingDialog.show('Creating cloudspace');
        CloudSpace.create(space.name, space.accountId, $scope.currentUser.username, space.selectedLocation)
        .then(function(cloudspaceId) {
          //Wait a second, consistency on the api is not garanteed before that
          $timeout(function() {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
              $window.location.reload();
            }
            $scope.setCurrentCloudspace({name: space.name, id: cloudspaceId, accountId: space.accountId});
            $scope.loadSpaces();
            LoadingDialog.hide();
          }, 1000);
        },
        function(reason) {
          LoadingDialog.hide();
          $ErrorResponseAlert(reason);
        });
      });
    }
    function goToAccountSettings(e, currentAccountId) {
      $scope.setCurrentCloudspace(
        _.findWhere($scope.AccountCloudSpaceHierarchy, {id: currentAccountId}).cloudspaces[0]
      );
      $scope.setCurrentAccount(currentAccountId);
      // e.stopPropagation();
      if ($('.dropdown-accordion').hasClass('open')) {
        $('.dropdown-accordion').removeClass('open');
      }
      $timeout(function() {
        $window.location.assign('#/AccountSettings');
      }, 1);
    }
  }

  function nospace() {
    return function(value) {
      return (!value) ? '' : value.replace(/[\s\.]/g, '');
    };
  }
})();

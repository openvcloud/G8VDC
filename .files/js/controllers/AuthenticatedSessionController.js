(function() {
  'use strict';
  //jshint latedef: nofunc
  angular
    .module('cloudscalers.controllers')
    .controller('AuthenticatedSessionController', AuthenticatedSessionController);

  function AuthenticatedSessionController($scope, User, Account, CloudSpace, LoadingDialog,
    $route, $window, $timeout, $location, ipCookie, $ErrorResponseAlert) {

    $scope.setCurrentCloudspace = setCurrentCloudspace;
    $scope.checkDisabledAccount = checkDisabledAccount;
    $scope.setCurrentAccount = setCurrentAccount;
    $scope.loadSpaces = loadSpaces;
    $scope.invalidAccount = invalidAccount;
    $scope.getUserAccessOnAccount = getUserAccessOnAccount;
    $scope.logout = logout;
    $scope.noAccount = false;
    $scope.$on('$routeChangeStart', function() {
      $scope.isDocs = $location.path().search('/Docs') !== -1 ? 'True' : 'False';
    });

    var portalSessionCookie = ipCookie('beaker.session.id');
    var vdccontrol = JSON.parse(localStorage.getItem('vdccontrol'));
    var jwt = vdccontrol.json_web_token;
    var vdc_id = vdccontrol.vdc_id;

    // Binding and Watch
    $scope.$watch('cloudspaces', cloudspaces, true);
    $scope.$watch('currentAccount.id + currentAccount.userRightsOnAccount', CurrentAccountIdAndUserRights);
    $scope.$watch('currentSpace', currentSpace);

    // Initialization: Functions invokation logic
    checkUserAccountAccessibility();

    // Functions
    function checkUserAccountAccessibility() {
      if (portalSessionCookie || jwt) {
        if (!User.current() || User.current().api_key !== portalSessionCookie) {
          User.getPortalLoggedinUser().then(function(username) {
            if (username !== 'guest') {
              autoLogin(username);
            }
            $scope.loadSpaces();
          }, function(reason) {
            $scope.loginError = reason.status;
          });

        }else {
          autoLogin(User.current().username);
          $scope.loadSpaces();
        }
      }
    }

    function setInitialAccount() {
      if ($scope.currentSpace) {
        $scope.currentAccount = {
          id: $scope.currentSpace.accountId,
          name: $scope.currentSpace.accountName,
          userRightsOnCloudspace: $scope.currentSpace.acl,
          userRightsOnAccountBilling: $scope.currentSpace.userRightsOnAccountBilling
        };
      }else {
        $scope.currentAccount = {id: ''};
      }
    }

    function autoLogin(username) {
      User.portalLogin(username, portalSessionCookie);
      $scope.currentUser = User.current();
      $scope.currentUser.acl = {account: 0, cloudspace: 0, machine: 0};
      $scope.currentSpace = CloudSpace.current();
      setInitialAccount();
    }
    function setCurrentCloudspace(space) {
      var accountId = null;
      if (space !== null && space !== undefined) {
         accountId = space.accountId;
      }
      CloudSpace.setCurrent(space);
      $scope.currentSpace = space;
      $scope.setCurrentAccount(accountId);
    }
    function checkDisabledAccount(status) {
      $scope.visibility = 'show';
      if (status === 'DISABLED') {
        _.each($scope.currentUser.acl , function(value, key) {
          $scope.currentUser.acl[key] = 1;
        });
      }
    }
    function setCurrentAccount(currentAccountId) {
      $scope.currentAccount.userRightsOnAccount = {};
      if (currentAccountId) {
        Account.get(currentAccountId).then(function(account) {
          $scope.currentAccount = account;
          $scope.currentAccount.userRightsOnAccount = account.acl;
          $scope.checkDisabledAccount(account.status);
        }, function(reason) {
          if (reason.status === 403) {
            $scope.currentUser.acl.account = 0;
            setInitialAccount();
          }else {
            $ErrorResponseAlert(reason);
          }
        });
      }
    }
    function loadSpaces() {
      if ($scope.currentUser === undefined) {
        return []; //return empty list when not logged in
      }
      return CloudSpace.list().then(function(cloudspaces) {
        $scope.cloudspaces = cloudspaces;
        return cloudspaces;
      }, function(reason) {
        $ErrorResponseAlert(reason);
      });
    }
    function invalidAccount() {
      $window.location = '/';
    }
    function cloudspaces() {
      if (!$scope.cloudspaces) {return;}

      var currentCloudSpaceFromList;
      if ($scope.currentSpace || vdc_id) {
        var searchfor = vdc_id || $scope.currentSpace.id;
        currentCloudSpaceFromList = _.find($scope.cloudspaces, function(cloudspace) {
          return cloudspace.id === searchfor;
        });
      }
      if (!currentCloudSpaceFromList) {
        currentCloudSpaceFromList = _.first($scope.cloudspaces);
      }
      $scope.setCurrentCloudspace(currentCloudSpaceFromList);
    }
    function getUserAccessOnAccount() {
      if ($scope.currentAccount.userRightsOnAccount) {
        var userInCurrentAccount = _.find($scope.currentAccount.userRightsOnAccount , function(acl) {
          return acl.userGroupId === $scope.currentUser.username;
        });
        $scope.currentUser.acl.account = 0;
        if (userInCurrentAccount) {
          var currentUserAccessrightOnAccount = userInCurrentAccount.right.toUpperCase();
          if (currentUserAccessrightOnAccount === 'R') {
            $scope.currentUser.acl.account = 1;
          }else if (currentUserAccessrightOnAccount.search(/R|C|X/) !== -1 &&
            currentUserAccessrightOnAccount.search(/D|U/) === -1) {
            $scope.currentUser.acl.account = 2;
          }else if (currentUserAccessrightOnAccount.search(/R|C|X|D|U/) !== -1) {
            $scope.currentUser.acl.account = 3;
          }
        }
      }
    }
    function CurrentAccountIdAndUserRights() {
      if ($scope.currentAccount && $scope.currentAccount.status !== 'DISABLED') {
        $scope.getUserAccessOnAccount();
      }
    }
    function logout() {
      User.logout();
      var uri = new URI($window.location);
      uri.filename('');
      uri.fragment('');
      $window.location = uri.toString();
    }
    function currentSpace() {
      if ($scope.currentSpace && $scope.currentUser) {
        CloudSpace.get($scope.currentSpace.id).then(function(data) {
          if ($scope.currentSpace.acl.length !== data.acl.length) {
            $scope.currentSpace.acl = data.acl;
          }
          $scope.setCurrentAccount($scope.currentSpace.accountId);
        }, function(reason) {
                if (reason.status === 403) {
                  $scope.currentUser.acl.cloudspace = 0;
                }
              });
        if ($scope.currentUser.username && $scope.currentSpace.acl) {
          var currentUserAccessright = _.find($scope.currentSpace.acl , function(acl) {
            return acl.userGroupId === $scope.currentUser.username;
          });
          if (currentUserAccessright) {
            currentUserAccessright = currentUserAccessright.right.toUpperCase();
            if (currentUserAccessright === 'R') {
              $scope.currentUser.acl.cloudspace = 1;
            }else if (currentUserAccessright.search(/R|C|X/) !== -1 && currentUserAccessright.search(/D|U/) === -1) {
              $scope.currentUser.acl.cloudspace = 2;
            }else if (currentUserAccessright.search(/R|C|X|D|U/) !== -1) {
              $scope.currentUser.acl.cloudspace = 3;
            }
          }
        }
        $scope.getUserAccessOnAccount();
      }
    }
  }
})();

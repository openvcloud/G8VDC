(function() {
  'use strict';
  //jshint latedef: nofunc
  angular
    .module('cloudscalers.controllers')
    .controller('MachineController', MachineController);

  function MachineController($scope, Machine, Image,
    $ErrorResponseAlert, $location, $alert, $rootScope) {

    $scope.packageDisks = '';
    $scope.machineinfo = {};
    $scope.numeral = numeral;
    $scope.updateMachineList = updateMachineList;
    $scope.$watch('currentSpace.id', currentSpaceId);
    $scope.$watch('currentspace.accountId', currentSpaceAccountId);
    $scope.$watch('currentSpace', currentSpaceAccountId);
    $rootScope.$on('callUpdateMachineList', callUpdateMachineList);
    $scope.machineIsManageable = machineIsManageable;

    function currentSpaceAccountId() {
      if ($scope.currentSpace) {
        Image.list($scope.currentSpace.accountId, $scope.currentSpace.id).then(
          function(images) {
            $scope.images = images;
          },
          function(reason) {
            $ErrorResponseAlert(reason);
          }
        );
      }
    }

    function updateMachineList() {
      var cloudspaceId;
      $scope.machines = {};
      $scope.machinesLoader = true;

      function callMachinesListApi(cloudspaceId) {
        Machine.list(cloudspaceId).then(
          function(machines) {
            $scope.machines = machines;
            $scope.machinesLoader = false;
          },
          function(reason) {
            $scope.machinesLoader = false;
            $ErrorResponseAlert(reason);
          }
        );
      }

      if ($location.search().cloudspaceId) {
        cloudspaceId = parseInt($location.search().cloudspaceId);
        $scope.$watch('cloudspaces', function() {
          if ($scope.cloudspaces) {
            var navigatedSpace = _.findWhere($scope.cloudspaces, {id: parseInt($location.search().cloudspaceId)});
            if (navigatedSpace) {
              $scope.setCurrentCloudspace(navigatedSpace);
              callMachinesListApi(cloudspaceId);
            }else {
              $alert('You don\'t have access to this CloudSpace.');
              delete $location.search().cloudspaceId;
              $scope.setCurrentCloudspace($scope.cloudspaces[0]);
              callMachinesListApi($scope.currentSpace.id);
              $location.path('/');
            }
          }
        });
      }else {
        if ($scope.currentSpace) {
          callMachinesListApi($scope.currentSpace.id);
        }
      }
    }

    function currentSpaceId() {
      if ($scope.currentSpace) {
        $scope.updateMachineList();
      }
    }

    function callUpdateMachineList() {
      $scope.updateMachineList();
    }

    function machineIsManageable(machine) {
      return machine.status && machine.status !== 'DESTROYED' && machine.status !== 'ERROR';
    }

  }
})();

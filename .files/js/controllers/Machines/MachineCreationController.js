(function() {
  'use strict';
  //jshint latedef: nofunc
  angular
    .module('cloudscalers.controllers')
    .controller('MachineCreationController', MachineCreationController);

  function MachineCreationController($scope, $timeout, $location, $window,
    Machine, $rootScope, LoadingDialog, $ErrorResponseAlert) {
    $scope.machine = {
      name: '',
      description: '',
      imageId: '',
      disksize: ''
    };
    $scope.sizepredicate = 'memory';
    $scope.groupedImages = [];
    $scope.activePackage = activePackage;
    $scope.createredirect = createredirect;
    $scope.saveNewMachine = saveNewMachine;
    $scope.isValid = isValid;
    $scope.mindisksize = 1;

    $scope.$watch('machine.imageId', machineImageId, true);
    $scope.$watch('images', images, true);

    function images() {
      if ($scope.images) {
        $scope.machine.imageId = String($scope.images[0].id);
        _.extend($scope.groupedImages, _.pairs(_.groupBy($scope.images, function(img) { return img.type; })));
      }
    }

    function machineImageId() {
      if ($scope.machine.imageId) {
        $scope.packageDisks = [];
        $scope.mindisksize = _.findWhere($scope.images, {id: $scope.machine.imageId}).size;
      }
    }

    function activePackage(packageID) {
      var elementClass = '.package-' + packageID;
      angular.element('.active-package').removeClass('active-package');
      angular.element('.packages').find(elementClass).addClass('active-package');
    }

    function createredirect(id) {
      $location.path('/edit/' + id + '/console');
    }

    function saveNewMachine() {
      LoadingDialog.show('Creating machine');
      Machine.create($scope.currentSpace.id, $scope.machine.name, $scope.machine.description,
      $scope.machine.vcpus, $scope.machine.memory, $scope.machine.imageId, $scope.machine.disksize,
      $scope.machine.archive,
      $scope.machine.region, $scope.machine.replication)
      .then(
        function(result) {
          LoadingDialog.hide();
          $scope.createredirect(result);
          $scope.machines.push({
            cloudspaceId: $scope.currentSpace.id,
            name: $scope.machine.name,
            description: $scope.machine.description,
            memory: $scope.machine.memory,
            vcpus: $scope.machine.vcpus,
            imageId: $scope.machine.imageId,
            disksize: $scope.machine.disksize,
            archive: $scope.machine.archive,
            region: $scope.machine.region,
            replication: $scope.machine.replication
          });
        },
        function(reason) {
          LoadingDialog.hide();
          $ErrorResponseAlert(reason);
        }
      );
    }

    function isValid() {
      return $scope.machine.name !== '' &&
        $scope.machine.memory !== '' &&
        $scope.machine.vcpus !== '' &&
        $scope.machine.imageId !== '' &&
        $scope.machine.disksize !== '' &&
        $scope.machine.disksize >= $scope.mindisksize;
    }
  }
})();

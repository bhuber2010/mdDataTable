(function(){
    'use strict';

    function mdtCardHeaderDirective(){
        return {
            restrict: 'E',
            templateUrl: '/main/templates/mdtCardHeader.html',
            transclude: true,
            replace: true,
            scope: true,
            require: ['^mdtTable'],
            link: function($scope){
                $scope.isTableCardEnabled = false;
                $scope.hideTable = false

                //TODO: move it to the feature file
                $scope.handleColumnChooserButtonClick = function(){
                    if($scope.columnSelectorFeature.isEnabled){
                        $scope.columnSelectorFeature.isActive = !$scope.columnSelectorFeature.isActive
                    }
                };

                $scope.hideShowTableClick = function(){
                  if ($scope.tableCard && $scope.tableCard.tableShowHide) {
                    $scope.hideTable = !$scope.hideTable
                  }
                }

                if($scope.tableCard && $scope.tableCard.visible !== false){
                    $scope.isTableCardEnabled = true;
                }
            }
        };
    }

    angular
        .module('mdDataTable')
        .directive('mdtCardHeader', mdtCardHeaderDirective);
}());

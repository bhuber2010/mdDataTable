(function(){
    'use strict';

    function mdtAlternateHeadersDirective(_){
        return {
            restrict: 'E',
            templateUrl: '/main/templates/mdtAlternateHeaders.html',
            transclude: true,
            replace: true,
            scope: true,
            require: '^mdtTable',
            link: function($scope, element, attrs, ctrl){
                $scope.deleteSelectedRows = deleteSelectedRows;
                $scope.getNumberOfSelectedRows = _.bind(ctrl.dataStorage.getNumberOfSelectedRows, ctrl.dataStorage);

                function deleteSelectedRows(){
                    var userAnswer = new Promise(function(resolve, reject) {
                      resolve($scope.deleteRowCallback({rows: ctrl.dataStorage.getSelectedRows()}))
                    })

                    userAnswer.then(function(answer) {
                      console.log("User Answer:", answer);
                      if (answer) {
                        return ctrl.dataStorage.deleteSelectedRows();
                      }
                    })
                }
            }
        };
    }

    angular
        .module('mdDataTable')
        .directive('mdtAlternateHeaders', mdtAlternateHeadersDirective);
}());

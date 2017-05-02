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
                $scope.editSelectedRows = editSelectedRows;
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

                function editSelectedRows(){
                  var userEdits = new Promise(function(resolve, reject) {
                    resolve($scope.editRowCallback({rows: ctrl.dataStorage.getSelectedRows()}))
                  })

                  userEdits.then(function(edits) {
                    console.log("User edits:", edits);
                  })
                }
            }
        };
    }

    angular
        .module('mdDataTable')
        .directive('mdtAlternateHeaders', mdtAlternateHeadersDirective);
}());

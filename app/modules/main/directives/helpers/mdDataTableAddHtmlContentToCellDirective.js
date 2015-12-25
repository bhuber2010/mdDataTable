(function(){
    'use strict';

    function mdDataTableAddHtmlContentToCellDirective(){
        return {
            restrict: 'A',
            scope: {
                htmlContent: '=mdDataTableAddHtmlContentToCell'
            },
            link: function($scope, element){
                element.append($scope.htmlContent);

                $scope.$watch('htmlContent', function(){
                    element.empty();
                    element.append($scope.htmlContent);
                });
            }
        };
    }

    angular
        .module('mdDataTable')
        .directive('mdDataTableAddHtmlContentToCell', mdDataTableAddHtmlContentToCellDirective);
}());
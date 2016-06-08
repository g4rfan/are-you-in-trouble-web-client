/**
 * Copyright (C) 2014 CAT, LLC; Pavel Orlov
 * @author Pavel Orlov <garffans@outlook.com>
 */


angular.module('helpdesk.directives')
    .directive('navBar', function () {
        return {
            restrict: 'E',
            templateUrl: '/static/templates/directives/navbar.html',
            controller: function ($scope, me) {
                $scope.tab = 1;

                $scope.setTab = function (selectedTab) {
                    $scope.tab = selectedTab;
                };

                $scope.isSet = function (tab) {
                    return $scope.tab == tab;
                };

                $scope.me = {};
                $scope.$watch(me.getMyself, function (newVal) {
                    $scope.me = newVal;
                });
            }
        };
    });
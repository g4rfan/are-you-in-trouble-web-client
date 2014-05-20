/**
 * Copyright (C) 2014 CAT, LLC; Pavel Orlov
 * @author Pavel Orlov <garffans@outlook.com>
 */


angular.module('helpdesk.directives').directive('tasksTable', function () {
    return {
        restrict: 'E',
        templateUrl: '/static/templates/directives/task-table.html'
    };
});
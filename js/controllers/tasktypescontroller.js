/**
 * Created by garffan on 11/9/13.
 */

function taskTypesCntrl ($scope, taskTypesProvider) {
    $scope.taskTypes = taskTypesProvider.getTaskTypes();

    globalEvents.addEventListener('tab changed', function(data) {
        if (data.tabName == 'taskTypes') {
            taskTypesProvider.getTaskTypesFromServer();
            $('.view.active').removeClass('active');
            $('.view.task-types').addClass('active');
            $scope.$digest();
        }
    });

    globalEvents.addEventListener('login', function () {
        taskTypesProvider.getTaskTypesFromServer();
        $scope.$digest();
    });
}
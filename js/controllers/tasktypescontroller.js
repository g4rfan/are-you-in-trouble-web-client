/**
 * Created by garffan on 11/9/13.
 */

function taskTypesCntrl ($scope, $compile, networkManager, taskTypesProvider) {
    $scope.taskTypes = taskTypesProvider.getTaskTypes();
    $scope._domRef = $('.opened-task-type');

    globalEvents.addEventListener('tab changed', function(data) {
        if (data.tabName == 'taskTypes') {
            taskTypesProvider.getTaskTypesFromServer();
            $('.view.active').removeClass('active');
            $('.view.task-types').addClass('active');
            $scope.$digest();
        }
    });

    $scope.save = function (taskTypeId) {
        var params = {};

        if (taskTypeId) {
            params.id = taskTypeId;
            for (var i = 0; i < $scope.taskTypes.length; ++i) {
                if ($scope.taskTypes[i].id == taskTypeId) {
                    params.name = $scope.taskTypes[i].name;
                    break;
                }
            }
        } else {
            params.name = $('.new-task-type textarea').val()
        }

        networkManager.request('task types:save', params, function (data) {
            if (!taskTypeId) {
                taskTypesProvider.insert(data);
                $scope.$digest();
            }
        });
        $('.new-task-type textarea').val('');
        $('.new-task-type, .blackout').hide();
    };

    $scope.openTaskType = function (taskTypeId) {
        var i = 0, len = $scope.taskTypes.length, taskType = null;
        while (i < len) {
            if ($scope.taskTypes[i].id == taskTypeId) {
                taskType = $scope.taskTypes[i];
                break;
            }
            ++i;
        }
        var scope = $scope.$new();
        scope.data = taskType;

        var nElement = $compile(TemplateStorage.templates['tasktype'])(scope);
        $scope._domRef.empty();
        $scope._domRef.append(nElement);
        $scope._domRef.css({
            top : $(window).height() / 2 - 100,
            left : document.body.clientWidth / 2 - 150
        }).show();

        scope.saveTaskType = function () {
            $scope.save(taskTypeId);
            $('.opened-task-type, .blackout').hide();
        };

        $scope._domRef.find('.close-button').on('click', function (event) {
            $('.opened-task-type, .blackout').hide();
        });
        $('.blackout').show();
    };

    globalEvents.addEventListener('login', function () {
        taskTypesProvider.getTaskTypesFromServer();
        $scope.$digest();
    });
}
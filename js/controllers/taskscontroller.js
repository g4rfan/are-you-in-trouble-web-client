/**
 * Created by garffan on 10/2/13.
 */

function tasksCntrl($scope, $compile, networkManager, filtersProvider) {
    $scope.offset = 0;
    $scope.limit = 10;
    $scope.tasks = [];

    $scope._domRef = $('.task-view');

    $scope.getTasks = function () {

        var params = {
            offset: $scope.offset,
            limit: $scope.limit,
            filters: { /*'university_department_id' : []*/ closed_by_id : null }
        };

        networkManager.request('tasks:retrieve', params, function (data) {
            console.log(data);
            var i = 0, len = data.length;
            while (i < len) {
                $scope.tasks.push(data[i]);
                ++i;
            }
            $scope.offset += $scope.limit;
            $scope.$digest();
        });
    };

    networkManager.on('tasks:new', function (data) {
        $scope.unshift(data);
    });

    $scope.openTask = function (taskId) {
        var i = 0, len = $scope.tasks.length, task = null;
        while (i < len) {
            if ($scope.tasks[i].taskId == taskId) {
                task = $scope.tasks[i];
                break;
            }
            ++i;
        }
        var scope = $scope.$new();
        scope.data = task;

        var nElement = $compile(TemplateStorage.templates['task'])(scope);
        $scope._domRef.empty();
        $scope._domRef.append(nElement);
    };

    $scope.newTask = function () {
        $scope.tasks.unshift({ taskId: 1, title: 'n', content: 'tskm', timestamp: new Date() });

    };

    $scope.save = function () {
        networkManager.request('tasks:save', $scope.tasks, function (data) {
            console.log('save' + new Date());
        });
    };

    onlogin = function () {
        filtersProvider.getFiltersFromServer();
        $scope.getTasks();
    };

    filtersProvider.events.addEventListener('filters set changed', function (data) {
        console.log('task controller : filters set changed ', data);
    });

    $('.request-lists').on('scroll', function (event) {
        if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
            $scope.getTasks();
        }
    });
}
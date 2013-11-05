/**
 * Created by garffan on 10/2/13.
 */

function tasksCntrl($scope, $compile, networkManager, filtersProvider, universityDepProvider, subDepartProvider) {
    $scope.offset = 0;
    $scope.limit = 50;
    $scope.tasks = [];
    $scope.filters = filtersProvider.getFilters();
    $scope.subDeps = subDepartProvider.getSubDeps();
    /*$scope.univDeps = universityDepProvider.getUniversityDep();*/

    $scope._domRef = $('.task-view');

    $scope.getTasks = function (filters) {
        var params = {};
        if (!filters) {
            params = {
                offset: $scope.offset,
                limit: $scope.limit,
                filters: {  closed_by_id : null }
            };
        } else {
            params = {
                offset: $scope.offset,
                limit: $scope.limit
            };

            var udi = [], ti = [];

            for (var key in filters.universityDep) {
                udi.push(key);
            }

            for (var key in filters.taskTypes) {
		        ti.push(key);
	        }
	    
            params.filters = { closed_by_id : null };
            if (udi.length != 0) {
                params.filters.university_department_id = udi;
            }
	    
	    if (ti.length != 0) {
		params.filters.type_id = ti;
            }
        }

        networkManager.request('tasks:retrieve', params, function (data) {
            var i = 0, len = data.length;
            $scope.tasks.length = 0;
            while (i < len) {
                $scope.tasks.push(data[i]);
                ++i;
            }
            //$scope.offset += $scope.limit;
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
        var task = {
            content: $('.new-task textarea').val(),
            university_department_id: $scope.selectedUniDep,
            type_id : $scope.selectedTaskType,
            subdepartment_id : $scope.
        };

        networkManager.request('tasks:save', task, function (data) {
            console.log(data);
            $('.new-task, .blackout').hide();
        });


    };

    globalEvents.addEventListener('login', function () {
        filtersProvider.getFiltersFromServer();
        $scope.getTasks();
    });

    filtersProvider.events.addEventListener('filters set changed', function (data) {
        $scope.getTasks(data);
    });

    filtersProvider.events.addEventListener('filters got', function (data) {
        $scope.filters = filtersProvider.getFilters();
    });

    $('.request-lists').on('scroll', function (event) {
        if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
            $scope.getTasks();
        }
    });
}

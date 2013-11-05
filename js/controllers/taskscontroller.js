/**
 * Created by garffan on 10/2/13.
 */

function tasksCntrl($scope, $compile, networkManager, filtersProvider, universityDepProvider, subDepartProvider, profileProvider) {
    $scope.offset = 0;
    $scope.limit = 50;
    $scope.tasks = [];
    $scope.profile = profileProvider.getProfiles();
    $scope.filters = filtersProvider.getFilters();
    $scope.subDeps = subDepartProvider.getSubDeps();
    /*$scope.univDeps = universityDepProvider.getUniversityDep();*/

    $scope._domRef = $('.opened-task');

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
            if ($scope.tasks[i].id == taskId) {
                task = $scope.tasks[i];
                break;
            }
            ++i;
        }
        var scope = $scope.$new();
        scope.data = task;
        scope.comments = [];
        scope.profile = $scope.profile;

        scope.subDeps = $scope.subDeps;

        networkManager.request('task comments:retrieve', { taskId : taskId }, function (data) {
            scope.comments = data;
            scope.$digest();
        });

        scope.getHelpers = function () {
            if (task.helper_ids.length == 0) {
                setTimeout(function() {
                    scope.onWork = 'Никто не назначен';
                    scope.$digest();
                }, 200);
            } else {
                networkManager.request('profiles:retrieve', { filters : { id : task.helper_ids } }, function (data) {
                    var i = 0, len = data.length;
                    scope.onWork = '';
                    while (i < len) {
                        if  (i == len - 1) {
                            scope.onWork += data[i].displayname;
                        } else {
                            scope.onWork += data[i].displayname + ', ';
                        }
                        ++i;
                    }
                    scope.$digest();
                });
            }
        };

        scope.getUsersBySubDep = function () {
            if (scope.selectedSubDep) {
                networkManager.request('profiles:retrieve', { filters: { subdepartment_id : scope.selectedSubDep, role: [ 'helper', 'subdepartment chief' ] } }, function (data) {
                    scope.users = data;
                    scope.$digest();
                });
            }
        };

        scope.closeTask = function () {
            networkManager.request('tasks:close', { taskId: taskId }, function (data) {
                for(var i = 0; i < $scope.tasks.length; ++i) {
                    if ($scope.tasks[i].id == taskId) {
                        $scope.tasks.splice(i, 1);
                        break;
                    }
                }
                $scope.$digest();
                $('.opened-task, .blackout').hide();
            });
        };

        scope.addHelperToTask = function () {
            if (scope.selectedUser) {
                networkManager.request('tasks:add helper', { taskId: taskId, helperId: scope.selectedUser }, function (data) {
                    scope.data.helper_ids.push(scope.selectedUser);
                    scope.getHelpers();
                });
            }
        };

        if (task.subdepartment_id) {
            scope.selectedSubDep = task.subdepartment_id;
            scope.getUsersBySubDep();
        } else {
            networkManager.request('profiles:retrieve', { filters: { role: [ 'helper', 'subdepartment chief' ] } }, function (data) {
                scope.users = data;
                scope.$digest();
            });
        }

        scope.getHelpers();

        scope.saveComment = function() {
            networkManager.request('task comments:save', { task_id : taskId, content : scope.ncomment }, function (data) {
                scope.comments.push(data);
                scope.$digest();
            });
            scope.ncomment = '';
        };

        var nElement = $compile(TemplateStorage.templates['task'])(scope);
        $scope._domRef.empty();
        $scope._domRef.append(nElement);
        $scope._domRef.css({
            top : $('body').height()/2 - 330,
            left : $('body').width()/2 - 330
        }).show();

        $('.close-button').on('click', function (event) {
            $('.opened-task, .new-task, .blackout').hide();
        });

        $('.blackout').show();
    };

    $scope.newTask = function () {
        $scope.tasks.unshift({ taskId: 1, title: 'n', content: 'tskm', timestamp: new Date() });

    };

    $scope.save = function () {
        var task = {
            content: $('.new-task textarea').val(),
            university_department_id: $scope.selectedUniDep,
            subdepartment_id : $scope.selectedSub,
            type_id : $scope.selectedTaskType
        };

        if ($scope.selectedSub) {
            delete task['subdepartment_id'];
            delete task['university_department_id'];
        }

        networkManager.request('tasks:save', task, function (data) {
            $scope.tasks.unshift(data);
            $scope.$digest();
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

/**
 * Created by garffan on 10/2/13.
 */

function tasksCntrl($scope, $compile, networkManager, universityDepProvider, filtersProvider, subDepartProvider, profileProvider) {
    $scope.offset = 0;
    $scope.limit = 24;
    $scope.tasks = [];
    $scope.profile = profileProvider.getProfiles();
    $scope.filters = filtersProvider.getFilters();
    $scope.subDeps = subDepartProvider.getSubDeps();
    $scope.selctedFilters = {};
    $scope.uniDeps = universityDepProvider.getUniversityDep();

    $scope._domRef = $('.opened-task');

    $scope.getTasks = function (filters, upload) {
        var params = {};

        if (!upload) {
            $scope.limit = 24;
            $scope.offset = 0;
        }

        if (!filters) {
            params = {
                offset: $scope.offset,
                limit: $scope.limit,
                filters: {  closedById : null }
            };
        } else {
            params = {
                offset: $scope.offset,
                limit: $scope.limit
            };

            var udi = [], ti = [], sdi = [];

            for (var key in filters.universityDep) {
                udi.push(key);
            }

            for (var key in filters.taskTypes) {
		        ti.push(key);
	        }

            for (var key in filters.subDeps) {
                sdi.push(key);
            }
	    
            params.filters = { closedById : null };
            if (udi.length != 0) {
                params.filters.universityDepartmentId = udi;
            }
	    
            if (ti.length != 0) {
                params.filters.typeId = ti;
            }

            if (sdi.length != 0) {
                params.filters.subdepartmentId = sdi;
            }
        }

        networkManager.request('tasks:retrieve', params, function (data) {
            var i = 0, len = data.length;
            if(!upload) {
                $scope.tasks.length = 0;
            }

            while (i < len) {
                $scope.tasks.push(data[i]);
                ++i;
            }

            if (!upload) {
                $scope.offset = $scope.limit;
            }

            if(data.length != 0) {
                $scope.limit = 10;
                if (upload)
                    $scope.offset += $scope.limit;
            }
            $scope.$digest();
            fixTableWidth($('.view.tasks'));
            $('.timeago').timeago();
        });
    };

    $scope.getSubDep = function (subDepId) {
        var subDep = null;
        for (var i = 0; i < $scope.subDeps.length; ++i) {
            if ($scope.subDeps[i].id == subDepId) {
                subDep = $scope.subDeps[i];
                break;
            }
        }

        return subDep ? subDep.name : '-';
    };

    $scope.getUniDep = function (uniDepId) {
        var uniDep = null;
        for (var i = 0; i < $scope.uniDeps.length; ++i) {
            if ($scope.uniDeps[i].id == uniDepId) {
                uniDep = $scope.uniDeps[i];
                break;
            }
        }

        return uniDep ? uniDep.name : '-';
    };

    $scope.parseDate = function (date) {
        return $.timeago(new Date(date));
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
            if (data.length == 0) {
                scope.comments = [];
                scope.$digest();
                return;
            }

            var ids = [];
            for (var i = 0; i < data.length; ++i) {
                ids.push(data[i].userId);
            }

            networkManager.request('profiles:retrieve', { filters : { id : ids} }, function (userNames) {
                for (var i = 0; i < data.length; ++i) {
                    for (var j = 0; j < userNames.length; ++j) {
                        if (data[i].userId == userNames[j].id) {
                            data[i].displayName = userNames[j].displayName;
                            break;
                        }
                    }
                }
                scope.comments = data;
                scope.$digest();
            });

        });

        scope.setCorrectDep = function() {
            if (scope.selectedUser) {
                networkManager.request('profiles:retrieve', { filters: { role: [ 'helper', 'subdepartment chief' ] } }, function (data) {
                    for (var i = 0; i < data.length; ++i) {
                        if (data[i].id == scope.selectedUser) {
                            scope.selectedSubDep = data[i].subdepartmentId;
                            scope.$digest();
                            break;
                        }
                    }
                });
            }
        };

        scope.getHelpers = function () {
             networkManager.request('profiles:retrieve', { filters : { id : task.helperIds } }, function (data) {
                 scope.helpers = data;
                 scope.$digest();
             });
        };

        scope.getUsersBySubDep = function () {
            if (scope.selectedSubDep) {
                networkManager.request('profiles:retrieve', { filters: { subdepartmentId : scope.selectedSubDep, role: [ 'helper', 'subdepartment chief' ] } }, function (data) {
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
                        fixTableWidth($('.view.tasks'));
                        break;
                    }
                }
                $scope.$digest();
                $('.opened-task, .blackout').hide();
            });
        };

        scope.removeTask = function () {
            networkManager.request('tasks:remove', { taskId: taskId }, function (data) {
                for (var i = 0; i < $scope.tasks.length; ++i) {
                    if ($scope.tasks[i].id == taskId) {
                        $scope.tasks.splice(i, 1);
                        fixTableWidth($('.view.tasks'));
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
                    scope.data.helperIds.push(scope.selectedUser);
                    scope.getHelpers();
                });
            }
        };

        scope.removeHelper = function (helperId) {
            networkManager.request('tasks:remove helper', { taskId: taskId, helperId: helperId }, function (data) {
                for (var i = 0; i < scope.helpers.length; ++i) {
                    if (scope.helpers[i].id == helperId) {
                        scope.helpers.splice(i, 1);
                        break;
                    }
                }

                for (var i = 0; i < task.helperIds.length; ++i) {
                    if (task.helperIds[i]== helperId) {
                        task.helperIds.splice(i, 1);
                        break;
                    }
                }
                scope.$digest();
                $scope.$digest();
            });
        };

        scope.removeComment = function (commentId) {
            networkManager.request('task comments:remove', { commentId : commentId }, function () {
                for (var i = 0; i < scope.comments.length; ++i) {
                    if (scope.comments[i].id == commentId) {
                        scope.comments.splice(i, 1);
                        --task.commentCount;
                        break;
                    }
                }
                scope.$digest();
                $scope.$digest();
            });
        };

        if (task.subdepartmentId) {
            scope.selectedSubDep = task.subdepartmentId;
            scope.getUsersBySubDep();
        } else {
            networkManager.request('profiles:retrieve', { filters: { role: [ 'helper', 'subdepartment chief' ] } }, function (data) {
                scope.users = data;
                scope.$digest();
            });
        }

        scope.getHelpers();

        scope.saveComment = function () {
            networkManager.request('task comments:save', { taskId : taskId, content : scope.ncomment }, function (data) {
                ++task.commentCount;
                data.displayName = $scope.profile[0].displayName;
                scope.comments.push(data);
                scope.$digest();
                $scope.$digest();
            });
            scope.ncomment = '';
        };

        var nElement = $compile(TemplateStorage.templates['task'])(scope);
        $scope._domRef.empty();
        $scope._domRef.append(nElement);
        $scope._domRef.css({
            top : $(window).height()/2 - 330,
            left : document.body.clientWidth/2 - 330
        }).show();

        function editTask () {
            $('.content-edit').css('height', $('.content-container').height()).show();
            $('.content-container').hide();
            $('.edit-button').removeClass('glyphicon-pencil').addClass('glyphicon-floppy-disk').off('click').on('click', function (event) {
                saveTask();
            });
        }

        function saveTask () {
            $('.content-edit').hide();
            $('.content-container').show();
            $scope.save(task);
            $('.edit-button').removeClass('glyphicon-floppy-disk').addClass('glyphicon-pencil').off('click').on('click', function (event) {
                editTask();
            });
        }

        $('.edit-button').off('click').on('click', function (event) {
            editTask();
        });

        $scope._domRef.find('.close-button').on('click', function (event) {
            $('.opened-task, .blackout').hide();
        });

        $('.blackout').show();
    };

    $scope.newTask = function () {
        $scope.tasks.unshift({ taskId: 1, title: 'n', content: 'tskm', timestamp: new Date() });
    };

    $scope.save = function (gtask) {

        var task = {
            content: gtask ? gtask.content : $('.new-task textarea').val(),
            universityDepartmentId: gtask ? gtask.universityDepartmentId : $scope.selectedUniDep,
            subdepartmentId : gtask ? gtask.subdepartmentId : $scope.selectedSub,
            typeId : gtask ? gtask.typeId : $scope.selectedTaskType
        };

        if (gtask) {
            task.id = gtask.id;
        }

        if (!$scope.selectedSub && !gtask) {
            delete task['subdepartmentId'];
            delete task['universityDepartmentId'];
        }

        networkManager.request('tasks:save', task, function (data) {
            if(!gtask)
                $scope.tasks.unshift(data);

            setTimeout(function() {
                $scope.$digest();
                fixTableWidth($('.view.tasks'));
                $('.timeago').timeago();
            }, 200);

            if(!gtask)
                $('.new-task, .blackout').hide();
        });
    };

    globalEvents.addEventListener('login', function () {
        filtersProvider.getFiltersFromServer();
        universityDepProvider.getUniversityDepFromServer();
        subDepartProvider.getSubDepartFromServer();
        $scope.getTasks();
    });

    globalEvents.addEventListener('logout', function () {
        $scope.tasks = [];
        $scope.$digest();
    });

    filtersProvider.events.addEventListener('filters set changed', function (data) {
        if (event.sender == 'profiles') return;

        $scope.selctedFilters = data.selectedFilters;
        $scope.getTasks(data.selectedFilters);
        fixTableWidth($('.view.tasks'));
    });

    globalEvents.addEventListener('tab changed', function(data) {
        if (data.tabName == 'tasks') {
            $scope.getTasks();
            $('.view.active').removeClass('active');
            $('.view.tasks').addClass('active');
            fixTableWidth($('.view.tasks'));
            $('.timeago').timeago();
        }
    });


    filtersProvider.events.addEventListener('filters got', function (data) {
        $scope.filters = filtersProvider.getFilters();
        $scope.$digest();
    });


    $('.view.tasks .scrollable').on('scroll', function() {
        if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight - 50) {
            $scope.getTasks($scope.selectedFilters, true);
        }
    });
}

/**
 * Created by garffan on 10/2/13.
 */

function tasksCntrl($scope, $compile, networkManager){
    $scope.offset = 0;
    $scope.limit = 10;
    $scope.tasks = [
        { taskId : 1, title : '1', content : 'tsk1', timestamp : new Date() },
        { taskId : 2, title : '2', content : 'tsk2', timestamp : new Date() },
        { taskId : 3, title : '3', content : 'tsk3', timestamp : new Date() },
        { taskId : 4, title : '4', content : 'tsk4', timestamp : new Date() },
        { taskId : 5, title : '5', content : 'tsk5', timestamp : new Date() },
        { taskId : 6, title : '6', content : 'tsk6', timestamp : new Date() } ];

    $scope._domRef = $('.task-view');

    $scope.getTasks = function(){
        networkManager.request('tasks:retrieve', { offset : $scope.offset,  limit : $scope.limit, filters : [] }, function(data){
            $scope.tasks.push(data);
            $scope.offset += $scope.limit;
        });
    };

    networkManager.on('tasks:new', function(data){
        $scope.unshift(data);
    });

    $scope.openTask = function(taskId){
        var i = 0, len = $scope.tasks.length, task = null;
        while(i < len){
            if($scope.tasks[i].taskId == taskId){
                task = $scope.tasks[i];
                break;
            }
            ++i;
        }
        var scope = $scope.$new();
        scope.data = task;

        var nElement = $compile(TemplateStorage.templates.task)(scope);
        $scope._domRef.empty();
        $scope._domRef.append(nElement);
    };

    $scope.newTask = function(){
        $scope.tasks.unshift({ taskId : 1, title : 'n', content : 'tskm', timestamp : new Date() });

    };

    $scope.save = function(){
        networkManager.request('tasks:save', $scope.tasks, function(data){
            console.log('save' + new Date());
        });
    };

    $scope.getTasks();

    $('.request-lists').on('scroll', function(event){
        if($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight){
            $scope.getTasks();
        }
    });
}
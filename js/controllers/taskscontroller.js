/**
 * Created by garffan on 10/2/13.
 */

function tasksCntrl($scope, $compile, networkManager){
    $scope.offset = 0;
    $scope.limit = 10;
    $scope.tasks = [{ title : '1', content : 'tsk1', timestamp : new Date() },
        { title : '2', content : 'tsk2', timestamp : new Date() },
        { title : '3', content : 'tsk3', timestamp : new Date() },
        { title : '4', content : 'tsk4', timestamp : new Date() },
        { title : '5', content : 'tsk5', timestamp : new Date() },
        { title : '6', content : 'tsk6', timestamp : new Date() } ];

    $scope._domRef = $('.task-view');

    $scope.getTasks = function(){
        networkManager.request('tasks:retrieve', { offset : $scope.offset, limit : $scope.limit }, function(data){
            $scope.tasks.push(data);
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
        var scope = new taskScope(task, networkManager);
        $compile($scope._domRef)(scope);
    };

    $scope.newTask = function(){
        var scope = new taskScope({ taskId : 0, description : 'hello' }, networkManager);
        $compile($scope._domRef)(scope);
    };

    $scope.save = function(){
        networkManager.request('tasks:save', $scope.tasks, function(data){
            console.log('save' + new Date());
        });
    };

    $scope.getTasks();

    $(window).on('scroll', function(event){
        if($(window).scrollTop() + $(window).height() == $(document).height()){
            $scope.getTasks();
        }
    });
}
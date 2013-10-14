/**
 * Created by garffan on 10/2/13.
 */

function tasksCntrl($scope, $compile, networkManager){
    $scope.offset = 0;
    $scope.limit = 10;
    $scope.tasks = [
        { taskId : 1, title : 'Player Controls', content : 'Change the color, size, controls, and thumbnail of your video.', timestamp : new Date() },
        { taskId : 2, title : 'Video SEO', content : 'Tools to improve your site’s SEO, not someone else’s.', timestamp : new Date() },
        { taskId : 3, title : 'Video Heatmaps & Engagement Graphs', content : 'Track and analyze how individuals watch your video, second by second.', timestamp : new Date() },
        { taskId : 4, title : 'Turnstile Email Collector', content : 'Turn your video into a lead generation machine.', timestamp : new Date() },
        { taskId : 5, title : 'Private Sharing', content : 'Share and collaborate around video with password-protected security.', timestamp : new Date() },
        { taskId : 6, title : 'Social Sharing', content : 'Share your videos and track their viewing on your favorite social services.', timestamp : new Date() } ];

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
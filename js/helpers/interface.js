/**
 * Created by garffan on 10/15/13.
 */


function getDistanceBetweenPoints(point1, point2){
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

function expandTask(task){
    var jqTask = $(task);
    var offset = jqTask.offset();
    var rect = {
        leftTop : { x : offset.left, y : offset.y },
        leftBottom : { x : offset.left, y : offset.y + jqTask.height() },
        rightTop : { x : offset.left + jqTask.width(), y : offset.y },
        rightBottom : { x : offset.left + jqTask.width(), y : offset.y + jqTask.height() }
    };

    var pointName = 'leftTop', minDistance = 0,
        leftOffsetCenter = $('.filters').width(), center = { x : ($('body').width() - leftOffsetCenter) };
    for(var point in rect){
        var dist = getDistanceBetweenPoints(rect[point], center)
    }
}
/**
 * Created by garffan on 10/2/13.
 */

function taskScope(data, networkManager) {
    this.taskId = data.taskId;
    this.content = data.content;
    this.title = data.title;

    this.save = function () {
        networkManager.request('task:save', { data: this }, function (data) {
            console.log('Saved : %o', data);
            return "yep";
        });
    }
}
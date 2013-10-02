/**
 * Created by garffan on 10/2/13.
 */

function taskScope(data, networkManager){
    this.id = data.taskId;
    this.description = data.description;
    this.save = function(){
        networkManager.request('task:save', { data : this }, function(data){
            console.log('Saved : %o', data);
        });
    }
}
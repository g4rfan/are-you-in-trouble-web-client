/**
 * Created by garffan on 11/5/13.
 */

angular.module('helpdesk.service').service('subDepartProvider', function (networkManager) {
    var serviceModel = {
        _storage : [],

        getSubDeps : function () {
            return this._storage;
        },

        insert : function (data) {
            this._storage.push(data);
        },

        save : function (data) {
            var self = this;
            networkManager.emit('subdepartments:save', function (savedData) {
                self.insert(savedData);
            });
        },

        getSubDepartFromServer : getSubDepartFromServer

     /* events : new EventEmitter({
            'filters set changed' : [],
            'filters got' : []
        })*/
    };

    function getSubDepartFromServer () {
        networkManager.request('subdepartments:retrieve', {}, function (data) {
            var i = 0, len = data.length;
            while (i < len) {
                serviceModel.insert(data[i]);
                ++i;
            }
        });
    }

    globalEvents.addEventListener('login', function () {
       getSubDepartFromServer();
    });

    return serviceModel;
});
/**
 * Created by garffan on 11/9/13.
 */

angular.module('helpdesk.service').service('taskTypesProvider', function (networkManager) {
    var serviceModel = {
        _storage: [],

        getTaskTypes: function () {
            return this._storage;
        },

        insert: function (data) {
            this._storage.push(data);
        },

        save: function (data) {
            var self = this;
            networkManager.emit('task types:save', function (savedData) {
                self.insert(savedData);
            });
        },

        getTaskTypesFromServer: getTaskTypesFromServer

        /* events: new EventEmitter({
         'filters set changed': [],
         'filters got': []
         })*/
    };

    function getTaskTypesFromServer () {
        networkManager.request('task types:retrieve', {}, function (data) {
            var i = 0, len = data.length;
            serviceModel._storage.length = 0;
            while (i < len) {
                serviceModel.insert(data[i]);
                ++i;
            }
        });
    }

    globalEvents.addEventListener('login', function () {
        getTaskTypesFromServer();
    });

    return serviceModel;
});
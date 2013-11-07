/**
 * Created by garffan on 11/5/13.
 */

angular.module('helpdesk.service').service('universityDepProvider', function (networkManager) {
    var serviceModel = {
        _storage : [],

        getUniversityDep : function () {
            return this._storage;
        },

        insert : function (data) {
            this._storage.push(data);
        },

        save : function (data) {
            var self = this;
            networkManager.emit('university departments:save', data, function (savedData) {
                self.insert(savedData);
            });
        },

        getUniversityDepFromServer : getUniversityDepFromServer

        /* events : new EventEmitter({
         'filters set changed' : [],
         'filters got' : []
         })*/
    };

    function getUniversityDepFromServer () {
        networkManager.request('university departments:retrieve', {}, function (data) {
            var i = 0, len = data.length;
            /*console.log(data);*/
            while (i < len) {
                serviceModel.insert(data[i]);
                ++i;
            }
        });
    }

    globalEvents.addEventListener('login', function () {
        getUniversityDepFromServer();
    });

    return serviceModel;
});
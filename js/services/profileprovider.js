/**
 * Created by garffan on 11/5/13.
 */


angular.module('helpdesk.service').service('profileProvider', function (networkManager) {
    var serviceModel = {
        _storage : [],

        getProfiles : function () {
            return this._storage;
        },

        insert : function (data) {
            this._storage.push(data);
        },

        save : function (data) {
            var self = this;
            networkManager.emit('profiles:save', function (savedData) {
                self.insert(savedData);
            });
        },

        getProfilesFromServer : getProfilesFromServer

        /* events : new EventEmitter({
         'filters set changed' : [],
         'filters got' : []
         })*/
    };

    function getProfilesFromServer (getAll) {
        var filters = {};
        if (getAll) {
            filters = { filters : { } };
        }
        networkManager.request('profiles:retrieve', filters, function (data) {
            var i = 0, len = data.length;
            console.log(data);
            while (i < len) {
                serviceModel.insert(data[i]);
                ++i;
            }
        });
    }

    globalEvents.addEventListener('login', function () {
        getProfilesFromServer();
    });

    return serviceModel;
});
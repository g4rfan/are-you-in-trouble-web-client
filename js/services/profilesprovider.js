/**
 * Created by garffan on 11/5/13.
 */


angular.module('helpdesk.service').service('profilesProvider', function (networkManager) {
    var serviceModel = {
        _storage : [],

        getProfiles : function () {
            return this._storage;
        },

        insert : function (data) {
            this._storage.push(data);
        },

        clean : function () {
            this._storage.length = 0;
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

    function getProfilesFromServer (getAll, params, callback) {
        var filters = {};
        if (getAll) {
            filters = { offset: 0, limit: 20, filters : { } };
        }

        if (params) {
            filters = params;
        }

        networkManager.request('profiles:retrieve', filters, function (data) {
            serviceModel.clean();
            var i = 0, len = data.length;
            while (i < len) {
                serviceModel.insert(data[i]);
                ++i;
            }
            if (callback) {
                callback(data);
            }
        });
    }

    globalEvents.addEventListener('login', function () {
        getProfilesFromServer();
    });

    return serviceModel;
});
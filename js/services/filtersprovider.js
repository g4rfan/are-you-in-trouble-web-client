/**
 * Created with JetBrains WebStorm.
 * User: garffan
 * Date: 10/24/13
 * Time: 7:43 PM
 * To change this template use File | Settings | File Templates.
 */


angular.module('helpdesk.service').service('filtersProvider', function (networkManager) {
    var serviceModel = {
        _storage : [],

        getFilters : function () {
            return this._storage;
        },

        insert : function (data) {
            this._storage.push(data);
        },

        save : function (data) {
            var self = this;
            networkManager.emit('filter:save', function (data) {
                self.insert(data);
            });
        },

        getFiltersFromServer : getFiltersFromServer,

        events : new EventEmitter({
            'filters set changed' : []
        })
    };

    function getFiltersFromServer() {
        networkManager.request('university departments:retrieve', function(data) {
            var i = 0, len = data.length;
            while (i < len) {
                var color = 'rgb(' + getRandomInt(125, 255) + ',' + getRandomInt(125, 255) + ',' + getRandomInt(125, 255) + ')';
                data[i].color = color;
                serviceModel.insert(data[i]);
                ++i;
            }
        });
    }

   /* var i = 0, len = 10;
    while (i < len) {
        serviceModel.insert({
            id : i,
            color : 'rgb(' + getRandomInt(125, 255) + ',' + getRandomInt(125, 255) + ',' + getRandomInt(125, 255) + ')',
            name : 'ФК' + i
        });
        ++i;
    }
*/
    networkManager.on('filter:added', function (data) {
        serviceModel.insert(data);
    });

    return serviceModel;
});
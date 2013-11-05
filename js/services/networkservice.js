/**
 * Created by garffan on 10/2/13.
 */

angular.module('helpdesk.service').service('networkManager', function () {
    var _socket = null;

    globalEvents.addEventListener('login', function () {
        _socket = io.connect(window.location.origin + '/');
        if (_socket) {
            _socket.on('err', function (data) {
                console.log(data);
            });
        }
    });

    function getSocket() {
        return _socket;
    }

    return {
        request: function (signalName, data, callback) {
            if (getSocket()) {
                getSocket().emit(signalName, data, callback);
            } else {
                console.log('Connection was not established');
            }
        },

        on: function (singnalName, callback) {
            if (getSocket()) {
                getSocket().on(singnalName, callback);
            } else {
                console.log('Connection was not established');
            }
        }
    }
});
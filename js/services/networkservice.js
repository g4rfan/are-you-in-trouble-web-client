/**
 * Created by garffan on 10/2/13.
 */

angular.module('helpdesk.service').service('networkManager', function () {
    var _socket = null;

    globalEvents.addEventListener('login-con', function () {
        _socket = io.connect(window.location.origin + '/', { 'force new connection' : true, reconnect : true });
        if (_socket) {
            setTimeout(function() { globalEvents.fire('login'); }, 50);
            _socket.on('err', function (data) {
                if (typeof data != 'string') {
                    showError('Ошибка : ' + properties[data.errors[0].property] + ' ' + data.errors[0].message);
                } else {
                    console.log('ERFRB');
                }
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
/**
 * Created by garffan on 10/2/13.
 */
io = { connect : function(){ return { emit : function() { }, on : function(){ } } } };
angular.module('helpdesk.service', []).
    value('networkManager', {
        _socket : io.connect(window.location.origin + '/'),
        request : function(signalName, data, callback){
            if(this._socket){
               this._socket.emit(signalName, data, callback);
            }else{
                console.log('Connection was not established')
            }
        },

        on : function(singnalName, callback){
            this._socket.on(singnalName, callback);
        }
    });
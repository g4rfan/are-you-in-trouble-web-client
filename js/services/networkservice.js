/**
 * Created by garffan on 10/2/13.
 */
//io = { connect : function(){ return { emit : function() { }, on : function(){ } } } };
angular.module('helpdesk.service',[]).service('networkManager', function(){
        var _socket = null;

        globalInitSocket = function(){
            _socket = io.connect(window.location.origin + '/');
        };

        function getSocket(){
            return _socket;
        }

        return {
            request : function(signalName, data, callback){
                if(getSocket()){
                   getSocket().emit(signalName, data, callback);
                }else{
                    console.log('Connection was not established');
                }
            },

            on : function(singnalName, callback){
                if(getSocket()){
                    getSocket().on(singnalName, callback);
                }else{
                    console.log('Connection was not established');
                }
            }
        }
    });
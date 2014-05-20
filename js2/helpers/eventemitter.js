/**
 * Created by garffan on 10/25/13.
 */


var EventEmitter = function (events) {
    this._events = events;

    this.fire = function(eventName, data) {
        var subscribers = this._events[eventName];
        for (var i = 0; i < subscribers.length; ++i) {
            subscribers[i](data);
        }
    };

    this.addEventListener = function(eventName, action) {
        if (eventName in this._events) {
            this._events[eventName].push(action);
        }
    };
};
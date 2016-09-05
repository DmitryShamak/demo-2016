var CustomEvents = function CustomEvents() {
    this.events = {};
};
CustomEvents.prototype.subscribe = function(eventName, callback) {
    if(!this.events[eventName]) {
        this.add(eventName);
    }

    this.events[eventName].subscribers.push(callback);
};
CustomEvents.prototype.fire = function(eventName, data) {
    var event = this.events[eventName];
    if(!event) {
        return "no such event";
    }
    event.subscribers.forEach(function(subscriber) {
        subscriber(data);
    });
};
CustomEvents.prototype.add = function(eventName) {
    if(this.events[eventName]) {
        return "event already exists";
    }

    this.events[eventName] = {
        subscribers: []
    }
};

module.exports = CustomEvents;
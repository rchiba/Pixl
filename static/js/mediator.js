if(typeof Pixl == 'undefined') Pixl = {};

Pixl.Mediator = (function(document){

    // constructor
    var mediator = function(){
        this.activeBoxId = "";
        this.channels = {};
        
        // listen to global keypress events, and broadcast a keypress event if necessary
        var that = this;
        $(document).bind('keydown', function(e) {
            that.publish( that.activeBoxId+':keypress', {e:e} ); 
        });
        
        
        // if a box is born, set it as the active box
        this.subscribe('born', function(args){
            this.activeBoxId = args['id'];
        }, this);
        
        // directs all changeState publishings to the last active box
        this.subscribe('changeState', function(args){
            this.publish(this.activeBoxId+':changeState', args);
            this.activeBoxId = args['id'];
        }, this);
        
    }

    
    
    // Subscribe to an event, supply a callback to be executed 
    // when that event is broadcast
    mediator.prototype.subscribe = function(channel, fn, cx){
        if (typeof this.channels[channel] == 'undefined') this.channels[channel] = [];
        this.channels[channel].push({ context: cx, callback: fn });
        return this;
    };

    // Publish/broadcast an event to the rest of the application
    mediator.prototype.publish = function(channel){
        if (!this.channels[channel]) return false;
        var args = Array.prototype.slice.call(arguments, 1);
        
        for (var i = 0, l = this.channels[channel].length; i < l; i++){
            var subscription = this.channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }
        return this;
    };
    
    return mediator;

}(document));
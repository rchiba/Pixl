YUI.add('sensor', function(Y){

var Sensor;

// sensor coordinates all interactions between all movable components
Sensor = Y.Base.create('sensor', Y.Base, [], {

    initializer : function(cfg) {
        Y.log('initializing sensor', 'debug');
        
        // allDone - fired when entering total non-editing state
        this.publish('setState', {
            broadcast: 1,
            emitFacade: true
        });
        
        this.defineKeys();
        this.bindUI();
    },


    destructor : function() {
        Y.log('destroying sensor', 'debug');
    },
    
    // bind some event handlers to the sensor
    bindUI: function() {
    
        Y.log('binding sensor', 'debug');
        // attaching key events
        this.bindKeys();
        
        // attaching box events
        this.bindBoxes();
    },
    
    // attaches key events
    bindKeys: function(){
        Y.log('bindKeys', 'debug');
        
        //this.delegate("arrow", this.keyMove, 'document.body');
        
    },
    
    // this function must be called after every creation, to attach itself to newly created boxes
    bindBoxes: function(){
    
        var that = this;
        
        // removing previous handlers
        if(this.sub){
            this.sub.detach();
        }
        
        // subscribe to the events of all boxes
        
        // listen to the setState for updates
        this.sub = Y.after('box:setState',function(e){
            that.handleSetState(e);
        },this);
        
        // listen to the setState for updates
        this.sub = Y.after('picBox:setState',function(e){
            that.handleSetState(e);
        },this);
        
        // listen to the setState for updates
        this.sub = Y.after('audioBox:setState',function(e){
            that.handleSetState(e);
        },this);
        
        // listen to the setState for updates
        this.sub = Y.after('videoBox:setState',function(e){
            that.handleSetState(e);
        },this);
        
        
        
    },
    
    // handling of things having their state changing
    handleSetState: function(e){
        var that = this;
        Y.log('sensor has heard a state change to '+e.state+e.node);
            
        // set the old node to static
        if(that.get('nodesSelected')){
            if(that.get('nodesSelected') != e.node){
                // newly clicked node is not same as previously clicked node
                Y.log('handleSetState: setting '+e.node+' to static', 'debug');
                that.get('nodesSelected').setState('static');
            }
        }
        
        // set new as the one selected 
        Y.log('setting nodesSelected');
        that.set('nodesSelected', e.node);
    },
    
    // define key events
    defineKeys: function(){
        Y.log('defineKeys', 'debug');
        Y.Event.define("arrow", {
            // Webkit and IE repeat keydown when you hold down arrow keys.
            // Opera links keypress to page scroll; others keydown.
            // Firefox prevents page scroll via preventDefault() on either
            // keydown or keypress.
            _event: (Y.UA.webkit || Y.UA.ie) ? 'keydown' : 'keypress',

            _keys: {
                '37': 'left',
                '38': 'up',
                '39': 'right',
                '40': 'down'
            },

            _keyHandler: function (e, notifier) {
                if (this._keys[e.keyCode]) {
                    e.direction = this._keys[e.keyCode];
                    notifier.fire(e);
                }
            },

            on: function (node, sub, notifier) {
                sub._detacher = node.on(this._event, this._keyHandler,
                                        this, notifier);
            },

            detach: function (node, sub, notifier) {
                sub._detacher.detach();
            },

            delegate: function (node, sub, notifier, filter) {
                sub._delegateDetacher = node.delegate(this._event, this._keyHandler,
                                                      filter, this, notifier);
            },

            detachDelegate: function (node, sub, notifier) {
                sub._delegateDetacher.detach();
            }
        });
    },
    
    // triggered when key is heard
    keyMove: function(e){
    
        Y.log('keymove', 'debug');
        // to prevent page scrolling
        e.preventDefault();
        var that = this;
        
        Y.log(this);
        var x = this.nodesSelected.getX();
        var y = this.nodesSelected.getY();

        switch (e.direction) {
            case 'up':    y -= 8; break;
            case 'down':  y += 8; break;
            case 'left':  x -= 8; break;
            case 'right': x += 8; break;
        }

        this.transition({
            top : (y + 'px'),
            left: (x + 'px'),
            duration: .2
        });
    },
    
    // triggered by outside, to set all nodes to state
    broadcastState: function(myState){
        Y.log('sensor->broadcastState: '+myState);
        this.fire('setState',{state:myState});
    }
    
},{
ATTRS: {
    nodesSelected: {}
    }
});

Y.namespace("pixel").Sensor = Sensor;

}, "0.1", { requires: ['base', 'event'] });
YUI.add('environment', function(Y){

var Environment;

/*
 * Environment widget
 * Is in charge of changes to the environment
 * like when the grid appears
 */
 
Environment = Y.Base.create("environment", Y.Widget, [], {
    
    // nothing to be initialized so far
    initializer: function(config) {
        Y.log('initializing environment', 'debug');
        Y.log(config, 'debug');
    },
    
    // detach event handlers, etc.
    destructor: function(){
        Y.log('destructing', 'debug');
    },
    
    // this is overwritten by other classes
    renderUI: function() {
        Y.log('renderUI', 'debug');
        
    },
    
    // this is common among all classes
    bindUI: function(){
    
        // Add the event handlers
        
        Y.log('bindUI');
        var that = this;

        
        // listen to the setState for updates
        Y.after('sensor:setState',function(e){
            Y.log('heard sensor set me to '+e.state,'debug');
            that.setState(e.state);
        },that);
       
        
    },
    
    syncUI: function(){
        Y.log('syncUI');
        
    },
    
    // can be either move or done
    setState: function(state){
        Y.log('setting state to '+state);
        this.set('state',state);
        switch(state){
            case 'move':
                //this.destroyDD();
                this.hideDD();
                this.get('rBox').setAttribute('contentEditable', 'false');
                this.get('rBox').setStyle('opacity',this.get('opacity'));
            break;
            case 'done':
                Y.one('#demo').transition({
                    duration: 0.75,
                    easing: 'ease-out',
                    opacity: {
                        delay: 1.5,
                        duration: 1.25,
                        value: 0
                    }
                });
            break;
            default: 
                // do nothing
            break;
        }
    
    }

},{
ATTRS: {

        // state can be static or edit
        state: {
                value:'static',
                validator: Y.Lang.isString
        },
        strings: {
            value: {
                title:  'Latest Updates',
                error:  'Oops!  We had some trouble connecting to Twitter :('
            }
        },

        includeTitle: {
            value: true,
            validator: Y.Lang.isBoolean
        },
        
        // style things
        
        // opacity of static state
        opacity: {
            value: .7 // defaults to .7
        },
        
        defaultClass:{}
    }
});

Y.namespace('pixel').Environment = Environment;

}, "0.1", { requires: ['widget', 'substitute', 'jsonp', 'base', 'dd-constrain', 'resize'] });

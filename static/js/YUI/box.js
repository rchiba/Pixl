YUI.add('box', function(Y){

var Box;

/*
 * Textbox Widget
 * Used for editable widgetness
 */
 
Box = Y.Base.create("box", Y.Widget, [], {
    
    // nothing to be initialized so far
    initializer: function(config) {
        Y.log('initializing', 'debug');
        
        this.publish('setState', {
            broadcast: 1,
            emitFacade: true
        });
        
    },
    
    // detach event handlers, etc.
    destructor: function(){
        Y.log('destructing', 'debug');
    },
    
    // this is overwritten by other classes
    renderUI: function() {
        Y.log('renderUI', 'debug');
        
        var bBox = this.get('boundingBox');
        var cBox = this.get('contentBox');
        var rBox = Y.Node.create('<div>');
        
        rBox.setAttribute('contentEditable', 'true');
        rBox.addClass('boxRbox');
        rBox.setStyle('top',document.body.scrollTop); 
        if(this.get('defaultClass')){
            rBox.addClass(this.get('defaultClass'));
        }
        
        cBox.insert(rBox);
        this.set('rBox', rBox);
        this.set('bBox', bBox);
        
        this.initializeDD();
      
    },
    
    // this is common among all classes
    bindUI: function(){
    
        // Add the event handlers
        
        Y.log('bindUI');
        var that = this;

        // helper function for rBox
        that.bindRBox();

        // When clicked, set state to static
        that.get('bBox').get('parentNode').on('click', function(e){
            Y.log('bindUI: parent node clicked');
            if(that.get('state') !== 'done'){
                // block this listener if state is done
                that.setState('static');
            }
        });
        
        // listen to the setState for updates
        Y.after('sensor:setState',function(e){
            Y.log('heard sensor set me to '+e.state,'debug');
            that.setState(e.state);
        },that);
       
        
    },
    
    syncUI: function(){
        Y.log('syncUI');
        
    },
    
    // begin non-YUI functions
    isDraggable: function(){
        if(this.get('state')=='move'){
            return true
        }
        else{
            return false
        }
    },
    
    setState: function(state){
        Y.log('setting state to '+state);
        this.set('state',state);
        switch(state){
            case 'done':
                this.destroyDD();
                this.get('rBox').setAttribute('contentEditable', 'false');
                this.get('rBox').setStyle('opacity',this.get('opacity'));
            break;
            case 'static':
                //this.destroyDD();
                this.hideDD();
                this.get('rBox').setAttribute('contentEditable', 'false');
                this.get('rBox').setStyle('opacity',this.get('opacity'));
            break;
            case 'move':
                this.fire('setState',{state:'move',node:this});
                this.initializeDD();
                this.showDD();
                this.get('rBox').setAttribute('contentEditable', 'false');
                this.get('rBox').setStyle('opacity',this.get('opacity'));
            break;
            case 'edit':
                this.destroyDD();
                var o = parseFloat(this.get('rBox').getStyle('opacity'));
                this.get('rBox').setStyle('opacity',o+.2);
                this.get('rBox').setAttribute('contentEditable', 'true');
            break;
            default: 
                // do nothing
            break;
        }
    
    },
    
    initializeDD: function(){
    
        Y.log('initializing DD', 'debug');
        
        var rBox = this.get('rBox');
        var bBox = this.get('bBox')
        
        if(this.get('dd') == null){
            var dd = new Y.DD.Drag({
                node: rBox
            }).plug(Y.Plugin.DDConstrained, {
                constrain2node: bBox.get('parentNode'),
                tickX:8,
                tickY:8
            });
            this.set('dd',dd);
        }
        
        if(this.get('resize') == null){
            var resize = new Y.Resize({
                node:rBox
            }).plug(Y.Plugin.ResizeConstrained, {
                constrain: bBox.get('parentNode'),
                tickX:8,
                tickY:8
            });
            this.set('resize',resize);
        }
        
    },
    
    destroyDD: function(){
    
        Y.log('destroyingDD');
    
        if(this.get('dd') != null){
            this.get('dd').destroy();
            this.set('dd', null);
        }
        
        if(this.get('resize') != null){
            this.get('resize').destroy();
            this.set('resize', null);
        }
        
        this.bindRBox();
    },
    
    hideDD: function(){
        this.get('rBox').all('.yui3-resize-handles-wrapper').each(function(item){ 
            Y.log('checking display and inside is '+item.get('text').trim()+typeof item.get('text'), 'debug');
            if(item.get('text').trim()==''){
            // to fix a bug in IE
                Y.log('setting to display:none', 'debug');
                item.setStyle('display','none');
            }
        });
    },
    
    showDD: function(){
        this.get('rBox').all('.yui3-resize-handles-wrapper').each(function(item){
            item.setStyle('display','block');
        });
    },
    
    bindRBox: function(){
        Y.log('bindRBox', 'debug');
        
        var that = this;
        
        Y.one(that.get('rBox')).on('mousedown', function(e){
            Y.log('rBox click', 'debug');
            
            switch(that.get('state')){
                case  'static':
                    that.setState('move');
                    break;
            }
            e.stopPropagation();
        });
        
        Y.one(that.get('rBox')).on('click', function(e){
            // to prevent parent from hearing the click
            // because the parent causes state to change to static
            e.stopPropagation();
        });
       
        that.get('rBox').on('dblclick', function(e){
            Y.log('rBox dblclick', 'debug');
            if(that.get('state')!=='done'){
                that.setState('edit');
            }
            e.stopPropagation();
        });
        
    }

},{
ATTRS: {
        username: {},

        count: {
            value: 10,
            validator: Y.Lang.isNumber
        },
        
        // parent node to render within
        rBox: {},
        
        bBox: {},
        
        // YUI DD plugin
        dd:{
            value: null
        },
        
        // YUI Resize plugin
        resize:{
            value: null
        },
        
        
        // state can be static, move, or edit
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

Y.namespace('pixel').Box = Box;

}, "0.1", { requires: ['widget', 'substitute', 'jsonp', 'base', 'dd-constrain', 'resize'] });

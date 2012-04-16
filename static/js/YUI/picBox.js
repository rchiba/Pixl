YUI.add('picbox', function(Y){

var PicBox;

/*
 * PicBox Widget
 * Used for editable widgetness
 */
 
PicBox = Y.Base.create("picBox", Y.pixel.Box, [], {
    
    renderUI: function() {
        Y.log('renderUI', 'debug');
        
        var bBox = this.get('boundingBox');
        var cBox = this.get('contentBox');
        var rBox = Y.Node.create('<div>');
        var img = Y.Node.create('<img>');
        img.setAttribute('src',this.get('pic'));
        img.addClass('resizePic');
        img.setStyle('width','100%');
        rBox.addClass('picRbox'); 
        cBox.insert(rBox);
        rBox.insert(img);
        rBox.setStyle('top',document.body.scrollTop); 
        Y.on('contentready', function(){
            // trying to do post-load processing
            // not working
        }, '.resizePic');
        this.set('rBox', rBox);
        this.set('bBox', bBox);
        
        this.initializeDD();
      
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
        var that = this; 
        
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
                tickY:8,
                preserveRatio: true,
                minWidth: 50,
                minHeight: 50
            });
            this.set('resize',resize);
        }
        
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
            value: 1 // defaults to 1
        },
        
        // string url to image
        pic: {},
        
    }
});

Y.namespace('pixel').PicBox = PicBox;

}, "0.1", { requires: ['widget', 'substitute', 'jsonp', 'base', 'dd-constrain', 'resize'] });

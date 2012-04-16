YUI.add('audiobox', function(Y){

var AudioBox;

/*
 * audioBox Widget
 * Used to add an audio element
 */
 
AudioBox = Y.Base.create("audioBox", Y.pixel.Box, [], {
    
    renderUI: function() {
        Y.log('renderUI', 'debug');
        
        var bBox = this.get('boundingBox');
        var cBox = this.get('contentBox');
        var rBox = Y.Node.create('<div>');
        rBox.setStyle('top',document.body.scrollTop); 
        // including two audio sources for max compatibility
        var audio = Y.Node.create('<audio>');
        var mp3Source = Y.Node.create('<source>');
        var oggSource = Y.Node.create('<source>');
        mp3Source.setAttribute('type','audio/mpeg');
        oggSource.setAttribute('type','audio/ogg');
        mp3Source.setAttribute('src',this.get('mp3Src'));
        oggSource.setAttribute('src',this.get('oggSrc'));
        audio.setAttribute('controls','controls');
        audio.addClass('audioBox');

        audio.insert(mp3Source);
        audio.insert(oggSource);

        cBox.insert(rBox);
        rBox.addClass('audioRbox');
        rBox.insert(audio);
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
        
        // do not create a resize element
        
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
                title:  'Audio'
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
        
        // string url to audio
        mp3Src: {}, // for safari, IE
        oggSrc: {} // for firefox, opera
        
    }
});

Y.namespace('pixel').AudioBox = AudioBox;

}, "0.1", { requires: ['widget', 'substitute', 'jsonp', 'base', 'dd-constrain', 'resize'] });

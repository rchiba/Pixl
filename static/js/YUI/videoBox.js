YUI.add('videobox', function(Y){

var VideoBox;

/*
 * VideoBox Widget
 * Used for editable widgetness
 */
 
VideoBox = Y.Base.create("videoBox", Y.pixel.Box, [], {
    
    renderUI: function() {
        Y.log('renderUI', 'debug');
        
        var bBox = this.get('boundingBox');
        var cBox = this.get('contentBox');
        var rBox = Y.Node.create('<div>');
        var oBox = Y.Node.create('<div>'); // overlay box
        var vid = Y.Node.create('<iframe>');
        vid.setAttribute('src',this.parseVideoLink(this.get('videoLink')));
        vid.addClass('resizeVideo');
        rBox.addClass('videoRbox');
        rBox.setStyle('top',document.body.scrollTop); 
        oBox.addClass('videoObox');
        // SET CHANGE INSERTION POINT AND MESS WITH SIZE
        
        // cBox(container)
        // ->oBox(DD and resize)
        // ->rBox(style padding)
        // ->vid(iframe)
        cBox.insert(oBox);
        oBox.insert(rBox);
        rBox.insert(vid);
        this.set('oBox', oBox);
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
        var oBox = this.get('oBox');
        var bBox = this.get('bBox');
        var that = this; 
        
        if(this.get('dd') == null){
            var dd = new Y.DD.Drag({
                node: oBox
            }).plug(Y.Plugin.DDConstrained, {
                constrain2node: bBox.get('parentNode'),
                tickX:8,
                tickY:8
            });
            this.set('dd',dd);
        }
        
        if(this.get('resize') == null){
            var resize = new Y.Resize({
                node: oBox
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
        
    },
    
    // Changes urls like http://www.youtube.com/watch?v=Pd02Q-54wuQ to an url like http://www.youtube.com/embed/Pd02Q-54wuQ
    // eventually will support other video inputs (vimeo, people who paste iframe codes, etc)
    parseVideoLink: function(rawUrl){
        
        // validate as string
        if(typeof rawUrl !== 'string'){
            return '';
        }
        
        // add http if necessary
        if(!/^http:[\/]{2}/.test(rawUrl)){
            rawUrl = 'http://'+rawUrl;
        }
        
        var cleanUrl = '';
        
        // links to page http://www.youtube.com/watch?v=Pd02Q-54wuQ
        if(rawUrl.indexOf('watch?v=') !== -1){
            cleanUrl = rawUrl.replace('watch?v=', 'embed/');
        }
        // direct tinyurls to player http://youtu.be/Pd02Q-54wuQ
        else if(rawUrl.indexOf('youtu.be/') !== -1){
            cleanUrl = rawUrl.replace('youtu.be/','www.youtube.com/embed/');
        }
        
        // add wmode=opaque to allow overlay on iframe
        cleanUrl = cleanUrl + '?wmode=opaque';
        
        Y.log('parseVideoLink returning '+cleanUrl);
        
        return cleanUrl;
        
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
        
        // video element requires an overlay DD node
        oBox: {},
        
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
        
        // string url to video (this gets parsed)
        videoLink: {},
        
    }
});

Y.namespace('pixel').VideoBox = VideoBox;

}, "0.1", { requires: ['widget', 'substitute', 'jsonp', 'base', 'dd-constrain', 'resize'] });

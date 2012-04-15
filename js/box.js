if(typeof Pixl == 'undefined') Pixl = {};

// Box is a general box, meant to communicate via the mediator to the other boxes
Pixl.Box = (function(){

    // the state of the box (done, edit, move)
    /*
    inactive - box is ready but is not the currently selected one
    edit - box contents are being edited, not draggable or resizable
    move - box is draggable and resizable, but contents not editable
    static - box is not editable 
    */
    
    // constructor
    var module = function(med, p){
        this.parent = p;
        this.m = med;
        this.id = Pixl.Helpers.genHash();
        this.state = 'move';
        this.content = ''; // the markdown is stored here
        this.contentHolder = '' // the dom element that has will be contentEditable
    }

    module.prototype.handleChangeStateSub = function( arg ){
        console.log(this.id+': changeState subscription with '+arg.id+' '+arg.state);
    
        var listenID = arg.id;
        var listenState = arg.state;
        
        // another box sent this message
        if(listenID != this.id){
            switch(listenState){
                case 'inactive':
                    break;
                case 'edit':
                    this.setState('inactive');
                    break;
                case 'move':
                    this.setState('inactive');
                    break;
                case 'static':
                    break;
                default:
            }
        }
        
        if(listenID == 'global'){
            this.setState(listenState);
        }
    }
    
    module.prototype.init = function(){
    
        console.log(this.id+': born');
        
        this.renderUI();
        this.bindUI();
        this.makeEditable();
        
        // Subscribe to an event called 'changeState' with
        // a callback function which will run when itself or 
        // others change state

        this.m.subscribe(this.id+':changeState', this.handleChangeStateSub, this);
        this.m.subscribe('global:changeState', this.handleChangeStateSub, this);
        
        this.m.subscribe(this.id+':keypress', function( arg ){
            if(this.state !== 'edit'){
                var e = arg.e;
                var code = e.keyCode || e.which;
                switch(code){
                    case 33: // page up
                        e.preventDefault();
                        $( "#"+this.id ).css('z-index', parseInt($( "#"+this.id ).css('z-index'))+1);
                        break;
                    case 34: // page down
                        e.preventDefault();
                        $( "#"+this.id ).css('z-index', parseInt($( "#"+this.id ).css('z-index'))-1);
                        break;
                    case 37: // left arrow
                        e.preventDefault();
                        var newLeft = $( "#"+this.id ).position().left-10;
                        $( "#"+this.id ).css('left', newLeft);
                        break;
                    case 38: // up arrow
                        e.preventDefault();
                        var newTop = $( "#"+this.id ).position().top-10;
                        $( "#"+this.id ).css('top', newTop);
                        break;
                    case 39: // right arrow
                        e.preventDefault();
                        var newLeft = $( "#"+this.id ).position().left+10;
                        $( "#"+this.id ).css('left', newLeft);
                        break;
                    case 40: // down arrow
                        e.preventDefault();
                        var newTop = $( "#"+this.id ).position().top+10;
                        $( "#"+this.id ).css('top', newTop);
                        break;
                    case 46: // delete
                        e.preventDefault();
                        this.destroy();
                        break;
                    default:
                        break;
                }
            }
        }, this);
        
        
        
        this.setState('move');
        
        // tell mediator that I have been created
        this.m.publish('born', {'id':this.id});
        
    }
    
    module.prototype.renderUI = function(){
        var box = $("<div>");
        box.attr('id', this.id);
        box.attr('class', 'contrast dropShadow');
        var contentEditor = $("<textarea>");
        contentEditor.attr('class', 'contentEditor');
        var contentHolder = $("<div>");
        contentHolder.attr('class', 'contentHolder');
        box.append(contentEditor);
        box.append(contentHolder);
        box.css('display','none');
        this.parent.append(box);
        box.fadeIn();
    }
    
    
    module.prototype.bindUI = function(){
        //$( "#"+this.id ).unbind();
        var that = this;
        $( "#"+this.id ).dblclick(this.handleDblClick.bind(that));
        $( "#"+this.id ).click(function(){
            if(that.state !== 'static' && that.state !== 'edit'){
                that.setState('move');
                $( "#"+this.id ).find('.contentHolder').focus();
            }
        });
        $( "#"+this.id ).mousedown(function(e){
            if(that.state !== 'move' && that.state !== 'static' && that.state !== 'edit'){
                that.setState('move');
                $( "#"+that.id ).trigger(e);
            }
        });
        
    }
    
    module.prototype.destroy = function(){
        $( "#"+this.id ).unbind();
        $( "#"+this.id ).remove();
    }
    
    module.prototype.handleDblClick = function(e){
        if(this.state !== 'static'){
            e.preventDefault();
            this.setState('edit');
        }
    }

    module.prototype.makeEditable = function(){
        console.log(this.id+': makeEditable');
        $( "#"+this.id ).draggable({
            containment: '#'+this.parent.attr('id'),
            grid: [ 10,10 ],
            scroll: true,
            disabled: false
        });
        $( "#"+this.id ).resizable({
            containment: '#'+this.parent.attr('id'),
            grid:10,
            handles: 'n, e, s, w, ne, se, sw, nw',
            disabled: false
        });
    }
    
    module.prototype.makeContentEditable = function(){
        $( "#"+this.id ).find('.contentHolder').fadeOut();
        $( "#"+this.id ).find('.contentEditor').fadeIn();
        $( "#"+this.id ).find('.contentEditor').focus();
        $( "#"+this.id ).find('.contentEditor').val(this.contents);
    }
    
    module.prototype.makeContentUnEditable = function(){
        $( "#"+this.id ).find('.contentEditor').fadeOut();
        $( "#"+this.id ).find('.contentHolder').fadeIn();
        this.contents = $( "#"+this.id ).find('.contentEditor').val();
        var markdown = new Markdown.Converter();
        console.log(this.contents);
        console.log(markdown.makeHtml(this.contents));
        $( "#"+this.id ).find('.contentHolder').html(markdown.makeHtml(this.contents));
        $( "#"+this.id ).find('.contentHolder').blur();
    }
    
    module.prototype.makeStatic = function(){
        $( "#"+this.id ).draggable({ disabled: true });
        $( "#"+this.id ).resizable({ disabled: true });
    }
    
    
    module.prototype.setState = function(myState){
        console.log(this.id+': setState '+myState);
        
        // things that happen on state transitions
        if(this.state === 'edit' && myState !== 'edit'){
            // save contents and replace with generated html if going from edit to other
            this.makeContentUnEditable();
            
        } else if(this.state !== 'edit' && myState === 'edit'){
            // retrieve contents and replace the text with markdown contents if going into edit
            this.makeContentEditable();
            
        }
        
        this.state = myState
        switch(this.state){
            case 'inactive':
                this.bindUI();
                this.makeStatic();
                break;
            case 'edit':
                this.makeStatic();
                break;
            case 'move':
                this.makeEditable();
                break;
            case 'static':
                this.makeStatic();
                break;
            default:
                break;
        
        }
        
        // Publish/Broadcast the 'changeState' event with the new data
        // mediator is in charge of directing subscription fire to older active box
        this.m.publish( 'changeState', {'state':myState, 'id':this.id} ); 
    }
    
    return module;
    
})();

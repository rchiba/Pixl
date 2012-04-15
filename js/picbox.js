if(typeof Pixl == 'undefined') Pixl = {};

Pixl.PicBox  = (function (box) {
	
    // PicBox augments the box object
    var module = function(m, p, myImg){
        this.base = box;
        this.base(m, p);
        this.img = myImg;
    }
    module.prototype = new box;
    
    module.prototype.renderUI = function(){
        
        var box = $("<div>");
        box.attr('id', this.id);
        box.attr('class', 'contrast dropShadow');
        
        
        
        
        var image = new Image();
        var that = this;
        image.onload = function() {
            var height = this.height;
            var width = this.width;
            that.height = height;
            that.width = width;
            console.log(width+' '+height);
            box.css('height',that.getImgDimensions()['height']+'px');
            box.css('width',that.getImgDimensions()['width']+'px');
            console.log('box loaded');
            that.makeEditable();
        }
        image.src = this.img;
        image.className += ' picBoxImg';
        
        var contentHolder = $("<div>");
        contentHolder.attr('class', 'imgHolder');
        contentHolder.html('<a class="fancyBoxImg" href="'+this.img+'"></a>');
        contentHolder.find('a').append($(image));
        box.append(contentHolder);
        box.css('display','block');
        box.css('padding','0px');
        this.parent.append(box);
    }
    
    
    module.prototype.bindUI = function(){
        //$( "#"+this.id ).unbind();
        var that = this;
        //$( "#"+this.id ).dblclick(this.handleDblClick.bind(that));
        $( "#"+this.id ).click(function(){
            if(that.state !== 'static' && that.state !== 'edit'){
                that.setState('move');
            }
        });
        $( "#"+this.id ).mousedown(function(e){
            if(that.state !== 'move' && that.state !== 'static' && that.state !== 'edit'){
                that.setState('move');
                $( "#"+that.id ).trigger(e);
            }
        });
        
        $("a.fancyBoxImg").fancybox({
            'transitionIn'	:	'fade',
            'transitionOut'	:	'fade',
            'speedIn'		:	300, 
            'speedOut'		:	200,
            'overlayColor'  :   '#000',
            'onStart': function(e){
                if(that.state !== 'static'){
                    return false;
                }
            }
        });
        
    }
    
    // settings for the draggable resizable are slightly different
    module.prototype.makeEditable = function(){
        // only allow makeEditable after this.height is set
        if(typeof this.height !== 'undefined'){
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
                aspectRatio: this.getImgDimensions()['width'] / this.getImgDimensions()['height'],
                disabled: false
            });
            console.log('aspect ratio is '+this.getImgDimensions()['width'] / this.getImgDimensions()['height']);
        }
    }
    
    module.prototype.getImgDimensions = function(){
        return {
            'height':Math.round(this.height/10)*10,
            'width':Math.round(this.width/10)*10
        }
    }
	
	return module;
}(Pixl.Box));
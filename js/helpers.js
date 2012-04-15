// helper functions to put in the Pixl namespace, and other things that we initialize Pixl with

if(typeof Pixl == 'undefined') Pixl = {};

Pixl.Helpers = {};

// used to create a unique id for each div
Pixl.Helpers.genHash = function(){
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

Pixl.boxes = {}; // all the box elements on the page, as key (id) value (obj)


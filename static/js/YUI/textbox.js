/*
 * TextBox Widget
 * Used for editable widgetness
 */
 
function TextBox(config){
    TextBox.superclass.constructor.apply(this,arguments);
}

TextBox.NAME = "textBox";

// Vars
TextBox.ATTRS = {

    // the state of the textbox
    // can be display, move, or text
    state: {
        value:'display'
    }
   
    // strings to render on hover
    strings: {
        value: {
            tooltip: "Some hotkey tips here"
        }
    }

};

// Methods
Y.extend(TextBox, Box, {



});
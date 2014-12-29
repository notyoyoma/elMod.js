(function($){
  /* private variables */
  var ElMod = function() {};
  var options = {
    ATTR: "data-modifies",
    COLCOUNT: 12,
    COLCLASS: "col-xs-",
    FONTS: [ "Arial", "Comic Sans MS", "Courier", "Geneva", "Georgia", "Helvetica", "Impact",
      "Lucida Console", "Lucida Sans Unicode", "Palatino Linotype", "Times New Roman", "Trebuchet MS", "Verdana"],
  };
  options.types = {
    '_select': function($this, property, opts) {
      if (!opts && !opts.options) return 'error: _select needs options.';
      var tmpl = $('<select>')
          i = 0;
      for (i; i < options.FONTS.length; i += 1) {
        tmpl.append('<option>'+options.FONTS[i]+'</option>');
      }
      tmpl.val($this.css(property));
      tmpl.change(function() {
        $this.css(property, $(this).val());
      });
      return tmpl;
    },
    'dimension': function($this, property, opts) {
      var tmpl = $('<div>'+opts.label+':</div>');
      tmpl.append($('<input type="number">'));
      tmpl.append($('<select><option>px</option><option>%</option><option>em</option><option>rem</option></select>'));
      tmpl.find('input').val(parseInt($this.css(property)));
      tmpl.find('select').val($this.css(property).replace(/\d/g, ''));
      tmpl.find('input, select').on( 'change keyup keypress', function() {
        $this.css(property, tmpl.find('input').val()+tmpl.find('select').val());
      });
      return tmpl;
    },
    'color': function($this, property, opts) {
      var tmpl = $('<input type="text" placeholder="'+opts.label+'">');
      tmpl.val($this.css(property));
      tmpl.css('background', tmpl.val());
      tmpl.on('keypress keyup change blur', function() {
        $this.css(property, $(this).val());
        $(this).css('background', $(this).val());
      });
      return tmpl;
    },
    'text': function($this) {
      var tmpl = $('<input type="text">');
      tmpl.val($this.deepestChild().first().text());
      tmpl.on('change keyup', function() {
        $this.deepestChild().first().text($(this).val());
      });
      return tmpl;
    },
    'text-align': function($this) {
      var tmpl = $('<div>');
      tmpl.append($('<input type="radio" name="text-align" id="left"><label for="left">Left</label>'));
      tmpl.append($('<input type="radio" name="text-align" id="center"><label for="center">Center</label>'));
      tmpl.append($('<input type="radio" name="text-align" id="right"><label for="right">Right</label>'));
      var init_val = tmpl.find('#'+$this.css('text-align'));
      if (!init_val.length) init_val = tmpl.find('input').first();
      init_val.attr('checked', true);
      tmpl.find('input').change(function() {
        $this.css('text-align', $(this).attr('id'));
      });
      return tmpl;
    },
    'vertical-align': function($this) {
      if ($this.css('display') !== "table") {
        var content = $this.text();
        $this.empty();
        $this.css('display', 'table');
        $this.append('<div style="display:table-row"><div style="display:table-cell" class="v-align-table-cell">'+content+'</div></div>')
      }
      var tmpl = $('<div>');
      tmpl.append($('<input type="radio" name="vertical-align" id="top"><label for="top">Top</label>'));
      tmpl.append($('<input type="radio" name="vertical-align" id="middle"><label for="middle">Middle</label>'));
      tmpl.append($('<input type="radio" name="vertical-align" id="bottom"><label for="bottom">Bottom</label>'));
      var init_val = tmpl.find('#'+$this.css('text-align'));
      if (!init_val.length) init_val = tmpl.find('input').first();
      init_val.attr('checked', true);
      tmpl.find('input').change(function() {
        $this.find('.v-align-table-cell').css('vertical-align', $(this).attr('id'));
      });
      return tmpl;
    },
  };
  /* Supported CSS properties
      Text:
        text-align,font-size,font-family,font-weight,font-style,text-transform,
        text-decoration,letter-spacing,word-spacing,line-height,white-space
      Background:
        background-color,background-image,background-repeat,background-position,
        background-attachment
      Dimensions:
        width,height
        Padding:
          padding-top,padding-right,padding-bottom,padding-left
        Margin:
          margin-top,margin-right,margin-bottom,margin-left
      Position:
        position,top,right,bottom,left,z-index,float,clear
      Border:
        border-top-width,border-right-width,border-bottom-width,
        border-left-width,border-top-color,border-right-color,
        border-bottom-color,border-left-color,border-top-style,
        border-right-style,border-bottom-style,border-left-style
      Display:
        display,visibility,opacity
      Misc:
        vertical-align,overflow-x,overflow-y,clip,cursor,
        list-style-image,list-style-position,list-style-type,marker-offset
   */
  options.propertyMap = {
    'background-color':  { type: options.types['color'] },
    'border-color':      { type: options.types['color'] },
    'color':             { type: options.types['color'], opts: {label: "Text Color"} },
    'font-family':       { type: options.types['_select'], opts: {label: "Font", options: options.FONTS} },
    'font-size':         { type: options.types['dimension'] },
    'height':            { type: options.types['dimension'] },
    'margin':            { type: options.types['dimension'] },
    'padding':           { type: options.types['dimension'] },
    'text':              { type: options.types['text'] },
    'text-align':        { type: options.types['text-align'] },
    'vertical-align':    { type: options.types['vertical-align'] },
    'width':             { type: options.types['dimension'] },
  };
  
  /* private class */
  ElMod.prototype = {
    constructor: ElMod,
      /* Create a form in jQuery, and store it on the elemnt
       *
       * *arr* expected structure:
       *  [
       *    { title: "Image", fields: $('<div>...</div>') },
       *    { title: "Align", fields: ["text-align", "vertical-align"],
       *    { title: "Advanced", fields: ["transform", "box-shadow", "border-radius"], hidden: true }
       *  ]
       *
       * Each element of parent array becomes a fieldset
       * [i].title becomes the title of the fieldset
       * [i].fields become the list of fields in the fiedlset
       * [i].hidden collapses the fieldset, the user can click to expand it.
       */
    initForm: function(arr, $this) {
      this.form = $('<form>');
      var colClass = options.COLCLASS + Math.floor(options.COLCOUNT / arr.length);
      for (var i = 0; i < arr.length; i += 1) {
        var cur = arr[i],
            fieldset = $('<fideldset style="position:relative;display:block;">').append($('<legend>'+cur.title+'</legend>')),
            row = $('<div class="row"></div>');
        // Setup expanding functionality
        if (cur.hidden) {
          fieldset.append('<span class="indicator" style="position:absolute;top:-0;right:1em;">+</span>');
          fieldset.click(function() {
            var $this = $(this),
                target = $this.find('.row'),
                indicator = $this.find('.indicator');
            // Prevent rapid clicking bugs
            if ($this.moving) return;
            $this.moving = true;
            // Toggle indicator +/-
            indicator.text( target.is(':visible') ? '+' : '-' );
            // Animate slide
            target.slideToggle(300, function() {$this.moving=false;});
          });
          row.hide();
        }
        for (var j = 0; j < cur.fields.length; j += 1) {
          var property = cur.fields[j];
          if (typeof property === "string") {
            var mapped = options.propertyMap[property];
            if (mapped) {
              var optOverrides = {};
              if (!mapped.opts || !mapped.opts.label) {
                // if the opt.label is not set, generate a label based on @property
                optOverrides.label = property.replace('-', ' ').trim().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
              }
              var opts = $.extend({}, mapped.opts, optOverrides);
              // Get the form elements for @property
              property = mapped.type($this, property, opts);
            } else {
              property = property + " has not been setup in ElMod.js.";
            }
          }
          row.append( $('<div class="'+colClass+'">').append(property) );
        }
        this.form.append(fieldset.append(row));
      }
    },
    getForm: function() {return this.form;},
  };

  /* public functions */

  // set options
  $.ElMod = function() {
    return {
      setOpts: function(opts) {
        $.extend(true, options, opts);
      }
    };
  }
  // init form
  $.fn.elModInit = function(structure) {
    var $this = $(this),
        mod = new ElMod;
    mod.initForm(structure, $this);
    $this.data('ElMod', mod);
  }
  // get form
  $.fn.elModGet = function() {
    var $this = $(this);
    if (!$this.data('ElMod')) return "Error: no form has been setup to modify this element";
    return $this.data('ElMod').getForm();
  };

  // Deepest Child function
  $.fn.deepestChild = function() {
    if ($(this).children().length==0)
      return $(this);

    var $target = $(this).children(),
        $next = $target;

    while( $next.length ) {
      $target = $next;
      $next = $next.children();
    }

    return $target;
  };
  
})(jQuery);

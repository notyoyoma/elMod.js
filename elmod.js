(function($){
  /* private variables */
  var ElMod = function() {};
  var options = {
    ATTR: "data-modifies",
    COLCOUNT: 12,
    COLCLASS: "col-xs-",
    FONTS: [ "Arial", "Comic Sans MS", "Courier", "Geneva", "Georgia", "Helvetica", "Impact",
      "Lucida Console", "Lucida Sans Unicode", "Palatino Linotype", "Times New Roman", "Trebuchet MS", "Verdana"],
    UNITS: [ "px", "%", "em", "rem" ],
  };
  options.types = {
    '_dimension': function($this, property, opts) {
      var units = (opts && opts.units) ? opts.units : options.UNITS,
          tmpl = elBuild.dimension(units);
      tmpl.find('input').val(parseInt($this.css(property)));
      tmpl.find('select').val($this.css(property).replace(/\d/g, ''));
      tmpl.find('input, select').on( 'change keyup keypress', function() {
        var unit = (units.length > 1) ? tmpl.find('select').val() : units;
        $this.css(property, tmpl.find('input').val()+unit);
      });
      return tmpl;
    },
    '_select': function($this, property, opts) {
      if (!opts && !opts.options) return 'error: _select needs options.';
      var tmpl = elBuild.select(opts.options);
      tmpl.val($this.css(property).replace(/['"]/g,''));
      tmpl.change(function() {
        $this.css(property, $(this).val());
      });
      return tmpl;
    },
    '_radio': function($this, property, opts) {
      if (!opts && !opts.options) return 'error: _radio needs options.';
      var tmpl = elBuild.radio(property, opts.options),
          init_val = tmpl.find('#'+$this.css('text-align'));
      if (!init_val.length) init_val = tmpl.find('input').first();
      init_val.attr('checked', true);
      tmpl.find('input').change(function() {
        $this.css('text-align', $(this).attr('id'));
      });
      return tmpl;
    },
    '_url': function($this, property, opts) {
      var tmpl = $('<input type="text">');
      tmpl.change(function() {
        $this.css(property, 'url('+$(this).val()+')');
      });
      return tmpl;
    },
    'color': function($this, property, opts) {
      var tmpl = $('<input type="text">');
      tmpl.val($this.css(property));
      tmpl.on('keyup change blur', function() {
        $this.css(property, $(this).val());
        $(this).css({
          'background': $(this).val(),
          'color': helpers.invertColor($(this).val())
        });
      });
      tmpl.trigger('change');
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
    'vertical-align': function($this, property, opts) {
      if ($this.css('display') !== "table") {
        var content = $this.text();
        $this.empty();
        $this.css('display', 'table');
        $this.append('<div style="display:table-row"><div style="display:table-cell" class="v-align-table-cell">'+content+'</div></div>')
      }
      var tmpl = elBuild.radio(property, ['top', 'middle', 'bottom']),
          init_val = tmpl.find('#'+$this.css('text-align'));
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
        background-color,background-image,background-repeat, TODO >> background-position,
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
    'background-color':    { type: options.types['color'] },
    'background-image':    { type: options.types['_url'] },
    'background-repeat':   { type: options.types['_select'], opts: {options: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y']} },
    'border-color':        { type: options.types['color'] },
    'color':               { type: options.types['color'], opts: {label: "Text Color"} },
    'font-family':         { type: options.types['_select'], opts: {options: options.FONTS} },
    'font-size':           { type: options.types['_dimension'] },
    'font-style':          { type: options.types['_select'], opts: {options: [ 'normal', 'italic', 'oblique' ] }, },
    'font-weight':         { type: options.types['_select'], opts: {options: [ 'lighter', 'normal', 'bold' ] }, },
    'height':              { type: options.types['_dimension'] },
    'letter-spacing':      { type: options.types['_dimension'], opts: {units: ['px']} },
    'line-height':         { type: options.types['_dimension'] },
    'margin':              { type: options.types['_dimension'] },
    'padding':             { type: options.types['_dimension'] },
    'text':                { type: options.types['text'] },
    'text-align':          { type: options.types['_radio'], opts: {options: ['left', 'center', 'right']} },
    'text-transform':      { type: options.types['_select'], opts: {options: [ 'none', 'uppercase', 'bold' ] }, },
    'text-decoration':     { type: options.types['_select'], opts: {options: [ 'none', 'underline', 'line-through', 'overline' ] }, },
    'vertical-align':      { type: options.types['vertical-align'] },
    'width':               { type: options.types['_dimension'] },
    'white-space':         { type: options.types['_select'], opts: {options: ['normal', 'nowrap', 'pre']} },
    'word-spacing':        { type: options.types['_dimension'], opts: {units: ['px']} },
  };

  /* private classes */
  var helpers = {
    parseLabel: function(property, opts) {
      if (opts && opts.label) {
        // Use label override if provided
        return opts.label;
      } else {
        // if the opt.label is not set, generate a label based on @property
        return property.replace('-', ' ').trim().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      }
    },
    invertColor: function(str) {
      if (str.match(/^#[0-9a-fA-F]{6}$/) != null) {
        return helpers.invertColorHex(str);
      } else if (str.match(/^#[0-9a-fA-F]{3}$/) != null) {
        fullHex = str.replace(/[0-9a-fA-F]/g, function(x){return ''+x+x;});
        return helpers.invertColorHex(fullHex);
      } else if (str.match(/^rgb\(([0-9]{1,3}, *){2}[0-9]{1,3}\)/) != null) {
        var rgbBits = str.split('(')[1].split(')')[0].split(',');
        var hexBits = rgbBits.map(function(x) {
          x = parseInt(x).toString(16);      //Convert to a base16 string
          return (x.length==1) ? "0"+x : x;  //Add zero if we get only one character
        });
        var hex = '#'+hexBits.join('');
        return helpers.invertColorHex(hex);
      } else if (str.match(/^rgba\(([0-9]{1,3}, *){3}[0-9]{1,3}\)/) != null) {
        return helpers.invertColor(str.replace('rgba', 'rgb').replace(/, *[0-9.]+\)$/, ')'));
      }
    },
    invertColorHex: function(hex) {
      var color = hex;
      color = color.substring(1);           // remove #
      color = parseInt(color, 16);          // convert to integer
      color = 0xFFFFFF ^ color;             // invert three bytes
      color = color.toString(16);           // convert to hex
      color = ("000000" + color).slice(-6); // pad with leading zeros
      color = "#" + color;                  // prepend #
      return color;
    }
  };

  var elBuild = {
    fieldset: function(legend, hidden) {
      var fieldset = $('<fideldset style="position:relative;display:block;">');
      if (legend) {
        fieldset.append($('<legend>'+legend+'</legend>'));
        var legend = fieldset.find('legend');
        legend.addClass(hidden ? 'elmod-closed' : 'elmod-open');
        legend.click(function() {
          var $this = $(this),
              target = $this.parent().find('.row');
          // Prevent rapid clicking bugs
          if ($this.moving) return;
          $this.moving = true;
          // Toggle indicator +/-
          var isHidden = target.is(':visible');
          $this.toggleClass('elmod-open', !isHidden);
          $this.toggleClass('elmod-closed', isHidden);
          // Animate slide
          target.slideToggle(300, function() {$this.moving=false;});
        });
      }
      return fieldset;
    },
    row: function($this, fields) {
      var row = $('<div class="row"></div>'),
          colClass = options.COLCLASS + Math.floor(options.COLCOUNT / fields.length);
      for (var i = 0; i < fields.length; i += 1) {
        row.append( $('<div class="'+colClass+'">').append(elBuild.field($this, fields[i])) );
      }
      return row;
    },
    field: function($this, property) {
      if (typeof property === "string") {
        var mapped = options.propertyMap[property];
        if (mapped) {
          var tmpl = $('<div class="elmod-field">');
          var opts = $.extend({}, mapped.opts, { label: helpers.parseLabel(property, mapped.opts) });
          // Get the label for @property
          tmpl.append($('<label>'+opts.label+'</label>'));
          // Get the form elements for @property
          tmpl.append(mapped.type($this, property, opts));
          return tmpl;
        } else {
          return property + " has not been setup in ElMod.js.";
        }
      } else if (property instanceof jQuery) {
        return property;
      } else {
        return "error: "+property+" is not the correct format for ElMod.js";
      }
    },
    dimension: function(units) {
      var tmpl = $('<div>');
      tmpl.append($('<input type="number">'));
      if (units.length > 1) {
        tmpl.append(elBuild.select(units));
      } else {
        tmpl.append('<span class="elmod-static-unit">'+units+'</span>');
      }
      return tmpl;
    },
    select: function(options) {
      var tmpl = $('<select>');
      for (var i = 0; i < options.length; i += 1) {
        tmpl.append('<option value="'+options[i]+'">'+options[i]+'</option>');
      }
      return tmpl;
    },
    radio: function(property, options) {
      var tmpl = $('<div>');
      for (var i = 0; i < options.length; i +=1 ) {
        var id = options[i];
        var str = '<input type="radio" name="'+property+'" id="'+id+'">';
        str += '<label for="'+id+'">'+id.replace(/^[a-z]/, function(s){return s.toUpperCase();})+'</label>';
        tmpl.append($(str));
      }
      return tmpl;
    }
  };

  ElMod.prototype = {
    constructor: ElMod,
      /* Create a form in jQuery, and store it on the elemnt
       *
       * *fieldsets* expected structure:
       *  [
       *    { legend: "Image", fields: $('<div>...</div>') },
       *    { legend: "Align", fields: ["text-align", "vertical-align"],
       *    { legend: "Advanced", fields: ["transform", "box-shadow", "border-radius"], hidden: true }
       *    { legend: "Multirow", fields: [["transform", "box-shadow"], ["border-radius"]] }
       *  ]
       *
       * Each element of parent array becomes a fieldset
       * [i].legend becomes the legend of the fieldset
       * [i].fields become the list of fields in the fiedlset. if fields is a multi-dimensional array, make multiple rows
       * [i].hidden collapses the fieldset, the user can click to expand it.
       */
    initForm: function(fieldsets, $this) {
      this.form = $('<form>');
      for (var i = 0; i < fieldsets.length; i += 1) {
        var cur = fieldsets[i]
            curFields = cur.fields,
            fieldset = elBuild.fieldset(cur.legend, cur.hidden);
        // Is String
        if (typeof curFields[0] === "string") {
          fieldset.append(elBuild.row($this, curFields));
        }
        // Is Array
        else if (curFields[0] instanceof Array) {
          for (var j = 0; j < curFields.length; j += 1) {
            fieldset.append(elBuild.row($this, curFields[j]));
          }
        }
        // Is jQuery object
        else if (curFields instanceof jQuery) {
          fieldset.append(curFields);
        }

        // If it's supposed to be collapsed, colapse it
        if (cur.hidden) {
          fieldset.find('.row').hide();
        }
        this.form.append(fieldset);
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
    $(this).each(function() {
      var $this = $(this),
          mod = new ElMod;
      mod.initForm(structure, $this);
      $this.data('ElMod', mod);
    });
  };
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

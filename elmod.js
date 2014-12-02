(function($){
  /* private variables */
  var ElMod = function() {};
  var options = {
    ATTR: "data-modifies",
    COLCOUNT: 12,
    COLCLASS: "col-xs-",
    types: {
      color: function($this) {
        var tmpl = $('<input type="text">');
        return tmpl;
      },
      text: function($this) {
        var tmpl = $('<input type="text">');
        return tmpl;
      },
      align: function($this) {
        var tmpl = $('<div>');
        tmpl.append($('<input type="radio" name="text-align" id="left"><label for="left">Left</label>'));
        tmpl.append($('<input type="radio" name="text-align" id="center"><label for="center">Center</label>'));
        tmpl.append($('<input type="radio" name="text-align" id="right"><label for="right">Right</label>'));
        tmpl.find('input').change(function() {
          $this.css('text-align', $(this).attr('id'));
        });
        return tmpl;
      }
    },
  };
  options.propertyMap = {
    'background-color':  { label: "Background Color", input: options.types.color },
    'color':             { label: "Text Color", input: options.types.color },
    'border-color':      { label: "Border Color", input: options.types.color },
    'text-align':        { label: "Text Align", input: options.types.align },
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
            fieldset = $('<fideldset style="position:relative;">').append($('<legend>'+cur.title+'</legend>')),
            row = $('<div class="row"></div>');
        // Setup expanding functionality
        if (cur.hidden) {
          fieldset.append('<span class="indicator" style="position:absolute;top:-0.5em;right:1em;">+</span>');
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
          var input = cur.fields[j];
          if (typeof input === "string" && options.propertyMap[input]) input = options.propertyMap[input].input($this);
          row.append( $('<div class="'+colClass+'">').append(input) );
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
  $.fn.elMod = function() {
    var $this = $(this);
    if (!$this.data('ElMod')) return "Error: no form has been setup to modify this element";
    return $this.data('ElMod').getForm();
  };
  
})(jQuery);

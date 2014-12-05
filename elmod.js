(function($){
  /* private variables */
  var ElMod = function() {};
  var options = {
    ATTR: "data-modifies",
    COLCOUNT: 12,
    COLCLASS: "col-xs-",
    types: {
      color: function($this, property, label) {
        var tmpl = $('<input type="text" placeholder="'+label+'">');
        tmpl.on('keypress keyup change blur', function() {
          $this.css(property, $(this).val());
          $(this).css('background', $(this).val());
        });
        return tmpl;
      },
      text: function($this) {
        var tmpl = $('<input type="text">');
        return tmpl;
      },
      'text-align': function($this) {
        var tmpl = $('<div>');
        tmpl.append($('<input type="radio" name="text-align" id="left"><label for="left">Left</label>'));
        tmpl.append($('<input type="radio" name="text-align" id="center"><label for="center">Center</label>'));
        tmpl.append($('<input type="radio" name="text-align" id="right"><label for="right">Right</label>'));
        tmpl.find('input').change(function() {
          $this.css('text-align', $(this).attr('id'));
        });
        return tmpl;
      },
      'vertical-align': function($this) {
        if ($this.css('display') !== "table") {
          var content = $this.text();
          $this.empty();
          $this.append('<div style="display:table"><div style="display:table-row"><div style="display:table-cell" class="v-align-table-cell">'+content+'</div></div></div>')
        }
        var tmpl = $('<div>');
        tmpl.append($('<input type="radio" name="vertical-align" id="top"><label for="top">Top</label>'));
        tmpl.append($('<input type="radio" name="vertical-align" id="middle"><label for="middle">Middle</label>'));
        tmpl.append($('<input type="radio" name="vertical-align" id="bottom"><label for="bottom">Bottom</label>'));
        tmpl.find('input').change(function() {
          $this.find('.v-align-table-cell').css('vertical-align', $(this).attr('id'));
        });
        return tmpl;
      }
    },
  };
  options.propertyMap = {
    'background-color':  function($this, property) { return options.types.color($this, property, "Background Color" ); },
    'color':             function($this, property) { return options.types.color($this, property, "Text Color" ); },
    'border-color':      function($this, property) { return options.types.color($this, property, "Border Color" ); },
    'text-align':        function($this, property) { return options.types['text-align']($this, property, "Text Align"); },
    'vertical-align':        function($this, property) { return options.types['vertical-align']($this, property, "Vertical Align"); },
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
          var input = cur.fields[j];
          if (typeof input === "string" && options.propertyMap[input]) input = options.propertyMap[input]($this, input);
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

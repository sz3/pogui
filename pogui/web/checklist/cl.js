var _CheckList = function(id, onRemove) {

var _id = id;
var _onRemove = onRemove;

// private methods
function removeEntryClick()
{
  var bg = $(this).parent();
  var val = bg.find('input').val();
  if (_onRemove)
    _onRemove(val, _id);
  else {
    bg.remove();
  }
}

return {
  setOnRemove : function(onRemove)
  {
    _onRemove = onRemove;
  },

  update : function(entry_list)
  {
    var root = $('[id="' + _id + '"].pog-checklist');
    root.html('');

    for (var i in entry_list)
    {
      var entry = entry_list[i];
      var bg = $(`
        <div class="pure-button-group">
          <input class="pure-u-3-4" type="text" value="" readonly>
          <button class="pure-button remove-pog-checklist" href="javascript:void(0)">✖</button>
        </div>`);
      bg.find('input').val(entry);
      bg.find('button').click(removeEntryClick);
      root.append(bg);
    }
  }
};
};

var CheckList = function() {
// private vars
var _instances = {};

// private methods

// public interface
return {
  init : function()
  {
    $('.pog-checklist').submit(false);
    $('.pog-checklist').each(function() {
      var id = $(this).attr('id');
      CheckList.transform(id);
    });
  },

  transform : function(id)
  {
    // turns <div id="{id}" class="pog-checklist"> into...
    $('[id="' + id + '"]').toggleClass('pure-form', true);

    // after the dom is updated, create the JS class
    _instances[id] = _CheckList(id);
  },

  get : function(id)
  {
    return _instances[id];
  }
};
}();

CheckList.init();

var sample = ['s3:test'];
CheckList.get('settings-remote-storage').update(sample);

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

  update : function(entry_list, append)
  {
    append = append || false;
    var root = $('[id="' + _id + '"].pog-checklist');

    if (!append)
      root.html('');

    for (var i in entry_list)
    {
      var entry = entry_list[i];
      var bg = $(`
        <div class="pure-button-group">
          <input dir="rtl" class="pure-u-3-4" type="text" value="" readonly>
          <button class="pure-button remove-pog-checklist" href="javascript:void(0)">✖</button>
        </div>`);
      var input = bg.find('input');
      input.val(entry);
      input.attr('title', entry);
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
CheckList.get('settings-keyfiles').update(['looooooooooooooooooong/path/to/keyfile.txt']);
//*/

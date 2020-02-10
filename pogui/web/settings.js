var Settings = function() {

// private functions

function addRemoteStorageClick()
{
  var elem = $(this).parent();
  var storage_type = elem.parent().find('.settings-storage-choice button.pure-button-active').text();
  var bucket = elem.find('input[type=text]').val();
  Settings.addRemoteStorage(storage_type, bucket);
}

function toggleRemoteStorageClick(e)
{
  e.preventDefault();

  $('.settings-storage-choice button').toggleClass('pure-button-active', false);
  $(this).toggleClass('pure-button-active', true);
}

function removeRemoteStorageClick()
{
  var elem = $(this).parent();
  Settings.removeRemoteStorage(elem.attr('id'));
}

// public interface
return {
  init : function()
  {
    $('#settings form').submit(false);
    $('.settings-storage-choice button').click(toggleRemoteStorageClick);
    $('.settings-storage-add').click(addRemoteStorageClick);
  },

  addRemoteStorage : function(storage_type, bucket)
  {
    console.log('saveRemoteStorage ' + storage_type + ', ' + bucket);
    Api.addFS(storage_type, bucket).then(Settings.refreshRemoteStorageView);
  },

  removeRemoteStorage : function(id)
  {
    console.log('removeRemoteStorage ' + id);
    Api.removeFS(id).then(Settings.refreshRemoteStorageView);
  },

  refreshRemoteStorageView : function(storage_list)
  {
    $('.settings-remote-storage').html('');
    for (var i in storage_list)
    {
      var storage = storage_list[i];
      var html = '<div id="' + storage + '" class="pure-button-group settings-remote-storage-entry">'
        + '<input class="pure-u-2-3" type="text" value="' + storage + '" readonly> '
        + '<button class="pure-button remove-storage" href="javascript:;">✖</button>'
        + '</div>';
      $('.settings-remote-storage').append(html);
      $('[id="' + storage + '"] button').click(removeRemoteStorageClick);
    }
  }
}
}();

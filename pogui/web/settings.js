var Settings = function() {

// private functions

function addRemoteStorageClick()
{
  var elem = $(this).parent();
  var storage_type = elem.find('.settings-storage-choice button.pure-button-active').text();
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
      var html = '<span id="' + storage + '" class="settings-remote-storage-entry">'
        + '<input class="pure-u-1-2" type="text" value="' + storage + '" readonly> '
        + '<a class="pure-button remove-storage" href="javascript:;">✖</a>'
        + '</span>';
      $('.settings-remote-storage').append(html);
      $('[id="' + storage + '"] a').click(removeRemoteStorageClick);
    }
  }
}
}();

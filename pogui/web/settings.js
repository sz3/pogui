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

// public interface
return {
  init : function()
  {
    $('#settings form').submit(false);
    $('.settings-storage-choice button').click(toggleRemoteStorageClick);
    $('button.settings-storage-add').click(addRemoteStorageClick);

    CheckList.get('settings-remote-storage').setOnRemove(Settings.removeRemoteStorage);
    CheckList.get('settings-keyfiles').setOnRemove(Settings.removeKeyFile);
  },

  addRemoteStorage : function(storage_type, bucket)
  {
    Api.addFS(storage_type, bucket).then(Settings.refreshRemoteStorageView);
  },

  removeRemoteStorage : function(entry)
  {
    Api.removeFS(entry).then(Settings.refreshRemoteStorageView);
  },

  refreshRemoteStorageView : function(entry_list)
  {
    CheckList.get('settings-remote-storage').update(entry_list);
  },

  updateKeyFilesDir : function()
  {
    Api.updateKeyFilesDir().then(Settings.refreshKeyfilesView);
  },

  removeKeyFile : function(entry)
  {
    Api.removeKeyfile(entry).then(Settings.refreshKeyfilesView);
  },

  refreshKeyfilesView : function(entry_list)
  {
    CheckList.get('settings-keyfiles').update(entry_list);
  }
}
}();

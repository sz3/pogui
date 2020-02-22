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
    $('.settings-storage-choice button').unbind().click(toggleRemoteStorageClick);
    $('button.settings-storage-add').unbind().click(addRemoteStorageClick);

    CheckList.get('settings-remote-storage').setOnRemove(Settings.removeRemoteStorage);
    CheckList.get('settings-keyfiles').setOnRemove(Settings.removeKeyfile);
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
    CreateArchive.init();
  },

  updateKeyfilesDir : function()
  {
    Api.updateKeyfilesDir().then(Settings.refreshKeyfilesView);
  },

  removeKeyfile : function(entry)
  {
    Api.removeKeyfile(entry).then(Settings.refreshKeyfilesView);
  },

  refreshKeyfilesView : function(entry_list)
  {
    CheckList.get('settings-keyfiles').update(entry_list);
  },

  zoom : function(percent)
  {
    percent += '%';
    $('#settings .zoom-setting-current').text(percent);
    document.body.style.zoom = percent;
  },

  zoomIn : function()
  {
    Api.zoomChange(10).then(Settings.zoom);
  },

  zoomOut : function()
  {
    Api.zoomChange(-10).then(Settings.zoom);
  },

  zoomReset : function()
  {
    Api.zoomReset().then(Settings.zoom);
  }
}
}();

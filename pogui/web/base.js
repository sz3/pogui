var Actions = function() {
return {
  updateKeyFilesDir : function()
  {
    Api.updateKeyFilesDir().then(Page.setKeyFiles);
  },

  getFiles : function()
  {
    Api.getFiles().then(Page.addCandidateFiles);
  },

  dragDrop : function(event)
  {
    // this will be for adding manifests (e.g. the viewing side) at most
    // the browser wisely doesn't give us full path info
    let files = [];
    if (event && event.dataTransfer)
    {
      let ef = event.dataTransfer.files;
      for (let i = 0; i < ef.length; i++)
      {
        let obj = {};
        for (let key in ef[i])
          obj[key] = ef[i][key];
        files.push(obj);
      }
    }
    window.pywebview.api.dragDrop(files);
  }
};
}();

var Page = function() {

// private functions
function basename(str) {
    return str.substr(str.lastIndexOf('/') + 1);
}

function addRemoteStorageClick()
{
  var elem = $(this).parent();
  var storage_type = elem.find('button.pure-button-active').text();
  var bucket = elem.find('input[type=text]').val();
  Page.addRemoteStorage(storage_type, bucket);
}

function toggleRemoteStorageClick(e)
{
  e.preventDefault();

  $('.settings-remote-storage-add button.pure-button').toggleClass('pure-button-active', false);
  $(this).toggleClass('pure-button-active', true);
}

function removeRemoteStorageClick()
{
  var elem = $(this).parent();
  Page.removeRemoteStorage(elem.attr('id'));
}

// public interface
return {
  init : function(nav)
  {
    Settings.init();
    Navigation.init(nav);
  },

  pyinit : function(apifun)
  {
    var targets = {
      'waitForManifests': FileBrowser.get('open-archive').showFiles,
      'listFS': Settings.refreshRemoteStorageView
    };
    Api[apifun]().then(targets[apifun]);
  },

  loadArchive : function(mfn)
  {
    var shortname = basename(mfn);
    if ($('[id="' + shortname + '"]').length)
      return;

    // add to nav
    var html = '<li class="pure-menu-item menu-item-divided"><a href="#'
      + shortname + '" class="pure-menu-link">' + shortname + '</a></li>';
    $('.pure-menu-list').append(html);

    // add and load content
    var html = '<div id="' + shortname + '" class="page filemanager"></div>';
    $('#main .content').append(html);
    FileBrowser.add(shortname);
    FileBrowser.get(shortname).loadManifest(mfn);

    Navigation.init(shortname);
  },

  showMessage : function(param)
  {
    alert('hello hello I am a log');
    $("#messagebox").html(param);
  },

  setKeyFiles : function(files)
  {
    let kl = $('.key-list');
    kl.html('');
    for (let f in files)
    {
      kl.append('<li>' + files[f] + '</li>');
    }
  },

  addCandidateFiles : function(files)
  {
    let kl = $('.create-archive-list');
    kl.html('');
    for (let f in files)
    {
      kl.append('<li>' + files[f] + '</li>');
    }
  }
};
}();

window.addEventListener("dragover", function(e) {
  e = e || event;
  e.preventDefault();
}, false);

window.addEventListener("drop", function(e) {
  e = e || event;
  e.preventDefault();
  e.stopPropagation();
  Actions.dragDrop(e);
}, false);

window.onbeforeunload = function (e) {
  Api.emergencyExit();
};

Page.init('open-archive');
//Page.loadArchive('reference/asymmetric-sample.mfn');

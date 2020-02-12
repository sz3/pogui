var Actions = function() {
return {
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
      'listFS': Settings.refreshRemoteStorageView,
      'listKeyfiles': Settings.refreshKeyfilesView
    };
    Api[apifun]().then(targets[apifun]);
  },

  loadArchive : function(mfn)
  {
    var shortname = basename(mfn);
    var actions = {'download': true};
    if (!FileBrowser.add(mfn, '#main .content', actions))
      return;  // do nothing if the archive is already loaded

    Navigation.add(mfn, shortname);
    FileBrowser.get(mfn).loadManifest(mfn);

    Navigation.init(mfn);
  },

  showMessage : function(param)
  {
    alert('hello hello I am a log');
    $("#messagebox").html(param);
  },

  addCandidateFiles : function(files)
  {
    var append = true;
    CheckList.get('create-archive-list').update(files, append);
  },

  clearCandidateFiles : function()
  {
    CheckList.get('create-archive-list').update([]);
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

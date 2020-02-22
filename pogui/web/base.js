
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
      'listKeyfiles': Settings.refreshKeyfilesView,
      'zoom': Settings.zoom
    };
    Api[apifun]().then(targets[apifun]);
  },

  loadArchive : function(mfn)
  {
    var shortname = basename(mfn);
    var actions = {'download': true};
    if (!FileBrowser.add(mfn, '#main .content', actions))
    {
      // just go to page if the archive is already loaded
      Navigation.goto(mfn);
      return;
    }

    Navigation.add(mfn, shortname);
    FileBrowser.get(mfn).loadManifest(mfn);

    Navigation.init(mfn);
  },

  showMessage : function(message, title)
  {
    title = title || 'Error';
    $("#messagebox h2").html(title);
    $("#messagebox p").html(message);
    $("#messagebox").fadeIn("slow");
  },

  hideMessage : function(e)
  {
    console.log('hidemessage?');
    $("#messagebox").fadeOut("slow");
  },

  dragDrop : function(event)
  {
    // this will be for adding manifests (e.g. the viewing side) at most
    // the browser wisely doesn't give us full path info
    var files = [];
    if (event && event.dataTransfer)
    {
      var ef = event.dataTransfer.files;
      for (var i = 0; i < ef.length; i++)
      {
        var obj = {};
        for (var key in ef[i])
          obj[key] = ef[i][key];
        files.push(obj);
      }
    }
    window.pywebview.api.dragDrop(files);
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
  Page.dragDrop(e);
}, false);

window.onhashchange = function(e) {
  e = e || event;
  // show the title when we switch pages
  window.scrollTo(0, 0);
};

window.onbeforeunload = function (e) {
  Api.emergencyExit();
};

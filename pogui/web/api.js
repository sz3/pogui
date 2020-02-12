// talks to pywebview

var Api = function() {
// private functions

// public interface
// return promises that will invoke a js function callback
return {
  getFiles : function()
  {
    return window.pywebview.api.getFiles();
  },

  waitForManifests : function()
  {
    return window.pywebview.api.waitForManifests();
  },

  listManifests : function()
  {
    return window.pywebview.api.listManifests();
  },

  scanManifest : function(mfn)
  {
    return window.pywebview.api.scanManifest(mfn);
  },

  listFS : function()
  {
    return window.pywebview.api.listFS();
  },

  addFS : function(storage_type, bucket)
  {
    return window.pywebview.api.addFS([storage_type, bucket]);
  },

  removeFS : function(storage_path)
  {
    return window.pywebview.api.removeFS(storage_path);
  },

  listKeyfiles : function()
  {
    return window.pywebview.api.listKeyfiles();
  },

  updateKeyFilesDir : function()
  {
    return window.pywebview.api.updateKeyFilesDir();
  },

  removeKeyfile : function(entry)
  {
    return window.pywebview.api.removeKeyfile(entry);
  },

  downloadArchive : function(mfn)
  {
    return window.pywebview.api.downloadArchive(mfn);
  },

  downloadFile : function(mfn, filename)
  {
    return window.pywebview.api.downloadFile(mfn, filename);
  },

  emergencyExit : function()
  {
    window.pywebview.api.emergencyExit();
  }
}
}();

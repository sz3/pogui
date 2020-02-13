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
    return window.pywebview.api.waitForManifests().catch(Page.showMessage);
  },

  listManifests : function()
  {
    return window.pywebview.api.listManifests().catch(Page.showMessage);
  },

  scanManifest : function(mfn)
  {
    return window.pywebview.api.scanManifest(mfn).catch(Page.showMessage);
  },

  listFS : function()
  {
    return window.pywebview.api.listFS().catch(Page.showMessage);
  },

  addFS : function(storage_type, bucket)
  {
    return window.pywebview.api.addFS([storage_type, bucket]).catch(Page.showMessage);
  },

  removeFS : function(storage_path)
  {
    return window.pywebview.api.removeFS(storage_path).catch(Page.showMessage);
  },

  listKeyfiles : function()
  {
    return window.pywebview.api.listKeyfiles().catch(Page.showMessage);
  },

  updateKeyFilesDir : function()
  {
    return window.pywebview.api.updateKeyFilesDir().catch(Page.showMessage);
  },

  removeKeyfile : function(entry)
  {
    return window.pywebview.api.removeKeyfile(entry).catch(Page.showMessage);
  },

  downloadArchive : function(mfn)
  {
    return window.pywebview.api.downloadArchive(mfn).catch(Page.showMessage);
  },

  downloadFile : function(mfn, filename)
  {
    return window.pywebview.api.downloadFile(mfn, filename).catch(Page.showMessage);
  },

  emergencyExit : function()
  {
    window.pywebview.api.emergencyExit();
  }
}
}();


var _thenDoIt = function(data) {
  return {
    then : function(callback)
    {
      callback(data);
    }
  };
};

var Api = function() {

var _calls = [];
var _response = {};

return {
  clear : function()
  {
    _calls = [];
  },

  calls : function()
  {
    return _calls;
  },

  setResponseForCall : function(name, res)
  {
    _response[name] = res;
  },

  getFiles : function()
  {
    _calls.push('getFiles()');
    return _thenDoIt(_response['getFiles']);
  },

  waitForManifests : function()
  {
    _calls.push('waitForManifests()');
    return _thenDoIt(_response['waitForManifests']);
  },

  listManifests : function()
  {
    _calls.push('listManifests()');
    return _thenDoIt(_response['listManifests']);
  },

  scanManifest : function(mfn)
  {
    _calls.push('scanManifest(' + mfn + ')');
    return _thenDoIt(_response['scanManifest']);
  },

  listFS : function()
  {
    _calls.push('listFS()');
    return _thenDoIt(_response['listFS']);
  },

  addFS : function(storage_type, bucket)
  {
    _calls.push('addFS(' + storage_type + ', ' + bucket + ')');
    return _thenDoIt(_response['addFS']);
  },

  removeFS : function(storage_path)
  {
    _calls.push('removeFS(' + storage_path + ')');
    return _thenDoIt(_response['removeFS']);
  },

  listKeyfiles : function()
  {
    _calls.push('listKeyfiles()');
    return _thenDoIt(_response['listKeyfiles']);
  },

  updateKeyFilesDir : function()
  {
    _calls.push('updateKeyFilesDir()');
    return _thenDoIt(_response['updateKeyFilesDir']);
  },

  removeKeyfile : function(entry)
  {
    _calls.push('removeKeyfile(' + entry + ')');
    return _thenDoIt(_response['removeKeyfile']);
  },

  downloadArchive : function(mfn)
  {
    _calls.push('downloadArchive(' + mfn + ')');
    return _thenDoIt(_response['downloadArchive']);
  },

  downloadFile : function(mfn, filename)
  {
    _calls.push('downloadFile(' + mfn + ', ' + filename + ')');
    return _thenDoIt(_response['downloadFile']);
  },

  emergencyExit : function()
  {
    _calls.push('emergencyExit()');
  }
};
}();

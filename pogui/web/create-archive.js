
var CreateArchive = function() {

// private functions

// public interface
return {
  askForFolders : function()
  {
    Api.getLocalFolders().then(CreateArchive.addCandidatePaths);
  },

  askForFiles : function()
  {
    Api.getLocalFiles().then(CreateArchive.addCandidatePaths);
  },

  addCandidatePaths : function(paths)
  {
    var append = true;
    CheckList.get('create-archive-list').update(paths, append);
  },

  clearCandidatePaths : function()
  {
    CheckList.get('create-archive-list').update([]);
  },

  create : function()
  {
    var items = CheckList.get('create-archive-list').items();
    console.log('creating :');
    console.log(items);
  }
}
}();

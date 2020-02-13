
var CreateArchive = function() {

// private functions

// public interface
return {
  askForFiles : function()
  {
    Api.getFiles().then(CreateArchive.addCandidateFiles);
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
}
}();

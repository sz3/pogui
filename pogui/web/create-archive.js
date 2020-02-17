
var CreateArchive = function() {

// private functions
function toggleDestinationClick(e)
{
  e.preventDefault();
  $(this).toggleClass('pure-button-active');
}

// public interface
return {
  init : function()
  {
    this.resetDestinations();
  },

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

  resetDestinations : function()
  {
    // reset list of destinations
    var chooser = $('#create-archive .choose-destination');
    chooser.empty();

    var dests = CheckList.get('settings-remote-storage').items();
    for (var i in dests)
    {
      var item = $('<button class="pure-button pure-button-active">' + dests[i] + '</button>');
      item.click(toggleDestinationClick);
      chooser.append(item);
    }
  },

  getDestinations : function()
  {
    var dests = [];
    $('.choose-destination .pure-button-active').each(function() {
      dests.push($(this).text());
    });
    return dests;
  },

  create : function()
  {
    var items = CheckList.get('create-archive-list').items();
    console.log('creating :');
    console.log(CreateArchive.getDestinations());
    console.log(items);
  }
}
}();

CreateArchive.init();

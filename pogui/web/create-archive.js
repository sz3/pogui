
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
    dests.push('local');
    for (var i in dests)
    {
      var active = (dests[i] != 'local')? ' pure-button-active' : '';
      var item = $('<button class="pure-button' + active + '">' + dests[i] + '</button>');
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
    var paths = CheckList.get('create-archive-list').items();
    var destinations = CreateArchive.getDestinations();
    Api.createArchive(paths, destinations).then(function(res) {
      if (res)
        ProgressBar.add(res['progress_id']);
    });
  }
}
}();

CreateArchive.init();

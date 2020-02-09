// https://tutorialzine.com/2014/09/cute-file-browser-jquery-ajax-php
// https://github.com/tutorialzine/cute-files

var _FileBrowser = function(parent_id) {

var _parent_id = parent_id;
var _state = FileBrowserState();

// private vars
var _filemanager = $('[id="' + _parent_id + '"].filemanager'), // no space
  _breadcrumbs = $('[id="' + _parent_id + '"] .breadcrumbs'),  // space
  _fileList = _filemanager.find('.data');

// private methods
// search
function updateSearch(query) {
  _filemanager.addClass('searching');
  var searchResults = searchData(_state.getResponse(), query.toLowerCase());
  // TODO: WTF????
  /*if (rendered.length) {
    _currentPath = 'search';  // ???
  }*/
  render(searchResults);
}

// Navigates to the given path
function navigateTo(path) {
  // make path legit
  if (!path || !path.trim().length) {
    path = '';
  }
  _state.setCurrentPath(path);
  _state.log();
  render(_state.getResponse(), _state.getCurrentPath(), _state.getBreadcrumbs());
}

// Recursively search through the file tree
// this could be moved into the state class
function searchData(data, searchTerms) {
  var folders = [];
  var files = [];
  data.forEach(function(fp){
    bn = basename(fp.path);
    if (!bn) {
      return;
    }
    if(bn.toLowerCase().match(searchTerms)) {
      if (fp.path.endsWith('/')) {
        folders.push(fp);
      }
      else {
        files.push(fp);
      }
    }
  });
  return {folders: folders, files: files};
}

// Render the HTML for the file manager
function render(data, currentPath, breadcrumbsUrls) {
  var scannedFolders = [],
    scannedFiles = [];

  if(Array.isArray(data)) {
    data.forEach(function (fp) {
      var tokens = fp.path.split('/');
      if (!tokens.pop()) {
        tokens.pop();
      }
      if (tokens.length > 0) {
        tokens.push('');
      }
      if (tokens.join('/') != currentPath || fp.path == currentPath) {
        ;
      }
      else if (fp.path.endsWith('/')) {
        scannedFolders.push(fp);
      }
      else {
        scannedFiles.push(fp);
      }
    });
  }
  else if(typeof data === 'object') {
    scannedFolders = data.folders;
    scannedFiles = data.files;
  }

  // Empty the old result and make the new one

  _fileList.empty().hide();

  if(!scannedFolders.length && !scannedFiles.length) {
    _filemanager.find('.nothingfound').show();
  }
  else {
    _filemanager.find('.nothingfound').hide();
  }

  if(scannedFolders.length) {
    scannedFolders.forEach(function(fp) {
      var itemsLength = 1,
        name = escapeHTML(basename(fp.path)),
        icon = '<span class="icon folder"></span>';

      if(itemsLength) {
        icon = '<span class="icon folder full"></span>';
      }

      if(itemsLength == 1) {
        itemsLength += ' item';
      }
      else if(itemsLength > 1) {
        itemsLength += ' items';
      }
      else {
        itemsLength = 'Empty';
      }

      var folder = $('<li class="folders"><a href="'+ fp.path +'" title="'+ fp.path +'" class="folders">'+icon+'<span class="name">' + name + '</span> <span class="details">' + itemsLength + '</span></a></li>');
      folder.appendTo(_fileList);
    });
  }

  if(scannedFiles.length) {
    scannedFiles.forEach(function(fp) {
      var name = escapeHTML(basename(fp.path)),
        fileType = name.split('.');

      fileType = fileType[fileType.length-1];
      var icon = '<span class="icon file f-'+fileType+'">.'+fileType+'</span>';

      var file = $('<li class="files"><a href="'+ fp.path +'" title="'+ fp.path +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">42</span></a></li>');
      file.appendTo(_fileList);
    });
  }

  // Generate the breadcrumbs
  var url = '';
  if(_filemanager.hasClass('searching')){
    url = '<span>Search results: </span>';
    _fileList.removeClass('animated');
  }
  else {
    _fileList.addClass('animated');
    url += '<a href="📁"><span class="folderName">📁</span></a> · ';

    breadcrumbsUrls.forEach(function (u, i) {
      var name = u.split('/');

      if (i !== breadcrumbsUrls.length - 1) {
        url += '<a href="'+u+'"><span class="folderName">' + name[name.length-1] + '</span></a> · ';
      }
      else {
        url += '<span class="folderName">' + name[name.length-1] + '</span>';
      }
    });
  }

  _breadcrumbs.text('').append(url);

  // Show the generated elements
  _fileList.show();
}

// replace this with builtin
function basename(path) {
  var tokens = path.split('/');
  if (tokens.length <= 0) {
    return path;
  }
  else if (tokens[tokens.length-1]) {
    return tokens[tokens.length-1];
  }
  else {
    return tokens[tokens.length-2];
  }
}

// This function escapes special html characters in names
function escapeHTML(text) {
  return text.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
}

// ui event handlers
function uiSearch() {
  var search = $(this);

  search.find('span').hide();
  search.find('input[type=search]').show().focus();
}

function uiSearchInput(e) {
  var value = this.value.trim();

  if(value.length) {
    _filemanager.addClass('searching');

    // Update on every key stroke
    updateSearch(value.trim());
  }
  else {
    _filemanager.removeClass('searching');
    navigateTo(_state.getCurrentPath());
  }
}

function uiSearchKeyup(e) {
  // Clicking 'ESC' button triggers focusout and cancels the search
  var search = $(this);
  if(e.keyCode == 27) {
    search.val('');
    search.trigger('focusout');
  }
}

function uiSearchFocusout(e) {
  // Cancel the search
  var search = $(this);
  if(!search.val().trim().length) {
      search.hide();
      search.parent().find('span').show();
      navigateTo(_state.getCurrentPath());
    }
}

function clearSearch() {
  if(_filemanager.hasClass('searching')) {
    _filemanager.removeClass('searching');
    _filemanager.find('input[type=search]').val('').hide();
    _filemanager.find('span').show();
  }
}

function showFiles(data) {
  _state.addResponse(data);

  // Hiding and showing the search box
  _filemanager.find('.search').click(uiSearch);

  // Listening for keyboard input on the search field.
  // We are using the "input" event which detects cut and paste
  // in addition to keyboard input.
  _filemanager.find('input').on('input', uiSearchInput)
  .on('keyup', uiSearchKeyup)
  .focusout(uiSearchFocusout);

  // Clicking on folders
  _fileList.on('click', 'li.folders', function(e){
    e.preventDefault();

    var nextDir = $(this).find('a.folders').attr('href');
    clearSearch();
    navigateTo(nextDir);
  });

  // Clicking on breadcrumbs
  _breadcrumbs.on('click', 'a', function(e){
    e.preventDefault();
    clearSearch();

    var index = _breadcrumbs.find('a').index($(this)) - 1;
    if (index < 0)
    {
      // sometimes we get erroneous(?) extra events. Sanity check them.
      // the only readon we'd want to navigate is if we click the "root" link
      if ($(this).attr('href') == '📁')
        navigateTo('');
      return;
    }

    var nextDir = _state.getBreadcrumbs()[index];
    navigateTo(nextDir + '/');
  });

  // clicking on files
  _fileList.on('click', 'li.files', function(e){
    e.preventDefault();

    var filePath = $(this).find('a.files').attr('href');
    if (filePath.endsWith('.mfn')) {
      Page.loadArchive(filePath);
    }
  });

  // with everything ready, load the initial state
  navigateTo('');
}

// public interface
return {
  loadManifest : function(mfn)
  {
      Api.scanManifest(mfn).then(showFiles);
  },

  showFiles : function(data)
  {
    showFiles(data);
  }
};
}

var FileBrowser = function() {
// private vars
var _fb = {};

// private methods

// public interface
return {
  init : function()
  {
    $('.filemanager').each(function() {
      var id = $(this).attr('id');
      FileBrowser.transform(id);
    });
  },

  add : function(id)
  {
    // if already exists, return false
    if ($('[id="' + id + '"]').length)
      return false;

    // add and load content
    var html = '<div id="' + id + '" class="page filemanager"></div>';
    $('#main .content').append(html);
    FileBrowser.transform(id);
    return true;
  },

  transform : function(id)
  {
    // turns <div id="{id}" class="filemanager"> into...
    var html = `<div class="search">
        <input type="search" placeholder="Find a file..">
      </div>

      <div class="breadcrumbs"></div>

      <ul class="data"></ul>

      <div class="nothingfound">
        <div class="nofiles"></div>
        <span>No files here.</span>
      </div>`;
    $('[id="' + id + '"]').append(html);

    // after the dom is updated, create the JS class
    _fb[id] = _FileBrowser(id);
  },

  get : function(id)
  {
    return _fb[id];
  }
};
}();

FileBrowser.init();

/*var sample =
[{'path': 's3:bucket/'}, {'path': 's3:bucket/file.mfn'}, {'path': 'local:dir/'}, {'path': 'local:dir/nested/'}, {'path': 'local:dir/nested/bar.mfn'}, {'path': 'local:file.mfn'}];
FileBrowser.get('open-archive').showFiles(sample);
//*/

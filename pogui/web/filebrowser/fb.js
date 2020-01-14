// https://tutorialzine.com/2014/09/cute-file-browser-jquery-ajax-php
// https://github.com/tutorialzine/cute-files

var FileBrowser = function() {

var _state = FileBrowserState;

// private vars
var _filemanager = $('.filemanager'),
	_breadcrumbs = $('.breadcrumbs'),
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
	var rendered = '';

	// make path legit
	if (!path || !path.trim().length) {
		path = '';
	}
	_state.setCurrentPath(path);
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
		url += '<a href="#***"><span class="folderName">root</span></a> · ';

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
	_state.setResponse(data);

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
		console.log('clicked folder!')

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
			loadManifest(filePath);
		}
	});

	// with everything ready, load the initial state
	navigateTo('');
}

// public methods
function loadManifest(mfn) {
	window.pywebview.api.scanManifest(mfn).then(showFiles);
}

// public interface
return {
	onLoad : function()
	{
		window.pywebview.api.scanFiles().then(showFiles);
	},

	loadManifest : function(mfn)
	{
		loadManifest(mfn);
	},

	showFiles : function(data)
	{
		showFiles(data);
	}
};
}();

var sample = [{"name":"Archives","type":"folder","path":"Archives/","items":[{"name":"7z","type":"folder","path":"Archives\/7z","items":[{"name":"archive.7z","type":"file","path":"Archives\/7z\/archive.7z","size":257}]},{"name":"targz","type":"folder","path":"Archives\/targz","items":[{"name":"archive.tar.gz","type":"file","path":"Archives\/targz\/archive.tar.gz","size":10074}]},{"name":"zip","type":"folder","path":"Archives\/zip","items":[{"name":"archive.zip","type":"file","path":"Archives\/zip\/archive.zip","size":10133}]}]},{"name":"Important Documents","type":"folder","path":"Important Documents","items":[{"name":"Microsoft Office","type":"folder","path":"Important Documents\/Microsoft Office","items":[{"name":"Geography.doc","type":"file","path":"Important Documents\/Microsoft Office\/Geography.doc","size":4096},{"name":"Table.xls","type":"file","path":"Important Documents\/Microsoft Office\/Table.xls","size":204800}]},{"name":"export.csv","type":"file","path":"Important Documents\/export.csv","size":4096}]},{"name":"Movies","type":"folder","path":"Movies","items":[{"name":"Conan The Librarian.mkv","type":"file","path":"Movies\/Conan The Librarian.mkv","size":0}]},{"name":"Music","type":"folder","path":"Music","items":[{"name":"awesome soundtrack.mp3","type":"file","path":"Music\/awesome soundtrack.mp3","size":10240000},{"name":"hello world.mp3","type":"file","path":"Music\/hello world.mp3","size":204800},{"name":"u2","type":"folder","path":"Music\/u2","items":[{"name":"Unwanted Album","type":"folder","path":"Music\/u2\/Unwanted Album","items":[{"name":"track1.mp3","type":"file","path":"Music\/u2\/Unwanted Album\/track1.mp3","size":204800},{"name":"track2.mp3","type":"file","path":"Music\/u2\/Unwanted Album\/track2.mp3","size":204800},{"name":"track3.mp3","type":"file","path":"Music\/u2\/Unwanted Album\/track3.mp3","size":204800},{"name":"track4.mp3","type":"file","path":"Music\/u2\/Unwanted Album\/track4.mp3","size":204800}]}]}]},{"name":"Nothing here","type":"folder","path":"Nothing here","items":[]},{"name":"Photos","type":"folder","path":"Photos","items":[{"name":"pic1.jpg","type":"file","path":"Photos\/pic1.jpg","size":204800},{"name":"pic2.jpg","type":"file","path":"Photos\/pic2.jpg","size":204800},{"name":"pic3.png","type":"file","path":"Photos\/pic3.png","size":204800},{"name":"pic4.gif","type":"file","path":"Photos\/pic4.gif","size":204800},{"name":"pic5.jpg","type":"file","path":"Photos\/pic5.jpg","size":204800}]},{"name":"Readme.html","type":"file","path":"Readme.html","size":344}];
FileBrowser.showFiles(sample);
//*/

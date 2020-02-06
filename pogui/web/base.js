var Actions = function() {
return {
	updateKeyFilesDir : function()
	{
		window.pywebview.api.updateKeyFilesDir().then(Page.setKeyFiles);
	},

	getManifestFiles : function()
	{
		window.pywebview.api.getManifestFiles().then(Page.addExistingArchive);
	},

	getFiles : function()
	{
		window.pywebview.api.getFiles().then(Page.addCandidateFiles);
	},

	dragDrop : function(event)
	{
		// this will be for adding manifests (e.g. the viewing side) at most
		// the browser wisely doesn't give us full path info
		let files = [];
		if (event && event.dataTransfer)
		{
			let ef = event.dataTransfer.files;
			for (let i = 0; i < ef.length; i++)
			{
				let obj = {};
				for (let key in ef[i])
					obj[key] = ef[i][key];
				files.push(obj);
			}
		}
		window.pywebview.api.dragDrop(files);
	}
};
}();

var Page = function() {

// private functions
function basename(str) {
    return str.substr(str.lastIndexOf('/') + 1);
}

function sideNavClick()
{
	var elem = $(this);
	$('.pure-menu-item').toggleClass('pure-menu-selected', false);
	elem.parent().toggleClass('pure-menu-selected', true);
	console.log('in navigate! ' + elem.text());
	$('#main .header h1').html(elem.text());
	console.log(elem.text());
	console.log(elem.attr('href'));
}

// public interface
return {
	init : function(nav)
	{
		$('.pure-menu-link').click(sideNavClick);
		if (nav)
			Page.gotoNav(nav);
	},

	pyinit : function()
	{
		window.pywebview.api.scanFiles().then(FileBrowser.get('open-archive').showFiles);
	},

	gotoNav : function(id)
	{
		window.location.hash = id;
	},

	loadArchive : function(mfn)
	{
		var shortname = basename(mfn);
		if ($('[id="' + shortname + '"]').length)
			return;

		// add to nav
		var html = '<li class="pure-menu-item menu-item-divided"><a href="#'
			+ shortname + '" class="pure-menu-link">' + shortname + '</a></li>';
		$('.pure-menu-list').append(html);

		// add and load content
		var html = '<div id="' + shortname + '" class="page filemanager"></div>';
		$('#main .content').append(html);
		FileBrowser.add(shortname);
		FileBrowser.get(shortname).loadManifest(mfn);

		Page.init(shortname);
	},

	showMessage : function(param)
	{
		alert('hello hello I am a log');
		$("#messagebox").html(param);
	},

	setKeyFiles : function(files)
	{
		let kl = $('.key-list');
		kl.html('');
		for (let f in files)
		{
			kl.append('<li>' + files[f] + '</li>');
		}
	},

	addExistingArchive : function(backups)
	{
		let html = '';
		for (let b in backups)
		{
			html += '<li>' + b + '<ul class="files">';
			let files = backups[b];
			for (let f in files)
			{
				html += '<li>' + f + '<ul class="blobs">';
				let blobs = files[f];
				for (let i in blobs)
					html += '<li>' + blobs[i] + '</li>';
				html += '</ul></li>';
			}
			html += '</ul></li>';
		}
		$('.existing-archive-list').html(html);
	},

	addCandidateFiles : function(files)
	{
		let kl = $('.create-archive-list');
		kl.html('');
		for (let f in files)
		{
			kl.append('<li>' + files[f] + '</li>');
		}
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
  Actions.dragDrop(e);
}, false);

Page.init('open-archive');
//Page.loadArchive('reference/asymmetric-sample.mfn');

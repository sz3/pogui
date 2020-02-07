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

function addRemoteStorageClick()
{
	var elem = $(this).parent();
	var storage_type = elem.find('button.pure-button-active').text();
	var bucket = elem.find('input[type=text]').val();
	Page.addRemoteStorage(storage_type, bucket);
}

function toggleRemoteStorageClick(e)
{
	e.preventDefault();

	$('.settings-remote-storage-add button.pure-button').toggleClass('pure-button-active', false);
	$(this).toggleClass('pure-button-active', true);
}

function removeRemoteStorageClick()
{
	var elem = $(this).parent();
	Page.removeRemoteStorage(elem.attr('id'));
}

// public interface
return {
	init : function(nav)
	{
		$('.pure-menu-link').click(sideNavClick);
		$('.settings-remote-storage-add button.pure-button').click(toggleRemoteStorageClick);
		$('.settings-remote-storage-add a').click(addRemoteStorageClick);
		if (nav)
			Page.gotoNav(nav);
	},

	pyinit : function()
	{
		window.pywebview.api.lookForManifests().then(FileBrowser.get('open-archive').showFiles);
	},

	pyinit2 : function()
	{
		window.pywebview.api.listFS().then(Page.refreshRemoteStorageView);
	},

	gotoNav : function(id)
	{
		window.location.hash = id;
		var expected_url = '#' + id;
		$('.pure-menu-item a').each(function() {
			var elem = $(this);
			if (elem.attr('href') == expected_url)
				elem.click();
		});
	},

	addRemoteStorage : function(storage_type, bucket)
	{
		console.log('saveRemoteStorage ' + storage_type + ', ' + bucket);
		window.pywebview.api.addFS([storage_type, bucket]).then(Page.refreshRemoteStorageView);
	},

	removeRemoteStorage : function(id)
	{
		console.log('removeRemoteStorage ' + id);
		window.pywebview.api.removeFS(id).then(Page.refreshRemoteStorageView);
	},

	refreshRemoteStorageView : function(storage_list)
	{
		$('.settings-remote-storage').html('');
		for (var i in storage_list)
		{
			var storage = storage_list[i];
			var html = '<span id="' + storage + '" class="settings-remote-storage-entry">'
				+ '<input class="pure-u-1-2" type="text" value="' + storage + '" readonly> '
      	+ '<a class="pure-button pure-input-rounded" href="javascript:;">✖</a>'
				+ '</span>';
			$('.settings-remote-storage').append(html);
			$('[id="' + storage + '"] a').click(removeRemoteStorageClick);
		}
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

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

return {
	init : function()
	{
		$('.pure-menu-link').click(function() {
			console.log('clicked!');
			Page.navigate($(this));
		});
	},

	showMessage : function(param)
	{
		alert('hello hello I am a log');
		$("#messagebox").html(param);
	},

	navigate : function(elem)
	{
		$('.pure-menu-item').toggleClass('pure-menu-selected', false);
		elem.parent().toggleClass('pure-menu-selected', true);
		console.log('in navigate!');
		$('#main .header h1').html(elem.text());
		$('#main .header h2').html(elem.text());
		console.log(elem.text());
		console.log(elem.attr('href'));
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

Page.init();

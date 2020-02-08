var FileBrowserState = function() {
// private vars
var _response = [],
	_currentPath = '',
	_breadcrumbsUrls = [];

// private methods

// public methods
// Splits a file path and turns it into clickable breadcrumbs
function generateBreadcrumbs(nextDir) {
	var paths = nextDir.split('/').slice(0);
	for(var i=1;i<paths.length;i++){
		paths[i] = paths[i-1] + '/' + paths[i];
	}
	return paths;
}

// public interface
return {
	clearResponse : function()
	{
		_response = [];
	},

	addResponse : function(response)
	{
		_response = _response.concat(response);
	},

  getResponse : function()
  {
    return _response;
  },

  setCurrentPath : function(currentPath)
  {
    _currentPath = currentPath;
  },

  getCurrentPath : function()
  {
    return _currentPath;
  },

  getBreadcrumbs : function()
  {
    return generateBreadcrumbs(_currentPath);
  },

	log : function()
	{
		console.log('****logging state****');
		console.log(_response);
		console.log(_currentPath);
	}
};
};

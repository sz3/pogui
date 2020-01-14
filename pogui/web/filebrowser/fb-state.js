var FileBrowserState = function() {
// private vars
var _response = '',
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
	setResponse : function(response)
	{
		_response = response;
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
  }
};
}();

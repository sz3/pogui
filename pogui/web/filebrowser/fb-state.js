var FileBrowserState = function() {
// private vars
var _response = [],
  _currentPath = '',
  _breadcrumbsUrls = [];

// private methods

// public methods
// Splits a file path and turns it into clickable breadcrumbs
function generateBreadcrumbs(nextDir) {
  var paths = nextDir.split('/');
  for (var i = 1; i < paths.length; i++)
    paths[i] = paths[i-1] + '/' + paths[i];
  if (!paths[0])
    paths = paths.slice(1);
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

  firstPath : function()
  {
    if (!_response || !_response[0])
      return '';
    return _response[0].path;
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

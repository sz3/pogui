
var ProgressBar = function() {
// private vars

// private methods
function finishedClick()
{
  var elem = $(this);
  elem.remove();
}

// public interface
return {
  add : function(id)
  {
    var elem = $('\
      <div id="progress-bar-' + id + '" class="progress-bar">\
      <h1></h1><div class="bar"></div></div>'
    );
    $('.progress-bars').append(elem);
  },

  update : function(id, percent)
  {
    console.log('ProgressBar.update() with ' + id + ' ... ' + percent);
    var elem = $('[id="progress-bar-' + id + '"]');
    elem.find('h1').html(percent);
    elem.find('.bar').width(percent);
    if (percent == '100.00%')
    {
      elem.toggleClass('done', true);
      elem.click(finishedClick);
    }
  },

  remove : function(id)
  {
    var elem = $('[id="progress-bar-' + id + '"]');
    elem.remove();
  }
};
}();

/*
ProgressBar.add('testprogress.mfn');
ProgressBar.update('testprogress.mfn', '100.00%');
//*/

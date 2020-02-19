
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
    // really more of a find_or_create()
    var elem = $('[id="progress-bar-' + id + '"]');
    if (!elem.length)
    {
      elem = $('\
        <div id="progress-bar-' + id + '" class="progress-bar">\
        <div class="status">' + id + '</div><h1></h1><div class="bar"></div></div>'
      );
      $('.progress-bars').append(elem);
    }
    return elem;
  },

  update : function(id, percent)
  {
    console.log('ProgressBar.update() with ' + id + ' ... ' + percent);
    var elem = ProgressBar.add(id);
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
ProgressBar.update('testprogress.mfn', '50.00%');

ProgressBar.add('areallyreallyreallylongmfnhoooooboy.mfn');
ProgressBar.update('areallyreallyreallylongmfnhoooooboy.mfn', '100.00%');

ProgressBar.add('ooo.mfn');
ProgressBar.update('ooo.mfn', '100.00%');
//*/

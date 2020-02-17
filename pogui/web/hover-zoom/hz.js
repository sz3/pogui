
var HoverZoom = function() {
// private vars

// private methods

// public interface
return {
  init : function()
  {
    $('.hover-zoom-box').each(function() {
      HoverZoom.transform($(this));
    });
  },

  transform : function(elem)
  {
    // turns <div class="hover-zoom-box"> into...
    var content = elem.html();
    var title = elem.attr('title');

    var html = '\
    <div class="hover-zoom-container">\
      <div class="box">\
        <div class="icon_bg"></div>\
      </div>';
    html += '<div class="icon" >' + content + '</div>';
    html += '</div><div class="text"><p class="title">' + title + '</p></div>';

    elem.html(html);

    var desc_box = elem.find('.box');
    desc_box.attr('data-description', elem.attr('data-description'));
  }
};
}();

HoverZoom.init();

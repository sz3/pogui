var Navigation = function() {

// private functions

// public interface
return {
  init : function(nav)
  {
    $('.pure-menu-link').unbind().click(Navigation.click);
    if (nav)
      Navigation.goto(nav);
  },

  goto : function(id)
  {
    window.location.hash = id;
    var expected_url = '#' + id;

    // trigger onclick
    $('.pure-menu-item a').each(function() {
      var elem = $(this);
      if (elem.attr('href') == expected_url)
        elem.click();
    });
  },

  click : function()  // elem?
  {
    var elem = $(this);
    // update header
    $('#main .header h1').html(elem.text());

    // update nav
    $('.pure-menu-item').toggleClass('pure-menu-selected', false);
    elem.parent().toggleClass('pure-menu-selected', true);
  },

  add : function(pagename, shortname)
  {
    if (!shortname)
      shortname = pagename;
    var html = '<li class="pure-menu-item menu-item-divided"><a href="#'
      + pagename + '" class="pure-menu-link">' + shortname + '</a></li>';
    $('.pure-menu-list').append(html);
  }
}
}();

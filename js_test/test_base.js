

QUnit.test( "message box", function( assert ) {
  $('#messagebox').hide();
  var header = $('.toast-content h2');
  var box = $('.toast-content p');
  assert.ok( box.is(":hidden") );

  Page.showMessage('ono');
  assert.equal( box.text(), 'ono' );
  assert.equal( header.text(), 'Error' );
  assert.ok( box.is(":visible") );
});

QUnit.module( "base" );
QUnit.config.reorder = false;

QUnit.testStart(function(details) {
  FileBrowser.get('open-archive').clear();
  FileBrowser.get('open-archive').showFiles([
    {'path': 's3:bucket/'},
    {'path': 's3:bucket/dir/'},
    {'path': 's3:bucket/dir/foo'},
    {'path': 's3:bucket/file.txt'},
    {'path': 'local:local.mfn'},
    {'path': 'local:mydir/'},
    {'path': 'local:mydir/home/'},
    {'path': 'local:mydir/home/1.txt'}
  ]);
  Page.init('open-archive');
});

QUnit.testDone(function(details) {
  FileBrowser.get('open-archive').clear();
  Api.clear();
  Api.clearResponses();
});

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

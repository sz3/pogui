
QUnit.testStart(function(details) {
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
});

QUnit.testDone(function(details) {
  FileBrowser.get('open-archive').clear();
});

QUnit.test( "initial load manifest list", function( assert ) {
  // testStart does the actual load
  var folders = [];
  $('#open-archive a.folders').each(function(elem) {
    folders.push($(this).attr('href'));
  });

  var files = [];
  $('#open-archive a.files').each(function(elem) {
    files.push($(this).attr('href'));
  });

  assert.deepEqual( folders, ['s3:bucket/', 'local:mydir/'] );
  assert.deepEqual( files, ['local:local.mfn'] );
});

QUnit.test( "open dir", function( assert ) {
  $('#open-archive a.folders')[0].click();

  var folders = [];
  $('#open-archive a.folders').each(function(elem) {
    folders.push($(this).attr('href'));
  });

  var files = [];
  $('#open-archive a.files').each(function(elem) {
    files.push($(this).attr('href'));
  });

  assert.deepEqual( folders, ['s3:bucket/dir/'] );
  assert.deepEqual( files, ['s3:bucket/file.txt'] );
});

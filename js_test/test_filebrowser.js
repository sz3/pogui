
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

  // dig in more
  $('#open-archive a.folders')[0].click();

  folders = [];
  $('#open-archive a.folders').each(function(elem) {
    folders.push($(this).attr('href'));
  });

  files = [];
  $('#open-archive a.files').each(function(elem) {
    files.push($(this).attr('href'));
  });

  assert.deepEqual( folders, [] );
  assert.deepEqual( files, ['s3:bucket/dir/foo'] );
});

QUnit.test( "open archive", function( assert ) {
  Api.setResponseForCall('scanManifest', [{'path': '1.txt'}]);

  $('#open-archive a.files')[0].click();

  assert.equal(window.location.hash, '#local:local.mfn');
  assert.deepEqual(Api.calls(), ['scanManifest(local:local.mfn)']);

  var folders = [];
  $('[id="local:local.mfn"] a.folders').each(function(elem) {
    folders.push($(this).attr('href'));
  });

  var files = [];
  $('[id="local:local.mfn"] a.files').each(function(elem) {
    files.push($(this).attr('href'));
  });

  assert.deepEqual( folders, [] );
  assert.deepEqual( files, ['1.txt'] );
});

QUnit.test( "breadcrumbs", function( assert ) {
  // dig in
  $('#open-archive a.folders')[0].click();

  var breadcrumbUrls = [];
  $('#open-archive .breadcrumbs a').each(function(elem) {
    breadcrumbUrls.push($(this).attr('href'));
  });
  assert.deepEqual( breadcrumbUrls, ['📁', 's3:bucket'] );

  // more
  breadcrumbUrls = [];
  $('#open-archive a.folders')[0].click();
  $('#open-archive .breadcrumbs a').each(function(elem) {
    breadcrumbUrls.push($(this).attr('href'));
  });
  assert.deepEqual( breadcrumbUrls, ['📁', 's3:bucket', 's3:bucket/dir'] );

  // back to top
  breadcrumbUrls = [];
  $('#open-archive .breadcrumbs a')[0].click();
  $('#open-archive .breadcrumbs a').each(function(elem) {
    breadcrumbUrls.push($(this).attr('href'));
  });
  assert.deepEqual( breadcrumbUrls, ['📁'] );
});

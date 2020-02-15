QUnit.module( "filebrowser" );

function getBreadcrumbs(id) {
  var breadcrumbUrls = [];
  $('[id="' + id + '"] .breadcrumbs a').each(function(elem) {
    breadcrumbUrls.push($(this).attr('href'));
  });
  return breadcrumbUrls;
}

function getFolders(id) {
  var folders = [];
  $('[id="' + id + '"] a.folders').each(function(elem) {
    folders.push($(this).attr('href'));
  });
  return folders;
}

function getFiles(id) {
  var files = [];
  $('[id="' + id + '"] a.files').each(function(elem) {
    files.push($(this).attr('href'));
  });
  return files;
}

QUnit.test( "initial load manifest list", function( assert ) {
  // testStart does the actual load
  var folders = getFolders('open-archive');
  var files = getFiles('open-archive');

  assert.deepEqual( folders, ['s3:bucket/', 'local:mydir/'] );
  assert.deepEqual( files, ['local:local.mfn'] );
});

QUnit.test( "open dir", function( assert ) {
  $('#open-archive a.folders')[0].click();

  var folders = getFolders('open-archive');
  var files = getFiles('open-archive');

  assert.deepEqual( folders, ['s3:bucket/dir/'] );
  assert.deepEqual( files, ['s3:bucket/file.txt'] );

  // dig in more
  $('#open-archive a.folders')[0].click();

  folders = getFolders('open-archive');
  files = getFiles('open-archive');

  assert.deepEqual( folders, [] );
  assert.deepEqual( files, ['s3:bucket/dir/foo'] );
});

QUnit.test( "breadcrumbs", function( assert ) {
  // dig in
  $('#open-archive a.folders')[0].click();

  var breadcrumbUrls = getBreadcrumbs('open-archive');
  assert.deepEqual( breadcrumbUrls, ['📁', 's3:bucket'] );

  // more
  $('#open-archive a.folders')[0].click();
  breadcrumbUrls = getBreadcrumbs('open-archive');
  assert.deepEqual( breadcrumbUrls, ['📁', 's3:bucket', 's3:bucket/dir'] );

  // back to top
  $('#open-archive .breadcrumbs a')[0].click();
  breadcrumbUrls = getBreadcrumbs('open-archive');
  assert.deepEqual( breadcrumbUrls, ['📁'] );
});

QUnit.test( "refresh", function( assert ) {
  Api.setResponseForCall('listManifests', [{'path': 's3:mfns/'}, {'path': 'refresh.mfn'}]);

  // dig in
  $('#open-archive a.folders')[0].click();

  // refresh
  $('#open-archive .filemanager-actions a')[0].click();
  assert.deepEqual( Api.calls(), ['listManifests()'] );

  var folders = getFolders('open-archive');
  var files = getFiles('open-archive');

  assert.deepEqual( folders, ['s3:mfns/'] );
  assert.deepEqual( files, ['refresh.mfn'] );
});

QUnit.test( "open archive and download", function( assert ) {
  Api.setResponseForCall('scanManifest', [{'path': 'zdir/'}, {'path': '1.txt'}]);

  $('#open-archive a.files')[0].click();

  assert.equal(window.location.hash, '#local:local.mfn');
  assert.deepEqual(Api.calls(), ['scanManifest(local:local.mfn)']);

  var folders = getFolders('local:local.mfn');
  var files = getFiles('local:local.mfn');

  assert.deepEqual( folders, ['zdir/'] );
  assert.deepEqual( files, ['1.txt'] );

  Api.clear();

  // download
  var elem = $('[id="local:local.mfn"] .filemanager-actions a');
  assert.equal(elem.attr('title'), 'Download');
  $('[id="local:local.mfn"] .filemanager-actions a')[0].click();

  assert.deepEqual(Api.calls(), ['downloadArchive(local:local.mfn)']);
});

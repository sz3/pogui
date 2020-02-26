QUnit.module( "create-archive" );

function getCreatePaths()
{
  var sl = [];
  $('#create-archive-list input[type=text]').each(function() {
    sl.push($(this).attr('data-entry'));
  });
  return sl;
}

function getStorageDestinations()
{
  var sd = [];
  $('#create-archive .choose-destination button').each(function() {
    sd.push($(this).text());
  });
  return sd;
}

QUnit.test( "initial load", function( assert ) {
  assert.deepEqual(getStorageDestinations(), ['s3:test', 'local']);
  assert.deepEqual(getCreatePaths(), []);
});

QUnit.test( "update storage settings", function( assert ) {
  Settings.refreshRemoteStorageView(['aaaaa', 'bbbbb']);
  assert.deepEqual(getStorageDestinations(), ['aaaaa', 'bbbbb', 'local']);
});

QUnit.test( "add files", function( assert ) {
  Api.setResponseForCall('getLocalFiles', ['file1', 'file2']);

  $('#create-archive .actions .hover-zoom-box')[0].click();

  assert.deepEqual(getCreatePaths(), ['file1', 'file2']);
  assert.deepEqual(Api.calls(), ['getLocalFiles()']);
});

QUnit.test( "add folders", function( assert ) {
  Api.setResponseForCall('getLocalFolders', ['folder1', '/tmp/folder2/']);

  $('#create-archive .actions .hover-zoom-box')[1].click();

  assert.deepEqual(getCreatePaths(), ['folder1', '/tmp/folder2/']);
  assert.deepEqual(Api.calls(), ['getLocalFolders()']);
});

QUnit.test( "clear paths", function( assert ) {
  // setup
  Api.setResponseForCall('getLocalFiles', ['foo', 'bar']);
  Api.setResponseForCall('getLocalFolders', ['folder/']);
  CreateArchive.askForFiles();
  CreateArchive.askForFolders();

  assert.deepEqual(getCreatePaths(), ['foo', 'bar', 'folder/']);
  Api.clear();

  // clear
  $('#create-archive .actions .hover-zoom-box')[2].click();
  assert.deepEqual(getCreatePaths(), []);
  assert.deepEqual(Api.calls(), []);

  CreateArchive.clearCandidatePaths();
  assert.deepEqual(getCreatePaths(), []);
});

QUnit.test( "upload", function( assert ) {
  // setup
  Api.setResponseForCall('getLocalFolders', ['folder/', 'another']);
  CreateArchive.askForFolders();
  Api.clear();

  // click
  $('#create-archive .actions .hover-zoom-box')[3].click();
  assert.deepEqual(Api.calls(), ['createArchive(folder/,another, s3:test)']);
});

QUnit.test( "upload to non-default storage", function( assert ) {
  // setup
  Api.setResponseForCall('getLocalFolders', ['hi/']);
  CreateArchive.askForFolders();
  Api.clear();

  // select non-default storage
  $('#create-archive .choose-destination button')[1].click();

  // click
  $('#create-archive .actions .hover-zoom-box')[3].click();
  assert.deepEqual(Api.calls(), ['createArchive(hi/, s3:test,local)']);
});

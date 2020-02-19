QUnit.module( "settings" );

function settingsSetup()
{
  Navigation.goto('settings');

  Api.setResponseForCall('listFS', ['s3:bucket', 'b2:bucket2']);
  Api.setResponseForCall('listKeyfiles', ['key.one', 'backup.decrypt']);

  Page.pyinit('listFS'); // calls Settings.refreshRemoteStorageView
  Page.pyinit('listKeyfiles'); // calls Settings.refreshKeyfilesView

  Api.clear();
  Api.clearResponses();
}

function getStorageEntries()
{
  var sl = [];
  $('#settings-remote-storage input[type=text]').each(function() {
    sl.push($(this).val());
  });
  return sl;
}

function getKeyfileEntries()
{
  var kf = [];
  $('#settings-keyfiles input[type=text]').each(function() {
    kf.push($(this).val());
  });
  return kf;
}

QUnit.test( "initial load", function( assert ) {
  settingsSetup();

  assert.deepEqual(getStorageEntries(), ['s3:bucket', 'b2:bucket2']);
  assert.deepEqual(getKeyfileEntries(), ['key.one', 'backup.decrypt']);
});

QUnit.test( "empty storages", function( assert ) {
  settingsSetup();

  Settings.refreshRemoteStorageView([]);
  assert.deepEqual(getStorageEntries(), []);
});

QUnit.test( "empty keyfiles", function( assert ) {
  settingsSetup();

  Settings.refreshKeyfilesView([]);
  assert.deepEqual(getKeyfileEntries(), []);
});

QUnit.test( "add remote storage -- default", function( assert ) {
  settingsSetup();
  Api.setResponseForCall('addFS', ['resultA', 'resultB']);

  $('#settings input.settings-storage-add').val('megabux');
  $('#settings button.settings-storage-add').click();

  assert.deepEqual(Api.calls(), ['addFS(S3, megabux)']);
  assert.deepEqual(getStorageEntries(), ['resultA', 'resultB']);
});

QUnit.test( "add remote storage -- choice", function( assert ) {
  settingsSetup();
  Api.setResponseForCall('addFS', ['resultA', 'resultB']);

  $('#settings .settings-storage-choice button')[0].click();
  $('#settings input.settings-storage-add').val('my fav bucket');
  $('#settings button.settings-storage-add').click();

  assert.deepEqual(Api.calls(), ['addFS(B2, my fav bucket)']);
  assert.deepEqual(getStorageEntries(), ['resultA', 'resultB']);
});

QUnit.test( "remove remote storage", function( assert ) {
  settingsSetup();
  Api.setResponseForCall('removeFS', ['s3:buck1']);

  // remove first element
  $('#settings-remote-storage button.remove-pog-checklist')[0].click();

  assert.deepEqual(Api.calls(), ['removeFS(s3:bucket)']);
  assert.deepEqual(getStorageEntries(), ['s3:buck1']);
});

QUnit.test( "update keyfiles", function( assert ) {
  settingsSetup();
  Api.setResponseForCall('updateKeyfilesDir', ['/path/to/key']);

  $('#settings button.settings-keyfiles-add').click();

  assert.deepEqual(Api.calls(), ['updateKeyfilesDir()']);
  assert.deepEqual(getKeyfileEntries(), ['/path/to/key']);
});

QUnit.test( "remove keyfile", function( assert ) {
  settingsSetup();
  Api.setResponseForCall('removeKeyfile', ['/path/to/key']);

  // remove first element
  $('#settings-keyfiles button.remove-pog-checklist')[0].click();

  assert.deepEqual(Api.calls(), ['removeKeyfile(key.one)']);
  assert.deepEqual(getKeyfileEntries(), ['/path/to/key']);
});

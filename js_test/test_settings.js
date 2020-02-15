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

QUnit.test( "add remote storage", function( assert ) {
  settingsSetup();
  Api.setResponseForCall('addFS', ['resultA', 'resultB']);

  console.log($('#settings input.settings-storage-add'));

  $('#settings input.settings-storage-add').val('megabux');
  $('#settings button.settings-storage-add').click();

  assert.deepEqual(getStorageEntries(), ['resultA', 'resultB']);
  assert.deepEqual(Api.calls(), ['foo']);
});

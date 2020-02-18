QUnit.module( "navigation" );

QUnit.test( "go between open archive and open archive", function( assert ) {
  // first prime the pump by mocking a manifest load
  Api.setResponseForCall('scanManifest', [{'path': 'zdir/'}, {'path': '1.txt'}]);
  $('#open-archive a.files')[0].click();

  assert.equal(window.location.hash, '#local:local.mfn');
  assert.equal($('#main .header h1').text(), 'local:local.mfn');

  // this is kind of wack right now -- we don't clean up open archives, and
  // run all the tests in the same context. Since test_filebrowser has already
  // run, we will not actually do the scanManifest here.
  // if/when we add the ability to close archives, or change the test env,
  // this line will be relevant.
  // assert.deepEqual(Api.calls(), ['scanManifest(local:navigation.mfn)']);
  Api.clear();

  // now we can navigate back and forth
  Navigation.goto('open-archive');
  assert.equal(window.location.hash, '#open-archive');
  assert.equal($('#main .header h1').text(), 'Open Archive');

  // go back to `local.mfn`
  $('#open-archive a.files')[0].click();
  assert.equal(window.location.hash, '#local:local.mfn');
  assert.equal($('#main .header h1').text(), 'local:local.mfn');
  assert.deepEqual(Api.calls(), []);
});

QUnit.test( "go to settings", function( assert ) {
  Navigation.goto('settings');
  assert.equal(window.location.hash, '#settings');
  assert.equal($('#main .header h1').text(), '⚙ Settings');
});

QUnit.test( "go to create archive", function( assert ) {
  Navigation.goto('create-archive');
  assert.equal(window.location.hash, '#create-archive');
  assert.equal($('#main .header h1').text(), 'Create Archive');
});

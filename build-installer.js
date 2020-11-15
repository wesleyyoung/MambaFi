(async function () {
  'use strict';

  const 
    electronInstaller = require('electron-winstaller'),
    { exec } = require('child_process'),
    pkgDir = __dirname + '\\..\\dist\\mambafi-win32-x64\\';

  

  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: pkgDir,
      outputDirectory: __dirname + '\\..\\dist\\installers\\',
      authors: 'Wesley Young',
      exe: 'MambaFi.exe',
      certificateFile: '.\\airkeys.pfx',
      certificatePassword: 'LemonLarry',
      setupIcon: __dirname + '\\src\\assets\\imgs\\logo_icon.ico',
      loadingGif: __dirname + '\\mambafi_loading.gif'
    });
    console.log('It worked!');
  } catch (e) {
    console.log(`No dice: ${e.message}`);
  }
})();
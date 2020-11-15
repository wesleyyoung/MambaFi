(() => {
    'use strict';

    const {exec} = require('child_process');

    if (require('electron-squirrel-startup')) {
        return false;
    } else {
        initializeApp();
    }

    function initializeApp() {

        console.log('Initializing!');

        const
            {app, BrowserWindow} = require('electron'),
            profile = require('./engine/profile'),
            ipc = require('./engine/ipc');

        try {
            exec('netsh wlan show wirelesscapabilities', (err, stdout) => {

                if (err) throw err;

                if (/not running/gi.test(stdout)) {
                    console.log('WiFi Device Not Found');
                }

                profile.generateWlanReports();
            });
        } catch (err) {
            console.log(err);
        }

        ipc.init();

        /**
         *** Electron Functions
         **/

        let mainWindow

        function createWindow() {

            profile.clearProfileCache(() => {
                profile.clearReportCache(() => {

                    mainWindow = new BrowserWindow({
                        width: 900,
                        height: 800,
                        webPreferences: {
                            webSecurity: false,
                            nodeIntegration: true,
                            devTools: true
                        },
                        icon: `${__dirname}\\dist\\assets\\imgs\\logo_icon.ico`
                    });

                    mainWindow.setMenuBarVisibility(false);

                    mainWindow.loadFile('./dist/index.html');

                    mainWindow.on('closed', () => {

                        mainWindow = null;
                    });
                });
            });
        }

        app.on('ready', createWindow);

        app.on('window-all-closed', () => {

            if (process.platform !== 'darwin') {
                profile.clearProfileCache(() => {
                    profile.clearReportCache(() => {
                        app.quit();
                    });
                });
            }
        });

        app.on('activate', () => {

            if (mainWindow === null) createWindow();
        });

    }

})();

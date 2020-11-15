(() => {
    'use strict';

    const
        fs = require('fs'),
        { exec } = require('child_process');

    if (require('electron-squirrel-startup')) {
        return;
    } else {
        initializeApp();
    }

    function initializeApp() {

        console.log('Initializing!');

        const
            { app, BrowserWindow, ipcMain, IpcMessageEvent, dialog } = require('electron'),
            parseString = require('xml2js').parseString;

        try {
            exec('netsh wlan show wirelesscapabilities', (err, stdout) => {

                if (err) throw err;

                if (/not running/gi.test(stdout)) {
                    console.log('WiFi Device Not Found');
                }

                generateWlanReports();
            });
        } catch (err) {
            console.log(err);
        }


        /*
            IPC Functions
        */
        ipcMain.on('refreshProfiles', (event) => {

            getProfiles(profiles => {
                event.sender.send('profiles', profiles);
            });
        });

        ipcMain.on('getNewProfile', (event) => {

            dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
                .then(res => {

                    if (!res.canceled) {

                        let count = 0;

                        function addProfile(path) {

                            exec(`netsh wlan add profile filename="${path}"`, (err, stdout, stderr) => {

                                if (err) throw err;

                                count++;
                                if (res.filePaths[count]) addProfile(res.filePaths[count]);
                                else {
                                    getProfiles(profiles => {
                                        event.sender.send('newProfiles', profiles);
                                    });
                                }
                            });
                        }

                        if (res.filePaths[count]) addProfile(res.filePaths[count]);
                        else {
                            getProfiles(profiles => {
                                event.sender.send('newProfiles', profiles);
                            });
                        }
                    } else {

                    }
                }, err => {
                    if (err) throw err;
                });
        });

        ipcMain.on('addAllProfilesFromFolder', (event) => {

            dialog.showOpenDialog({ properties: ['openDirectory'] })
                .then(res => {

                    if (!res.canceled) {

                        let count = 0;

                        function addProfile(path) {

                            exec(`netsh wlan add profile filename="${res.filePaths[0]}\\${path}"`, (err, stdout, stderr) => {

                                if (err) throw err;
                            });
                        }

                        fs.readdir(res.filePaths[0], (err, files) => {

                            if (err) throw err;

                            files.forEach(file => {
                                if (file.split('.').reverse()[0] == 'xml') {
                                    addProfile(file);
                                }
                            });

                            getProfiles(profiles => {
                                event.sender.send('newProfiles', profiles);
                            });

                        });

                    } else { }
                }, err => {
                    if (err) throw err;
                });
        });

        ipcMain.on('exportAllProfiles', (event) => {

            dialog.showOpenDialog({ properties: ['openDirectory', 'promptToCreate', 'createDirectory'] })
                .then(res => {

                    if (!res.canceled) {

                        exec(`netsh wlan export profile folder="${res.filePaths[0]}" key=clear`, (err) => {
                            if (err) throw err;
                        });
                    } else { }
                }, err => {
                    if (err) throw err;
                });
        });

        ipcMain.on('exportProfiles', (event, profiles) => {

            dialog.showOpenDialog({ properties: ['openDirectory', 'promptToCreate', 'createDirectory'] })
                .then(res => {

                    if (!res.canceled) {

                        profiles.forEach(profile => {
                            exec(`netsh wlan export profile name="${profile.ssid}" folder="${res.filePaths[0]}" key=clear`, (err) => {
                                if (err) throw err;
                            });
                        });

                    } else { }
                }, err => {
                    if (err) throw err;
                });
        });

        ipcMain.on('deleteProfiles', (event, ssid) => {

            ssid.forEach(profile => {
                exec(`netsh wlan delete profile name="${profile.ssid}"`, (err, stdout, stderr) => {
                    if (err) throw err;
                });
            });

            getProfiles(profiles => {
                event.sender.send('newProfiles', profiles);
            });

        });

        function generateWlanReports() {

            exec(`netsh wlan show drivers > ${__dirname}\\wifi_data\\drivers.txt 2> ${__dirname}\\wifi_data\\errors.log`, (err, stdout, stderr) => {
                if (err) throw err;
                exec(`netsh wlan show interfaces > ${__dirname}\\wifi_data\\ifaces.txt 2> ${__dirname}\\wifi_data\\errors.log`, (err, stdout, stderr) => {
                    if (err) throw err;
                    exec(`netsh wlan show settings > ${__dirname}\\wifi_data\\settings.txt 2> ${__dirname}\\wifi_data\\errors.log`, (err, stdout, stderr) => {
                        if (err) throw err;
                        exec(`netsh wlan show filters > ${__dirname}\\wifi_data\\filters.txt 2> ${__dirname}\\wifi_data\\errors.log`, (err, stdout, stderr) => {
                            if (err) throw err;
                        });
                    });
                });
            });
        }

        function clearProfileCache(done) {

            var
                count = 0,
                profiles = [];

            function deleteFile(path) {

                fs.unlink(path, (err) => {

                    if (err) throw err;

                    count++;

                    if (profiles[count]) deleteFile(__dirname + '\\wifi_profiles\\' + profiles[count]);
                    else done();
                });
            }

            fs.readdir(__dirname + '\\wifi_profiles', (err, wlan_profiles) => {

                profiles = wlan_profiles;

                if (profiles[count]) deleteFile(__dirname + '\\wifi_profiles\\' + profiles[count]);
                else done();
            });

        }

        function clearReportCache(done) {

            var
                count = 0,
                reports = [];

            function deleteFile(path) {

                fs.unlink(path, (err) => {

                    if (err) throw err;

                    count++;

                    if (reports[count]) deleteFile(__dirname + '\\wifi_data\\' + reports[count]);
                    else done();
                });
            }

            fs.readdir(__dirname + '\\wifi_data', (err, wlan_data) => {

                reports = wlan_data;

                if (reports[count]) deleteFile(__dirname + '\\wifi_data\\' + reports[count]);
                else done();
            });

        }

        function getProfiles(done) {

            clearProfileCache(() => {

                exec(`netsh wlan export profile folder="${__dirname + '\\wifi_profiles'}" key=clear`, (err, stdout, stderr) => {

                    if (err) throw err;
                    fs.readdir(__dirname + '\\wifi_profiles', (err, profiles) => {

                        if (err) throw err;

                        var
                            index = 0,
                            output = [];

                        function parseProfile(path) {

                            fs.readFile(__dirname + '\\wifi_profiles\\' + path, 'utf8', (err, xml) => {

                                if (err) throw err;

                                parseString(xml, (err, json) => {

                                    if (err) throw err;

                                    let profile = json.WLANProfile;

                                    output.push({
                                        ssid: profile.name[0],
                                        hex: profile.SSIDConfig[0].SSID[0].hex[0],
                                        key: profile.MSM[0].security[0].sharedKey ? profile.MSM[0].security[0].sharedKey[0].keyMaterial[0] : '--',
                                        useOneX: profile.MSM[0].security[0].authEncryption[0].useOneX[0],
                                        oneX: profile.MSM[0].security[0].OneX ?
                                            {
                                                eapType: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].EapMethod[0]['eapCommon:Type'][0],
                                                eapAuthorId: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].EapMethod[0]['eapCommon:AuthorId'][0],
                                                eapTLSCertificateStore: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['eapTls:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['eapTls:EapType'][0]['eapTls:CredentialsSource'][0]['eapTls:CertificateStore'][0] : '--',
                                                eapTLSDisableUserPromptForServerValidation: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['eapTls:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['eapTls:EapType'][0]['eapTls:ServerValidation'][0]['eapTls:DisableUserPromptForServerValidation'][0] : '--',
                                                eapTLSServerNames: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['eapTls:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['eapTls:EapType'][0]['eapTls:ServerValidation'][0]['eapTls:ServerNames'][0] : '--',
                                                eapTLSDifferentUsername: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['eapTls:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['eapTls:EapType'][0]['eapTls:DifferentUsername'][0] : '--',
                                                msPeapType: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'][0]['baseEap:Eap'][0]['baseEap:Type'][0] : '--',
                                                msChapV2UseWinLogonCredentials: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'][0]['baseEap:Eap'][0]['msChapV2:EapType'][0]['msChapV2:UseWinLogonCredentials'][0] : '--',
                                                msPeapDisableUserPromptForServerValidation: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'][0]['msPeap:ServerValidation'][0]['msPeap:DisableUserPromptForServerValidation'][0] : '--',
                                                msPeapTrustedRootCA: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'][0]['msPeap:ServerValidation'][0]['msPeap:TrustedRootCA'][0] : '--',
                                                msPeapFastReconnect: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'][0]['msPeap:FastReconnect'][0] : '--',
                                                msPeapInnerEapOptional: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'][0]['msPeap:InnerEapOptional'][0] : '--',
                                                msPeapEnableQuarantineChecks: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'][0]['msPeap:EnableQuarantineChecks'][0] : '--',
                                                msPeapRequireCryptoBinding: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'][0]['msPeap:RequireCryptoBinding'][0] : '--',
                                                msPeapPeapExtensions: profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'] ? profile.MSM[0].security[0].OneX[0].EAPConfig[0].EapHostConfig[0].Config[0]['baseEap:Eap'][0]['msPeap:EapType'][0]['msPeap:PeapExtensions'][0] : '--'
                                            } : {
                                                eapType: '--',
                                                eapAuthorId: '--',
                                                eapTLSCertificateStore: '--',
                                                eapTLSDisableUserPromptForServerValidation: '--',
                                                eapTLSServerNames: '--',
                                                eapTLSDifferentUsername: '--',
                                                msPeapType: '--',
                                                msChapV2UseWinLogonCredentials: '--',
                                                msPeapDisableUserPromptForServerValidation: '--',
                                                msPeapTrustedRootCA: '--',
                                                msPeapFastReconnect: '--',
                                                msPeapInnerEapOptional: '--',
                                                msPeapEnableQuarantineChecks: '--',
                                                msPeapRequireCryptoBinding: '--',
                                                msPeapPeapExtensions: '--'
                                            },
                                        macRandom: profile.MacRandomization ? profile.MacRandomization[0].enableRandomization[0] : "false",
                                        macRandomSeed: profile.MacRandomization ? profile.MacRandomization[0].randomizationSeed[0] : "false",
                                        authentication: profile.MSM[0].security[0].authEncryption[0].authentication[0],
                                        encryption: profile.MSM[0].security[0].authEncryption[0].encryption[0],
                                        connectionMode: profile.connectionMode[0],
                                        connectionType: profile.connectionType[0]
                                    });

                                    index++;
                                    if (index < profiles.length) parseProfile(profiles[index]);
                                    else done(output);
                                });
                            });
                        }

                        parseProfile(profiles[index]);
                    });
                });
            });
        }


        /**
        *** Electron Functions
        **/

        let mainWindow

        function createWindow() {

            clearProfileCache(() => {
                clearReportCache(() => {

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
                clearProfileCache(() => {
                    clearReportCache(() => {
                        app.quit();
                    });
                });
            }
        });

        app.on('activate', () => {

            if (mainWindow === null) createWindow();
        });

    };

})();
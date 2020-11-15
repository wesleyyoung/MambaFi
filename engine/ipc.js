const {ipcMain, dialog} = require('electron');
const {exec} = require('child_process');
const profile = require('./profile');
const fs = require('fs');

module.exports.init = () => {
    ipcMain.on('refreshProfiles', (event) => {
        profile.getProfiles(profiles => {
            event.sender.send('profiles', profiles);
        });
    });

    ipcMain.on('getNewProfile', (event) => {

        dialog.showOpenDialog({properties: ['openFile', 'multiSelections']})
            .then(res => {

                if (!res.canceled) {

                    let count = 0;

                    function addProfile(path) {

                        exec(`netsh wlan add profile filename="${path}"`, (err, stdout, stderr) => {

                            if (err) throw err;

                            count++;
                            if (res.filePaths[count]) addProfile(res.filePaths[count]);
                            else {
                                profile.getProfiles(profiles => {
                                    event.sender.send('newProfiles', profiles);
                                });
                            }
                        });
                    }

                    if (res.filePaths[count]) addProfile(res.filePaths[count]);
                    else {
                        profile.getProfiles(profiles => {
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

        dialog.showOpenDialog({properties: ['openDirectory']})
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
                            if (file.split('.').reverse()[0] === 'xml') {
                                addProfile(file);
                            }
                        });

                        profile.getProfiles(profiles => {
                            event.sender.send('newProfiles', profiles);
                        });

                    });

                } else {
                }
            }, err => {
                if (err) throw err;
            });
    });

    ipcMain.on('exportAllProfiles', (event) => {

        dialog.showOpenDialog({properties: ['openDirectory', 'promptToCreate', 'createDirectory']})
            .then(res => {

                if (!res.canceled) {

                    exec(`netsh wlan export profile folder="${res.filePaths[0]}" key=clear`, (err) => {
                        if (err) throw err;
                    });
                } else {
                }
            }, err => {
                if (err) throw err;
            });
    });

    ipcMain.on('exportProfiles', (event, profiles) => {

        dialog.showOpenDialog({properties: ['openDirectory', 'promptToCreate', 'createDirectory']})
            .then(res => {

                if (!res.canceled) {

                    profiles.forEach(profile => {
                        exec(`netsh wlan export profile name="${profile.ssid}" folder="${res.filePaths[0]}" key=clear`, (err) => {
                            if (err) throw err;
                        });
                    });

                } else {
                }
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

        profile.getProfiles(profiles => {
            event.sender.send('newProfiles', profiles);
        });

    });
}

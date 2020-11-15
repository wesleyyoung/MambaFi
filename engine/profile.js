const
    fs = require('fs'),
    {parseString} = require('xml2js'),
    {exec} = require('child_process');

module.exports.generateWlanReports = generateWlanReports;
module.exports.clearProfileCache = clearProfileCache;
module.exports.clearReportCache = clearReportCache;
module.exports.getProfiles = getProfiles;

const userDataDir = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");

const wifi_date_dir = `${userDataDir}\\mambafi\\wifi_data`;
const wifi_profiles_dir = `${userDataDir}\\mambafi\\wifi_profiles`;

try {
    fs.mkdirSync(wifi_date_dir);
    fs.mkdirSync(wifi_profiles_dir);
} catch (e) {}

function generateWlanReports() {
    exec(`netsh wlan show drivers > ${wifi_date_dir}\\drivers.txt 2> ${wifi_date_dir}\\errors.log`, (err, stdout, stderr) => {
        if (err) throw err;
        exec(`netsh wlan show interfaces > ${wifi_date_dir}\\ifaces.txt 2> ${wifi_date_dir}\\errors.log`, (err, stdout, stderr) => {
            if (err) throw err;
            exec(`netsh wlan show settings > ${wifi_date_dir}\\settings.txt 2> ${wifi_date_dir}\\errors.log`, (err, stdout, stderr) => {
                if (err) throw err;
                exec(`netsh wlan show filters > ${wifi_date_dir}\\filters.txt 2> ${wifi_date_dir}\\errors.log`, (err, stdout, stderr) => {
                    if (err) throw err;
                });
            });
        });
    });
}

function clearProfileCache(done) {

    let count = 0,
        profiles = [];

    function deleteFile(path) {

        fs.unlink(path, (err) => {

            if (err) throw err;

            count++;

            if (profiles[count]) deleteFile(wifi_profiles_dir + '\\' + profiles[count]);
            else done();
        });
    }

    fs.readdir(wifi_profiles_dir, (err, wlan_profiles) => {

        profiles = wlan_profiles;

        if (profiles && profiles[count]) deleteFile(wifi_profiles_dir + '\\' + profiles[count]);
        else done();
    });

}



function clearReportCache(done) {

    let count = 0,
        reports = [];

    function deleteFile(path) {

        fs.unlink(path, (err) => {

            if (err) throw err;

            count++;

            if (reports[count]) deleteFile(`${wifi_date_dir}\\` + reports[count]);
            else done();
        });
    }

    fs.readdir(wifi_date_dir, (err, wlan_data) => {

        reports = wlan_data;

        if (reports && reports[count]) deleteFile(wifi_date_dir + '\\' + reports[count]);
        else done();
    });

}

function getProfiles(done) {

    clearProfileCache(() => {

        exec(`netsh wlan export profile folder="${wifi_profiles_dir}" key=clear`, (err, stdout, stderr) => {

            if (err) {
                console.log(err);
                console.log(stderr);
                console.log(stdout);
                throw err;
            }

            fs.readdir(wifi_profiles_dir, (err, profiles) => {

                if (err) throw err;

                let index = 0,
                    output = [];

                function parseProfile(path) {

                    fs.readFile(wifi_profiles_dir + '\\' + path, 'utf8', (err, xml) => {

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

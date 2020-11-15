export interface WifiProfile {
    key: string;
    hex?: string;
    ssid: string;
    useOneX: string;
    oneX?: {
        eapType: string,
        eapAuthorId: string,
        eapTLSCertificateStore: string,
        eapTLSDisableUserPromptForServerValidation: string,
        eapTLSServerNames: string,
        eapTLSDifferentUsername: string,
        msPeapType: string,
        msChapV2UseWinLogonCredentials: string,
        msPeapDisableUserPromptForServerValidation: string,
        msPeapTrustedRootCA: string,
        msPeapFastReconnect: string,
        msPeapInnerEapOptional: string,
        msPeapEnableQuarantineChecks: string,
        msPeapRequireCryptoBinding: string,
        msPeapPeapExtensions: string
    };
    macRandom: string;
    macRandomSeed?: string;
    authentication: string;
    connectionMode?: string;
    connectionType: string;
    encryption: string;
}

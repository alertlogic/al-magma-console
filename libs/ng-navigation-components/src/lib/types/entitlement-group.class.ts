
/**
 *  Shared groups of product families.  Meant to correspond with definitions from the metadata for ui-metadata's menu definitions.
 */

/* tslint:disable:variable-name */
export const EntitlementGroup: { [ groupId:string ]:string } = {

    //  Log Manager
    LogManager: "log_manager|cloud_defender",

    //  Threat Manager
    ThreatManager: "threat_manager|cloud_defender",

    //  Full Suite
    CloudDefender: "cloud_defender",

    //  WAF
    WAF: "web_application_firewall",

    //  OOB (WAF)
    WAFOOB: "web_security_manager|cloud_defender",

    //  Log Manager or Threat Manager
    Dunkirk: "threat_manager|log_manager|cloud_defender",

    //  Usage access for TM and OOB WSM
    Usage: "threat_manager|web_security_manager|cloud_defender",

    //  Any Defender product (or full suite)
    AnyDefender: "log_manager|threat_manager|web_security_manager|cloud_defender",

    //  Cloud Insight (included in full suite)
    CloudInsight: "cloud_insight|cloud_defender",

    //  Literally anything, except for legacy features
    Anything: "cloud_insight|web_application_firewall|web_security_manager|cloud_defender|threat_manager|log_manager|detect|respond|assess",

    //  Incidents
    Incidents: "cloud_insight|cloud_defender|threat_manager|log_manager|detect|respond",

    //  Incidents Guardduty
    IncidentsGuardduty: "cloud_insight|cloud_defender&web_application_firewall|web_security_manager|cloud_defender|threat_manager|log_manager&!legacy:customer_facing_incidents",

    //  Incidents Cloud Insight Only
    IncidentsCloudInsightOnly: "cloud_insight&!web_application_firewall|web_security_manager|cloud_defender|threat_manager|log_manager|legacy:customer_facing_incidents",

    //  Incidents V2
    IncidentsV2: "legacy:customer_facing_incidents|respond|detect",

    // Incidents dashboard to exclude non-CI customers
    CloudInsightOnly: "cloud_insight&!active_watch_premier|web_security_managed|web_security_manager|cloud_defender|threat_manager|log_manager",

    //  LogReview
    LogReview: "cloud_defender|log_review",

    //  Literally anything, except for WAF features
    AnythingButWAF: "cloud_insight|web_security_manager|cloud_defender|threat_manager|log_manager",

    //  Literally anything, except for WAF features
    AnythingButWAFIncidents: "cloud_insight|web_security_manager|cloud_defender|threat_manager|log_manager|detect|respond",

    // WSM Deny Logs needs to be available for Inline WAF and OOB WSM customers
    WSMDenyLogs: "web_application_firewall",

    // LM Messages needs to be available for LM, Inline WAF and OOB WSM customers
    LogManagerMessages: "cloud_defender|log_manager|web_security_manager|web_application_manager|web_application_firewall&!detect|respond",

    // Search tab needs to be available for "NON CI ONLY"
    AnythingButCloudInsight: "web_application_firewall|web_security_manager|cloud_defender|threat_manager|log_manager|detect|respond",

    // ThreatManager or LogManager
    ThreatManagerOrLogManager: "threat_manager|log_manager|cloud_defender",

    /** PHOENIX aka Awareness-Detection-Response (Assess-Detect-Respond) */

    // Awareness - assess
    Awareness: "assess",

    // Detection - detect
    Detection: "detect",

    // Response - respond
    Response: "respond",

    // Classic Phoenix products
    ADR: "assess|detect|respond",

    // TM/LM Professional
    TMLMPro: "tmpro|lmpro",

    // Phoenix and migrated Phoenix product
    AnyPhoenix: "assess|detect|respond|phoenix_migrated",

    // Siemless - Any phoenix/ADR and TM/LM Professional customers
    Siemless: "assess|detect|respond|tmpro|lmpro",

    // ThreatManagerDetectResponse for Events
    ThreatManagerDetectResponse: "threat_manager|cloud_defender|detect|respond",

    // AnythingButCloudInsightOrDetectResponse for cases
    AnythingButCloudInsightOrDetectResponse: "web_application_firewall|web_security_manager|cloud_defender|threat_manager|log_manager",

    // LogSearchBeta
    LogSearchBeta: "detect|respond&!cloud_defender|log_manager|web_security_manager|web_application_manager|web_application_firewall",

    // Remediations
    Remediations: "cloud_insight|cloud_defender|detect|respond|assess"
};

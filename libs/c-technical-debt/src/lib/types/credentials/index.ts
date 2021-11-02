/**
 *  A bunch of classes to describe credentials v2 structures.
 *
 *  @author Julian David <jgalvis@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */

/**
 *  CredentialsInsightDescriptor provides a class to describe credential, along with its
 *  raw properties and annotations.
 */
export class CredentialsInsightDescriptor {

    public id: string;
    public modified: any = {};
    public name: string;
    public secrets: CredentialSecretsDescriptor = new CredentialSecretsDescriptor();
    public created: any = {};

    constructor() { }

    public static import(rawData: any) {

        let credential = new CredentialsInsightDescriptor();

        if (!rawData.hasOwnProperty("id")) {
            console.warn("Unexpected input: credential representations must have at least 'id' property");
            return credential;
        }

        credential.id = rawData.hasOwnProperty('id') ? rawData.id : '';
        credential.modified = rawData.hasOwnProperty('modified') ? rawData.modified : {};
        credential.name = rawData.hasOwnProperty('name') ? rawData.name : '';
        credential.created = rawData.hasOwnProperty('created') ? rawData.created : {};

        if (rawData.hasOwnProperty('secrets')) {

            credential.secrets.type = rawData.secrets.hasOwnProperty('type') ? rawData.secrets.type : "";

            if (credential.secrets.type === 'aws_iam_role') {
                credential.secrets.arn = rawData.secrets.hasOwnProperty('arn') ? rawData.secrets.arn : "";
                credential.secrets.external_id = rawData.secrets.hasOwnProperty('external_id') ? rawData.secrets.external_id : "";
            }

            if (credential.secrets.type === 'azure_ad_user') {
                credential.secrets.subscription_id = rawData.secrets.hasOwnProperty('subscription_id') ? rawData.secrets.subscription_id : "";
                credential.secrets.ad_id = rawData.secrets.hasOwnProperty('ad_id') ? rawData.secrets.ad_id : "";
                credential.secrets.username = rawData.secrets.hasOwnProperty('username') ? rawData.secrets.username : "";
                credential.secrets.password = rawData.secrets.hasOwnProperty('password') ? rawData.secrets.password : "";
            }

            if (credential.secrets.type === 'azure_ad_client') {
                credential.secrets.subscription_id = rawData.secrets.hasOwnProperty('subscription_id') ? rawData.secrets.subscription_id : "";
                credential.secrets.ad_id = rawData.secrets.hasOwnProperty('ad_id') ? rawData.secrets.ad_id : "";
                credential.secrets.client_id = rawData.secrets.hasOwnProperty('client_id') ? rawData.secrets.client_id : "";
                credential.secrets.client_secret = rawData.secrets.hasOwnProperty('client_secret') ? rawData.secrets.client_secret : "";
            }

            if (credential.secrets.type === 'keypair') {
                if (rawData.secrets.hasOwnProperty('keypair_type') && rawData.secrets.keypair_type) {
                    credential.secrets.keypair_type = rawData.secrets.keypair_type;
                }
                credential.secrets.certificate = rawData.secrets.hasOwnProperty('certificate') ? rawData.secrets.certificate : "";
                credential.secrets.private_key = rawData.secrets.hasOwnProperty('private_key') ? rawData.secrets.private_key : "";
            }

        }

        return credential;
    }

    public static toJson(entity: CredentialsInsightDescriptor) {
        let json = {
            name: entity.name,
            secrets: {
                type: entity.secrets.type
            }
        };

        if (entity.secrets.type === "aws_iam_role") {
            json.secrets['arn'] = entity.secrets.arn;
        }

        if (entity.secrets.type === "azure_ad_user") {
            json.secrets['ad_id'] = entity.secrets.ad_id;
            json.secrets['username'] = entity.secrets.username;
            json.secrets['password'] = entity.secrets.password;
        }

        if (entity.secrets.type === "azure_ad_client") {
            json.secrets['ad_id'] = entity.secrets.ad_id;
            json.secrets['client_id'] = entity.secrets.client_id;
            json.secrets['client_secret'] = entity.secrets.client_secret;
        }

        if (entity.secrets.type === "keypair") {
            if (entity.secrets.keypair_type) {
                json.secrets['keypair_type'] = entity.secrets.keypair_type;
            }
            json.secrets['certificate'] = entity.secrets.certificate;
            json.secrets['private_key'] = entity.secrets.private_key;
        }

        return json;
    }

}

export class CredentialSecretsDescriptor {
    public type: string;
    public arn?: string;
    public external_id?: string;
    public subscription_id?: string;
    public ad_id?: string;
    public client_id?: string;
    public username?: string;
    public password?: string;
    public client_secret?: string;
    public keypair_type?: string;
    public certificate?: string;
    public private_key?: string;

    constructor() { }
}

export class CredentialsInsightSnapshot {

    public credentials: Array<CredentialsInsightDescriptor> = [];
    /**
     *  @method CredentialsInsightSnapshot.import
     *
     *  This method expects to receive the raw object response from credentials endpoint
     *  /credentials/v1/{accountId}/credentials
     *  It returns a populated instance of type CredentialsInsightSnapshot.
     */
    public static import(rawData: any) {

        let credentials: CredentialsInsightSnapshot = new CredentialsInsightSnapshot();
        let credential: CredentialsInsightDescriptor;

        for (var i = 0; i < rawData.length; i++) {
            let row = rawData[i];
            credential = row.hasOwnProperty('id') ? CredentialsInsightDescriptor.import(row) : new CredentialsInsightDescriptor();
            credentials.credentials.push(credential);
        }

        return credentials;
    }

}

/**
 *  A bunch of classes to describe credentials host scan-related structures.
 *
 *  @author Julian David <jgalvis@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */

/**
 *  DeploymentDescriCredentialHostScanDescriptorptor provides a class to describe credential host scan, along with its
 *  raw properties and annotations.
 */
export class CredentialHostScanDescriptor {

    public id: string;
    public modified: any = {};
    public name: string;
    public product_type: string;
    public type: string;
    public created: any = {};
    public windows?: CredentialHostScanTypeDescriptor;
    public ssh?: CredentialHostScanTypeDescriptor;

    constructor() { }

    public static import(rawData: any) {

        let credential = new CredentialHostScanDescriptor();

        if (!rawData.hasOwnProperty("id")) {
            console.warn("Unexpected input: host representations must have at least 'id' property");
            return credential;
        }

        credential.id = rawData.hasOwnProperty('id') ? rawData.id : '';
        credential.modified = rawData.hasOwnProperty('modified') ? rawData.modified : {};
        credential.name = rawData.hasOwnProperty('name') ? rawData.name : '';
        credential.product_type = rawData.hasOwnProperty('product_type') ? rawData.product_type : '';
        credential.type = rawData.hasOwnProperty('type') ? rawData.type : '';
        credential.created = rawData.hasOwnProperty('created') ? rawData.created : {};
        if (rawData[credential.type]) {
            credential[credential.type] = CredentialHostScanTypeDescriptor.import(rawData[credential.type]);
        }

        return credential;
    }

}

/**
 *  CredentialHostScanTypeDescriptor provides a class to describe credential host scan type, along with its
 *  raw properties and annotations.
 */
export class CredentialHostScanTypeDescriptor {
    public username: string = null;
    public password: string = null;
    public ssh_type?: string;
    public key?: string;

    constructor() { }
    public static import(rawData: any) {

        let credentialType = new CredentialHostScanTypeDescriptor();

        credentialType.username = rawData.hasOwnProperty('username') ? rawData.username : '';
        credentialType.password = rawData.hasOwnProperty('password') ? rawData.password : '';
        credentialType.ssh_type = rawData.hasOwnProperty('ssh_type') ? rawData.ssh_type : '';
        credentialType.key = rawData.hasOwnProperty('key') ? rawData.key : '';
        return credentialType;

    }
}

/**
 *  CredentialHostScanStoreDescriptor provides a class to describe credential host scan how the PUT endpoint receive this data,
 *  along with its raw properties and annotations.
 *  PUT /credentials/v1/:account_id/:environment_id/:asset_type/scan/:asset_key
 */
export class CredentialHostScanStoreDescriptor {
    public name: string = null;
    public username: string = null;
    public type: string = null;
    public password?: string;
    public key?: string;
    public sub_type?: string;
    public snmp_community_string?: string;

    constructor() { }

    public static import(rawData: any) {

        let credentialStore = new CredentialHostScanStoreDescriptor();

        credentialStore.name = rawData.hasOwnProperty('name') ? rawData.name : '';
        credentialStore.username = rawData.hasOwnProperty('username') ? rawData.username : '';
        credentialStore.type = rawData.hasOwnProperty('type') ? rawData.type : '';
        credentialStore.password = rawData.hasOwnProperty('password') ? rawData.password : '';
        credentialStore.key = rawData.hasOwnProperty('key') ? rawData.key : '';
        credentialStore.sub_type = rawData.hasOwnProperty('sub_type') ? rawData.sub_type : '';
        credentialStore.snmp_community_string = rawData.hasOwnProperty('snmp_community_string') ? rawData.snmp_community_string : '';

        return credentialStore;
    }
}

export class CredentialSnapshot {
    credential: Array<number> = [];
    constructor() { }

    public static import(rawData: any) {

        let credentials: CredentialSnapshot = new CredentialSnapshot();
        let credential: any;

        rawData.forEach(credentialRow => {
            credential = credentialRow.credential.hasOwnProperty('id') ? CredentialHostScanDescriptor.import(credentialRow.credential) : new CredentialHostScanDescriptor();
            credentials.credential = credential;
        });

        return credentials;
    }
}

export class CredentialsHostScanSnapshot {

    public hosts: any = {};
    public total_count: number = 0;
    public credentials: CredentialHostScanDescriptor[] = [];
    /**
     *  @method CredentialsHostScanSnapshot.import
     *
     *  This method expects to receive the raw object response from credentials endpoint
     *  /credentials/v1/{accountId}/{deploymentId}/host/scan
     *  It returns a populated instance of type CredentialsHostScanSnapshot.
     */
    public static import(rawData: any) {

        let hosts: CredentialsHostScanSnapshot = new CredentialsHostScanSnapshot();

        if (Object.keys(rawData.hosts).length === 0) {
            console.warn("Unexpected input: the input data to Deployments.import does not appear to be valid credentials data");
            return hosts;
        }
        let credential: any;

        Object.keys(rawData.hosts).forEach(credentialId => {
            let row = rawData.hosts[credentialId];
            hosts.hosts[credentialId] = [];
            if (row.length > 0) {
                hosts.hosts[credentialId].push(CredentialSnapshot.import(row));
            }
        });

        return hosts;
    }

    /**
     *  @method CredentialsHostScanSnapshot.importSourcesCredentials
     *
     *  This method expects to receive the raw object response from  sources credentials endpoint
     *  /sources/v1/{accountId}/credentiasl
     *  It returns a populated instance of type CredentialsHostScanSnapshot.
     */
    public static importSourcesCredentials(rawData: any, topologyOnly: boolean = false) {
        let credentials = new CredentialsHostScanSnapshot();
        // Assets for Topology only accept ssh and windows credentials type.
        let allowedCredentialTypes = ["ssh", "windows"];
        let total_count = 0;

        if (!rawData.hasOwnProperty("credentials")) {
            throw new Error("Unexpected input: the input data to CredentialsHostScanSnapshot.importSourcesCredentials does not appear to be valid sources credentials data");
        }
        let credential = null;
        if (rawData.credentials) {
            for (var i = 0; i < rawData.credentials.length; i++) {
                let row = rawData.credentials[i];
                let saveCredential = true;
                credential = row.hasOwnProperty('credential') ? CredentialHostScanDescriptor.import(row.credential) : new CredentialHostScanDescriptor();

                if (topologyOnly && allowedCredentialTypes.indexOf(credential.type) === -1) {
                    saveCredential = false;
                }
                if (saveCredential) {
                    credentials.credentials.push(credential);
                    total_count++;
                }
            }
        }
        credentials.total_count = total_count;

        return credentials;
    }

    /**
     *  @method CredentialsHostScanSnapshot.importFromCredentials
     *
     *  This method expects to receive the raw object response from credentials v1 endpoint
     *  /credentials/v1/{accountId}/{deploymentId}/{assetType}/scan/{assetKey}
     *  It returns a populated instance of type CredentialsHostScanSnapshot.
     */
    public static importFromCredentials(rawData: any, topologyOnly: boolean = false) {
        let credentials = new CredentialsHostScanSnapshot();
        // Assets for Topology only accept ssh, windows and snmp_community_string credentials type.
        let allowedCredentialTypes = ["ssh", "windows", "snmp_community_string"];
        let total_count = 0;

        if (!rawData.hasOwnProperty("credentials")) {
            throw new Error("Unexpected input: the input data to CredentialsHostScanSnapshot.importFromCredentials does not appear to be valid credentials v1 data");
        }
        let credential = null;
        if (rawData.credentials) {
            for (var i = 0; i < rawData.credentials.length; i++) {
                let row = rawData.credentials[i];
                let saveCredential = true;
                credential = row.hasOwnProperty('credential') ? CredentialHostScanDescriptor.import(row.credential) : new CredentialHostScanDescriptor();

                if (topologyOnly && allowedCredentialTypes.indexOf(credential.type) === -1) {
                    saveCredential = false;
                }
                if (saveCredential) {
                    credentials.credentials.push(credential);
                    total_count++;
                }
            }
        }
        credentials.total_count = total_count;

        return credentials;
    }
}

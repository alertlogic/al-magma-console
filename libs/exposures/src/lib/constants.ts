import { AlBaseCardConfig, AlActionFooterButtons } from "@al/ng-cardstack-components";
import { AlCardstackPropertyDescriptor } from "@al/core";
import { IconBase, IconState } from './types/icons.types';

export namespace AppConstants {
    export class Filters {
        public static commonValueCaptions: {[key:string]: {caption:string}} = {
            "deployment_type:aws": {
                caption: "AWS"
            },
            "deployment_type:datacenter": {
                caption: "Data Center"
            },
            "deployment_type:saas": {
                caption: "SaaS"
            }
        };

        public static filterCaptions = {
            "acl": {
                caption: "ACL"
            },
            "aks-cluster": {
                caption: "AKS Cluster"
            },
            "application": {
                caption: "Application"
            },
            "asset-group": {
                caption: "Asset Group"
            },
            "auto-scaling-group": {
                caption: "Auto Scaling Group"
            },
            "blob-container": {
                caption: "Blob Container"
            },
            "category": {
                caption: "Category"
            },
            "cloud-trail": {
                caption: "Cloud Trail"
            },
            "collector": {
                caption: "Collector"
            },
            "db-instance": {
                caption: "DB Instance"
            },
            "dns-zone": {
                caption: "DNS Zone"
            },
            "deployment": {
                caption: "Deployment",
            },
            "deployment_id": {
                caption: "Deployment",
            },
            "deployment_type": {
                caption: "Platform"
            },
            "external-dns-name": {
                caption: "External DNS Name",
            },
            "external-ip": {
                caption: "External IP",
            },
            "group": {
                caption: "Group"
            },
            "host": {
                caption: "Host"
            },
            "image": {
                caption: "Amazon Machine Image"
            },
            "igw": {
                caption: "Internet Gateway"
            },
            "instance-profile": {
                caption: "Instance Profile"
            },
            "key-vault": {
                caption: "Key Vault"
            },
            "key-vault-key": {
                caption: "Key Vault Key"
            },
            "key-vault-secret": {
                caption: "Key Vault Secret"
            },
            "kms-key": {
                caption: "KMS Key"
            },
            "load-balancer": {
                caption: "Load Balancer"
            },
            "log-profile": {
                caption: "Log Profile"
            },
            "launch-config": {
                caption: "Launch Config"
            },
            "nsg": {
                caption: "Network Security Group"
            },
            "protection_policy_id": {
                caption: "Protection Level"
            },
            "redshift-cluster": {
                caption: "Redshift Cluster"
            },
            "remediation": {
                caption: "Remediation"
            },
            "region": {
                caption: "Region"
            },
            "resource-group": {
                caption: "Resource Group"
            },
            "role": {
                caption: "Role"
            },
            "route": {
                caption: "Route"
            },
            "severity": {
                caption: "Severity"
            },
            "s3-bucket": {
                caption: "S3 Bucket"
            },
            "sg": {
                caption: "Security Group"
            },
            "subnet": {
                caption: "Subnet"
            },
            "storage-account": {
                caption: "Storage Account"
            },
            "tag": {
                caption: "Tag"
            },
            "user": {
                caption: "User"
            },
            "volume": {
                caption: "Volume"
            },
            "vpc": {
                caption: "VPC/VNet/Network"
            },
            "vulnerability": {
                caption: "Vulnerability"
            },
            "webapp": {
                caption: "Web App"
            }
        };

        public static sortOrder = {
            severity: 0,
            category: 1,
            deployment_type: 2,
            deployment_id: 3,
            region: 4,
            "asset-group": 5,
            tag: 6,
            vpc: 7,
            subnet: 8,
            application: 9,
            host: 10,
            "external-ip": 11,
            "external-dns-name": 12,
            image: 13,
            "load-balancer": 14,
            "dns-zone": 15,
            sg: 16,
            group: 17,
            "instance-profile": 18,
            role: 19,
            "s3-bucket": 20,
            user: 21
        };
    }

    export class Characteritics {
        public static defaultBaseCardConfig: AlBaseCardConfig = {
            toggleable: true,
            toggleableButton: true,
            checkable: true,
            hasIcon: true
        };

        public static defaultNonAssetCardstackDefinitions: {[key:string]: AlCardstackPropertyDescriptor} = {
            "severity": {
                property: "severity",
                caption: "Severity",
                values: [],
                metadata: {
                    overrideValueSortOrder: true
                },
                remote: true,
                sortPositionIndex: 4
            },
            "category": {
                property: "category",
                caption: "Category",
                values: [],
                metadata: {},
                remote: true,
                sortPositionIndex: 3
            },
            "deployment_id": {
                property: "deployment_id",
                caption: "Deployment",
                values: [],
                metadata: {},
                remote: true,
                sortPositionIndex: 2
            },
            "deployment_type": {
                property: "deployment_type",
                caption: "Platform",
                values: [],
                metadata: {},
                remote: true,
                sortPositionIndex: 1
            }
        };

        public static defaultSortableByDefination: {[key:string]: AlCardstackPropertyDescriptor} ={
            "caption": {
                property: "caption",
                caption: "Name",
                values: [],
                metadata: null,
                remote: false,
            },
            "cvss_score": {
                property: "cvss_score",
                caption: "Severity",
                values: [],
                metadata: null,
                remote: false,
            },
            "vinstances_count": {
                property: "vinstances_count",
                caption: "Exposure Instances",
                values: [],
                metadata:{},
                remote:false
            },
            "affected_asset_count": {
                property: "affected_asset_count",
                caption: "Affected Assets",
                values: [],
                metadata:{},
                remote:false
            },
            "expiration_Date": {
                property: "expiration_Date",
                caption: "Expiration Date",
                values: [],
                metadata: null,
                remote: false,
            },
            "threatiness": {
                property: "threatiness",
                caption: "TRI Score",
                values: [],
                metadata: null,
                remote: false,
            }
        };
        public static footerRightActions: AlActionFooterButtons[] = [
            { event: 'dispose', icon: 'ui-icon-block', visible: true, text: 'Dispose' },
            { event: 'conclude', icon: 'ui-icon-check', visible: true, text: 'Conclude' }
        ];

        public static threatLevelSortOrder = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
            info: 0
        };

        public static filterUserHelpText = 'Select a deployment to view additional asset filters.';
    }

    export class LeftPanelDetailDescriptor {

        public header:{
                type:string,
                icon:IconBase,
                title:string
        };

        public simplePanel:{
            description:string
        };

        public assessmentHeader:{
            icon:IconState,
            state:string,
            reason:string,
            who:string,
            date:Date|number
        };

        public assessmentBody:Array<{
            name:string,
            assets:Array<{
                icon:IconBase,
                name:string,
            }>
        }>;

        public readOnlyFilter:{
            title: string;
            rank: number,
            elements: { title: string, icon: string, iconMt?: string }[]
        }[];

    }

    export class PageConstant {

        public static Exposure = 'exposures';
        public static Remediations = 'remediations';
        public static Open = 'open';
        public static Disposed = 'disposed';
        public static Concluded = 'concluded';

        public static reasonDispositions = {
            "acceptable_risk":  {
                caption: "Acceptable Risk"
            },
            "false_positive": {
                caption: "False Positive"
            },
            "compensating_control": {
                caption: "Compensating Control"
            }
        };
    }


}

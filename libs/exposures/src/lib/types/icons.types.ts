
export class IconBase {
    constructor(public icon: string = '', public label: string = '', public iconClass: string = '') {
    }
}

export class IconMisc {
    static readonly iconInfo: IconBase = new IconBase('', 'Info', 'fa fa-info-circle');
    static readonly iconBuild: IconBase = new IconBase('build', 'Build', 'material-icons');
}

export class IconSeverity {
    static readonly iconInfo: IconBase = new IconBase('', 'Info', 'fa fa-info-circle');
    static readonly iconLow: IconBase = new IconBase('', 'Low', 'fa fa-circle-o');
    static readonly iconMedium: IconBase = new IconBase('', 'Medium', 'fa fa-adjust');
    static readonly iconHigh: IconBase = new IconBase('', 'High', 'fa fa-circle');
    static readonly iconInfoColor: IconBase = new IconBase('', 'Info', 'fa fa-info-circle risk-low');
    static readonly iconLowColor: IconBase = new IconBase('', 'Low', 'fa fa-circle-o risk-medium');
    static readonly iconMediumColor: IconBase = new IconBase('', 'Medium', 'fa fa-adjust risk-high');
    static readonly iconHighColor: IconBase = new IconBase('', 'High', 'fa fa-circle risk-critical');

    public static getIconColorBySeverity(severity: string) {
        switch (severity) {
            case "high":
                return IconSeverity.iconHighColor;
            case "medium":
                return IconSeverity.iconMediumColor;
            case "low":
                return IconSeverity.iconLowColor;
            case "info":
                return IconSeverity.iconInfoColor;
        }
        // default
        return IconSeverity.iconInfoColor;
    }

    public static getIconBySeverity(severity: string) {
        switch (severity) {
            case "high":
                return IconSeverity.iconHigh;
            case "medium":
                return IconSeverity.iconMedium;
            case "low":
                return IconSeverity.iconLow;
            case "info":
                return IconSeverity.iconInfo;
        }
        // default
        return IconSeverity.iconInfo;
    }
}

export class IconState extends IconBase {
    static readonly iconOpen: IconBase = new IconBase('warning', 'Open', 'material-icons');
    static readonly iconDispose: IconBase = new IconBase('block', 'DISPOSE', 'material-icons');
    static readonly iconConclude: IconBase = new IconBase('check', 'CONCLUDE', 'material-icons');
    static readonly iconRestore: IconBase = new IconBase('restore', 'RESTORE', 'material-icons');
}

export class IconAsset {
    static readonly iconDeploymentAWS: IconBase = new IconBase('', 'Deployment', 'al al-aws');
    static readonly iconDeploymentAzure: IconBase = new IconBase('', 'Deployment', 'al al-azure');
    static readonly iconDeploymentDatacenter: IconBase = new IconBase('', 'Deployment', 'al al-datacenter');
    static readonly iconRegion: IconBase = new IconBase('', 'Region', 'al al-zone');
    static readonly iconVPC: IconBase = new IconBase('', 'VPC', 'al al-vpc');

    public static getAssetIcon(type: string): IconBase {

        let icons = {
            'aws': new IconBase('', 'Deployment', 'al al-aws'),
            'azure': new IconBase('', 'Deployment', 'al al-azure'),
            'dc': new IconBase('', 'Deployment', 'al al-on-prem'),
            'datacenter': new IconBase('', 'Deployment', 'al al-datacenter'),
            'host': new IconBase('', 'Host', 'al al-host'),
            'network': new IconBase('', 'Network', 'al al-topology-network-1'),
            'region': new IconBase('', 'Region', 'al al-zone'),
            'subnet': new IconBase('', 'Subnet', 'al al-subnet'),
            'tag': new IconBase('', 'Tag', 'al al-tag'),
            'vpc': new IconBase('', 'VPC', 'al al-vpc'),
            'collector': new IconBase('', 'Collector', 'al al-application'),
        };
        return icons.hasOwnProperty(type) ? icons[type] : '';
    }

    public static getFilterRank(type:string):number{

        let  filterRanks = {
            'severity': 1,
            'category': 2,
            'deployment_id': 3,
            'deployment': 4,
            'region': 5,
            'vpc': 6,
            'subnet': 7,
            'host': 8,
            'tag': 9,
            'role': 10,
            'user': 11,
            'deployment_type': 12,
            'collector': 13
        };

        return filterRanks.hasOwnProperty(type) ? filterRanks[type] : 100;
    }

}

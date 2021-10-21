import { Component } from '@angular/core';
import {
    AssetDetail,
    Exposure,
    Evidence,
} from '@al/ng-asset-components';
@Component({
    selector: 'assets-examples',
    templateUrl: './assets-examples.component.html',
    styleUrls: ['./assets-examples.component.scss'],
})
export class AssetExamplesComponent {
    public assetMock:AssetDetail = {
        accountId: "2313131",
        deploymentId: "9969EC98-F3DD-4040-86C5-6A9019E2F07E",
        icon: "al al-host",
        iconMt: "",
        key: "/aws/us-west-2/host/i-0e3a96ed0ad2b4b48",
        name: "eks-elastic-cluster-ng-1-Node",
        parentExposures: {
          "489a02c4d2022eb7c2550801df621be5": true
        },
        type: "host",
        hasComplementaryData: true,
        details: [
          {
            "value": "/aws/us-west-2/host/i-0e3a96ed0ad2b4b48",
            "caption": "Key",
            "icon": "al al-key",
            "format": null,
            "show": true
          },
          {
            "value": "host",
            "caption": "Type",
            "icon": "al al-type",
            "format": null,
            "show": true
          },
          {
            "value": "eks-elastic-cluster-ng-1-Node",
            "caption": "Name",
            "icon": "al al-name",
            "format": null,
            "show": true
          },
          {
            "value": "us-west-2c",
            "caption": "Availability Zone",
            "icon": "al al-zone",
            "format": null,
            "show": true
          },
          {
            "value": "vpc-08fba7ce8ab4c4294",
            "caption": "VPC ID",
            "icon": "al al-vpc",
            "format": null,
            "show": true
          },
          {
            "value": "subnet-0b68b348ade74b18d",
            "caption": "Subnet ID",
            "icon": "al al-subnet",
            "format": null,
            "show": true
          },
          {
            "value": "i-0e3a96ed0ad2b4b48",
            "caption": "Instance ID",
            "icon": "al al-instance",
            "format": null,
            "show": true
          },
          {
            "value": "m5.xlarge",
            "caption": "Instance Type",
            "icon": "al al-instance",
            "format": null,
            "show": true
          },
          {
            "value": "192.168.67.186",
            "caption": "Private IP Address",
            "icon": "al al-ip-private",
            "format": null,
            "show": true
          },
          {
            "value": "34.221.52.227",
            "caption": "IP Address",
            "icon": "al al-ip",
            "format": null,
            "show": true
          },
          {
            "value": "x86_64",
            "caption": "Architecture",
            "icon": "al al-asset",
            "format": null,
            "show": true
          },
          {
            "value": "ec2-34-221-52-227.us-west-2.compute.amazonaws.com",
            "caption": "DNS Name",
            "icon": "al al-dns",
            "format": null,
            "show": true
          },
          {
            "value": "arn:aws:iam::948063967832:instance-profile/eksctl-eks-elastic-cluster-nodegroup-ng-1-NodeInstanceProfile-AQ1VB3E2L7HR",
            "caption": "IAM Instance Profile",
            "icon": "al al-iam",
            "format": null,
            "show": true
          },
          {
            "value": "ami-0c13bb9cbfd007e56",
            "caption": "Image ID",
            "icon": "al al-image",
            "format": null,
            "show": true
          },
          {
            "value": "none",
            "caption": "Key Name",
            "icon": "al al-key",
            "format": null,
            "show": true
          },
          {
            "value": "running",
            "caption": "Current State",
            "icon": "fa fa-clock-o",
            "format": null,
            "show": true
          },
          {
            "value": "ip-192-168-67-186.us-west-2.compute.internal",
            "caption": "Private DNS Name",
            "icon": "al al-dns-private",
            "format": null,
            "show": true
          },
          {
            "value": "ec2-34-221-52-227.us-west-2.compute.amazonaws.com",
            "caption": "DNS Name",
            "icon": "al al-dns",
            "format": null,
            "show": true
          },
          {
            "value": 1589208495000,
            "caption": "Launch Time",
            "icon": "al al-launch-time",
            "format": "date",
            "show": true
          },
          {
            "value": 1591954724000,
            "caption": "Last Scanned",
            "icon": "al al-scan",
            "format": "date",
            "show": true,
            "types": [
              "host"
            ],
            "absent": "Never"
          },
          {
            "value": 1589232296229,
            "caption": "Created on",
            "icon": "fa fa-calendar",
            "format": "date",
            "show": true
          },
          {
            "value": 1592415357463,
            "caption": "Modified on",
            "icon": "fa fa-calendar",
            "format": "date",
            "show": true
          }
        ]
    } as AssetDetail;

    public exposureMock:Exposure = {
        hasComplementaryData: true,
        resolution: "Alert Logic recommends that you add an Alert Logic agent to this host. See https://docs.alertlogic.com/home.htm for information on how to install the agent for the appropriate platform.",
        description: "Host Without Alert Logic Agent",
        impact: "A host in your deployment does not have an Alert Logic agent installed, resulting in unmonitored network traffic.",
        accountId: "134249236",
        assetCount: 5,
        "categories": [
          "configuration"
        ],
        cvssScore: 10,
        cvssVector: "AV:N/AC:L/Au:N/C:C/I:C/A:C/PL:A/EM:A",
        "external": false,
        "name": "Host Without Alert Logic Agent",
        remediationId: "agent_install_agent",
        "severity": "high",
        "tags": {},
        "threatiness": 40,
        threatLevel: 3,
        threatScore: 10,
        threatVector: "AV:N/AC:L/Au:N/C:C/I:C/A:C/PL:A/EM:A",
        "type": "vulnerability",
        vinstancesCount: 1,
        "vinstances": [
          {
            "categories": [
              "configuration"
            ],
            "concluded": false,
            "details": "The host does not have an agent installed",
            "disposed": false,
            "key": "/aws/us-west-2/host/i-0e3a9ghawad2b4b48/vulnerability/fbfd50aa180098eee78761c07d62f94f",
            "modifiedOn": 1591956722819,
            "threatiness": 8
          }
        ],
        vulnerabilityId: "489b02c4d4022eb7c2550801df621be5"
    } as Exposure;

    public evidenceMock:Evidence = {
        accountId: "2313131",
        key: "/aws/us-west-2/host/i-0e3a96ed0ad2b4b48/vulnerability/fbfd50aa180098eee78761c07d62f94f",
        assetKey: "/aws/us-west-2/host/i-0e3a9ghawad2b4b48",
        exposureId: "489b02c4d4022eb7c2550801df621be5",
        evidence: "The host does not have an agent installed"
    } as Evidence;
}

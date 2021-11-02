import { Component, Input, OnInit } from '@angular/core';
import { ModalCardDescriptor } from '@components/technical-debt';

@Component({
    selector: 'al-deployment-adr-tutorial',
    templateUrl: './deployment-adr-tutorial.component.html',
    styleUrls: ['./deployment-adr-tutorial.component.scss']
})

export class DeploymentAdrTutorialComponent implements OnInit {
    // @Input() open: boolean;
    @Input()
    set open(open: boolean){
        if (open) {
            this.openModal();
        }
    }


    /**
     * Modal card config
     */
    public index: number = 0;

    public modalCard: ModalCardDescriptor = {
        cards: 4,
        width: "400px",
        height: "400px",
        closeable: true,
        open: false
    };

    public card = {
        title: "Protect Your Workloads",
        matIcon: null,
        classIcon: "al al-shrug",
        iconColor: "#FFB74D",
        items: [
            {
                classIcon: null,
                iconColor: null,
                text: "Ensure your deployments are compliant, while you monitor and address exposures and threats.",
                textAling: "center",
                matIcon: null
            }
        ],
        button: "GET STARTED"
    };

    public card2 = {
        title: "Discover & Declare",
        matIcon: "track_changes",
        iconColor: "#6C6C6C",
        items: [
            {
                classIcon: "al al-aws",
                iconColor: "#FFB74D",
                text: "Alert Logic provides intelligent and automatic discovery, protection, and remediation solutions for your AWS and Azure assets.",
                matIcon: null
            },
            {
                classIcon: "al al-datacenter",
                iconColor: "#BA67C8",
                text: "Alert Logic provides easy configuration and remediation for traditional data centers.",
                matIcon: null
            }
        ]
    };

    public card3 = {
        title: "Essentials, Professional & Enterprise",
        matIcon: "fingerprint",
        iconColor: "#6C6C6C",
        items: [
            {
                matIcon: "check",
                iconColor: "#93CF95",
                text: "Select from three service levels — Alert Logic Essentials, Alert Logic Professional, or Alert Logic Enterprise — for each of your assets.",
            },
            {
                matIcon: "check",
                iconColor: "#93CF95",
                text: "Receive clear, node-based billing for services and capabilities.",
            }
        ]
    };

    public card4 = {
        title: "Compliance and Security",
        matIcon: "security",
        iconColor: "#93CF95",
        items: [
            {
                iconClass: null,
                iconColor: null,
                text: "Alert Logic is a single solution to protect all your workloads and improve security outcomes.",
                textAling: "center",
                materialIcon: null
            },
            {
                iconClass: null,
                iconColor: null,
                text: "Maintain compliance through analytics, reports, and managed services from our team of security experts.",
                textAling: "center",
                materialIcon: null
            }
        ],
        button: "GET STARTED"
    };


    constructor() { }

    ngOnInit() {
    }

    updateIndex(index){
        this.index = index;
    }

    openModal(){
        this.modalCard.open = true;
    }

    closeModal(close) {
        if(close) {
            this.modalCard.open = false;
        }
    }
}

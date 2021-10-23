/**
 * ThemisUtilityService
 *
 * @author Julian David <jgalvis@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 */
import { Injectable } from '@angular/core';
import { ThemisRoleDocument } from '@al/themis';

@Injectable()
export class ThemisRoleUtilityService {

    static resource: string = "roles";
    public role_ci_essentials: ThemisRoleDocument;
    public role_ci_full: ThemisRoleDocument;
    public role_ci_x_account_ct: ThemisRoleDocument;
    public role_cd_full: ThemisRoleDocument;
    public role_ci_manual: ThemisRoleDocument;

    constructor() {
    }

    public createRoleBase(): ThemisRoleDocument{
        return {
            cft: {}
        };
    }

    // ========THEMIS ROLES REFERENCE TRACKING==========
    public startThemisRoleTracking() {
        this.role_ci_essentials = this.createRoleBase();
        this.role_ci_full = this.createRoleBase();
        this.role_ci_x_account_ct = this.createRoleBase();
        this.role_cd_full = this.createRoleBase();
        this.role_ci_manual = this.createRoleBase();
    }

    public getThemisRoleOnTracking(type: string) {
        if (type === 'ci_essentials') { return this.role_ci_essentials; }
        if (type === 'ci_full') { return this.role_ci_full; }
        if (type === 'ci_x_account_ct') { return this.role_ci_x_account_ct; }
        if (type === 'cd_full') { return this.role_cd_full; }
        if (type === 'ci_manual') { return this.role_ci_manual; }
        return null;
    }

    public setThemisRoleOnTracking(role: ThemisRoleDocument) {
        if (role.type === 'ci_essentials') {
            this.role_ci_essentials.type = role.type;
            this.role_ci_essentials.policy_document = role.policy_document;
            this.role_ci_essentials.external_id = role.external_id;
            this.role_ci_essentials.version = role.version;
            this.role_ci_essentials.aws_account_id = role.aws_account_id;
            if (role.hasOwnProperty('cft')) {
                this.role_ci_essentials.cft.s3_url = role.cft.hasOwnProperty('s3_url') ? role.cft.s3_url : '';
            }
        }
        if (role.type === 'ci_full') {
            this.role_ci_full.type = role.type;
            this.role_ci_full.policy_document = role.policy_document;
            this.role_ci_full.external_id = role.external_id;
            this.role_ci_full.version = role.version;
            this.role_ci_full.aws_account_id = role.aws_account_id;
            if (role.hasOwnProperty('cft')) {
                this.role_ci_full.cft.s3_url = role.cft.hasOwnProperty('s3_url') ? role.cft.s3_url : '';
            }
        }
        if (role.type === 'ci_x_account_ct') {
            this.role_ci_x_account_ct.type = role.type;
            this.role_ci_x_account_ct.policy_document = role.policy_document;
            this.role_ci_x_account_ct.external_id = role.external_id;
            this.role_ci_x_account_ct.version = role.version;
            this.role_ci_x_account_ct.aws_account_id = role.aws_account_id;
            if (role.hasOwnProperty('cft')) {
                this.role_ci_x_account_ct.cft.s3_url = role.cft.hasOwnProperty('s3_url') ? role.cft.s3_url : '';
            }
        }
        if (role.type === 'cd_full') {
            this.role_cd_full.type = role.type;
            this.role_cd_full.policy_document = role.policy_document;
            this.role_cd_full.external_id = role.external_id;
            this.role_cd_full.version = role.version;
            this.role_cd_full.aws_account_id = role.aws_account_id;
            if (role.hasOwnProperty('cft')) {
                this.role_cd_full.cft.s3_url = role.cft.hasOwnProperty('s3_url') ? role.cft.s3_url : '';
            }
        }
        if (role.type === 'ci_manual') {
            this.role_ci_manual.type = role.type;
            this.role_ci_manual.policy_document = role.policy_document;
            this.role_ci_manual.external_id = role.external_id;
            this.role_ci_manual.version = role.version;
            this.role_ci_manual.aws_account_id = role.aws_account_id;
            if (role.hasOwnProperty('cft')) {
                this.role_ci_manual.cft.s3_url = role.cft.hasOwnProperty('s3_url') ? role.cft.s3_url : '';
            }
        }
    }

    public destroyThemisRoleOnTracking() {
        this.role_ci_essentials = null;
        this.role_ci_full = null;
        this.role_ci_x_account_ct = null;
        this.role_cd_full = null;
        this.role_ci_manual = null;
    }
}

import { CredentialsInsightService } from './credentials-insight.service';
import { ExclusionsRulesService } from './exclusions-rules.service';
import { InsightUtilityService } from './insight-utility.service';
import { SourcesService } from './sources.service';

export * from './base.apiclient';
export * from './credentials-insight.service';
export * from './exclusions-rules.service';
export * from './insight-utility.service';
export * from './sources.service';

export const TechnicalDebtServices = [
    CredentialsInsightService,
    ExclusionsRulesService,
    InsightUtilityService,
    SourcesService
];

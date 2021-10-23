import { Route } from '@angular/router';
import { AlIdentityResolutionGuard } from '@al/ng-navigation-components';
import { FeatureAuthModule } from '@feature/authentication';

export const ApplicationRoutes:Route[] = [
    {
        path: '',
        // canActivate: [AlIdentityResolutionGuard],
        redirectTo: 'dashboards',
        pathMatch: 'full'
    },
    {
        path: 'dashboards',
        canActivate: [AlIdentityResolutionGuard],
        loadChildren: () => import('@feature/dashboards').then( module => module.DashboardsModule )
    },
    {
      path: 'exposure-management',
      loadChildren: () => import('@feature/exposures').then( module => module.ExposuresModule )
    },
    /*
    {
        path: 'deployments-mdr',
        canActivate: [ AlIdentityResolutionGuard ],
        loadChildren: () => import( '@feature/mdr-deployments' ).then( module => module.FtrMdrDeploymentsModule )
    },
    */
    ...FeatureAuthModule.publicRoutes
];

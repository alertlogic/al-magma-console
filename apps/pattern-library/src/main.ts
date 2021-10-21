import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {
    AlCabinet,
    AlLocatorService,
    AlRuntimeConfiguration,
    ConfigOption,
} from '@al/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const storage = AlCabinet.ephemeral("usageGuide");
const targetEnvironment = storage.get("targetEnvironment", "integration" );

AlRuntimeConfiguration.setOption( ConfigOption.ConsolidatedAccountResolver, true );
AlRuntimeConfiguration.setOption( ConfigOption.NavigationViaConduit, false );
AlRuntimeConfiguration.setOption( ConfigOption.NavigationIntegratedAuth, true );
AlRuntimeConfiguration.setOption( ConfigOption.GestaltAuthenticate, true );
AlRuntimeConfiguration.addParamPreservationRule( 'global', {
    applyTo: [ /\/patterns\/global\/.*/ ],
    volatile: [ "step" ],
    whitelist: [ "search", "widget", "thing" ]
} );
AlRuntimeConfiguration.addParamPreservationRule( 'cards', {
    applyTo: [ /\/patterns\/cards\/.*/ ],
    volatile: [ "step" ],
    whitelist: [ "step", "search", "category" ]
} );
AlLocatorService.setLocations( [ {
    locTypeId: 'usage-guide',
    uri: window.location.origin,
    environment: targetEnvironment
} ] );
AlLocatorService.remapLocationToURI( 'usage-guide', window.location.origin, targetEnvironment );

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

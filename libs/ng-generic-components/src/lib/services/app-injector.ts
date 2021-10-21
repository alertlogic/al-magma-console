/**
 * Helper class to store a reference to app level injector (the root)
 * This can then be shared to other parts (e.g. feature libs) where components need to get references to
 * other services without needing them passed in as constructor args
 * See AlBaseDetailViewComponent in Exposures lib to see this in action.
 */
import { Injector } from '@angular/core';

export class AppInjector {

    private static injector: Injector;

    static setInjector(injector: Injector) {

        AppInjector.injector = injector;

    }

    static getInjector(): Injector {

        return AppInjector.injector;

    }

}

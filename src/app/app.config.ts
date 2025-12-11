import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-AR';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    {
      provide: LOCALE_ID,
      useValue: 'es',
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
  ],
};

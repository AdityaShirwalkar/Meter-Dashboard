import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter,withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient,withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes,withComponentInputBinding()), provideClientHydration(),provideHttpClient(
    withInterceptors([AuthInterceptor])
  )]
};

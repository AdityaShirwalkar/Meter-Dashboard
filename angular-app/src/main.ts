import { bootstrapApplication } from '@angular/platform-browser';
import { MeterComponent } from './app/container/meter.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { isDevMode, importProvidersFrom } from '@angular/core';

bootstrapApplication(MeterComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations(),
  ]
}).catch(err => console.error(err));
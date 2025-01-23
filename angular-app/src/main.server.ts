import { bootstrapApplication } from '@angular/platform-browser';
import { MeterComponent } from './app/container/meter.component';
import { config } from './app/meter.config.server';

const bootstrap = () => bootstrapApplication(MeterComponent, config);

export default bootstrap;
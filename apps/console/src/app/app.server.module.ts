import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { BrowserModule } from '@angular/platform-browser';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    AppModule,
    BrowserModule.withServerTransition( { appId: 'al-magma' } ),
    ServerModule,
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}

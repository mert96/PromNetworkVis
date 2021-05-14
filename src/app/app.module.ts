import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SettingsComponent } from './components/settings/settings.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PatientData} from './global/patientData';
import {GlobalConstants} from './global/globalConstants';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [PatientData, GlobalConstants],
  bootstrap: [AppComponent]
})
export class AppModule { }

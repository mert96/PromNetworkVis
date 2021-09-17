import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SettingsComponent} from './components/settings/settings.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PatientData} from './global/patientData';
import {GlobalConstants} from './global/globalConstants';
import {ClusterGraphComponent} from './components/cluster-graph/cluster-graph.component';
import {EgoGraphComponent} from './components/ego-graph/ego-graph.component';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {ModalModule} from 'ngx-bootstrap/modal';
import { NodelinkComponent } from './components/nodelink/nodelink.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    ClusterGraphComponent,
    EgoGraphComponent,
    NodelinkComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    BrowserAnimationsModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxDatatableModule,
  ],
  providers: [PatientData, GlobalConstants],
  bootstrap: [AppComponent]
})
export class AppModule {
}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material-module';
import { NotePanelComponent } from './note-panel/note-panel.component';
import { MidiConnectionComponent } from './midi-connection/midi-connection.component';

@NgModule({
  declarations: [
    AppComponent,
    NotePanelComponent,
    MidiConnectionComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  bootstrap: [AppComponent],
  providers: [],
})
export class AppModule { }

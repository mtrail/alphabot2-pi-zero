import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MatSliderModule} from '@angular/material/slider';
import {MatCardModule} from '@angular/material/card';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxJoystickModule} from 'ngx-joystick';
import { JoystickComponent } from './joystick/joystick.component';
import { SlidersComponent } from './sliders/sliders.component';

@NgModule({
  declarations: [
    AppComponent,
    JoystickComponent,
    SlidersComponent,
  ],
  imports: [
    BrowserModule,
    MatSliderModule,
    MatCardModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxJoystickModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}

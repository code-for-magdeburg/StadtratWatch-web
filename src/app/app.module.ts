import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { VotingComponent } from './voting/voting.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { SessionComponent } from './session/session.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonComponent } from './person/person.component';
import { SessionsComponent } from './sessions/sessions.component';
import { FractionsComponent } from './fractions/fractions.component';
import { FractionComponent } from './fraction/fraction.component';
import { PartiesComponent } from './parties/parties.component';
import { PartyComponent } from './party/party.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { HomeComponent } from './home/home.component';
import { SortablePersonsDirective } from './persons/sortable-persons.directive';
import { ImpressumComponent } from './impressum/impressum.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactComponent } from './contact/contact.component';
import { SortableFractionsDirective } from './fractions/sortable-fractions.directive';
import { NgChartsModule } from 'ng2-charts';
import {
  ApplicationSuccessRateChartComponent
} from './fractions/application-success-rate-chart/application-success-rate-chart.component';
import {
  VotingsSuccessRateChartComponent
} from './fractions/votings-success-rate-chart/votings-success-rate-chart.component';
import { UniformityScoreChartComponent } from './fractions/uniformity-score-chart/uniformity-score-chart.component';


registerLocaleData(localeDe, 'de-DE');


@NgModule({
  declarations: [
    AppComponent,
    VotingComponent,
    SessionComponent,
    PersonsComponent,
    PersonComponent,
    SessionsComponent,
    FractionsComponent,
    FractionComponent,
    PartiesComponent,
    PartyComponent,
    HomeComponent,
    SortableFractionsDirective,
    SortablePersonsDirective,
    ImpressumComponent,
    PrivacyComponent,
    ContactComponent,
    ApplicationSuccessRateChartComponent,
    VotingsSuccessRateChartComponent,
    UniformityScoreChartComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    TooltipModule.forRoot(),
    NgChartsModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }],
  bootstrap: [AppComponent]
})
export class AppModule {
}

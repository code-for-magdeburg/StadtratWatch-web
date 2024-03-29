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
  ApplicationsSuccessRateChartComponent
} from './components/application-success-rate-chart/applications-success-rate-chart.component';
import {
  VotingsSuccessRateChartComponent
} from './components/votings-success-rate-chart/votings-success-rate-chart.component';
import { UniformityScoreChartComponent } from './components/uniformity-score-chart/uniformity-score-chart.component';
import {
  ParticipationRateChartComponent
} from './components/participation-rate-chart/participation-rate-chart.component';
import { AbstentionRateChartComponent } from './components/abstention-rate-chart/abstention-rate-chart.component';
import { CouncilorCardComponent } from './components/councilor-card/councilor-card.component';
import { SortablePartiesDirective } from './parties/sortable-parties.directive';
import { SortableFractionApplicationsDirective } from './fractions/sortable-fraction-applications.directive';
import { FormsModule } from '@angular/forms';
import { FractionApplicationSuccessRateComponent } from './fraction/fraction-application-success-rate/fraction-application-success-rate.component';
import { FractionVotingsSuccessRateComponent } from './fraction/fraction-votings-success-rate/fraction-votings-success-rate.component';
import { FractionUniformityScoreComponent } from './fraction/fraction-uniformity-score/fraction-uniformity-score.component';
import { FractionParticipationRateComponent } from './fraction/fraction-participation-rate/fraction-participation-rate.component';
import { FractionAbstentionRateComponent } from './fraction/fraction-abstention-rate/fraction-abstention-rate.component';
import { PersonVotingAttendanceComponent } from './person/person-voting-attendance/person-voting-attendance.component';
import { PersonVotingSuccessRateComponent } from './person/person-voting-success-rate/person-voting-success-rate.component';
import { PersonAbstentionRateComponent } from './person/person-abstention-rate/person-abstention-rate.component';
import { PartyVotingsSuccessRateComponent} from './party/party-votings-success-rate/party-votings-success-rate.component';
import { PartyUniformityScoreComponent } from './party/party-uniformity-score/party-uniformity-score.component';
import { PartyParticipationRateComponent } from './party/party-participation-rate/party-participation-rate.component';
import { PartyAbstentionRateComponent } from './party/party-abstention-rate/party-abstention-rate.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SpeakingTimeChartComponent } from './components/speaking-time-chart/speaking-time-chart.component';
import { SpeakingTimePipe } from './pipes/speaking-time.pipe';


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
    SortableFractionApplicationsDirective,
    SortableFractionsDirective,
    SortablePersonsDirective,
    SortablePartiesDirective,
    ImpressumComponent,
    PrivacyComponent,
    ContactComponent,
    ApplicationsSuccessRateChartComponent,
    VotingsSuccessRateChartComponent,
    UniformityScoreChartComponent,
    ParticipationRateChartComponent,
    AbstentionRateChartComponent,
    CouncilorCardComponent,
    FractionApplicationSuccessRateComponent,
    FractionVotingsSuccessRateComponent,
    FractionUniformityScoreComponent,
    FractionParticipationRateComponent,
    FractionAbstentionRateComponent,
    PersonVotingAttendanceComponent,
    PersonVotingSuccessRateComponent,
    PersonAbstentionRateComponent,
    PartyVotingsSuccessRateComponent,
    PartyUniformityScoreComponent,
    PartyParticipationRateComponent,
    PartyAbstentionRateComponent,
    SpeakingTimeChartComponent,
    SpeakingTimePipe
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    TooltipModule.forRoot(),
    NgChartsModule,
    FormsModule,
    TabsModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }],
  bootstrap: [AppComponent]
})
export class AppModule {
}

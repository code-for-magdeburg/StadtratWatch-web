import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { VotingComponent } from './voting/voting.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { SessionComponent } from './session/session.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonComponent } from './person/person.component';
import { SessionsComponent } from './sessions/sessions.component';
import { FactionsComponent } from './factions/factions.component';
import { FactionComponent } from './faction/faction.component';
import { PartiesComponent } from './parties/parties.component';
import { PartyComponent } from './party/party.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ElectoralPeriodComponent } from './electoral-period/electoral-period.component';
import { SortablePersonsDirective } from './persons/sortable-persons.directive';
import { ImpressumComponent } from './impressum/impressum.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactComponent } from './contact/contact.component';
import { SortableFactionsDirective } from './factions/sortable-factions.directive';
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
import { SortableFactionApplicationsDirective } from './faction/sortable-faction-applications.directive';
import { FormsModule } from '@angular/forms';
import {
  FactionApplicationSuccessRateComponent
} from './faction/faction-application-success-rate/faction-application-success-rate.component';
import {
  FactionVotingsSuccessRateComponent
} from './faction/faction-votings-success-rate/faction-votings-success-rate.component';
import { FactionUniformityScoreComponent } from './faction/faction-uniformity-score/faction-uniformity-score.component';
import {
  FactionParticipationRateComponent
} from './faction/faction-participation-rate/faction-participation-rate.component';
import { FactionAbstentionRateComponent } from './faction/faction-abstention-rate/faction-abstention-rate.component';
import { PersonVotingAttendanceComponent } from './person/person-voting-attendance/person-voting-attendance.component';
import {
  PersonVotingSuccessRateComponent
} from './person/person-voting-success-rate/person-voting-success-rate.component';
import { PersonAbstentionRateComponent } from './person/person-abstention-rate/person-abstention-rate.component';
import {
  PartyVotingsSuccessRateComponent
} from './party/party-votings-success-rate/party-votings-success-rate.component';
import { PartyUniformityScoreComponent } from './party/party-uniformity-score/party-uniformity-score.component';
import { PartyParticipationRateComponent } from './party/party-participation-rate/party-participation-rate.component';
import { PartyAbstentionRateComponent } from './party/party-abstention-rate/party-abstention-rate.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SpeakingTimeChartComponent } from './components/speaking-time-chart/speaking-time-chart.component';
import { SpeakingTimePipe } from './pipes/speaking-time.pipe';
import { YoutubeTimestampPipe } from './pipes/youtube-timestamp.pipe';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { PaperComponent } from './paper/paper.component';
import { SearchComponent } from './search/search.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PaperSearchResultCardComponent } from './search/paper-search-result-card/paper-search-result-card.component';
import {
  SpeechSearchResultCardComponent
} from './search/speech-search-result-card/speech-search-result-card.component';


registerLocaleData(localeDe, 'de-DE');


@NgModule({
  declarations: [
    AppComponent,
    VotingComponent,
    SessionComponent,
    PersonsComponent,
    PersonComponent,
    SessionsComponent,
    FactionsComponent,
    FactionComponent,
    PartiesComponent,
    PartyComponent,
    ElectoralPeriodComponent,
    SortableFactionApplicationsDirective,
    SortableFactionsDirective,
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
    FactionApplicationSuccessRateComponent,
    FactionVotingsSuccessRateComponent,
    FactionUniformityScoreComponent,
    FactionParticipationRateComponent,
    FactionAbstentionRateComponent,
    PersonVotingAttendanceComponent,
    PersonVotingSuccessRateComponent,
    PersonAbstentionRateComponent,
    PartyVotingsSuccessRateComponent,
    PartyUniformityScoreComponent,
    PartyParticipationRateComponent,
    PartyAbstentionRateComponent,
    SpeakingTimeChartComponent,
    SpeakingTimePipe,
    YoutubeTimestampPipe,
    PaperComponent,
    SearchComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    TooltipModule.forRoot(),
    NgChartsModule,
    FormsModule,
    TabsModule,
    BsDropdownModule,
    BreadcrumbComponent,
    PaginationModule.forRoot(),
    PaperSearchResultCardComponent,
    SpeechSearchResultCardComponent
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-DE' },
    provideHttpClient(withFetch()),
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

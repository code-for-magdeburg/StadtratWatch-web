import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VotingComponent } from './voting/voting.component';
import { SessionComponent } from './session/session.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonComponent } from './person/person.component';
import { SessionsComponent } from './sessions/sessions.component';
import { FractionsComponent } from './fractions/fractions.component';
import { FractionComponent } from './fraction/fraction.component';
import { PartiesComponent } from './parties/parties.component';
import { PartyComponent } from './party/party.component';
import { ElectionPeriodComponent } from './election-period/election-period.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactComponent } from './contact/contact.component';
import { ImpressumComponent } from './impressum/impressum.component';


export const ELECTION_PERIOD_PATH = 'ep';


const routes: Routes = [
  { path: '', component: ElectionPeriodComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod`, component: ElectionPeriodComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod/sessions`, component: SessionsComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod/session/:id`, component: SessionComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod/session/:session-id/voting/:voting-id`, component: VotingComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod/fractions`, component: FractionsComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod/fraction/:id`, component: FractionComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod/parties`, component: PartiesComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod/party/:id`, component: PartyComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod/persons`, component: PersonsComponent },
  { path: `${ELECTION_PERIOD_PATH}/:electionPeriod/person/:id`, component: PersonComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'privacy', component: PrivacyComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

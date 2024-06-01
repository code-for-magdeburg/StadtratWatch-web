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
import { environment } from '../environments/environment';


const routes: Routes = [
  { path: '', redirectTo: `ep/${environment.currentElectionPeriod}`, pathMatch: 'full' },
  { path: 'ep/:electionPeriod', component: ElectionPeriodComponent },
  { path: 'ep/:electionPeriod/sessions', component: SessionsComponent },
  { path: 'ep/:electionPeriod/session/:id', component: SessionComponent },
  { path: 'ep/:electionPeriod/session/:session-id/voting/:voting-id', component: VotingComponent },
  { path: 'ep/:electionPeriod/fractions', component: FractionsComponent },
  { path: 'ep/:electionPeriod/fraction/:id', component: FractionComponent },
  { path: 'ep/:electionPeriod/parties', component: PartiesComponent },
  { path: 'ep/:electionPeriod/party/:id', component: PartyComponent },
  { path: 'ep/:electionPeriod/persons', component: PersonsComponent },
  { path: 'ep/:electionPeriod/person/:id', component: PersonComponent },
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

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
import { HomeComponent } from './home/home.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactComponent } from './contact/contact.component';
import { ImpressumComponent } from './impressum/impressum.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sessions', component: SessionsComponent },
  // { path: 'session/:id', component: SessionComponent },
  // { path: 'session/:session-id/voting/:voting-id', component: VotingComponent },
  // { path: 'fractions', component: FractionsComponent },
  // { path: 'fraction/:id', component: FractionComponent },
  // { path: 'parties', component: PartiesComponent },
  // { path: 'party/:id', component: PartyComponent },
  // { path: 'persons', component: PersonsComponent },
  // { path: 'person/:id', component: PersonComponent },
  // { path: 'contact', component: ContactComponent },
  // { path: 'impressum', component: ImpressumComponent },
  // { path: 'privacy', component: PrivacyComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

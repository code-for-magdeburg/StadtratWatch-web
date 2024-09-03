import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VotingComponent } from './voting/voting.component';
import { SessionComponent } from './session/session.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonComponent } from './person/person.component';
import { SessionsComponent } from './sessions/sessions.component';
import { FactionsComponent } from './factions/factions.component';
import { FactionComponent } from './faction/faction.component';
import { PartiesComponent } from './parties/parties.component';
import { PartyComponent } from './party/party.component';
import { ElectoralPeriodComponent } from './electoral-period/electoral-period.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactComponent } from './contact/contact.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { PaperComponent } from './paper/paper.component';
import { SearchComponent } from './search/search.component';


export const ELECTORAL_PERIOD_PATH = 'ep';
export const PAPER_PATH = 'paper';


const routes: Routes = [
  { path: '', component: ElectoralPeriodComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod`, component: ElectoralPeriodComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/sessions`, component: SessionsComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/session/:id`, component: SessionComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/session/:session-id/voting/:voting-id`, component: VotingComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/factions`, component: FactionsComponent },
  // Temporary fix: The slug "magdeburg-7" is used for the electoral period "7" here
  { path: `ep/7/faction/:id`, redirectTo: `${ELECTORAL_PERIOD_PATH}/magdeburg-7/faction/:id` },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/faction/:id`, component: FactionComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/parties`, component: PartiesComponent },
  // Temporary fix: The slug "magdeburg-7" is used for the electoral period "7" here
  { path: `ep/7/party/:id`, redirectTo: `${ELECTORAL_PERIOD_PATH}/magdeburg-7/party/:id` },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/party/:id`, component: PartyComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/persons`, component: PersonsComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/person/:id`, component: PersonComponent },
  { path: `${PAPER_PATH}`, component: PaperComponent },
  { path: `search`, component: SearchComponent },
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

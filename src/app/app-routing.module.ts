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


export const ELECTORAL_PERIOD_PATH = 'ep';


const routes: Routes = [
  { path: '', component: ElectoralPeriodComponent },

  // Redirect /ep/7/* to /ep/magdeburg-7/*
  { path: `ep/7`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7`, pathMatch: 'full' },
  { path: `ep/7/sessions`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7/sessions`, pathMatch: 'full' },
  { path: `ep/7/session/:id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7/session/:session-id/voting/:voting-id`, pathMatch: 'full' },
  { path: `ep/7/session/:session-id/voting/:voting-id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7/session/:session-id/voting/:voting-id`, pathMatch: 'full' },
  { path: `ep/7/factions`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7/factions`, pathMatch: 'full' },
  { path: `ep/7/faction/:id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7/faction/:id`, pathMatch: 'full' },
  { path: `ep/7/parties`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7/parties`, pathMatch: 'full' },
  { path: `ep/7/party/:id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7/party/:id`, pathMatch: 'full' },
  { path: `ep/7/persons`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7/persons`, pathMatch: 'full' },
  { path: `ep/7/person/:id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-7/person/:id`, pathMatch: 'full' },

  // Redirect /ep/8/* to /ep/magdeburg-8/*
  { path: `ep/8`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8`, pathMatch: 'full' },
  { path: `ep/8/sessions`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8/sessions`, pathMatch: 'full' },
  { path: `ep/8/session/:id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8/session/:session-id/voting/:voting-id`, pathMatch: 'full' },
  { path: `ep/8/session/:session-id/voting/:voting-id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8/session/:session-id/voting/:voting-id`, pathMatch: 'full' },
  { path: `ep/8/factions`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8/factions`, pathMatch: 'full' },
  { path: `ep/8/faction/:id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8/faction/:id`, pathMatch: 'full' },
  { path: `ep/8/parties`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8/parties`, pathMatch: 'full' },
  { path: `ep/8/party/:id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8/party/:id`, pathMatch: 'full' },
  { path: `ep/8/persons`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8/persons`, pathMatch: 'full' },
  { path: `ep/8/person/:id`, redirectTo: `/${ELECTORAL_PERIOD_PATH}/magdeburg-8/person/:id`, pathMatch: 'full' },

  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod`, component: ElectoralPeriodComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/sessions`, component: SessionsComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/session/:id`, component: SessionComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/session/:session-id/voting/:voting-id`, component: VotingComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/factions`, component: FactionsComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/faction/:id`, component: FactionComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/parties`, component: PartiesComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/party/:id`, component: PartyComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/persons`, component: PersonsComponent },
  { path: `${ELECTORAL_PERIOD_PATH}/:electoralPeriod/person/:id`, component: PersonComponent },

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

import { Component, Input } from '@angular/core';
import { PersonLightDto } from '../../model/Person';
import { ELECTORAL_PERIOD_PATH } from '../../app-routing.module';


export type Councilor = {
  personId: string;
  name: string;
  party: string;
  councilorUntil: string | null;
};


@Component({
  selector: 'app-councilor-card',
  templateUrl: './councilor-card.component.html',
  styleUrls: ['./councilor-card.component.scss']
})
export class CouncilorCardComponent {


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;


  @Input() public electoralPeriod!: number;
  @Input() public councilor!: Councilor;


  public static mapPersonToCouncilor(person: PersonLightDto): Councilor {
    return {
      personId: person.id,
      name: person.name,
      party: person.party,
      councilorUntil: person.councilorUntil
    };
  }


}

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FractionsService } from '../services/fractions.service';
import { PersonsService } from '../services/persons.service';
import { forkJoin } from 'rxjs';


type Fraction = {
  name: string;
  uniformityScore: number;
};

type FractionMember = {
  personId: string;
  name: string;
  party: string;
};


@Component({
  selector: 'app-fraction',
  templateUrl: './fraction.component.html',
  styleUrls: ['./fraction.component.scss']
})
export class FractionComponent {


  public fraction: Fraction | null = null;
  public members: FractionMember[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly fractionsService: FractionsService,
              private readonly personsService: PersonsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const fractionId = params.get('id');
      if (!fractionId) {
        // TODO: Handle missing fraction id
        return;
      }

      forkJoin([
        this.fractionsService.fetchFraction(fractionId),
        this.personsService.fetchPersonsByFraction(fractionId)
      ])
        .subscribe(([fraction, persons]) => {
          this.fraction = { name: fraction.name, uniformityScore: fraction.uniformityScore };
          this.members = persons.map(person => ({
            personId: person.id,
            name: person.name,
            party: person.party
          }));
        });

    });

  }


}

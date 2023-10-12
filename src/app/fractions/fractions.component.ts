import { Component } from '@angular/core';
import { FractionDto } from '../model/Fraction';
import { FractionsService } from '../services/fractions.service';


@Component({
  selector: 'app-fractions',
  templateUrl: './fractions.component.html',
  styleUrls: ['./fractions.component.scss']
})
export class FractionsComponent {


  public fractions: FractionDto[] = [];


  constructor(private readonly fractionsService: FractionsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {
    this.fractionsService
      .fetchFractions()
      .subscribe(fractions => {
        this.fractions = fractions;
        this.fractions.sort((a, b) => b.membersCount - a.membersCount);
      });
  }


}

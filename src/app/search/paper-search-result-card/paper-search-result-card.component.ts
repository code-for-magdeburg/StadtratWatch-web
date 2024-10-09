import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgIf } from "@angular/common";


export type PaperSearchResultItem = {
  id: string;
  title: string;
  reference: string;
  type: string;
  content: string;
};


@Component({
  selector: 'app-paper-search-result-card',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    NgIf
  ],
  templateUrl: './paper-search-result-card.component.html',
  styleUrl: './paper-search-result-card.component.scss'
})
export class PaperSearchResultCardComponent {


  @Input() public paper!: PaperSearchResultItem;


}

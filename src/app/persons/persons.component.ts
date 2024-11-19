import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { PersonsService } from '../services/persons.service';
import { PersonLightDto } from '../../interfaces/Person';
import { compare, SortablePersonsDirective, SortPersonsEvent } from './sortable-persons.directive';
import * as d3 from 'd3';
import {
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  SimulationLinkDatum,
  SimulationNodeDatum
} from 'd3';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';


const VALUE_THRESHOLD = .65;

const FILL_COLOR_MAP = new Map([
  ['magdeburg-7 - CDU', '#16B9DE'],
  ['magdeburg-7 - SPD', '#F33F2F'],
  ['magdeburg-7 - DIE LINKE', '#C535E5'],
  ['magdeburg-7 - Gartenpartei/Tierschutzallianz', '#107012'],
  ['magdeburg-7 - AfD', '#0845C5'],
  ['magdeburg-7 - FDP/Tierschutzpartei', '#E7D251'],
  ['magdeburg-7 - GRÜNE/future!', '#3EAD3E'],
  ['magdeburg-7 - Oberbürgermeisterin', '#A1A2A1'],

  ['magdeburg-8 - CDU/FDP', '#16B9DE'],
  ['magdeburg-8 - SPD/Tierschutzallianz/Volt', '#F33F2F'],
  ['magdeburg-8 - DIE LINKE', '#C535E5'],
  ['magdeburg-8 - Gartenpartei', '#107012'],
  ['magdeburg-8 - AfD', '#0845C5'],
  ['magdeburg-8 - Tierschutzpartei', '#E7D251'],
  ['magdeburg-8 - GRÜNE/future!', '#3EAD3E'],
  ['magdeburg-8 - Oberbürgermeisterin', '#A1A2A1']
]);


const DISTANCE_MAP = new Map([
  ['magdeburg-7', 200],
  ['magdeburg-8', 200]
]);


type GraphData = {
  nodes: Node[];
  links: Link[];
};

interface Node extends SimulationNodeDatum {
  id: string;
  name: string;
  faction: string;
}

interface Link extends SimulationLinkDatum<Node> {
  value: number;
}


@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
})
export class PersonsComponent implements OnInit {


  private data: PersonLightDto[] = [];

  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public electoralPeriod = environment.currentElectoralPeriod;
  public isBrowser = false;
  public sortedPersons: PersonLightDto[] = [];


  @ViewChild('tabs', { static: true }) tabs?: TabsetComponent;
  @ViewChild('graphContainer', { static: false }) graphContainer!: ElementRef;
  @ViewChildren(SortablePersonsDirective) headers: QueryList<SortablePersonsDirective> | undefined;

  constructor(private readonly route: ActivatedRoute, private readonly personsService: PersonsService,
              @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser  = isPlatformBrowser(this.platformId);
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {

      const { electoralPeriod } = params;

      this.electoralPeriod = electoralPeriod;
      this.sortedPersons = this.data = await this.personsService.fetchPersons(electoralPeriod);
      this.sortedPersons.sort((a, b) => a.name.localeCompare(b.name));

      const data = await this.personsService.fetchAllPersonsForces(electoralPeriod);

      this.tabs ? this.tabs.tabs[1].active = true : null;

      setTimeout(() => {
        if (this.isBrowser) {
          this.drawGraph(data as GraphData);
          this.tabs ? this.tabs.tabs[0].active = true : null;
        }
      }, 1);

    });

  }


  onSort(sortEvent: SortPersonsEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortablePersons !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.sortedPersons = this.data;
    } else {
      this.sortedPersons = [...this.data].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
    }

  }


  private drawGraph(data: GraphData) {

    const width = this.graphContainer.nativeElement.clientWidth;
    const height = this.graphContainer.nativeElement.clientHeight;

    const nodes = data.nodes.map(d => ({ ...d }) as Node);
    const links = data.links.filter(d => d.value > VALUE_THRESHOLD).map(d => ({ ...d }) as Link);

    const simulation = forceSimulation(nodes)
      .force('charge', forceManyBody())
      .force('link', forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(l => DISTANCE_MAP.get(`${this.electoralPeriod}`)! * (1 - l.value)))
      .force('center', forceCenter(width / 3, height / 3))
      .force('collision', forceCollide(5))
      .on('tick', ticked);

    const svg = d3
      .select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; background: #f5f5f5')
      .call(
        d3
          .zoom<any, any>()
          .on(
            'zoom',
            (event) => {
              d3.select('svg g').attr('transform', event.transform);
            }
          )
      );


    const tooltip = d3
      .select(this.graphContainer.nativeElement)
      .append('div')
      .classed('person-tooltip', true)
      .style('opacity', 0)

    const circleEnter = svg
      .append('g')
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', d => FILL_COLOR_MAP.get(`${this.electoralPeriod} - ${d.faction}`)!);

    circleEnter.call(
      drag<any, any>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
    );

    circleEnter
      .on('mouseover', mouseOver)
      .on('mouseleave', mouseLeave);

    function ticked() {
      circleEnter
        .attr('cx', node => node.x!)
        .attr('cy', node => node.y!);
    }

    function dragStarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    function mouseOver(event: any, node: Node) {
      tooltip
        .transition()
        .duration(300)
        .style('opacity', 1);
      tooltip
        .html(`
<span class="fw-bold">
    ${node.name}
</span>
<br>
<span class="text-secondary fw-normal">
    ${node.faction}
</span>`)
        .style('left', `${event.pageX - tooltip.node()!.offsetWidth - 5}px`)
        .style('top', `${event.pageY - tooltip.node()!.offsetHeight}px`);
    }

    function mouseLeave() {
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 0);
    }

  }


}

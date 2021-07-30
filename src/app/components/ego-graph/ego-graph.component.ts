import {Component, OnInit} from '@angular/core';
import {PatientData} from '../../global/patientData';
import {Patient} from '../../objects/patient';
import {ClusterServiceService} from '../../services/cluster-service.service';
import {EgoGraphService} from '../../services/ego-graph.service';
import * as d3 from 'd3';
import * as math from 'mathjs';
import {DegreeOfSimilarityService} from '../../services/degree-of-similarity.service';

@Component({
  selector: 'app-ego-graph',
  templateUrl: './ego-graph.component.html',
  styleUrls: ['./ego-graph.component.scss']
})

export class EgoGraphComponent implements OnInit {

  isDropup = true;
  dataAvailable = false;
  completedPatients: Patient[] = [];
  selectedPatient: Patient | null = null;

  private selectedPatientData!: Map<number, number[]>;

  width = 750;
  height = 350;

  private svgContainer!: d3.Selection<SVGElement, {}, HTMLElement, any>;
  private g!: d3.Selection<SVGGElement, {}, HTMLElement, any>;

  private zoom!: d3.ZoomBehavior<any, unknown>;

  constructor(private patientData: PatientData,
              private clusterService: ClusterServiceService,
              private egoGraphService: EgoGraphService,
              private dosService: DegreeOfSimilarityService) {
  }

  ngOnInit(): void {

    d3.select('#ego-svg')
      .append('text')
      .attr('x', 250)
      .attr('y', 145)
      .text('Please read .csv file and press refresh');

    this.clusterService.loadedData.subscribe((isLoaded: boolean) => {
      if (isLoaded) {
        d3.selectAll('text')
        d3.selectAll('#ego-group').remove();
        d3.selectAll('rect').remove();
        this.dataAvailable = true;
        this.resetSelectedPatient();
        this.getCompletedPatients();
      }
    });

  }

  getCompletedPatients(): void {
    this.completedPatients = [];
    this.patientData.patients.forEach(value => {
      if (value.completed) {
        this.completedPatients.push(value);
      }
    });
  }

  resetSelectedPatient(): void {
    this.selectedPatient = null;
  }

  setSelectedPatient(p: Patient): void {
    this.selectedPatient = p;
    this.selectedPatientData = this.egoGraphService.calculateSimilarPatients(p);
    console.log(this.selectedPatientData);
    this.drawGraph();
  }

  prepareData(): object[] {

    const data = [];

    for (const [visit, values] of this.selectedPatientData) {
      for (const value of values) {

        const p: Patient = this.selectedPatient as Patient;
        const dosValue = this.dosService.getScore(p.patientId, value, visit);

        data.push({
          patientId: value,
          visitId: visit,
          dos: dosValue
        });
      }
    }

    return data;
  }

  drawGraph(): void {

    d3.selectAll('#ego-group').remove();
    d3.selectAll('rect').remove();

    this.zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('start', this.zoomStart.bind(this))
      .on('zoom', this.zooming.bind(this))
      .on('end', this.zoomEnd.bind(this));


    this.svgContainer = (d3.select('#ego-svg') as any)
      .call(this.zoom);


    this.g = this.svgContainer.append('g')
      .attr('id', 'ego-group');

    this.g.append('text')
      .style('font-size', '10px')
      .attr('x', 30)
      .attr('y', 60 + 60 * 0)
      .text('Visit 1');
    this.g.append('text')
      .style('font-size', '10px')
      .attr('x', 30)
      .attr('y', 60 + 60 * 1)
      .text('Visit 2');
    this.g.append('text')
      .style('font-size', '10px')
      .attr('x', 30)
      .attr('y', 60 + 60 * 2)
      .text('Visit 3');

    const data = this.prepareData();

    const node = this.g
      .selectAll('g')
      .data(data)
      .join('g')
      .on('click', () => {

      })
      .attr('id', 'ego-node');

    let currentVisit = 0;
    let j = 0;

    node.append('rect')
      .on('mouseover', (d, i: { patientId?: number; visitId?: number; dos?: number; }) => {
        // console.log(d, i);
        // this.g
        //   .append('text')
        //   .style('font-size', '10px')
        //   .attr('id', 'hoverText')
        //   .attr('x', d.layerX)
        //   .attr('y', d.layerY)
        //   .text(i.dos + '');
      })
      .on('mouseout', (d: { patientId?: number; visitId?: number; dos?: number; }, i) => {
        // d3.selectAll('#hoverText').remove();
      })
      .attr('x', (d: { patientId?: number; visitId?: number; dos?: number; }, i, nodes) => {
        if (d.visitId !== currentVisit) {
          j = 0;
          currentVisit = d.visitId as number;
        }
        const dist = 70 + (j * 40);
        j++;
        return dist;
      })
      .attr('y', (d: { patientId?: number; visitId?: number; dos?: number; }) => {
        return 50 + 60 * (d.visitId as number);
      })
      .attr('width', 30)
      .attr('height', 50)
      .attr('fill', (d: { patientId?: number; visitId?: number; dos?: number; }) => {
        const colScale = d3.scaleLinear<string>()
          .domain([0.80, 1])
          .range(['#a5ee3c', '#097400']);
        return colScale(d.dos as number);
      });

    node.append('text')
      .style('font-size', '10px')
      .attr('x', (d: { patientId?: number; visitId?: number; dos?: number; }, i, nodes) => {
        if (d.visitId !== currentVisit) {
          j = 0;
          currentVisit = d.visitId as number;
        }
        const dist = 72 + (j * 40);
        j++;
        return dist;
      })
      .attr('y', (d: { patientId?: number; visitId?: number; dos?: number; }) => {
        return 60 + (60 * (d.visitId as number));
        // TODO bug when ego graph only has nodes in one visit
      })
      .text((d: { patientId?: number; visitId?: number; dos?: number; }) => {
        return 'ID: ' + d.patientId;
      });

    node.append('text')
      .style('font-size', '10px')
      .attr('x', (d: { patientId?: number; visitId?: number; dos?: number; }, i, nodes) => {
        if (d.visitId !== currentVisit) {
          j = 0;
          currentVisit = d.visitId as number;
        }
        const dist = 75 + (j * 40);
        j++;
        return dist;
      })
      .attr('y', (d: { patientId?: number; visitId?: number; dos?: number; }) => {
        return 90 + (60 * (d.visitId as number));
        // TODO bug when ego graph only has nodes in one visit
      })
      .text((d: { patientId?: number; visitId?: number; dos?: number; }) => {
        return '' + d.dos;
      });

    this.resetZoom();

  }


  resetZoom(): void {
    const svg: any = this.svgContainer;

    svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  zoomStart(): void {
    // do something on zoom start
  }

  zooming($event: any): void {
    // zoom
    this.g.attr('transform', $event.transform);
  }

  zoomEnd(): void {
    // do something on zoom end
  }

}

import {Component, OnInit} from '@angular/core';
import {PatientData} from '../../global/patientData';
import {Patient} from '../../objects/patient';
import {ClusterServiceService} from '../../services/cluster-service.service';
import {EgoGraphService} from '../../services/ego-graph.service';
import * as d3 from 'd3';
import {DegreeOfSimilarityService} from '../../services/degree-of-similarity.service';
import {rgb} from 'd3';
import {Link, Node} from '../nodelink/graph-objects/graph';

@Component({
  selector: 'app-ego-graph',
  templateUrl: './ego-graph.component.html',
  styleUrls: ['./ego-graph.component.scss']
})

export class EgoGraphComponent implements OnInit {

  isDropup = true; // patient selection window goes up if true
  dataAvailable = false; // indicates whether data is loaded
  completedPatients: Patient[] = []; // list of completed patients
  selectedPatient: Patient | null = null;

  // contains the similar patient id's for every visit of the selected Patient
  private selectedPatientData!: Map<number, number[]>;

  private graphData!: object[];

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

    // waits for patient data to be loaded and then manages the creation of the drop down selection
    this.clusterService.loadedData.subscribe((isLoaded: boolean) => {
      if (isLoaded) {
        d3.selectAll('text');
        d3.selectAll('#ego-group').remove();
        d3.selectAll('rect').remove();
        this.dataAvailable = true;
        this.resetSelectedPatient();
        this.getCompletedPatients();
      }
    });

  }

  /**
   * gets all completed patients
   */
  getCompletedPatients(): void {
    this.completedPatients = [];
    this.patientData.patients.forEach(value => {
      if (value.completed) {
        this.completedPatients.push(value);
      }
    });
  }

  /**
   * sets selected patient to null
   */
  resetSelectedPatient(): void {
    this.selectedPatient = null;
  }

  /**
   * gets called after user selects a patient from drop down menu
   * calls the service to get all the similar patients per visit
   * then proceeds to call the method for graph drawing
   * @param p Patient object of selected patient
   */
  setSelectedPatient(p: Patient): void {
    this.selectedPatient = p;
    this.selectedPatientData = this.egoGraphService.calculateSimilarPatients(p);
    this.drawGraph();
  }

  /**
   * draws graph after selecting a patient from dropdown list
   */
  drawGraph(): void {

    this.graphData = this.prepareData();

    let minDoS = 1;
    let maxDoS = 0;

    // color scale creation
    this.graphData.forEach((d: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
      const score = d.dos as number;
      minDoS = score < minDoS ? score : minDoS;
      maxDoS = score > maxDoS ? score : maxDoS;
    });
    let colScale = d3.scaleLinear<string>()
      .domain([minDoS, maxDoS])
      .range(['#880000', '#097400']);
    if (minDoS === maxDoS) {
      colScale = d3.scaleLinear<string>()
        .domain([minDoS, maxDoS])
        .range(['#17299d', '#17299d']);
    }

    // create a tooltip
    const tooltip = d3.select('#master')
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');

    d3.selectAll('#ego-group').remove();
    // d3.selectAll('rect').remove();

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
      .attr('y', 30)
      .text('(red) min. DoS: ' + minDoS + ' | (green) max. DoS: ' + maxDoS);
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
    this.g.append('text')
      .style('font-size', '10px')
      .attr('x', 30)
      .attr('y', 60 + 60 * 3)
      .text('Visit 4');

    const node = this.g
      .selectAll('g')
      .data(this.graphData)
      .join('g')
      .on('click', (event, d: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
          const rects: d3.Selection<any, {}, any, any> = node.selectAll('rect');
          rects
            .attr('stroke', (o: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
              const alreadyClicked = o.clicked;
              if (alreadyClicked) {
                o.clicked = false;
              } else {
                o.clicked = o.patientId === d.patientId;
              }
              return o.clicked ? '#ff0000' : null;
            })
            .attr('stroke-width', 3);
        }
      )
      .on('mouseover', (event, d: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
        const rect: d3.Selection<any, {}, any, any> = node.selectAll('rect');
        const text: d3.Selection<any, {}, any, any> = node.selectAll('text');
        rect
          .attr('fill', (o: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
            return d.patientId === o.patientId ? 'yellow' : colScale(o.dos as number);
          });
        text
          .attr('fill', (o: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
            return d.patientId === o.patientId ? 'black' : 'white';
          });

        tooltip
          .style('opacity', 1);
      })
      .on('mousemove', (event, d: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
        let v0 = -1;
        let v1 = -1;
        let v2 = -1;
        let v3 = -1;
        this.graphData.forEach((value: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
          if (value.patientId === d.patientId) {
            if (value.visitId === 0) v0 = value.dos as number;
            if (value.visitId === 1) v1 = value.dos as number;
            if (value.visitId === 2) v2 = value.dos as number;
            if (value.visitId === 3) v3 = value.dos as number;
          }
        });
        tooltip
          .html('visit 1: ' + (v0 === -1 ? '-/-' : v0)
            + '<br>' + 'visit 2: ' + (v1 === -1 ? '-/-' : v1)
            + '<br>' + 'visit 3: ' + (v2 === -1 ? '-/-' : v2)
            + '<br>' + 'visit 4: ' + (v3 === -1 ? '-/-' : v3)
            + '<br>' + 'treatment: ' + this.patientData.patients.find((p) => {
              return p.patientId === d.patientId;
            })?.treatment)
          .style('left', (event.pageX + 20) + 'px')
          .style('top', (event.pageY) + 'px');
      })
      .on('mouseout', (event, d: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
        const rect: d3.Selection<any, {}, any, any> = node.selectAll('rect');
        const text: d3.Selection<any, {}, any, any> = node.selectAll('text');
        rect
          .attr('fill', (o: { patientId?: number; visitId?: number; dos?: number; clicked?: boolean; }) => {
            return colScale(o.dos as number);
          });
        text
          .attr('fill', 'white');
        tooltip
          .style('opacity', 0);
      })
      .attr('id', 'ego-node');

    let currentVisit = 0;
    let j = 0;

    node.append('rect')
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
      .attr('width', 35)
      .attr('height', 50)
      .attr('fill', (d: { patientId?: number; visitId?: number; dos?: number; }) => {
        return colScale(d.dos as number);
      });

    j = 0;

    node.append('text')
      .style('font-size', '10px')
      .attr('fill', 'white')
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
      })
      .text((d: { patientId?: number; visitId?: number; dos?: number; }) => {
        return 'ID: ' + d.patientId;
      });

    j = 0;

    node.append('text')
      .style('font-size', '10px')
      .attr('fill', 'white')
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
      })
      .text((d: { patientId?: number; visitId?: number; dos?: number; }) => {
        return '' + d.dos;
      });

    this.resetZoom();

  }

  /**
   * prepares the data for graph drawing process in the form of:
   *  {
   *    patientId: value
   *    visitId: visit
   *    dos: dosValue
   *  }
   *  retrieves the DoS to the patient in the selectedPatientData list
   */
  prepareData(): object[] {

    const data = [];

    for (const [visit, values] of this.selectedPatientData) {
      for (const value of values) {

        const p: Patient = this.selectedPatient as Patient;
        const dosValue = this.dosService.getScore(p.patientId, value, visit);

        data.push({
          patientId: value,
          visitId: visit,
          dos: dosValue,
          clicked: false
        });

      }
    }

    return data;
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

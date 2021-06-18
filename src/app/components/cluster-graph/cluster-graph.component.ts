import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {ClusterServiceService} from '../../services/cluster-service.service';
import {PatientData} from '../../global/patientData';
import * as math from 'mathjs';
import {GlobalConstants} from '../../global/globalConstants';

@Component({
  selector: 'app-cluster-graph',
  templateUrl: './cluster-graph.component.html',
  styleUrls: ['./cluster-graph.component.scss']
})
export class ClusterGraphComponent implements OnInit {

  dataAvailable = false;
  currentVisit = 0;

  constructor(private clusterService: ClusterServiceService,
              private patientData: PatientData,
              private constants: GlobalConstants) {
  }

  ngOnInit(): void {
    this.clusterService.loadedData.subscribe((isLoaded: boolean) => {
      if (isLoaded) {
        console.log('loaded');
        this.dataAvailable = true;
        this.initializeVisualization();
      }
    });
  }

  nextVisit(): void {
    if (this.dataAvailable && this.currentVisit < 2) {
      this.currentVisit++;
      this.initializeVisualization();
    }
  }

  previousVisit(): void {
    if (this.dataAvailable && this.currentVisit > 0) {
      this.currentVisit--;
      this.initializeVisualization();
    }
  }

  initializeVisualization(): void {

    d3.selectAll('g').remove();

    const clusterMap: Map<number, number[][]> = this.clusterService.getClusters();

    const width = 750;
    const height = 300;


    const visitCluster = clusterMap.get(this.currentVisit);


    const pack = d3.pack()
      .size([width, height])
      .padding(3);

    const packedData = pack(d3.hierarchy({children: visitCluster})
      .sum(d => Array.isArray(d) ? d.length : 0));

    const leaf = d3.select('#cluster')
      .selectAll('g')
      .data(packedData.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x + 1},${d.y + 1})`);

    leaf.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => '#ff3e19');

    leaf.append('text')
      .selectAll('tspan')
      .data(d => {
        let clusterMembers = '';
        let j = 1;
        for (const v of d.data as number[]) {
          if (j % 3 === 0) {
            clusterMembers = clusterMembers + v + ' ';
          } else {
            clusterMembers = clusterMembers + v + '-';
          }
          j++;
        }
        console.log(clusterMembers);
        return clusterMembers.split(/(?=[A-Z][a-z])|\s+/g);
      })
      .join('tspan')
      .style('font-size', '10px')
      .attr('x', -20)
      .attr('y', (d, i, nodes) => `${i - nodes.length / 2 + 1}em`)
      .text(d => {
        return d;
      });


  }
}

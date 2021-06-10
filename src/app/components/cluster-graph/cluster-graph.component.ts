import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {ClusterServiceService} from '../../services/cluster-service.service';
import {PatientData} from '../../global/patientData';
import {HierarchyCircularLink} from 'd3';

@Component({
  selector: 'app-cluster-graph',
  templateUrl: './cluster-graph.component.html',
  styleUrls: ['./cluster-graph.component.scss']
})
export class ClusterGraphComponent implements OnInit {

  constructor(private clusterService: ClusterServiceService,
              private patientData: PatientData) {
  }

  ngOnInit(): void {
    this.clusterService.loadedData.subscribe((isLoaded: boolean) => {
      if (isLoaded) {
        console.log('loaded');
        this.initializeVisualization();
      }
    });
  }

  initializeVisualization(): void {

    d3.selectAll('g').remove();

    const clusterMap: Map<number, number[][]> = this.clusterService.getClusters();
    const clusterVisit1 = clusterMap.get(0) as number[][];

    const width = 750;
    const height = 300;

    const pack = d3.pack()
      .size([width, height])
      .padding(3);

    const packedData = pack(d3.hierarchy({children: clusterVisit1})
      .sum(d => Array.isArray(d) ? d.length : 0));

    console.log(packedData);
    console.log(packedData.leaves());

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
      .data((d) => {
        const clusterMembers = [];
        for (const v of d.data as number[]) {
          clusterMembers.push(v);
        }
        console.log(clusterMembers);
        return clusterMembers;
      })
      .join('tspan')
      .style('font-size', '9px')
      .attr('x', 0)
      .attr('y', (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
      .text(d => d);
  }

}

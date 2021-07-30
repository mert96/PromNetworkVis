import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {ClusterServiceService} from '../../services/cluster-service.service';

@Component({
  selector: 'app-cluster-graph',
  templateUrl: './cluster-graph.component.html',
  styleUrls: ['./cluster-graph.component.scss']
})
export class ClusterGraphComponent implements OnInit {

  dataAvailable = false;
  currentVisit = 0;

  private width = 750;
  private height = 400;

  private svgContainer!: d3.Selection<SVGElement, {}, HTMLElement, any>;
  private g!: d3.Selection<SVGGElement, {}, HTMLElement, any>;

  private zoom!: d3.ZoomBehavior<any, unknown>;

  constructor(private clusterService: ClusterServiceService) {
  }

  ngOnInit(): void {
    d3.select('#cluster')
      .append('text')
      .attr('x', 250)
      .attr('y', 145)
      .text('Please read .csv file and press refresh');

    // waits for the data to be loaded
    this.clusterService.loadedData.subscribe((isLoaded: boolean) => {
      if (isLoaded) {
        console.log('loaded');
        d3.selectAll('text')
          .remove();
        this.dataAvailable = true;
        this.initializeVisualization();
      }
    });
  }

  /**
   * switches to next visit by redrawing
   */
  nextVisit(): void {
    if (this.dataAvailable && this.currentVisit < 2) {
      this.currentVisit++;
      this.clusterService.setCurrentClusterGraphVisit(this.currentVisit);
      this.initializeVisualization();
    }
  }

  /**
   * switches to previous visit by redrawing
   */
  previousVisit(): void {
    if (this.dataAvailable && this.currentVisit > 0) {
      this.currentVisit--;
      this.clusterService.setCurrentClusterGraphVisit(this.currentVisit);
      this.initializeVisualization();
    }
  }

  /**
   * draws the graph using the d3js library
   */
  initializeVisualization(): void {

    d3.selectAll('#cluster-circle').remove();

    const clusterMap: Map<number, number[][]> = this.clusterService.getClusters();

    const visitCluster = clusterMap.get(this.currentVisit);

    let maxRad = 0;
    let minRad = 1000000000000;

    const pack = d3.pack()
      .size([this.width, this.height])
      .padding(3);

    const packedData = pack(d3.hierarchy({children: visitCluster})
      .sum(d => Array.isArray(d) ? d.length : 0));

    this.zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('start', this.zoomStart.bind(this))
      .on('zoom', this.zooming.bind(this))
      .on('end', this.zoomEnd.bind(this));


    this.svgContainer = (d3.select('#cluster') as any)
      .call(this.zoom);

    this.g = this.svgContainer.append('g');

    const leaf = this.g
      .selectAll('g')
      .data(packedData.leaves())
      .join('g')
      .on('click', (event, d) => {
        this.clusterService.setSelectedCluster(d.data as number[]);
      })
      .attr('id', 'cluster-circle')
      .attr('transform', d => `translate(${d.x + 1},${d.y + 1})`);

    leaf.append('circle')
      .attr('r', d => {
        if (maxRad < d.r) {
          maxRad = d.r;
        }
        if (minRad > d.r) {
          minRad = d.r;
        }
        return d.r;
      })
      .attr('fill', d => {
        const colorScale = d3.scaleLinear<string>()
          .domain([minRad, maxRad])
          .range(['#c75eee', '#3785ee']);
        return colorScale(d.r);
      });

    leaf.append('text')
      .selectAll('tspan')
      .data(d => {
        let clusterMembers = '';
        let j = 1;
        const values = d.data as number[];
        for (const v of values) {
          if (j % 3 === 0) {
            clusterMembers = clusterMembers + (v) + ' ';
          } else {
            clusterMembers = clusterMembers + (v) + '/';
          }
          j++;
        }
        return clusterMembers.split(/(?=[A-Z][a-z])|\s+/g);
      })
      .join('tspan')
      .style('font-size', '10px')
      .attr('x', -18)
      .attr('y', (d, i, nodes) => `${i - nodes.length / 2 + 1}em`)
      .text(d => {
        return d;
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

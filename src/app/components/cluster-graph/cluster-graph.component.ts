import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-cluster-graph',
  templateUrl: './cluster-graph.component.html',
  styleUrls: ['./cluster-graph.component.scss']
})
export class ClusterGraphComponent implements OnInit {

  range = 0;

  constructor() {
  }

  ngOnInit(): void {


  }

  /**
   ignore function, just for testing and getting used to d3js
   */
  logRange(value: number): void {
    this.range = value;

    const data = [0, 1, 2, 3, 4];

    const xScale = d3.scaleLinear()
      .domain([0, 150])
      .range([20, 700]);

    const yScale = d3.scaleLinear()
      .domain([0, 150])
      .range([20, 300]);

    const colorScale = d3.scaleLinear<string>()
      .domain([0, 150])
      .range(['aqua', 'blue']);


    d3.select('rect').remove();
    d3.select('#cluster')
      .append('rect')
      .attr('width', 100)
      .attr('height', 100)
      // Set the x value based on the slider value (passed into the x scale)
      .attr('x', xScale(this.range))
      // Same for y/y ccale!
      .attr('y', yScale(this.range))
      // Same for color/color scale!
      .style('fill', colorScale(this.range));
  }


}

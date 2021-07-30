import * as d3 from 'd3';


export class Link<Node> implements d3.SimulationLinkDatum<d3.SimulationNodeDatum> {
  source!: number | Node;
  target!: number | Node;
  time: Array<number>;
  score!: number;

  constructor() {
    this.time = [];
  }
}

export class Node implements d3.SimulationNodeDatum {
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  label?: string;
  id?: number;
  inFocus?: boolean;
}

export class Graph {
  nodes?: Array<Node>;
  links?: Array<Link<Node>>;
}

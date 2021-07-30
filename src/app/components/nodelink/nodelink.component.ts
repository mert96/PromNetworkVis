import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3'; // make sure d3 and @types/d3 are installed
import {Graph, Node, Link} from './graph-objects/graph';
import {DragBehavior, ScaleLinear, svg, ZoomBehavior} from 'd3';
import {ClusterServiceService} from '../../services/cluster-service.service';
import {DegreeOfSimilarityService} from '../../services/degree-of-similarity.service';

@Component({
  selector: 'app-nodelink',
  templateUrl: './nodelink.component.html',
  styleUrls: ['./nodelink.component.scss']
})

export class NodelinkComponent implements OnInit {

  private graph!: Graph; // Graph = { nodes: Array<Node>; links: Array<Link> }

  private svgContainer!: d3.Selection<SVGElement, {}, HTMLElement, any>;
  private g!: d3.Selection<SVGGElement, {}, HTMLElement, any>;

  private nodes!: d3.Selection<any, {}, any, any>;
  private links!: d3.Selection<any, Link<Node>, any, any>;

  private simulation!: d3.Simulation<Node, Link<Node>>;

  private zoom!: d3.ZoomBehavior<any, {}>;

  private drag!: d3.DragBehavior<any, {}, any>;

  private width = 600;
  private height = 400;

  private selectedPatients: number[] = [];

  private NODE_RADIUS = 10;

  constructor(private clusterService: ClusterServiceService,
              private dosService: DegreeOfSimilarityService) {
  }

  equals(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }


  ngOnInit(): void {

    this.clusterService.selectedCluster.subscribe((clicked: number[]) => {
      if (clicked.length !== 0 && !this.equals(clicked, this.selectedPatients)) {
        this.selectedPatients = clicked;
        // console.log(Date.now(), this.selectedPatients);
        this.initializeNodeLink();
      }
    });
  }

  initializeNodeLink(): void {
    // build graph from loaded data
    this.loadDataToGraph();
    console.log(this.graph);

    // make sure you load data before initializing/rendering
    if (this.graph) {
      this.clearSVG();
      this.setup();
      this.init();
      this.zoomFit();
    }
  }

  clearSVG(): void {
    if (this.svgContainer) {
      this.svgContainer.selectAll('*').remove();
    }
  }

  loadDataToGraph(): void {
    this.graph = new Graph();
    const nodes: Node[] = [];
    for (let i = 0; i < this.selectedPatients.length; i++) {
      const node = new Node();
      node.id = this.selectedPatients[i];
      node.label = 'Patient ' + this.selectedPatients[i];
      node.inFocus = false;
      node.x = 0;
      node.y = 0;
      nodes.push(node);
    }
    const links: Link<Node>[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const link = new Link<Node>();
        link.source = nodes[i];
        link.target = nodes[j];
        link.score = this.dosService
          .getScore(nodes[i].id as number, nodes[j].id as number, this.clusterService.getCurrentClusterGraphVisit());
        links.push(link);
      }
    }
    this.graph.nodes = nodes;
    this.graph.links = links;
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

  dragStart($event: d3.D3DragEvent<SVGGElement, Node, any>): void {
    // start dragging
    if (!$event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    $event.subject.fx = $event.subject.x;
    $event.subject.fy = $event.subject.y;

  }

  dragging($event: d3.D3DragEvent<SVGGElement, Node, any>): void {
    // dragging
    $event.subject.fx = $event.x;
    $event.subject.fy = $event.y;

  }

  dragEnd($event: d3.D3DragEvent<SVGGElement, Node, any>): void {
    // end drag
    if (!$event.active) {
      this.simulation.alphaTarget(0);
    }
    // $event.subject.fx = null;
    // $event.subject.fy = null;
  }


  zoomFit(): void {
    // fit graph to size of svg
    const bounds = (this.svgContainer.node() as any).getBBox();

    const fullWidth = this.width;
    const fullHeight = this.height;

    const width = bounds.width;
    const height = bounds.height;

    if (width === 0 || height === 0) {
      return;
    } // nothing to fit

    const scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);

    this.g.attr('transform', `scale(${scale})`);
  }

  setup(): void {
    // setup zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('start', this.zoomStart.bind(this))
      .on('zoom', this.zooming.bind(this))
      .on('end', this.zoomEnd.bind(this)) as ZoomBehavior<any, {}>;

    // setup drag behavior
    this.drag = d3.drag()
      .on('start', this.dragStart.bind(this))
      .on('drag', this.dragging.bind(this))
      .on('end', this.dragEnd.bind(this)) as DragBehavior<any, {}, any>;

    // setup svg container (make sure there is a div with #svg-container id set in html)
    this.svgContainer = (d3.select('#nodelink-svg') as any)
      .call(this.zoom);

    // append global group to svg
    this.g = this.svgContainer.append('g');
    // .attr('transform', `translate(${-NODE_LINK_SIZE.WIDTH}, 0)`);

    // setup simulation - check docs for parameter values (most are [0,1] some are unbound)
    this.simulation = d3.forceSimulation<Node>(this.graph.nodes)
      .force('link', d3.forceLink<Node, Link<Node>>(this.graph.links as Link<Node>[]))
      .force('charge', d3.forceManyBody()
        .strength(-1000))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    this.simulation.on('tick', () => {
      // at each simulation update - rerender graph
      this.render();
    });

    // start simulation and set target (=when does the simulation converge)
    this.simulation.alphaTarget(0).restart();

    // // invisible circle for placing nodes
    // // it's actually two arcs so we can use the getPointAtLength() and getTotalLength() methods
    // const dim = -900;
    // const circle = this.svgContainer.append('path')
    //   .attr('d', 'M 40, ' + (dim / 2 + 40) + ' a ' + dim / 2 + ',' + dim / 2 + ' 0 1,0 ' + dim + ',0 a ' + dim / 2 + ',' + dim / 2 + ' 0 1,0 ' + dim * -1 + ',0')
    //   .style('fill', '#f5f5f5');
    //
    // // evenly spaces nodes along arc
    // const circleCoord = (node: any, index: any, num_nodes: any) => {
    //   const circumference = circle.node()!.getTotalLength();
    //   const pointAtLength = (l: any) => {
    //     return circle.node()!.getPointAtLength(l);
    //   };
    //   const sectionLength = (circumference) / num_nodes;
    //   const position = sectionLength * index + sectionLength / 2;
    //   return pointAtLength(circumference - position);
    // };
    //
    // // set coordinates for container nodes
    // this.graph.nodes!.forEach((n, i) => {
    //   const coord = circleCoord(n, i, this.graph.nodes!.length);
    //   n.x = coord.x;
    //   n.y = coord.y;
    //
    // });
  }

  calculateColorScale(): ScaleLinear<string, unknown> {

    let minScore = 1;
    let maxScore = 0;

    for (const link of this.graph.links!) {
      minScore = link.score < minScore ? link.score : minScore;
      maxScore = link.score > maxScore ? link.score : maxScore;
    }

    if (minScore === 1 && maxScore === 1) {
      return d3.scaleLinear<string>()
        .domain([minScore, maxScore])
        .range(['#097400', '#097400']);
    }

    return d3.scaleLinear<string>()
      .domain([minScore, maxScore])
      .range(['#ee1100', '#097400']);
  }


  init(): void {
    // create nodes and link selection (containers of our cicle and line objects)
    this.nodes = this.g.append('g').attr('class', 'nodes').selectAll('.node');
    this.links = this.g.append('g').attr('class', 'links').selectAll('.link');

    // UPDATE data
    this.nodes = this.nodes.data(this.graph.nodes as Node[]);

    // ENTER
    this.nodes = this.nodes
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent, d: Node) => {

        d.inFocus = !d.inFocus;

        // set all other nodes not in focus (needed if a user clicks different nodes consecutively)
        this.graph.nodes!.forEach((value: Node) => {
          if (value.id !== d.id) {
            value.inFocus = false;
          }
        });

        this.links.transition().style('stroke-opacity', (o) => {
          return (o.source === d || o.target === d) || !d.inFocus ? 1 : 0.1;
        });


      })
      .call(this.drag); // add drag behavior to nodes

    // set node svg properties
    this.nodes
      .append('circle')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('r', this.NODE_RADIUS)
      .attr('cx', (d: Node) => {
        console.log(d, d.x);
        return d.x as number;
      })
      .attr('cy', (d: Node) => {
        return d.y as number;
      })
      .attr('fill', 'darkgray');

    // assign node labels
    this.nodes.append('text')
      .text((d: Node) => {
        return d.label as string;
      })
      .attr('x', (d: Node) => {
        return d.x as number + this.NODE_RADIUS;
      })
      .attr('y', (d: Node) => {
        return d.y as number + this.NODE_RADIUS;
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('paint-order', 'stroke');

    // JOIN (=merge data)
    this.nodes = this.nodes
      .merge(this.nodes);

    // EXIT (=remove things)
    this.nodes.exit().remove();

    // UPDATE
    this.links = this.links.data(this.graph.links as Link<Node>[]);

    const colScale: ScaleLinear<string, unknown> = this.calculateColorScale();

    // ENTER
    this.links = this.links
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', (d: Link<Node>) => {
        return colScale(d.score) as string;
      })
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 2)
      .on('click', (event, d: Link<Node>) => {
        d3.select('#selectedDoS')
          .text('selected DoS: ' + d.score);
      });
    // .on('mouseover', (event: MouseEvent, d: Link<Node>) => {
    //   d3.select('#selectedDoS')
    //     .text('selected DoS: ' + d.score);
    // })
    // .on('mouseout', () => {
    //   d3.select('#selectedDoS')
    //     .text('selected DoS: ');
    // });

    // JOIN
    this.links = this.links
      .merge(this.links);

    // EXIT
    this.links.exit().remove();

    this.svgContainer.append('text')
      .text('min. DoS: ' + colScale.domain()[0] + ' (red)')
      .style('font-size', '15px')
      .attr('x', 10)
      .attr('y', 15);
    this.svgContainer.append('text')
      .text('max. DoS: ' + colScale.domain()[1] + ' (green)')
      .style('font-size', '15px')
      .attr('x', 10)
      .attr('y', 30);
    this.svgContainer.append('text')
      .text('selected DoS: ')
      .style('font-size', '15px')
      .attr('x', 10)
      .attr('y', 45)
      .attr('id', 'selectedDoS');

    this.resetZoom();
  }

  render(): void {
    // update coordinates when simulation changes
    this.links
      .attr('x1', (d: Link<Node>) => {
        return (d.source as Node).x as number;
      })
      .attr('y1', (d: Link<Node>) => {
        return (d.source as Node).y as number;
      })
      .attr('x2', (d: Link<Node>) => {
        return (d.target as Node).x as number;
      })
      .attr('y2', (d: Link<Node>) => {
        return (d.target as Node).y as number;
      });

    const nodesCircle: d3.Selection<any, {}, any, any> = this.nodes.selectAll('circle');
    nodesCircle
      .attr('cx', (d: Node) => {
        return d.x as number;
      })
      .attr('cy', (d: Node) => {
        return d.y as number;
      });

    const nodesText: d3.Selection<any, {}, any, any> = this.nodes.selectAll('text');
    nodesText
      .attr('x', (d: Node) => {
        return d.x as number + this.NODE_RADIUS;
      })
      .attr('y', (d: Node) => {
        return d.y as number + this.NODE_RADIUS;
      });
  }

}

import {Injectable} from '@angular/core';
import {DegreeOfSimilarityService} from './degree-of-similarity.service';
import {GlobalConstants} from '../global/globalConstants';
import * as math from 'mathjs';
import {Matrix} from 'mathjs';
import {BehaviorSubject} from 'rxjs';
import {valueReferenceToExpression} from '@angular/compiler-cli/src/ngtsc/annotations/src/util';

@Injectable({
  providedIn: 'root'
})
export class ClusterServiceService {

  expandFactor = 2;
  inflateFactor = 3;
  maxLoops = 10;

  loadedData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  clusterMap: Map<number, number[][]> = new Map<number, number[][]>();
  visits: Matrix[] = [];

  constructor(private dos: DegreeOfSimilarityService,
              private constants: GlobalConstants) {
  }

  setLoadedData(b: boolean): void {
    this.loadedData.next(b);
  }

  getClusters(): Map<number, number[][]> {
    return this.clusterMap;
  }


  /**
   * manages the calculation of the clusters
   */
  initializeClustering(): void {

    this.visits = [];

    for (let i = 0; i < this.constants.maxNumberOfVisits; i++) {
      this.convertMapToMatrix(i);
      this.startMarkovClustering(i);
    }

    this.setLoadedData(true);
    /*

    for (let i = 0; i < 1; i++) {
      // this.convertMapToMatrix(i);
      this.visits.push(math.matrix([
        [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      ]));
      this.visits[0] = this.addLoops(this.visits[0]);
      this.visits[0] = this.normalize(this.visits[0]);
      this.startMarkovClustering(i);
    }
    */

  }

  /**
   * converts the map with the DoS values to 3 separate matrices, one for each visit.
   * pushes the 3 matrices into the visits array. (this.visits)
   * adds loops and triggers the initial normalization
   * @param visit: id which corresponds to the visit id
   */
  private convertMapToMatrix(visit: number): void {
    let adjMatrix: Matrix = math.matrix('sparse');
    const dosMap = this.dos.getDoS();
    for (const [key, value] of dosMap) {
      if (key.includes('V' + (visit + 1))) {
        const indices = this.dos.getIndices(key);
        // console.log(key, ' -> ' + `${indices}` + ' : ' + value);
        if (value >= 0.90) {
          adjMatrix.subset(math.index(indices[0] - 1, indices[1] - 1), value);
          adjMatrix.subset(math.index(indices[1] - 1, indices[0] - 1), value);
        }
      }
    }
    adjMatrix = this.addLoops(adjMatrix);
    adjMatrix = this.normalize(adjMatrix);
    this.visits.push(adjMatrix);
    // console.log('visits :' + visit + ' ', adjMatrix);
  }

  /*
  scale(x: number): number {
    x = math.exp(x);
    return x;
  }
  */

  /**
   *
   */
  private expand(visit: number): void {
    console.log('expand');
    this.visits[visit] = math.sparse(math.pow(this.visits[visit], this.expandFactor) as Matrix);
  }

  /**
   *
   */
  private inflate(visit: number): void {
    console.log('inflate');
    this.visits[visit] = this.normalize(math.dotPow(this.visits[visit], this.inflateFactor) as Matrix);
  }

  private finished(E: Matrix, I: Matrix): boolean {
    let finished = true;
    const D: Matrix = math.subtract(E, I) as Matrix;
    D.forEach((value) => {
      if (math.abs(value) > 0.001) {
        finished = false;
      }
    });
    return finished;
  }

  /**
   * the core of the Markov Cluster Algorithm
   * does the inflate/expand loop, with an already looped and normalized matrix
   */
  private startMarkovClustering(visit: number): void {

    for (let i = 0; i < this.maxLoops; i++) {

      this.expand(visit);
      const E = math.clone(this.visits[visit]);

      this.inflate(visit);
      const I = math.clone(this.visits[visit]);

      if (this.finished(E, I) || i === this.maxLoops - 1) {
        console.log(i);
        this.clusterMap.set(visit, this.extractClusters(this.visits[visit]));
        break;
      }
    }
  }

  private extractClusters(M: Matrix): number [][] {
    const clusters = [];

    for (let i = 0; i < M.size()[0]; i++) {
      if (M.subset(math.index(i, i)) as unknown as number > 0.0001) {
        const rowMatrix = M.subset(math.index(i, math.range(0, M.size()[0])));
        let cluster = this.rowMatrixToArray(rowMatrix).map(
          (value, index) => {
            return (value > 0.01) ? index : -1;
          });
        cluster = cluster.filter((value) => value >= 0);
        if (cluster.length > 1 && !this.alreadyIn(clusters, cluster)) {
          clusters.push(cluster);
        }
      }
    }
    return clusters;
  }

  private alreadyIn(clusters: number[][], arr: number[]): boolean {
    let contains = false;
    for (const cluster of clusters) {
      if (cluster.length === arr.length) {
        const comparison = math.compare(cluster, arr) as number[];
        if (!comparison.some(item => item !== 0)) {
          contains = true;
        }
      }
    }
    return contains;
  }

  rowMatrixToArray(M: Matrix): number[] {
    const numberOfColumns = M.size()[1];
    const rowArray = new Array(numberOfColumns);
    for (let i = 0; i < numberOfColumns; i++) {
      rowArray[i] = M.subset(math.index(0, i));
    }
    return rowArray;
  }


  private addLoops(M: Matrix): Matrix {
    const diagonal = math.identity(M.size(), 'sparse');
    return math.add(M, diagonal) as Matrix;
  }

  private normalize(M: Matrix): Matrix {
    const columnSums = math.multiply(math.transpose(M), math.ones(M.size()[0]));
    const columnSumMatrix: Matrix = math.matrix('sparse');
    for (let i = 0; i < M.size()[0]; i++) {
      columnSumMatrix.subset(math.index(i, math.range(0, M.size()[0])), math.transpose(columnSums));
    }
    return math.dotDivide(M, columnSumMatrix) as Matrix;
  }
}

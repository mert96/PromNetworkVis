import {Injectable} from '@angular/core';
import {DegreeOfSimilarityService} from './degree-of-similarity.service';
import {GlobalConstants} from '../global/globalConstants';
import * as math from 'mathjs';
import {Matrix} from 'mathjs';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClusterServiceService {

  expandFactor = 2;
  inflateFactor = 3;
  maxLoops = 10;

  // To make the graph components load when data is available
  loadedData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); // ego and cluster graph
  selectedCluster: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]); // node-link

  clusterMap: Map<number, number[][]> = new Map<number, number[][]>();
  visits: Matrix[] = [];

  private currentClusterGraphVisit = 0;

  constructor(private dos: DegreeOfSimilarityService,
              private constants: GlobalConstants) {
  }

  /**
   * set whether data is loaded
   * @param b which indicates loading status of data
   */
  setLoadedData(b: boolean): void {
    this.loadedData.next(b);
  }

  /**
   * changes the cluster the user selected via clicking
   * @param arr the selected patients
   */
  setSelectedCluster(arr: number[]): void {
    this.selectedCluster.next(arr);
  }

  /**
   * returns the clusters for every visit
   */
  getClusters(): Map<number, number[][]> {
    return this.clusterMap;
  }


  /**
   * manages the calculation of the clusters
   */
  initializeClustering(): void {

    const t0 = Date.now();

    this.setSelectedCluster([]);

    this.visits = [];

    for (let i = 0; i < this.constants.maxNumOfVisits; i++) {
      this.convertMapToMatrix(i);
      if (this.visits[i]) {
        this.startMarkovClustering(i);
      }
    }

    this.setLoadedData(true);

    const t1 = Date.now();
    console.log('Clustered in ' + ((t1 - t0) / 1000).toFixed(2) + ' seconds');

  }

  /**
   * converts the map with the DoS values to 3 separate matrices, one for each visit.
   * pushes the 3 matrices into the visits array. (this.visits)
   * adds loops and triggers the initial normalization
   * @param visit: id which corresponds to the visit id
   */
  private convertMapToMatrix(visit: number): void {
    let matrixFilled = false;
    let adjMatrix: Matrix = math.matrix('sparse');
    const dosMap = this.dos.getDoS();
    for (const [key, value] of dosMap) {
      if (key.includes('V' + (visit + 1))) {
        matrixFilled = true;
        const indices = this.dos.getIndices(key);
        // console.log(key, ' -> ' + `${indices}` + ' : ' + value);
        if (value >= 0.90) {
          adjMatrix.subset(math.index(indices[0] - 1, indices[1] - 1), value);
          adjMatrix.subset(math.index(indices[1] - 1, indices[0] - 1), value);
        }
      }
    }
    if (matrixFilled) {
      adjMatrix = this.addLoops(adjMatrix);
      adjMatrix = this.normalize(adjMatrix);
      this.visits.push(adjMatrix);
    }
    // console.log('visits :' + visit + ' ', adjMatrix);
  }

  /*
  scale(x: number): number {
    x = math.exp(x);
    return x;
  }
  */

  /**
   * manages the expand step of the algorithm
   */
  private expand(visit: number): void {
    this.visits[visit] = math.sparse(math.pow(this.visits[visit], this.expandFactor) as Matrix);
  }

  /**
   * manages the inflate step of the algorithm
   */
  private inflate(visit: number): void {
    this.visits[visit] = this.normalize(math.dotPow(this.visits[visit], this.inflateFactor) as Matrix);
  }

  /**
   * checks whether the algorithm is finished e.g the two matrices do not differ significantly
   * @param E expanded matrix
   * @param I inflated matrix
   */
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
   * does the inflate/expand call in a loop, with an already looped (added 1 to diagonal) and normalized matrix
   */
  private startMarkovClustering(visit: number): void {

    for (let i = 0; i < this.maxLoops; i++) {

      this.expand(visit);
      const E = math.clone(this.visits[visit]);

      this.inflate(visit);
      const I = math.clone(this.visits[visit]);

      if (this.finished(E, I) || i === this.maxLoops - 1) {
        this.clusterMap.set(visit, this.extractClusters(this.visits[visit]));
        break;
      }
    }
  }

  /**
   * once the algorithm finishes for a visit, here the clusters are extracted from the matrix
   * @param M matrix from which to extract
   */
  private extractClusters(M: Matrix): number [][] {
    const clusters = [];

    for (let i = 0; i < M.size()[0]; i++) {
      if (M.subset(math.index(i, i)) as unknown as number > 0.0001) {
        const rowMatrix = M.subset(math.index(i, math.range(0, M.size()[0])));
        let cluster = this.rowMatrixToArray(rowMatrix).map(
          (value, index) => {
            return (value > 0.01) ? index + 1 : -1;
          });
        cluster = cluster.filter((value) => value >= 0);
        if (cluster.length > 1 && !this.alreadyIn(clusters, cluster)) {
          clusters.push(cluster);
        }
      }
    }
    return clusters;
  }

  /**
   * checks whether the cluster is already extracted, since it is possible
   * to extract the same cluster multiple times
   * @param clusters all extracted clusters until now
   * @param arr the cluster in contention
   */
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

  /**
   * transform a row matrix to an array
   * @param M row matrix
   */
  rowMatrixToArray(M: Matrix): number[] {
    const numberOfColumns = M.size()[1];
    const rowArray = new Array(numberOfColumns);
    for (let i = 0; i < numberOfColumns; i++) {
      rowArray[i] = M.subset(math.index(0, i));
    }
    return rowArray;
  }

  /**
   * adds 1's to diagonal
   * @param M matrix
   */
  private addLoops(M: Matrix): Matrix {
    const diagonal = math.identity(M.size(), 'sparse');
    return math.add(M, diagonal) as Matrix;
  }

  /**
   * normalizes the matrix column wise
   * @param M matrix
   */
  private normalize(M: Matrix): Matrix {
    const columnSums = math.multiply(math.transpose(M), math.ones(M.size()[0]));
    const columnSumMatrix: Matrix = math.matrix('sparse');
    for (let i = 0; i < M.size()[0]; i++) {
      columnSumMatrix.subset(math.index(i, math.range(0, M.size()[0])), math.transpose(columnSums));
    }
    return math.dotDivide(M, columnSumMatrix) as Matrix;
  }

  getCurrentClusterGraphVisit(): number {
    return this.currentClusterGraphVisit;
  }

  setCurrentClusterGraphVisit(v: number): void {
    this.currentClusterGraphVisit = v;
  }
}

import {Injectable} from '@angular/core';
import {PatientData} from '../global/patientData';
import {DegreeOfSimilarityService} from './degree-of-similarity.service';
import {GlobalConstants} from '../global/globalConstants';
import * as math from 'mathjs';
import {Matrix} from 'mathjs';

@Injectable({
  providedIn: 'root'
})
export class ClusterServiceService {

  clusterMap: Map<number, number[][]> = new Map<number, number[][]>();
  visits: Matrix[] = [];

  constructor(private dos: DegreeOfSimilarityService,
              private constants: GlobalConstants,
              private patientData: PatientData) {
  }


  /**
   * manages the calculation of the clusters
   */
  initializeClustering(): void {
    for (let i = 1; i <= this.constants.maxNumberOfVisits; i++) {
      this.convertMapToMatrix(i);
    }
    this.startMarkovClustering();

  }

  /**
   * converts the map with the DoS values to 3 separate matrices, one for each visit.
   * pushes the 3 matrices into the visits array. (this.visits)
   * @param visit: id which corresponds to the visit id
   */
  convertMapToMatrix(visit: number): void {
    let adjMatrix: Matrix = math.matrix();
    const dosMap = this.dos.getDoS();
    for (const [key, value] of dosMap) {
      if (key.includes('V' + visit)) {
        const indices = this.dos.getIndices(key);
        // console.log(key, ' -> ' + `${indices}` + ' : ' + value);
        adjMatrix.subset(math.index(indices[0] - 1, indices[1] - 1), value);
        adjMatrix.subset(math.index(indices[1] - 1, indices[0] - 1), value);

      }
    }
    adjMatrix = this.addLoops(adjMatrix);
    this.visits.push(adjMatrix);
    console.log('visits :' + visit + ' ', adjMatrix);
  }

  /**
   * the core of the Markov Cluster Algorithm
   */
  startMarkovClustering(): void {
    const expandFactor = 2;
    const inflateFactor = 2;
    const maxLoops = 10;
    const multFactor = 1;

    for (let i = 0; i < maxLoops; i++) {
      this.inflate();
      this.expand();
      if (this.finished()) {
        break;
      }
    }
  }

  addLoops(M: Matrix): Matrix{
    const diagonal = math.identity(M.size());
    return math.add(M, diagonal) as Matrix;
  }

  /**

   */
  inflate(): void {

  }

  /**
   *
   */
  expand(): void {

  }

  finished(): boolean {
    return true;
  }


}

import {Injectable} from '@angular/core';
import {ClusterServiceService} from './cluster-service.service';
import {DegreeOfSimilarityService} from './degree-of-similarity.service';
import {PatientData} from '../global/patientData';
import {GlobalConstants} from '../global/globalConstants';
import {Patient} from '../objects/patient';


@Injectable({
  providedIn: 'root'
})
export class EgoGraphService {

  constructor(private clusterService: ClusterServiceService,
              private dosService: DegreeOfSimilarityService,
              private patientData: PatientData,
              private constants: GlobalConstants) {
  }

  /**
   * returns a list which contains all the similar patients of the given patient for each visit
   *
   * @param p Patient whose similar patients will be returned.
   * @return a Map<number, number[]> where the key corresponds to visit id (beginning with 0)
   *  and the value to the similar patients' id.
   */
  calculateSimilarPatients(p: Patient): Map<number, number[]> {
    const clusters: Map<number, number[][]> = this.clusterService.getClusters();
    const similarPatientsMap: Map<number, number[]> = new Map<number, number[]>();
    const focusedPatientID = p.patientId;

    for (const [visit, cluster] of clusters) {
      const similarPerVisit = [];
      for (const subcluster of cluster) {
        if (subcluster.includes(focusedPatientID)) {
          for (const id of subcluster) {
            if (id !== focusedPatientID) {
              similarPerVisit.push(id);
            }
          }
          break;
        }
      }
      similarPatientsMap.set(visit, similarPerVisit);
    }
    return similarPatientsMap;
  }


}

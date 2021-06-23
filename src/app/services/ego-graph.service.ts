import {Injectable} from '@angular/core';
import {ClusterServiceService} from './cluster-service.service';
import {DegreeOfSimilarityService} from './degree-of-similarity.service';
import {PatientData} from '../global/patientData';
import {GlobalConstants} from '../global/globalConstants';


@Injectable({
  providedIn: 'root'
})
export class EgoGraphService {

  constructor(private clusterService: ClusterServiceService,
              private dosService: DegreeOfSimilarityService,
              private patientData: PatientData,
              private constants: GlobalConstants) {
  }



}

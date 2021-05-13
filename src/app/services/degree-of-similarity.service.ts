import {Injectable} from '@angular/core';
import {PatientData} from '../global/patientData';
import {GlobalConstants} from '../global/globalConstants';

@Injectable({
  providedIn: 'root'
})
export class DegreeOfSimilarityService {

  dosTable: number[][][] = [];

  constructor(private patientData: PatientData,
              private constants: GlobalConstants) {
  }

  // Pre-calculate all DoS before generating graphs
  calculateDoS(): void {
    const studies = this.patientData.studies;
    for (let k = 0; k < this.constants.maxNumOfVisits; k++) { // for every visit,
      for (let i = 0; i < studies.length; i++) {              // of every study,
        this.dosTable[i] = [];
        for (let j = i + 1; j < studies.length; j++) {        // compare to others.
          this.dosTable[i][j] = [];
          const studyAVisit = studies[i].visits[0].scores.mapOfScores;
          const studyBVisit = studies[k].visits[0].scores.mapOfScores;
          if (studyAVisit !== undefined && studyBVisit !== undefined && studies[i].completedStudy && studies[k].completedStudy) {
            const keys = studyAVisit.keys();
            let dos = 0;
            let numberOfScores = 0;
            for (const key of keys) {
              if (!isNaN(studyAVisit.get(key)) && !isNaN(studyBVisit.get(key))) {
                dos += Math.abs(studyAVisit.get(key) - studyBVisit.get(key)) / 100;
                numberOfScores++;
              }
            }
            this.dosTable[i][j][k] = 100 - dos;
            // console.log(studies[i].patientId + '.' + studies[i].patientStudyId +
            //  ' <-> ' + studies[j].patientId + '.' + studies[j].patientStudyId + ': ', 100 - dos);
          }
          else {
            this.dosTable[i][j][k] = -1;
          }
        }
      }
    }
  }
}

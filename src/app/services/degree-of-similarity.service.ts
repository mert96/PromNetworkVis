import {Injectable} from '@angular/core';
import {PatientData} from '../global/patientData';
import {GlobalConstants} from '../global/globalConstants';

@Injectable({
  providedIn: 'root'
})
export class DegreeOfSimilarityService {

  dosMap: Map<string, number> = new Map<string, number>();

  constructor(private patientData: PatientData,
              private constants: GlobalConstants) {
  }

  // Pre-calculate all DoS before generating graphs
  initiateDosCalculation(): void {
    const patients = this.patientData.patients;
    for (let k = 0; k < this.constants.maxNumOfVisits; k++) {  // for every visit,
      for (let i = 0; i < patients.length; i++) {              // of every patient,
        for (let j = i + 1; j < patients.length; j++) {        // compare to other patients.
          if (k < patients[i].visits.length && k < patients[j].visits.length) {
            const patientAVisit = patients[i].visits[k].scores.mapOfScores;
            const patientBVisit = patients[j].visits[k].scores.mapOfScores;
            if (patientAVisit !== undefined && patientBVisit !== undefined && patients[i].completed && patients[k].completed) {
              this.dosMap.set('A' + `${patients[i].patientId}` + ':B' + `${patients[j].patientId}` + ':V' + `${k + 1}`,
                this.calculateDOS(patientAVisit, patientBVisit));
            }
            else {
              this.dosMap.set('A' + `${patients[i].patientId}` + ':B' + `${patients[j].patientId}` + ':V' + `${k + 1}`, -1);
            }
          }
        }
      }
    }
    console.log(this.dosMap);
  }

  calculateDOS(scoreA: Map<string, number>, scoreB: Map<string, number>): number {
    const keys = scoreA.keys();
    let dos = 0;
    let numberOfScores = 0;
    for (const key of keys) {
      if (this.patientData.activeCategories.get(key)) {
        const valueA = scoreA.get(key) as number;
        const valueB = scoreB.get(key) as number;
        if (!isNaN(valueA) && !isNaN(valueB)) {
          dos += Math.abs(valueA - valueB) / 100;
          numberOfScores++;
        }
      }
    }

    return numberOfScores === 0 ? -1 : 1 - (dos / numberOfScores);
  }

  getDoS(): Map<string, number> {
    return this.dosMap;
  }
}

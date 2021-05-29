import {Injectable} from '@angular/core';
import {PatientData} from '../global/patientData';
import {GlobalConstants} from '../global/globalConstants';
import * as math from 'mathjs';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class DegreeOfSimilarityService {

  // TODO make differencesin DoS higher through a exponential function f.e. e^(10x). Higher differences in DoS should to
  // TODO more clusters and more informative clusters. The function has a range of 1 to 22026
  // TODO Key points: 0,75 = 1808; 0.85 = 4914; 0.95 = 13359

  private dosMap: Map<string, number> = new Map<string, number>();

  constructor(private patientData: PatientData,
              private constants: GlobalConstants) {
  }

  // Pre-calculate all DoS before generating graphs
  /**
   * iterates over each visit of every patient and compares them to all other patients to fill the
   * Degree of Similarity map with the corresponding values. Patients who can not be compared
   * (no score for selected category, discontinued study etc.) have 0 assigned as the DoS value
   */
  initiateDosCalculation(): void {


    const patients = this.patientData.patients;
    for (let k = 0; k < this.constants.maxNumOfVisits; k++) {  // for every visit,
      for (let i = 0; i < patients.length; i++) {              // of every patient,
        for (let j = i + 1; j < patients.length; j++) {        // compare to other patients.
          if (k < patients[i].visits.length && k < patients[j].visits.length) {
            const patientAVisit = patients[i].visits[k].scores.mapOfScores;
            const patientBVisit = patients[j].visits[k].scores.mapOfScores;
            if (patientAVisit !== undefined && patientBVisit !== undefined && patients[i].completed && patients[j].completed) {
              this.dosMap.set('A' + `${patients[i].patientId}` + ':B' + `${patients[j].patientId}` + ':V' + `${k + 1}`,
                this.calculateDOS(patientAVisit, patientBVisit));

            }
            else {
              this.dosMap.set('A' + `${patients[i].patientId}` + ':B' + `${patients[j].patientId}` + ':V' + `${k + 1}`, 0);
            }
          }
        }
      }
    }
    console.log(this.dosMap);

  }

  /*
  TODO what if category is selected but one of the patients did not complete the correspondig questionaire?
  TODO currently the whole visit is ignored, but i need to implement a choice which the user can take to just ignore the questionaire
  TODO which only 1 patient has and instead use the one both have, for example a chckbox in the settings ("strict calculation")
  */

  /**
   * contain the algorithm for the calculation of the Degree of Similarty value between 2 patients
   * @param scoreA: score of patient A
   * @param scoreB: score of patient B
   * @return DoS value
   */
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

    return numberOfScores === 0 ? 0 : math.round(1 - (dos / numberOfScores), this.constants.numberOfDecimalPlaces);
  }

  /**
   * returns the map which contains all the DoS values
   */
  getDoS(): Map<string, number> {
    return this.dosMap;
  }

  /**
   * resets the DoS map
   */
  resetDoS(): void {
    this.dosMap = new Map<string, number>();
  }

  /**
   * takes a key of the DoS map (string) and returns the 2 indices which correspond to the patient IDs as an integer array
   * @param key: key of the map in the form: A123:B124:V1 (patient 123 compared to patient124, domain = visit 1)
   * @return indices array [0] => patient A ; [1] => patient B
   */
  getIndices(key: string): number[] {
    let enteredA = false;
    let enteredB = false;
    let i = '';
    let j = '';
    for (const char of key) {
      if (char === ':') {
        enteredA = false;
        enteredB = false;
      }

      if (enteredA) {
        i = i + char;
      }

      if (enteredB) {
        j = j + char;
      }

      if (char === 'A') {
        enteredA = true;
      }

      if (char === 'B') {
        enteredB = true;
      }
    }

    return [+i, +j];
  }
}

import {Injectable} from '@angular/core';
import {Visit} from '../objects/visit';
import {Patient} from '../objects/patient';
import {GlobalConstants} from './globalConstants';

@Injectable()
export class PatientData {
  visits: Visit[] = [];
  patients: Patient[] = [];
  activeCategories: boolean[] = new Array(this.constants.numberOfCategories);

  constructor(private constants: GlobalConstants) {
  }
}

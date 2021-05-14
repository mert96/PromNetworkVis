import {Injectable} from '@angular/core';
import {Visit} from '../objects/visit';
import {Patient} from '../objects/patient';

@Injectable()
export class PatientData {
  visits: Visit[] = [];
  patients: Patient[] = [];
  // activeCategories: boolean[] = new Array(this.constants.numberOfCategories);
  activeCategories: Map<string, boolean> = new Map<string, boolean>([
    ['QSVT', false], // SF36
    ['QSPF', false],
    ['QSBP', false],
    ['QSGP', false],
    ['QSRP', false],
    ['QSSO', false],
    ['QSRE', false],
    ['QSME', false],
    ['QSBGH', false], // VFQ25
    ['QSBGV', false],
    ['QSOP', false],
    ['QSNA', false],
    ['QSDA', false],
    ['QSSF', false],
    ['QSMH', false],
    ['QSRD', false],
    ['QSDP', false],
    ['QSDV', false],
    ['QSCV', false],
    ['QSPV', false]
  ]);
}

import {Injectable} from '@angular/core';
import {Visit} from '../objects/visit';
import {Patient} from '../objects/patient';

@Injectable()
export class PatientData {
  visits: Visit[] = [];
  patients: Patient[] = [];
  // activeCategories: boolean[] = new Array(this.constants.numberOfCategories);
  activeCategories: Map<string, boolean> = new Map<string, boolean>([
    ['QSVT', true], // SF36
    ['QSPF', true],
    ['QSBP', true],
    ['QSGP', true],
    ['QSRP', true],
    ['QSSO', true],
    ['QSRE', true],
    ['QSME', true],
    ['QSBGH', true], // VFQ25
    ['QSBGV', true],
    ['QSOP', true],
    ['QSNA', true],
    ['QSDA', true],
    ['QSSF', true],
    ['QSMH', true],
    ['QSRD', true],
    ['QSDP', true],
    ['QSDV', true],
    ['QSCV', true],
    ['QSPV', true],
    ['LETTERS4MRIGHT', true],
    ['LETTERS4MLEFT', true]
  ]);
}

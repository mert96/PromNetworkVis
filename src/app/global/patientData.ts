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

  catDictionary: Map<string, string> = new Map<string, string>([
    ['QSVT', 'vitality'], // SF36
    ['QSPF', 'physical functioning'],
    ['QSBP', 'bodily pain'],
    ['QSGP', 'general health perception'],
    ['QSRP', 'physical role functioning'],
    ['QSSO', 'social role functioning'],
    ['QSRE', 'emotional role functioning'],
    ['QSME', 'mental health'],
    ['QSBGH', 'general health'], // VFQ25
    ['QSBGV', 'general vision'],
    ['QSOP', 'ocular pain'],
    ['QSNA', 'near activities'],
    ['QSDA', 'distance activities'],
    ['QSSF', 'social functioning'],
    ['QSMH', 'mental health'],
    ['QSRD', 'role difficulties'],
    ['QSDP', 'dependency'],
    ['QSDV', 'driving'],
    ['QSCV', 'color vision'],
    ['QSPV', 'peripheral vision'],
    ['LETTERS4MRIGHT', '4M right eye'],
    ['LETTERS4MLEFT', '4M left eye']
  ]);
}

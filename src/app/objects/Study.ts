import {Visit} from './Visit';

export class Study {
  constructor(
    public universalStudyId: number,
    public patientId: number,
    public patientStudyId: number,
    public completedStudy: boolean,
    public testedEye: string,
    public treatment: string,
    public visits: Visit[]
  ) {
  }
}

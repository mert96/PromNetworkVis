import {Study} from './study';

export class Patient {
  constructor(
    public patientId: number,
    public name: string,
    public country: string,
    public region: string,
    public birthday: string,
    public age: number,
    public sex: string,
    public race: string,
    public ethnic: string,
    public studies: Study[]
  ) {
  }

  getCompletedStudy(): Study | null {
    for (const study of this.studies) {
      if (study.completedStudy) {
        return study;
      }
    }
    return null;
  }
}

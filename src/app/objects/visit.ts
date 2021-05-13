import {Score} from './score';

export class Visit {
  constructor(
    public patientId: number,
    public patientVisitId: number,
    public visit: string,
    public scores: Score
  ) {
  }
}

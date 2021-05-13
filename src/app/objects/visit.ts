import {Score} from './score';

export class Visit {
  constructor(
    public patientId: number,
    public patientStudyId: number,
    public studyVisitId: number,
    public visit: string,
    public scores: Score
  ) {
  }
}

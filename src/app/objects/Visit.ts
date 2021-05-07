import {Scores} from './Scores';

export class Visit {
  constructor(
    public patientId: number,
    public patientStudyId: number,
    public studyVisitId: number,
    public visit: string,
    public scores: Scores
  ) {
  }
}

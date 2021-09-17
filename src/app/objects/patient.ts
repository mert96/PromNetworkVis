
import {Visit} from './visit';

export class Patient {
  constructor(
    public patientId: number, //not include
    public country: string,
    public region: string,
    public birthday: string, //not include
    public age: number,
    public sex: string,
    public race: string,
    public ethnic: string,
    public completed: boolean,
    public testedEye: string,
    public treatment: string,
    public visits: Visit[] //not include
  ) {
  }
}

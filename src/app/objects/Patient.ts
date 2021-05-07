import {Study} from './Study';

export class Patient{
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
  ){}
}

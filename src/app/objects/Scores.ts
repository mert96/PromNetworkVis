export class Scores {
  constructor(
    public mapOfScores = new Map()
  ){}

  pushScore(key: string, value: number): void{
    this.mapOfScores.set(key, value);
  }

}
/*
public QSBC: number,
  public QSBGH: number,
  public QSBGV: number,
  public QSOP: number,
  public QSBOP: number,
  public QSNA: number,
  public QSBNA: number,
  public QSDA: number,
  public QSBDA: number,
  public QSSF: number,
  public QSBSF: number,
  public QSMH: number,
  public QSBMH: number,
  public QSRD: number,
  public QSBRD: number,
  public QSDP: number,
  public QSBDP: number,
  public QSDV: number,
  public QSBDV: number,
  public QSCV: number,
  public QSBCV: number,
  public QSPV: number,
  public QSBPV: number,
  public QSPF: number,
  public QSBPF: number,
  public QSRP: number,
  public QSBRP: number,
  public QSRE: number,
  public QSBRE: number,
  public QSVT: number,
  public QSBVT: number,
  public QSME: number,
  public QSBME: number,
  public QSSO: number,
  public QSBSO: number,
  public QSBP: number,
  public QSBBP: number,
  public QSGP: number,
  public QSBGP: number,
  public QSPY: number,
  public QSBPY: number,
  public QSMY: number,
  public QSBMY: number,
  public QSTY: number,
  public QSBTY: number
*/


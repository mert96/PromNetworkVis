import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Visit} from '../../objects/visit';
import {Score} from '../../objects/score';
import {Patient} from '../../objects/patient';
import {DegreeOfSimilarityService} from '../../services/degree-of-similarity.service';
import {PatientData} from '../../global/patientData';
import {GlobalConstants} from '../../global/globalConstants';
import {ClusterServiceService} from '../../services/cluster-service.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {DatatableComponent} from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @ViewChild('tableWrapper') tableWrapper: any;
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  private currentComponentWidth: any;

  rows!: object[];
  columns!: object[];

  fileRead = false;
  firstRead = true;

  constructor(private formBuilder: FormBuilder,
              private dosService: DegreeOfSimilarityService,
              public patientData: PatientData,
              private constants: GlobalConstants,
              private clusterService: ClusterServiceService,
              private modalService: BsModalService,
              private cdRef: ChangeDetectorRef) {
    /*
    sfVitality: [true, Validators.required],
    sfPhysicalFunctioning: [true, Validators.required],
    sfBodilyPain: [true, Validators.required],
    sfGeneralHealthPerceptions: [true, Validators.required],
    sfPhysicalRoleFunctioning: [true, Validators.required],
    sfSocialRoleFunctioning: [true, Validators.required],
    sfEmotionalRoleFunctioning: [true, Validators.required],
    sfMentalHealth: [true, Validators.required],
    vfqGeneralHealth: [true, Validators.required],
    vfqGeneralVision: [true, Validators.required],
    vfqOcularPain: [true, Validators.required],
    vfqNearActivities: [true, Validators.required],
    vfqDistanceActivities: [true, Validators.required],
    vfqSocialFunctioning: [true, Validators.required],
    vfqMentalHealth: [true, Validators.required],
    vfqRoleDifficulties: [true, Validators.required],
    vfqDependency: [true, Validators.required],
    vfqDriving: [true, Validators.required],
    vfqColorVision: [true, Validators.required],
    vfqPeripheralVision: [true, Validators.required]
    */
  }

  // without this when refreshing, the table does not show unless resizing website
  ngAfterViewChecked() {
    // Check if the table size has changed,
    if (this.table && this.table.recalculate && (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth)) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      this.table.recalculate();
      this.cdRef.detectChanges();
    }
  }

  ngOnInit(): void {
  }

  /**
   * @return true if no category is selected, false if at least 1 category is selected
   */
  noCatSelected(): boolean {
    let noCategorySelected = true;
    this.patientData.activeCategories.forEach((value: boolean) => {
      if (value) {
        noCategorySelected = false;
      }
    });
    return noCategorySelected;
  }

  toggleAll(prefix: string): void {
    const sfCategories = ['QSVT', 'QSPF', 'QSBP', 'QSGP', 'QSRP', 'QSSO', 'QSRE', 'QSME'];
    const vfqCategories = ['QSBGH', 'QSBGV', 'QSOP', 'QSNA', 'QSDA', 'QSSF', 'QSMH'
      , 'QSRD', 'QSDP', 'QSDV', 'QSCV', 'QSPV', 'LETTERS4MRIGHT', 'LETTERS4MLEFT'];

    let categories: string[] = [];
    if (prefix === 'sf') {
      categories = sfCategories;
    } else if (prefix === 'vfq') {
      categories = vfqCategories;
    } else {
      return;
    }

    let numberOfActiveCategories = 0;

    for (const category of categories) {
      if (this.patientData.activeCategories.get(category)) {
        numberOfActiveCategories++;
      }
    }

    for (const category of categories) {
      if (numberOfActiveCategories === categories.length) {
        this.patientData.activeCategories.set(category, false);
      } else {
        this.patientData.activeCategories.set(category, true);
      }
    }
  }

  /**
   * updates which categories are chosen by the user and stores it in an array (activeCategories)
   * and calculates Clusters and DoS
   */
  refreshCategories(): void {

    this.dosService.initiateDosCalculation();
    this.clusterService.initializeClustering();
    let countCompleted = 0;
    this.patientData.patients.forEach(value => {
      if (value.completed) {
        countCompleted++;
      }
    });
    console.log('completed studies: ', countCompleted);

    this.createTableEntries();

  }

  /**
   * creates the rows and columns for the score table
   */
  createTableEntries(): void {
    // reset current entries
    const newRows: object[] = [];
    const newColumns: object[] = [
      {prop: 'patient', width: 90, frozenLeft: true},
      {prop: 'visit', width: 75, frozenLeft: true},
      {prop: 'treatment', width: 120, frozenLeft: true}
    ];

    // fill columns
    this.patientData.activeCategories.forEach((value, key) => {
      if (value) {
        newColumns.push({prop: key, width: key.length * 30});
      }
    });

    // fill rows
    this.patientData.patients.forEach((p) => {
      if (p.completed) {
        p.visits.forEach((visit) => {
          const row: object = {patient: p.patientId, visit: visit.patientVisitId, treatment: p.treatment};
          for (const [key, value] of visit.scores.mapOfScores) {
            if (this.patientData.activeCategories.get(key)) {
              Object.defineProperty(row, `${key}`, {
                value
              });
            }
          }
          newRows.push(row);
        });
      }
    });

    this.rows = [...newRows];
    this.columns = [...newColumns];
  }


  /**
   * transform each row in csv string into an object
   * @param data: csv file as string
   * @param delimiter: symbol which separates elements
   */
  CsvToJSON(data: string, delimiter = ';'): any {
    const lines = data.split('\n');
    const result = [];
    const headers = lines[0].split(delimiter);

    for (let i = 1; i < lines.length; i++) {

      const obj: any = {};
      const currentLine = lines[i].split(delimiter);

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }

      result.push(obj);

    }
    return result;
  }

  /**
   * transforms the input file into a string and passes it over to CsvToJSON.
   * @param fileInput csv file chosen by user
   */
  readCsv(fileInput: any): void {
    this.fileRead = true;
    this.resetPatientData();
    const fileRead = fileInput.target.files[0];
    const reader: FileReader = new FileReader();
    reader.readAsText(fileRead);
    reader.onload = () => {
      const patientData = this.CsvToJSON(reader.result as string);
      this.preparePatientData(patientData);
      // console.log(this.patientData.visits);
      console.log(this.patientData.patients);
      if (!this.firstRead) {
        this.refreshCategories();
      }
      this.firstRead = false;
    };
  }

  /**
   * resets previous patient data to make space for data from new csv file
   */
  resetPatientData(): void {
    this.patientData.visits = [];
    this.patientData.patients = [];
    this.dosService.resetDoS();
    this.clusterService.visits = [];
    this.clusterService.clusterMap = new Map<number, number[][]>();
    this.clusterService.setLoadedData(false);
  }

  /**
   * prepares the raw data in such a way that each visit is its own object
   * with each visit object having the corresponding scores and patient data
   * @param input raw patient data
   */
  preparePatientData(input: any[]): void {
    let currentPatient = -1;
    let currentVisit = -1;
    const keys: string[] = Object.keys(input[0]);
    for (const currentEntry of input) {
      if ((currentEntry.USUBJID !== currentPatient
          || currentEntry.VISITNUM !== currentVisit)
        && currentEntry.SITEID !== undefined) {
        currentPatient = currentEntry.USUBJID;
        currentVisit = currentEntry.VISITNUM;
        this.createVisit(currentEntry, keys);
      }
    }
  }

  /**
   * creates the Visit objects and if the associated study or patient does
   * not exist it also creates those objects, if they already exist, the
   * visit object is saved in the corresponding sup-objects.
   * @param currentEntry raw patient data
   * @param keys object keys to access composite scores
   */
  createVisit(currentEntry: any, keys: string[]): void {

    const scores: Score = new Score();

    /**
     * 46 <= i < 96 because those number correspond to the column numbers of
     * the relevant scores
     */
    for (let i = 46; i < 96; i++) {
      scores.pushScore(keys[i], +currentEntry[keys[i]]);
    }

    const newVisit = new Visit(
      currentEntry.USUBJID,
      currentEntry.VISITNUM,
      currentEntry.VISIT,
      scores
    );

    this.patientData.visits.push(newVisit);

    /**
     * associated patient object is created or extracted from patient array.
     * associated study object is saved in it.
     */
    let associatedPatient: Patient;

    if (this.patientData.patients.some(p => p.patientId === +currentEntry.USUBJID)) {
      associatedPatient = this.patientData.patients.find(p => p.patientId === +currentEntry.USUBJID) as Patient;

      /**
       * only save visit in patient if it has not been already saved
       */
      if (!associatedPatient.visits.some(v => v.patientVisitId === +currentEntry.VISITNUM
        && v.patientId === +currentEntry.USUBJID)) {
        associatedPatient.visits.push(newVisit);
      }

    } else {
      associatedPatient = new Patient(
        +currentEntry.USUBJID,
        currentEntry.COUNTRY,
        currentEntry.REGION,
        currentEntry.BRTHDTC,
        +currentEntry.AGE,
        currentEntry.SEX,
        currentEntry.RACE,
        currentEntry.ETHNIC,
        currentEntry.COMPLETE === '1',
        currentEntry.SEYE,
        currentEntry.TRTAC,
        [newVisit]
      );
      this.patientData.patients.push(associatedPatient);
    }
  }
}

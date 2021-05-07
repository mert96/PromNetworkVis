import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Visit} from '../../objects/Visit';
import {Scores} from '../../objects/Scores';
import {Patient} from '../../objects/Patient';
import {Study} from '../../objects/Study';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private numberOfCategories = 20;
  categoryForm: FormGroup;
  activeCategories: boolean[] = new Array(this.numberOfCategories);
  visits: Visit[] = [];
  patients: Patient[] = [];
  studies: Study[] = [];

  constructor(private formBuilder: FormBuilder) {
    this.categoryForm = formBuilder.group({
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
      }
    );
  }

  ngOnInit(): void {
    this.refreshCategories();
  }

  /**
   * updates which categories are chosen by the user and stores it in an array (activeCategories)
   */
  refreshCategories(): void {
    if (this.categoryForm.valid) {
      let i = 0;
      for (const field in this.categoryForm.controls) {
        if (this.categoryForm.controls.hasOwnProperty(field)) {
          this.activeCategories[i] = this.categoryForm.controls[`${field}`].value;
          i++;
        }
      }
    }
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
    const fileRead = fileInput.target.files[0];
    const reader: FileReader = new FileReader();
    reader.readAsText(fileRead);
    reader.onload = () => {
      const patientData = this.CsvToJSON(reader.result as string);
      this.preparePatientData(patientData);
      console.log(this.studies);
      console.log(this.patients);
    };
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

    const scores: Scores = new Scores();

    /**
     * 46 <= i < 96 because those number correspond to the column numbers of
     * the relevant scores
     */
    for (let i = 46; i < 91; i++) {
      scores.pushScore(keys[i], currentEntry[keys[i]]);
    }

    const newVisit = new Visit(
      currentEntry.SITEID,
      currentEntry.SUBJID,
      currentEntry.VISITNUM,
      currentEntry.VISIT,
      scores
    );

    /**
     * associated study object is created or extracted from studies array.
     * visit object is saved in it.
     */
    let associatedStudy: Study;

    if (this.studies.some(s => s.patientId === +currentEntry.SITEID
      && s.patientStudyId === +currentEntry.SUBJID)) {

      associatedStudy = this.studies.find(s => s.patientId === +currentEntry.SITEID
        && s.patientStudyId === +currentEntry.SUBJID) as Study;
      associatedStudy.visits.push(newVisit);

    } else {

      associatedStudy = new Study(
        +currentEntry.USUBJID,
        +currentEntry.SITEID,
        +currentEntry.SUBJID,
        currentEntry.COMPLETE === '1',
        currentEntry.SEYE,
        currentEntry.TRTAC,
        [newVisit]
      );

      this.studies.push(associatedStudy);
    }

    /**
     * associated patient object is created or extracted from patient array.
     * associated study object is saved in it.
     */
    let associatedPatient: Patient;

    if (this.patients.some(p => p.patientId === +currentEntry.SITEID)) {

      associatedPatient = this.patients.find(p => p.patientId === +currentEntry.SITEID) as Patient;

      /**
       * only save study in patient if it has not been already saved
       */
      if (!associatedPatient.studies.some(s => s.patientStudyId === +currentEntry.SUBJID
        && s.patientId === +currentEntry.SITEID)) {
        associatedPatient.studies.push(associatedStudy);
      }

    } else {
      associatedPatient = new Patient(
        +currentEntry.SITEID,
        currentEntry.INVNAM,
        currentEntry.COUNTRY,
        currentEntry.REGION,
        currentEntry.BRTHDTC,
        +currentEntry.AGE,
        currentEntry.SEX,
        currentEntry.RACE,
        currentEntry.ETHNIC,
        [associatedStudy]
      );
      this.patients.push(associatedPatient);
    }
  }
}

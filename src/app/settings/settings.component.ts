import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private numberOfCategories = 20;
  categoryForm: FormGroup;
  activeCategories: boolean[] = new Array(this.numberOfCategories);

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
  CsvToJSON(data: string, delimiter = ';'): any{
    const lines = data.split('\n');

    const result = [];

    const headers = lines[0].split(delimiter);

    for (let i = 1; i < lines.length; i++){

      const obj: any = {};
      const currentLine = lines[i].split(delimiter);

      for (let j = 0; j < headers.length; j++){
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
      console.log(this.CsvToJSON(reader.result as string)[0].REGION);
    };
  }
}

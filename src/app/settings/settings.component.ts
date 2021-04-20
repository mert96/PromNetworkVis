import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

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
    this.refresh();
  }

  refresh(): void {
    if (this.categoryForm.valid) {
      let i = 0;
      for (const field in this.categoryForm.controls){
        if (this.categoryForm.controls.hasOwnProperty(field)){
          this.activeCategories[i] = this.categoryForm.controls[`${field}`].value;
          i++;
        }
      }
    }
  }

}

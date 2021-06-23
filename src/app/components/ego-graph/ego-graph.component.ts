import {Component, OnInit} from '@angular/core';
import {PatientData} from '../../global/patientData';
import {Patient} from '../../objects/patient';
import {ClusterServiceService} from '../../services/cluster-service.service';

@Component({
  selector: 'app-ego-graph',
  templateUrl: './ego-graph.component.html',
  styleUrls: ['./ego-graph.component.scss']
})
export class EgoGraphComponent implements OnInit {

  isDropup = true;
  dataAvailable = false;
  completedPatients: Patient[] = [];
  selectedPatient: Patient | null = null;

  constructor(private patientData: PatientData,
              private clusterService: ClusterServiceService) {
  }

  ngOnInit(): void {
    this.clusterService.loadedData.subscribe((isLoaded: boolean) => {
      if (isLoaded) {
        this.dataAvailable = true;
        this.getCompletedPatients();
      }
    });

  }

  getCompletedPatients(): void {
    this.patientData.patients.forEach(value => {
      if (value.completed) {
        this.completedPatients.push(value);
      }
    });
    console.log(this.completedPatients);
  }

  setSelectedPatient(p: Patient): void {
    console.log(p.patientId);
    this.selectedPatient = p;
  }
}

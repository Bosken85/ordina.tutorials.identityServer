import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ValuesService } from '../services/values.service';

@Component({
  selector: 'app-values',
  templateUrl: './values.component.html',
  styleUrls: ['./values.component.css']
})
export class ValuesComponent implements OnInit {
  values: Observable<Array<string>>;

  constructor(private valuesService: ValuesService) {
  }

  ngOnInit() {
    this.values = this.valuesService.get();
  }
}

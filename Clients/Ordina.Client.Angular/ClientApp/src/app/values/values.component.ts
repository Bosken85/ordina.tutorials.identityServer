import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-values',
  templateUrl: './values.component.html',
  styleUrls: ['./values.component.css']
})
export class ValuesComponent implements OnInit {
  values: Array<string>;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.values = this.route.snapshot.data['values'];
  }
}

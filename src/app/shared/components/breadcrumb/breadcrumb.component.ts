import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  public no_results:number=0;

  @Input() title : string;
  @Input() breadcrumb : string;



  constructor() {
  }

  ngOnInit() : void {  }

}

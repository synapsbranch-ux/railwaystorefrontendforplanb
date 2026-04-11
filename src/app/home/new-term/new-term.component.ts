import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-term',
  templateUrl: './new-term.component.html',
  styleUrls: ['./new-term.component.scss']
})
export class NewTermComponent implements OnInit {

  isNavbarOpen: boolean = false;
  isCollapsing: boolean = false;


  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  toggleNavbar() {
    this.isCollapsing = true; // Set isCollapsing to true to trigger the 'collapsing' animation class
    setTimeout(() => {
      this.isNavbarOpen = !this.isNavbarOpen;
      this.isCollapsing = false; // Reset isCollapsing after animation duration
    }, 80);
  }

}

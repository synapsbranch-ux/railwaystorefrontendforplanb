import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input, AfterViewInit,
  Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss']
})
export class NewsletterComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild("newsletter", { static: false }) NewsLetterModal: TemplateRef<any>;

  public closeResult: string;
  public modalOpen: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  openModal() {

  }

  ngOnDestroy() {

  }

}

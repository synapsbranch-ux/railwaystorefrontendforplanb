import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tryon',
  templateUrl: './tryon.component.html',
  styleUrls: ['./tryon.component.scss']
})
export class TryonComponent implements OnInit {
  mode = 'video';
  videomodestatus: boolean = false;
  imagemodestatus: boolean = false;

  constructor(private toaster:ToastrService, private router:Router) { }

  ngOnInit(): void {
    let video = localStorage.getItem('productglb');
    let image = localStorage.getItem('product2d');
    if (video == null) {
      this.videomodestatus = false;
    }

    if (image == null) {
      this.imagemodestatus = false;
    }


    if (video != null && image != null) {
      this.videomodestatus = true;
      this.imagemodestatus = true;
      this.mode = 'video'
    }

    if (video == null && image != null) {
      this.mode = 'image'
    }


    if(video == null && image == null)
    {
      this.toaster.error('No video or image available for Try-On.')
      this.router.navigateByUrl('/')
    }

    console.log('video & Image',video,image);

  }

  modeChage(modename: any) {
    this.mode = modename;
    console.log('this.mode', this.mode)
  }

}

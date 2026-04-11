import { Component, OnInit } from '@angular/core';
import { ButtonsConfiguration, PlainGalleryConfiguration } from '../../../shared/data/portfolio';
import { Image, GridLayout, Size, BreakConfig } from '@ks89/angular-modal-gallery';

@Component({
  selector: 'app-grid-three',
  templateUrl: './grid-three.component.html',
  styleUrls: ['./grid-three.component.scss']
})
export class GridThreeComponent implements OnInit {

  public galleryFilter: string = 'all'
  public ButtonsConfig: any = ButtonsConfiguration;
  public GalleryConfig: any = PlainGalleryConfiguration;
  
  public Images;

  public AllImage = [
    new Image(1, { img: 'assets/images/portfolio/grid/1.jpg' }),
    new Image(2, { img: 'assets/images/portfolio/grid/2.jpg' }),
    new Image(3, { img: 'assets/images/portfolio/grid/3.jpg' }),
    new Image(4, { img: 'assets/images/portfolio/grid/4.jpg' }),
    new Image(5, { img: 'assets/images/portfolio/grid/5.jpg' }),
    new Image(6, { img: 'assets/images/portfolio/grid/6.jpg' }),
    new Image(7, { img: 'assets/images/portfolio/grid/7.jpg' }),
    new Image(8, { img: 'assets/images/portfolio/grid/8.jpg' })
  ];

  public FashionImage = [
    new Image(1, { img: 'assets/images/portfolio/grid/1.jpg' })
  ]

  public BagImages = [
    new Image(3, { img: 'assets/images/portfolio/grid/3.jpg' }),
    new Image(4, { img: 'assets/images/portfolio/grid/4.jpg' }),
    new Image(7, { img: 'assets/images/portfolio/grid/7.jpg' }),
  ];
  
  public ShoesImages = [
    new Image(2, { img: 'assets/images/portfolio/grid/2.jpg' }),
    new Image(8, { img: 'assets/images/portfolio/grid/8.jpg' })
  ]
  
  public WatchImages = [
    new Image(5, { img: 'assets/images/portfolio/grid/5.jpg' }),
    new Image(6, { img: 'assets/images/portfolio/grid/6.jpg' })
  ]

  constructor() { }

  ngOnInit(): void {
    this.Images = this.AllImage
  }
  openImage(image) {
    const index: number = this.getCurrentIndexCustomLayout(image, this.Images);
    
    // Convert index to string as required by Size
    const size: Size = { width: index.toString(), height: index.toString() };
    
    // Define a BreakConfig object with required properties
    const breakConfig: BreakConfig = {
        length: index, // Adjust as needed; assuming `index` represents the number of columns
        wrap: true // or false, based on your layout requirements
    };
    
    // Update the GalleryConfig with the correct layout
    this.GalleryConfig = Object.assign({}, this.GalleryConfig, { 
        layout: new GridLayout(size, breakConfig) 
    });
}


  getCurrentIndexCustomLayout(image: Image, images: Image[]): number {
    return image ? images.indexOf(image) : -1;
  };

  filter(term) {
    if(term == 'all') {
      this.Images = this.AllImage
    } else if(term == 'fashion') {
      this.Images = this.FashionImage
    } else if(term == 'bags') {
      this.Images = this.BagImages
    } else if(term == 'shoes') {
      this.Images = this.ShoesImages
    } else if(term == 'watch') {
      this.Images = this.WatchImages
    }

    this.galleryFilter = term
  }

}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductNew } from '../../../../shared/classes/product';

@Component({
  selector: 'app-size',
  templateUrl: './size.component.html',
  styleUrls: ['./size.component.scss']
})
export class SizeComponent implements OnInit {

  @Input() products: ProductNew[] = [];
  @Input() size: any[] = [];
  
  @Output() sizeFilter  : EventEmitter<any> = new EventEmitter<any>();

  public collapse: boolean = true;

  constructor() { 
  }

  ngOnInit(): void {

  }

  get filterbysize() {
    const uniqueSize = []
    return uniqueSize
  }

  appliedFilter(event) {
    console.log('Apply Filter Value', event);
    let index = this.size.indexOf(event.target.value);  // checked and unchecked value
    if (event.target.checked) {
      this.size.push(event.target.value); // push in array cheked value
      console.log('Apply Filter Value Index', this.size);
    }  
    else 
    {
      this.size.splice(index,1);  // removed in array unchecked value  
    }
    
    let size = this.size.length ? { size: this.size.join(",") } : { size: null }; 
    this.sizeFilter.emit(size);
  }

  // check if the item are selected
  checked(item){
    if(this.size.indexOf(item) != -1){
      return true;
    }
  }

}

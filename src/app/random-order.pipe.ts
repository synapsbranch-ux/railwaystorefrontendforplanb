import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'randomOrder' })
export class RandomOrderPipe implements PipeTransform {
  transform(list: Array<any>): Array<any> {
    const newList = [...list];
    let c_idx = newList.length,temp_val,r_idx;

    while(0 != c_idx){
        r_idx = Math.floor(Math.random()*c_idx);
        c_idx -= 1;
        temp_val = newList[c_idx];
        newList[c_idx] = newList[r_idx];
        newList[r_idx] = temp_val;
    }
    return newList;
  }
}
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FashionOneComponent } from './fashion/fashion-one/fashion-one.component';
import { StoreComponent } from '../store/store.component';
import { NewHomeComponent } from './new-home/new-home.component';
import { NewTermComponent } from './new-term/new-term.component';

const routes: Routes = [
  {
    path: 'fashion',
    component: FashionOneComponent
  },
  // {
  //   path: '**',
  //   redirectTo: '/'
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

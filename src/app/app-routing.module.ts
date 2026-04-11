import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ContactComponent } from './pages/account/contact/contact.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';

import { ShopComponent } from './shop/shop.component';
import { PagesComponent } from './pages/pages.component';
import { ElementsComponent } from './elements/elements.component';
import { FashionOneComponent } from './home/fashion/fashion-one/fashion-one.component';
import { StoreComponent } from './store/store.component';
import { DepartmentComponent } from './department/department.component';
import { SingleStoreComponent } from './store/single-store/single-store.component';
import { SingleStoreBannerComponent } from './store/single-store-banner/single-store-banner.component';
import { environment } from 'src/environments/environment';
import { ComingSoonComponent } from './pages/coming-soon/coming-soon.component';
import { NewHomeComponent } from './home/new-home/new-home.component';
import { NewTermComponent } from './home/new-term/new-term.component';
import { SitemapComponent } from './pages/sitemap/sitemap.component';

const routes: Routes = [
  // {
  //   path: '',
  //   // component: FashionOneComponent,
  //   component: NewHomeComponent,
  //   pathMatch: 'full'
  // },
  {
    path: '',
    component: SingleStoreBannerComponent,
    pathMatch: 'full',
    data: { slug: environment.defaultStore },
  },
  {
    path: 'terms-condition',
    // component: FashionOneComponent,
    component: NewTermComponent,
    pathMatch: 'full'
  },
  {
    path: 'our-story',
    component: AboutUsComponent,
    pathMatch: 'full'
  },
  {
    path: 'sitemap',
    component: SitemapComponent,
    pathMatch: 'full'
  },
  {
    path: 'contact',
    component: ContactComponent,
    pathMatch: 'full'
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    pathMatch: 'full'
  },
  {
    path: 'vendor/:slug',
    component: SingleStoreBannerComponent,
  },
  {
    path: 'stores',
    children: [
     {path: '', component: StoreComponent},
     {path: ':slug', component: SingleStoreComponent}
   ]
  },
  {
    path: 'department',
    component: DepartmentComponent
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: '',
    component: ShopComponent,
    loadChildren: () => import('./shop/shop.module').then(m => m.ShopModule)
  },
  { 
    path: '',
    component: PagesComponent,
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule) 
  },
  { 
    path: 'elements', 
    component: ElementsComponent,
    loadChildren: () => import('./elements/elements.module').then(m => m.ElementsModule) },
  {
    path: '**', // Navigate to Home Page if not found any page
    redirectTo: '/',
  },

];

const routerOptions: ExtraOptions = {
  initialNavigation: 'enabledBlocking',  // or 'enabled' or 'disabled'
  useHash: false,
  anchorScrolling: 'enabled',
  scrollPositionRestoration: 'enabled',
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

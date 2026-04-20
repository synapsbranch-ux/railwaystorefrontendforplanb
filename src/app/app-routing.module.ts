import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ContactComponent } from './pages/account/contact/contact.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions, UrlMatchResult, UrlSegment } from '@angular/router';

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

const RESERVED_SHORT_STORE_SLUGS = new Set([
  'terms-condition',
  'our-story',
  'sitemap',
  'privacy-policy',
  'contact',
  'vendor',
  'stores',
  'department',
  'home',
  'elements',
  'dashboard',
  'login',
  'register',
  'register-vendor',
  'forgot-password',
  'address',
  'edit-address',
  'change-password',
  'edit-profile',
  'search',
  'typography',
  'review',
  'order',
  'compare',
  'lookbook',
  '404',
  'comingsoon',
  'faq',
  'blog',
  'portfolio',
  '3dstore',
  'order-list',
  'view-order',
  'returns',
  'become-an-affiliate',
  'create-affinity-group',
  'create-business-account',
  'product',
  'contact-product',
  'tryon',
  'live-video',
  '2d-products',
  'all-products',
  'contact-products',
  'store-2d-products',
  'cart',
  'wishlist',
  'checkout',
  'settings-header',
  'assets',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
]);

function storeAliasMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 1) {
    return null;
  }

  const slugSegment = segments[0];
  const slug = slugSegment.path.toLowerCase();
  if (!slug || slug.includes('.') || RESERVED_SHORT_STORE_SLUGS.has(slug)) {
    return null;
  }

  return {
    consumed: [slugSegment],
    posParams: { slug: slugSegment },
  };
}

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
    path: 'elements', 
    component: ElementsComponent,
    loadChildren: () => import('./elements/elements.module').then(m => m.ElementsModule)
  },
  {
    matcher: storeAliasMatcher,
    component: SingleStoreBannerComponent,
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

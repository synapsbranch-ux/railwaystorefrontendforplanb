import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrl: './sitemap.component.scss',
})
export class SitemapComponent {
  defaultStore = localStorage.getItem('storeslug') || environment.defaultStore;
}

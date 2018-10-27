import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ValuesComponent } from './values/values.component';

const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'values',
    component: ValuesComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

export let AppRouterModule = RouterModule.forRoot(APP_ROUTES);

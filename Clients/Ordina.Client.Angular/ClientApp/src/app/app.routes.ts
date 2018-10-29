import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { HomeComponent } from './home/home.component';
import { ContactResolve } from './services/values.resolve';
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
    component: ValuesComponent,
    resolve: {
      values: ContactResolve
    },
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: 'NCORE_EMPLOYEE',
        redirectTo: {
          navigationCommands: ['home'],
          navigationExtras: {
            skipLocationChange: true
          }
        }
      }
    }
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

export let AppRouterModule = RouterModule.forRoot(APP_ROUTES);

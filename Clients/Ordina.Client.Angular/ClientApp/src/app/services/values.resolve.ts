import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ValuesService } from './values.service';

@Injectable({
    providedIn: 'root'
  })
export class ContactResolve implements Resolve<Array<string>> {

    constructor(private dataservice: ValuesService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Array<string>> {
        return this.dataservice.get();
    }
}

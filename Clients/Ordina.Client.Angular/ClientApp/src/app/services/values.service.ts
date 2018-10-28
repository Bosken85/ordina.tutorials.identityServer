import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ValuesService {

  constructor(private http: HttpClient) { }

  get(): Observable<Array<string>> {
    return this.http.get<Array<string>>('https://localhost:44344/api/values').pipe(
      catchError(error => {
        console.error(error);
        return [];
      })
    );
  }
}

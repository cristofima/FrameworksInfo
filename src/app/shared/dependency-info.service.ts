import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DependencyInfoService {

  constructor(private http: HttpClient) {

  }

  public getNPMInfo(dependency: string) {
    return this.http.get(`https://cors-anywhere.herokuapp.com/https://registry.npmjs.org/${dependency}`);
  }

  public getPypiInfo(dependency: string) {
    return this.http.get(`https://pypi.org/pypi/${dependency}/json`);
  }

  public getNugetInfo(dependency: string) {
    return this.http.get(`https://cors-anywhere.herokuapp.com/https://azuresearch-usnc.nuget.org/query?q=${dependency}&prerelease=false`);
  }

  public getPackagistInfo(dependency: string) {
    return this.http.get(`https://repo.packagist.org/p/${dependency}.json`);
  }

  public getNugetExtraInfo(url: string) {
    return this.http.get(url);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FrameworkModel } from '../models/framework.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DependencyInfoService {

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient) {

  }

  public getFrameworksList() {
    let itemCollection: AngularFirestoreCollection<FrameworkModel> = this.firestore.collection('frameworks');
    return itemCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as FrameworkModel;
        return data;
      }))
    );
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

  public getGemInfo(dependency: string) {
    return this.http.get(`https://cors-anywhere.herokuapp.com/https://rubygems.org/api/v1/versions/${dependency}.json`);
  }

  public getPackagistInfo(dependency: string) {
    return this.http.get(`https://repo.packagist.org/p/${dependency}.json`);
  }

  public getNugetExtraInfo(url: string) {
    return this.http.get(url);
  }

  public getMavenInfo(value: string) {
    return this.http.get(`https://cors-anywhere.herokuapp.com/https://repo1.maven.org/maven2/${value}/maven-metadata.xml`,
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'text/xml')
          .append('Access-Control-Allow-Methods', 'GET')
          .append('Access-Control-Allow-Origin', '*')
          .append('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Request-Method"),
        responseType: 'text'
      });
  }
}

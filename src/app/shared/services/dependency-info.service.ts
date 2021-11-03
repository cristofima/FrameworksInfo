import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FrameworkModel } from '../models/framework.model';
import { map } from 'rxjs/operators';
import { XmlUtil } from '../utils/xml.util';
import { DateUtil } from '../utils/date.util';

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
    return this.http.get(`https://repo.packagist.org/p/${dependency}.json`).pipe(
      map((resp: any) => {
        if (!resp) {
          return null;
        }

        const validVersionFormat = /^[0-9]{1,2}(.[0-9]{1,5}){1,5}$/;

        let versionsInfo = resp.packages[dependency];
        let lastValidVersionInfo: any = null;

        for (const prop in versionsInfo) {
          if (!versionsInfo.hasOwnProperty(prop)) {
            continue;
          }

          const version_normalized: string = versionsInfo[prop].version_normalized;

          if (validVersionFormat.test(version_normalized)) {
            if (lastValidVersionInfo) {
              if (lastValidVersionInfo.uid < versionsInfo[prop].uid) {
                lastValidVersionInfo = versionsInfo[prop];
              }
            } else {
              lastValidVersionInfo = versionsInfo[prop];
            }
          }
        }

        return lastValidVersionInfo;
      })
    );
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
      }).pipe(
        map((resp: any) => {
          const parser = new DOMParser();
          const srcDOM = parser.parseFromString(resp, 'application/xml');
          let obj = XmlUtil.xml2json(srcDOM);

          if (!obj.metadata) {
            return null;
          }

          const data = obj.metadata;

          let versioning = data.versioning;
          let numberDate: string = versioning.lastUpdated;

          let dataFramework = {
            tag_name: versioning.release as string,
            published_at: DateUtil.parseDate(numberDate)
          };

          return dataFramework;
        })
      );
  }
}

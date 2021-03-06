import { Component, OnInit } from '@angular/core';
import { DependencyInfoService } from './shared/services/dependency-info.service';
import { FrameworkModel } from './shared/models/framework.model';
import { DateUtil } from './shared/utils/date.util';
import { SelectItem } from 'primeng/api';
import { XmlUtil } from './shared/utils/xml.util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private frameworksList: FrameworkModel[];
  frameworksTable: any[] = [];

  languages: SelectItem[];

  columns: any[];

  constructor(
    private dependencyInfoService: DependencyInfoService) { }

  ngOnInit() {
    this.frameworksTable = [];
    this.frameworksList = [];

    this.columns = [
      { field: 'framework_name', header: 'Nombre' },
      { field: 'tag_name', header: 'Última Versión' },
      { field: 'language', header: 'Lenguaje' },
      { field: 'published_at', header: 'Fecha Actualización' }
    ];

    this.languages = [
      {
        value: 'C#',
        label: 'C#'
      },
      {
        value: 'Java',
        label: 'Java'
      },
      {
        value: 'JavaScript',
        label: 'JavaScript'
      },
      {
        value: 'PHP',
        label: 'PHP'
      },
      {
        value: 'Python',
        label: 'Python'
      },
      {
        value: 'Ruby',
        label: 'Ruby'
      },
    ]

    this.dependencyInfoService.getFrameworksList().subscribe(data => {
      this.frameworksList = data;
      this.showList();
    });
  }

  private showList() {
    for (const rep of this.frameworksList) {
      if (rep.dependencyName) {
        switch (rep.language) {
          case 'JavaScript':
            this.dependencyInfoService.getNPMInfo(rep.dependencyName).subscribe((data: any) => {
              const lastestVersion = data['dist-tags'].latest;

              let dataFramework = {
                framework_name: rep.name,
                tag_name: lastestVersion,
                language: rep.language,
                published_at: data['time'][lastestVersion]
              }

              this.frameworksTable.push(dataFramework);
            });

            break;
          case 'Python':
            this.dependencyInfoService.getPypiInfo(rep.dependencyName).subscribe((resp: any) => {
              let dataFramework = {
                framework_name: rep.name,
                tag_name: resp.info.version,
                language: rep.language,
                published_at: resp.releases[resp.info.version][0].upload_time
              }

              this.frameworksTable.
                push(dataFramework);
            });

            break;
          case 'C#':
            this.dependencyInfoService.getNugetInfo(rep.dependencyName).subscribe((resp: any) => {
              let dataFramework = {
                framework_name: rep.name,
                tag_name: resp.data[0].version,
                language: rep.language,
                published_at: null
              }

              const urlJson = resp.data[0].versions[resp.data[0].versions.length - 1]['@id'];

              this.dependencyInfoService.getNugetExtraInfo(urlJson).subscribe((result: any) => {
                dataFramework.published_at = result.published;
                this.frameworksTable.push(dataFramework);
              }, () => {
                this.frameworksTable.push(dataFramework);
              });
            });

            break;
          case 'PHP':
            const validVersionFormat = /^[0-9]+(.[0-9]+)+$/;

            this.dependencyInfoService.getPackagistInfo(rep.dependencyName).subscribe((resp: any) => {
              let versionsInfo = resp.packages[rep.dependencyName];
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

              if (lastValidVersionInfo == null) {
                return;
              }

              let dataFramework = {
                framework_name: rep.name,
                tag_name: lastValidVersionInfo.version_normalized,
                language: rep.language,
                published_at: lastValidVersionInfo.time
              }

              this.frameworksTable.push(dataFramework);
            });

            break;
          case 'Ruby':
            this.dependencyInfoService.getGemInfo(rep.dependencyName).subscribe((resp: any) => {
              let dataFramework = {
                framework_name: rep.name,
                tag_name: resp[0].number,
                language: rep.language,
                published_at: resp[0].created_at
              }

              this.frameworksTable.push(dataFramework);
            });
            break;
          case 'Java':
            this.dependencyInfoService.getMavenInfo(rep.dependencyName).subscribe((resp: any) => {
              const parser = new DOMParser();
              const srcDOM  = parser.parseFromString(resp, 'application/xml');
              let obj = XmlUtil.xml2json(srcDOM);

              if (!obj.metadata) {
                return;
              }

              const data = obj.metadata;

              let versioning = data.versioning;
              let numberDate: string = versioning.lastUpdated;

              let dataFramework = {
                framework_name: rep.name,
                tag_name: versioning.release,
                language: 'Java',
                published_at: DateUtil.parseDate(numberDate)
              };

              this.frameworksTable.push(dataFramework);
            });
            break;
          default:
            break;
        }
      }
    }
  }
}
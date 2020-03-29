import { Component, OnInit } from '@angular/core';
import { DependencyInfoService } from './shared/services/dependency-info.service';
import { FrameworkModel } from './shared/models/framework.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private frameworksList: FrameworkModel[];
  frameworksTable: any[] = [];

  constructor(private dependencyInfoService: DependencyInfoService) { }

  ngOnInit() {
    this.frameworksTable = [];
    this.frameworksList = [];

    this.dependencyInfoService.getFrameworksList().subscribe(data => {
      this.frameworksList = data;
      this.showList();
    });
  }

  private showList() {
    for (const rep of this.frameworksList) {
      if (rep.nameDependency) {
        switch (rep.language) {
          case 'JavaScript':
            this.dependencyInfoService.getNPMInfo(rep.nameDependency).subscribe((data: any) => {
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
            this.dependencyInfoService.getPypiInfo(rep.nameDependency).subscribe((resp: any) => {
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
            this.dependencyInfoService.getNugetInfo(rep.nameDependency).subscribe((resp: any) => {
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
            this.dependencyInfoService.getPackagistInfo(rep.nameDependency).subscribe((resp: any) => {
              let versionsInfo = resp.packages[rep.nameDependency];
              let versionKeys = Object.keys(versionsInfo);
              let lastVersionInfo = versionsInfo[versionKeys[versionKeys.length - 1]];

              let dataFramework = {
                framework_name: rep.name,
                tag_name: lastVersionInfo.version_normalized,
                language: rep.language,
                published_at: lastVersionInfo.time
              }

              this.frameworksTable.push(dataFramework);
            });

            break;
          case 'Ruby':
            this.dependencyInfoService.getGemInfo(rep.nameDependency).subscribe((resp: any) => {
              let dataFramework = {
                framework_name: rep.name,
                tag_name: resp[0].number,
                language: rep.language,
                published_at: resp[0].created_at
              }

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
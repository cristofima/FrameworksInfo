import { Component, OnInit } from '@angular/core';
import { DependencyInfoService } from './shared/services/dependency-info.service';
import { FrameworkModel } from './shared/models/framework.model';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  frameworksTable: any[] = [];
  languages: SelectItem[];
  columns: any[];

  constructor(
    private dependencyInfoService: DependencyInfoService) { }

  ngOnInit() {
    this.frameworksTable = [];

    this.setColumns();
    this.setLanguages();

    this.dependencyInfoService.getFrameworksList().subscribe(data => {
      this.showList(data);
    });
  }

  private setColumns() {
    this.columns = [
      { field: 'framework_name', header: 'Name' },
      { field: 'tag_name', header: 'Last Version' },
      { field: 'language', header: 'Language' },
      { field: 'published_at', header: 'Last Update' },
      { field: 'link', header: 'Links' }
    ];
  }

  private setLanguages() {
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
    ];
  }

  private setData(dataFramework: any, rep: FrameworkModel) {
    dataFramework["framework_name"] = rep.name;
    dataFramework["language"] = rep.language;

    if (rep.gitHubRepository) {
      dataFramework["link"] = `https://github.com/${rep.gitHubRepository}`;
    }
  }

  private showList(data: FrameworkModel[]) {
    for (const rep of data) {
      if (rep.dependencyName) {
        switch (rep.language) {
          case 'JavaScript':
            this.dependencyInfoService.getNPMInfo(rep.dependencyName).subscribe((data: any) => {
              const lastestVersion = data['dist-tags'].latest;

              let dataFramework = {
                tag_name: lastestVersion,
                published_at: data['time'][lastestVersion]
              }

              this.setData(dataFramework, rep);
              this.frameworksTable.push(dataFramework);
            });

            break;
          case 'Python':
            this.dependencyInfoService.getPypiInfo(rep.dependencyName).subscribe((resp: any) => {
              let dataFramework = {
                tag_name: resp.info.version,
                published_at: resp.releases[resp.info.version][0].upload_time
              }

              this.setData(dataFramework, rep);
              this.frameworksTable.push(dataFramework);
            });

            break;
          case 'C#':
            this.dependencyInfoService.getNugetInfo(rep.dependencyName).subscribe((resp: any) => {
              let dataFramework = {
                tag_name: resp.data[0].version,
              }

              this.setData(dataFramework, rep);

              const urlJson = resp.data[0].versions[resp.data[0].versions.length - 1]['@id'];

              this.dependencyInfoService.getNugetExtraInfo(urlJson).subscribe((result: any) => {
                dataFramework["published_at"] = result.published;
                this.frameworksTable.push(dataFramework);
              }, () => {
                this.frameworksTable.push(dataFramework);
              });
            });

            break;
          case 'PHP':
            this.dependencyInfoService.getPackagistInfo(rep.dependencyName).subscribe((lastValidVersionInfo: any) => {
              if (!lastValidVersionInfo) {
                return;
              }

              let dataFramework = {
                tag_name: lastValidVersionInfo.version_normalized,
                published_at: lastValidVersionInfo.time
              }

              this.setData(dataFramework, rep);
              this.frameworksTable.push(dataFramework);
            });

            break;
          case 'Ruby':
            this.dependencyInfoService.getGemInfo(rep.dependencyName).subscribe((resp: any) => {
              let dataFramework = {
                tag_name: resp[0].number,
                published_at: resp[0].created_at
              }

              this.setData(dataFramework, rep);
              this.frameworksTable.push(dataFramework);
            });

            break;
          case 'Java':
            this.dependencyInfoService.getMavenInfo(rep.dependencyName).subscribe(dataFramework => {
              if (!dataFramework) {
                return;
              }

              this.setData(dataFramework, rep);
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

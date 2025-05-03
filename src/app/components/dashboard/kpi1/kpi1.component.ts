import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ChartConfiguration, ChartData, ChartEvent, ChartType,
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { GithubService } from 'src/app/services/github.service';
import { Observable } from 'rxjs';
import { GithubSearchPulls } from '@interfaces/githubsearchpulls';
import * as _ from 'lodash';

@Component({
  selector: 'app-kpi1',
  templateUrl: './kpi1.component.html',
  imports: [BaseChartDirective],
})
export class Kpi1Component implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  ListKPI: Observable<GithubSearchPulls> = this.githubService.getTotalPullOpen();

  ArrayDates: { day:string, count:number }[] = [];

  constructor(private readonly githubService : GithubService) {

  }

  ngOnInit(): void {
    this.ListKPI.subscribe((s) => {
      // console.table((s.items.map(m => [m.created_at, m.number])));
      // console.table((s.items.map(m => [new Date(m.created_at).getDate(), m.created_at])));
      const group = _.groupBy(s.items.map(m => new Date(m.created_at).getDate()));
      Object.entries(group).forEach(f => this.ArrayDates.push({ day: f[0], count: f[1].length }));
      console.table(this.ArrayDates);
    });
  }

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        min: 10,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
      },
    },
  };

  public barChartType: ChartType = 'bar';

  public barChartPlugins = [
    DataLabelsPlugin,
  ];

  public barChartData: ChartData<'bar'> = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40, 80], label: 'Open' },
      { data: [28, 48, 40, 19, 86, 27, 90, 81], label: 'Closed' },
      { data: [28, 48, 40, 19, 86, 27, 90, 81], label: 'Merged' },
    ],
  };

  // events
  public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
    console.log(event, active);
  }
}

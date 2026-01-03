import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PersonService } from '../../shared/services/person.service';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { PeopleIndicatorsService } from '../../shared/services/people.indicators.service';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [RouterLink, TitleCasePipe, DecimalPipe],
  templateUrl: './dashboard-page.html',
})
export default class DashboardPage {
  private personService = inject(PersonService);
  private peopleIndicatorsService = inject(PeopleIndicatorsService);

  private people = this.personService.getPeople();
  private peopleIndicators = this.peopleIndicatorsService.getPeopleIndicators();
  username = signal<string | null>(sessionStorage.getItem('username'));

  totalPeople = computed(() => this.people().length);
  withCUD = computed(() => this.people().filter((p) => p.cudVigente).length);
  withPaseLibre = computed(() => this.people().filter((p) => p.paseLibre).length);
  withPension = computed(() => this.people().filter((p) => p.pension).length);
  withIndicators = computed(() => this.peopleIndicators().filter((p) => p.indicadores).length);

  latestPeople = computed(() => {
    return [...this.people()]
      .sort(
        (a, b) =>
          new Date(b.fechaEmpadronamiento).getTime() - new Date(a.fechaEmpadronamiento).getTime()
      )
      .slice(0, 5);
  });

  getAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}

import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { PersonService } from '../../shared/services/person.service';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [RouterLink, TitleCasePipe, DecimalPipe],
  templateUrl: './dashboard-page.html',
})
export default class DashboardPage {

  private personService = inject(PersonService);

  totalPeople = computed(() => this.personService.persons().length);
  withCUD = computed(() => this.personService.persons().filter((p) => p.health?.activeCud).length);
  withPaseLibre = computed(() => this.personService.persons().filter((p) => p.benefit?.freePass).length);
  withPension = computed(() => this.personService.persons().filter((p) => p.benefit?.pension).length);
  withIndicators = computed(() => this.personService.persons().filter((p) => p.indicatorType).length);

  latestPeople = computed(() => {
    return [...this.personService.persons()]
      .sort(
        (a, b) =>
          new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
      )
      .slice(0, 5);
  });

  // getAge(birthDate: string): number {
  //   const today = new Date();
  //   const birth = new Date(birthDate);
  //   let age = today.getFullYear() - birth.getFullYear();
  //   const m = today.getMonth() - birth.getMonth();
  //   if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
  //     age--;
  //   }
  //   return age;
  // }
}

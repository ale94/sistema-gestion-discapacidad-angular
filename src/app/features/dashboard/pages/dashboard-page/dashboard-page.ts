import { Component, computed, inject } from '@angular/core';
import { PersonService } from '../../../../shared/services/Person';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-page.html',
})
export default class DashboardPage {
  private personService = inject(PersonService);
  private people = this.personService.getPeople();

  totalPeople = computed(() => this.people().length);
  withCUD = computed(() => this.people().filter(p => p.cudVigente).length);
  withPension = computed(() => this.people().filter(p => p.pension).length);
  withPaseLibre = computed(() => this.people().filter(p => p.paseLibre).length);

  latestPeople = computed(() => {
    return [...this.people()]
      .sort((a, b) => new Date(b.fechaEmpadronamiento).getTime() - new Date(a.fechaEmpadronamiento).getTime())
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

import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PersonService } from '../../../shared/services/person.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'person-profile',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './person-profile.html',
})
export default class PersonProfile {
  private route = inject(ActivatedRoute);
  private personService = inject(PersonService);

  person = computed(() => {
    const personId = this.route.snapshot.paramMap.get('id');
    if (!personId) return undefined;
    return this.personService
      .getPeople()()
      .find((p) => p.id === personId);
  });

  getAge(birthDate: string | undefined): number | null {
    if (!birthDate) return null;
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

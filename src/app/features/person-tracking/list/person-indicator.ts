import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndicatorForm } from '../form/indicator-form';
import { PersonTrackingService } from '../../../shared/services/person-tracking.service';
import { PersonTracking } from '../../../shared/interfaces/person-tracking';
import { PersonForm } from '../../person/form/person-form';
import { PersonService } from '../../../shared/services/person.service';
import { Person } from '../../../shared/interfaces/person';


@Component({
  selector: 'person-indicator',
  imports: [FormsModule, DecimalPipe, IndicatorForm, TitleCasePipe, PersonForm],
  templateUrl: './person-indicator.html',
})
export default class PersonIndicator {
  private trackingService = inject(PersonTrackingService);
  private personService = inject(PersonService);

  isModalOpen = signal(false);
  editingPerson = signal<PersonTracking | null>(null);
  personToDelete = signal<PersonTracking | null>(null);

  showTransitionModal = signal(false);
  transitionPerson = signal<Person | null>(null);
  transitioningTracking = signal<PersonTracking | null>(null);
  successMessage = signal<string | null>(null);

  searchTerm = signal('');

  filteredPeopleIndicators = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const people = this.trackingService.personsTracking();

    if (!term) return people;

    return people.filter(({ firstName, lastName, dni }) =>
      firstName.toLowerCase().includes(term) || lastName.toLowerCase().includes(term) || dni.toString().includes(term)
    );
  });

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  openAddModal() {
    this.editingPerson.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(person: PersonTracking) {
    this.editingPerson.set(person);
    this.isModalOpen.set(true);
  }

  openTransitionModal(tracking: PersonTracking) {
    this.transitioningTracking.set(tracking);
    this.transitionPerson.set({
      id: 0,
      firstName: tracking.firstName,
      lastName: tracking.lastName,
      dni: tracking.dni,
      phone: tracking.phone,
      address: { id: 0, street: tracking.address?.street || '', district: tracking.address?.district || '', locality: tracking.address?.locality || '', province: tracking.address?.province || '' },
      civilStatus: '',
      dateBirth: new Date(),
      tutor: '',
      gender: '',
      registrationDate: new Date(),
      dateDeath: undefined,
      education: { id: 0, educationLevel: '', name: '', address: '', educationStatus: '' },
      work: { id: 0, companyName: '', status: '', address: '', socialWork: false, nameSocialWork: '' },
      health: { id: 0, diagnostic: '', disabilityType: '', cudNumber: '', activeCud: false, expirationDate: '', rehabilitationTreatment: false },
      benefit: { id: 0, federalProgram: false, pension: false, auh: false, suaf: false, merchandise: false, freePass: false, freePassExpiration: '' },
      familyMembers: [],
    });
    this.showTransitionModal.set(true);
  }

  handleTransitionSave(person: Person) {
    this.personService.addPerson(person).subscribe({
      next: () => {
        const tracking = this.transitioningTracking();
        if (tracking?.id) {
          this.trackingService.deletePerson(tracking.id).subscribe({
            error: () => console.error('Error al eliminar el seguimiento')
          });
        }
        this.closeTransitionModal();
        this.successMessage.set('Persona registrada correctamente como beneficiario.');
        setTimeout(() => this.successMessage.set(null), 3500);
      },
      error: () => alert('Error al registrar la persona. Intente nuevamente.')
    });
  }

  closeTransitionModal() {
    this.showTransitionModal.set(false);
    this.transitionPerson.set(null);
    this.transitioningTracking.set(null);
  }

  requestDelete(person: PersonTracking): void {
    this.personToDelete.set(person);
  }

  confirmDeleteAction(): void {
    if (this.personToDelete()) {
      this.trackingService.deletePerson(this.personToDelete()!.id).subscribe({
        next: () => this.cancelDelete(),
        error: () => alert('Error al eliminar el indicador. Intente nuevamente.')
      });
    }
  }

  cancelDelete(): void {
    this.personToDelete.set(null);
  }

  handleSave(personData: PersonTracking) {
    const data = { ...personData, dni: Number(personData.dni), phone: Number(personData.phone) };
    const request$ = 'id' in data
      ? this.trackingService.updatePerson(data)
      : this.trackingService.addPerson(data);

    request$.subscribe({
      next: () => this.closeModal(),
      error: () => alert('Error al guardar el indicador. Intente nuevamente.')
    });
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingPerson.set(null);
  }
}

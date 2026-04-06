import { Component, computed, inject, signal } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/interfaces/user';
import { FormsModule } from '@angular/forms';
import { UserForm } from "../user-form/user-form";
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'user-management',
  imports: [FormsModule, UserForm, TitleCasePipe],
  templateUrl: './user-management.html',
})
export default class UserManagement {

  private userService = inject(UserService);

  // Estados de la UI
  searchTerm = signal('');
  activeFilter = signal<'ALL' | 'ADMIN' | 'USER'>('ALL');

  // Modales
  isModalOpen = signal(false);
  editingUser = signal<User | null>(null);
  userToDelete = signal<User | null>(null);

  // Lógica de filtrado reactiva
  filteredUsers = computed(() => {
    let users = this.userService.users();
    const search = this.searchTerm().toLowerCase();
    const filter = this.activeFilter();

    if (filter !== 'ALL') {
      users = users.filter(u => u.role === filter);
    }

    if (search) {
      users = users.filter(u =>
        u.firstName.toLowerCase().includes(search) ||
        u.lastName.toLowerCase().includes(search) ||
        u.dni.toString().includes(search)
      );
    }
    return users;
  });

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }

  openAddModal() {
    this.editingUser.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(user: User) {
    this.editingUser.set(user);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingUser.set(null);
  }

  handleSave(userData: User) {
    if ('id' in userData) {
      this.userService.update(userData).subscribe();
    } else {
      this.userService.create(userData).subscribe();
    }
    this.closeModal();
  }

  requestDelete(user: User) {
    this.userToDelete.set(user);
  }

  cancelDelete() {
    this.userToDelete.set(null);
  }

  confirmDeleteAction() {
    if (this.userToDelete()) {
      this.userService.delete(this.userToDelete()!.id!).subscribe();
      this.cancelDelete();
    }
  }

  getAge(date: string): number {
    const birthday = new Date(date);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

}

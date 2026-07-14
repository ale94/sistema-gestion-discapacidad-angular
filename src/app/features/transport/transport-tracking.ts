import { Component, effect, inject, signal, computed, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService } from '../../shared/services/transport.service';
import { TransportRequestService } from '../../shared/services/transport-request.service';
import { FreePassService } from '../../shared/services/free-pass.service';
import { PersonService } from '../../shared/services/person.service';
import { NotificationService } from '../../shared/services/notification.service';
import { TransportRequest, TransportRequestStatus, TransportRequestType } from '../../shared/interfaces/transport-request.interface';
import { TransportRequestForm } from './requests/form/transport-request-form';
import { TransportRequestRenew } from './requests/renew/transport-request-renew';

@Component({
  selector: 'transport-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, TransportRequestForm, TransportRequestRenew],
  templateUrl: './transport-tracking.html',
})
export default class TransportTracking {
  transportService = inject(TransportService);
  requestService = inject(TransportRequestService);
  freePassService = inject(FreePassService);
  private personService = inject(PersonService);
  notification = inject(NotificationService);

  constructor() {
    this.freePassService.loadAll();
    this.personService.loadPersons();
    effect(() => {
      const data = this.freePassService.freePasses();
      const national = this.freePassService.nationalFreePasses();
      if (data.length > 0 || national.length > 0) {
        untracked(() => {
          this.requestService.syncFromBackend();
          this.transportService.refresh();
        });
      }
    });
  }

  // Tabs
  activeTab = signal<'TRACKING' | 'REQUESTS'>('TRACKING');

  // Tracking Logic
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  selectedMonthName = signal<string>('Enero');

  selectedMonthData = computed(() => {
    const data = this.transportService.dataForSelectedYear();
    const month = this.selectedMonthName();
    return data.find(m => m.month === month) || { month, carnets: 0, pasajes: 0 };
  });

  maxMonthlyTotal = computed(() => {
    const data = this.transportService.dataForSelectedYear();
    const maxCarnets = Math.max(...data.map(m => m.carnets));
    const maxPasajes = Math.max(...data.map(m => m.pasajes));
    const max = Math.max(maxCarnets, maxPasajes);
    return max > 0 ? max : 1;
  });

  monthlyAverage = computed(() => {
    const total = this.transportService.yearlyTotals().grandTotal;
    return total / 12;
  });

  // Requests Logic
  showRequestModal = signal<boolean>(false);
  selectedRequest = signal<TransportRequest | null>(null);
  showRenewModal = signal<boolean>(false);
  requestToDelete = signal<TransportRequest | null>(null);

  searchTerm = signal('');
  searchInput = signal('');
  searching = signal(false);

  filterSolicitante = signal('');
  filterDni = signal('');
  filterTipo = signal('');
  filterEstado = signal('');

  typeOptions = Object.values(TransportRequestType);
  statusOptions = Object.values(TransportRequestStatus);

  showTipoDropdown = signal(false);
  showEstadoDropdown = signal(false);

  toggleTipoDropdown() {
    this.showTipoDropdown.update(v => !v);
    this.showEstadoDropdown.set(false);
  }

  toggleEstadoDropdown() {
    this.showEstadoDropdown.update(v => !v);
    this.showTipoDropdown.set(false);
  }

  selectTipo(value: string) {
    this.filterTipo.set(value);
    this.showTipoDropdown.set(false);
    this.onFilterChange();
  }

  selectEstado(value: string) {
    this.filterEstado.set(value);
    this.showEstadoDropdown.set(false);
    this.onFilterChange();
  }

  tipoLabel = computed(() => this.filterTipo() || 'Tipo');
  estadoLabel = computed(() => this.filterEstado()?.replace('_', ' ') || 'Estado');

  pageSize = 5;
  currentPage = signal<number>(1);
  maxVisiblePages = 5;
  Math = Math;

  filteredRequests = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const fSolicitante = this.filterSolicitante().toLowerCase().trim();
    const fDni = this.filterDni().trim();
    const fTipo = this.filterTipo();
    const fEstado = this.filterEstado();

    return this.requestService.requests().filter(req => {
      const name = `${req.lastName ?? ''} ${req.firstName ?? ''}`.toLowerCase();
      const matchesSearch = !term || name.includes(term) || (req.dni ?? '').toString().includes(term);
      const matchesSolicitante = !fSolicitante || name.includes(fSolicitante);
      const matchesDni = !fDni || (req.dni ?? '').toString().includes(fDni);
      const matchesTipo = !fTipo || req.type === fTipo;
      const matchesEstado = !fEstado || req.status === fEstado;
      return matchesSearch && matchesSolicitante && matchesDni && matchesTipo && matchesEstado;
    });
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredRequests().length / this.pageSize));
  });

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  currentPageGroup = computed(() => Math.floor((this.currentPage() - 1) / this.maxVisiblePages));

  visiblePages = computed(() => {
    const start = this.currentPageGroup() * this.maxVisiblePages;
    return this.pages().slice(start, start + this.maxVisiblePages);
  });

  pagedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRequests().slice(start, start + this.pageSize);
  });

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevGroup() {
    const firstInGroup = this.currentPageGroup() * this.maxVisiblePages + 1;
    this.setPage(firstInGroup - 1);
  }

  nextGroup() {
    const firstInNext = (this.currentPageGroup() + 1) * this.maxVisiblePages + 1;
    this.setPage(firstInNext);
  }

  pageInfo = computed(() => {
    const total = this.filteredRequests().length;
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, total);
    return { start, end, total, hasPages: total > this.pageSize };
  });

  onSearchInput(term: string) {
    this.searchInput.set(term);
    if (!term.trim()) {
      this.searchTerm.set('');
      this.currentPage.set(1);
    }
  }

  onFilterChange() {
    this.currentPage.set(1);
  }

  clearFilters() {
    this.filterSolicitante.set('');
    this.filterDni.set('');
    this.filterTipo.set('');
    this.filterEstado.set('');
    this.searchTerm.set('');
    this.searchInput.set('');
    this.currentPage.set(1);
  }

  doSearch() {
    this.searching.set(true);
    setTimeout(() => {
      this.searchTerm.set(this.searchInput());
      this.currentPage.set(1);
      this.searching.set(false);
    }, 2000);
  }

  openRequestModal(req?: TransportRequest) {
    this.selectedRequest.set(req || null);
    this.showRequestModal.set(true);
  }

  closeRequestModal() {
    this.showRequestModal.set(false);
    this.selectedRequest.set(null);
  }

  openRenewModal() {
    this.showRenewModal.set(true);
  }

  closeRenewModal() {
    this.showRenewModal.set(false);
  }

  handleRenew(req: TransportRequest) {
    const currentYear = new Date().getFullYear();

    const person = this.freePassService.freePasses().find(fp =>
      fp.personId === req.personId
    ) ?? this.freePassService.freePasses().find(fp =>
      fp.fullName.toLowerCase().includes(req.lastName.toLowerCase()) &&
      fp.fullName.toLowerCase().includes(req.firstName.toLowerCase())
    );

    if (!person) {
      this.notification.show('No se encontró un pase libre activo para esta persona.');
      this.closeRenewModal();
      return;
    }

    const alreadyRenewed = this.freePassService.renewals().some(
      r => r.freePassId === person.id && r.year === currentYear
    );

    if (alreadyRenewed) {
      this.notification.show('Ya existe una renovación para este año para esta persona.');
      this.closeRenewModal();
      return;
    }

    this.freePassService.createRenewal({
      freePassId: person.id,
      year: currentYear,
    }).subscribe({
      next: () => {
        this.freePassService.loadAll();
        this.closeRenewModal();
      },
      error: (err) => {
        console.error('Error creating renewal:', err);
        this.notification.show('Error al crear la renovación. Es posible que ya exista una para este año.');
      }
    });
  }

  saveRequest(req: TransportRequest) {
    if (req.id) {
      this.requestService.updateRequest(req.id, req);
    } else {
      this.requestService.addRequest(req);
    }
    this.transportService.refresh();
    this.closeRequestModal();
  }

  requestDelete(req: TransportRequest) {
    this.requestToDelete.set(req);
  }

  confirmDeleteAction() {
    const req = this.requestToDelete();
    if (req?.id) {
      this.requestService.deleteRequest(req.id).subscribe({
        next: () => {
          this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
          this.requestToDelete.set(null);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.notification.show('Error al eliminar. Intente nuevamente.');
          this.requestToDelete.set(null);
        }
      });
    }
  }

  cancelDelete() {
    this.requestToDelete.set(null);
  }

  getStatusClass(status: TransportRequestStatus): string {
    switch(status) {
      case TransportRequestStatus.APROBADA: return 'bg-green-100 text-green-800';
      case TransportRequestStatus.PENDIENTE: return 'bg-amber-100 text-amber-800';
      case TransportRequestStatus.EN_REVISION: return 'bg-blue-100 text-blue-800';
      case TransportRequestStatus.RECHAZADA: return 'bg-red-100 text-red-800';
      case TransportRequestStatus.FINALIZADA: return 'bg-slate-100 text-slate-800';
      case TransportRequestStatus.DOCUMENTACION_INCOMPLETA: return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}

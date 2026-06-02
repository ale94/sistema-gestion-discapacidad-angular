import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService } from '../../shared/services/transport.service';
import { TransportRequestService } from '../../shared/services/transport-request.service';
import { TransportRequest, TransportRequestStatus } from '../../shared/interfaces/transport-request.interface';
import { TransportRequestForm } from './requests/form/transport-request-form';

@Component({
  selector: 'transport-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, TransportRequestForm],
  templateUrl: './transport-tracking.html',
})
export default class TransportTracking {
  transportService = inject(TransportService);
  requestService = inject(TransportRequestService);

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

  pageSize = 5;
  currentPage = signal<number>(1);

  pagedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.requestService.requests().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.requestService.requests().length / this.pageSize));
  });

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    for (let i = left; i <= right; i++) range.push(i);
    if (total > 1) range.push(total);

    return range;
  });

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  pageInfo = computed(() => {
    const total = this.requestService.requests().length;
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, total);
    return { start, end, total, hasPages: total > this.pageSize };
  });

  openRequestModal(req?: TransportRequest) {
    this.selectedRequest.set(req || null);
    this.showRequestModal.set(true);
  }

  closeRequestModal() {
    this.showRequestModal.set(false);
    this.selectedRequest.set(null);
  }

  saveRequest(req: TransportRequest) {
    if (req.id) {
      this.requestService.updateRequest(req.id, req);
    } else {
      this.requestService.addRequest(req);
    }
    this.closeRequestModal();
  }

  deleteRequest(id: string) {
    if (confirm('¿Está seguro de eliminar esta solicitud?')) {
      this.requestService.deleteRequest(id);
      this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
    }
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

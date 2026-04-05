import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoanEquipmentService } from '../../../shared/services/loan.equipment.service';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'profile',
  imports: [TitleCasePipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './profile.html',
})
export default class Profile {

  private route = inject(ActivatedRoute);
  private loanEquipmentService = inject(LoanEquipmentService);

  loan = computed(() => {
    const loanId = this.route.snapshot.paramMap.get('id');
    if (!loanId) return undefined;
    return this.loanEquipmentService
      .loans()
      .find((p) => p.id === +loanId);
  });
}

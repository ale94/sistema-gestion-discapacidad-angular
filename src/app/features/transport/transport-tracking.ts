import { Component, inject } from '@angular/core';
import { TransportService } from '../../shared/services/transport.service';

@Component({
  selector: 'transport-tracking',
  standalone: true,
  imports: [],
  templateUrl: './transport-tracking.html',
})
export default class TransportTracking {
  transportService = inject(TransportService);
}

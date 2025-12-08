import { Component, effect, inject, signal } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PersonService } from '../../shared/services/person.service';
import { Person } from '../../shared/interfaces/person.interface';

@Component({
  selector: 'chart-page',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './chart-page.html',
})
export default class ChartPage {

  FOUR_COLORS = [
    '#00A6F4', // Azul Brillante
    '#F44336', // Rojo
    '#FE9A00', // Naranja Vivo
    '#FF2056'  // Rosa Neon
  ];

  FOUR_HOVER_COLORS = [
    '#33B8F6',
    '#E57373',
    '#FFB033',
    '#FF4D7A'
  ];

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Personas Empadronadas' }]
  };

  personService = inject(PersonService);

  constructor() {
    const peopleService = this.personService.getPeople();

    // EFFECT: Reacciona a los cambios en la señal de personas
    effect(() => {
      const people = peopleService();
      this.processData(people);
    });
  }

  /**
   * Transforma la lista de personas en datos contables por año
   */
  private processData(people: Person[]) {
    // Objeto para acumular el conteo: { '2023': 150, '2024': 200 }
    const yearCounts: { [key: string]: number } = {};

    people.forEach(person => {
      // Usamos el campo correcto: fechaEmpadronamiento (formato YYYY-MM-DD)
      const dateString = person.fechaEmpadronamiento;

      // 1. Convertir la cadena de fecha a un objeto Date y extraer el año
      const date = new Date(dateString);

      // Asegurarse de que la fecha sea válida antes de procesar
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear().toString();

        // 2. Contar la ocurrencia del año
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });

    // 3. Obtener y ordenar los años (Labels)
    const sortedYears = Object.keys(yearCounts).sort();

    // 4. Mapear las cantidades (Data) en el mismo orden
    const dataCounts = sortedYears.map(year => yearCounts[year]);

    // 5. Actualizar el objeto del gráfico con los datos y los colores
    this.barChartData = {
      labels: sortedYears,
      datasets: [
        {
          data: dataCounts,
          label: 'Personas Empadronadas',
          backgroundColor: this.FOUR_COLORS,
          borderColor: this.FOUR_COLORS,
          borderWidth: 1,
          hoverBackgroundColor: this.FOUR_HOVER_COLORS
        }
      ]
    };
  }

  // Título: Configuración del Gráfico de Barras
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    // Mantenemos el ratio para que se adapte bien
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false,
        text: 'Personas Empadronadas por Año'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Personas'
        },
      }
    }
  };

}

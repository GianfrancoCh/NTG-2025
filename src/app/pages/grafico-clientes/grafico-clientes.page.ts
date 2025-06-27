import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  NavController,
  IonLabel,
  IonIcon,
  IonButton,
  IonCardContent,
  IonCard,
  IonCardHeader,
} from '@ionic/angular/standalone';
import { EncuestaCliente } from 'src/app/clases/encuestas/encuesta-cliente';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { addIcons } from 'ionicons';
import {
  analytics,
  barChartOutline,
  chevronBackCircleOutline,
  pieChartOutline,
} from 'ionicons/icons';
import { ToastError } from 'src/app/utils/alerts';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-grafico-clientes',
  templateUrl: './grafico-clientes.page.html',
  styleUrls: ['./grafico-clientes.page.scss'],
  standalone: true,
  imports: [
    IonCardHeader,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonLabel,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class GraficoClientesPage implements AfterViewInit {
  @ViewChild('barChart', { static: false }) barChartElement!: ElementRef;
  barChart: any;

  @ViewChild('lineChart', { static: false }) lineChartElement!: ElementRef;
  lineChart: any;

  @ViewChild('doughnutChart', { static: false })
  doughnutChartElement!: ElementRef;
  doughnutChart: any;

  encuestas!: EncuestaCliente[];

  mostrarGraficoBarras: boolean = false;
  mostrarGraficoLineas: boolean = false;
  mostrarGraficoTorta: boolean = false;

  constructor(
    private db: DatabaseService,
    private spinner: NgxSpinnerService,
    protected navCtrl: NavController
  ) {
    addIcons({
      chevronBackCircleOutline,
      analytics,
      barChartOutline,
      pieChartOutline,
    });
    this.mostrarGraficoBarras = true;
  }

  ngAfterViewInit(): void {
    this.traerEncuestas();
  }

  mostrarGrafico1() {
    this.mostrarGraficoBarras = true;
    this.mostrarGraficoLineas = false;
    this.mostrarGraficoTorta = false;
    setTimeout(() => {
      this.generarGraficoBarras();
    }, 0);
  }
  mostrarGrafico2() {
    this.mostrarGraficoBarras = false;
    this.mostrarGraficoLineas = true;
    this.mostrarGraficoTorta = false;
    setTimeout(() => {
      this.generarGraficoLineas();
    }, 0);
  }
  mostrarGrafico3() {
    this.mostrarGraficoBarras = false;
    this.mostrarGraficoLineas = false;
    this.mostrarGraficoTorta = true;

    setTimeout(() => {
      this.generarGraficoDoughnutRecomendacion();
    }, 0);
  }

  async traerEncuestas() {
    try {
      this.spinner.show(); // Mostrar spinner de carga

      this.encuestas = await this.db.traerColeccion<EncuestaCliente>(
        Colecciones.EncuestasCliente
      );
      this.generarGraficoBarras();
      this.generarGraficoLineas();
      this.generarGraficoDoughnutRecomendacion();
      this.spinner.hide(); // Ocultar spinner de carga después de cargar los datos
    } catch (error: any) {
      console.log(error);
      ToastError.fire('Ups...', error.message);
    } finally {
      this.spinner.hide();
    }
  }

  generarGraficoBarras() {
    const puntuaciones = this.encuestas.map((p) => p.puntuacionGeneral);
    const frecuenciaPuntuaciones: { [key: number]: number } = {};

    puntuaciones.forEach((p) => {
      if (frecuenciaPuntuaciones[p]) {
        frecuenciaPuntuaciones[p]++;
      } else {
        frecuenciaPuntuaciones[p] = 1;
      }
    });

    const etiquetas = Object.keys(frecuenciaPuntuaciones)
      .map(Number)
      .sort((a, b) => a - b);
    const frecuencias = etiquetas.map(
      (etiqueta) => frecuenciaPuntuaciones[etiqueta]
    );

    const colors = [
      '#ffc409', // Amarillo
      '#eb445a', // Rojo
      '#3dc2ff', // Azul claro
      '#92949c', // Gris
      '#2fdf75', // Verde
      '#0044ff', // Azul oscuro
      '#ee55ff', // Rosa
    ];

    const barColors = etiquetas.map(
      (_, index) => colors[index % colors.length]
    );
    if (this.barChartElement && this.barChartElement.nativeElement) {
      const ctx = this.barChartElement.nativeElement.getContext('2d');

      if (this.barChart) {
        this.barChart.destroy();
      }

      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: 'Frecuencia de Puntuaciones',
              data: frecuencias,
              backgroundColor: barColors,
              borderColor: barColors,
              borderWidth: 2,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: 20,
          },
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Puntuación General',
              },
            },
          },
          plugins: {
            tooltip: {
              usePointStyle: true,
              callbacks: {
                label: function (context) {
                  return 'Cantidad: ' + context.raw;
                },
              },
              displayColors: false,
            },
            legend: {
              display: false,
            },
          },
        },
      });
    }
  }

  generarGraficoLineas() {
    const atenciones = this.encuestas.map((encuesta) => encuesta.atencion);
    const frecuenciaAtenciones: { [key: string]: number } = {
      'muy mala': 0,
      mala: 0,
      buena: 0,
      excelente: 0,
    };

    atenciones.forEach((atencion) => {
      if (frecuenciaAtenciones[atencion] !== undefined) {
        frecuenciaAtenciones[atencion]++;
      }
    });

    const etiquetas = ['muy mala', 'mala', 'buena', 'excelente'];
    const frecuencias = etiquetas.map(
      (etiqueta) => frecuenciaAtenciones[etiqueta]
    );

    const lineColor = '#00ff00'; // Verde
    const pointColor = '#008000'; // Verde oscuro

    if (this.lineChartElement && this.lineChartElement.nativeElement) {
      const ctx = this.lineChartElement.nativeElement.getContext('2d');

      if (this.lineChart) {
        this.lineChart.destroy();
      }

      this.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: 'Recuento de Tipos de Atención',
              data: frecuencias,
              backgroundColor: pointColor,
              borderColor: lineColor,
              borderWidth: 2,
              pointBackgroundColor: pointColor,
              pointBorderColor: lineColor,
              pointRadius: 5,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: 20,
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Tipo de Atención',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad',
              },
            },
          },
          plugins: {
            tooltip: {
              usePointStyle: true,
              callbacks: {
                label: function (context) {
                  return 'Cantidad: ' + context.raw;
                },
              },
              displayColors: false,
            },
            legend: {
              display: false,
            },
          },
        },
      });
    }
  }

  generarGraficoDoughnutRecomendacion() {
    const recomendados = this.encuestas.filter((e) => e.recomendacion).length;
    const noRecomendados = this.encuestas.length - recomendados;
    if (this.doughnutChartElement && this.doughnutChartElement.nativeElement) {
      const ctx = this.doughnutChartElement.nativeElement.getContext('2d');

      if (this.doughnutChart) {
        this.doughnutChart.destroy();
      }

      this.doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Recomendados', 'No Recomendados'],
          datasets: [
            {
              data: [recomendados, noRecomendados],
              backgroundColor: ['#36a2eb', '#ff6384'], // Colores para los segmentos
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const labelIndex = context.dataIndex as number;
                  const label = context.label || '';
                  const value = context.raw!.toLocaleString();
                  return `${label}: ${value}`;
                },
              },
            },
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
              },
            },
          },
        },
      });
    }
  }
}

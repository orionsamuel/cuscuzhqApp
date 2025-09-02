import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  AlertController,
  ToastController,
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonText
}

from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { InscritosService } from '../services/inscritos.service';
import { IInscritos } from '../models/IInscritos.model';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption
  ]
})
export class Tab1Page implements OnInit {
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private router = inject(Router);
  private inscritosService = inject(InscritosService);

  titulo = 'Inscritos Cuscuz HQ';
  edicao = 0;
  listaInscritos: IInscritos[] = [];
  mensagem = "";
  tamanho = 0;
  showToast = false;
  toastMessage = '';

  ngOnInit() {
    this.inscritosService.buscarEdicao().subscribe({
      next: (dados) => {
        this.edicao = dados.numero;
      },
      error: (erro) => {
        console.error('Erro ao buscar edição:', erro);
      }
    });
  }

  buscarInscrito(evento: any) {
    const busca = evento.target.value;

    if (busca && busca.trim() !== '') {
      this.inscritosService.buscarInscrito(busca).subscribe({
        next: (dados) => {
          this.listaInscritos = dados;
          this.tamanho = dados.length;
        },
        error: (erro) => {
          console.error('Erro na busca:', erro);
        }
      });
    } else {
      this.listaInscritos = [];
      this.tamanho = 0;
    }
  }

  alterarPresenca1(inscrito: IInscritos) {
    inscrito.presente1 = !inscrito.presente1;
    console.log(inscrito);
    this.inscritosService.atualizarPresenca(inscrito).subscribe(dados=>{
      console.log(dados);
      console.log(this.listaInscritos);
    });
  }

  alterarPresenca2(inscrito: IInscritos) {
    inscrito.presente2 = !inscrito.presente2;
    console.log(inscrito);
    this.inscritosService.atualizarPresenca(inscrito).subscribe(dados=>{
      console.log(dados);
      console.log(this.listaInscritos);
    });
  }

  async exibirAlertaPresenca1(inscrito: IInscritos) {
    const novoStatus = !inscrito.presente1;
    this.mensagem = novoStatus
      ? 'Deseja colocar participante como presente?'
      : 'Deseja colocar participante como ausente?';

    const alert = await this.alertController.create({
      header: 'Confirmar Alteração',
      message: this.mensagem,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Alteração cancelada');
          }
        }, {
          text: 'Confirmar',
          handler: () => {
            this.alterarPresenca1(inscrito);
          }
        }
      ]
    });

    await alert.present();
  }

  async exibirAlertaPresenca2(inscrito: IInscritos) {
    const novoStatus = !inscrito.presente2;
    this.mensagem = novoStatus
      ? 'Deseja colocar participante como presente?'
      : 'Deseja colocar participante como ausente?';

    const alert = await this.alertController.create({
      header: 'Confirmar Alteração',
      message: this.mensagem,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Alteração cancelada');
          }
        }, {
          text: 'Confirmar',
          handler: () => {
            this.alterarPresenca2(inscrito);
          }
        }
      ]
    });

    await alert.present();
  }

  private async mostrarToast(mensagem: string, isError: boolean = false) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      color: isError ? 'danger' : 'success',
      position: 'bottom'
    });

    await toast.present();
  }

  limparBusca() {
    this.listaInscritos = [];
    this.tamanho = 0;
  }
}

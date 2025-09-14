import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
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
  IonButton,
  IonModal,
  IonButtons,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
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
    IonButton,
    IonModal,
    IonButtons,
    IonSpinner,
    IonText
  ]
})
export class Tab1Page implements OnInit {
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private router = inject(Router);
  private inscritosService = inject(InscritosService);

  titulo = 'Inscritos';
  edicao = 0;
  listaInscritos: any[] = [];
  listaCompleta: any[] = [];
  mensagem = "";
  tamanho = 0;
  showToast = false;
  toastMessage = '';
  isModalOpen = false;
  inscritoSelecionado: any | null = null;
  termoBusca = '';
  isLoading = false;

  ngOnInit() {
    this.carregarEdicaoEInscritos();
  }

  async ionViewWillEnter() {
    console.log('Tab1 activada, recarregando inscritos...');
    this.carregarTodosInscritos();
  }

  async carregarEdicaoEInscritos() {
    this.isLoading = true;

    try {
      console.log('Iniciando carregamento da edição e inscritos...');
      const dadosEdicao = await this.inscritosService.buscarEdicao().toPromise();
      this.edicao = dadosEdicao.numero;
      console.log('Edição carregada:', this.edicao);
      await this.carregarTodosInscritos();

    } catch (error) {
      console.error('Erro ao carregar edição e inscritos:', error);
      this.mostrarToast('Erro ao carregar dados', true);
    } finally {
      this.isLoading = false;
    }
  }

  async carregarTodosInscritos(event?: any) {
    if (!this.edicao) {
      console.log('Edição não definida, aguardando...');

      if (this.inscritosService.edicao?.numero) {
        this.edicao = this.inscritosService.edicao.numero;
        console.log('Edição obtida do serviço:', this.edicao);
      } else {
        console.warn('Não é possível carregar inscritos: edição indefinida');
        return;
      }
    }

    console.log('Carregando inscritos para edição:', this.edicao);

    try {
      const participantes = await firstValueFrom(
        this.inscritosService.buscarTodosInscritos()
      );

      this.listaCompleta = participantes ?? [];
      this.listaInscritos = participantes ?? [];
      this.tamanho = this.listaInscritos.length;

      console.log('Lista atualizada com', this.tamanho, 'inscritos');
    } catch (error) {
      console.error('Erro ao carregar inscritos:', error);
      this.mostrarToast('Erro ao carregar lista de inscritos', true);
    }
  }

  buscarInscrito(evento: any) {
    const busca = evento.target.value;
    this.termoBusca = busca;

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
      this.listaInscritos = this.listaCompleta;
      this.tamanho = this.listaCompleta.length;
    }
  }

  abrirModal(inscrito: IInscritos) {
    this.inscritoSelecionado = { ...inscrito };
    this.isModalOpen = true;
  }

  fecharModal() {
    this.carregarEdicaoEInscritos();
    this.isModalOpen = false;
    this.inscritoSelecionado = null;
  }

  async alterarPresenca1() {
    if (!this.inscritoSelecionado) return;

    const novoStatus = !this.inscritoSelecionado.presente1;
    this.mensagem = novoStatus
      ? 'Deseja colocar participante como presente no Dia 1?'
      : 'Deseja colocar participante como ausente no Dia 1?';

    const alert = await this.alertController.create({
      header: 'Confirmar Alteração',
      message: this.mensagem,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Confirmar',
          handler: () => {
            this.inscritoSelecionado!.presente1 = novoStatus;
            this.salvarAlteracoes();
          }
        }
      ]
    });

    await alert.present();
  }

  async alterarPresenca2() {
    if (!this.inscritoSelecionado) return;

    const novoStatus = !this.inscritoSelecionado.presente2;
    this.mensagem = novoStatus
      ? 'Deseja colocar participante como presente no Dia 2?'
      : 'Deseja colocar participante como ausente no Dia 2?';

    const alert = await this.alertController.create({
      header: 'Confirmar Alteração',
      message: this.mensagem,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Confirmar',
          handler: () => {
            this.inscritoSelecionado!.presente2 = novoStatus;
            this.salvarAlteracoes();
          }
        }
      ]
    });

    await alert.present();
  }

  salvarAlteracoes() {
    if (!this.inscritoSelecionado) return;

    this.inscritosService.atualizarPresenca(this.inscritoSelecionado).subscribe({
      next: (dados) => {
        console.log('Presença atualizada:', dados);
        this.mostrarToast('Presença atualizada com sucesso!', false);

        const index = this.listaInscritos.findIndex(i => i.id === this.inscritoSelecionado!.id);
        if (index !== -1) {
          this.listaInscritos[index] = { ...this.inscritoSelecionado };
        }
      },
      error: (erro) => {
        console.error('Erro ao atualizar presença:', erro);
        this.mostrarToast('Erro ao atualizar presença', true);
      }
    });
  }

  async excluirInscrito() {
    if (!this.inscritoSelecionado) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Deseja excluir o inscrito ${this.inscritoSelecionado.nome}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.confirmarExclusao();
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarExclusao() {
    if (!this.inscritoSelecionado) return;

    this.inscritosService.deletarInscrito(this.inscritoSelecionado).subscribe({
      next: (dados) => {
        console.log('Inscrito excluído:', dados);
        this.mostrarToast('Inscrito excluído com sucesso!', false);

        this.fecharModal();
      },
      error: (erro) => {
        console.error('Erro ao excluir inscrito:', erro);
        this.mostrarToast('Erro ao excluir inscrito', true);
      }
    });
  }

  navegarParaCadastro() {
    this.router.navigate(['/tabs/tab2']);
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
    this.termoBusca = '';
    this.listaInscritos = this.listaCompleta;
    this.tamanho = this.listaCompleta.length;
  }
}

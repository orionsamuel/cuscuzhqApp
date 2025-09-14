import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonList,
  IonModal,
  ToastController,
  Platform,
  IonThumbnail,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  AlertController,
  IonButtons,
  IonSpinner,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';

import { CospobreService } from '../services/cospobre.service';
import { InscritosService } from './../services/inscritos.service';
import { NotasService } from '../services/notas.service';
import { ImageCacheService } from '../services/image-cache.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonList,
    IonModal,
    IonThumbnail,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonButtons,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  ]
})
export class Tab3Page implements OnInit {
  private alertController = inject(AlertController);
  private formBuilder = inject(FormBuilder);
  private http = inject(HttpClient);
  private cospobreService = inject(CospobreService);
  private inscritosService = inject(InscritosService);
  private notasService = inject(NotasService);
  private imageCacheService = inject(ImageCacheService);
  private toastController = inject(ToastController);
  private router = inject(Router);
  private platform = inject(Platform);
  private cdr = inject(ChangeDetectorRef);

  titulo = 'Cospobres';
  formCadastroNotas!: FormGroup;
  isSubmitted = false;
  isCosplay = true;
  edicao!: number;
  notas: any = {};
  listaParticipantes!: any[];
  listaNotas: any[] = [];
  personagem!: string;
  imagem!: string;
  nome!: string;
  isModalOpen = false;
  musica!: HTMLAudioElement;
  posicaoReproducao = 0;
  cachedImages: { [key: string]: string } = {};
  isLoading = false;

  constructor() {
    this.platform.ready().then(() => {
      this.init();
    });
  }

  get errorControl() {
    return this.formCadastroNotas.controls;
  }

  ngOnInit() {
    this.formCadastroNotas = this.formBuilder.group({
      criatividade: ['', [
        Validators.required,
        Validators.pattern(/^10$|^[0-9](\.[0-9]{1,2})?$/),
        Validators.min(0),
        Validators.max(10)
      ]],
      fidelidade: ['', [
        Validators.required,
        Validators.pattern(/^10$|^[0-9](\.[0-9]{1,2})?$/),
        Validators.min(0),
        Validators.max(10)
      ]],
      desenvolvimento: ['', [
        Validators.required,
        Validators.pattern(/^10$|^[0-9](\.[0-9]{1,2})?$/),
        Validators.min(0),
        Validators.max(10)
      ]]
    });
  }

  ionViewDidEnter() {
    this.cdr.detectChanges();
  }

  async init() {
    this.isLoading = true;
    try {
      await this.buscarEdicao();

      await this.buscarParticipante();

      await this.cacheImagesForParticipants();
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
    } finally{
      this.isLoading = false
    }
  }

  async cacheImagesForParticipants() {
    try {
      for (const participante of this.listaParticipantes) {
        const cachedImageUrl = await this.imageCacheService.cacheImage(participante.imagem, participante.email);
        // console.log('URL cache: ', cachedImageUrl);
        this.cachedImages[participante.email] = cachedImageUrl;
      }
    } catch (error) {
      console.error('Erro ao cacheiar imagens:', error);
    }
  }

  getImageUrl(participante: any): string {
    // console.log('URL final da imagem: ', this.cachedImages[participante.email]);
    const cacheUrl = this.cachedImages[participante.email];
    if (cacheUrl && !cacheUrl.includes('null')) {
      return cacheUrl;
    }
    return participante.imagem;
  }

  // cosplayToggleChanged(event: CustomEvent) {
  //   this.isCosplay = event.detail.checked;
  //   console.log(this.isCosplay);
  //   setTimeout(() => {
  //     this.buscarParticipante();
  //   }, 2000);
  // }

  async buscaNotasEAltera() {
    try {
      await this.buscarNotas();
      console.log('Notas carregadas:', this.listaNotas);

      this.cadastroNotas();
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      this.presentToast('Erro ao carregar notas', 'danger');
    }
  }

  cadastroNotas() {
    this.isSubmitted = true;

    if (!this.formCadastroNotas.valid) {
      this.presentToast('Por favor, preencha as notas corretamente', 'danger');
      return;
    }

    console.log(this.formCadastroNotas.value);
    this.presentToast('Notas Cadastradas Com Sucesso', 'success');

    const notaEncontrada = this.listaNotas.find((nota) => nota.nome === this.nome);

    if (!notaEncontrada) {
      this.presentToast('Erro: Participante não encontrado nas notas', 'danger');
      return;
    }

    console.log(this.nome);

    const nota1Existente = this.parseSafeFloat(notaEncontrada.nota_1);
    const nota2Existente = this.parseSafeFloat(notaEncontrada.nota_2);
    const nota3Existente = this.parseSafeFloat(notaEncontrada.nota_3);

    const novaNota1 = this.parseSafeFloat(this.formCadastroNotas.value.criatividade);
    const novaNota2 = this.parseSafeFloat(this.formCadastroNotas.value.fidelidade);
    const novaNota3 = this.parseSafeFloat(this.formCadastroNotas.value.desenvolvimento);

    const nota1Final = nota1Existente + novaNota1;
    const nota2Final = nota2Existente + novaNota2;
    const nota3Final = nota3Existente + novaNota3;
    const totalNota = (nota1Final + nota2Final + nota3Final) / 3;

    const dadosParaEnviar = {
      id: notaEncontrada.id,
      nome: notaEncontrada.nome,
      personagem: notaEncontrada.personagem,
      edicao: notaEncontrada.edicao,
      nota_1: nota1Final.toFixed(2),
      nota_2: nota2Final.toFixed(2),
      nota_3: nota3Final.toFixed(2),
      total_nota: totalNota.toFixed(2)
    };

    console.log('📤 Dados para envio:', dadosParaEnviar);

    this.notasService.atualizarNotas(dadosParaEnviar, this.edicao, this.isCosplay).subscribe({
      next: (dados) => {
        console.log('✅ Resposta do servidor:', dados);
        this.presentToast('Notas Cadastradas Com Sucesso', 'success');
        this.formCadastroNotas.reset();
        this.isSubmitted = false;
        this.isModalOpen = false;
      },
      error: (erro) => {
        console.error('❌ Erro no cadastro de notas:', erro);
        this.presentToast('Erro ao cadastrar notas. Tente novamente.', 'danger');
      }
    });
  }

  async buscarParticipante(event?: any) {
    try {
      const participantes = await this.cospobreService.buscarParticipante(this.edicao, this.isCosplay).toPromise();
      console.log(participantes);
      this.listaParticipantes = participantes;
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
    } finally {
      event.target.complete();
    }
  }

  async buscarEdicao() {
    try {
      const dados = await this.inscritosService.buscarEdicao().toPromise();
      console.log(dados);
      this.edicao = dados.numero;
    } catch (error) {
      console.error('Erro ao buscar edição:', error);
    }
  }

  async buscarNotas(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Buscando notas para edição:', this.edicao, 'isCosplay:', this.isCosplay);

      this.notasService.buscarNotas(this.edicao, this.isCosplay).subscribe({
        next: (dados) => {
          console.log('Notas recebidas do servidor:', dados);
          this.listaNotas = dados || [];
          resolve();
        },
        error: (erro) => {
          console.error('Erro ao buscar notas:', erro);
          this.listaNotas = [];
          this.presentToast('Erro ao carregar notas', 'danger');
          reject(erro);
        }
      });
    });
  }

  async excluirParticipante(slidingItem: IonItemSliding, participante: any) {
    if (!participante) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Deseja excluir o participante ${participante.nome}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            slidingItem.close();
          }
        }, {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.confirmarExclusao(participante);
          }
        }
      ]
    });

    await alert.present();
  }


  reproduzirAudio(musicaUrl: string) {
    if (this.musica) {
      this.musica.pause();
    }

    this.musica = new Audio(musicaUrl);
    this.musica.currentTime = this.posicaoReproducao;
    this.musica.play();
  }

  pausarAudio() {
    if (this.musica) {
      this.posicaoReproducao = this.musica.currentTime;
      this.musica.pause();
    }
  }

  pararAudio() {
    if (this.musica) {
      this.musica.pause();
      this.musica.currentTime = 0;
      this.posicaoReproducao = 0;
    }
  }

  setModal(isOpen: boolean, personagem?: string, imagem?: string, nome?: string) {
    this.isModalOpen = isOpen;
    if (isOpen) {
      this.personagem = personagem || '';
      this.imagem = imagem || '';
      this.nome = nome || '';
    }
  }

  async confirmarExclusao(participante: any) {
    if (!participante) return;

    this.cospobreService.deletarParticipante(participante, this.edicao).subscribe({
      next: (dados) => {
        console.log('Inscrito excluído:', dados);
        this.presentToast('Inscrito excluído com sucesso!', 'success');
        this.init();
      },
      error: (erro) => {
        console.error('Erro ao excluir inscrito:', erro);
        this.presentToast('Erro ao excluir inscrito', 'danger');
      }
    });
  }

  async presentToast(texto: string, cor: string) {
    const toast = await this.toastController.create({
      message: texto,
      color: cor,
      duration: 2000
    });
    await toast.present();
  }

  private parseSafeFloat(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

}

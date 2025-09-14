import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonToast,
  IonIcon,
  IonText,
  //IonSelect,
  //IonSelectOption,
  IonSpinner,
  //IonList
} from '@ionic/angular/standalone';
import { InscritosService } from '../services/inscritos.service';
import { IInscritos } from '../models/IInscritos.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
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
    IonToast,
    IonIcon,
    IonText,
    //IonSelect,
    //IonSelectOption,
    IonSpinner,
    //IonList
  ]
})

export class Tab2Page implements OnInit {
  private formBuilder = inject(FormBuilder);
  private inscritosService = inject(InscritosService);
  private router = inject(Router);

  titulo = 'Novo participante';
  formCadastro: FormGroup;
  isSubmitted = false;
  showToast = false;
  toastMessage = '';
  toastColor = 'success';
  inscrito: any = {};
  diaSelecionado: string = '';
  isLoading = false;
  isDropdownOpen = false;

  constructor() {
    this.formCadastro = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      telefone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]]
    });
  }

  get errorControl(): { [key: string]: AbstractControl } {
    return this.formCadastro.controls;
  }

  ngOnInit() {
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOption(value: string) {
    console.log('Opção selecionada:', value);
    this.diaSelecionado = value;
    this.formCadastro.patchValue({ diaSelecionado: value });
    this.isDropdownOpen = false;

    this.inscrito.presente1 = value === 'dia1';
    this.inscrito.presente2 = value === 'dia2';
  }

  @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
      if (this.isDropdownOpen) {
        const dropdownElement = document.querySelector('.custom-dropdown');
        const clickedElement = event.target as HTMLElement;

        console.log('Clicou fora?', !dropdownElement?.contains(clickedElement));

        if (dropdownElement && !dropdownElement.contains(clickedElement)) {
          this.isDropdownOpen = false;
          console.log('Dropdown fechado');
        }
      }
    }

  cadastro() {
    this.isSubmitted = true;
    this.isLoading = true;

    if (!this.diaSelecionado) {
      this.isLoading = false;
      this.presentToast('Selecione um dia', 'danger');
      return;
    }

    if (!this.formCadastro.valid) {
      this.isLoading = false;
      console.log('Formulário inválido');
      this.presentToast('Por favor, preencha o formulário corretamente', 'danger');
      return;
    }

    this.inscrito.nome = this.formCadastro.value.nome;
    this.inscrito.telefone = this.formCadastro.value.telefone;
    this.inscrito.email = this.formCadastro.value.email;
    this.inscrito.edicao = this.inscritosService.edicao.id || 1;
    this.inscrito.presente1 = this.diaSelecionado === 'dia1';
    this.inscrito.presente2 = this.diaSelecionado === 'dia2';
    this.inscrito.sorteado = false;

    console.log('Dados do inscrito:', this.inscrito);

    this.inscritosService.cadastrarInscrito(this.inscrito).subscribe({
      next: (dados) => {
        console.log('Cadastro realizado:', dados);
        this.presentToast('Cadastrado com sucesso!', 'success');
        setTimeout(() => {
          this.formCadastro.reset();
          this.diaSelecionado = '';
          this.isSubmitted = false;
          this.isLoading = false;
          this.router.navigate(['/tabs/tab1']);
        }, 2100);
      },
      error: (erro) => {
        console.error('Erro no cadastro:', erro);
        this.presentToast('Erro ao cadastrar. Tente novamente.', 'danger');
      }
    });
  }

private presentToast(mensagem: string, cor: string) {
  this.toastMessage = mensagem;
  this.toastColor = cor;
  this.showToast = true;
  console.log("Caiu no toast");
}

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDropdown();
    }

    if (event.key === 'Escape') {
      this.isDropdownOpen = false;
    }
  }
}

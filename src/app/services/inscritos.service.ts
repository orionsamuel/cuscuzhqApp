import { inject, Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class InscritosService {
  private http = inject(HttpClient);
  private toastController = inject(ToastController);

  public edicao: any;
  private apiURL = 'https://cuscuzhq.alwaysdata.net/inscricao/v1/participantes/';
  private apiURLEdicao = 'https://cuscuzhq.alwaysdata.net/inscricao/v1/edicaoatual/';

  private options: any = { headers: new HttpHeaders({'Content-Type': 'application/json'})};

  private inscritoCadastradoSource = new Subject<void>();
  inscritoCadastrado$ = this.inscritoCadastradoSource.asObservable();

  constructor() {
    this.buscarEdicao().subscribe(dados => {
      console.log(dados);
      this.edicao = dados.numero;
    });
  }

  buscarInscrito(busca: string): Observable<any>{
    const url = `${this.apiURL}${this.edicao}/buscar/${busca}`;
    return this.http.get<any>(`${url}`).pipe(
      map(retorno => retorno),
      catchError(erro => this.exibirErro(erro))
    );
  }

  buscarTodosInscritos(): Observable<any> {
    const url = `${this.apiURL}${this.edicao}/`;
    return this.http.get<any>(url).pipe(
      map(retorno => retorno),
      catchError(erro => this.exibirErro(erro))
    );
  }

  cadastrarInscrito(inscrito: any){
    console.log("Inscrito cadastrado dento do service: ", inscrito);
    const url = `${this.apiURL}${this.edicao}`;
    return this.http.post(`${url}/`, JSON.stringify(inscrito), this.options).pipe(
      map(retorno => {
        this.notificarInscritoCadastrado();
        return retorno;
      }),
      catchError(erro => this.exibirErro(erro))
    );
  }

  atualizarPresenca(inscrito: any): Observable<any>{
    const url = `${this.apiURL}${this.edicao}/${inscrito.id}`;
    return this.http.put(`${url}/`, JSON.stringify(inscrito), this.options).pipe(
      map(retorno => retorno),
      catchError(erro => this.exibirErro(erro))
    );
  }

  deletarInscrito(inscrito: any): Observable<any>{
    const url = `${this.apiURL}${this.edicao}/${inscrito.id}`;
    return this.http.delete(`${url}/`).pipe(
      map(retorno => retorno),
      catchError(erro => this.exibirErro(erro))
    );
  }

  buscarEdicao(): Observable<any>{
    const url = `${this.apiURLEdicao}`;
    return this.http.get<any>(`${url}`).pipe(
      map(retorno => retorno),
      catchError(erro => this.exibirErro(erro))
    );
  }

  async exibirErro(erro: any): Promise<any>{
    const toast = await this.toastController.create({
      message: 'Erro ao consultar a API',
      duration: 2000,
      color: 'danger',
      position: 'middle'
    });

    toast.present();

    return null;
  }

  notificarInscritoCadastrado() {
    console.log('Emitindo evento de inscrito cadastrado');
    this.inscritoCadastradoSource.next();
  }
}

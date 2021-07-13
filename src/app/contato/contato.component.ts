import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ContatoDetalheComponent } from './../contato-detalhe/contato-detalhe.component';
import { ContatoService } from './../contato.service';
import { Component, OnInit } from '@angular/core';
import { Contato } from './contato';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit {

  formulario!: FormGroup;
  contatos: Contato[] = [];
  colunas = ['foto', 'id', 'nome', 'email', 'favorito'];
  totalElementos: number = 0;
  pagina: number = 0;
  tamanho: number =10;
  pageSizeOptions: number[] = [10];

  constructor(
    private service: ContatoService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.montarFormulario();
    this.listarContatos(this.pagina, this.tamanho);

  }

  montarFormulario() {
    this.formulario = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit() {
    const formValues = this.formulario.value;
    const contato: Contato = new Contato(formValues.nome, formValues.email);
    this.service.save(contato)
      .subscribe(response => {
        //let lista: Contato[] = [... this.contatos, response];
        this.listarContatos();
        this.snackbar.open('O contato foi adicionado!', 'Sucesso', {
          duration: 2000
        });
        this.formulario.reset();
      })
  }

  listarContatos(pagina: number = 0, tamanho: number = 10) {
    this.service.list(pagina, tamanho)
      .subscribe(response => {
        this.contatos = response.content;
        this.totalElementos = response.totalElements;
        this.pagina = response.number;
      })
  }

  favoritar(contato: Contato) {

    this.service.favorite(contato)
      .subscribe(response => {
        contato.favorito = !contato.favorito;
      })
  }

  uploadFoto(event: any, contato: Contato) {
    const files = event.target.files;
    if (files) {
      const foto = files[0];
      const formData: FormData = new FormData();
      formData.append("foto", foto);
      this.service
        .upload(contato, formData)
        .subscribe(response => {
          this.listarContatos(this.pagina, this.tamanho);
        })
    }
  }

  visualizarContato(contato: Contato) {
    this.dialog.open( ContatoDetalheComponent, {
      width: '400px',
      height: '450px',
      data: contato
    })
  }

  paginar(event: PageEvent) {
    this.pagina = event.pageIndex;
    this.listarContatos(this.pagina, this.tamanho);
  }

}

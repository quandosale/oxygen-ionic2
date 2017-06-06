/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or a "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
export class Item {

  ID: Number = 908;
  Note: any = null;
  Nome: String = "";
  Cognome: String = "";
  RagioneSociale: any = null;
  Telefono: any = null;
  Targa: String = "";
  Marca: String = "";
  Modello: String = "";
  IdPratica: Number = 9665;
  DataPrenotazione: Date = new Date();
  DataAccettazione: Date = new Date();
  DataConsegna: any = null;
  DataConsegnaPrevista: any = null;
  DataUltimazione: any = null;
  DataInizioLavorazione: any = null;
  DataInserimento: Date = new Date();
  Stato: Number = 2;
  Scaduta: Boolean = false;
  TempoRimastoPercentuale: Number = 10;

  constructor() {
  }

}

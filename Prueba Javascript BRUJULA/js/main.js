////////////////
//CLASE CADENA//
////////////////
class Cadena {

	constructor(id, texto) {
		this._id = id;
		this._texto = texto;
	}

	getId() {
		return this._id;
	}

	getTexto() {
		return this._texto;
	}

	getHtml() {
		return `<option value="${this._id}">${this._texto}</option>`;
	}
}

///////////////
//CLASE LISTA//
///////////////
class Lista {

	constructor(cssSelector) {
		this._cssSelector = cssSelector;
		this._accion = "";
		this._value = [];
	}

	//Devuelve todas las cadenas de texto del listado
	getCadenasTexto() {
		return $(this._cssSelector).children("option");
	}

	getUltimaAccion() {
		return this._accion;
	}

	setUltimaAccion(ultimaAccion) {
		this._accion = ultimaAccion;
	}

	setUltimaCadena(id, texto) {
		this._value[this._value.length] = {
			id,
			texto
		};
	}

	limpiarValores() {
		this._accion = "";
		this._value = [];
	}

	/**
	* Devuelve un array con las cadenas de texto seleccionadas del listado
	*/
	getCadenaTextoSeleccionadas() {
		const elementosSeleccionados = [];
		let haySeleccionados = false;
		$(this._cssSelector).change(() => {
			$("select option:selected").each(function() {
				haySeleccionados = true;
				elementosSeleccionados.push($(this));
			});
		}).trigger("change");
		if(haySeleccionados) this._value = [];

		return elementosSeleccionados;
	}

	//Utilizamos .append para anadir una cadena de texto al listado
	anadirCadena(cadena) {
		$(this._cssSelector).append(cadena);
	}

	/**
	* Deshace la ultima accion realizada
	**/
	deshacerAccion() {
		const accion = this.getUltimaAccion();
		switch (accion) {
			//Eliminamos la ultima cadena anadida al listado
			case "anadir":
				const cadenas = this.getCadenasTexto(); //Guardamos todas las cadenas en el array
				const totalCadenas = cadenas.length;
				//Recorremos el array para comprobar que cadena ha sido anadida y eliminarla
				for (let i = 0; i < totalCadenas; i++) {
					if (cadenas[i].value == this._value[0].id) {
						cadenas[i].remove();
						break;
					}
				}
				//Limpiamos los valores temporales
				this.limpiarValores();
				break;
			//Anadimos todas las cadenas eliminadas en la ultima accion
			case "eliminar":
				for (let i = 0; i < this._value.length; i++) {
					let id = this._value[i].id;
					const texto = this._value[i].texto;
					const cadena = new Cadena(id, texto);
					this.anadirCadena(cadena.getHtml());
				}
				//Limpiamos los valores temporales
				this.limpiarValores();
				break;

			default:
				// statements_def
				break;
		}
	}

	//Comprobamos que el id no existe en el listado
	existeId(id) {
		let existe = false;
		const cadenas = this.getCadenasTexto();
		const totalOpciones = cadenas.length;

		for (let i = 0; i < totalOpciones && !existe; i++) {
			existe = cadenas[i].value == id;
		}
		return existe;
	}
}

/////////////////////
//FUNCIONES ONCLICK//
/////////////////////

const lista = new Lista("select"); //Creamos el objeto lista

/**
 * Anade una cadena de texto al listado, comprobando que no existe para no repetir la ID
 *	y guardamos los valores temporales por si queremos deshacer los cambios
 **/
function aniadirCadenaTexto() {
	const texto = prompt("Introduzca cadena de texto");
	if (texto != null && texto != "") {
		const cadenas = lista.getCadenasTexto();
		let id = cadenas.length;

		do {
			id++;
		} while (lista.existeId(id));

		let cadena = new Cadena(id, texto);
		lista.anadirCadena(cadena.getHtml());
		//Limpiamos cualquier valor residual
		lista.limpiarValores();
		//Guardamos los valores de la cadena recien anadida por si queremos deshacer los cambios
		lista.setUltimaAccion("anadir");
		lista.setUltimaCadena(cadena.getId(), cadena.getTexto());
	}
};

/**
 * Eliminamos las cadenas seleccionadas del listado
 **/
function eliminarCadenasSeleccionadas() {
	//Guardamos las cadenas de texto seleccionadas en un array
	const elementosSeleccionados = lista.getCadenaTextoSeleccionadas();

	if(elementosSeleccionados.length > 0) lista.setUltimaAccion("eliminar");
	//Recorremos el array para guardar los elementos seleccionados y después
	//eliminarlos del listado
	for (let i = 0; i < elementosSeleccionados.length; i++) {
		const id = elementosSeleccionados[i].val();
		const texto = elementosSeleccionados[i].text();
		//Guardamos los elementos seleccionados por si queremos deshacer los cambios
		lista.setUltimaCadena(id, texto);
		elementosSeleccionados[i].remove();
	}
};

/**
 * La funcion deshacer realiza una accion u otra dependiendo de la ultima accion realizada
 **/
function deshacer() {
	lista.deshacerAccion();
}

/////////////////////
//FUNCIONES MOCKJAX//
/////////////////////

//Utilizamos la libreria MOCKJAX para recibir unos datos de prueba predefinidos
$.mockjax({
	url: "mockDatos",
	proxy: 'json/sample.json',
	responseTime: 0,
	dataType: 'json'
});
$.ajax({
	url: "mockDatos",
	dataType: 'json'
}).done(json_response => {
	for (i in json_response.datosPrueba) {
		let cadena = new Cadena(json_response.datosPrueba[i].value, json_response.datosPrueba[i].texto);
		lista.anadirCadena(cadena.getHtml());
	}

	$.mockjaxClear();
});
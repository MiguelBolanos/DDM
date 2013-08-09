var pURL = 'http://50.56.197.123/app/Webservice1.awws';
/*Variables*/
var EmpresaID = 0;
var ClienteID = 0;
var CotizacionID = 0;
var Empresa_SucursalID = 0;
var SeriesID = 0;
var GastosID = 0;
var CotizacionID = 0;
var FacturaID = 0;
var Login = "";
var Paginacion = 1;
var ImpuestosJSON;
/*Variables pantalla clientes*/
var contadorSucursales = 0;
var contadorContactos = 0;
var contadorImpuestos = 0;
var contadorProductos = 0;
var JSonSucursales;
var JSonSeries;
var JSonTiposImpuestos;
/*Variables Gastos*/
var TotalGastos = 0;
var JSonMonedas;
var JSonProductos;
/*Impuestos*/
var arrImpuestos = new Array();
var addObjectImpuesto = null;
var indexImpuesto = 0;
var obtenerIDImpuesto = 0;
/*Permisos*/
var permisoCliente = false, permisoAdmonFactura = false, permisoGastos = false, permisoReportes = false;
var permisoConfiguracion = false, permisoGenerarFactura = false, permisoCancelarFactura = false, permisoVDEFacturas = false, permisoAbonarFactura = false;
/*Preferencias*/
var numDecimales = 2;
/*Login*/
function autentifica() {
	var usuario = $("#tbUsuario").val();
	var pass = $("#tbContrasena").val();
	var resultado = false;
	if (usuario != "" && pass != "") {
		var soap;
		soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:Login>';
		soap = soap + '<urn:sUsuario>' + usuario + '</urn:sUsuario>';
		soap = soap + '<urn:sPass>' + pass + '</urn:sPass>';
		soap = soap + '</urn:Login>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';
		$.ajax({
			cache : false,
			type : 'POST',
			async : false,
			dataType : "xml",
			//url:'http://192.168.0.101/app/Service1.asmx/Login',
			//data: {"sUsuario" : usuario,"sContrasena" : pass},
			contentType : "text/xml;charset=UTF-8",
			url : pURL,
			data : soap,
			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "true") {
					EmpresaID = obj.EmpresaID;
					Login = obj.Login;
					jsonPermisos = obj.Permisos;
					$.each(obj.Permisos, function (index, value) {
						if (EmpresaID == value.EmpresaID) {
							switch (value.PermisosAccionesID) {
							case "1":
								/*clientes*/
								permisoCliente = true;
								break;
							case "2":
								/*Administracion de facturas*/
								permisoAdmonFactura = true;
								break;
							case "3":
								/*Gastos*/
								permisoGastos = true;
								break;
							case "4":
								/*Reportes*/
								permisoReportes = true;
								break;
							case "5":
								/*Configuracion empresa*/
								permisoConfiguracion = true;
								break;
							case "6":
								/*Generar factura*/
								permisoGenerarFactura = true;
								break;
							case "7":
								/*Cancelar factura*/
								permisoCancelarFactura = true;
								break;
							case "8":
								/*VDE factura*/
								permisoVDEFacturas = true;
								break;
							case "9":
								/*Abonar factura*/
								permisoAbonarFactura = true;
								break;
							case "10":
								/*Abonar factura*/
								permisoAbonarFactura = true;
								break;
							}
						}
					});
					$("#errorLogin").removeClass("Visible");
					$("#errorLogin").addClass("NoVisible");
					resultado = true;
				} else {
					$("#errorLogin").text("*Su contrasena es incorrecta.");
					$("#errorLogin").removeClass("NoVisible");
					$("#errorLogin").addClass("Visible");
				}
			},
			error : function (xhr, ajaxOptions, thrownError) {
				//alert("Error: " + xhr.status +" | "+xhr.responseText);
				$.mobile.changePage("#pError", {
					role : "dialog",
					transition : "slidedown"
				});
			}
		});
		if (resultado) {
			populateMonedas();
			populateProductos();
			cargarImpuestos();
			$.mobile.changePage('#pMenu', {
				transition : "flip"
			});
		}
	}
}

function recuperarContrasena(pLogin) {
	if (pLogin != "") {
		var soap;
		soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:recuperarContrasena>';
		soap = soap + '<urn:pLogin>' + pLogin + '</urn:pLogin>';
		soap = soap + '</urn:recuperarContrasena>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';
		$.ajax({
			cache : false,
			type : 'POST',
			async : false,
			dataType : "xml",
			//url:'http://192.168.0.101/app/Service1.asmx/recuperarContrasena',
			//data: {"pLogin" : pLogin},
			contentType : "text/xml;charset=UTF-8",
			url : pURL,
			data : soap,
			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "false") {
					alert("A ocuurido un error, por favor verifique su conexion a internet.");
				}
			},
			error : function (xhr, ajaxOptions, thrownError) {
				//alert("Error: " + xhr.status +" | "+xhr.responseText);
				$.mobile.changePage("#pError", {
					role : "dialog",
					transition : "slidedown"
				});
			}
		});
		$.mobile.changePage("#pRecuperarContrasena");
	} else {
		$("#errorLogin").text("*Favor de escribir su usuario");
		$("#errorLogin").removeClass("NoVisible");
		$("#errorLogin").addClass("Visible");
	}
}

/*Generales*/
function populateMonedas() {
	var n = 0;
	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllMonedas/>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'POST',
		async : false,
		dataType : "xml",
		//url:'http://192.168.0.101/app/Service1.asmx/getAllMonedas',
		//data: {},
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				JSonMonedas = obj.Monedas;
			}
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error1: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function populateProductos() {
	var n = 0;
	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllProductos>';
	soap = soap + '<urn:pEmpresaID>' + EmpresaID + '</urn:pEmpresaID>';
	soap = soap + '</urn:getAllProductos>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'POST',
		async : false,
		dataType : "xml",
		//url:'http://192.168.0.101/app/Service1.asmx/getAllProductos',
		//data: {"pEmpresaID" : EmpresaID},
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				JSonProductos = obj.Productos;
			}
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error2: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

/*Configuración*/
function limpiarConfiguracion() {
	$("#tbRazonSocial").val("");
	$("#tbRFC").val("");
	$("#tbCalle").val("");
	$("#tbNumExt").val("");
	$("#tbNumInt").val("");
	$("#tbColonia").val("");
	$("#tbCiudad").val("");
	$("#tbReferencias").val("");
	$("#tbMunicipio").val("");
	$("#tbEstado").val("");
	$("#tbPais").val("");
	$("#tbRegimenFiscal").val("");
	$("#tbLugarExpedicion").val("");
	$("#tbCodigoPostal").val("");
	$("#tbFolio").val("");
	$('#cbSucursalEmpresa').children().remove('option');
	$("#cbSucursalEmpresa").append('<option value="" selected="selected">Sucursal</option>');
	$("#cbSucursalEmpresa").val("0");
	$('#cbSerieEmpresa').children().remove('option');
	$("#cbSerieEmpresa").append('<option value="" selected="selected">Serie</option>');
	$("#cbSerieEmpresa").val("0");
}

function populateConfiguracion() {
	var html = ""
		var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getEmpresa>';
	soap = soap + '<urn:pEmpresaId>' + EmpresaID + '</urn:pEmpresaId>';
	soap = soap + '</urn:getEmpresa>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	limpiarConfiguracion();
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : "xml",
		//url:'http://192.168.0.101/app/Service1.asmx/getEmpresa',
		//data: {"EmpresaID" : EmpresaID},
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				JSonSucursales = obj.Sucursales
					$.each(obj.Sucursales, function (index, value) {
						html = '<option value="' + value.Empresa_SucursalID + '" selected="selected">' + value.Sucursal_Nombre + '</option>';
						//$("#cbSucursalEmpresa").append('<option value="" selected="selected">Sucursal</option>');
						$("#cbSucursalEmpresa").append(html);
						if (Empresa_SucursalID == value.Empresa_SucursalID) {
							if (Empresa_SucursalID == 0)
								$("#tbRegimenFiscal").attr('readonly', false);
							else
								$("#tbRegimenFiscal").attr('readonly', true);
							$("#tbRazonSocial").val(value.RazonSocial);
							$("#tbRFC").val(value.RFC);
							$("#tbCalle").val(value.Calle);
							$("#tbNumExt").val(value.NoExterior);
							$("#tbNumInt").val(value.NoInterior);
							$("#tbColonia").val(value.Colonia);
							$("#tbCiudad").val(value.Localidad);
							$("#tbReferencias").val(value.Referencia);
							$("#tbMunicipio").val(value.Municipio);
							$("#tbEstado").val(value.Estado);
							$("#tbPais").val(value.Pais);
							$("#tbCodigoPostal").val(value.CodigoPostal);
							$("#tbRegimenFiscal").val(value.Regimen_Fiscal);
							$("#tbLugarExpedicion").val(value.LugarExpedicion);
						}
					});
				$("#cbSucursalEmpresa").val(Empresa_SucursalID);
				/*Series*/
				JSonSeries = obj.Series;
				$.each(obj.Series, function (index, value) {
					html = '<option value="' + value.SeriesID + '" selected="selected">' + value.Serie + '</option>';
					$("#cbSerieEmpresa").append(html);
				});
				$("#cbSerieEmpresa").val("");
				$.mobile.changePage("#pDatosFiscales");
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error3: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}
function populateSucursal() {
	Empresa_SucursalID = $("#cbSucursalEmpresa").val() != "" ? $("#cbSucursalEmpresa").val() : "0";
	$.each(JSonSucursales, function (index, value) {
		if (Empresa_SucursalID == value.Empresa_SucursalID) {
			if (Empresa_SucursalID == 0)
				$("#tbRegimenFiscal").attr('readonly', false);
			else
				$("#tbRegimenFiscal").attr('readonly', true);
			$("#tbRazonSocial").val(value.RazonSocial);
			$("#tbRFC").val(value.RFC);
			$("#tbCalle").val(value.Calle);
			$("#tbNumExt").val(value.NoExterior);
			$("#tbNumInt").val(value.NoInterior);
			$("#tbColonia").val(value.Colonia);
			$("#tbCiudad").val(value.Localidad);
			$("#tbReferencias").val(value.Referencia);
			$("#tbMunicipio").val(value.Municipio);
			$("#tbEstado").val(value.Estado);
			$("#tbPais").val(value.Pais);
			$("#tbCodigoPostal").val(value.CodigoPostal);
			$("#tbRegimenFiscal").val(value.Regimen_Fiscal);
			$("#tbLugarExpedicion").val(value.LugarExpedicion);
			return;
		}
	});
}
function changeSerie() {
	$("#tbFolio").val("");
	SeriesID = $("#cbSerieEmpresa").val();
	$.each(JSonSeries, function (index, value) {
		if (SeriesID == value.SeriesID) {
			$("#tbFolio").val(value.Folio);
			return;
		}
	});
}

function validaConfiguracion() {
	if ($("#tbRazonSocial").val() == "") {
		alert("Por favor capture la razon social");
		$("#tbRazonSocial").focus();
		return false;
	} else
		if ($("#tbCalle").val() == "") {
			alert("Por favor capture la calle");
			$("#tbCalle").focus();
			return false;
		} else
			if ($("#tbNumExt").val() == "") {
				alert("Por favor capture el numero exterior");
				$("#tbNumExt").focus();
				return false;
			} else
				if ($("#tbMunicipio").val() == "") {
					alert("Por favor capture el municipio");
					$("#tbMunicipio").focus();
					return false;
				} else
					if ($("#tbEstado").val() == "") {
						alert("Por favor capture el estado");
						$("#tbEstado").focus();
						return false;
					} else
						if ($("#tbPais").val() == "") {
							alert("Por favor capture el pais");
							$("#tbPais").focus();
							return false;
						} else
							if ($("#tbCodigoPostal").val() == "") {
								alert("Por favor capture el codigo postal");
								$("#tbCodigoPostal").focus();
								return false;
							} else
								if ($("#tbRegimenFiscal").val() == "") {
									alert("Por favor capture el regimen fiscal");
									$("#tbRegimenFiscal").focus();
									return false;
								} else
									if ($("#tbLugarExpedicion").val() == "") {
										alert("Por favor capture el lugar de expedicion");
										$("#tbLugarExpedicion").focus();
										return false;
									} else
										return true;
}
function updateConfiguracion() {
	if (validaConfiguracion()) {
		$("#dCargando").removeClass("NoVisible");
		$("#dCargando").addClass("Visible");
		var xml;
		xml = '&lt;Empresa&gt;';
		xml = xml + '&lt;EmpresaID&gt;' + EmpresaID + '&lt;/EmpresaID&gt;'
			xml = xml + '&lt;Empresa_SucursalID&gt;' + Empresa_SucursalID + '&lt;/Empresa_SucursalID&gt;'
			xml = xml + '&lt;RazonSocial&gt;' + $("#tbRazonSocial").val() + '&lt;/RazonSocial&gt;'
			xml = xml + '&lt;Calle&gt;' + $("#tbCalle").val() + '&lt;/Calle&gt;'
			xml = xml + '&lt;NoExterior&gt;' + $("#tbNumExt").val() + '&lt;/NoExterior&gt;'
			xml = xml + '&lt;NoInterior&gt;' + $("#tbNumInt").val() + '&lt;/NoInterior&gt;'
			xml = xml + '&lt;Colonia&gt;' + $("#tbColonia").val() + '&lt;/Colonia&gt;'
			xml = xml + '&lt;Ciudad&gt;' + $("#tbCiudad").val() + '&lt;/Ciudad&gt;'
			xml = xml + '&lt;Referencia&gt;' + $("#tbReferencias").val() + '&lt;/Referencia&gt;'
			xml = xml + '&lt;Municipio&gt;' + $("#tbMunicipio").val() + '&lt;/Municipio&gt;'
			xml = xml + '&lt;Estado&gt;' + $("#tbEstado").val() + '&lt;/Estado&gt;'
			xml = xml + '&lt;Pais&gt;' + $("#tbPais").val() + '&lt;/Pais&gt;'
			xml = xml + '&lt;CodigoPostal&gt;' + $("#tbCodigoPostal").val() + '&lt;/CodigoPostal&gt;'
			xml = xml + '&lt;RegimenFiscal&gt;' + $("#tbRegimenFiscal").val() + '&lt;/RegimenFiscal&gt;'
			xml = xml + '&lt;LugarExpedicion&gt;' + $("#tbLugarExpedicion").val() + '&lt;/LugarExpedicion&gt;'
			xml = xml + '&lt;/Empresa&gt;';

		var soap;
		soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:updateEmpresa>';
		soap = soap + '<urn:pXml>' + xml + '</urn:pXml>';
		soap = soap + '</urn:updateEmpresa>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';

		$.ajax({
			cache : false,
			type : 'post',
			async : false,
			dataType : 'xml',
			//url:'http://192.168.0.101/app/Service1.asmx/updateEmpresa',
			//data: {"pXml" : xml },
			contentType : "text/xml;charset=UTF-8",
			url : pURL,
			data : soap,
			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "true") {
					$.mobile.changePage("#pMenu");
				} else
					alert("A ocuurido un error, por favor verifique su conexion a internet.");

				$("#dCargando").removeClass("Visible");
				$("#dCargando").addClass("NoVisible");
			},
			error : function (xhr, ajaxOptions, thrownError) {
				//alert("Error4: " + xhr.status +" | "+xhr.responseText);
				$("#dCargando").removeClass("Visible");
				$("#dCargando").addClass("NoVisible");
				$.mobile.changePage("#pError", {
					role : "dialog",
					transition : "slidedown"
				});
			}
		});
	}
}

/*Impuestos*/
function populateImpuestos() {
	var html = "";
	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getImpuestos>';
	soap = soap + '<urn:pEmpresaID>' + EmpresaID + '</urn:pEmpresaID>';
	soap = soap + '</urn:getImpuestos>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$("#ulImpuestos").children().remove('li');
	contadorImpuestos = 1;
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getImpuestos',
		//data: {"pEmpresaID" : EmpresaID },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				JSonTiposImpuestos = obj.TiposImpuestos;
				$.each(obj.Impuestos, function (index, value) {
					html = '<li id="liImpuestos' + contadorImpuestos + '">';
					html = html + '<div class="espacio2 limpiar"></div>';
					html = html + '<div class="div_boton1 izquierda"><a class="bQuitar" href="" id="bQuitarImpuesto' + contadorImpuestos + '" onclick="closeImpuesto(' + contadorImpuestos + ')"></a></div>';
					html = html + '<div class="div_impuesto izquierda"><input type="text" name="tbImpuesto" value="' + value.Nombre + '" placeholder=" Impuesto" data-role="none" class="campo1" id="tbImpuesto' + contadorImpuestos + '"></input></div>';
					html = html + '<div class="div11 izquierda padding_izquierda2"><a class="bEliminar" href="" id="bEliminarImpuesto' + contadorImpuestos + '" onclick="eliminarImpuesto(' + contadorImpuestos + ')"></a></div>';
					html = html + '<div id="divDetalleImpuestos' + contadorImpuestos + '" class="Visible">';
					html = html + '<div class="div13 izquierda limpiar"><input type="text" name="tbTasa" value="' + value.Tasa + '" placeholder=" Tasa" data-role="none" class="campo6 numeric1" id="tbTasa' + contadorImpuestos + '"></input></div>';
					html = html + '<div class="div1 izquierda">';
					html = html + '<select class="campo7 combobox" data-role="none" id="cbTipoPago' + contadorImpuestos + '">';
					html = html + '<option value="" selected="selected">Tipo de impuesto</option>';
					$.each(obj.TiposImpuestos, function (index2, value2) {
						html = html + '<option value="' + value2.TipoImpuestoID + '">' + value2.Nombre + '</option>'
					});
					html = html + '</select> ';
					html = html + '</div>';
					html = html + '</div>'; //Detalle
					html = html + '<input id="tbImpuestosID' + contadorImpuestos + '" type="hidden" value="' + value.ImpuestosID + '"></input>'
						html = html + '</li> ';
					$("#ulImpuestos").append(html);
					$("#cbTipoPago" + contadorImpuestos).val(value.TipoImpuestoID);
					contadorImpuestos++;
				});
				$.each(JSonTiposImpuestos, function (index, value) {
					html = '<option value="' + value.TipoImpuestoID + '">' + value.Nombre + '</option>'
						$("#cbTipoPago").append(html);
				});
				tabNumerico();
				$.mobile.changePage("#pImpuestos");
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error5: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
	$.mobile.changePage("#pImpuestos");
}

function addImpuesto() {
	var impuesto,
	tasa,
	tipo;
	impuesto = $("#tbImpuesto").val();
	tasa = $("#tbTasa").val();
	tipo = $("#cbTipoPago").val();
	if (impuesto == "") {
		alert("Favor de capturar impuesto");
		$("#tbImpuesto").focus();
	} else
		if (tasa == "") {
			alert("Favor de capturar tasa");
			$("#tbTasa").focus();
		} else
			if (tipo == "") {
				alert("Favor de capturar tipo de pago");
				$("#cbTipoPago").focus();
			} else {
				var html;
				html = '<li id="liImpuestos' + contadorImpuestos + '">';
				html = html + '<div class="espacio2 limpiar"></div>';
				html = html + '<div class="div_boton1 izquierda"><a class="bQuitar" href="" id="bQuitarImpuesto' + contadorImpuestos + '" onclick="closeImpuesto(' + contadorImpuestos + ')"></a></div>';
				html = html + '<div class="div_impuesto izquierda"><input type="text" name="tbImpuesto" value="' + impuesto + '" placeholder=" Impuesto" data-role="none" class="campo1" id="tbImpuesto' + contadorImpuestos + '"></input></div>';
				html = html + '<div class="div11 izquierda padding_izquierda2"><a class="bEliminar" href="" id="bEliminarImpuesto' + contadorImpuestos + '" onclick="eliminarImpuesto(' + contadorImpuestos + ')"></a></div>';
				html = html + '<div id="divDetalleImpuestos' + contadorImpuestos + '" class="Visible">';
				html = html + '<div class="div1 izquierda limpiar"><input type="text" name="tbTasa" value="' + tasa + '" placeholder=" Tasa" data-role="none" class="campo6 numeric1" id="tbTasa' + contadorImpuestos + '"></input></div>';
				html = html + '<div class="div1 izquierda">';
				html = html + '<select class="campo7 combobox" data-role="none" id="cbTipoPago' + contadorImpuestos + '">';
				html = html + '<option value="" selected="selected">Tipo de impuesto</option>';
				$.each(JSonTiposImpuestos, function (index2, value2) {
					html = html + '<option value="' + value2.TipoImpuestoID + '">' + value2.Nombre + '</option>'
				});
				html = html + '</select> ';
				html = html + '</div>';
				html = html + '</div>'; //Detalle
				html = html + '<input id="tbImpuestosID' + contadorImpuestos + '" type="hidden" value="0"></input>'
					html = html + '</li> ';
				$("#ulImpuestos").prepend(html);
				$("#cbTipoPago" + contadorImpuestos).val(tipo);
				contadorImpuestos++;
				//impiamos los campos
				$("#tbImpuesto").val("");
				$("#tbTasa").val("");
				$("#cbTipoPago").val("");
			}
			tabNumerico();
}

function closeImpuesto(row) {
	var x = $("#divDetalleImpuestos" + row).attr("class");
	x = x.replace("divDetalleImpuestos ", "");
	if (x == "NoVisible") {
		$("#divDetalleImpuestos" + row).removeClass("NoVisible");
		$("#divDetalleImpuestos" + row).addClass("Visible");
	} else {
		$("#divDetalleImpuestos" + row).removeClass("Visible");
		$("#divDetalleImpuestos" + row).addClass("NoVisible");
	}
}

function eliminarImpuesto(row) {
	$("#liImpuestos" + row).remove();
}
function validarImpuestos() {
	var impuesto,
	tasa,
	tipo,
	n,
	resultado = true;
	$('#ulImpuestos li').each(function () {
		n = this.id.replace("liImpuestos", "");
		impuesto = $("#tbImpuesto" + n).val();
		tasa = $("#tbTasa" + n).val();
		tipo = $("#cbTipoPago" + n).val();
		if (impuesto == "") {
			alert("Favor de capturar impuesto");
			$("#tbImpuesto" + n).focus();
			resultado = false;
			return;
		} else
			if (tasa == "") {
				alert("Favor de capturar tasa");
				$("#tbTasa" + n).focus();
				resultado = false;
				return;
			} else
				if (tipo == "") {
					alert("Favor de capturar tipo de pago");
					$("#cbTipoPago" + n).focus();
					resultado = false;
					return;
				}
	});
	return resultado;
}
function insertImpuestos() {
	if (validarImpuestos()) {
		var xml,
		n,
		soap;
		xml = '&lt;Impuestos&gt;';
		xml = xml + '&lt;EmpresaID&gt;' + EmpresaID + '&lt;/EmpresaID&gt;';
		$('#ulImpuestos li').each(function () {
			n = this.id.replace("liImpuestos", "");
			xml = xml + '&lt;Impuesto ';
			xml = xml + 'ImpuestosID="' + $("#tbImpuestosID" + n).val() + '" ';
			xml = xml + 'Nombre="' + $("#tbImpuesto" + n).val() + '" ';
			xml = xml + 'Tasa="' + $("#tbTasa" + n).val() + '" ';
			xml = xml + 'Tipo="' + $("#cbTipoPago" + n).val() + '"&gt;';
			xml = xml + '&lt;/Impuesto&gt;';
		});
		xml = xml + '&lt;/Impuestos&gt;'

			soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:saveImpuestos>';
		soap = soap + '<urn:pXML>' + xml + '</urn:pXML>';
		soap = soap + '</urn:saveImpuestos>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';
		$.ajax({
			cache : false,
			type : 'post',
			async : false,
			dataType : 'xml',
			//url:'http://192.168.0.101/app/Service1.asmx/saveImpuestos',
			//data: {"pXML" : xml },
			contentType : "text/xml;charset=UTF-8",
			url : pURL,
			data : soap,
			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "true") {
					$.mobile.changePage("#pMenu");
				} else
					alert("A ocuurido un error, por favor verifique su conexion a internet.");
			},
			error : function (xhr, ajaxOptions, thrownError) {
				//alert("Error6: " + xhr.status +" | "+xhr.responseText);
				$.mobile.changePage("#pError", {
					role : "dialog",
					transition : "slidedown"
				});
			}
		});
	}
}
/*Facturas*/
function populateFactura(edicion) {

	if (edicion) {
		if ($("#StatusResumenFactura").text() != "5") {
			alert("Solo se pueden editar factura preliminares");
			return;
		}
	} else {
		FacturaID = 0;
	}

	//Clientes
	$('#cbClienteFactura').children().remove('option');
	$('#cbClienteFactura').append('<option value="" selected="selected">Cliente</option>');
	$('#cbMonedaFactura').children().remove('option');
	$('#cbMonedaFactura').append('<option value="" selected="selected">Moneda</option>');
	$('#cbArticuloFactura').children().remove('option');
	$('#cbArticuloFactura').append('<option value="" selected="selected">Articulo</option>');
	$('#cbArticuloFactura').append('<option value="0" selected="selected">Articulo Nuevo</option>');
	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllClienteComboBox>';
	soap = soap + '<urn:pEmpresaID>' + EmpresaID + '</urn:pEmpresaID>';
	soap = soap + '</urn:getAllClienteComboBox>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllClienteComboBox',
		//data: {"pEmpresaID" : EmpresaID },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$.each(obj.Clientes, function (index, value) {
					$("#cbClienteFactura").append('<option value=' + value.ClienteID + '>' + value.Nombre + '</option>');
				});
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error7: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
	//Moneda
	$("#cbMonedaFactura option").remove();
	$.each(JSonMonedas, function (index, value) {
		$("#cbMonedaFactura").append('<option value="' + value.MonedasID + '">' + value.Sigla + '</option>');
	});
	$("#cbMonedaFactura").val("1");
	//Productos
	$("#cbArticuloFactura option").remove();
	$("#cbArticuloFactura").append('<option value="" selected="selected">Articulo</option>');
	$("#cbArticuloFactura").append('<option value="0" selected="selected">Articulo Nuevo</option>');
	$.each(JSonProductos, function (index, value) {
		$("#cbArticuloFactura").append('<option value="' + value.Empresa_Catalogo_ProductosID + '">' + value.NoIdentificacion + '</option>');
	});
	$("#cbArticuloFactura").val("");

	//Impuestos
	$("#lvImpuestosFactura").children().remove();
	insertarImpuestosLista("lvImpuestosFactura");

	if (edicion) {

		var soap;
		soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:getFactura>';
		soap = soap + '<urn:pFacturaID>' + FacturaID + '</urn:pFacturaID>';
		soap = soap + '</urn:getFactura>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';
		$.ajax({
			cache : false,
			type : 'post',
			async : false,
			dataType : 'xml',
			url : pURL,
			data : soap,
			contentType : 'text/xml;charset=utf-8',
			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "true") {
					$("#cbClienteFactura").val(obj.ClienteID);
					$("#tbFechaFactura").val(obj.Fecha);

					if (obj.TipoCFDI == 'ingreso') {
						$("#cbtipoCFDIFactura").val(1);
					} else if (obj.TipoCFDI == 'egreso') {
						$("#cbtipoCFDIFactura").val(2);
					} else if (obj.TipoCFDI == 'traslado') {
						$("#cbtipoCFDIFactura").val(3);
					}

					$("#tbDescuentoFactura").val(obj.Descuento);
					$("#cbMonedaFactura").val(obj.Moneda);
					$("#tbNotaOpcionalFactura").val(obj.NotaOpcional);
					$("#tbTerminosFactura").val(obj.Terminos);
					$("#divSubTotalFactura").text("$ " + agregarDecimales(obj.Subtotal));
					$("#divDescuentoFactura").text("$ " + agregarDecimales(obj.DescuentoImporte));
					$("#divIVAFactura").text("$ " + agregarDecimales(obj.IVA));
					$("#divIEPSFactura").text("$ " + agregarDecimales(obj.IEPS));
					$("#divRetencionIVAFactura").text("$ " + agregarDecimales(obj.RetencionIVA));
					$("#divRetencionISRFactura").text("$ " + agregarDecimales(obj.RetencionISR));
					$("#divOtrasRetencionesResumenFactura").text("$ " + agregarDecimales(obj.OtrasRetenciones));
					$("#divOtrosTrasladosResumenFactura").text("$ " + agregarDecimales(obj.OtrosTraslados));
					$("#divTotalFactura").text("$ " + agregarDecimales(obj.Total));

					if (obj.FormaPago == 'Pago en una sola exhibicion') {
						$("#cbFormaPagoFactura").val(1);
					} else if (obj.FormaPago == 'Pago de parcialidad') {
						$("#cbFormaPagoFactura").val(2);
						$("#tbFormaPago1Factura").val(obj.Parcialidad1);
						$("#tbFormaPago2Factura").val(obj.Parcialidad2);
						$("#divDetalleFormaPagoFactura").removeClass("NoVisible");
					} else if (obj.FormaPago == 'Pago en parcialidades') {
						$("#cbFormaPagoFactura").val(3);
					}

					if (obj.MetodoPago == 'No identificado') {
						$("#cbMetodoPagoFactura").val(1);
					} else if (obj.MetodoPago == 'Efectivo') {
						$("#cbMetodoPagoFactura").val(2);
					} else if (obj.MetodoPago == 'Cheque') {
						$("#cbMetodoPagoFactura").val(3);
					} else if (obj.MetodoPago == 'Transferencia electronica') {
						$("#cbMetodoPagoFactura").val(4);
					} else if (obj.MetodoPago == 'Tarjeta') {
						$("#cbMetodoPagoFactura").val(5);
					} else if (obj.MetodoPago == 'Otro') {
						$("#cbMetodoPagoFactura").val(6);
					}

					$("#tbNoCuentaFactura").val(obj.NoCuenta);

					$("#ulProductosFactura li").remove();
					contadorProductos = 0;
					$.each(obj.Conceptos, function (index, value) {
						contadorProductos++;
						var html;
						html = '<li id="liProductosFactura' + contadorProductos + '">';
						html = html + '<div class="espacio1 limpiar"></div>';
						html = html + '<div class="div16 izquierda"><a class="bQuitar" href="" id="bQuitarProductoFactura' + contadorProductos + '" onclick="closeProductoFactura(' + contadorProductos + ')"></a></div>';
						html = html + '<div class="div15 izquierda">';
						html = html + '<select class="campo1 " data-role="none" id="cbArticuloFactura' + contadorProductos + '">';
						$.each(JSonProductos, function (index, value) {
							html = html + '<option value=' + value.Empresa_Catalogo_ProductosID + '>' + value.NoIdentificacion + '</option>';
						});
						html = html + '</select>';
						html = html + '</div>';
						html = html + '<div class="div11 izquierda"><a class="bEliminar" href="" id="bEliminarProductoFactura' + contadorProductos + '" onclick="eliminarProductoFactura(' + contadorProductos + ')"></a></div>';
						html = html + '<div class="espacio1 limpiar"></div>';
						html = html + '<div id="contenidoProducto' + contadorProductos + '" class="Visible" >';
						html = html + '<div class="div3"><input type="text" name="tbDescripcion" value="" placeholder=" Descripcion" data-role="none" class="campo9" id="tbDescripcionFactura' + contadorProductos + '"></input></div>';
						html = html + '<div class="div8 izquierda"><input type="number" name="tbCantidad" value="" placeholder=" Cantidad" data-role="none" class="campo8" id="tbCantidadFactura' + contadorProductos + '" onChange="calculaImporte2(' + contadorProductos + ')"></input></div>';
						html = html + '<div class="div9 izquierda"><input type="text" name="tbUnidad" value="" placeholder=" Unidad" data-role="none" class="campo8" id="tbUnidadFactura' + contadorProductos + '"></input></div>';
						html = html + '<div class="div8 izquierda"><input type="number" name="Precio" value="" placeholder=" Precio" data-role="none" class="campo8" id="tbPrecioFactura' + contadorProductos + '" onChange="calculaImporte2(' + contadorProductos + ')"></input></div>';
						html = html + '<div class="div1 izquierda"><input type="number" name="Importe" value="" placeholder=" Importe" data-role="none" class="campo5 importe_azul" id="tbImporteFactura' + contadorProductos + '"></input></div>';
						html = html + '<div class="div1 izquierda"><input type="text" name="Impuestos" value="" placeholder=" Impuestos" data-role="none" class="campo4" id="tbImpuestosFactura' + contadorProductos + '" readonly></input></div>';
						html = html + '</div>';
						html = html + '</li>';

						$("#ulProductosFactura").append(html);
						$("#cbArticuloFactura" + contadorProductos).val(value.Empresa_Catalogo_ProductosID);
						$("#tbDescripcionFactura" + contadorProductos).val(value.Descripcion);
						$("#tbCantidadFactura" + contadorProductos).val(value.Cantidad);
						$("#tbUnidadFactura" + contadorProductos).val(value.Unidad);
						$("#tbPrecioFactura" + contadorProductos).val(agregarDecimales(value.Precio));
						$("#tbImporteFactura" + contadorProductos).val(agregarDecimales(parseFloat(value.Cantidad) * parseFloat(value.Precio)));
						$("#tbImpuestosFactura" + contadorProductos).val();
					});
				}
			},
			error : function (e) {
				alert('Error: ' + e.responseText);
				return;
			}
		});
	}

	$.mobile.changePage("#pFacturas");
}

function populateAllFacturas() {
	Paginacion = 1;
	var html,
	soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllFacturas>';
	soap = soap + '<urn:pEmpresaID>' + EmpresaID + '</urn:pEmpresaID>';
	soap = soap + '<urn:pPaginacion>' + Paginacion + '</urn:pPaginacion>';
	soap = soap + '</urn:getAllFacturas>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';

	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllFacturas',
		//data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$.mobile.changePage("#pListaFacturas");
				$.each(obj.Facturas, function (index, value) {
					html = '<li>';
					html = html + '<a href="#" onclick="populateResumenFactura(' + value.FacturaID + ')">';
					html = html + '<div class="div1 izquierda">';
					html = html + '<div class="listado1">' + value.NombreCliente.substring(0, 20) + '...</div>';
					html = html + '<div class="listado2">' + value.Fecha + '</div>';
					html = html + '</div>';
					html = html + '<div class="div1 izquierda texto_derecha">';
					html = html + '<div class="listado1">$ ' + agregarDecimales(value.Total) + '</div>';
					html = html + '<div class="listado2">' + value.Estatus + '</div>';
					html = html + '</div>';
					html = html + '</a>';
					html = html + '</li>';
					$("#lvFacturas").append(html);
				});
				$("#lvFacturas").show();
				$("#lvFacturas").listview("refresh");
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (e) {
			//alert("Error8: " + e.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function getMoreFacturas() {
	Paginacion++;
	var html,
	soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllFacturas>';
	soap = soap + '<urn:pEmpresaID>' + EmpresaID + '</urn:pEmpresaID>';
	soap = soap + '<urn:pPaginacion>' + Paginacion + '</urn:pPaginacion>';
	soap = soap + '</urn:getAllFacturas>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';

	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllFacturas',
		//data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$.each(obj.Facturas, function (index, value) {
					html = '<li>';
					html = html + '<a href="#">';
					html = html + '<div class="div1 izquierda">';
					html = html + '<div class="listado1">' + value.NombreCliente.substring(0, 20) + '...</div>';
					html = html + '<div class="listado2">' + value.Fecha + '</div>';
					html = html + '</div>';
					html = html + '<div class="div1 izquierda texto_derecha">';
					html = html + '<div class="listado1">$ ' + agregarDecimales(value.Total) + '</div>';
					html = html + '<div class="listado2">' + value.Estatus + '</div>';
					html = html + '</div>';
					html = html + '</a>';
					html = html + '</li>';
					$("#lvFacturas").append(html);
				});
				$("#lvFacturas").show();
				$("#lvFacturas").listview("refresh");
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error9: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function insertFactura(status) 
{
	if (validaDatosFactura()) {
		var xml = "";
		var x = -1;
		xml = '&lt;Factura&gt;';
		xml = xml + '&lt;EmpresaID&gt;' + EmpresaID + '&lt;/EmpresaID&gt;';
		xml = xml + '&lt;FacturaID&gt;' + FacturaID + '&lt;/FacturaID&gt;';
		xml = xml + '&lt;ClienteID&gt;' + $("#cbClienteFactura option:selected").val() + '&lt;/ClienteID&gt;';
		xml = xml + '&lt;Fecha&gt;' + $("#tbFechaFactura").val() + '&lt;/Fecha&gt;';
		xml = xml + '&lt;TipoCFDI&gt;' + $("#cbtipoCFDIFactura option:selected").text() + '&lt;/TipoCFDI&gt;';
		xml = xml + '&lt;Descuento&gt;' + $("#tbDescuentoFactura").val() + '&lt;/Descuento&gt;';
		xml = xml + '&lt;Moneda&gt;' + $("#cbMonedaFactura option:selected").text() + '&lt;/Moneda&gt;';
		xml = xml + '&lt;Conceptos&gt;' + $("#ulProductosFactura li").length + '&lt;/Conceptos&gt;';
		$("#ulProductosFactura li").each(function () {
			n = this.id.replace("liProductosFactura", "");
			x = getImpuestoIndex(n);
			xml = xml + '&lt;Concepto ';
			xml = xml + 'ConceptoID="' + $("#cbArticuloFactura" + n + " option:selected").val() + '" ';
			xml = xml + 'NoIdentificacion="' + $("#cbArticuloFactura" + n + " option:selected").text() + '" ';
			xml = xml + 'Descripcion="' + $("#tbDescripcionFactura" + n).val() + '" ';
			xml = xml + 'Cantidad="' + $("#tbCantidadFactura" + n).val() + '" ';
			xml = xml + 'Unidad="' + $("#tbUnidadFactura" + n).val() + '" ';
			xml = xml + 'Precio="' + $("#tbPrecioFactura" + n).val() + '" ';
			xml = xml + 'Importe="' + $("#tbImporteFactura" + n).val() + '" ';
			//xml = xml + 'Impuestos="' + $("#tbImpuestosFactura" + n).val() + '" ';
			xml = xml + 'ImpID1="' + arrImpuestos[x].ImpID1 + '" ';
			xml = xml + 'ImpTipo1="' + arrImpuestos[x].ImpTipo1 + '" ';
			xml = xml + 'ImpTasa1="' + arrImpuestos[x].ImpTasa1 + '" ';
			xml = xml + 'ImpID2="' + arrImpuestos[x].ImpID2 + '" ';
			xml = xml + 'ImpTipo2="' + arrImpuestos[x].ImpTipo2 + '" ';
			xml = xml + 'ImpTasa2="' + arrImpuestos[x].ImpTasa2 + '" ';
			xml = xml + 'ImpID3="' + arrImpuestos[x].ImpID3 + '" ';
			xml = xml + 'ImpTipo3="' + arrImpuestos[x].ImpTipo3 + '" ';
			xml = xml + 'ImpTasa3="' + arrImpuestos[x].ImpTasa3 + '" &gt;';
			xml = xml + '&lt;/Concepto&gt;';
		});

		xml = xml + '&lt;Subtotal&gt;' + $("#divSubTotalFactura").text().replace("$", "") + '&lt;/Subtotal&gt;';
		xml = xml + '&lt;DescuentoImporte&gt;' + $("#divDescuentoFactura").text().replace("$", "") + '&lt;/DescuentoImporte&gt;';
		xml = xml + '&lt;IVA&gt;' + $("#divIVAFactura").text().replace("$", "") + '&lt;/IVA&gt;';
		xml = xml + '&lt;IEPS&gt;' + $("#divIEPSFactura").text().replace("$", "") + '&lt;/IEPS&gt;';
		xml = xml + '&lt;RetencionIVA&gt;' + $("#divRetencionIVAFactura").text().replace("$", "") + '&lt;/RetencionIVA&gt;';
		xml = xml + '&lt;RetencionISR&gt;' + $("#divRetencionISRFactura").text().replace("$", "") + '&lt;/RetencionISR&gt;';
		xml = xml + '&lt;OtrasRetenciones&gt;' + $("#divOtrasRetencionesFactura").text().replace("$", "") + '&lt;/OtrasRetenciones&gt;';
		xml = xml + '&lt;OtrosTraslados&gt;' + $("#divOtrosTrasladosFactura").text().replace("$", "") + '&lt;/OtrosTraslados&gt;';
		xml = xml + '&lt;Total&gt;' + $("#divTotalFactura").text().replace("$", "") + '&lt;/Total&gt;';
		xml = xml + '&lt;NotaOpcional&gt;' + $("#tbNotaOpcionalFactura").val() + '&lt;/NotaOpcional&gt;';
		xml = xml + '&lt;Terminos&gt;' + $("#tbTerminosFactura").val() + '&lt;/Terminos&gt;';
		xml = xml + '&lt;FormaPago&gt;' + $("#cbFormaPagoFactura option:selected").text() + '&lt;/FormaPago&gt;';
		xml = xml + '&lt;Parcialidad1&gt;' + $("#tbMetodoPago1Factura").val() + '&lt;/Parcialidad1&gt;';
		xml = xml + '&lt;Parcialidad2&gt;' + $("#tbMetodoPago2Factura").val() + '&lt;/Parcialidad2&gt;';
		xml = xml + '&lt;MetodoPago&gt;' + $("#cbMetodoPagoFactura option:selected").text() + '&lt;/MetodoPago&gt;';
		xml = xml + '&lt;NoCuenta&gt;' + $("#tbNoCuentaFactura").val() + '&lt;/NoCuenta&gt;';
		xml = xml + '&lt;Status&gt;' + status + '&lt;/Status&gt;';
		xml = xml + '&lt;Login&gt;' + Login + '&lt;/Login&gt;';
		xml = xml + '&lt;/Factura&gt;';

		var soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:saveFactura>';
		soap = soap + '<urn:pXML>' + xml + '</urn:pXML>';
		soap = soap + '</urn:saveFactura>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';

		$.ajax({
			cache : false,
			type : 'post',
			async : false,
			dataType : 'xml',
			//url:'http://192.168.0.101/app/Service1.asmx/getAllClienteComboBox',
			//data: {"pEmpresaID" : EmpresaID },
			contentType : "text/xml;charset=UTF-8",
			url : pURL,
			data : soap,
			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "true") {
					$("#lvFacturas li").remove();
					populateAllFacturas();
				} else {
					alert("A ocurrido un error, por favor verifique su conexion a internet.");
					alert("Error: " + obj.Error);
				}
			},
			error : function (xhr, ajaxOptions, thrownError) {
				//alert("Error: " + xhr.status + " | " + xhr.responseText);
				$.mobile.changePage("#pError", {
					role : "dialog",
					transition : "slidedown"
				});
			}
		});
	}
}

function validaDatosFactura() {

	if ($("#tbFechaFactura").val() == "") {
		alert("Favor de agregar una fecha.");
		return false;
	}

	if ($("#cbtipoCFDIFactura").val() == "") {
		alert("Favor de escoger el tipo de CFDI.");
		return false;
	}

	if ($("#ulProductosFactura li").length == 0) {
		alert("Favor de agregar un concepto");
		return false;
	}

	$("#ulProductosFactura li").each(function () {
		n = this.id.replace("liProductosFactura", "");

		if ($("#tbDescripcionFactura" + n).val() == "") {
			alert("Favor de agregar una descripcion del articulo");
			return false;
		}

		if ($("#tbCantidadFactura" + n).val() == "") {
			alert("Favor de agregar la cantidad del articulo");
			return false;
		}

		if ($("#tbPrecioFactura" + n).val() == "") {
			alert("Favor de agregar el precio del articulo");
			return false;
		}
	});

	if ($("#divSubTotalFactura").text() == "$0.00") {
		alert("El subtotal no puede dejarlo en 0.00");
		return false;
	}
	if ($("#divTotalFactura").text() == "$0.00") {
		alert("El total no puede dejarlo en 0.00");
		return false;
	}

	if ($("#cbFormaPagoFactura").val() == "") {
		alert("Favor de escoger la forma de pago.");
		return false;
	}

	if ($("#cbFormaPagoFactura").val() == "2") {
		if ($("#tbMetodoPago1Factura").val() == "0" || $("#tbMetodoPago1Factura").val() == "") {
			alert("Favor de ingresar el numero de parcialidad.");
			return false;
		}

		if ($("#tbMetodoPago2Factura").val() == "0" || $("#tbMetodoPago2Factura").val() == "") {
			alert("Favor de ingresar el total de parcialidades.");
			return false;
		}
	}
	if ($("#cbMetodoPagoFactura").val() == "") {
		alert("Favor de escoger el metodo de pago.");
		return false;
	}

	if ($("#cbMetodoPagoFactura").val() == "3" || $("#cbMetodoPagoFactura").val() == "4" || $("#cbMetodoPagoFactura").val() == "5" || $("#cbMetodoPagoFactura").val() == "6") {
		if ($("#tbNoCuentaFactura").val() == "") {
			alert("Favor de agregar el numero de cuenta.");
			return false;
		}

		if ($("#tbNoCuentaFactura").val().length < 4) {
			alert("Favor de agregar los 4 digitos del numero de cuenta.");
			return false;
		}
	}

	return true;
}

function populateResumenFactura(facturaID) {
	$("#StatusResumenFactura").text("");
	$("#NombreClienteResumenFactura").text("");
	$("#RFCClienteResumenFactura").text("");
	$("#CalleNumClienteResumenFactura").text("");
	$("#ColoniaClienteResumenFactura").text("");
	$("#CiudadEstadoClienteResumenFactura").text("");
	$("#CodigoPostalClienteResumenFactura").text("");
	$("#divSubTotalResumenFactura").text("");
	$("#divDescuentoResumenFactura").text("");
	$("#divIVAResumenFactura").text("");
	$("#divIEPSResumenFactura").text("");
	$("#divRetencionIVAResumenFactura").text("");
	$("#divRetencionISRResumenFactura").text("");
	$("#divOtrasRetencionesResumenFactura").text("");
	$("#divOtrosTrasladosResumenFactura").text("");
	$("#divTotalResumenFactura").text("");
	$("#FormaPagoResumenFactura").text("");
	$("#MetodoPagoResumenFactura").text("");

	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getResumenFactura>';
	soap = soap + '<urn:pFacturaID>' + facturaID + '</urn:pFacturaID>';
	soap = soap + '</urn:getResumenFactura>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';

	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		url : pURL,
		data : soap,
		contentType : 'text/xml;charset=utf-8',
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$("#StatusResumenFactura").text(obj.Status);
				$("#FolioFactura").text("Factura " + obj.Serie + obj.Folio);
				$("#NombreClienteResumenFactura").text(obj.NombreCliente);
				$("#RFCClienteResumenFactura").text(obj.RFCCliente);
				$("#CalleNumClienteResumenFactura").text(obj.CalleNumCliente);
				$("#ColoniaClienteResumenFactura").text(obj.ColoniaCliente);
				$("#CiudadEstadoClienteResumenFactura").text(obj.CiudadEstadoCliente);
				$("#CodigoPostalClienteResumenFactura").text(obj.CodigoPostalCliente);
				$("#divSubTotalResumenFactura").text('$' + agregarDecimales(obj.Subtotal));
				$("#divDescuentoResumenFactura").text('$' + agregarDecimales(obj.Descuento));
				$("#divIVAResumenFactura").text('$' + agregarDecimales(obj.IVA));
				$("#divIEPSResumenFactura").text('$' + agregarDecimales(obj.IEPS));
				$("#divRetencionIVAResumenFactura").text('$' + agregarDecimales(obj.RetencionIVA));
				$("#divRetencionISRResumenFactura").text('$' + agregarDecimales(obj.RetencionISR));
				$("#divOtrasRetencionesResumenFactura").text('$' + agregarDecimales(obj.OtrasRetenciones));
				$("#divOtrosTrasladosResumenFactura").text('$' + agregarDecimales(obj.OtrosTraslados));
				$("#divTotalResumenFactura").text('$' + agregarDecimales(obj.Total));
				$("#FormaPagoResumenFactura").text(obj.FormaPago);
				$("#MetodoPagoResumenFactura").text(obj.MetodoPago);

				FacturaID = facturaID;
				$.mobile.changePage("#pResumenFactura");
			} else {
				alert("A ocurrido un error, por favor verifique su conexion a internet");
			}
		},
		error : function (e) {
			alert("Error: " + e.responseText);
		}
	});
}

//function addProductosFacturas()
function addProductos(op) {
	var opcion;
	if (op == 1)
		opcion = "Factura" 
	else
		opcion = "Cotizacion"
	var producto = $("#cbArticulo" + opcion).val();
	var descripcion = $("#tbDescripcionArticulo" + opcion).val();
	var cantidad = $("#tbCantidad" + opcion).val();
	var unidad = $("#tbUnidad" + opcion).val();
	var precio = $("#tbPrecio" + opcion).val();
	var importe = $("#tbImporte" + opcion).val();
	if (producto == "") {
		alert("Favor de seleccionar un producto");
		$("#cbArticulo" + opcion).focus();
	} else
		if (descripcion == "") {
			alert("Favor de capturar descripcion");
			$("#tbDescripcion" + opcion).focus();
		} else
			if (cantidad == "") {
				alert("Favor de capturar cantidad");
				$("#tbCantidad" + opcion).focus();
			} else
				if (unidad == "") {
					alert("Favor de capturar unidad");
					$("#tbUnidad" + opcion).focus();
				} else
					if (precio == "") {
						alert("Favor de capturar unidad");
						$("#tbPrecio" + opcion).focus();
					} else
						if (importe == "") {
							alert("Favor de capturar importe");
							$("#tbImporte" + opcion).focus();
							$("#tbImporte" + opcion).focus();
						} else {
							contadorProductos++;
							var html;
							html = '<li id="liProductos' + opcion + contadorProductos + '">';
							html = html + '<div class="espacio1 limpiar"></div>';
							html = html + '<div class="div_boton1 izquierda"><a class="bQuitar" href="" id="bQuitarProducto' + opcion + contadorProductos + '" onclick="closeProducto(' + contadorProductos + ',' + op + ')"></a></div>';
							html = html + '<div class="div_impuesto izquierda">';
							html = html + '<select class="campo1 combobox" data-role="none" id="cbArticulo' + opcion + contadorProductos + '">';
							$.each(JSonProductos, function (index, value) {
								html = html + '<option value=' + value.Empresa_Catalogo_ProductosID + '>' + value.NoIdentificacion + '</option>';
							});
							html = html + '</select>';
							html = html + '</div>';
							html = html + '<div class="div11 izquierda"><a class="bEliminar" href="" id="bEliminarProducto' + opcion + contadorProductos + '" onclick="eliminarProducto(' + contadorProductos + ',' + op + ')"></a></div>';
							html = html + '<div class="espacio1 limpiar"></div>';
							html = html + '<div id="contenidoProducto' + opcion + contadorProductos + '" class="Visible" >';
							html = html + '<div class="div3"><input type="text" name="tbDescripcion" value="' + descripcion + '" placeholder=" Descripcion" data-role="none" class="campo9" id="tbDescripcion' + opcion + contadorProductos + '"></input></div>';
							html = html + '<div class="div8 izquierda"><input type="text" name="tbCantidad" value="' + cantidad + '" placeholder=" Cantidad" data-role="none" class="campo8 numeric2" id="tbCantidad' + opcion + contadorProductos + '" onChange="calculaImporte2(' + contadorProductos + ',' + op + ')"></input></div>';
							html = html + '<div class="div9 izquierda"><input type="text" name="tbUnidad" value="' + unidad + '" placeholder=" Unidad" data-role="none" class="campo8" id="tbUnidad' + opcion + contadorProductos + '"></input></div>';
							html = html + '<div class="div8 izquierda"><input type="text" name="Precio" value="' + precio + '" placeholder=" Precio" data-role="none" class="campo8 numeric1" id="tbPrecio' + opcion + contadorProductos + '" onChange="calculaImporte2(' + contadorProductos + ',' + op + ')"></input></div>';
							html = html + '<div class="div1 izquierda"><input type="text" name="Importe" value="' + importe + '" placeholder=" Importe" data-role="none" class="campo5 importe_azul numeric1" id="tbImporte' + opcion + contadorProductos + '"></input></div>';
							html = html + '<div class="div1 izquierda"><input type="text" name="Impuestos" value="" placeholder=" Impuestos" data-role="none" class="campo4" id="tbImpuestos' + opcion + contadorProductos + '" onClick="populateImpuestosPopUp(' + op + ',' + contadorProductos + ')"  readonly></input></div>';
							html = html + '<div class="div3 izquierda NoVisible"><input type="text" name="ID" value="0" placeholder=" Impuestos" data-role="none" class="campo4" id="tbID' + opcion + contadorProductos + '"></input></div>';
							html = html + '</div>';
							html = html + '</li>';
							$("#ulProductos" + opcion).prepend(html);
							$("#cbArticulo" + opcion + contadorProductos).val(producto);
							/*Agregamos los impuestos*/
							if (addObjectImpuesto == null) {
								arrImpuestos.push(new impuestos(contadorProductos, 0, 0, 0, 0, 0, 0, 0, 0, 0));
							} else {
								arrImpuestos.push(new impuestos(contadorProductos, addObjectImpuesto.ImpID1, addObjectImpuesto.ImpTipo1, addObjectImpuesto.ImpTasa1, addObjectImpuesto.ImpID2, addObjectImpuesto.ImpTipo2, addObjectImpuesto.ImpTasa2, addObjectImpuesto.ImpID3, addObjectImpuesto.ImpTipo3, addObjectImpuesto.ImpTasa3));
								addObjectImpuesto = null;
							}
							//totalGeneralFacturas();
							totalGeneral(op);
							/*Limpiamos los campos*/
							$("#cbArticulo" + opcion).val("");
							$("#tbDescripcionArticulo" + opcion).val("");
							$("#tbCantidad" + opcion).val("");
							$("#tbUnidad" + opcion).val("");
							$("#tbPrecio" + opcion).val("");
							$("#tbImporte" + opcion).val("");
						}
		tabNumerico();
	}

function closeProducto(row, op) {
	var opcion;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	var x = $("#contenidoProducto" + opcion + row).attr("class");
	if (x == "NoVisible") {
		$("#contenidoProducto" + opcion + row).removeClass("NoVisible");
		$("#contenidoProducto" + opcion + row).addClass("Visible");
	} else {
		$("#contenidoProducto" + opcion + row).removeClass("Visible");
		$("#contenidoProducto" + opcion + row).addClass("NoVisible");
	}
}

function selectArticulo(op) {
	var opcion;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	var id = $("#cbArticulo" + opcion).val();
	var x = $("#tbCantidad" + opcion).val() != "" ? $("#tbCantidad" + opcion).val() : 0;
	/*Limpiamos los campos*/
	$("#tbDescripcionArticulo" + opcion).val("");
	$("#tbCantidad" + opcion).val("");
	$("#tbUnidad" + opcion).val("");
	$("#tbPrecio" + opcion).val("");
	$("#tbImporte" + opcion).val("");
	if (id != "" && id != "0") {
		$.each(JSonProductos, function (index, value) {
			if (value.Empresa_Catalogo_ProductosID == id) {
				$("#tbDescripcionArticulo" + opcion).val(value.Producto);
				$("#tbUnidad" + opcion).val(value.Unidad);
				$("#tbPrecio" + opcion).val(agregarDecimales(value.Precio));
				$("#tbImporte" + opcion).val((x * value.Precio));
				return;
			}
		});
	} else
		if (id == "0") {
			limpiarNuevoProducto(op);
			$("#pAgregarProducto" + opcion).popup("open");
		}
}

function calculaImporte(op) {
	var opcion;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	var x = $("#tbCantidad" + opcion).val() != "" ? $("#tbCantidad" + opcion).val() : 0;
	var y = $("#tbPrecio" + opcion).val() != "" ? $("#tbPrecio" + opcion).val() : 0;
	$("#tbImporte" + opcion).val(agregarDecimales(x * y));
}

function calculaImporte2(id, op) {
	var opcion;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	var x = $("#tbCantidad" + opcion + id).val() != "" ? $("#tbCantidad" + opcion + id).val() : 0;
	var y = $("#tbPrecio" + opcion + id).val() != "" ? $("#tbPrecio" + opcion + id).val() : 0;
	$("#tbImporte" + opcion + id).val(agregarDecimales(x * y));
	//totalGeneralFacturas();
	totalGeneral(op);
}

//function totalGeneralFacturas()
function totalGeneral(op) {
	var total = 0,
	subTotal = 0,
	descuento = 0,
	n,
	x = -1;
	var IVA = 0,
	retencionIVA = 0,
	retencionISR = 0,
	IEPS = 0,
	otrasRetenciones = 0,
	otrosTransalados = 0,
	tmp = 0,
	i,
	suma = 0,
	tmpIEPS = 0,
	tmpDescuento = 0,
	totalDescuento = 0;
	var opcion;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	descuento = $("#tbDescuento" + opcion).val() != "" ? Number($("#tbDescuento" + opcion).val()) : 0;
	$('#ulProductos' + opcion + ' li').each(function () {
		n = this.id.replace("liProductos" + opcion, "");
		x = getImpuestoIndex(n);
		//total = total + ($("#tbImporte"+opcion+n).val() != "" ? Number($("#tbImporte"+opcion+n).val()) : 0);
		tmpIEPS = 0;
		tmp = $("#tbImporte" + opcion + n).val() != "" ? Number($("#tbImporte" + opcion + n).val()) : 0;
		subTotal = subTotal + tmp;
		if (descuento > 0) {
			//p(%) = (T * P) / 100
			tmpDescuento = (tmp * descuento) / 100;
			tmp = tmp - tmpDescuento;
		}
		if (arrImpuestos[x].ImpTipo1 == 4) {
			tmpIEPS = tmp * arrImpuestos[x].ImpTasa1;
			IEPS = IEPS + tmpIEPS;
		} else
			if (arrImpuestos[x].ImpTipo2 == 4) {
				tmpIEPS = tmp * arrImpuestos[x].ImpTasa2;
				IEPS = IEPS + tmpIEPS;
			} else
				if (arrImpuestos[x].ImpTipo3 == 4) {
					tmpIEPS = tmp * arrImpuestos[x].ImpTasa3;
					IEPS = IEPS + tmpIEPS;
				}

		//Impuesto#1
		switch (Number(arrImpuestos[x].ImpTipo1)) {
		case 1: //IVA Transladado
			IVA = IVA + ((tmp + tmpIEPS) * arrImpuestos[x].ImpTasa1);
			break;
		case 2: //Retencion de IVA
			retencionIVA = retencionIVA + (tmp * arrImpuestos[x].ImpTasa1);
			break;
		case 3: //IVA de ISR
			retencionISR = retencionISR + (tmp * arrImpuestos[x].ImpTasa1);
			break;
			/*case 4://IEPS
			IEPS = IEPS + (tmp * arrImpuestos[x].ImpTasa1);
			break;*/
		case 5: //Otras Retenciones
			otrasRetenciones = otrasRetenciones + (tmp * arrImpuestos[x].ImpTasa1);
			break;
		case 6: //Otros Translados
			otrosTransalados = otrosTransalados + (tmp * arrImpuestos[x].ImpTasa1);
			break;
		}
		//Impuesto#2
		switch (Number(arrImpuestos[x].ImpTipo2)) {
		case 1: //IVA Transladado
			IVA = IVA + ((tmp + tmpIEPS) * arrImpuestos[x].ImpTasa2);
			break;
		case 2: //Retencion de IVA
			retencionIVA = retencionIVA + (tmp * arrImpuestos[x].ImpTasa2);
			break;
		case 3: //IVA de ISR
			retencionISR = retencionISR + (tmp * arrImpuestos[x].ImpTasa2);
			break;
			/*case 4://IEPS
			IEPS = IEPS + (tmp * arrImpuestos[x].ImpTasa2);
			break;*/
		case 5: //Otras Retenciones
			otrasRetenciones = otrasRetenciones + (tmp * arrImpuestos[x].ImpTasa2);
			break;
		case 6: //Otros Translados
			otrosTransalados = otrosTransalados + (tmp * arrImpuestos[x].ImpTasa2);
			break;
		}
		//Impuesto#3
		switch (Number(arrImpuestos[x].ImpTipo3)) {
		case 1: //IVA Transladado
			IVA = IVA + ((tmp + tmpIEPS) * arrImpuestos[x].ImpTasa3);
			break;
		case 2: //Retencion de IVA
			retencionIVA = retencionIVA + (tmp * arrImpuestos[x].ImpTasa3);
			break;
		case 3: //IVA de ISR
			retencionISR = retencionISR + (tmp * arrImpuestos[x].ImpTasa3);
			break;
			/*case 4://IEPS
			IEPS = IEPS + (tmp * arrImpuestos[x].ImpTasa3);
			break;*/
		case 5: //Otras Retenciones
			otrasRetenciones = otrasRetenciones + (tmp * arrImpuestos[x].ImpTasa3);
			break;
		case 6: //Otros Translados
			otrosTransalados = otrosTransalados + (tmp * arrImpuestos[x].ImpTasa3);
			break;
		}
		//totalDescuento = totalDescuento + tmpDescuento;
	});
	/*subTotal = Math.round(subTotal * 100) / 100;
	IEPS = Math.round(IEPS * 100) / 100;
	IVA = Math.round(IVA * 100) / 100;
	retencionIVA = Math.round(retencionIVA * 100) / 100;
	retencionISR = Math.round(retencionISR * 100) / 100;
	otrasRetenciones = Math.round(otrasRetenciones * 100) / 100;
	otrosTransalados = Math.round(otrosTransalados * 100) / 100;*/
	if (descuento > 0) {
		//p(%) = (T * P) / 100
		totalDescuento = (subTotal * descuento) / 100;
	}
	total = ((subTotal - totalDescuento) + IEPS + IVA + otrosTransalados - retencionIVA - retencionISR - otrasRetenciones);
	/*Impuestos*/
	$("#dIEPS" + opcion).removeClass("Visible");
	$("#dIVA" + opcion).removeClass("Visible");
	$("#dRetencionIVA" + opcion).removeClass("Visible");
	$("#dRetencionISR" + opcion).removeClass("Visible");
	$("#dOtrasRetenciones" + opcion).removeClass("Visible");
	$("#dOtrosTranslados" + opcion).removeClass("Visible");
	$("#dDescuento" + opcion).removeClass("Visible");

	$("#dIEPS" + opcion).addClass("NoVisible");
	$("#dIVA" + opcion).addClass("NoVisible");
	$("#dRetencionIVA" + opcion).addClass("NoVisible");
	$("#dRetencionISR" + opcion).addClass("NoVisible");
	$("#dOtrasRetenciones" + opcion).addClass("NoVisible");
	$("#dOtrosTraslados" + opcion).addClass("NoVisible");
	$("#dDescuento" + opcion).addClass("NoVisible");

	if (IEPS > 0) {
		$("#dIEPS" + opcion).addClass("Visible");
		$("#divIEPS" + opcion).text("$ "+agregarDecimales(IEPS));
	}
	if (IVA > 0) {
		$("#dIVA" + opcion).addClass("Visible");
		$("#divIVA" + opcion).text("$ "+agregarDecimales(IVA));
	}
	if (retencionIVA > 0) {
		$("#dRetencionIVA" + opcion).addClass("Visible");
		$("#divRetencionIVA" + opcion).text("$ "+agregarDecimales(retencionIVA));
	}
	if (retencionISR > 0) {
		$("#dRetencionISR" + opcion).addClass("Visible");
		$("#divRetencionISR" + opcion).text("$ "+agregarDecimales(retencionISR));
	}
	if (otrasRetenciones > 0) {
		$("#dOtrasRetenciones" + opcion).addClass("Visible");
		$("#divOtrasRetenciones" + opcion).text("$ "+agregarDecimales(otrasRetenciones));
	}
	if (otrosTransalados > 0) {
		$("#dOtrosTraslados" + opcion).addClass("Visible");
		$("#divOtrosTraslados" + opcion).text("$ "+agregarDecimales(otrosTransalados));
	}
	if (totalDescuento > 0) {
		$("#dDescuento" + opcion).addClass("Visible");
		$("#divDescuento" + opcion).text("$ "+agregarDecimales(totalDescuento));
	}
	$("#divSubTotal" + opcion).text("$ "+agregarDecimales(subTotal));
	$("#divTotal" + opcion).text("$ "+agregarDecimales(total));
}

//function eliminarProductoFactura(id){
function eliminarProducto(id, op) {
	var opcion;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";

	this.removeImpuesto(id);
	$("#liProductos" + opcion + id).remove();
	this.totalGeneral(op);
}

function descuentoFactura() {
	var descuento = $("#tbDescuentoFactura").val();
	if (descuento == "" || descuento == "0") {
		$("#dDescuentoFactura").val("");
		$("#dDescuentoFactura").removeClass("Visible");
		$("#dDescuentoFactura").addClass("NoVisible");
	} else {
		totalGeneralFacturas();
		$("#dDescuentoFactura").removeClass("NoVisible");
		$("#dDescuentoFactura").addClass("Visible");
	}
}

function mostrarFormaPago() {
	var id = $("#cbFormaPagoFactura").val();
	if (id == 2) {
		$("#divDetalleFormaPagoFactura").removeClass("NoVisible");
		$("#divDetalleFormaPagoFactura").addClass("Visible");
	} else {
		$("#tbFormaPago1Factura").val("0");
		$("#tbFormaPago2Factura").val("");
		$("#divDetalleFormaPagoFactura").removeClass("Visible");
		$("#divDetalleFormaPagoFactura").addClass("NoVisible");
	}
}

function habilitaNumeroCuenta() {
	var id = $("#cbMetodoPagoFactura").val();
	if (id != "" && id != "1" && id != "2") {
		$("#tbNoCuentaFactura").attr('readonly', false);
	} else {
		$("#tbNoCuentaFactura").val("");
		$("#tbNoCuentaFactura").attr('readonly', true);
	}
}

//function limpiarNuevoProductoFactura(op)
function limpiarNuevoProducto(op) {
	var opcion;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	$("#tbNuevoArticulo" + opcion).val("");
	$("#tbDescripcionNuevoArticulo" + opcion).val("");
	$("#tbNuevaCantidad" + opcion).val("");
	$("#tbNuevaUnidad" + opcion).val("");
	$("#tbNuevoPrecio" + opcion).val("");
}
//function saveNuevoProductoFactura(){
function saveNuevoProducto(op) {
	var opcion;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	var articulo = $("#tbNuevoArticulo" + opcion).val();
	var descripcion = $("#tbDescripcionNuevoArticulo" + opcion).val();
	var cantidad = $("#tbNuevaCantidad" + opcion).val() != "" ? $("#tbNuevaCantidad" + opcion).val() : 0;
	var unidad = $("#tbNuevaUnidad" + opcion).val();
	var precio = $("#tbNuevoPrecio" + opcion).val();
	if (articulo == "") {
		alert("Favor de capturar articulo");
		$("#tbNuevoArticulo" + opcion).focus();
	} else
		if (descripcion == "") {
			alert("Favor de capturar descripcion");
			$("#tbDescripcionNuevoArticulo" + opcion).focus();
		} else
			if (unidad == "") {
				alert("Favor de capturar unidad");
				$("#tbNuevaUnidad" + opcion).focus();
			} else
				if (precio == "") {
					alert("Favor de capturar precio");
					$("#tbNuevoPrecio" + opcion).focus();
				} else {
					var xml,
					soap;
					xml = '&lt;NuevoArticulo&gt;';
					xml = xml + '&lt;EmpresaID&gt;' + EmpresaID + '&lt;/EmpresaID&gt;';
					xml = xml + '&lt;Articulo&gt;' + articulo + '&lt;/Articulo&gt;';
					xml = xml + '&lt;Descripcion&gt;' + descripcion + '&lt;/Descripcion&gt;';
					xml = xml + '&lt;Cantidad&gt;' + cantidad + '&lt;/Cantidad&gt;';
					xml = xml + '&lt;Unidad&gt;' + unidad + '&lt;/Unidad&gt;';
					xml = xml + '&lt;Precio&gt;' + precio + '&lt;/Precio&gt;';
					xml = xml + '&lt;/NuevoArticulo&gt;';

					soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
					soap = soap + '<soapenv:Header/>';
					soap = soap + '<soapenv:Body>';
					soap = soap + '<urn:saveNuevoArticulo>';
					soap = soap + '<urn:pXML>' + xml + '</urn:pXML>';
					soap = soap + '</urn:saveNuevoArticulo>';
					soap = soap + '</soapenv:Body>';
					soap = soap + '</soapenv:Envelope>';

					$.ajax({
						cache : false,
						type : 'POST',
						async : false,
						dataType : "xml",
						//url:'http://192.168.0.101/app/Service1.asmx/saveNuevoArticulo',
						//data: {"pXML" : xml},
						contentType : "text/xml;charset=UTF-8",
						url : pURL,
						data : soap,
						success : function (xml) {
							var r = $(xml).text();
							r = r.replace(/\|amp;/g,"&");
							var obj = jQuery.parseJSON(r);
							if (obj.Validacion == "true") {
								if (obj.Estatus == "1") {
									if (cantidad > 0)
										$("#tbCantidad" + opcion).val(cantidad);
									$("#pAgregarProducto" + opcion).popup("close");
								} else {
									alert("El articulo ya existe");
								}
							}
						},
						error : function (xhr, ajaxOptions, thrownError) {
							//alert("Error10: " + xhr.status +" | "+xhr.responseText);
							$.mobile.changePage("#pError", {
								role : "dialog",
								transition : "slidedown"
							});
						}
					});
				}
}

/*Cotizacion*/
function populateAllCotizaciones() {
	Paginacion = 1;
	$('#lvCotizaciones').children().remove('li');
	var html,
	soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllCotizaciones>';
	soap = soap + '<urn:pEmpresaId>' + EmpresaID + '</urn:pEmpresaId>';
	soap = soap + '<urn:pPaginacion>' + Paginacion + '</urn:pPaginacion>';
	soap = soap + '</urn:getAllCotizaciones>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllCotizaciones',
		//data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$.mobile.changePage("#pListaCotizaciones");
				$.each(obj.Cotizaciones, function (index, value) {
					html = '<li>';
					html = html + '<a href="#" onclick="getCotizacion(' + value.CotizacionID + ')">';
					html = html + '<div class="div1 izquierda">';
					html = html + '<div class="listado1">' + value.NombreCliente.substring(0, 20) + '...</div>';
					html = html + '<div class="listado2">' + value.Fecha + '</div>';
					html = html + '</div>';
					html = html + '<div class="div1 izquierda texto_derecha">';
					html = html + '<div class="listado1">$ ' + value.Total + '</div>';
					html = html + '<div class="listado2">' + value.Estatus + '</div>';
					html = html + '</div>';
					html = html + '</a>';
					html = html + '</li>';
					$("#lvCotizaciones").append(html);
				});
				$("#lvCotizaciones").show();
				$("#lvCotizaciones").listview("refresh");
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (e) {
			//alert("Error8: " + e.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function getMoreCotizaciones() {
	Paginacion++;
	var html,
	soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllCotizaciones>';
	soap = soap + '<urn:pEmpresaId>' + EmpresaID + '</urn:pEmpresaId>';
	soap = soap + '<urn:pPaginacion>' + Paginacion + '</urn:pPaginacion>';
	soap = soap + '</urn:getAllCotizaciones>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllCotizaciones',
		//data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$.each(obj.Cotizaciones, function (index, value) {
					html = '<li>';
					html = html + '<a href="#" onclick="getCotizacion(' + value.CotizacionID + ')">';
					html = html + '<div class="div1 izquierda">';
					html = html + '<div class="listado1">' + value.NombreCliente.substring(0, 20) + '...</div>';
					html = html + '<div class="listado2">' + value.Fecha + '</div>';
					html = html + '</div>';
					html = html + '<div class="div1 izquierda texto_derecha">';
					html = html + '<div class="listado1">$ ' + Number(value.Total).toFixed(numDecimales) + '</div>';
					html = html + '<div class="listado2">' + value.Estatus + '</div>';
					html = html + '</div>';
					html = html + '</a>';
					html = html + '</li>';
					$("#lvCotizaciones").append(html);
				});
				$("#lvCotizaciones").show();
				$("#lvCotizaciones").listview("refresh");
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error9: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function populateCotizacion() {
	//Clientes
	limpiarCotizacion();
	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllClienteComboBox>';
	soap = soap + '<urn:pEmpresaID>' + EmpresaID + '</urn:pEmpresaID>';
	soap = soap + '</urn:getAllClienteComboBox>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllClienteComboBox',
		//data: {"pEmpresaID" : EmpresaID },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$.each(obj.Clientes, function (index, value) {
					$("#cbClienteCotizacion").append('<option value=' + value.ClienteID + '>' + value.Nombre + '</option>');
				});
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error7: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
	//Moneda
	$.each(JSonMonedas, function (index, value) {
		$("#cbMonedaCotizacion").append('<option value="' + value.MonedasID + '">' + value.Sigla + '</option>');
	});
	$("#cbMonedaCotizacion").val("1");
	//Productos
	$.each(JSonProductos, function (index, value) {
		$("#cbArticuloCotizacion").append('<option value="' + value.Empresa_Catalogo_ProductosID + '">' + value.NoIdentificacion + '</option>');
	});
	$("#cbArticuloCotizacion").val("");

	$.mobile.changePage("#pCotizacion");
}

function limpiarCotizacion() {
	contadorProductos = 0;
	arrImpuestos = [];
	addObjectImpuesto = null;
	obtenerIDImpuesto = 0;
	$('#cbClienteCotizacion').children().remove('option');
	$('#cbClienteCotizacion').append('<option value="" selected="selected">Cliente</option>');
	$('#cbMonedaCotizacion').children().remove('option');
	$('#cbMonedaCotizacion').append('<option value="" selected="selected">Moneda</option>');
	$('#cbArticuloCotizacion').children().remove('option');
	$('#cbArticuloCotizacion').append('<option value="" selected="selected">Articulo</option>');
	$('#cbArticuloCotizacion').append('<option value="0" selected="selected">Articulo Nuevo</option>');
	$("#tbFechaCotizacion").val("");
	$("#tbOrdenCompraCotizacion").val("");
	$("#tbDescuentoCotizacion").val("");
	$("#cbMonedaCotizacion").val("1");
	$("#tbDescripcionCotizacion").val("");
	$("#tbCantidadCotizacion").val("");
	$("#tbUnidadCotizacion").val("");
	$("#tbPrecioCotizacion").val("");
	$("#tbImporteCotizacion").val("");
	$("#tbNotaOpcionalCotizacion").val("");
	$("#tbTerminosCotizacion").val("");
	$("#divSubTotalCotizacion").text("0.00");
	$("#divDescuentoCotizacion").text("0.00");
	$("#divTotalCotizacion").text("0.00");
	$('#ulProductosCotizacion').children().remove('li');
	//Totales
	$("#dIEPSCotizacion").removeClass("Visible");
	$("#dIVACotizacion").removeClass("Visible");
	$("#dRetencionIVACotizacion").removeClass("Visible");
	$("#dRetencionISRCotizacion").removeClass("Visible");
	$("#dOtrasRetencionesCotizacion").removeClass("Visible");
	$("#dOtrosTransladosCotizacion").removeClass("Visible");
	$("#dDescuentoCotizacion").removeClass("Visible");

	$("#dIEPSCotizacion").addClass("NoVisible");
	$("#dIVACotizacion").addClass("NoVisible");
	$("#dRetencionIVACotizacion").addClass("NoVisible");
	$("#dRetencionISRCotizacion").addClass("NoVisible");
	$("#dOtrasRetencionesCotizacion").addClass("NoVisible");
	$("#dOtrosTransladosCotizacion").addClass("NoVisible");
	$("#dDescuentoCotizacion").addClass("NoVisible");
}

function getCotizacion(pCotizacionID) {
	populateCotizacion();
	var soap,
	html,
	opcion = "Cotizacion";
	var op = 2;
	contadorProductos = 0;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getCotizacion>';
	soap = soap + '<urn:pCotizacionID>' + pCotizacionID + '</urn:pCotizacionID>';
	soap = soap + '</urn:getCotizacion>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllClienteComboBox',
		//data: {"pEmpresaID" : EmpresaID },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				CotizacionID = obj.CotizacionID;
				$("#cbClienteCotizacion").val(obj.ClienteID);
				$("#tbFechaCotizacion").val(obj.Fecha);
				$("#tbOrdenCompraCotizacion").val(obj.OrdenCompra);
				if ($("#tbDescuentoCotizacion").val() != 0)
					$("#tbDescuentoCotizacion").val(obj.Descuento);
				$("#cbMonedaCotizacion").val(obj.MonedasID);
				$("#tbNotaOpcionalCotizacion").val(obj.NotaOpcional);
				$("#tbTerminosCotizacion").val(obj.Terminos);
				$.each(obj.Conceptos, function (index, value) {
					contadorProductos++;
					html = '<li id="liProductos' + opcion + contadorProductos + '">';
					html = html + '<div class="espacio1 limpiar"></div>';
					html = html + '<div class="div_boton1 izquierda"><a class="bQuitar" href="" id="bQuitarProducto' + opcion + contadorProductos + '" onclick="closeProducto(' + contadorProductos + ',' + op + ')"></a></div>';
					html = html + '<div class="div_impuesto izquierda">';
					html = html + '<select class="campo1 " data-role="none" id="cbArticulo' + opcion + contadorProductos + '">';
					$.each(JSonProductos, function (index, value) {
						html = html + '<option value=' + value.Empresa_Catalogo_ProductosID + '>' + value.NoIdentificacion + '</option>';
					});
					html = html + '</select>';
					html = html + '</div>';
					html = html + '<div class="div11 izquierda"><a class="bEliminar" href="" id="bEliminarProducto' + opcion + contadorProductos + '" onclick="eliminarProducto(' + contadorProductos + ',' + op + ')"></a></div>';
					html = html + '<div class="espacio1 limpiar"></div>';
					html = html + '<div id="contenidoProducto' + opcion + contadorProductos + '" class="Visible" >';
					html = html + '<div class="div3"><input type="text" name="tbDescripcion" value="' + value.Descripcion + '" placeholder=" Descripcion" data-role="none" class="campo9" id="tbDescripcion' + opcion + contadorProductos + '"></input></div>';
					html = html + '<div class="div8 izquierda"><input type="text" name="tbCantidad" value="' + value.Cantidad + '" placeholder=" Cantidad" data-role="none" class="campo8 numeric2" id="tbCantidad' + opcion + contadorProductos + '" onChange="calculaImporte2(' + contadorProductos + ',' + op + ')"></input></div>';
					html = html + '<div class="div9 izquierda"><input type="text" name="tbUnidad" value="' + value.Unidad + '" placeholder=" Unidad" data-role="none" class="campo8" id="tbUnidad' + opcion + contadorProductos + '"></input></div>';
					html = html + '<div class="div8 izquierda"><input type="text" name="Precio" value="' + value.Precio + '" placeholder=" Precio" data-role="none" class="campo8 numeric1" id="tbPrecio' + opcion + contadorProductos + '" onChange="calculaImporte2(' + contadorProductos + ',' + op + ')"></input></div>';
					html = html + '<div class="div1 izquierda"><input type="text" name="Importe" value="' + (value.Cantidad * value.Precio) + '" placeholder=" Importe" data-role="none" class="campo5 importe_azul numeric1" id="tbImporte' + opcion + contadorProductos + '"></input></div>';
					html = html + '<div class="div1 izquierda"><input type="text" name="Impuestos" value="" placeholder=" Impuestos" data-role="none" class="campo4" id="tbImpuestos' + opcion + contadorProductos + '" onClick="populateImpuestosPopUp(2,' + contadorProductos + ')" readonly></input></div>';
					html = html + '<div class="div3 izquierda NoVisible"><input type="text" name="ID" value="' + value.ConceptoCotizacionID + '" placeholder=" Impuestos" data-role="none" class="campo4" id="tbID' + opcion + contadorProductos + '"></input></div>';
					html = html + '</div>';
					html = html + '</li>';
					/*Agregamos los impuestos*/
					arrImpuestos.push(new impuestos(contadorProductos, value.ImpID1, value.ImpTipo1, value.ImpTasa1, value.ImpID2, value.ImpTipo2, value.ImpTasa2, value.ImpID3, value.ImpTipo3, value.ImpTasa3));
					$("#ulProductos" + opcion).prepend(html);
					$("#cbArticulo" + opcion + contadorProductos).val(value.Empresa_Catalogo_ProductosID);
				});
				totalGeneral(op);
				tabNumerico();
				//totalGeneralFacturas();
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function getImpuestosID(op, impuestos) {
	var opcion;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	var i = 0,
	n = 0;
	for (i = 0; i < arrImpuestos.length; i++) {
		if (arrImpuestos[i].ImpID1 > 0) //Impuesto1
		{
			$.each(impuestos, function (index, value) {
				if (arrImpuestos[i].ImpTipo1 == value.TipoImpuestoID && arrImpuestos[i].ImpTasa1 == value.Tasa)
					{
					arrImpuestos[i].ImpID1 = value.ImpuestosID;
					return;
				}
			});
		}
		if (arrImpuestos[i].ImpID2 > 0) //Impuesto2
		{
			$.each(impuestos, function (index, value) {
				if (arrImpuestos[i].ImpTipo2 == value.TipoImpuestoID && arrImpuestos[i].ImpTasa2 == value.Tasa) {
					arrImpuestos[i].ImpID2 = value.ImpuestosID;
					return;
				}
			});

		}
		if (arrImpuestos[i].ImpID3 > 0) //Impuesto3
		{
			$.each(impuestos, function (index, value) {
				if (arrImpuestos[i].ImpTipo3 == value.TipoImpuestoID && arrImpuestos[i].ImpTasa3 == value.Tasa) {
					arrImpuestos[i].ImpID3 = value.ImpuestosID;
					return;
				}
			});
		}
	}
}

function validaCotizacion() {
	var n;
	var resultado = true;
	if ($("#cbClienteCotizacion").val() == "") {
		$("#cbClienteCotizacion").focus();
		alert("Requiere seleccionar un cliente");
		resultado = false;
	} else
		if ($("#tbFechaCotizacion").val() == "") {
			$("#tbFechaCotizacion").focus();
			alert("Requiere fecha");
			resultado = false;
		} else
			if ($("#cbMonedaCotizacion").val() == "") {
				$("#cbMonedaCotizacion").focus();
				alert("Requiere moneda");
				resultado = false;
			} else {
				if ($("#ulProductosCotizacion li").size() == 0) {
					$("#cbArticuloCotizacion").focus();
					alert("Requiere articulos");
					resultado = false;
				} else {
					$('#ulProductosCotizacion li').each(function () {
						n = this.id.replace("liProductosCotizacion", "");
						if ($("#cbArticuloCotizacion" + n).val() == "") {
							$("#cbArticuloCotizacion" + n).focus();
							alert("Requiere articulos");
							resultado = false;
							return false;
						} else
							if ($("#tbDescripcionCotizacion" + n).val() == "") {
								$("#tbDescripcionCotizacion" + n).focus();
								alert("Requiere descripcion");
								resultado = false;
								return false;
							} else
								if ($("#tbCantidadCotizacion" + n).val() == "") {
									$("#tbCantidadCotizacion" + n).focus();
									alert("Requiere cantidad");
									resultado = false;
									return false;
								} else
									if ($("#tbUnidadCotizacion" + n).val() == "") {
										$("#tbUnidadCotizacion" + n).focus();
										alert("Requiere unidad");
										resultado = false;
										return false;
									} else
										if ($("#tbPrecioCotizacion" + n).val() == "") {
											$("#tbPrecioCotizacion" + n).focus();
											alert("Requiere precio");
											resultado = false;
											return false;
										}
					});
				}
			}
	return resultado;
}

function insertCotizacion(pEnviar) {
	if (validaCotizacion()) {
		var xml,
		soap,
		descuento;
		var resultado = false;
		var total = 0,
		cantidad = 0,
		precio = 0,
		x = -1;
		xml = '&lt;Cotizacion&gt;';
		xml = xml + '&lt;CotizacionID&gt;' + CotizacionID + '&lt;/CotizacionID&gt;';

		xml = xml + '&lt;EmpresaID&gt;' + EmpresaID + '&lt;/EmpresaID&gt;';
		xml = xml + '&lt;ClienteID&gt;' + $("#cbClienteCotizacion").val() + '&lt;/ClienteID&gt;';

		xml = xml + '&lt;Fecha&gt;' + $("#tbFechaCotizacion").val() + '&lt;/Fecha&gt;';
		xml = xml + '&lt;OrdenCompra&gt;' + $("#tbOrdenCompraCotizacion").val() + '&lt;/OrdenCompra&gt;';
		var descuento = $("#tbDescuentoCotizacion").val() != "" ? $("#tbDescuentoCotizacion").val() : 0;
		xml = xml + '&lt;Descuento&gt;' + descuento + '&lt;/Descuento&gt;';
		xml = xml + '&lt;MonedasID&gt;' + $("#cbMonedaCotizacion").val() + '&lt;/MonedasID&gt;';
		xml = xml + '&lt;NotaOpcional&gt;' + $("#tbNotaOpcionalCotizacion").val() + '&lt;/NotaOpcional&gt;';
		xml = xml + '&lt;Terminos&gt;' + $("#tbTerminosCotizacion").val() + '&lt;/Terminos&gt;';
		//Conceptos
		xml = xml + '&lt;Articulos&gt;';
		$('#ulProductosCotizacion li').each(function () {
			n = this.id.replace("liProductosCotizacion", "");
			x = getImpuestoIndex(n);
			cantidad = precio = 0;
			cantidad = $("#tbCantidadCotizacion" + n).val();
			precio = $("#tbPrecioCotizacion" + n).val();
			total = total + (cantidad * precio);
			xml = xml + '&lt;Articulo ';
			xml = xml + 'ConceptoCotizacionID="' + $("#tbIDCotizacion" + n).val() + '" ';
			xml = xml + 'Cantidad="' + $("#tbCantidadCotizacion" + n).val() + '" ';

			xml = xml + 'Articulo="' + $("#cbArticuloCotizacion" + n + " option:selected").text() + '" ';
			xml = xml + 'Descripcion="' + $("#tbDescripcionCotizacion" + n).val() + '" ';
			xml = xml + 'Unidad="' + $("#tbUnidadCotizacion" + n).val() + '" ';
			xml = xml + 'Precio="' + $("#tbPrecioCotizacion" + n).val() + '" ';
			xml = xml + 'ImpID1="' + arrImpuestos[x].ImpID1 + '" ';
			xml = xml + 'ImpTipo1="' + arrImpuestos[x].ImpTipo1 + '" ';
			xml = xml + 'ImpTasa1="' + arrImpuestos[x].ImpTasa1 + '" ';
			xml = xml + 'ImpID2="' + arrImpuestos[x].ImpID2 + '" ';
			xml = xml + 'ImpTipo2="' + arrImpuestos[x].ImpTipo2 + '" ';
			xml = xml + 'ImpTasa2="' + arrImpuestos[x].ImpTasa2 + '" ';
			xml = xml + 'ImpID3="' + arrImpuestos[x].ImpID3 + '" ';
			xml = xml + 'ImpTipo3="' + arrImpuestos[x].ImpTipo3 + '" ';
			xml = xml + 'ImpTasa3="' + arrImpuestos[x].ImpTasa3 + '" &gt;';

			xml = xml + '&lt;/Articulo&gt;';
		});

		xml = xml + '&lt;/Articulos&gt;';
		xml = xml + '&lt;Total&gt;' + total + '&lt;/Total&gt;';
		xml = xml + '&lt;Enviar&gt;' + pEnviar + '&lt;/Enviar&gt;';
		xml = xml + '&lt;/Cotizacion&gt;';

		soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:saveCotizacion>';
		soap = soap + '<urn:pXML>' + xml + '</urn:pXML>';
		soap = soap + '</urn:saveCotizacion>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';

		$.ajax({
			cache : false,
			type : 'post',
			async : false,
			dataType : 'xml',
			//url:'http://192.168.0.101/app/Service1.asmx/getAllClienteComboBox',
			//data: {"pEmpresaID" : EmpresaID },
			contentType : "text/xml;charset=UTF-8",
			url : pURL,
			data : soap,

			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "true") {
					resultado = true;

				} else
					alert("A ocuurido un error, por favor verifique su conexion a internet.");
			},
			error : function (xhr, ajaxOptions, thrownError) {
				$.mobile.changePage("#pError", {
					role : "dialog",
					transition : "slidedown"
				});

			}
		});
		if (resultado) {
			populateAllCotizaciones();
		}
	}

}

/*Impuestos*/
function populateImpuestosPopUp(op, index) {

	indexImpuesto = index;
	var x = -1;
	if (indexImpuesto > -1)
		x = getImpuestoIndex(indexImpuesto);
	else {
		if (addObjectImpuesto == null)
			addObjectImpuesto = new impuestos(-1, 0, 0, 0, 0, 0, 0, 0, 0, 0);

	}
	var opcion;
	var n = 1;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";

	$('#ulImpuestos'+opcion).children().remove('li');
	var soap,
	html,
	checked;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getImpuestos>';
	soap = soap + '<urn:pEmpresaID>' + EmpresaID + '</urn:pEmpresaID>';
	soap = soap + '</urn:getImpuestos>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllClienteComboBox',
		//data: {"pEmpresaID" : EmpresaID },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				if (obtenerIDImpuesto == 0) {
					getImpuestosID(op, obj.Impuestos);
					obtenerIDImpuesto++;
				}

				
				$.each(obj.Impuestos, function (index, value) {
					checked = "";
					if (x == -1) {
						//if(addObjectImpuesto.ImpID1 == value.ImpuestosID || addObjectImpuesto.ImpID2 == value.ImpuestosID || addObjectImpuesto.ImpID3 == value.ImpuestosID)
						if ((addObjectImpuesto.ImpTipo1 == value.TipoImpuestoID && addObjectImpuesto.ImpTasa1 == value.Tasa) ||
							(addObjectImpuesto.ImpTipo2 == value.TipoImpuestoID && addObjectImpuesto.ImpTasa2 == value.Tasa) ||
							(addObjectImpuesto.ImpTipo3 == value.TipoImpuestoID && addObjectImpuesto.ImpTasa3 == value.Tasa))
							checked = "checked";
					} else
						//if(arrImpuestos[x].ImpID1 == value.ImpuestosID || arrImpuestos[x].ImpID2 == value.ImpuestosID || arrImpuestos[x].ImpID3 == value.ImpuestosID)
						//================================================================>
						if (arrImpuestos[x].ImpTipo1 == value.TipoImpuestoID && arrImpuestos[x].ImpTasa1 == value.Tasa) {
							checked = "checked";
							arrImpuestos[x].ImpID1 = value.ImpuestosID

						} else
							if (arrImpuestos[x].ImpTipo2 == value.TipoImpuestoID && arrImpuestos[x].ImpTasa2 == value.Tasa) {
								checked = "checked";
								arrImpuestos[x].ImpID2 = value.ImpuestosID

							} else
								if (arrImpuestos[x].ImpTipo3 == value.TipoImpuestoID && arrImpuestos[x].ImpTasa3 == value.Tasa) {
									checked = "checked";
									arrImpuestos[x].ImpID3 = value.ImpuestosID

								}
					//<================================================================
					/*if((arrImpuestos[x].ImpTipo1 == value.TipoImpuestoID && arrImpuestos[x].ImpTasa1 == value.Tasa) ||
					(arrImpuestos[x].ImpTipo2 == value.TipoImpuestoID && arrImpuestos[x].ImpTasa2 == value.Tasa) ||
					(arrImpuestos[x].ImpTipo3 == value.TipoImpuestoID && arrImpuestos[x].ImpTasa3 == value.Tasa))
					checked = "checked";*/

					//html = '<input type="hidden" value="' + value.TipoImpuestoID + '" id="hfTipo' + opcion + n + '">';
					//html = html + '<input type="hidden" value="' + value.Tasa + '" id="hfTasa' + opcion + n + '"></li>';
					/*html = '<input type="checkbox" name="chkImpuesto'+ opcion + n + '" id="chkImpuesto' + opcion + n + '" class="custom"/>';
					html = html + '<label for="chkImpuesto' + opcion + n + '">' + value.Nombre + ' ' + ((parseFloat(value.Tasa * 100) * 100) / 100) + '%</label>';
					$('#lvImpuestos'+opcion).append(html);*/

					html = '<li id="liImpuesto' + opcion + n + '"><input type="checkbox" id="chkImpuesto' + opcion + n + '" value="' + value.ImpuestosID + '" data-role="none" ' + checked + '/><label for = "chkImpuesto' + n + '">' + value.Nombre + '</label>';
					html = html + '<input type="hidden" value="' + value.TipoImpuestoID + '" id="hfTipo' + opcion + n + '">';
					html = html + '<input type="hidden" value="' + value.Tasa + '" id="hfTasa' + opcion + n + '"></li>';
					$("#ulImpuestos" + opcion).append(html);
					n++;
				});
			} else
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});

		}
	});
	$("#pAgregarImpuesto"+opcion).popup("open");
}

function validaImpuestos(op) {
	var opcion;
	var x = getImpuestoIndex(indexImpuesto);
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	var n = 1,
	c = 0;
	var imp1 = 0,
	imp2 = 0,
	imp3 = 0,
	imp4 = 0,
	imp5 = 0,
	imp6 = 0;
	var resultado = true;
	$('#ulImpuestos' + opcion + ' li').each(function () {
		if ($("#chkImpuesto" + opcion + n).is(':checked')) {
			c++;
			switch (c) {
			case 1:
				imp1 = $("#chkImpuesto" + opcion + n).val();
				break;
			case 2:
				imp2 = $("#chkImpuesto" + opcion + n).val();
				break;
			case 3:
				imp3 = $("#chkImpuesto" + opcion + n).val();
				break;
			}

		}
		n++;
	});
	if (c > 3) {
		resultado = false;
		imp1 = imp2 = imp3 = 0;
		alert("No puede seleccionar mas de 3 impuestos");

	} else {
		var i = 0;
		for (i = 0; i < arrImpuestos.length; i++) {
			if (x != i) {
				if (arrImpuestos[i].ImpID1 > 0) {
					if (imp4 == 0 && (arrImpuestos[i].ImpID1 != imp5 && arrImpuestos[i].ImpID1 != imp6))
						imp4 = arrImpuestos[i].ImpID1;
					else
						if (imp5 == 0 && (arrImpuestos[i].ImpID1 != imp4 && arrImpuestos[i].ImpID1 != imp6))
							imp5 = arrImpuestos[i].ImpID1;
						else
							if (imp6 == 0 && (arrImpuestos[i].ImpID1 != imp4 && arrImpuestos[i].ImpID1 != imp5))
								imp6 = arrImpuestos[i].ImpID1;
							else
								if (imp4 != arrImpuestos[i].ImpID1 && imp5 != arrImpuestos[i].ImpID1 && imp6 != arrImpuestos[i].ImpID1) {
									resultado = false;
									alert("Esta tratando de aplicar mas de 3 impuestos sobre la factura, favor de revisar");
									break;
								}
				}
				if (arrImpuestos[i].ImpID2 > 0) {
					if (imp4 == 0 && (arrImpuestos[i].ImpID2 != imp5 && arrImpuestos[i].ImpID2 != imp6))
						imp4 = arrImpuestos[i].ImpID2;
					else
						if (imp5 == 0 && (arrImpuestos[i].ImpID2 != imp4 && arrImpuestos[i].ImpID2 != imp6))
							imp5 = arrImpuestos[i].ImpID2;
						else
							if (imp6 == 0 && (arrImpuestos[i].ImpID2 != imp4 && arrImpuestos[i].ImpID2 != imp5))
								imp6 = arrImpuestos[i].ImpID2;
							else
								if (imp4 != arrImpuestos[i].ImpID2 && imp5 != arrImpuestos[i].ImpID2 && imp6 != arrImpuestos[i].ImpID2) {
									resultado = false;
									alert("Esta tratando de aplicar mas de 3 impuestos sobre la factura, favor de revisar");
									break;
								}
				}
				if (arrImpuestos[i].ImpID3 > 0) {
					if (imp4 == 0 && (arrImpuestos[i].ImpID3 != imp5 && arrImpuestos[i].ImpID3 != imp6))
						imp4 = arrImpuestos[i].ImpID3;
					else
						if (imp5 == 0 && (arrImpuestos[i].ImpID3 != imp4 && arrImpuestos[i].ImpID3 != imp6))
							imp5 = arrImpuestos[i].ImpID3;
						else
							if (imp6 == 0 && (arrImpuestos[i].ImpID3 != imp4 && arrImpuestos[i].ImpID3 != imp5))
								imp6 = arrImpuestos[i].ImpID3;
							else
								if (imp4 != arrImpuestos[i].ImpID3 && imp5 != arrImpuestos[i].ImpID3 && imp6 != arrImpuestos[i].ImpID3) {
									resultado = false;
									alert("Esta tratando de aplicar mas de 3 impuestos sobre la factura, favor de revisar");
									break;
								}
				}
			}
		}
		if ((imp4 != imp1 && imp4 != 0) && (imp5 != imp1 && imp5 != 0) && (imp6 != imp1 && imp6 != 0) && imp1 != 0) {
			resultado = false;
			alert("Esta tratando de aplicar mas de 3 impuestos sobre la factura, favor de revisar");
		} else
			if ((imp4 != imp2 && imp4 != 0) && (imp5 != imp2 && imp5 != 0) && (imp6 != imp2 && imp6 != 0) && imp2 != 0) {
				resultado = false;
				alert("Esta tratando de aplicar mas de 3 impuestos sobre la factura, favor de revisar");
			} else
				if ((imp4 != imp3 && imp4 != 0) && (imp5 != imp3 && imp5 != 0) && (imp6 != imp3 && imp6 != 0) && imp3 != 0) {
					resultado = false;
					alert("Esta tratando de aplicar mas de 3 impuestos sobre la factura, favor de revisar");
				}

	}
	return resultado;
}

function impuestos(pID, pImpID1, pImpTipo1, pImpTasa1, pImpID2, pImpTipo2, pImpTasa2, pImpID3, pImpTipo3, pImpTasa3) {
	this.ID = pID;
	this.ImpID1 = pImpID1;
	this.ImpTipo1 = pImpTipo1;
	this.ImpTasa1 = pImpTasa1;
	this.ImpID2 = pImpID2;
	this.ImpTipo2 = pImpTipo2;
	this.ImpTasa2 = pImpTasa2;
	this.ImpID3 = pImpID3;
	this.ImpTipo3 = pImpTipo3;
	this.ImpTasa3 = pImpTasa3;
}

function getImpuestoIndex(pVal) {
	var index = -1,
	c;
	for (c = 0; c < arrImpuestos.length; c++) {
		if (arrImpuestos[c].ID == pVal) {
			index = c;
			break;

		}
	}
	return index;
}

function removeImpuesto(pID) {
	var index = getImpuestoIndex(pID);
	if (index > -1) {
		arrImpuestos.splice(index, 1);

	}
}

function addImpuestos(op) {
	var opcion;
	var n = 1,
	c = 1,
	index = -1;
	if (op == 1)
		opcion = "Factura";
	else
		opcion = "Cotizacion";
	if (validaImpuestos(op)) {
		var impuesto;
		var index = getImpuestoIndex(indexImpuesto);
		if (index > -1) {
			arrImpuestos[index].ImpID1 = 0;
			arrImpuestos[index].ImpTipo1 = 0;
			arrImpuestos[index].ImpTasa1 = 0;
			arrImpuestos[index].ImpID2 = 0;
			arrImpuestos[index].ImpTipo2 = 0;
			arrImpuestos[index].ImpTasa2 = 0;
			arrImpuestos[index].ImpID3 = 0;
			arrImpuestos[index].ImpTipo3 = 0;
			arrImpuestos[index].ImpTasa3 = 0;
		} else {
			addObjectImpuesto.ImpID1 = 0;
			addObjectImpuesto.ImpTipo1 = 0;
			addObjectImpuesto.ImpTasa1 = 0;
			addObjectImpuesto.ImpID2 = 0;
			addObjectImpuesto.ImpTipo2 = 0;
			addObjectImpuesto.ImpTasa2 = 0;
			addObjectImpuesto.ImpID3 = 0;
			addObjectImpuesto.ImpTipo3 = 0;
			addObjectImpuesto.ImpTasa3 = 0;
		}
		$('#ulImpuestos' + opcion + ' li').each(function () {
			if ($("#chkImpuesto" + opcion + n).is(':checked')) {
				switch (c) {
				case 1:
					if (index > -1) {
						arrImpuestos[index].ImpID1 = $("#chkImpuesto" + opcion + n).val();
						arrImpuestos[index].ImpTipo1 = $("#hfTipo" + opcion + n).val();
						arrImpuestos[index].ImpTasa1 = $("#hfTasa" + opcion + n).val();
					} else {
						addObjectImpuesto.ImpID1 = $("#chkImpuesto" + opcion + n).val();
						addObjectImpuesto.ImpTipo1 = $("#hfTipo" + opcion + n).val();
						addObjectImpuesto.ImpTasa1 = $("#hfTasa" + opcion + n).val();
					}
					c++;
					break;
				case 2:
					if (index > -1) {
						arrImpuestos[index].ImpID2 = $("#chkImpuesto" + opcion + n).val();
						arrImpuestos[index].ImpTipo2 = $("#hfTipo" + opcion + n).val();
						arrImpuestos[index].ImpTasa2 = $("#hfTasa" + opcion + n).val();
					} else {
						addObjectImpuesto.ImpID2 = $("#chkImpuesto" + opcion + n).val();
						addObjectImpuesto.ImpTipo2 = $("#hfTipo" + opcion + n).val();
						addObjectImpuesto.ImpTasa2 = $("#hfTasa" + opcion + n).val();
					}
					c++;
					break;
				case 3:
					if (index > -1) {
						arrImpuestos[index].ImpID3 = $("#chkImpuesto" + opcion + n).val();
						arrImpuestos[index].ImpTipo3 = $("#hfTipo" + opcion + n).val();
						arrImpuestos[index].ImpTasa3 = $("#hfTasa" + opcion + n).val();
					} else {
						addObjectImpuesto.ImpID3 = $("#chkImpuesto" + opcion + n).val();
						addObjectImpuesto.ImpTipo3 = $("#hfTipo" + opcion + n).val();
						addObjectImpuesto.ImpTasa3 = $("#hfTasa" + opcion + n).val();
					}
					c++;
					break;
				}
			}
			n++;
		});
		//}
		if (index > -1)
			this.totalGeneral(op);
		$("#pAgregarImpuesto"+opcion).popup("close");

	}

}

/*Clientes*/
function populateAllClientes()
{
Paginacion = 1;
var html,soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllClientes>';
	soap = soap + '<urn:pEmpresaID>'+EmpresaID+'</urn:pEmpresaID>';
	soap = soap + '<urn:pPaginacion>'+Paginacion+'</urn:pPaginacion>';
	soap = soap + '</urn:getAllClientes>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
			cache: false,
			type: 'post',
			async: false,
			dataType: 'xml',
			//url:'http://192.168.0.101/app/Service1.asmx/getAllClientes',
			//data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
			contentType: "text/xml;charset=UTF-8",
			url: pURL,
			data: soap,
			success: function (xml) {
			var r = $(xml).text(); 
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$.mobile.changePage("#pListaClientes");
				$.each(obj.Clientes, function(index,value){
				html= '<li data-icon="false"><a href="#" onclick="populatePerfil('+value.ClienteID+')"><div class="listado1">'+value.Nombre.substring(0, 37) +'...</div><div class="listado2">'+ value.RFC +'</div></a></li>';
					$("#lvClientes").append(html);
				});
					$("#lvClientes").show();
					$("#lvClientes").listview("refresh");
			}
			else
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
			},
			error: function (e) {
			//alert("Error11: " + e.responseText);
			$.mobile.changePage( "#pError", { role: "dialog" , transition:"slidedown" } );
			}
	});
}

function populatePerfil(pClienteID) {
	//limpiamos campos
	$("#pcSaldo").text("$ 0.00");
	$("#pcNombre").text("");
	$("#pcRFC").text("");
	$("#pcDireccion1").text("");
	$("#pcDireccion2").text("");
	$("#pcTelefono").text("");
	$("#pcCorreo").text("");
	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getPerfilCliente>';
	soap = soap + '<urn:pClienteID>' + pClienteID + '</urn:pClienteID>';
	soap = soap + '</urn:getPerfilCliente>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'POST',
		async : false,
		dataType : "xml",
		//url:'http://192.168.0.101/app/Service1.asmx/getPerfilCliente',
		//data: {"pClienteID" : pClienteID},
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				ClienteID = pClienteID;
				$("#pcSaldo").text(obj.Saldo);
				$("#pcNombre").text(obj.Nombre);
				$("#pcRFC").text(obj.RFC);
				$("#pcDireccion1").text(obj.Direccion1);
				$("#pcDireccion2").text(obj.Direccion2);
				$("#pcTelefono").text(obj.Telefono);
				$("#pcCorreo").text(obj.Correo);
				$.mobile.changePage("#pPerfilClientes");
			} else {
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
			}
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error12: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function populateCliente(pClienteID) {
	var n = 1;
	limpiarPantallaCliente(false);
	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getCliente>';
	soap = soap + '<urn:pClienteID>' + pClienteID + '</urn:pClienteID>';
	soap = soap + '</urn:getCliente>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'POST',
		async : false,
		dataType : "xml",
		//url:'http://192.168.0.101/app/Service1.asmx/getCliente',
		//data: {"pClienteID":pClienteID},
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				ClienteID = obj.ClienteID;
				$("#tbNombreCliente").val(obj.Nombre);
				$("#tbRFCCliente").val(obj.RFC);
				$("#tbNombreComercialCliente").val(obj.NombreComercial);
				$("#tbCalleCliente").val(obj.Calle);
				$("#tbColoniaCliente").val(obj.Colonia);
				$("#tbMunicipioCliente").val(obj.Municipio);
				$("#tbEstadoCliente").val(obj.Estado);
				$("#tbPaisCliente").val(obj.Pais);
				$("#tbNoExteriorCliente").val(obj.NoExterior);
				$("#tbNoInteriorCliente").val(obj.NoInterior);
				$("#tbCiudadCliente").val(obj.Localidad);
				$("#tbCPCliente").val(obj.CodigoPostal);

				//Sucursales
				$.each(obj.Sucursales, function (index, value) {
					addSucursal(false, value.NombreSucursal, value.Cliente_SucursalID);
					$("#tbNombreSucursal" + contadorSucursales).val(value.NombreSucursal);
					$("#tbCalleSucursal" + contadorSucursales).val(value.Calle);
					$("#tbColoniaSucursal" + contadorSucursales).val(value.Colonia);
					$("#tbPaisSucursal" + contadorSucursales).val(value.Pais);
					$("#tbNoExteriorSucursal" + contadorSucursales).val(value.NoExterior);
					$("#tbMunicipioSucursal" + contadorSucursales).val(value.Municipio);
					$("#tbEstadoSucursal" + contadorSucursales).val(value.Estado);
					$("#tbNoInteriorSucursal" + contadorSucursales).val(value.NoInterior);
					$("#tbCiudadSucursal" + contadorSucursales).val(value.Ciudad);
					$("#tbCPSucursal" + contadorSucursales).val(value.CodigoPostal);
					$("#tbReferenciaSucursal" + contadorSucursales).val(value.Referencia);
				});
				//Contactos
				$.each(obj.Contactos, function (index, value) {

					if (n > 1) {
						addContacto(value.AsignarUsuario == "1" ? true : false, value.Cliente_ContactosID);
						if (value.AsignarUsuario == "1")
							$("#chkAsignaUsuario" + contadorContactos).attr("checked", "checked");
					} else {
						if (value.AsignarUsuario == "1") {
							$("#chkAsignaUsuario" + contadorContactos).attr("checked", "checked");
							asignarUsuario(1);
						}
					}
					$("#tbUsuarioContactoCliente" + contadorContactos).val(value.Login);
					$("#tbContrasenaContactoCliente" + contadorContactos).val(value.Password);
					$("#tbRepetirContrasenaContactoCliente" + contadorContactos).val(value.Password);
					$("#tbNombreContactoCliente" + contadorContactos).val(value.Nombre);
					$("#tbTelefonoContactoCliente" + contadorContactos).val(value.Telefono);
					$("#tbCorreoContactoCliente" + contadorContactos).val(value.CorreoElectronico);
					$("#tbCliente_ContactosID" + contadorContactos).val(value.Cliente_ContactosID);
					n++;
				});
				//Otra Informacion
				$('#cbMetodoPago').val(obj.MetodoPago);
				selectFormaPago();
				$('#tbNoCuentaCliente').val(obj.UltimosDigitos);
				$('#tbNotaInterna').val(obj.NotaInterna);
				$.mobile.changePage("#pClientes");
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error13: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function deleteCliente(pClienteID) {
	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:deleteCliente>';
	soap = soap + '<urn:pClienteID>' + pClienteID + '</urn:pClienteID>';
	soap = soap + '</urn:deleteCliente>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'POST',
		async : false,
		dataType : "xml",
		//url:'http://192.168.0.101/app/Service1.asmx/deleteCliente',
		//data: {"pClienteID" : pClienteID},
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$('#lvClientes').children().remove('li');
				populateAllClientes();
			} else {
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
			}
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error14: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function setInicioListaClientes() {
	$('#lvClientes').children().remove('li');
	$.mobile.changePage("#pMenu");
}

function getMoreClientes() {
	Paginacion++;
	var html,
	soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllClientes>';
	soap = soap + '<urn:pEmpresaID>' + EmpresaID + '</urn:pEmpresaID>';
	soap = soap + '<urn:pPaginacion>' + Paginacion + '</urn:pPaginacion>';
	soap = soap + '</urn:getAllClientes>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllClientes',
		//data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$.each(obj.Clientes, function (index, value) {
					html = '<li data-icon="false"><a href="#" onclick="populateCliente(' + value.ClienteID + ')"><div class="listado1">' + value.Nombre.substring(0, 37) + '...</div><div class="listado2">' + value.RFC + '</div></a></li>';
					$("#lvClientes").append(html);
				});
				$("#lvClientes").show();
				$("#lvClientes").listview("refresh");
			} else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error : function (xhr, ajaxOptions, thrownError) {
			//alert("Error15: " + xhr.status +" | "+xhr.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function limpiarPantallaCliente(pEnviarPantalla) {
	var contacto;
	ClienteID = 0;
	contadorSucursales = 0;
	contadorContactos = 1;
	$('#ulSucursales').children().remove('li');
	$('#ulContactos').children().remove('li');
	$("#tbNombreCliente").val("");
	$("#tbRFCCliente").val("");
	$("#tbNombreComercialCliente").val("");
	$("#tbCalleCliente").val("");
	$("#tbColoniaCliente").val("");
	$("#tbEstadoCliente").val("");
	$("#tbMunicipioCliente").val("");
	$("#tbPaisCliente").val("");
	$("#tbNoExteriorCliente").val("");
	$("#tbNoInteriorCliente").val("");
	$("#tbCiudadCliente").val("");
	$("#tbCPCliente").val("");
	$("#cbMetodoPago").val("");
	$("#tbNoCuentaCliente").val("");
	$("#tbNotaInterna").val("");
	contacto = '<div class="espacio2 limpiar"></div>';
	contacto = contacto + '<div class="div3"><input type="text" name="tbNombreContactoCliente" value="" maxlength="255" placeholder=" Nombre" data-role="none" class="campo9" id="tbNombreContactoCliente1"></input></div>';
	contacto = contacto + '<div class="div1 izquierda"><input type="text" name="tbTelefonoContactoCliente" value="" maxlength="20" placeholder=" Telefono" data-role="none" class="campo5" id="tbTelefonoContactoCliente1"></input></div>';
	contacto = contacto + '<div class="div1 izquierda"><input type="text" name="tbCorreoContactoCliente" value="" maxlength="255" placeholder=" Correo" data-role="none" class="campo4" id="tbCorreoContactoCliente1"></input></div>';
	contacto = contacto + '<div class="div3"><input type="checkbox" id = "chkAsignaUsuario1" value="" data-role="none" onClick="asignarUsuario(1)"/><label for = "chkAsignaUsuario1">Asignar usuario</label></div>';
	contacto = contacto + '<div id="dContactoUsuario1" class="NoVisible">';
	contacto = contacto + '<div class="div3"><input type="text" name="tbUsuarioContactoCliente" value="" maxlength="255" placeholder=" Usuario" data-role="none" class="campo9" id="tbUsuarioContactoCliente1"></input></div>';
	contacto = contacto + '<div class="div3"><input type="password" name="tbContrasenaContactoCliente" value="" maxlength="50" placeholder=" Contrasena" data-role="none" class="campo8" id="tbContrasenaContactoCliente1"></input></div>';
	contacto = contacto + '<div class="div3"><input type="password" name="tbRepetirContrasenaContactoCliente" value="" maxlength="50" placeholder=" Repita contrasena" data-role="none" class="campo10" id="tbRepetirContrasenaContactoCliente1"></input></div>';
	contacto = contacto + '<input id="tbCliente_ContactosID1" type="hidden" value="0"></input>'
		contacto = contacto + '</div>';
	$("#ulContactos").append('<li id="liContacto1">' + contacto + '</li>');
	$("#dOtraInformacion").removeClass("cabecera_seccion_up2");
	$("#dOtraInformacion").addClass("cabecera_seccion_down2");
	$("#dOtraInformacionContenido").removeClass("Visible");
	$("#dOtraInformacionContenido").addClass("NoVisible");
	$("#dContacto").removeClass("cabecera_seccion_up");
	$("#dContacto").addClass("cabecera_seccion_down");
	$("#dContactoContenido").removeClass("Visible");
	$("#dContactoContenido").addClass("NoVisible");
	if (pEnviarPantalla == true)
		$.mobile.changePage("#pClientes");
}

function addSucursal(pVisible, pNombreSucursal, pCliente_SucursalID) {
	contadorSucursales++;
	var sucursal;
	sucursal = '<div class="espacio1 limpiar"></div>';
	if (pNombreSucursal == "")
		sucursal = sucursal + '<div id="dSucursal' + contadorSucursales + '" class="divSucursal texto_principal" onClick="closeSucursal(' + contadorSucursales + ')">Nueva Sucursal ' + contadorSucursales + '</div>';
	else
		sucursal = sucursal + '<div id="dSucursal' + contadorSucursales + '" class="divSucursal texto_principal" onClick="closeSucursal(' + contadorSucursales + ')">' + pNombreSucursal + '</div>';
	if (pVisible == true)
		sucursal = sucursal + '<div id="divSucursalContenido' + contadorSucursales + '" class="divSucursalContenido Visible">';
	else
		sucursal = sucursal + '<div id="divSucursalContenido' + contadorSucursales + '" class="divSucursalContenido NoVisible">';
	sucursal = sucursal + '<div class="div14 div_centro">';
	sucursal = sucursal + '<div class="texto_derecha"><a href="#" id="bQuitarSucursal' + contadorSucursales + '" class="bEliminar derecha" onClick="removeSucursal(' + contadorSucursales + ')"></a></div>';
	sucursal = sucursal + '<div class="div3"><input type="text" name="tbNombreSucursal" value="" maxlength="255" placeholder=" Nombre" data-role="none" class="campo9" id="tbNombreSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div8 izquierda"><input type="text" name="tbCalleSucursal" value="" maxlength="255" placeholder=" Calle" data-role="none" class="campo8" id="tbCalleSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div9 izquierda"><input type="text" name="tbColoniaSucursal" value="" maxlength="255" placeholder=" Colonia" data-role="none" class="campo8" id="tbColoniaSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div8 izquierda"><input type="text" name="tbPaisSucursal" value="" maxlength="255" placeholder=" Pais" data-role="none" class="campo8" id="tbPaisSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div22 izquierda"><input type="text" name="tbNoExteriorSucursal" value="" maxlength="30" placeholder=" No ext" data-role="none" class="campo8" id="tbNoExteriorSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div24 izquierda"><input type="text" name="tbMunicipioSucursal" value="" maxlength="255" placeholder=" Municipio" data-role="none" class="campo8" id="tbMunicipioSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div24 izquierda"><input type="text" name="tbEstadoSucursal" value="" maxlength="255" placeholder=" Estado" data-role="none" class="campo8" id="tbEstadoSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div22 izquierda"><input type="text" name="tbNoInteriorSucursal" value="" maxlength="30" placeholder=" No int" data-role="none" class="campo8" id="tbNoInteriorSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div21 izquierda"><input type="text" name="tbCiudadSucursal" value="" maxlength="50" placeholder=" Ciudad" data-role="none" class="campo8" id="tbCiudadSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div22 izquierda"><input type="text" name="tbCPSucursal" value="" maxlength="5" placeholder=" CP" data-role="none" class="campo8 numeric2" id="tbCPSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<div class="div3"><input type="text" name="tbReferenciaSucursal" value="" maxlength="255" placeholder=" Referencia" data-role="none" class="campo10" id="tbReferenciaSucursal' + contadorSucursales + '"></input></div>';
	sucursal = sucursal + '<input id="tbCliente_SucursalID' + contadorSucursales + '" type="hidden" value="' + pCliente_SucursalID + '"></input>'
		sucursal = sucursal + '</div>';
	sucursal = sucursal + '</div>';
	$("#ulSucursales").append('<li id="liSucursal' + contadorSucursales + '">' + sucursal + '</li>');
	tabNumerico();
}

function removeSucursal(row) {
	$("#liSucursal" + row).remove();
}

function closeSucursal(row) {
	var x = $("#divSucursalContenido" + row).attr("class");
	x = x.replace("divSucursalContenido ", "");
	if (x == "NoVisible") {
		$("#divSucursalContenido" + row).removeClass("NoVisible");
		$("#divSucursalContenido" + row).addClass("Visible");
	} else {
		$("#divSucursalContenido" + row).removeClass("Visible");
		$("#divSucursalContenido" + row).addClass("NoVisible");
	}
}

function selectFormaPago() {
	var x = $("#cbMetodoPago").val();
	if (x != "" && x != "No identificado" && x != "Efectivo") {
		$("#dNoCuenta").removeClass("NoVisible");
		$("#dNoCuenta").addClass("Visible");
	} else {
		$("#tbNoCuentaCliente").val("");
		$("#dNoCuenta").removeClass("Visible");
		$("#dNoCuenta").addClass("NoVisible");
	}
}

function otraInformacion() {
	var classNameCabecera = $("#dOtraInformacion").attr('class');
	classNameCabecera = classNameCabecera.replace(" limpiar", "");
	classNameCabecera = classNameCabecera.replace("limpiar ", "");
	var classNameContenido = $("#dOtraInformacionContenido").attr('class');
	//Cabecera
	if (classNameCabecera == "cabecera_seccion_down2") {
		$("#dOtraInformacion").removeClass("cabecera_seccion_down2");
		$("#dOtraInformacion").addClass("cabecera_seccion_up");
	} else {
		$("#dOtraInformacion").removeClass("cabecera_seccion_up");
		$("#dOtraInformacion").addClass("cabecera_seccion_down2");
	}
	//Contenido
	if (classNameContenido == "NoVisible") {
		$("#dOtraInformacionContenido").removeClass("NoVisible");
		$("#dOtraInformacionContenido").addClass("Visible");
	} else {
		$("#dOtraInformacionContenido").removeClass("Visible");
		$("#dOtraInformacionContenido").addClass("NoVisible");
	}
}

function contacto() {
	var classNameCabecera = $("#dContacto").attr('class');
	var classNameContenido = $("#dContactoContenido").attr('class');
	//Cabecera
	if (classNameCabecera == "cabecera_seccion_down") {
		$("#dContacto").removeClass("cabecera_seccion_down");
		$("#dContacto").addClass("cabecera_seccion_up");
	} else {
		$("#dContacto").removeClass("cabecera_seccion_up");
		$("#dContacto").addClass("cabecera_seccion_down");
	}
	//Contenido
	if (classNameContenido == "NoVisible") {
		$("#dContactoContenido").removeClass("NoVisible");
		$("#dContactoContenido").addClass("Visible");
	} else {
		$("#dContactoContenido").removeClass("Visible");
		$("#dContactoContenido").addClass("NoVisible");
	}
}

function removeContacto(row) {
	$("#liContacto" + row).remove();
}

function asignarUsuario(row) {
	var x = $("#chkAsignaUsuario" + row).is(':checked')
		if (x == true) {
			$("#dContactoUsuario" + row).removeClass("NoVisible");
			$("#dContactoUsuario" + row).addClass("Visible");
		} else {
			$("#tbUsuarioContactoCliente" + row).val("");
			$("#tbContrasenaContactoCliente" + row).val("");
			$("#tbRepetirContrasenaContactoCliente" + row).val("");
			$("#dContactoUsuario" + row).removeClass("Visible");
			$("#dContactoUsuario" + row).addClass("NoVisible");
		}
}

function addContacto(pVisible, pCliente_ContactosID) {
	contadorContactos++;
	var contacto;
	contacto = '<div class="espacio2 limpiar"></div>';
	contacto = contacto + '<div class="div3"><a href="#" id="bQuitarContacto1" class="bQuitar derecha" onClick="removeContacto(' + contadorContactos + ')"></a></div>';
	contacto = contacto + '<div class="div3"><input type="text" name="tbNombreContactoCliente" value="" maxlength="255" placeholder=" Nombre" data-role="none" class="campo9" id="tbNombreContactoCliente' + contadorContactos + '"></input></div>';
	contacto = contacto + '<div class="div1 izquierda"><input type="text" name="tbTelefonoContactoCliente" value="" maxlength="20" placeholder=" Telefono" data-role="none" class="campo5" id="tbTelefonoContactoCliente' + contadorContactos + '"></input></div>';
	contacto = contacto + '<div class="div1 izquierda"><input type="text" name="tbCorreoContactoCliente" value="" maxlength="255" placeholder=" Correo" data-role="none" class="campo4" id="tbCorreoContactoCliente' + contadorContactos + '"></input></div>';
	contacto = contacto + '<div class="div3"><input type="checkbox" id = "chkAsignaUsuario' + contadorContactos + '" value="" data-role="none" onClick="asignarUsuario(' + contadorContactos + ')"/><label for = "chkAsignaUsuario' + contadorContactos + '">Asignar usuario</label></div>';
	if (pVisible == true)
		contacto = contacto + '<div id="dContactoUsuario' + contadorContactos + '" class="Visible">';
	else
		contacto = contacto + '<div id="dContactoUsuario' + contadorContactos + '" class="NoVisible">';
	contacto = contacto + '<div class="div3"><input type="text" name="tbUsuarioContactoCliente" value="" maxlength="255" placeholder=" Usuario" data-role="none" class="campo9" id="tbUsuarioContactoCliente' + contadorContactos + '"></input></div>';
	contacto = contacto + '<div class="div3"><input type="password" name="tbContrasenaContactoCliente" value="" maxlength="50" placeholder=" Contrasena" data-role="none" class="campo8" id="tbContrasenaContactoCliente' + contadorContactos + '"></input></div>';
	contacto = contacto + '<div class="div3"><input type="password" name="tbRepetirContrasenaContactoCliente" value="" maxlength="50" placeholder=" Repita contrasena" data-role="none" class="campo10" id="tbRepetirContrasenaContactoCliente' + contadorContactos + '"></input></div>';
	contacto = contacto + '<input id="tbCliente_ContactosID' + contadorContactos + '" type="hidden" value="' + pCliente_ContactosID + '"></input>'
		contacto = contacto + '</div>';
	$("#ulContactos").append('<li id="liContacto' + contadorContactos + '">' + contacto + '</li>');
}

function validaCliente() {
	var n;
	var resultado = true;
	var email,
	pass1,
	pass2,
	isUsuario;
	var xml,
	soap;
	var contactos;
	var RegExpEmail = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
	var RegExpRFC = /^[a-zA-Z]{3,4}(\d{6})((\D|\d){3})?$/;
	if ($("#tbNombreCliente").val() == "") {
		$("#tbNombreCliente").focus();
		alert("Requiere nombre del cliente");
		resultado = false;
	} else
		if ($("#tbRFCCliente").val() == "") {
			$("#tbRFCCliente").focus();
			alert("Requiere RFC");
			resultado = false;
		} else
			if (resultado) {
				if (!($("#tbRFCCliente").val()).match(RegExpRFC)) {
					alert("RFC con formato incorrecto");
					resultado = false
				} else {
					//ValidaSucursales
					$('#ulSucursales li').each(function () {
						n = this.id.replace("liSucursal", "");
						if ($("#tbNombreSucursal" + n).val() == "") {
							$("#tbNombreSucursal" + n).focus();
							alert("Requiere nombre de sucursal.");
							resultado = false;
							return false;
						}
					});
					//Validar Formatos de correos
					$('#ulContactos li').each(function () {
						email = "";
						n = this.id.replace("liContacto", "");
						//Valida email
						email = $("#tbCorreoContactoCliente" + n).val();
						if (email != "") {
							if (!email.match(RegExpEmail)) {
								$("#tbCorreoContactoCliente" + n).focus();
								alert("Formato incorrecto en el correo del contacto");
								resultado = false;
								return false;
							}
						}
						//Valida Usuarios
						if ($("#chkAsignaUsuario" + n).is(':checked')) {
							if ($("#tbUsuarioContactoCliente" + n).val() == "" || $("#tbContrasenaContactoCliente" + n).val() == "" || $("#tbRepetirContrasenaContactoCliente" + n).val() == "") {
								if ($("#tbUsuarioContactoCliente" + n).val() == "")
									$("#tbUsuarioContactoCliente" + n).focus();
								else
									if ($("#tbContrasenaContactoCliente" + n).val() == "")
										$("#tbContrasenaContactoCliente" + n).focus();
									else
										if ($("#tbRepetirContrasenaContactoCliente" + n).val() == "")
											$("#tbRepetirContrasenaContactoCliente" + n).focus();
								alert("Requiere datos de usuario del contacto");
								resultado = false;
								return false;
							} else {
								if (!($("#tbContrasenaContactoCliente" + n).val() === $("#tbRepetirContrasenaContactoCliente" + n).val())) {
									$("#tbContrasenaContactoCliente" + n).focus();
									alert("Verifique la contrasena de los contactos");
									resultado = false;
									return false;
								}
							}
						}
					});
				}
			}
	if ($('#cbMetodoPago').val() == "") {
		alert("Debe seleccionar un metodo de pago(Otra informacion)");
		resultado = false;
	}
	//Validar Usuario Cliente
	if (resultado == true) {
		xml = '&lt;Clientes&gt;';
		xml = xml + '&lt;Contactos&gt;';
		$('#ulContactos li').each(function () {
			n = this.id.replace("liContacto", "");
			xml = xml + '&lt;Contacto ';
			xml = xml + 'Cliente_ContactosID="' + $("#tbCliente_ContactosID" + n).val() + '" ';
			xml = xml + 'Login="' + $("#tbUsuarioContactoCliente" + n).val() + '" &gt;';
			xml = xml + '&lt;/Contacto&gt; ';
		});
		xml = xml + '&lt;/Contactos&gt;';
		xml = xml + '&lt;/Clientes&gt;';

		soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:validateUsuarioCliente>';
		soap = soap + '<urn:pXML>' + xml + '</urn:pXML>';
		soap = soap + '</urn:validateUsuarioCliente>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';
		$.ajax({
			cache : false,
			type : 'post',
			async : false,
			dataType : 'xml',
			//url:'http://192.168.0.101/app/Service1.asmx/validateUsuarioCliente',
			//data: {"xml" : contactos },
			contentType : "text/xml;charset=UTF-8",
			url : pURL,
			data : soap,
			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "false") {
					resultado = false;
					alert(obj.Error);
				}
			},
			error : function (xhr, ajaxOptions, thrownError) {
				resultado = false;
				//alert("Error16: " + xhr.status +" | "+xhr.responseText);
				$.mobile.changePage("#pError", {
					role : "dialog",
					transition : "slidedown"
				});

			}
		});
	}
	return resultado;
}

function insertCliente() {
	/*$.blockUI({
	message: '<h1> Espere un momento...</h1>',
	css: {
	border: 'none',
	padding: '15px',
	backgroundColor: '#000',
	'-webkit-border-radius': '10px',
	'-moz-border-radius': '10px',
	opacity: .5,
	color: '#fff'
	} }); */
	if (validaCliente()) {
		var n;
		var json;
		var xml,
		soap;
		xml = '&lt;Cliente&gt;';
		xml = xml + '&lt;EmpresaID&gt;' + EmpresaID + '&lt;/EmpresaID&gt;';
		xml = xml + '&lt;ClienteID&gt;' + ClienteID + '&lt;/ClienteID&gt;';
		xml = xml + '&lt;Nombre&gt;' + $("#tbNombreCliente").val() + '&lt;/Nombre&gt;';
		xml = xml + '&lt;RFC&gt;' + $("#tbRFCCliente").val() + '&lt;/RFC&gt;';
		xml = xml + '&lt;NombreComercial&gt;' + $("#tbNombreComercialCliente").val() + '&lt;/NombreComercial&gt;';
		xml = xml + '&lt;Calle&gt;' + $("#tbCalleCliente").val() + '&lt;/Calle&gt;';
		xml = xml + '&lt;Colonia&gt;' + $("#tbColoniaCliente").val() + '&lt;/Colonia&gt;';
		xml = xml + '&lt;Municipio&gt;' + $("#tbMunicipioCliente").val() + '&lt;/Municipio&gt;';
		xml = xml + '&lt;Estado&gt;' + $("#tbEstadoCliente").val() + '&lt;/Estado&gt;';
		xml = xml + '&lt;Pais&gt;' + $("#tbPaisCliente").val() + '&lt;/Pais&gt;';
		xml = xml + '&lt;NoExterior&gt;' + $("#tbNoExteriorCliente").val() + '&lt;/NoExterior&gt;';
		xml = xml + '&lt;NoInterior&gt;' + $("#tbNoInteriorCliente").val() + '&lt;/NoInterior&gt;';
		xml = xml + '&lt;Localidad&gt;' + $("#tbCiudadCliente").val() + '&lt;/Localidad&gt;';
		xml = xml + '&lt;CodigoPostal&gt;' + $("#tbCPCliente").val() + '&lt;/CodigoPostal&gt;';
		xml = xml + '&lt;MetodoPago&gt;' + $("#cbMetodoPago").val() + '&lt;/MetodoPago&gt;';
		xml = xml + '&lt;UltimosDigitos&gt;' + $("#tbNoCuentaCliente").val() + '&lt;/UltimosDigitos&gt;';
		xml = xml + '&lt;NotaInterna&gt;' + $("#tbNotaInterna").val() + '&lt;/NotaInterna&gt;';
		/*Sucursales*/
		xml = xml + '&lt;Sucursales&gt;';
		$('#ulSucursales li').each(function () {
			n = this.id.replace("liSucursal", "");
			xml = xml + '&lt;Sucursal ';
			xml = xml + 'Cliente_SucursalID="' + $("#tbCliente_SucursalID" + n).val() + '" ';
			xml = xml + 'ClienteId="' + ClienteID + '" ';
			xml = xml + 'Nombre="' + $("#tbNombreSucursal" + n).val() + '" ';
			xml = xml + 'Calle="' + $("#tbCalleSucursal" + n).val() + '" ';
			xml = xml + 'Colonia="' + $("#tbColoniaSucursal" + n).val() + '" ';
			xml = xml + 'Pais="' + $("#tbPaisSucursal" + n).val() + '" ';
			xml = xml + 'NoExterior="' + $("#tbNoExteriorSucursal" + n).val() + '" ';
			xml = xml + 'Municipio="' + $("#tbMunicipioSucursal" + n).val() + '" ';
			xml = xml + 'Estado="' + $("#tbEstadoSucursal" + n).val() + '" ';
			xml = xml + 'NoInterior="' + $("#tbNoInteriorSucursal" + n).val() + '" ';
			xml = xml + 'Ciudad="' + $("#tbCiudadSucursal" + n).val() + '" ';
			xml = xml + 'CodigoPostal="' + $("#tbCPSucursal" + n).val() + '" ';
			xml = xml + 'Referencia="' + $("#tbReferenciaSucursal" + n).val() + '" &gt;';
			xml = xml + '&lt;/Sucursal&gt;';
		});
		xml = xml + '&lt;/Sucursales&gt;';
		/*Contactos*/
		xml = xml + '&lt;Contactos&gt;';
		$('#ulContactos li').each(function () {
			n = this.id.replace("liContacto", "");
			xml = xml + '&lt;Contacto ';
			xml = xml + 'Cliente_ContactosID="' + $("#tbCliente_ContactosID").val() + '" ';
			xml = xml + 'ClienteID="' + ClienteID + '" ';
			xml = xml + 'AsignarUsuario="' + $("#chkAsignaUsuario" + n).is(':checked') + '" ';
			xml = xml + 'Login="' + $("#tbUsuarioContactoCliente" + n).val() + '" ';
			xml = xml + 'Password="' + $("#tbContrasenaContactoCliente" + n).val() + '" ';
			xml = xml + 'Nombre="' + $("#tbNombreContactoCliente" + n).val() + '" ';
			xml = xml + 'Telefono="' + $("#tbTelefonoContactoCliente" + n).val() + '" ';
			xml = xml + 'CorreoElectronico="' + $("#tbCorreoContactoCliente" + n).val() + '" &gt;';
			xml = xml + '&lt;/Contacto&gt; ';
		});
		xml = xml + '&lt;/Contactos&gt;';
		xml = xml + '&lt;/Cliente&gt;';

		soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:saveClientes>';
		soap = soap + '<urn:pXML>' + xml + '</urn:pXML>';
		soap = soap + '</urn:saveClientes>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';

		$.ajax({
			cache : false,
			type : 'post',
			async : false,
			dataType : 'xml',
			//url:'http://192.168.0.101/app/Service1.asmx/saveClientes',
			//data: {"xml" : xml},
			contentType : "text/xml;charset=UTF-8",
			url : pURL,
			data : soap,
			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "true") {
					$.mobile.changePage("#pListaClientes");
				} else {
					alert("A ocuurido un error, por favor verifique su conexion a internet.");
				}
				$("#dCargando").removeClass("Visible");
				$("#dCargando").addClass("NoVisible");
			},
			error : function (xhr, ajaxOptions, thrownError) {
				//alert("Error17: " + xhr.status +" | "+xhr.responseText);
				$("#dCargando").removeClass("Visible");
				$("#dCargando").addClass("NoVisible");
				$.mobile.changePage("#pError", {
					role : "dialog",
					transition : "slidedown"
				});
			}
		});
	}
}

///////////////////////////////////////////////////////////     GASTOS     ////////////////////////////////////////////////////////////////////////////
function populateAllGastos() {
	Paginacion = 1;
	TotalGastos = 0;
	var html,
	soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllGastos>';
	soap = soap + '<urn:EmpresaID>' + EmpresaID + '</urn:EmpresaID>';
	soap = soap + '<urn:Paginacion>' + Paginacion + '</urn:Paginacion>';
	soap = soap + '</urn:getAllGastos>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllGastos',
		//data:{"EmpresaID":EmpresaID,"Paginacion":Paginacion},
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (json) {
			var r = $(json).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$.mobile.changePage("#pListaGastos");

				$.each(obj.Gastos, function (index, value) {
					html = '<li data-icon="false"><a href="#" onclick="populateGasto(' + value.GastosID + ')"><div class="listado1 izquierda">Gastos fijos</div><div class="listado1 derecha">$ ' + agregarDecimales(value.Monto) + '</div><div class="espacio limpiar"></div><div class="listado2 izquierda">' + value.Descripcion +
						'</div><div class="listado2 div_centro">' + value.Fecha + '</div></a></li>';
					$('#lvGastos').append(html);
					TotalGastos = TotalGastos + parseFloat(value.Monto);
				});

				$('#gTotal').text("$ " + agregarDecimales(TotalGastos));
				$('#lvGastos').show();
				$('#lvGastos').listview("refresh");
			} else
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
		},
		error : function (e) {
			//alert("Error18: "+e.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function setInicioListaGastos() {
	$('#lvGastos').children().remove('li');
	$.mobile.changePage("#pMenu");
}

function getMoreGastos() {
	Paginacion++;
	var html,
	soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getAllGastos>';
	soap = soap + '<urn:EmpresaID>' + EmpresaID + '</urn:EmpresaID>';
	soap = soap + '<urn:Paginacion>' + Paginacion + '</urn:Paginacion>';
	soap = soap + '</urn:getAllGastos>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url:'http://192.168.0.101/app/Service1.asmx/getAllGastos',
		//data:{"EmpresaID":EmpresaID,"Paginacion":Paginacion},
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				$.mobile.changePage("#pListaGastos");

				$.each(obj.Gastos, function (index, value) {
					html = '<li data-icon="false"><a href="#" onclick="populateGasto(' + value.GastosID + ')"><div class="listado1 izquierda">Gastos fijos</div><div class="listado1 derecha">$ ' + agregarDecimales(value.Monto) + '</div><div class="espacio limpiar"></div><div class="listado2 izquierda">' + value.Descripcion +
						'</div><div class="listado2 div_centro">' + value.Fecha + '</div></a></li>';
					$('#lvGastos').append(html);
					TotalGastos = TotalGastos + parseFloat(value.Monto);
				});

				$('#gTotal').text("$ " + agregarDecimales(TotalGastos));
				$('#lvGastos').show();
				$('#lvGastos').listview("refresh");
			} else
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
		},
		error : function (e) {
			//alert("Error19: "+e.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}

function limpiarPantallaGastos(pEnviarPantalla) {
	GastosID = 0;
	$("#tbMontoGasto").val("");
	$("#tbFechaGasto").val("");
	$("#tbProveedorGasto").val("");
	$("#tbCategoriaGasto").val("");
	$("#tbDescripcionGasto").val("");
	$('#cbImpuestosGasto').children().remove('option');

	if (pEnviarPantalla == true)
		$.mobile.changePage("#pGastos");
}

function insertGasto() {
	var n;
	var xml,
	soap;
	if ($("#tbMontoGasto").val() == "") {
		alert("Favor de agregar un monto para el gasto");
		$("#tbMontoGasto").focus();
	} else if ($("#tbDescripcionGasto").val() == "") {
		alert("Favor de agregar la descripcion del gasto");
		$("#tbDescripcionGasto").focus();
	} else if ($("#tbFechaGasto").val() == "") {
		alert("Favor de agregar una fecha");
		$("#tbFechaGasto").focus();
	} else {
		xml = '&lt;Gasto&gt;';
		xml = xml + '&lt;EmpresaID&gt;' + EmpresaID + '&lt;/EmpresaID&gt;';
		xml = xml + '&lt;GastoID&gt;' + GastoID + '&lt;/ClienteID&gt;';
		xml = xml + '&lt;Fecha&gt;' + $("#tbFechaGasto").val() + '&lt;/Fecha&gt;';
		xml = xml + '&lt;Proveedor&gt;' + $("#tbProveedorGasto").val() + '&lt;/Proveedor&gt;';
		xml = xml + '&lt;Categoria&gt;' + $("#tbCategoriaGasto").val() + '&lt;/Categoria&gt;';
		xml = xml + '&lt;Descripcion&gt;' + $("#tbDescripcionGasto").val() + '&lt;/Descripcion&gt;';
		xml = xml + '&lt;Impuesto&gt;' + $("#cbImpuestosGasto option:selected").val() + '&lt;/Impuesto&gt;';
		xml = xml + '&lt;/Gasto&gt;';

		soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
		soap = soap + '<soapenv:Header/>';
		soap = soap + '<soapenv:Body>';
		soap = soap + '<urn:saveGastos>';
		soap = soap + '<urn:pXML>' + xml + '</urn:pXML>';
		soap = soap + '</urn:saveGastos>';
		soap = soap + '</soapenv:Body>';
		soap = soap + '</soapenv:Envelope>';

		$.ajax({
			cache : false,
			type : 'post',
			async : false,
			dataType : 'xml',
			//url:'http://192.168.0.101/app/Service1.asmx/saveGastos',
			//data: {"xml" : xml},
			contentType : "text/xml;charset=UTF-8",
			url : pURL,
			data : soap,
			success : function (xml) {
				var r = $(xml).text();
				r = r.replace(/\|amp;/g,"&");
				var obj = jQuery.parseJSON(r);
				if (obj.Validacion == "true") {
					$.mobile.changePage("#pListaGastos");
				} else {
					alert("A ocurrido un error, por favor verifique su conexion a internet.");
				}
			},
			error : function (xhr, ajaxOptions, thrownError) {
				//alert("Error20: " + xhr.status +" | "+xhr.responseText);
				$.mobile.changePage("#pError", {
					role : "dialog",
					transition : "slidedown"
				});
			}
		});
	}
}

function populateGasto(pGastoID) {
	var html;
	var soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getGasto>';
	soap = soap + '<urn:pGastoID>'+ pGastoID +'</urn:pGastoID>';
	soap = soap + '</urn:getGasto>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	limpiarPantallaGastos(false);
	insertarImpuestosCombo("cbImpuestosGasto");
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		/*url : 'http://developer-03/app/Service1.asmx/getGasto',
		data : {'pGastoID' : pGastoID},*/
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				GastosID = obj.GastosID;
				$("#tbMontoGasto").val(obj.Monto);
				$("#tbFechaGasto").val(obj.Fecha);
				$("#tbProveedorGasto").val(obj.Proveedor);
				$("#tbCategoriaGasto").val(obj.Categoria);
				$("#tbDescripcionGasto").val(obj.Descripcion);
				$("#cbImpuestosGasto").val(obj.Impuesto);

				$.mobile.changePage("#pGastos");
			} else
				alert("A ocurrido un error, por favor verfique su conexion a internet.");
		},
		error : function (e) {
			alert("Error: " + e.responseText);
		}
	});
}

////////////////////////////////////////////////////////       METODOS GENERALES         ////////////////////////////////////////////////////
function cargarImpuestos() {
	var html,
	soap;
	soap = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Webservice1">';
	soap = soap + '<soapenv:Header/>';
	soap = soap + '<soapenv:Body>';
	soap = soap + '<urn:getImpuestos>';
	soap = soap + '<urn:pEmpresaID>' + EmpresaID + '</urn:pEmpresaID>';
	soap = soap + '</urn:getImpuestos>';
	soap = soap + '</soapenv:Body>';
	soap = soap + '</soapenv:Envelope>';
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		//url : 'http://192.168.0.101/app/Service1.asmx/getImpuestos',
		//data : {'pEmpresaID' : EmpresaID},
		contentType : "text/xml;charset=UTF-8",
		url : pURL,
		data : soap,
		success : function (xml) {
			var r = $(xml).text();
			r = r.replace(/\|amp;/g,"&");
			var obj = jQuery.parseJSON(r);
			if (obj.Validacion == "true") {
				ImpuestosJSON = obj;
			} else
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
		},
		error : function (e) {
			//alert("Error21: "+e.responseText);
			$.mobile.changePage("#pError", {
				role : "dialog",
				transition : "slidedown"
			});
		}
	});
}
function insertarImpuestosCombo(id) {
	var html;
	$('#' + id).append('<option value="0">Sin Impuesto</option>');
	$.each(ImpuestosJSON.Impuestos, function (index, value) {
		html = '<option value="' + value.ImpuestosID + '">' + value.Nombre + ' ' + ((parseFloat(value.Tasa * 100) * 100) / 100) + '%</option>';
		$('#' + id).append(html);
	});
}

function insertarImpuestosLista(id) {
	var html;
	$.each(ImpuestosJSON.Impuestos, function (index, value) {
		html = '<input type="checkbox" name="checkImpuestoFactura' + index + '" id="checkImpuestoFactura' + index + '" class="custom"/>'
		html = html + '<label for="checkImpuestoFactura' + index + '">' + value.Nombre + ' ' + ((parseFloat(value.Tasa * 100) * 100) / 100) + '%</label>';
		$('#' + id).append(html);
	});
}


function agregarDecimales(importe) {
	var cadena = "" + Math.round(parseFloat(importe) * 100) / 100;
	if (cadena.indexOf(".") == -1) {
		return cadena + ".00";
	} else {
		if (cadena.substring(cadena.indexOf("."), cadena.length).length == 2) {
			return cadena + "0";
		} else {
			return cadena;
		}
	}
}

function tabNumerico(){
	//Acepta decimales y negativos
	$(".numeric1").numeric();
	//solo enteros y negativos
	$(".numeric2").numeric({ decimal: false, negative: true },function(){});
	//solo acepta enteros positivos
	$(".numeric3").numeric({ decimal: false, negative: false },function(){});
}

/*Variables*/
var EmpresaID = 0;
var ClienteID = 0;
var Empresa_SucursalID = 0;
var SeriesID = 0;
var GastosID = 0;
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
/*Login*/
function autentifica(){
var usuario = $("#tbUsuario").val();
var pass = $("#tbContrasena").val();
var resultado = false;
	if(usuario != "" && pass != "")
	{
		$.ajax({
				cache: false,
				type: 'POST',
				async: false,
				//contentType: "text/xml; charset=utf-8",
				dataType: "xml",
				url:'http://eduardo-pc/app/Service1.asmx/Login',
				data: {"sUsuario" : usuario,"sContrasena" : pass},
				success: function (xml) {
				var r = $(xml).text();
				var obj = jQuery.parseJSON(r);
					if(obj.Validacion == "true")
					{	
						EmpresaID = obj.EmpresaID;
						Login = obj.Login;
						$("#errorLogin").removeClass("Visible");
						$("#errorLogin").addClass("NoVisible");
						resultado = true;
					}
					else
					{
						$("#errorLogin").text("*Su contrasena es incorrecta.");
						$("#errorLogin").removeClass("NoVisible");
						$("#errorLogin").addClass("Visible"); 
					}
				},
				error: function (xhr, ajaxOptions, thrownError) {
					alert("Error: " + xhr.status +" | "+xhr.responseText);
				}
		});
		if (resultado)
		{
			populateMonedas();
			populateProductos();
			$.mobile.changePage("#pMenu");
		}
	}
}

function recuperarContrasena(pLogin)
{
	if(pLogin != "")
	{
		$.ajax({
			cache: false,
			type: 'POST',
			async: false,
			//contentType: "text/xml; charset=utf-8",
			dataType: "xml",
			url:'http://eduardo-pc/app/Service1.asmx/recuperarContrasena',
			data: {"pLogin" : pLogin},
			success: function (xml) {
				var r = $(xml).text();
				var obj = jQuery.parseJSON(r);
				if(obj.Validacion == "false")
				{	
						alert("A ocuurido un error, por favor verifique su conexion a internet.");
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert("Error: " + xhr.status +" | "+xhr.responseText);
			}
		});
		$.mobile.changePage("#pRecuperarContrasena");
	}
	else{
		$("#errorLogin").text("*Favor de escribir su usuario");
		$("#errorLogin").removeClass("NoVisible");
		$("#errorLogin").addClass("Visible"); 
	}
}

/*Generales*/
function populateMonedas()
{
	var n = 0;
	$.ajax({
		cache: false,
		type: 'POST',
		async: false,
		dataType: "xml",
		url:'http://eduardo-pc/app/Service1.asmx/getAllMonedas',
		data: {},
		success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				JSonMonedas = obj.Monedas;
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
		}
	});
}

function populateProductos()
{
	var n = 0;
	$.ajax({
		cache: false,
		type: 'POST',
		async: false,
		dataType: "xml",
		url:'http://eduardo-pc/app/Service1.asmx/getAllProductos',
		data: {"pEmpresaID" : EmpresaID},
		success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				JSonProductos = obj.Productos;
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
		}
	});
}

/*Configuración*/
function limpiarConfiguracion()
{
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

function populateConfiguracion()
{
var html = ""	
limpiarConfiguracion();
$.ajax({
		cache: false,
        type: 'post',
        async: false,
        dataType: "xml",
        url:'http://eduardo-pc/app/Service1.asmx/getEmpresa',
        data: {"EmpresaID" : EmpresaID},
        success: function (xml) {
		var r = $(xml).text();
		var obj = jQuery.parseJSON(r);
		if(obj.Validacion == "true")
		{	
			JSonSucursales = obj.Sucursales
			$.each(obj.Sucursales, function(index,value){
				html= '<option value="'+value.Empresa_SucursalID+'" selected="selected">'+value.Sucursal_Nombre+'</option>';
				$("#cbSucursalEmpresa").append('<option value="" selected="selected">Sucursal</option>');
				if(Empresa_SucursalID == value.Empresa_SucursalID)
				{
					if(Empresa_SucursalID == 0)
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
					$.each(obj.Series, function(index,value){
						html= '<option value="'+value.SeriesID+'" selected="selected">'+value.Serie+'</option>';
						$("#cbSerieEmpresa").append(html);
					});
					$("#cbSerieEmpresa").val("");
					$.mobile.changePage("#pDatosFiscales");
		}
		else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
         error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
        }
});
}
function populateSucursal()
{
	Empresa_SucursalID  = $("#cbSucursalEmpresa").val() != "" ? $("#cbSucursalEmpresa").val() : "0";
	$.each(JSonSucursales, function(index,value){
		if(Empresa_SucursalID == value.Empresa_SucursalID)
		{
			if(Empresa_SucursalID == 0)
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
function changeSerie()
{
  $("#tbFolio").val("");
  SeriesID =  $("#cbSerieEmpresa").val();
  $.each(JSonSeries, function(index,value){
	 if(SeriesID == value.SeriesID)
	 {
		$("#tbFolio").val(value.Folio);
		return;
	 }
  });
}

function validaConfiguracion()
{
	if($("#tbRazonSocial").val() == ""){
		alert("Por favor capture la razon social");
		$("#tbRazonSocial").focus();
		return false;
	}
	else
	if($("#tbCalle").val() == ""){
		alert("Por favor capture la calle");
		$("#tbCalle").focus();
		return false;
	}
	else
	if($("#tbNumExt").val() == ""){
		alert("Por favor capture el numero exterior");
		$("#tbNumExt").focus();
		return false;
	}
	else
	if($("#tbMunicipio").val() == ""){
		alert("Por favor capture el municipio");
		$("#tbMunicipio").focus();
		return false;
	}
	else
	if($("#tbEstado").val() == ""){
		alert("Por favor capture el estado");
		$("#tbEstado").focus();
		return false;
	}
	else
	if($("#tbPais").val() == ""){
		alert("Por favor capture el pais");
		$("#tbPais").focus();
		return false;
	}
	else
	if($("#tbCodigoPostal").val() == ""){
		alert("Por favor capture el codigo postal");
		$("#tbCodigoPostal").focus();
		return false;
	}
	else
	if($("#tbRegimenFiscal").val() == ""){
		alert("Por favor capture el regimen fiscal");
		$("#tbRegimenFiscal").focus();
		return false;
	}
	else
	if($("#tbLugarExpedicion").val() == ""){
		alert("Por favor capture el lugar de expedicion");
		$("#tbLugarExpedicion").focus();
		return false;
	}
	else
	return true;
}
function updateConfiguracion(){
	if (validaConfiguracion())
	{
		var xml;
		xml = '&lt;Empresa&gt;';
		xml = xml + '&lt;EmpresaID&gt;'+EmpresaID+'&lt;/EmpresaID&gt;'
		xml = xml + '&lt;Empresa_SucursalID&gt;'+Empresa_SucursalID+'&lt;/Empresa_SucursalID&gt;'
		xml = xml + '&lt;RazonSocial&gt;'+$("#tbRazonSocial").val()+'&lt;/RazonSocial&gt;'
		xml = xml + '&lt;Calle&gt;'+$("#tbCalle").val()+'&lt;/Calle&gt;'
		xml = xml + '&lt;NoExterior&gt;'+$("#tbNumExt").val()+'&lt;/NoExterior&gt;'
		xml = xml + '&lt;NoInterior&gt;'+$("#tbNumInt").val()+'&lt;/NoInterior&gt;'
		xml = xml + '&lt;Colonia&gt;'+$("#tbColonia").val()+'&lt;/Colonia&gt;'
		xml = xml + '&lt;Ciudad&gt;'+$("#tbCiudad").val()+'&lt;/Ciudad&gt;'
		xml = xml + '&lt;Referencia&gt;'+$("#tbReferencias").val()+'&lt;/Referencia&gt;'
		xml = xml + '&lt;Municipio&gt;'+$("#tbMunicipio").val()+'&lt;/Municipio&gt;'
		xml = xml + '&lt;Estado&gt;'+$("#tbEstado").val()+'&lt;/Estado&gt;'
		xml = xml + '&lt;Pais&gt;'+$("#tbPais").val()+'&lt;/Pais&gt;'
		xml = xml + '&lt;CodigoPostal&gt;'+$("#tbCodigoPostal").val()+'&lt;/CodigoPostal&gt;'
		xml = xml + '&lt;RegimenFiscal&gt;'+$("#tbRegimenFiscal").val()+'&lt;/RegimenFiscal&gt;'
		xml = xml + '&lt;LugarExpedicion&gt;'+$("#tbLugarExpedicion").val()+'&lt;/LugarExpedicion&gt;'
		xml = xml + '&lt;/Empresa&gt;';
			$.ajax({
					cache: false,
					type: 'post',
					async: false,
					dataType: 'xml',
					url:'http://eduardo-pc/app/Service1.asmx/updateEmpresa',
					data: {"pXml" : xml },
					success: function (xml) {
					var r = $(xml).text();
					var obj = jQuery.parseJSON(r);
					if(obj.Validacion == "true")
					{	
						$.mobile.changePage("#pMenu");
					}
					else
						alert("A ocuurido un error, por favor verifique su conexion a internet.");
					},
					error: function (xhr, ajaxOptions, thrownError) {
					alert("Error: " + xhr.status +" | "+xhr.responseText);
					}
			});
	}		
}

/*Impuestos*/
function populateImpuestos(){
var html = "";	
$("#ulImpuestos").children().remove('li');
contadorImpuestos = 1;
	$.ajax({
		cache: false,
		type: 'post',
		async: false,
		dataType: 'xml',
		url:'http://eduardo-pc/app/Service1.asmx/getImpuestos',
		data: {"pEmpresaID" : EmpresaID },
		success: function (xml) {
			if(obj.Validacion == "true")
			{	
				JSonTiposImpuestos = obj.TiposImpuestos;
				$.each(obj.Impuestos, function(index,value){
					html = '<li id="liImpuestos'+contadorImpuestos+'">';
					html = html + '<div class="espacio2 limpiar"></div>';
					html = html + '<div class="div16 izquierda"><a class="bQuitar" href="" id="bQuitarImpuesto'+contadorImpuestos+'" onclick="closeImpuesto('+contadorImpuestos+')"></a></div>';
					html = html + '<div class="div15 izquierda"><input type="text" name="tbImpuesto" value="'+value.Nombre+'" placeholder=" Impuesto" data-role="none" class="campo1" id="tbImpuesto'+contadorImpuestos+'"></input></div>';
					html = html + '<div class="div11 izquierda"><a class="bEliminar" href="" id="bEliminarImpuesto'+contadorImpuestos+'" onclick="eliminarImpuesto('+contadorImpuestos+')"></a></div>';
					html = html + '<div id="divDetalleImpuestos'+contadorImpuestos+'" class="Visible">';
					html = html + '<div class="div1 izquierda"><input type="text" name="tbTasa" value="'+value.Tasa+'" placeholder=" Tasa" data-role="none" class="campo6" id="tbTasa'+contadorImpuestos+'"></input></div>';
					html = html + '<div class="div1 izquierda">';
					html = html + '<select class="campo7" data-role="none" id="cbTipoPago'+contadorImpuestos+'">';
					html = html + '<option value="" selected="selected">Tipo de impuesto</option>';
						$.each(obj.TiposImpuestos, function(index2,value2){
							html = html + '<option value="'+value2.TipoImpuestoID+'">'+value2.Nombre+'</option>'
						});
					html = html + '</select> ';
					html = html + '</div>';
					html = html + '</div>';//Detalle
					html = html + '<input id="tbImpuestosID'+contadorImpuestos+'" type="hidden" value="'+value.ImpuestosID+'"></input>'
					html = html + '</li> ';
					$("#ulImpuestos").append(html);
					$("#cbTipoPago"+contadorImpuestos).val(value.TipoImpuestoID);
					contadorImpuestos++;
				});
				$.each(JSonTiposImpuestos, function(index,value){
					html = '<option value="'+value.TipoImpuestoID+'">'+value.Nombre+'</option>'
					$("#cbTipoPago").append(html);
				});
				$.mobile.changePage("#pImpuestos");
			}
			else
			alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
		}
	});
	$.mobile.changePage("#pImpuestos");
}

function addImpuesto()
{
	var impuesto,tasa,tipo;
	impuesto = $("#tbImpuesto").val();
	tasa = $("#tbTasa").val();
	tipo = $("#cbTipoPago").val();
	if(impuesto == "")
	{
		alert("Favor de capturar impuesto");
		$("#tbImpuesto").focus();
	}
	else
	if(tasa == "")
	{
		alert("Favor de capturar tasa");
		$("#tbTasa").focus();
	}
	else
	if(tipo == "")
	{
		alert("Favor de capturar tipo de pago");
		$("#cbTipoPago").focus();
	}
	else
	{
		var html;
		html = '<li id="liImpuestos'+contadorImpuestos+'">';
		html = html + '<div class="espacio2 limpiar"></div>';
		html = html + '<div class="div16 izquierda"><a class="bQuitar" href="" id="bQuitarImpuesto'+contadorImpuestos+'" onclick="closeImpuesto('+contadorImpuestos+')"></a></div>';
		html = html + '<div class="div15 izquierda"><input type="text" name="tbImpuesto" value="'+impuesto+'" placeholder=" Impuesto" data-role="none" class="campo1" id="tbImpuesto'+contadorImpuestos+'"></input></div>';
		html = html + '<div class="div11 izquierda"><a class="bEliminar" href="" id="bEliminarImpuesto'+contadorImpuestos+'" onclick="eliminarImpuesto('+contadorImpuestos+')"></a></div>';
		html = html + '<div id="divDetalleImpuestos'+contadorImpuestos+'" class="Visible">';
		html = html + '<div class="div1 izquierda"><input type="text" name="tbTasa" value="'+tasa+'" placeholder=" Tasa" data-role="none" class="campo6" id="tbTasa'+contadorImpuestos+'"></input></div>';
		html = html + '<div class="div1 izquierda">';
		html = html + '<select class="campo7" data-role="none" id="cbTipoPago'+contadorImpuestos+'">';
		html = html + '<option value="" selected="selected">Tipo de impuesto</option>';
		$.each(JSonTiposImpuestos, function(index2,value2){
			html = html + '<option value="'+value2.TipoImpuestoID+'">'+value2.Nombre+'</option>'
		});
		html = html + '</select> ';
		html = html + '</div>';
		html = html + '</div>';//Detalle
		html = html + '<input id="tbImpuestosID'+contadorImpuestos+'" type="hidden" value="0"></input>'
		html = html + '</li> ';
		$("#ulImpuestos").prepend(html);
		$("#cbTipoPago"+contadorImpuestos).val(tipo);
		contadorImpuestos++;
		//impiamos los campos
		$("#tbImpuesto").val("");
		$("#tbTasa").val("");
		$("#cbTipoPago").val("");
	}
}

function closeImpuesto(row)
{
	var x = $("#divDetalleImpuestos"+row).attr("class");
	x = x.replace("divDetalleImpuestos ","");
	if(x == "NoVisible")
	{
		$("#divDetalleImpuestos"+row).removeClass("NoVisible");	
		$("#divDetalleImpuestos"+row).addClass("Visible");
	}
	else
	{
		$("#divDetalleImpuestos"+row).removeClass("Visible");	
		$("#divDetalleImpuestos"+row).addClass("NoVisible");
	}
}

function eliminarImpuesto(row)
{
	$("#liImpuestos"+row).remove();
}
function validarImpuestos()
{
	var impuesto,tasa,tipo,n,resultado = true;
	$('#ulImpuestos li').each(function(){
		n = this.id.replace("liImpuestos","");
		impuesto = $("#tbImpuesto"+n).val();
		tasa = $("#tbTasa"+n).val();
		tipo = $("#cbTipoPago"+n).val();
		if(impuesto == "")
		{
			alert("Favor de capturar impuesto");
			$("#tbImpuesto"+n).focus();
			resultado = false;
			return;
		}
		else
		if(tasa == "")
		{
			alert("Favor de capturar tasa");
			$("#tbTasa"+n).focus();
			resultado = false;
			return;
		}
		else
		if(tipo == "")
		{
			alert("Favor de capturar tipo de pago");
			$("#cbTipoPago"+n).focus();
			resultado = false;
			return;
		}
	});
	return resultado;
}
function insertImpuestos(){
	if(validarImpuestos())
	{
		var xml,n;
		xml = '&lt;Impuestos&gt;';
		xml = xml + '&lt;EmpresaID&gt;'+EmpresaID+'&lt;/EmpresaID&gt;';
		$('#ulImpuestos li').each(function(){
			n = this.id.replace("liImpuestos","");
			xml = xml + '&lt;Impuesto ';
			xml = xml + 'ImpuestosID="'+ $("#tbImpuestosID"+n).val() +'" ';
			xml = xml + 'Nombre="'+ $("#tbImpuesto"+n).val() +'" ';
			xml = xml + 'Tasa="'+ $("#tbTasa"+n).val() +'" ';
			xml = xml + 'Tipo="'+ $("#cbTipoPago"+n).val() +'"&gt;';
			xml = xml + '&lt;/Impuesto&gt;';
		});
		xml = xml + '&lt;/Impuestos&gt;'
		$.ajax({
			cache: false,
			type: 'post',
			async: false,
			dataType: 'xml',
			url:'http://eduardo-pc/app/Service1.asmx/saveImpuestos',
			data: {"pXML" : xml },
			success: function (xml) {
				var r = $(xml).text();
				var obj = jQuery.parseJSON(r);
				if(obj.Validacion == "true")
				{	
					$.mobile.changePage("#pMenu");
				}
				else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert("Error: " + xhr.status +" | "+xhr.responseText);
			}
		});
	}
}
/*Facturas*/
function populateFactura()
{
	//Clientes
	$('#cbClienteFactura').children().remove('option');
	$.ajax({
		cache: false,
		type: 'post',
		async: false,
		dataType: 'xml',
		url:'http://eduardo-pc/app/Service1.asmx/getAllClienteComboBox',
		data: {"pEmpresaID" : EmpresaID },
		success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$.each(obj.Clientes, function(index,value){
					$("#cbClienteFactura").append('<option value='+value.ClienteID+'>'+value.Nombre+'</option>');
				});
			}
			else
			alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
		}
	});
	//Moneda
	$.each(JSonMonedas, function(index,value){
		$("#cbMonedaFactura").append('<option value="'+ value.MonedasID +'">'+ value.Sigla +'</option>');
	});
	$("#cbMonedaFactura").val("1");
	//Productos
	$.each(JSonProductos, function(index,value){
		$("#cbArticuloFactura").append('<option value="'+ value.Empresa_Catalogo_ProductosID +'">'+ value.NoIdentificacion +'</option>');
	});
	$("#cbArticuloFactura").val("");
	
	$.mobile.changePage("#pFacturas");
	
}

function populateAllFacturas()
{
Paginacion = 1;
var html;
	$.ajax({
			cache: false,
			type: 'post',
			async: false,
			dataType: 'xml',
			url:'http://eduardo-pc/app/Service1.asmx/getAllFacturas',
			data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
			success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$.mobile.changePage("#pListaFacturas");
				$.each(obj.Facturas, function(index,value){
				html= '<li>';
				html = html + '<a href="#">';
				html = html + '<div class="div1 izquierda">';
				html = html + '<div class="listado1">'+ value.NombreCliente +'...</div>';
				html = html + '<div class="listado2">'+ value.Fecha +'</div>';
				html = html + '</div>';
				html = html + '<div class="div1 izquierda texto_derecha">';
				html = html + '<div class="listado1">$ '+ value.Total +'</div>';
				html = html + '<div class="listado2">'+ value.Estatus +'</div>';
				html = html + '</div>';
				html = html + '</a>';
				html = html + '</li>';
					$("#lvFacturas").append(html);
				});
					$("#lvFacturas").show();
					$("#lvFacturas").listview("refresh");
			}
			else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
			},
			error: function (e) {
			alert("Error: " + e.responseText);
			}
	});
}

function getMoreFacturas()
{
Paginacion++;
var html;
	$.ajax({
			cache: false,
			type: 'post',
			async: false,
			dataType: 'xml',
			url:'http://eduardo-pc/app/Service1.asmx/getAllFacturas',
			data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
			success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$.each(obj.Facturas, function(index,value){
					html= '<li>';
					html = html + '<a href="#">';
					html = html + '<div class="div1 izquierda">';
					html = html + '<div class="listado1">'+ value.NombreCliente +'...</div>';
					html = html + '<div class="listado2">'+ value.Fecha +'</div>';
					html = html + '</div>';
					html = html + '<div class="div1 izquierda texto_derecha">';
					html = html + '<div class="listado1">$ '+ value.Total +'</div>';
					html = html + '<div class="listado2">'+ value.Estatus +'</div>';
					html = html + '</div>';
					html = html + '</a>';
					html = html + '</li>';
					$("#lvFacturas").append(html);
				});
					$("#lvFacturas").show();
					$("#lvFacturas").listview("refresh");
			}
			else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
			},
			 error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
			}
	});
}

function addProductosFacturas()
{
	var producto = $("#cbArticuloFactura").val();
	var descripcion = $("#tbDescripcionArticuloFactura").val();
	var cantidad = $("#tbCantidadFactura").val();
	var unidad = $("#tbUnidadFactura").val();
	var precio = $("#tbPrecioFactura").val();
	var importe = $("#tbImporteFactura").val();
	if(producto == "")
	{
		alert("Favor de seleccionar un producto");
		$("#cbArticuloFactura").focus();
	}else
	if(descripcion == "")
	{
		alert("Favor de capturar descripcion");
		$("#tbDescripcionFactura").focus();
	}else
	if(cantidad == "")
	{
		alert("Favor de capturar cantidad");
		$("#tbCantidadFactura").focus();
	}else
	if(unidad == "")
	{
		alert("Favor de capturar unidad");
		$("#tbUnidadFactura").focus();
	}else
	if(precio == "")
	{
		alert("Favor de capturar unidad");
		$("#tbPrecioFactura").focus();
	}else
	if(importe == "")
	{
		alert("Favor de capturar importe");
		$("#tbImportefactura").focus();
	}
	else{
		contadorProductos++;
		var html;
		html = '<li id="liProductosFactura'+contadorProductos+'">';
		html = html + '<div class="espacio1 limpiar"></div>';
		html = html + '<div class="div16 izquierda"><a class="bQuitar" href="" id="bQuitarProductoFactura'+contadorProductos+'" onclick="closeProductoFactura('+contadorProductos+')"></a></div>';
		html = html + '<div class="div15 izquierda">';
		html = html + '<select class="campo1 " data-role="none" id="cbArticuloFactura'+contadorProductos+'">';
			$.each(JSonProductos, function(index,value){
				html = html + '<option value=' + value.Empresa_Catalogo_ProductosID + '>'+ value.NoIdentificacion +'</option>';		
			});
		html = html + '</select>';		
		html = html + '</div>';
		html = html + '<div class="div11 izquierda"><a class="bEliminar" href="" id="bEliminarProductoFactura'+contadorProductos+'" onclick="eliminarProductoFactura('+contadorProductos+')"></a></div>';
		html = html + '<div class="espacio1 limpiar"></div>';
		html = html + '<div id="contenidoProducto'+ contadorProductos +'" class="Visible" >';
		html = html + '<div class="div3"><input type="text" name="tbDescripcion" value="'+ descripcion +'" placeholder=" Descripcion" data-role="none" class="campo9" id="tbDescripcionFactura'+contadorProductos+'"></input></div>';
		html = html + '<div class="div8 izquierda"><input type="text" name="tbCantidad" value="'+ cantidad +'" placeholder=" Cantidad" data-role="none" class="campo8" id="tbCantidadFactura'+contadorProductos+'" onChange="calculaImporte2('+contadorProductos+')"></input></div>';
		html = html + '<div class="div9 izquierda"><input type="text" name="tbUnidad" value="'+ unidad +'" placeholder=" Unidad" data-role="none" class="campo8" id="tbUnidadFactura'+contadorProductos+'"></input></div>';
		html = html + '<div class="div8 izquierda"><input type="text" name="Precio" value="'+ precio +'" placeholder=" Precio" data-role="none" class="campo8" id="tbPrecioFactura'+contadorProductos+'" onChange="calculaImporte2('+contadorProductos+')"></input></div>';
		html = html + '<div class="div1 izquierda"><input type="text" name="Importe" value="'+ importe +'" placeholder=" Importe" data-role="none" class="campo5 importe_azul" id="tbImporteFactura'+contadorProductos+'"></input></div>';
		html = html + '<div class="div1 izquierda"><input type="text" name="Impuestos" value="" placeholder=" Impuestos" data-role="none" class="campo4" id="tbImpuestosFactura'+contadorProductos+'"></input></div>';
		html = html + '</div>';
		html = html + '</li>';
		$("#ulProductosFactura").prepend(html);
		$("#cbArticuloFactura"+contadorProductos).val(producto);
		totalGeneralFacturas();
		/*Limpiamos los campos*/
		$("#cbArticuloFactura").val("");
		$("#tbDescripcionArticuloFactura").val("");
		$("#tbCantidadFactura").val("");
		$("#tbUnidadFactura").val("");
		$("#tbPrecioFactura").val("");
		$("#tbImporteFactura").val("");
	}
}

function closeProductoFactura(row){
	var x = $("#contenidoProducto"+row).attr("class");
	if(x == "NoVisible")
	{
		$("#contenidoProducto"+row).removeClass("NoVisible");	
		$("#contenidoProducto"+row).addClass("Visible");
	}
	else
	{
		$("#contenidoProducto"+row).removeClass("Visible");	
		$("#contenidoProducto"+row).addClass("NoVisible");
	}	
}

function selectArticulo(){
	var id = $("#cbArticuloFactura").val();
	var x = $("#tbCantidadFactura").val() != "" ? $("#tbCantidadFactura").val() : 0;
	/*Limpiamos los campos*/
	$("#tbDescripcionArticuloFactura").val("");
	$("#tbCantidadFactura").val("");
	$("#tbUnidadFactura").val("");
	$("#tbPrecioFactura").val("");
	$("#tbImporteFactura").val("");
	if(id != "" && id != "0")
	{
		$.each(JSonProductos, function(index,value){
			if (value.Empresa_Catalogo_ProductosID == id)
			{
				$("#tbDescripcionArticuloFactura").val(value.Producto);
				$("#tbUnidadFactura").val(value.Unidad);
				$("#tbPrecioFactura").val(value.Precio);
				$("#tbImportefactura").val( (x * value.Precio));
				return;
			}
		});
	}
	else
	if(id == "0")
	{
		limpiarNuevoProductoFactura();
		$("#pAgregarProducto").popup("open");
	}
}

function calculaImporte(){
	var x = $("#tbCantidadFactura").val() != "" ? $("#tbCantidadFactura").val() : 0;
	var y = $("#tbPrecioFactura").val() != "" ? $("#tbPrecioFactura").val() : 0;
	$("#tbImporteFactura").val( (x * y));
}

function calculaImporte2(id){
	var x = $("#tbCantidadFactura"+id).val() != "" ? $("#tbCantidadFactura"+id).val() : 0;
	var y = $("#tbPrecioFactura"+id).val() != "" ? $("#tbPrecioFactura"+id).val() : 0;
	$("#tbImporteFactura"+id).val( (x * y));
	totalGeneralFacturas();
}

function totalGeneralFacturas()
{
	var total = 0,descuento = 0, n;
	descuento = $("#tbDescuentoFactura").val() != "" ? $("#tbDescuentoFactura").val() : 0;
	$('#ulProductosFactura li').each(function(){
		n = this.id.replace("liProductosFactura","");
		total = total + $("#tbImporteFactura"+n).val() != "" ? $("#tbImporteFactura"+n).val() : 0;
	});
	//p(%) = (P / T) * 100
	if( total > 0)
	{
		descuento = (descuento / total) * 100;
		$("#divSubTotalFactura").text("$ "+total);
		$("#divDescuentoFactura").text("$ "+descuento);
		$("#divTotalFactura").text("$ "+(total - descuento));
	}
}

function eliminarProductoFactura(id){
	$("#liProductosFactura"+id).remove();
}

function descuentoFactura(){
	var descuento = $("#tbDescuentoFactura").val();
	if(descuento == "" || descuento == "0")
	{
		$("#dDescuentoFactura").val("");
		$("#dDescuentoFactura").removeClass("Visible");
		$("#dDescuentoFactura").addClass("NoVisible");
	}
	else
	{
		totalGeneralFacturas();
		$("#dDescuentoFactura").removeClass("NoVisible");
		$("#dDescuentoFactura").addClass("Visible");
	}
}

function mostrarFormaPago()
{
	var id = $("#cbFormaPagoFactura").val();
	if(id == 2)
	{
		$("#divDetalleFormaPagoFactura").removeClass("NoVisible");
		$("#divDetalleFormaPagoFactura").addClass("Visible");
	}
	else{
		$("#tbFormaPago1Factura").val("0");
		$("#tbFormaPago2Factura").val("");
		$("#divDetalleFormaPagoFactura").removeClass("Visible");
		$("#divDetalleFormaPagoFactura").addClass("NoVisible");
	}
}

function habilitaNumeroCuenta()
{
	var id = $("#cbMetodoPagoFactura").val();
	if(id !="" && id != "1" && id != "2")
	{
		$("#tbNoCuentaFactura").attr('readonly', false);
	}
	else
	{
		$("#tbNoCuentaFactura").val("");
		$("#tbNoCuentaFactura").attr('readonly', true);
	}
}

function limpiarNuevoProductoFactura()
{
	$("#tbNuevoArticuloFactura").val("");
	$("#tbDescripcionNuevoArticuloFactura").val("");
	$("#tbNuevaCantidadFactura").val("");
	$("#tbNuevaUnidadFactura").val("");
	$("#tbNuevoPrecioFactura").val("");
}
function saveNuevoProductoFactura(){
	var articulo = $("#tbNuevoArticuloFactura").val();
	var descripcion = $("#tbDescripcionNuevoArticuloFactura").val();
	var cantidad = $("#tbNuevaCantidadFactura").val() != "" ? $("#tbNuevaCantidadFactura").val() : 0;
	var unidad = $("#tbNuevaUnidadFactura").val();
	var precio = $("#tbNuevoPrecioFactura").val();
	if(articulo == "")
	{
		alert("Favor de capturar articulo");
		$("#tbNuevoArticuloFactura").focus();
	}else
	if(descripcion == "")
	{
		alert("Favor de capturar descripcion");
		$("#tbDescripcionNuevoArticuloFactura").focus();
	}else
	if(unidad == "")
	{
		alert("Favor de capturar unidad");
		$("#tbNuevaUnidadFactura").focus();
	}else
	if(precio == "")
	{
		alert("Favor de capturar precio");
		$("#tbNuevoPrecioFactura").focus();
	}
	else
	{
		var xml;
		xml = '&lt;NuevoArticulo&gt;';
		xml = xml + '&lt;EmpresaID&gt;'+EmpresaID+'&lt;/EmpresaID&gt;';
		xml = xml + '&lt;Articulo&gt;'+articulo+'&lt;/Articulo&gt;';
		xml = xml + '&lt;Descripcion&gt;'+descripcion+'&lt;/Descripcion&gt;';
		xml = xml + '&lt;Cantidad&gt;'+cantidad+'&lt;/Cantidad&gt;';
		xml = xml + '&lt;Unidad&gt;'+unidad+'&lt;/Unidad&gt;';
		xml = xml + '&lt;Precio&gt;'+precio+'&lt;/Precio&gt;';
		xml = xml + '&lt;/NuevoArticulo&gt;';
		
		$.ajax({
			cache: false,
			type: 'POST',
			async: false,
			//contentType: "text/xml; charset=utf-8",
			dataType: "xml",
			url:'http://eduardo-pc/app/Service1.asmx/saveNuevoArticulo',
			data: {"pXML" : xml},
			success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
				if(obj.Validacion == "true")
				{	
					if (obj.Estatus == "1")
					{
						if (cantidad > 0)
							$("#tbCantidadFactura").val(cantidad);
						$('#pAgregarProducto').popup("close");	
					}
					else
					{
						alert("El articulo ya existe");
					}
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				alert("Error: " + xhr.status +" | "+xhr.responseText);
			}
		});
	}
}

/*Clientes*/
function populateAllClientes()
{
Paginacion = 1;
var html;
	$.ajax({
			cache: false,
			type: 'post',
			async: false,
			dataType: 'xml',
			url:'http://eduardo-pc/app/Service1.asmx/getAllClientes',
			data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
			success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$.mobile.changePage("#pListaClientes");
				$.each(obj.Clientes, function(index,value){
				html= '<li data-icon="false"><a href="#" onclick="populatePerfil('+value.ClienteID+')"><div class="listado1">'+value.Nombre +'...</div><div class="listado2">'+ value.RFC +'</div></a></li>';
					$("#lvClientes").append(html);
				});
					$("#lvClientes").show();
					$("#lvClientes").listview("refresh");
			}
			else
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
			},
			error: function (e) {
			alert("Error: " + e.responseText);
			}
	});
}

function populatePerfil(pClienteID)
{
	//limpiamos campos
	$("#pcSaldo").text("$ 0.00");
	$("#pcNombre").text("");
	$("#pcRFC").text("");
	$("#pcDireccion1").text("");
	$("#pcDireccion2").text("");
	$("#pcTelefono").text("");
	$("#pcCorreo").text("");
	$.ajax({
		cache: false,
        type: 'POST',
        async: false,
		//contentType: "text/xml; charset=utf-8",
		dataType: "xml",
        url:'http://eduardo-pc/app/Service1.asmx/getPerfilCliente',
        data: {"pClienteID" : pClienteID},
        success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				ClienteID = pClienteID;
				$("#pcSaldo").text(obj.Saldo);
				$("#pcNombre").text(obj.Nombre);
				$("#pcRFC").text(obj.RFC);
				$("#pcDireccion1").text(obj.Direccion1);
				$("#pcDireccion2").text(obj.Direccion2);
				$("#pcTelefono").text(obj.Telefono);
				$("#pcCorreo").text(obj.Correo);
				$.mobile.changePage("#pPerfilClientes");
			}
			else
			{
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
			}
	    },
        error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
        }
	});
}

function populateCliente(pClienteID){
	var n = 1;
	limpiarPantallaCliente(false);
	$.ajax({
		cache: false,
        type: 'POST',
        async: false,
		//contentType: "text/xml; charset=utf-8",
		dataType: "xml",
        url:'http://eduardo-pc/app/Service1.asmx/getCliente',
        data: {"pClienteID":pClienteID},
        success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
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
				$.each(obj.Sucursales, function(index,value){
					addSucursal(false,value.NombreSucursal,value.Cliente_SucursalID);
					$("#tbNombreSucursal"+contadorSucursales).val(value.NombreSucursal);
					$("#tbCalleSucursal"+contadorSucursales).val(value.Calle);
					$("#tbColoniaSucursal"+contadorSucursales).val(value.Colonia);
					$("#tbPaisSucursal"+contadorSucursales).val(value.Pais);
					$("#tbNoExteriorSucursal"+contadorSucursales).val(value.NoExterior);
					$("#tbMunicipioSucursal"+contadorSucursales).val(value.Municipio);
					$("#tbEstadoSucursal"+contadorSucursales).val(value.Estado);
					$("#tbNoInteriorSucursal"+contadorSucursales).val(value.NoInterior);
					$("#tbCiudadSucursal"+contadorSucursales).val(value.Ciudad);
					$("#tbCPSucursal"+contadorSucursales).val(value.CodigoPostal);
					$("#tbReferenciaSucursal"+contadorSucursales).val(value.Referencia);
				});
				//Contactos
				$.each(obj.Contactos, function(index,value){
					
					if (n > 1)
					{	
						addContacto(value.AsignarUsuario == "1" ? true : false,value.Cliente_ContactosID);
						if (value.AsignarUsuario == "1")
						$("#chkAsignaUsuario"+contadorContactos).attr("checked","checked");
					}
					else{
						if (value.AsignarUsuario == "1")
						{
							$("#chkAsignaUsuario"+contadorContactos).attr("checked","checked");
							asignarUsuario(1);
						}
					}
					$("#tbUsuarioContactoCliente"+contadorContactos).val(value.Login);
					$("#tbContrasenaContactoCliente"+contadorContactos).val(value.Password);
					$("#tbRepetirContrasenaContactoCliente"+contadorContactos).val(value.Password);
					$("#tbNombreContactoCliente"+contadorContactos).val(value.Nombre);
					$("#tbTelefonoContactoCliente"+contadorContactos).val(value.Telefono);
					$("#tbCorreoContactoCliente"+contadorContactos).val(value.CorreoElectronico);
					$("#tbCliente_ContactosID"+contadorContactos).val(value.Cliente_ContactosID);
					n++;
				});
				//Otra Informacion
				$('#cbMetodoPago').val(obj.MetodoPago);
				selectFormaPago();
				$('#tbNoCuentaCliente').val(obj.UltimosDigitos);
				$('#tbNotaInterna').val(obj.NotaInterna);
				$.mobile.changePage("#pClientes");
			}
			else
			alert("A ocuurido un error, por favor verifique su conexion a internet.");
	    },
        error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
        }
	});
}

function deleteCliente(pClienteID)
{
	$.ajax({
		cache: false,
        type: 'POST',
        async: false,
		//contentType: "text/xml; charset=utf-8",
		dataType: "xml",
        url:'http://eduardo-pc/app/Service1.asmx/deleteCliente',
        data: {"pClienteID" : pClienteID},
        success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$('#lvClientes').children().remove('li');
				populateAllClientes();
			}
			else
			{
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
			}
	    },
        error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
        }
	});
}

function setInicioListaClientes()
{
	$('#lvClientes').children().remove('li');
	$.mobile.changePage("#pMenu");
}

function getMoreClientes()
{
Paginacion++;
var html;
	$.ajax({
			cache: false,
			type: 'post',
			async: false,
			dataType: 'xml',
			url:'http://eduardo-pc/app/Service1.asmx/getAllClientes',
			data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
			success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$.each(obj.Clientes, function(index,value){
				html= '<li data-icon="false"><a href="#" onclick="populateCliente('+value.ClienteID+')"><div class="listado1">'+value.Nombre +'...</div><div class="listado2">'+ value.RFC +'</div></a></li>';
					$("#lvClientes").append(html);
				});
					$("#lvClientes").show();
					$("#lvClientes").listview("refresh");
			}
			else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
			},
			 error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
			}
	});
}

function limpiarPantallaCliente(pEnviarPantalla){
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
	contacto =  '<div class="espacio2 limpiar"></div>';
	contacto =	contacto+ '<div class="div3"><input type="text" name="tbNombreContactoCliente" value="" maxlength="255" placeholder=" Nombre" data-role="none" class="campo9" id="tbNombreContactoCliente1"></input></div>';
	contacto =	contacto+ '<div class="div1 izquierda"><input type="text" name="tbTelefonoContactoCliente" value="" maxlength="20" placeholder=" Telefono" data-role="none" class="campo5" id="tbTelefonoContactoCliente1"></input></div>';
	contacto =	contacto+ '<div class="div1 izquierda"><input type="text" name="tbCorreoContactoCliente" value="" maxlength="255" placeholder=" Correo" data-role="none" class="campo4" id="tbCorreoContactoCliente1"></input></div>';
	contacto =	contacto+ '<div class="div3"><input type="checkbox" id = "chkAsignaUsuario1" value="" data-role="none" onClick="asignarUsuario(1)"/><label for = "chkAsignaUsuario1">Asignar usuario</label></div>';
	contacto =	contacto+ '<div id="dContactoUsuario1" class="NoVisible">';
	contacto =	contacto+ '<div class="div3"><input type="text" name="tbUsuarioContactoCliente" value="" maxlength="255" placeholder=" Usuario" data-role="none" class="campo9" id="tbUsuarioContactoCliente1"></input></div>';
	contacto =	contacto+ '<div class="div3"><input type="password" name="tbContrasenaContactoCliente" value="" maxlength="50" placeholder=" Contrasena" data-role="none" class="campo8" id="tbContrasenaContactoCliente1"></input></div>';
	contacto =	contacto+ '<div class="div3"><input type="password" name="tbRepetirContrasenaContactoCliente" value="" maxlength="50" placeholder=" Repita contrasena" data-role="none" class="campo10" id="tbRepetirContrasenaContactoCliente1"></input></div>';
	contacto =	contacto+ '<input id="tbCliente_ContactosID1" type="hidden" value="0"></input>'
	contacto =	contacto+ '</div>';
	$("#ulContactos").append('<li id="liContacto1">'+contacto+'</li>');
	$("#dOtraInformacion").removeClass("cabecera_seccion_up");	
	$("#dOtraInformacion").addClass("cabecera_seccion_down");	
	$("#dOtraInformacionContenido").removeClass("Visible");	
	$("#dOtraInformacionContenido").addClass("NoVisible");
	$("#dContacto").removeClass("cabecera_seccion_up");	
	$("#dContacto").addClass("cabecera_seccion_down");	
	$("#dContactoContenido").removeClass("Visible");	
	$("#dContactoContenido").addClass("NoVisible");	
	if (pEnviarPantalla == true)
		$.mobile.changePage("#pClientes");
}

function addSucursal(pVisible,pNombreSucursal,pCliente_SucursalID)
{
	contadorSucursales++;
	var sucursal;
	sucursal =  '<div class="espacio1 limpiar"></div>';
	if (pNombreSucursal == "")
		sucursal =	sucursal+ '<div id="dSucursal'+contadorSucursales+'" class="divSucursal texto_principal" onClick="closeSucursal('+contadorSucursales+')">Nueva Sucursal '+contadorSucursales+'</div>';
    else		
		sucursal =	sucursal+ '<div id="dSucursal'+contadorSucursales+'" class="divSucursal texto_principal" onClick="closeSucursal('+contadorSucursales+')">'+pNombreSucursal+'</div>';
	if (pVisible == true)
		sucursal =	sucursal+ '<div id="divSucursalContenido'+contadorSucursales+'" class="divSucursalContenido Visible">';
	else
		sucursal =	sucursal+ '<div id="divSucursalContenido'+contadorSucursales+'" class="divSucursalContenido NoVisible">';
	sucursal =	sucursal+ '<div class="div14 div_centro">';
	sucursal =	sucursal+ '<div class="texto_derecha"><a href="#" id="bQuitarSucursal'+contadorSucursales+'" class="bQuitar derecha" onClick="removeSucursal('+contadorSucursales+')"></a></div>';
	sucursal =	sucursal+ '<div class="div3"><input type="text" name="tbNombreSucursal" value="" maxlength="255" placeholder=" Nombre" data-role="none" class="campo9" id="tbNombreSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div8 izquierda"><input type="text" name="tbCalleSucursal" value="" maxlength="255" placeholder=" Calle" data-role="none" class="campo8" id="tbCalleSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div9 izquierda"><input type="text" name="tbColoniaSucursal" value="" maxlength="255" placeholder=" Colonia" data-role="none" class="campo8" id="tbColoniaSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div8 izquierda"><input type="text" name="tbPaisSucursal" value="" maxlength="255" placeholder=" Pais" data-role="none" class="campo8" id="tbPaisSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div11 izquierda"><input type="text" name="tbNoExteriorSucursal" value="" maxlength="30" placeholder=" No ext" data-role="none" class="campo8" id="tbNoExteriorSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div13 izquierda"><input type="text" name="tbMunicipioSucursal" value="" maxlength="255" placeholder=" Municipio" data-role="none" class="campo8" id="tbMunicipioSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div13 izquierda"><input type="text" name="tbEstadoSucursal" value="" maxlength="255" placeholder=" Estado" data-role="none" class="campo8" id="tbEstadoSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div11 izquierda"><input type="text" name="tbNoInteriorSucursal" value="" maxlength="30" placeholder=" No int" data-role="none" class="campo8" id="tbNoInteriorSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div12 izquierda"><input type="text" name="tbCiudadSucursal" value="" maxlength="50" placeholder=" Ciudad" data-role="none" class="campo8" id="tbCiudadSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div11 izquierda"><input type="text" name="tbCPSucursal" value="" maxlength="12" placeholder=" CP" data-role="none" class="campo8" id="tbCPSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<div class="div3"><input type="text" name="tbReferenciaSucursal" value="" maxlength="255" placeholder=" Referencia" data-role="none" class="campo10" id="tbReferenciaSucursal'+contadorSucursales+'"></input></div>';
	sucursal =	sucursal+ '<input id="tbCliente_SucursalID'+contadorSucursales+'" type="hidden" value="'+pCliente_SucursalID+'"></input>'
	sucursal =	sucursal+ '</div>';
	sucursal =	sucursal+ '</div>';
	$("#ulSucursales").append('<li id="liSucursal'+contadorSucursales+'">'+sucursal+'</li>');
}         

function removeSucursal(row){
	$("#liSucursal"+row).remove();
}

function closeSucursal(row){
	var x = $("#divSucursalContenido"+row).attr("class");
	x = x.replace("divSucursalContenido ","");
	if(x == "NoVisible")
	{
		$("#divSucursalContenido"+row).removeClass("NoVisible");	
		$("#divSucursalContenido"+row).addClass("Visible");
	}
	else
	{
		$("#divSucursalContenido"+row).removeClass("Visible");	
		$("#divSucursalContenido"+row).addClass("NoVisible");
	}
}

function selectFormaPago()
{
	var x = $("#cbMetodoPago").val();
	if(x != "" && x != "No identificado" && x != "Efectivo")
	{
		$("#dNoCuenta").removeClass("NoVisible");	
		$("#dNoCuenta").addClass("Visible");	
	}
	else
	{
		$("#tbNoCuentaCliente").val("");
		$("#dNoCuenta").removeClass("Visible");	
		$("#dNoCuenta").addClass("NoVisible");	
	}    
}      

function otraInformacion()
{
	var classNameCabecera = $("#dOtraInformacion").attr('class');
	var classNameContenido = $("#dOtraInformacionContenido").attr('class');
	//Cabecera
	if(classNameCabecera == "cabecera_seccion_down")
	{
		$("#dOtraInformacion").removeClass("cabecera_seccion_down");	
		$("#dOtraInformacion").addClass("cabecera_seccion_up");	
	}
	else
	{
		$("#dOtraInformacion").removeClass("cabecera_seccion_up");	
		$("#dOtraInformacion").addClass("cabecera_seccion_down");	
	}
	//Contenido
	if(classNameContenido == "NoVisible")
	{
		$("#dOtraInformacionContenido").removeClass("NoVisible");	
		$("#dOtraInformacionContenido").addClass("Visible");	
	}
	else
	{
		$("#dOtraInformacionContenido").removeClass("Visible");	
		$("#dOtraInformacionContenido").addClass("NoVisible");	
	}
}

function contacto()
{
	var classNameCabecera = $("#dContacto").attr('class');
	var classNameContenido = $("#dContactoContenido").attr('class');
	//Cabecera
	if(classNameCabecera == "cabecera_seccion_down")
	{
		$("#dContacto").removeClass("cabecera_seccion_down");	
		$("#dContacto").addClass("cabecera_seccion_up");	
	}
	else
	{
		$("#dContacto").removeClass("cabecera_seccion_up");	
		$("#dContacto").addClass("cabecera_seccion_down");	
	}
	//Contenido
	if(classNameContenido == "NoVisible")
	{
		$("#dContactoContenido").removeClass("NoVisible");	
		$("#dContactoContenido").addClass("Visible");	
	}
	else
	{
		$("#dContactoContenido").removeClass("Visible");	
		$("#dContactoContenido").addClass("NoVisible");	
	}
}

function removeContacto(row){
	$("#liContacto"+row).remove();
}

function asignarUsuario(row)
{
	var x = $("#chkAsignaUsuario"+row).is(':checked')
	if(x == true)
	{
		$("#dContactoUsuario"+row).removeClass("NoVisible");	
		$("#dContactoUsuario"+row).addClass("Visible");	
	}
	else
	{
		$("#tbUsuarioContactoCliente"+row).val("");
		$("#tbContrasenaContactoCliente"+row).val("");
		$("#tbRepetirContrasenaContactoCliente"+row).val("");
		$("#dContactoUsuario"+row).removeClass("Visible");	
		$("#dContactoUsuario"+row).addClass("NoVisible");	
	}
}

function addContacto(pVisible,pCliente_ContactosID)
{
	contadorContactos++;
	var contacto;
	contacto =  '<div class="espacio2 limpiar"></div>';
	contacto =	contacto+ '<div class="div3"><a href="#" id="bQuitarContacto1" class="bQuitar derecha" onClick="removeContacto('+contadorContactos+')"></a></div>';
	contacto =	contacto+ '<div class="div3"><input type="text" name="tbNombreContactoCliente" value="" maxlength="255" placeholder=" Nombre" data-role="none" class="campo9" id="tbNombreContactoCliente'+contadorContactos+'"></input></div>';
	contacto =	contacto+ '<div class="div1 izquierda"><input type="text" name="tbTelefonoContactoCliente" value="" maxlength="20" placeholder=" Telefono" data-role="none" class="campo5" id="tbTelefonoContactoCliente'+contadorContactos+'"></input></div>';
	contacto =	contacto+ '<div class="div1 izquierda"><input type="text" name="tbCorreoContactoCliente" value="" maxlength="255" placeholder=" Correo" data-role="none" class="campo4" id="tbCorreoContactoCliente'+contadorContactos+'"></input></div>';
	contacto =	contacto+ '<div class="div3"><input type="checkbox" id = "chkAsignaUsuario'+contadorContactos+'" value="" data-role="none" onClick="asignarUsuario('+contadorContactos+')"/><label for = "chkAsignaUsuario'+contadorContactos+'">Asignar usuario</label></div>';
	if (pVisible == true)
		contacto =	contacto+ '<div id="dContactoUsuario'+contadorContactos+'" class="Visible">';
	else
		contacto =	contacto+ '<div id="dContactoUsuario'+contadorContactos+'" class="NoVisible">';
	contacto =	contacto+ '<div class="div3"><input type="text" name="tbUsuarioContactoCliente" value="" maxlength="255" placeholder=" Usuario" data-role="none" class="campo9" id="tbUsuarioContactoCliente'+contadorContactos+'"></input></div>';
	contacto =	contacto+ '<div class="div3"><input type="password" name="tbContrasenaContactoCliente" value="" maxlength="50" placeholder=" Contrasena" data-role="none" class="campo8" id="tbContrasenaContactoCliente'+contadorContactos+'"></input></div>';
	contacto =	contacto+ '<div class="div3"><input type="password" name="tbRepetirContrasenaContactoCliente" value="" maxlength="50" placeholder=" Repita contrasena" data-role="none" class="campo10" id="tbRepetirContrasenaContactoCliente'+contadorContactos+'"></input></div>';
	contacto =	contacto+ '<input id="tbCliente_ContactosID'+contadorContactos+'" type="hidden" value="'+pCliente_ContactosID+'"></input>'
	contacto =	contacto+ '</div>';
	$("#ulContactos").append('<li id="liContacto'+contadorContactos+'">'+contacto+'</li>');
}

function validaCliente()
{
 var n;
 var resultado = true;
 var email,pass1,pass2,isUsuario;
 var contactos;
 var RegExpEmail = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
 var RegExpRFC = /^[a-zA-Z]{3,4}(\d{6})((\D|\d){3})?$/;
  if($("#tbNombreCliente").val() == ""){
	  $("#tbNombreCliente").focus(); 
	  alert("Requiere nombre del cliente");
	  resultado =  false;
  }
  else
  if($("#tbRFCCliente").val() == ""){
	  $("#tbRFCCliente").focus(); 
	  alert("Requiere RFC");
	  resultado =  false;
	}
	else
	if(resultado)
	{
		if(!($("#tbRFCCliente").val()).match(RegExpRFC))
			{
				alert("RFC con formato incorrecto");
				resultado = false
			}
			else
			{
				//ValidaSucursales
				$('#ulSucursales li').each(function(){
					n = this.id.replace("liSucursal","");
					if($("#tbNombreSucursal"+n).val() == "")
					{
						$("#tbNombreSucursal"+n).focus();
						alert("Requiere nombre de sucursal.");
						resultado = false;
						return false;
					}
				});
				//Validar Formatos de correos
				$('#ulContactos li').each(function(){
					email = "";
					n = this.id.replace("liContacto","");
					//Valida email
					email = $("#tbCorreoContactoCliente"+n).val();
					if(email != "")
					{
						if(!email.match(RegExpEmail))
						{
							$("#tbCorreoContactoCliente"+n).focus();
							alert("Formato incorrecto en el correo del contacto");
							resultado = false;
							return false;
						}
					}
					//Valida Usuarios
					if($("#chkAsignaUsuario"+n).is(':checked'))
					{
						if($("#tbUsuarioContactoCliente"+n).val() == "" || $("#tbContrasenaContactoCliente"+n).val() == "" || $("#tbRepetirContrasenaContactoCliente"+n).val() == "")
						{
							if($("#tbUsuarioContactoCliente"+n).val() == "")
								$("#tbUsuarioContactoCliente"+n).focus();
							else
							if($("#tbContrasenaContactoCliente"+n).val() == "")
								$("#tbContrasenaContactoCliente"+n).focus();
							else
							if($("#tbRepetirContrasenaContactoCliente"+n).val() == "")
								$("#tbRepetirContrasenaContactoCliente"+n).focus();
							alert("Requiere datos de usuario del contacto");
							resultado = false;
							return false;
						}
						else
						{
							if(!($("#tbContrasenaContactoCliente"+n).val() === $("#tbRepetirContrasenaContactoCliente"+n).val()))
							{
								$("#tbContrasenaContactoCliente"+n).focus();
								alert("Verifique la contrasena de los contactos");
								resultado = false;
								return false;
							}
						}
					}
				});
			}
	}
	if(	$('#cbMetodoPago').val() == "")
	{
		alert("Debe seleccionar un metodo de pago(Otra informacion)");
		resultado = false;
	}
	//Validar Usuario Cliente
	if (resultado == true)
	{
		contactos = '&lt;Clientes&gt;';
		contactos = contactos + '&lt;Contactos&gt;';
		$('#ulContactos li').each(function(){
			n = this.id.replace("liContacto","");
			contactos = contactos + '&lt;Contacto ';
			contactos = contactos + 'Cliente_ContactosID="'+$("#tbCliente_ContactosID"+n).val()+'" ';
			contactos = contactos + 'Login="'+$("#tbUsuarioContactoCliente"+n).val()+'" &gt;';
			contactos = contactos + '&lt;/Contacto&gt; ';
		});
		contactos = contactos + '&lt;/Contactos&gt;';
		contactos = contactos + '&lt;/Clientes&gt;';
		$.ajax({
			cache: false,
			type: 'post',
			async: false,
			dataType: 'xml',
			url:'http://eduardo-pc/app/Service1.asmx/validateUsuarioCliente',
			data: {"xml" : contactos },
			success: function (xml) {
				var r = $(xml).text();
				var obj = jQuery.parseJSON(r);
				if(obj.Validacion == "false")
				{	
					resultado = false;
					alert(obj.Error);
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				resultado = false;
				alert("Error: " + xhr.status +" | "+xhr.responseText);
			}
		});
	}
	return resultado;
}

function insertCliente()
{
	if(validaCliente())
	{
		var n;
		var json;
		var xml;
		xml = '&lt;Cliente&gt;';
		xml = xml + '&lt;EmpresaID&gt;'+EmpresaID+'&lt;/EmpresaID&gt;';
		xml = xml + '&lt;ClienteID&gt;'+ClienteID+'&lt;/ClienteID&gt;';
		xml = xml + '&lt;Nombre&gt;'+$("#tbNombreCliente").val()+'&lt;/Nombre&gt;';
		xml = xml + '&lt;RFC&gt;'+$("#tbRFCCliente").val()+'&lt;/RFC&gt;';
		xml = xml + '&lt;NombreComercial&gt;'+$("#tbNombreComercialCliente").val()+'&lt;/NombreComercial&gt;';
		xml = xml + '&lt;Calle&gt;'+$("#tbCalleCliente").val()+'&lt;/Calle&gt;';
		xml = xml + '&lt;Colonia&gt;'+$("#tbColoniaCliente").val()+'&lt;/Colonia&gt;';
		xml = xml + '&lt;Municipio&gt;'+$("#tbMunicipioCliente").val()+'&lt;/Municipio&gt;';
		xml = xml + '&lt;Estado&gt;'+$("#tbEstadoCliente").val()+'&lt;/Estado&gt;';
		xml = xml + '&lt;Pais&gt;'+$("#tbPaisCliente").val()+'&lt;/Pais&gt;';
		xml = xml + '&lt;NoExterior&gt;'+$("#tbNoExteriorCliente").val()+'&lt;/NoExterior&gt;';
		xml = xml + '&lt;NoInterior&gt;'+$("#tbNoInteriorCliente").val()+'&lt;/NoInterior&gt;';
		xml = xml + '&lt;Localidad&gt;'+$("#tbCiudadCliente").val()+'&lt;/Localidad&gt;';
		xml = xml + '&lt;CodigoPostal&gt;'+$("#tbCPCliente").val()+'&lt;/CodigoPostal&gt;';
		xml = xml + '&lt;MetodoPago&gt;'+$("#cbMetodoPago").val()+'&lt;/MetodoPago&gt;';
		xml = xml + '&lt;UltimosDigitos&gt;'+$("#tbNoCuentaCliente").val()+'&lt;/UltimosDigitos&gt;';
		xml = xml + '&lt;NotaInterna&gt;'+$("#tbNotaInterna").val()+'&lt;/NotaInterna&gt;';
		/*Sucursales*/
		xml = xml + '&lt;Sucursales&gt;';
		$('#ulSucursales li').each(function(){
			n = this.id.replace("liSucursal","");
			xml = xml + '&lt;Sucursal ';
			xml = xml + 'Cliente_SucursalID="'+$("#tbCliente_SucursalID"+n).val()+'" ';
			xml = xml + 'ClienteId="'+ClienteID+'" ';
			xml = xml + 'Nombre="'+$("#tbNombreSucursal"+n).val()+'" ';
			xml = xml + 'Calle="'+$("#tbCalleSucursal"+n).val()+'" ';
			xml = xml + 'Colonia="'+$("#tbColoniaSucursal"+n).val()+'" ';
			xml = xml + 'Pais="'+$("#tbPaisSucursal"+n).val()+'" ';
			xml = xml + 'NoExterior="'+$("#tbNoExteriorSucursal"+n).val()+'" ';
			xml = xml + 'Municipio="'+$("#tbMunicipioSucursal"+n).val()+'" ';
			xml = xml + 'Estado="'+$("#tbEstadoSucursal"+n).val()+'" ';
			xml = xml + 'NoInterior="'+$("#tbNoInteriorSucursal"+n).val()+'" ';
			xml = xml + 'Ciudad="'+$("#tbCiudadSucursal"+n).val()+'" ';
			xml = xml + 'CodigoPostal="'+$("#tbCPSucursal"+n).val()+'" ';
			xml = xml + 'Referencia="'+$("#tbReferenciaSucursal"+n).val()+'" &gt;';
			xml = xml + '&lt;/Sucursal&gt;';
		});
		xml = xml + '&lt;/Sucursales&gt;';
		/*Contactos*/
		xml = xml + '&lt;Contactos&gt;';
		$('#ulContactos li').each(function(){
			n = this.id.replace("liContacto","");
			xml = xml + '&lt;Contacto ';
			xml = xml + 'Cliente_ContactosID="'+$("#tbCliente_ContactosID").val()+'" ';
			xml = xml + 'ClienteID="'+ClienteID+'" ';
			xml = xml + 'AsignarUsuario="'+$("#chkAsignaUsuario"+n).is(':checked')+'" ';
			xml = xml + 'Login="'+$("#tbUsuarioContactoCliente"+n).val()+'" ';
			xml = xml + 'Password="'+$("#tbContrasenaContactoCliente"+n).val()+'" ';
			xml = xml + 'Nombre="'+$("#tbNombreContactoCliente"+n).val()+'" ';
			xml = xml + 'Telefono="'+$("#tbTelefonoContactoCliente"+n).val()+'" ';
			xml = xml + 'CorreoElectronico="'+$("#tbCorreoContactoCliente"+n).val()+'" &gt;';
			xml = xml + '&lt;/Contacto&gt; ';
		});
		xml = xml + '&lt;/Contactos&gt;';
		xml = xml + '&lt;/Cliente&gt;';
		
		$.ajax({
			cache: false,
			type: 'post',
			async: false,
			dataType: 'xml',
			url:'http://eduardo-pc/app/Service1.asmx/saveClientes',
			data: {"xml" : xml},
			success: function (xml) {
				var r = $(xml).text();
				var obj = jQuery.parseJSON(r);
				if(obj.Validacion == "true")
				{	
					$.mobile.changePage("#pListaClientes");
				}
				else
				{
					alert("A ocuurido un error, por favor verifique su conexion a internet.");
				}
			},
			 error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
			}
		});
	}
}

///////////////////////////////////////////////////////////     GASTOS     ////////////////////////////////////////////////////////////////////////////
function populateAllGastos()
{
Paginacion = 1;
TotalGastos = 0;
var html;
	$.ajax({
			cache:false,
			type: 'post',
			async:false,
			dataType:'xml',
			url:'http://eduardo-pc/app/Service1.asmx/getAllGastos',
			data:{"EmpresaID":EmpresaID,"Paginacion":Paginacion},
			success: function (json){
			var r = $(json).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true"){
				$.mobile.changePage("#pListaGastos");
				
				$.each(obj.Gastos, function(index,value){
				html='<li data-icon="false"><a href="#" onclick="populateGasto('+value.GastosID+')"><div class="listado1 izquierda">Gastos fijos</div><div class="listado1 derecha">$ '+value.Monto+'</div><div class="espacio limpiar"></div><div class="listado2 izquierda">'+value.Descripcion+
				'</div><div class="listado2 div_centro">'+value.Fecha+'</div></a></li>';
				$('#lvGastos').append(html);
				TotalGastos = TotalGastos + parseFloat(value.Monto);
				});
				
				$('#gTotal').text("$ "+Math.round(parseFloat(TotalGastos)*100)/100);
				$('#lvGastos').show();
				$('#lvGastos').listview("refresh");
			}
			else
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
			},
			error:function(e){
				alert("Error: "+e.responseText);
			}
	});
}

function setInicioListaGastos()
{
	$('#lvGastos').children().remove('li');
	$.mobile.changePage("#pMenu");
}

function getMoreGastos()
{
Paginacion++;
var html;
	$.ajax({
			cache:false,
			type: 'post',
			async:false,
			dataType:'xml',
			url:'http://eduardo-pc/app/Service1.asmx/getAllGastos',
			data:{"EmpresaID":EmpresaID,"Paginacion":Paginacion},
			success: function (xml){
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true"){
				$.mobile.changePage("#pListaGastos");
				
				$.each(obj.Gastos, function(index,value){
				html='<li data-icon="false"><a href="#" onclick="populateGasto('+value.GastosID+')"><div class="listado1 izquierda">Gastos fijos</div><div class="listado1 derecha">$ '+value.Monto+'</div><div class="espacio limpiar"></div><div class="listado2 izquierda">'+value.Descripcion+
				'</div><div class="listado2 div_centro">'+value.Fecha+'</div></a></li>';
				$('#lvGastos').append(html);
				TotalGastos = TotalGastos + parseFloat(value.Monto);
				});
				
				$('#gTotal').text("$ "+Math.round(parseFloat(TotalGastos)*100)/100);
				$('#lvGastos').show();
				$('#lvGastos').listview("refresh");
			}
			else
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
			},
			error:function(e){
				alert("Error: "+e.responseText);
			}
	});
}

function limpiarPantallaGastos(pEnviarPantalla){
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

function insertGasto(){
	var n;
	var xml;
	xml = '&lt;Gasto&gt;';
	xml = xml + '&lt;EmpresaID&gt;'+EmpresaID+'&lt;/EmpresaID&gt;';
	xml = xml + '&lt;GastoID&gt;'+GastoID+'&lt;/ClienteID&gt;';
	xml = xml + '&lt;Fecha&gt;'+$("#tbFechaGasto").val()+'&lt;/Fecha&gt;';
	xml = xml + '&lt;Proveedor&gt;'+$("#tbProveedorGasto").val()+'&lt;/Proveedor&gt;';
	xml = xml + '&lt;Categoria&gt;'+$("#tbCategoriaGasto").val()+'&lt;/Categoria&gt;';
	xml = xml + '&lt;Descripcion&gt;'+$("#tbDescripcionGasto").val()+'&lt;/Descripcion&gt;';
	xml = xml + '&lt;Impuesto&gt;'+$("#cbImpuestosGasto option:selected").val()+'&lt;/Impuesto&gt;';
	xml = xml + '&lt;/Gasto&gt;';
	
	$.ajax({
		cache: false,
		type: 'post',
		async: false,
		dataType: 'xml',
		url:'http://eduardo-pc/app/Service1.asmx/saveGastos',
		data: {"xml" : xml},
		success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$.mobile.changePage("#pListaGastos");
			}
			else
			{
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
			}
		},
		 error: function (xhr, ajaxOptions, thrownError) {
		alert("Error: " + xhr.status +" | "+xhr.responseText);
		}
	});
}

function populateGasto(pGastoID){
	var html;
	limpiarPantallaGastos(false);
	insertarImpuestos("cbImpuestosGasto");
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		url : 'http://eduardo-pc/app/Service1.asmx/getGasto',
		data : {'pGastoID':pGastoID},
		success : function(xml){
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion =="true"){
				GastosID = obj.GastosID;
				$("#tbMontoGasto").val(obj.Monto);
				$("#tbFechaGasto").val(obj.Fecha);
				$("#tbProveedorGasto").val(obj.Proveedor);
				$("#tbCategoriaGasto").val(obj.Categoria);
				$("#tbDescripcionGasto").val(obj.Descripcion);
				$("#cbImpuestosGasto").val(obj.Impuesto);

				$.mobile.changePage("#pGastos");
			}
			else
				alert("A ocurrido un error, por favor verfique su conexion a internet.");
		},
		error : function(e){
			alert("Error: "+e.responseText);
		}
	});
}

////////////////////////////////////////////////////////       METODOS GENERALES         ////////////////////////////////////////////////////
function cargarImpuestos(){
	var html;
	$.ajax({
		cache : false,
		type : 'post',
		async : false,
		dataType : 'xml',
		url : 'http://eduardo-pc/app/Service1.asmx/getImpuestos',
		data : {'pEmpresaID' : EmpresaID},
		success: function(xml){
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion=="true"){
				ImpuestosJSON = obj;
			}
			else
				alert("A ocurrido un error, por favor verifique su conexion a internet.");
		},
		error:function(e){
			alert("Error: "+e.responseText);
		}
	});
}

function insertarImpuestos(id){
	var html;
	$.each(ImpuestosJSON.Impuestos, function(index,value){
		html='<option value="'+value.ImpuestosID+'">'+value.Nombre+' '+((parseFloat(value.Tasa*100)*100)/100)+'%</option>';
		$('#'+id).append(html);
	});
}
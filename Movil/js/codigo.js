/*Variables*/
var EmpresaID = 0;
var ClienteID = 0;
var Login = "";
var Paginacion = 1;
/*Variables pantalla clientes*/
var contadorSucursales = 0;
var contadorContactos = 0;
/*Login*/
function autentifica(){
$.ajax({
		cache: false,
        type: 'POST',
        async: false,
		//contentType: "text/xml; charset=utf-8",
		dataType: "xml",
        url:'http://192.168.0.102/app/Service1.asmx/Login',
        data: {"sUsuario":$("#tbUsuario").val(),"sContrasena":$("#tbContrasena").val()},
        success: function (xml) {
		var r = $(xml).text();
		var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				EmpresaID = obj.EmpresaID;
				Login = obj.Login;
				$.mobile.changePage("#pMenu");
			}
			else
			{
				alert("Usuario o contraseña incorrecta(s)");
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
	$("#tbCodigoPostal").val("");
}

function populateConfiguracion()
{
limpiarConfiguracion();
$.ajax({
		cache: false,
        type: 'post',
        async: false,
        dataType: "xml",
        url:'http://192.168.0.102/app/Service1.asmx/getEmpresa',
        data: {"EmpresaID" : EmpresaID},
        success: function (xml) {
		var r = $(xml).text();
		var obj = jQuery.parseJSON(r);
		if(obj.Validacion == "true")
		{	
			$("#tbRazonSocial").val(obj.RazonSocial);
			$("#tbRFC").val(obj.RFC);
			$("#tbCalle").val(obj.Calle);
			$("#tbNumExt").val(obj.NoExterior);
			$("#tbNumInt").val(obj.NoInterior);
			$("#tbColonia").val(obj.Colonia);
			$("#tbCiudad").val(obj.Localidad);
			$("#tbReferencias").val(obj.Referencia);
			$("#tbMunicipio").val(obj.Municipio);
			$("#tbEstado").val(obj.Estado);
			$("#tbPais").val(obj.Pais);
			$("#tbCodigoPostal").val(obj.CodigoPostal);
			$.mobile.changePage("#pConfiguracion");
		}
		else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
		},
         error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
        }
});
}

function updateConfiguracion(){
var Json;
Json = '{"EmpresaID" : "'+EmpresaID+'",';
Json = Json + '"RazonSocial" : "'+$("#tbRazonSocial").val()+'",';
Json = Json + '"RFC" : "'+$("#tbRFC").val()+'",';
Json = Json + '"Calle" : "'+$("#tbCalle").val()+'",';
Json = Json + '"NoExterior" : "'+$("#tbNumExt").val()+'",';
Json = Json + '"NoInterior" : "'+$("#tbNumInt").val()+'",';
Json = Json + '"Colonia" : "'+$("#tbColonia").val()+'",';
Json = Json + '"Localidad" : "'+$("#tbCiudad").val()+'",';
Json = Json + '"Referencia" : "'+$("#tbReferencias").val()+'",';
Json = Json + '"Municipio" : "'+$("#tbMunicipio").val()+'",';
Json = Json + '"Estado" : "'+$("#tbEstado").val()+'",';
Json = Json + '"Pais" : "'+$("#tbPais").val()+'",';
Json = Json + '"CodigoPostal" : "'+$("#tbCodigoPostal").val()+'"}';
	$.ajax({
			cache: false,
			type: 'post',
			async: false,
			dataType: 'xml',
			url:'http://192.168.0.102/app/Service1.asmx/updateEmpresa',
			data: {"jSon" : Json },
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
			url:'http://192.168.0.102/app/Service1.asmx/getAllClientes',
			data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
			success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$.mobile.changePage("#pListaClientes");
				$.each(obj.Clientes, function(index,value){
				html= '<li data-icon="false"><a href="#" onclick="populatePerfil('+value.ClienteID+')"><div class="listado1">'+value.Nombre +'...</div><div class="listado2">'+ value.RFC +'</div></a></li>'
					$("#lvClientes").append(html);
				});
					$("#lvClientes").show();
					$("#lvClientes").listview("refresh");
			}
			else
				alert("A ocuurido un error, por favor verifique su conexion a internet.");
			},
			error: function (e) {
			alert("Error: " + e.responseText);
			}
	});
}

function populatePerfil(pClienteID)
{
	$.mobile.changePage("#pPerfilClientes");
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
        url:'http://192.168.0.102/app/Service1.asmx/getCliente',
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
			}
			else
			alert("Usuario o contraseña incorrecta(s)");
	    },
        error: function (xhr, ajaxOptions, thrownError) {
			alert("Error: " + xhr.status +" | "+xhr.responseText);
        }
	});
	$.mobile.changePage("#pClientes");
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
			url:'http://192.168.0.102/app/Service1.asmx/getAllClientes',
			data: {"EmpresaID" : EmpresaID ,"Pagina" : Paginacion },
			success: function (xml) {
			var r = $(xml).text();
			var obj = jQuery.parseJSON(r);
			if(obj.Validacion == "true")
			{	
				$.each(obj.Clientes, function(index,value){
				html= '<li data-icon="false"><a href="#" onclick="populateCliente('+value.ClienteID+')><div class="listado1">'+value.Nombre +'...</div><div class="listado2">'+ value.RFC +'</div></a></li>'
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
			url:'http://192.168.0.102/app/Service1.asmx/validateUsuarioCliente',
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
			url:'http://192.168.0.102/app/Service1.asmx/saveClientes',
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
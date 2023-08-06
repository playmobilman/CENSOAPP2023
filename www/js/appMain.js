import APIClient from './apiClient.js';
const client = new APIClient("https://censo.develotion.com/");

/*--------- UI REFS ---------*/
const LOGIN_PAGE = document.querySelector("#login-screen");
const HOME_PAGE = document.querySelector("#app-screen");
const CENSUS_TAKER_REGISTER_PAGE = document.querySelector('#census-taker-register-screen');
const FIELD_USERNAME = document.querySelector("#txtCensusUser");
const FIELD_PASSWORD = document.querySelector("#txtCensusPassword");
const HOME_NAV = document.querySelector('#home-nav');
const REGISTER_NAV = document.querySelector('#register-nav');

/*--------- MAP ---------*/ 
let long;
let lat;
let map;
let currentKMCoverageThreshold;

function setOrigin(position) {
    
    // Bind km. radius selector
    const KM_RADIUS_SELECTOR = document.querySelector('#mapKmRadius');
    KM_RADIUS_SELECTOR.selectedIndex = 0;
    if (KM_RADIUS_SELECTOR) KM_RADIUS_SELECTOR.addEventListener('change', (evt) => {
        let KMRadiusThreshold = evt.target.value;
        showSurroundingCensusData(KMRadiusThreshold);
    });

    lat = position.coords.latitude;
    long = position.coords.longitude;
    
    if (map) {
        map.remove();
    }

    var centerIcon = L.divIcon({ className: 'center-marker-icon' });
    map = L.map('mapa').setView([lat, long], 13);
    map.enableHighAccuracy = true;
    L.marker([lat, long], {icon: centerIcon}).addTo(map);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);
    setTimeout(function () {
        window.dispatchEvent(new Event('resize'));
    }, 1000);
}

async function showSurroundingCensusData(kmThreshold) {
    let myMapCenter = L.latLng(lat, long);
    let cityCenter;
    let citiesResult;
    //let currentKMCoverageThreshold;
    let mapLoadingIndicator = document.querySelector('#map-loading-indicator');

    if (currentKMCoverageThreshold) {
        map.removeLayer(currentKMCoverageThreshold);
    }
    currentKMCoverageThreshold = L.circle(myMapCenter, {radius: kmThreshold*1000}).addTo(map);

    try {
        citiesResult = await getCitiesList();
        if (citiesResult.ciudades.length > 0) {
            mapLoadingIndicator.classList.remove('ion-hide');
            for(let city of citiesResult.ciudades) {
                cityCenter = L.latLng(city.latitud, city.longitud);
                if (map.distance(myMapCenter, cityCenter) < (kmThreshold*1000)) {
                    let personsCount = await getRegisteredPersonsByCity(city.id)
                    if (personsCount >= 1) {
                        let cityMarker = L.marker([city.latitud, city.longitud]).addTo(map);
                        cityMarker.bindPopup(`<b>Ciudad: ${city.nombre}</b><p>Cantidad de personas censadas: ${personsCount}</p>`).openPopup();
                    }
                }
            }
            mapLoadingIndicator.classList.add('ion-hide');
            map.setZoom(9);
        }
    } catch(error) {
        showToastResult(error.message, 3000);
    }
}

async function getRegisteredPersonsByCity(cityId) {
    let persons = await getPersonsList();
    return persons.personas.filter((p) => p.ciudad === cityId).length;
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            showToastResult('Los servicios de ubicación han sido denegados', 3000);
            break;
        case error.POSITION_UNAVAILABLE:
            showToastResult('Los servicios de ubicación no están disponibles.');
            break;
        case error.TIMEOUT:
            showToastResult('La solicitud de posicionamiento ha caducado.');
            break;
        case error.UNKNOWN_ERROR:
            showToastResult('Ha ocurrido un error inesperado.');
            break;
    }
}


function clearFields() {

    let inputs = document.querySelectorAll('input[type="email"], input[type="text"], input[type="password"]');

    inputs.forEach(element => {
        element.value = "";
    });
}

function hideScreens() {
    document.querySelectorAll('.ion-page').forEach(element => {
        element.classList.add('ion-hide');
    });
    //LOGIN_PAGE.className = 'ion-hide';
    //HOME_PAGE.className = 'ion-hide';
}

function switchActiveTab(targetTabName) {
    if (!targetTabName) {
        console.error('Especifica un nombre de tab válido.');
        return;
    }

    let targetTab = document.querySelector(`ion-tab-button[tab="${targetTabName}"]`);

    // Chequear si el tab elegido existe.
    if (!targetTab) {
        console.error(`No se encuentra el tab con el nombre "${tabName}".`);
        return;
    }

    let clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    targetTab.dispatchEvent(clickEvent);
}

function StartApp() {
    const LOGIN_BUTTON = document.querySelector('#btnLogin');
    if (LOGIN_BUTTON) LOGIN_BUTTON.addEventListener('click', LogIn);

    let logoutButtons = document.querySelectorAll('.btn-logout');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', LogOut);
    });
    
    const REGISTER_CENSUS_TAKER_BUTTON = document.querySelector('#btnCensusRegister');
    if (REGISTER_CENSUS_TAKER_BUTTON) REGISTER_CENSUS_TAKER_BUTTON.addEventListener('click', RegisterCensusTaker);

    const REGISTER_BUTTON = document.querySelector('#btn-register');
    if (REGISTER_BUTTON) REGISTER_BUTTON.addEventListener('click', RegisterUser);

    const REGISTER_CENSUS_PERSON_BUTTON = document.querySelector('#btn-register-census-person');
    if (REGISTER_CENSUS_PERSON_BUTTON) REGISTER_CENSUS_PERSON_BUTTON.addEventListener('click', RegisterPerson);

    //loadDepartments();
    //loadCities();
    //getOccupations();

    bindNavigationTabs();

    //hideScreens();
    if (localStorage.getItem('censo-user-token') !== null) {
        LOGIN_PAGE.className = 'ion-hide';
        HOME_PAGE.className = '';
        HOME_PAGE.className = 'ion-page';
        switchActiveTab('home-page');
    } else {
        LOGIN_PAGE.className = 'ion-page';
        HOME_PAGE.className = '';
        HOME_PAGE.className = 'ion-hide';
        //ROUTER.push('/login');
    }
}

function LogIn() {
    const USERNAME = document.querySelector("#txtCensusUser").value;
    const PASSWORD = document.querySelector("#txtCensusPassword").value;

    if (USERNAME === "" || PASSWORD === "") {
        showAlert({
            header: "Espera!",
            subHeader: "Error",
            message: "Los datos de acceso son obligatorios!"
        });
        return;
    } else {
        client.post('/login.php', {
            usuario: USERNAME,
            password: PASSWORD
        }).then(data => {
            localStorage.setItem('censo-user-token', data.apiKey);
            localStorage.setItem('censo-user-id', data.id);
            
            LOGIN_PAGE.className = 'ion-hide';
            HOME_PAGE.className = 'ion-page';

            // DELEGAR A UNA FUNCION QUE ESCUCHE TODAS LAS INTERACCIONES CON EL TAB BAR PRINCIPAL
            bindNavigationTabs();
            switchActiveTab('home-page');
        })
        .catch(error => {
            clearFields();
            showToastResult(error.message, 3000);
        });
    }
}

// CARGA LOS DEPARTAMENTOS EN EL COMBO DE DEPARTAMENTOS
function loadDepartments() {
    let slDepartments = document.querySelector('#slUserDepartment');
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');
    client.get('/departamentos.php', {
        apikey: apiKey,
        iduser: idUser
    }).then(data => {
        console.log(data.departamentos);
        let departmentOptions = data.departamentos.map(opt => `<option value="${opt.id}">${opt.nombre}</option>`).join('');
        slDepartments.innerHTML = departmentOptions;
        slDepartments.addEventListener('change', (evt) => {
            let selectedDeptId = evt.target.value;
            loadCities(selectedDeptId);
        });

        // Disparar evento 'change' para cargar combos por defecto.
        slDepartments.selectedIndex = 0;
        const listUpdatedEvt = new Event('change', { bubbles: true, cancelable: true });
        slDepartments.dispatchEvent(listUpdatedEvt);
    })
    .catch(error => {
        showToastResult(error.message, 3000);
    });
}


// CARGA LAS CIUDADES DE UN DEPARTAMENTO ESPECIFICO EN EL COMBO DE CIUDADES.
function loadCities(deptId) {
    let slCities = document.querySelector('#slUserCity');
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');

    // TODO: ESTO SE PODRIA OPTIMIZAR, OBTENIENDO LAS CIUDADES FILTRANO LA LISTA DE CIUDADES PRECARGADA DESDE EL INICIO.
    client.get(`/ciudades.php?idDepartamento=${deptId}`, {
        apikey: apiKey,
        iduser: idUser
    }).then(data => {
        console.log(data.ciudades);
        let ciudadesOptions = data.ciudades.map(opt => `<option value="${opt.id}">${opt.nombre}</option>`).join('');
        slCities.innerHTML = ciudadesOptions;
    })
    .catch(error => {
        showToastResult(error.message, 3000);
    });
}

// OBTIENE LA LISTA DE TODAS LAS CIUDADES
function getCitiesList() {
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');
    return client.get(`/ciudades.php`, {
        apikey: apiKey,
        iduser: idUser
    });
}

// OBTIENE LA INFORMACION DE LAS OCUPACIONES
function getOccupations() {
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');
    return client.get('/ocupaciones.php', {
        apikey: apiKey,
        iduser: idUser
    });
}

// CARGA LAS OCUPACIONES EN EL COMBO DE OCUPACIONES CON EL id 'selectListId'
async function loadOccupations(selectListId = "#slUserOccupation") {
    // Retornar aqui si no encuentro el elemento.
    let slOccupations = document.querySelector(selectListId);
    let occupationResult = await getOccupations();
    console.log(occupationResult.ocupaciones);
    try {
        if (occupationResult.ocupaciones.length > 0) {
            let occupationOptions = occupationResult.ocupaciones.map(opt => `<option value="${opt.id}">${opt.ocupacion}</option>`).join('');
            slOccupations.innerHTML = occupationOptions;
        }
    } catch(error) {
        showToastResult(error.message, 3000);
    }
}


// OBTENER LA LISTA DE PERSONAS
function getPersonsList() {
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');

    return client.get(`/personas.php?idUsuario=${idUser}`, {
        apikey: apiKey,
        iduser: idUser
    });
}


// CARGA LA LISTA DE PERSONAS EN PANTALLA
async function loadPersons(occupationFilterId) {
    //debugger
    let personsDataListLoader = document.querySelector('#list-loader');
    let personsDataList = document.querySelector('#persons-data-list');
    let personResult;
    let occupations;

    personsDataListLoader.classList.remove('ion-hide');
    personsDataList.innerHTML = "";

    try {
        personResult = await getPersonsList();
        occupations = await getOccupations();
        console.log(personResult.personas);
        if (personResult.personas.length > 0) {
            let personListItems = (occupationFilterId ? personResult.personas.filter((pers) => pers.ocupacion == occupationFilterId) : personResult.personas).map(item => `<ion-item>
                <ion-label>
                    <h1>${item.nombre}</h1>
                    <h2 class="ion-margin-top">${occupations.ocupaciones.filter(occ => occ.id === item.ocupacion)[0].ocupacion}</h2>
                    <p class="ion-margin-top">${item.fechaNacimiento}</p>
                </ion-label>
                <ion-icon slot="end" data-id="${item.id}" onclick="deletePerson(event)" color="danger" name="trash"></ion-icon>
            </ion-item>`).join('');
            personsDataList.innerHTML = "";    
            personsDataList.innerHTML = (personListItems.length > 0) ? personListItems : "<ion-item class='ion-text-center'><ion-label>El filtro no arrojó resultados.</ion-label></ion-item>";
        } else {
            personsDataList.innerHTML = "<ion-item class='ion-text-center'><ion-label>No hay resultados.</ion-label></ion-item>"
        }
        personsDataListLoader.classList.add('ion-hide');
    } catch (error) {
        showToastResult(error.message, 3000);
    }
}

// CARGA LA LISTA DE PERSONAS FILTRADAS POR OCUPACION EN PANTALLA
function loadPersonsFiltered(e) {
    const occupationFilterId = e.target.value;
    loadPersons(occupationFilterId);
}

// Se atachea la función deletePerson al objeto window, para hacerla accesible globalmente.
window.deletePerson = function(e) {
    const personId = e.target.dataset.id;
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');

    client.delete(`/personas.php?idCenso=${personId}`, {
        apikey: apiKey,
        iduser: idUser
    }).then(result => {
        showToastResult(result.mensaje, 3000, 'toast-success');
        loadPersons();
    }).catch(error => {
        showToastResult(error.message, 3000);
    });
}

function bindNavigationTabs() {
    const BTN_TAB_HOME = document.querySelector('#tab-button-home-page');
    const BTN_TAB_REGISTER = document.querySelector('#tab-button-register-page');
    const BTN_TAB_PERSONS = document.querySelector('#tab-button-census-list-page');
    const BTN_TAB_MAP = document.querySelector('#tab-button-map-page');

    if (BTN_TAB_HOME) BTN_TAB_HOME.addEventListener('click', function() {
        getTotalCensus();
        getOccupations();
        getCitiesList();
    });
    
    if (BTN_TAB_REGISTER) BTN_TAB_REGISTER.addEventListener('click', function() {
        loadDepartments();
        loadOccupations();
    });
    
    if (BTN_TAB_PERSONS) BTN_TAB_PERSONS.addEventListener('click', function() {
        loadPersons();
        loadOccupations('#slOccupationFilter');

        // BINDEAR EL EVENTO CHANGE AL SELECT DE FILTRO PARA FILTRAR RESULTADOS
        const SL_OCCUPATION_FILTER = document.querySelector('#slOccupationFilter');
        if (SL_OCCUPATION_FILTER) SL_OCCUPATION_FILTER.addEventListener('change', loadPersonsFiltered);
    });
    
    if (BTN_TAB_MAP) BTN_TAB_MAP.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setOrigin, showError);
        } else {
            showToastResult('Los servicios de ubicación no están habilitados.', 3000);
        }
    });
}

function RegisterCensusTaker() {
    const USERNAME = document.querySelector("#txtCensusRegisterUser").value;
    const PASSWORD = document.querySelector("#txtCensusRegisterPassword").value;
    const PASSWORD_CHECK = document.querySelector("#txtCensusRegisterRetypePassword").value;

    if (USERNAME === '' || PASSWORD === '' || PASSWORD_CHECK === '') {
        showAlert({
            header: "Espera!",
            subHeader: "Error",
            message: "Todos los campos son obligatorios!"
        });
        clearFields();
        return;
    } else if (PASSWORD !== PASSWORD_CHECK) {
        showAlert({
            header: "Espera!",
            subHeader: "Error",
            message: "Las contraseñas no coinciden."
        });
        clearFields();
        return;
    } else {
        client.post('/usuarios.php', {
            usuario: USERNAME,
            password: PASSWORD
        }).then(data => {
            localStorage.setItem('censo-user-token', data.apiKey);
            localStorage.setItem('censo-user-id', data.id);
            switchActiveTab('home-page');
            getTotalCensus();
            CENSUS_TAKER_REGISTER_PAGE.className = 'ion-hide';
            HOME_PAGE.className = 'ion-page';
            //REGISTER_NAV.root = HOME_SCREEN;
        })
        .catch(error => {
            clearFields();
            showToastResult(error.message, 3000);
        });
    }
}

function RegisterPerson() {
    const CENSUS_USER_NAME = document.querySelector("#txtUserCensusName").value;
    const CENSUS_USER_DEPARTMENT = document.querySelector("#slUserDepartment").value;
    const CENSUS_USER_CITY = document.querySelector("#slUserCity").value;
    const CENSUS_USER_DOB = document.querySelector("#txtDoB").value;
    const CENSUS_USER_OCCUPATION = document.querySelector("#slUserOccupation").value;

    if (CENSUS_USER_NAME === '' || CENSUS_USER_DEPARTMENT === '' || CENSUS_USER_CITY === '' || CENSUS_USER_DOB === '' || CENSUS_USER_OCCUPATION === '') {
        showAlert({
            header: "Espera!",
            subHeader: "Error",
            message: "Todos los campos son obligatorios!"
        });
        clearFields();
        return;
    } else {
        client.post('/personas.php', {
            idUsuario: localStorage.getItem('censo-user-id'),
            nombre: CENSUS_USER_NAME,
            departamento: CENSUS_USER_DEPARTMENT,
            ciudad: CENSUS_USER_CITY,
            fechaNacimiento: CENSUS_USER_DOB,
            ocupacion: CENSUS_USER_OCCUPATION
        }, {
            apikey: localStorage.getItem('censo-user-token'),
            iduser: localStorage.getItem('censo-user-id')
        }).then(data => {
            //localStorage.setItem('censo-user-token', data.apiKey);
            //localStorage.setItem('censo-user-id', data.id);
            switchActiveTab('home-page');
            showToastResult(data.mensaje, 3000, 'toast-success');
            getTotalCensus();
            HOME_PAGE.className = 'ion-page';
            //REGISTER_NAV.root = HOME_SCREEN;
        })
        .catch(error => {
            clearFields();
            showToastResult(error.message, 3000);
        });
    }
}

function RegisterUser() {
    LOGIN_PAGE.className = 'ion-hide';
    HOME_PAGE.className = 'ion-hide';
    CENSUS_TAKER_REGISTER_PAGE.className = 'ion-page';
}

function LogOut() {
    localStorage.clear();
    redirectToLogin(false, '');
}

async function getTotalCensus() {
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');
    let totalCensusByMe = await getPersonsList();
    
    client.get('/totalCensados.php', {
        apikey: apiKey,
        iduser: idUser
    }).then(data => {
        console.log(data.total);
        let totalCensusIndicator = document.querySelector('#totalCensusIndicator'); 
        totalCensusIndicator.innerHTML = '';
        totalCensusIndicator.innerHTML = `Población censada: ${data.total} hab.`;
        //totalCensusIndicator.textContent = `Total: ${data.total} hab.`;

        let totalCensusByMeIndicator = document.querySelector('#totalCensusByMeIndicator');
        totalCensusByMeIndicator.innerHTML = '';
        totalCensusByMeIndicator.innerHTML = `Habitantes censados por mi: ${totalCensusByMe.personas.length}`;

        let totalCensusByMeIndicatorMvd = document.querySelector('#totalCensusByMeIndicatorMvd');
        totalCensusByMeIndicatorMvd.innerHTML = '';
        totalCensusByMeIndicatorMvd.innerHTML = `En Montevideo: ${totalCensusByMe.personas.filter((p) => p.departamento === 3218).length}`;

        let totalCensusByMeRest = document.querySelector('#totalCensusByMeIndicatorRest');
        totalCensusByMeRest.innerHTML = '';
        totalCensusByMeRest.innerHTML = `En el resto del país: ${totalCensusByMe.personas.filter((p) => p.departamento !== 3218).length}`;
    })
    .catch(error => {
        redirectToLogin(error.message);
    });
}

function redirectToLogin(showToast = true, message = 'La sesión ha expirado, accede nuevamente.') {
    LOGIN_PAGE.className = 'ion-page';
    HOME_PAGE.className = '';
    HOME_PAGE.className = 'ion-hide';
    clearFields();
    if (showToast) {
        showToastResult(message, 3000);
    }
}

async function showToastResult(message, duration = 2500, toastType='error-toast') {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = duration;
    toast.position = 'bottom';
    toast.classList.add(toastType);
    document.body.appendChild(toast);
    return await toast.present();
}

async function showAlert(alertSettings) {
    const alert = document.createElement('ion-alert');
    alert.header = alertSettings.header;
    alert.subHeader = alertSettings.subHeader || "";
    alert.message = alertSettings.message;
    alert.buttons = ['OK'];

    document.body.appendChild(alert);
    await alert.present();
}

// Module Exports
export {
    StartApp,
    LogIn
};
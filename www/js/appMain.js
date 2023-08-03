import APIClient from './apiClient.js';
const client = new APIClient("https://censo.develotion.com/");

const LOGIN_PAGE = document.querySelector("#login-screen");
const HOME_PAGE = document.querySelector("#app-screen");
const CENSUS_TAKER_REGISTER_PAGE = document.querySelector('#census-taker-register-screen');

const FIELD_USERNAME = document.querySelector("#txtCensusUser");
const FIELD_PASSWORD = document.querySelector("#txtCensusPassword");
const HOME_NAV = document.querySelector('#home-nav');
const REGISTER_NAV = document.querySelector('#register-nav');

let OCCUPATIONS = [];

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

            // TODO: DELEGAR A UNA FUNCION 'UIListener' QUE ESCUCHE TODAS LAS INTERACCIONES CON EL TAB BAR PRINCIPAL
            bindNavigationTabs();
            switchActiveTab('home-page');
            
            //loadDepartments();
            //loadOccupations();
            //getTotalCensus();

            //REGISTER_NAV.root = HOME_SCREEN;
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

// CARGA LAS CIUDADES EN EL COMBO DE CIUDADES
function loadCities(deptId) {
    let slCities = document.querySelector('#slUserCity');
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');

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

// OBTIENE LA INFORMACION DE LAS OCUPACIONES
function getOccupations() {
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');
    client.get('/ocupaciones.php', {
        apikey: apiKey,
        iduser: idUser
    }).then(data => {
        OCCUPATIONS = data.ocupaciones;
    })
    .catch(error => {
        showToastResult(error.message, 3000);
    });
}

// CARGA LAS OCUPACIONES EN EL COMBO DE OCUPACIONES
function loadOccupations(selectListId = "#slUserOccupation") {
    let slOccupations = document.querySelector(selectListId);
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');
    client.get('/ocupaciones.php', {
        apikey: apiKey,
        iduser: idUser
    }).then(data => {
        let occupationOptions = data.ocupaciones.map(opt => `<option value="${opt.id}">${opt.ocupacion}</option>`).join('');
        slOccupations.innerHTML = `<option value=-1>Seleccione...</option>` + occupationOptions;
    })
    .catch(error => {
        showToastResult(error.message, 3000);
    });
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
function loadPersons() {
    let personsDataListLoader = document.querySelector('#list-loader');
    let personsDataList = document.querySelector('#persons-data-list');
    
    personsDataListLoader.classList.remove('ion-hide');
    personsDataList.innerHTML = "";

    getPersonsList().then(data => {
        let personListItems = data.personas.map(item => `<ion-item>
            <ion-label>
                <h1>${item.nombre}</h1>
                <h2 class="ion-margin-top">${OCCUPATIONS.filter(occ => occ.id === item.ocupacion)[0].ocupacion}</h2>
                <p class="ion-margin-top">${item.fechaNacimiento}</p>
            </ion-label>
            <ion-icon slot="end" data-id="${item.id}" onclick="deletePerson(event)" color="danger" name="trash"></ion-icon>
        </ion-item>`).join('');    
        personsDataList.innerHTML = personListItems;
        personsDataListLoader.classList.add('ion-hide');
    }).catch(error => {
        showToastResult(error.message, 3000);
    });
}

function loadPersonsFiltered() {
    
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
    const BTN_TAB_SEARCH = document.querySelector('#tab-button-search-page');
    //const BTN_TAB_MAP = document.querySelector('#tab-button-map-page');

    if (BTN_TAB_HOME) BTN_TAB_HOME.addEventListener('click', function() {
        getTotalCensus();
        getOccupations();
    });
    
    if (BTN_TAB_REGISTER) BTN_TAB_REGISTER.addEventListener('click', function() {
        loadDepartments();
        loadOccupations();
    });
    
    if (BTN_TAB_PERSONS) BTN_TAB_PERSONS.addEventListener('click', loadPersons);
    
    // TODO: BIND TABS
    if (BTN_TAB_SEARCH) BTN_TAB_SEARCH.addEventListener('click', function() {
        loadOccupations('#slOccupationFilter');
        //loadPersonsFiltered
    });

    //if (BTN_TAB_MAP) BTN_TAB_MAP.addEventListener('click', function() {});
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
            localStorage.setItem('censo-user-token', data.apiKey);
            localStorage.setItem('censo-user-id', data.id);
            switchActiveTab('home-page');
            showToastResult(data.mensaje, 3000, 'toast-success');
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

function RegisterUser() {
    LOGIN_PAGE.className = 'ion-hide';
    HOME_PAGE.className = 'ion-hide';
    CENSUS_TAKER_REGISTER_PAGE.className = 'ion-page';
}

function LogOut() {
    localStorage.clear();
    redirectToLogin(false, '');
}

function getTotalCensus() {
    const apiKey = localStorage.getItem('censo-user-token');
    const idUser = localStorage.getItem('censo-user-id');
    
    client.get('/totalCensados.php', {
        apikey: apiKey,
        iduser: idUser
    }).then(data => {
        console.log(data.total);
        let totalCensusIndicator = document.querySelector('#totalCensusIndicator'); 
        totalCensusIndicator.innerHTML = '';
        totalCensusIndicator.textContent = `Total: ${data.total} hab.`
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

//StartApp();

// Module exports
export {
    StartApp,
    LogIn
};
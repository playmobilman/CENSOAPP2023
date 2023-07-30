import APIClient from './apiClient.js';
const client = new APIClient("https://censo.develotion.com/");

/**
 * UI Mechanism
 */

// BACKUP CODE
//------------------------------------------------------------------------------------------
// const ruteo = document.querySelector("#ruteo");
// ruteo.addEventListener("ionRouteWillChange", NavegarEntrePaginas);
// document.querySelector("#btnListado").addEventListener("click", RedireccionarAListado);

// function NavegarEntrePaginas(event) {
//     console.log(event);
//     OcultarPaginas();
//     if (event.detail.to == "/") {
//         document.querySelector("#page-one").style.display = "block";
//         //document.querySelector("#page-two").style.display = "none";
//         //document.querySelector("#page-listado").style.display = "none";
//     }
//     else if (event.detail.to == "/page-listado") {
//         //document.querySelector("#page-one").style.display = "none";
//         // document.querySelector("#page-two").style.display = "none";
//         document.querySelector("#page-listado").style.display = "block";

//     }
//     else {

//         // document.querySelector("#page-one").style.display = "none";
//         document.querySelector("#page-two").style.display = "block";
//         //document.querySelector("#page-listado").style.display = "none";
//     }
// }

// function CerrarMenu() {
//     document.querySelector("#menu").close();
// }

// function RedireccionarAListado() {
//     ruteo.push("/page-listado");
// }

// function OcultarPaginas() {
//     let pages = document.querySelectorAll("ion-page");

//     for (let i = 0; i < pages.length; i++) {
//         pages[i].style.display = "none";
//     }
// }

// LOGIN
// client.post("/login.php", {
//     usuario: "censo",
//     password: "censo"
// }).then(data => {
//     console.log(data);
//     localStorage.setItem('censo-user-token', data.apiKey);
// })
// .catch(error => console.error(error));

// REGISTRO
// client.post("/usuarios.php", {
//     usuario: "mschmid.3712",
//     password: "mschmid"
// }).then(userData => {
//     console.log(userData);
// })
// .catch(error => console.error(error));

const ROUTER = document.querySelector("#appRouter");
const LOGIN_PAGE = document.querySelector("#login-screen");
const HOME_PAGE = document.querySelector("#app-screen");
const CENSUS_TAKER_REGISTER_PAGE = document.querySelector('#census-taker-register-screen');

const FIELD_USERNAME = document.querySelector("#txtCensusUser");
const FIELD_PASSWORD = document.querySelector("#txtCensusPassword");
const HOME_NAV = document.querySelector('#home-nav');
const REGISTER_NAV = document.querySelector('#register-nav');


function checkSession() {
    return localStorage.getItem('censo-user-token');
}

function clearFields() {

    let inputs = document.querySelectorAll('input[type="email"], input[type="text"], input[type="password"]');

    inputs.forEach(element => {
        element.value = "";
    });

    // FIELD_USERNAME.value = "";
    // FIELD_PASSWORD.value = "";
    // FIELD_USERNAME.focus();
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

    const LOGOUT_BUTTON = document.querySelector('#btn-logout');
    if (LOGOUT_BUTTON) LOGOUT_BUTTON.addEventListener('click', LogOut);
    
    const REGISTER_CENSUS_TAKER_BUTTON = document.querySelector('#btnCensusRegister');
    if (REGISTER_CENSUS_TAKER_BUTTON) REGISTER_CENSUS_TAKER_BUTTON.addEventListener('click', RegisterCensusTaker);

    const REGISTER_BUTTON = document.querySelector('#btn-register');
    if (REGISTER_BUTTON) REGISTER_BUTTON.addEventListener('click', RegisterUser);
    
    //hideScreens();
    if (checkSession()) {
        LOGIN_PAGE.className = 'ion-hide';
        HOME_PAGE.className = '';
        HOME_PAGE.className = 'ion-page';
        switchActiveTab('home-page');
        getTotalCensus();
    } else {
        LOGIN_PAGE.className = 'ion-page';
        HOME_PAGE.className = '';
        HOME_PAGE.className = 'ion-hide';
        //ROUTER.push('/login');
    }
}

function LogIn() {
    //debugger;
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
            switchActiveTab('home-page');
            getTotalCensus();
            LOGIN_PAGE.className = 'ion-hide';
            HOME_PAGE.className = 'ion-page';
            //REGISTER_NAV.root = HOME_SCREEN;
        })
        .catch(error => {
            clearFields();
            showToastResult(error.message);
        });
    }
}

function RegisterCensusTaker() {
    const USERNAME = document.querySelector("#txtCensusRegisterUser").value;
    const PASSWORD = document.querySelector("#txtCensusRegisterPassword").value;
    const PASSWORD_CHECK = document.querySelector("#txtCensusRegisterRetypePassword").value;

    if (USERNAME === '' || PASSWORD === '' || PASSWORD_CHECK === '') {
        showAlert({
            header: "Espera!",
            subHeader: "Error",
            message: "Los datos de acceso son obligatorios!"
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
            showToastResult(error.message);
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
        document.querySelector('#totalCensusIndicator').textContent = `Total: ${data.total}`
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
        showToastResult(message);
    }
}

async function showToastResult(message, duration = 2500) {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = duration;
    toast.position = 'bottom';
    toast.classList.add("error-toast");
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
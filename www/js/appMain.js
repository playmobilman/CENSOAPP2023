//import APIClient from './apiClient.js';
//const client = new APIClient("https://censo.develotion.com/");

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

import APIClient from './apiClient.js';

const client = new APIClient("https://censo.develotion.com/");

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
client.post("/usuarios.php", {
    usuario: "playmobilman3",
    password: "playmobilman3"
}).then(userData => {
    console.log(userData);
})
.catch(error => console.error(error));
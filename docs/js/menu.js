const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

function abrirMenu(){
    sidebar.classList.add("active");
    overlay.classList.add("active");
}

function fecharMenu(){
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
}
document.addEventListener("DOMContentLoaded", function () {

/* INIT MAP */
const map = L.map("map").setView([-7.4,111.4],11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
.addTo(map);

/* SLIDER */
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const prev = document.getElementById("prevTahun");
const next = document.getElementById("nextTahun");

labelTahun.innerHTML = tahun.value;

/* UPDATE TOMBOL */
function updateNav(){
prev.disabled = tahun.value == tahun.min;
next.disabled = tahun.value == tahun.max;
}

/* LOAD DATA (contoh) */
function loadData(){
console.log("Load data tahun:", tahun.value);
}

/* SLIDER GESER */
tahun.addEventListener("input",()=>{
labelTahun.innerHTML = tahun.value;
updateNav();
loadData();
});

/* TOMBOL KIRI */
prev.addEventListener("click",()=>{
if(tahun.value > tahun.min){
tahun.value = parseInt(tahun.value) - 1;
labelTahun.innerHTML = tahun.value;
updateNav();
loadData();
}
});

/* TOMBOL KANAN */
next.addEventListener("click",()=>{
if(tahun.value < tahun.max){
tahun.value = parseInt(tahun.value) + 1;
labelTahun.innerHTML = tahun.value;
updateNav();
loadData();
}
});

updateNav();

});

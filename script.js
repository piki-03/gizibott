// ================= DATA =================
let tinggi = 90;

// ================= UPDATE TINGGI =================
function updateTinggi(tinggi){
    const text = document.getElementById("tinggi");
    const bar = document.getElementById("bar");

    text.innerHTML = tinggi + " cm";

    // MAX tinggi
    let persen = (tinggi / 140) * 100;
    bar.style.width = persen + "%";

    // WARNA DINAMIS
    if(tinggi >= 110){
        bar.className = "progress-bar bg-success";
        text.style.color = "#27AE60";
    }
    else if(tinggi >= 90){
        bar.className = "progress-bar bg-warning";
        text.style.color = "#F39C12";
    }
    else{
        bar.className = "progress-bar bg-danger";
        text.style.color = "#E74C3C";
    }
}

// INIT
updateTinggi(tinggi);

// ================= CHART =================
let data = [80, 95, 105, 115, 120];
let chart = document.getElementById("chart");

if(chart){
    data.forEach(val=>{
        let bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = val + "px";
        chart.appendChild(bar);
    });
}

// ================= NAVIGASI =================
function setActive(el){
    document.querySelectorAll(".nav-item").forEach(i=>i.classList.remove("active"));
    el.classList.add("active");
}

function goTodata(){
    window.location.href = "data.html";
}

// ================= GIZI =================
function kirimGizi(mode, event){

    // RESET
    document.querySelectorAll(".menu-btn").forEach(btn=>{
        btn.classList.remove("active");
    });

    let tombol = event.currentTarget;
    tombol.classList.add("active");

    console.log("Kirim ke ESP: Gizi " + mode);

    fetch("http://192.168.4.1/gizi?mode=" + mode)
    .then(res => res.text())
    .then(data => console.log("Respon ESP:", data))
    .catch(() => console.log("ESP tidak terhubung"));
}

// ================= PDF =================
function downloadPDF(){
    const element = document.querySelector(".card-pro:nth-of-type(2)");

    let opt = {
        margin: 0.5,
        filename: 'data-anak.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}
// ================= SUPABASE =================
const SUPABASE_URL = "https://unipgrkundayjaudznjn.supabase.co";
const SUPABASE_KEY = "sb_publishable_oV3aBukpqULi2fhILB8BpQ_h09lm8bQ";

// ================= STATE =================
let currentUID = null;
let lastRFID_ID = null;
let currentAnak = null;

// ================= AMBIL DATA SCAN TERBARU =================
function ambilScanTerbaru(){
    fetch(`${SUPABASE_URL}/rest/v1/hasil_scan?select=id,uid,tinggi&order=created_at.desc&limit=1`, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data.length > 0){
            let scan = data[0];

            // ✅ hanya update kalau data baru
            if(scan.id !== lastRFID_ID){
                lastRFID_ID = scan.id;
                currentUID = scan.uid;

                console.log("Scan baru:", scan);

                ambilDataAnak(scan.uid);
                updateTinggi(scan.tinggi);
            }
        }
    })
    .catch(err => console.error("Error ambilScan:", err));
}

// ================= DATA ANAK =================
function ambilDataAnak(uid){
    fetch(`${SUPABASE_URL}/rest/v1/anak?uid=eq.${uid}`, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data.length === 0){
            console.log("Data anak tidak ditemukan");
            return; // ❗ tidak reset UI
        }

        let anak = data[0];
        currentAnak = anak; // ✅ simpan ke memory

        document.querySelector(".profile b").innerText = anak.nama;
        document.querySelector(".profile small").innerText =
            hitungUmur(anak.tanggal_lahir) + " Tahun • " + anak.tempat_lahir;
        document.querySelector(".profile .ortu").innerText =
            "Orang Tua: " + anak.nama_ortu;
        document.querySelector(".profile .text-muted").innerText =
            "UID: " + anak.uid;
    })
    .catch(err => console.error("Error ambilDataAnak:", err));
}

// ================= HITUNG UMUR =================
function hitungUmur(tanggal){
    let lahir = new Date(tanggal);
    let sekarang = new Date();
    let umur = sekarang.getFullYear() - lahir.getFullYear();
    let m = sekarang.getMonth() - lahir.getMonth();

    if(m < 0 || (m === 0 && sekarang.getDate() < lahir.getDate())){
        umur--;
    }

    return umur;
}

// ================= UPDATE TINGGI =================
function updateTinggi(tinggi){
    const text = document.getElementById("tinggi");
    const bar = document.getElementById("bar");

    text.innerHTML = tinggi + " cm";

    let persen = (tinggi / 140) * 100;
    bar.style.width = persen + "%";

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

// ================= POLLING =================
setInterval(() => { 
    ambilScanTerbaru(); 
}, 3000); // ⏱️ lebih hemat dari 2 detik

// ================= NAV =================
function goTodata(){ 
    window.location.href = "data.html"; 
}

// ================= KIRIM GIZI =================
async function kirimGizi(mode, event){

    // tombol aktif
    document.querySelectorAll(".menu-btn").forEach(btn => btn.classList.remove("active"));
    event.currentTarget.classList.add("active");

    let nama = document.querySelector(".profile b").innerText;
    let tinggi = parseInt(document.getElementById("tinggi").innerText) || 0;

    if(nama === "Menunggu scan..." || tinggi <= 0){
        alert("Data belum siap!");
        return;
    }

    // ✅ ambil dari memory (tidak fetch lagi)
    let tanggal_lahir = currentAnak?.tanggal_lahir || null;
    let umur = tanggal_lahir ? hitungUmur(tanggal_lahir) : null;

    let payload = {
        uid_anak: currentUID,
        nama: nama,
        tinggi: tinggi,
        tanggal_lahir: tanggal_lahir,
        umur: umur,
        tombol_a: (mode === "A") ? 1 : 0,
        tombol_b: (mode === "B") ? 1 : 0
    };

    try{
        const res = await fetch(`${SUPABASE_URL}/rest/v1/history_gizi`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify([payload])
        });

        const data = await res.json();
        console.log("Data tersimpan:", data);

    } catch(err){
        console.error("Error simpan history_gizi:", err);
    }
}

// ================= DOWNLOAD PDF =================
function downloadPDF(){
    const element = document.querySelector(".card-pro:nth-of-type(2)");

    let opt = {
        margin:0.5,
        filename:'data-anak.pdf',
        image:{type:'jpeg', quality:0.98},
        html2canvas:{scale:2},
        jsPDF:{unit:'cm', format:'a4', orientation:'portrait'}
    };

    html2pdf().set(opt).from(element).save();
}
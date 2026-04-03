// ================= SUPABASE =================
const SUPABASE_URL = "https://unipgrkundayjaudznjn.supabase.co";
const SUPABASE_KEY = "sb_publishable_oV3aBukpqULi2fhILB8BpQ_h09lm8bQ";

// ================= STATE =================
let currentUID = null;
let lastRFID_ID = null;
let currentAnak = null;
let lastA = 0;
let lastB = 0;
let lastSendTime = 0;

// ================= FETCH TIMEOUT =================
function fetchWithTimeout(url, options, timeout = 5000){
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), timeout)
        )
    ]);
}

// ================= AMBIL SCAN TERBARU =================
function ambilScanTerbaru(){
    fetchWithTimeout(
        `${SUPABASE_URL}/rest/v1/hasil_scan?select=id,uid,tinggi&uid=not.is.null&tinggi=not.is.null&order=created_at.desc&limit=1`,
        {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY
            }
        }
    )
    .then(res => res.json())
    .then(data => {
        if(data.length > 0){
            let scan = data[0];

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
    fetchWithTimeout(`${SUPABASE_URL}/rest/v1/anak?uid=eq.${uid}`, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data.length === 0){
            console.log("Data anak tidak ditemukan");
            return;
        }

        let anak = data[0];
        currentAnak = anak;

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
    if(!tinggi) return;

    const text = document.getElementById("tinggi");
    const bar = document.getElementById("bar");

    text.innerHTML = tinggi + " cm";

    let persen = Math.min((tinggi / 140) * 100, 100);
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
}, 4000); // lebih aman

// ================= NAV =================
function goTodata(){ 
    window.location.href = "data.html"; 
}

// ================= BUTTON =================
function tekanA(el){
    el.classList.add("active");
    kirimKeServer(1, 0);
}

function lepasA(el){
    el.classList.remove("active");
    kirimKeServer(0, 0);
}

function tekanB(el){
    el.classList.add("active");
    kirimKeServer(0, 1);
}

function lepasB(el){
    el.classList.remove("active");
    kirimKeServer(0, 0);
}

// ================= KIRIM KE SUPABASE =================
async function kirimKeServer(a, b){

    // anti spam state
    if(a === lastA && b === lastB) return;
    lastA = a;
    lastB = b;

    // debounce waktu
    let now = Date.now();
    if(now - lastSendTime < 1000) return;
    lastSendTime = now;

    let nama = document.querySelector(".profile b").innerText;
    let tinggiText = document.getElementById("tinggi").innerText;
    let tinggi = parseInt(tinggiText.replace(/[^\d]/g, "")) || 0;

    if(nama === "Menunggu scan..." || tinggi <= 0 || !currentUID){
        console.log("Data belum siap");
        return;
    }

    let payload = {
        uid_anak: currentUID,
        nama: nama,
        tinggi: tinggi,
        tombol_a: a,
        tombol_b: b
    };

    try{
        await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/history_gizi`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify([payload])
        });

        console.log("Kirim:", payload);

    } catch(err){
        console.error("Error kirim:", err);
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
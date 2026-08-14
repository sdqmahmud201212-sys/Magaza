// --- İLKİN DATA (DATABASE SIMULATION) ---
let userBalance = 100; // İstifadəçinin başlanğıc balansı (Sikkə)
let platformOwnerBalance = 0; // Sizin (Platforma sahibi) balansınız (5%)

// Məhsullar siyahısı
const products = [
  {
    id: 1,
    title: "JavaScript Tam Qaydalar (PDF)",
    author: "Kamran M.",
    price: 30, // 30 Sikkə (6 AZN)
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Nümunə PDF
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    title: "Biznes və Marketing Bələdçisi",
    author: "Aysel K.",
    price: 20, // 20 Sikkə (4 AZN)
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    title: "Minimalist Dizayn Əsasları",
    author: "Rəşad T.",
    price: 50, // 50 Sikkə (10 AZN)
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80"
  }
];

// --- SƏHİFƏ YÜKLƏNƏNDƏ İŞƏ DÜŞƏN HİSSƏ ---
document.addEventListener("DOMContentLoaded", () => {
  updateUI();
  renderProducts();
});

// Balansı ekranda yeniləyən funksiya
function updateUI() {
  document.getElementById("user-coins").innerText = userBalance;
}

// Məhsulları ekrana düzən funksiya
function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "glass rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition";

    card.innerHTML = `
      <div>
        <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover">
        <div class="p-5">
          <div class="text-xs text-indigo-400 uppercase font-semibold tracking-wider mb-1">Müəllif: ${product.author}</div>
          <h3 class="text-lg font-bold text-white mb-2">${product.title}</h3>
        </div>
      </div>
      
      <div class="p-5 pt-0 flex items-center justify-between mt-auto">
        <div class="flex items-center space-x-1">
          <i class="fa-solid fa-coins text-amber-400"></i>
          <span class="text-xl font-extrabold text-amber-400">${product.price}</span>
          <span class="text-xs text-slate-400">Sikkə</span>
        </div>
        <button onclick="buyProduct(${product.id})" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-2">
          <i class="fa-solid fa-cart-shopping"></i>
          <span>Al & Yüklə</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- AVTOMATİK SATIŞ VƏ KOMİSSİYA MƏNTİQİ ---
function buyProduct(productId) {
  const product = products.find(p => p.id === productId);

  // 1. Yoxlanış: Balans çatırmı?
  if (userBalance < product.price) {
    showToast("Kifayət qədər sikkəniz yoxdur! Sikkə artırın.", true);
    return;
  }

  // 2. Balansdan sikkə çıxılır
  userBalance -= product.price;

  // 3. 5% Komissiya Hesablanması (Platforma Sahibinə) və Satıcıya Keçid
  const commission = product.price * 0.05; // 5% sizə
  const sellerEarnings = product.price - commission; // 95% satıcıya

  platformOwnerBalance += commission;

  // Konsolda əməliyyatın dəqiqliyini göstərək
  console.log(`--- ƏMƏLİYYAT UĞURLUDUR ---`);
  console.log(`Məhsul: ${product.title}`);
  console.log(`Ümumi Qiymət: ${product.price} Sikkə`);
  console.log(`Satıcıya Çatan (95%): ${sellerEarnings} Sikkə`);
  console.log(`Platforma Komissiyası (5%): ${commission} Sikkə`);

  // 4. Ekranda Balansı Yenilə
  updateUI();

  // 5. PDF Faylının Avtomatik Yüklənməsi / Göndərilməsi
  downloadPDF(product.fileUrl, product.title);

  // 6. Uğurlu Mesaj Göstər
  showToast(`"${product.title}" alındı və PDF avtomatik yükləndi!`);
}

// PDF-i avtomatik kompyuterə/telefona endirən funksiya
function downloadPDF(url, title) {
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title}.pdf`;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Test üçün Sikkə Artırma Funksiyası
function addCoins() {
  userBalance += 50; // Hər dəfə 50 sikkə (10 AZN) əlavə edirik
  updateUI();
  showToast("Balansınıza 50 Sikkə əlavə olundu!");
}

// Bildiriş (Toast) Göstərən Funksiya
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  toastMessage.innerText = message;
  toast.classList.remove("hidden", "bg-emerald-600", "bg-rose-600");

  if (isError) {
    toast.classList.add("bg-rose-600");
  } else {
    toast.classList.add("bg-emerald-600");
  }

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}

// Modal pəncərələrini açmaq və bağlamaq üçün əsas funksiya
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle('hidden');
  }
}

// Kart nömrəsini kopyalamaq üçün
function copyCard() {
  const cardText = document.getElementById('chat-card-number').innerText;
  navigator.clipboard.writeText(cardText).then(() => {
    showToast('Kart nömrəsi kopyalandı!');
  });
}

// Bildiriş (Toast) mesajı göstərmək üçün
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (toast && toastMsg) {
    toastMsg.innerText = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Səhifəyə yüklənən məhsulları Firebase-dən oxumaq və ekranda göstərmək
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

function loadProducts() {
  const productsGrid = document.getElementById('products-grid');
  const productCount = document.getElementById('product-count');
  
  if (!productsGrid) return;

  // Firebase Realtime Database-dən materialları çəkirik
  database.ref('materials').on('value', (snapshot) => {
    productsGrid.innerHTML = '';
    const data = snapshot.val();
    
    if (data) {
      let count = 0;
      Object.keys(data).forEach((key) => {
        const item = data[key];
        count++;
        
        productsGrid.innerHTML += `
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="bg-purple-600/20 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/30">PDF Fayl</span>
                <span class="text-emerald-400 font-bold text-sm">${item.price} AZN</span>
              </div>
              <h3 class="text-base font-bold text-white mb-1">${item.title}</h3>
              <p class="text-xs text-slate-400 mb-4">Müəllif: ${item.author}</p>
            </div>
            <button onclick="openChat('${key}', '${item.title}', '${item.author}', '${item.price}', '${item.card}')" class="w-full bg-slate-800 hover:bg-purple-600 text-white font-bold py-2.5 rounded-2xl text-xs transition cursor-pointer flex items-center justify-center space-x-2">
              <i class="fa-solid fa-cart-shopping"></i>
              <span>Satın Al / Faylı Əldə Et</span>
            </button>
          </div>
        `;
      });
      productCount.innerText = `${count} material`;
    } else {
      productsGrid.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-500 text-xs">
          Hələ ki, satışda heç bir material yoxdur.
        </div>
      `;
      productCount.innerText = `0 material`;
    }
  });
}

// Yeni PDF Material Yükləmə Funksiyası (Firebase-ə yazır)
function handlePDFUpload(event) {
  event.preventDefault();
  
  const title = document.getElementById('pdf-title').value;
  const author = document.getElementById('pdf-author').value;
  const price = document.getElementById('pdf-price').value;
  const card = document.getElementById('seller-card').value;
  const fileInput = document.getElementById('pdf-file');

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    
    // Fayl adını unikal etmək üçün yoxlama (dublikat qadağası)
    database.ref('materials').orderByChild('fileName').equalTo(file.name).once('value', (snapshot) => {
      if (snapshot.exists()) {
        showToast('Xəbərdarlıq: Bu fayl əvvəlcədən sistemə yüklənib!');
      } else {
        // Firebase-ə məlumatı qeyd edirik
        database.ref('materials').push({
          title: title,
          author: author,
          price: price,
          card: card,
          fileName: file.name,
          timestamp: Date.now()
        }, (error) => {
          if (!error) {
            showToast('Material uğurla satışa çıxarıldı!');
            toggleModal('upload-modal');
            event.target.reset();
          } else {
            showToast('Xəbər baş verdi: ' + error.message);
          }
        });
      }
    });
  }
}

// Alıcı üçün Çat Pəncərəsini Açmaq
function openChat(id, title, author, price, card) {
  document.getElementById('chat-product-title').innerText = title;
  document.getElementById('chat-seller-name').innerText = `Müəllif: ${author}`;
  document.getElementById('chat-price').innerText = `${price} AZN`;
  document.getElementById('chat-card-number').innerText = card;
  
  toggleModal('chat-modal');
}

// Admin mesajı göndərmə
function sendAdminMessage(event) {
  event.preventDefault();
  const input = document.getElementById('admin-msg-input');
  const container = document.getElementById('admin-chat-messages');
  
  if (input.value.trim() !== '') {
    container.innerHTML += `
      <div class="flex justify-end">
        <div class="bg-purple-600 text-white text-xs px-3.5 py-2 rounded-2xl max-w-[80%]">
          ${input.value}
        </div>
      </div>
    `;
    input.value = '';
    container.scrollTop = container.scrollHeight;
  }
}

// Qəbz göndərmə
function sendReceiptMessage(event) {
  const container = document.getElementById('chat-messages');
  container.innerHTML += `
    <div class="flex justify-end">
      <div class="bg-purple-600 text-white text-xs px-3.5 py-2 rounded-2xl max-w-[80%]">
        <i class="fa-solid fa-receipt mr-1"></i> Ödəniş qəbzi göndərildi. Təsdiq gözlənilir...
      </div>
    </div>
  `;
  container.scrollTop = container.scrollHeight;
  showToast('Qəbz göndərildi!');
}

function toggleSellerLogin() {
  showToast('Satıcı girişi tezliklə aktiv olacaq.');
}

/**
 * qoyan subs — Client Interactivity Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initModals();
  initOrderForm();
});

/* ==========================================================================
   Mobile Navigation Menu
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Close menu when clicking a link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });
}

/* ==========================================================================
   Select Product & Auto-scroll
   ========================================================================== */
function selectProduct(productTitle) {
  const selectElem = document.getElementById('productSelect');
  const orderSection = document.getElementById('order');

  if (selectElem) {
    let matchedOption = false;
    for (let i = 0; i < selectElem.options.length; i++) {
      if (selectElem.options[i].value === productTitle || selectElem.options[i].text.includes(productTitle)) {
        selectElem.selectedIndex = i;
        matchedOption = true;
        break;
      }
    }

    if (!matchedOption) {
      // Find partial match
      for (let i = 0; i < selectElem.options.length; i++) {
        const optionVal = selectElem.options[i].value.toLowerCase();
        if (productTitle.toLowerCase().split(' ')[0] && optionVal.includes(productTitle.toLowerCase().split(' ')[0])) {
          selectElem.selectedIndex = i;
          break;
        }
      }
    }
  }

  if (orderSection) {
    orderSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      if (selectElem) {
        selectElem.focus();
        selectElem.style.borderColor = '#000000';
        selectElem.style.boxShadow = '0 0 0 4px rgba(0,0,0,0.15)';
        setTimeout(() => {
          selectElem.style.borderColor = '';
          selectElem.style.boxShadow = '';
        }, 1500);
      }
    }, 500);
  }
}

// Expose to window for inline onclick attributes
window.selectProduct = selectProduct;

/* ==========================================================================
   Modals (Public Offer & Privacy Policy)
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initModals() {
  window.openModal = openModal;
  window.closeModal = closeModal;

  // Close on outside click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
}

/* ==========================================================================
   Formspree AJAX Submission & Warranty Consent Validation
   ========================================================================== */
function initOrderForm() {
  const form = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');
  const statusDiv = document.getElementById('formStatus');
  const consentCheckbox = document.getElementById('termsConsent');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!consentCheckbox.checked) {
      statusDiv.className = 'form-status error';
      statusDiv.innerHTML = '⚠️ Пожалуйста, подтвердите согласие с условиями гарантии и оферты.';
      consentCheckbox.focus();
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    statusDiv.style.display = 'none';
    statusDiv.className = 'form-status';

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        statusDiv.className = 'form-status success';
        statusDiv.innerHTML = `
          <strong>🎉 Заявка успешно отправлена!</strong><br>
          Мы получили ваши контакты и свяжемся с вами в течение 5-15 минут для выдачи доступа.<br>
          <div style="margin-top: 10px;">
            <a href="https://t.me/easouthpaw" target="_blank" style="text-decoration: underline; font-weight: 600; color: #065F46;">
              Ускорить выдачу в Telegram →
            </a>
          </div>
        `;
        form.reset();
      } else {
        // Fallback: если Formspree endpoint еще не активирован в личном кабинете
        const nameVal = encodeURIComponent(formData.get('name') || '');
        const contactVal = encodeURIComponent(formData.get('contact') || '');
        const subVal = encodeURIComponent(formData.get('subscription') || '');
        const commentVal = encodeURIComponent(formData.get('comment') || '');
        const orderText = encodeURIComponent(`Здравствуйте! Заказ с сайта qoyan subs:%0A• Имя: ${decodeURIComponent(nameVal)}%0A• Контакт: ${decodeURIComponent(contactVal)}%0A• Подписка: ${decodeURIComponent(subVal)}${commentVal ? '%0A• Комментарий: ' + decodeURIComponent(commentVal) : ''}`);
        
        const tgDirectUrl = `https://t.me/easouthpaw?text=${orderText}`;
        const waDirectUrl = `https://wa.me/77470124268?text=${orderText}`;

        statusDiv.className = 'form-status success';
        statusDiv.innerHTML = `
          <strong>🎉 Заявка принята!</strong><br>
          Мы уже обрабатываем ваш запрос. Чтобы получить доступ моментально, перейдите в чат с оператором:<br>
          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap;">
            <a href="${tgDirectUrl}" target="_blank" class="btn btn-primary btn-sm">
              Перейти в Telegram ↗
            </a>
            <a href="${waDirectUrl}" target="_blank" class="btn btn-secondary btn-sm">
              Перейти в WhatsApp ↗
            </a>
          </div>
        `;
        form.reset();
      }
    } catch (err) {
      statusDiv.className = 'form-status error';
      statusDiv.innerHTML = `
        Ошибка соединения. Пожалуйста, напишите нам напрямую в 
        <a href="https://t.me/easouthpaw" target="_blank" style="text-decoration: underline; font-weight: 600;">Telegram @easouthpaw</a> 
        или WhatsApp: <strong>+7 747 012 42 68</strong>.
      `;
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}

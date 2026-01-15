// File: landing_page/script.js
// Logika untuk halaman landing publik, menampilkan promo.

document.addEventListener('DOMContentLoaded',
    () => {
        // --- Elemen DOM ---
        const logoImg = document.getElementById('landing-logo-img');
        const runningTextContent = document.getElementById('running-text-content');
        const swiperWrapper = document.querySelector('.swiper-container-3d .swiper-wrapper');
        const backgroundElement = document.querySelector('.dynamic-background');
        const titleElement = document.querySelector('.dynamic-slide-title');
        const footerClockElement = document.getElementById('footer-clock');
        const footerDateElement = document.getElementById('footer-date');
        const loginButtonContainer = document.querySelector('.login-button-container');
        const countdownText = document.getElementById('login-countdown-text');
        const promoModal = document.getElementById('promoModal');
        const closeButton = document.querySelector('.close-button');
        const modalLogo = document.getElementById('modal-logo');
        const modalCompanyName = document.getElementById('modal-company-name');
        const modalPromoTitle = document.getElementById('modal-promo-title');
        const modalImage = document.getElementById('modal-image');
        const modalDescription = document.getElementById('modal-description');
        const modalAddress = document.getElementById('modal-address');
        const modalCountdownElement = document.getElementById('modal-countdown');

        // --- Variabel State & API ---
        let swiperInstance = null;
        let modalCountdownInterval;
        let allPromos = []; // Akan diisi data dari API
        let settings = {};
        // Data langsung di-embed agar bekerja tanpa server (mengatasi CORS issue saat file://)
        const MOCK_DATA = {
            "success": true,
            "activePromos": [
                {
                    "id": 1,
                    "title": "Starbucks Morning Coffee",
                    "description": "Nikmati pagi Anda dengan diskon 50% untuk semua varian kopi. Berlaku mulai jam 6 pagi hingga 10 pagi.",
                    "image_path": "tenant_tarbucks_ualanamu/promo_6862185e92ab7.png",
                    "tenant_id": 1,
                    "tenant_name": "Starbucks Kualanamu",
                    "tenant_company_name": "Starbucks Coffee",
                    "tenant_logo_path": "logo_VKlkha7FGm.png",
                    "tenant_description": "Coffee Shop Premium",
                    "tenant_address": "Terminal Keberangkatan Lt. 2",
                    "tenant_website": "https://starbucks.co.id",
                    "status": "approved",
                    "is_premium": 0,
                    "promo_type": "tanggal",
                    "start_date": "2024-01-01",
                    "end_date": "2030-12-31",
                    "clicks_achieved": 0,
                    "click_quota": 1000
                },
                {
                    "id": 2,
                    "title": "Burger King Whopper Feast",
                    "description": "Paket Whopper Gratis 1 Paket untuk pembelian Paket Besar apa saja. Hanya hari ini!",
                    "image_path": "tenant_tarbucks_ualanamu/promo_6960b0f66710c.png",
                    "tenant_id": 2,
                    "tenant_name": "Burger King",
                    "tenant_company_name": "Burger King",
                    "tenant_logo_path": "logo_68736bceaf26d.png",
                    "tenant_description": "Fast Food Link",
                    "tenant_address": "Area Public Hall",
                    "tenant_website": "https://burgerking.id",
                    "status": "approved",
                    "is_premium": 1,
                    "premium_start_date": "2024-01-01",
                    "premium_end_date": "2030-12-31",
                    "promo_type": "klik",
                    "clicks_achieved": 50,
                    "click_quota": 200
                },
                {
                    "id": 3,
                    "title": "Duty Free Exclusive Sale",
                    "description": "Diskon hingga 70% untuk parfum dan cokelat brand ternama. Dapatkan suvenir eksklusif belanja minimal Rp 500rb.",
                    "image_path": "tenant_tarbucks_ualanamu/promo_69605d266df58.png",
                    "tenant_id": 3,
                    "tenant_name": "Kualanamu Duty Free",
                    "tenant_company_name": "Kualanamu Retail",
                    "tenant_logo_path": "kualanamu.png",
                    "tenant_description": "Pusat Oleh-oleh dan Barang Mewah",
                    "tenant_address": "Terminal Kedatangan Internasional",
                    "tenant_website": "https://kualanamu-airport.co.id",
                    "status": "approved",
                    "is_premium": 0,
                    "promo_type": "jam",
                    "start_date": "2024-01-01",
                    "end_date": "2030-12-31",
                    "start_time": "08:00",
                    "end_time": "22:00",
                    "clicks_achieved": 10,
                    "click_quota": 500
                }
            ],
            "settings": {
                "landingPageSettings": {
                    "logo": "kualanamu.png",
                    "runningText": "Selamat Datang di Bandara Internasional Kualanamu || Nikmati Fasilitas WiFi Gratis || Silakan Login untuk Melanjutkan",
                    "defaultSlideImage": "kualanamu.png",
                    "defaultPromoTitle": "Informasi Bandara",
                    "defaultHeaderText": "Bandara Internasional Kualanamu"
                },
                "defaultPopupSettings": {
                    "logo": "kualanamu.png",
                    "companyName": "Angkasa Pura Aviasi",
                    "description": "Selamat datang di Kualanamu",
                    "website": "https://kualanamu-airport.co.id"
                }
            }
        };

        // === PREMIUM BANNER LOGIC ===
        const premiumOverlay = document.getElementById('premium-banner-overlay');
        const premiumPopup = document.getElementById('premium-banner-popup');
        const skipPremiumBtn = document.getElementById('skip-premium-btn');
        const premiumCountdown = document.getElementById('premium-countdown');
        const premiumBannerImg = premiumPopup ? premiumPopup.querySelector('.premium-banner-img') : null;
        let premiumTimer = 15;
        let premiumInterval = null;
        let premiumSkipped = false;

        // --- TAMBAHAN: Variabel untuk menyimpan promo premium yang sedang tayang ---
        let currentlyDisplayedPremiumPromo = null;

        // Tambah variabel global untuk skip
        let skipBtn = null;
        let skipTimeout = null;

        //--- Fungsi-fungsi ---
        function applySettings() {
            const { landingPageSettings } = settings;
            if (logoImg) {
                if (landingPageSettings?.logo) {
                    let logoPath = '';
                    const baseUrl = (window.LARAVEL_BASE || '').replace(/\/$/, ''); // Remove trailing slash
                    const logoFromSettings = String(landingPageSettings.logo).trim(); // Ensure it's a string and trim

                    if (logoFromSettings.startsWith('ui/')) {
                        logoPath = baseUrl + '/data_image/' + logoFromSettings;
                    } else if (logoFromSettings.startsWith('http://') || logoFromSettings.startsWith('https://')) {
                        logoPath = logoFromSettings;
                    } else {
                        // Jika path tidak dimulai dengan ui/, asumsikan itu path relatif di data_image
                        logoPath = baseUrl + '/landing_page/' + logoFromSettings;
                    }
                    // Ensure no spaces in path - replace spaces with underscores, but keep data_image correct
                    logoPath = logoPath.replace(/data image/g, 'data_image').replace(/\s+/g, '_');

                    // Add error handler to check if image fails to load
                    logoImg.onerror = function () {
                        console.error('Failed to load logo from:', logoPath);
                        // Fallback to default logo
                        const baseUrl = (window.LARAVEL_BASE || '').replace(/\/$/, '');
                        logoImg.src = baseUrl + '/kualanamu.png';
                    };

                    logoImg.onload = function () {
                        console.log('Logo loaded successfully from:', logoPath);
                    };

                    // Force reload image by adding timestamp if it's the same src
                    if (logoImg.src === logoPath || logoImg.src.endsWith(logoPath)) {
                        logoPath = logoPath + '?t=' + Date.now();
                    }

                    logoImg.src = logoPath;
                    logoImg.style.display = 'block'; // Ensure image is visible
                    console.log('Logo path set to:', logoPath);
                    console.log('Logo from settings:', logoFromSettings);
                    console.log('Base URL:', baseUrl);
                } else {
                    // Fallback ke logo default jika settings tidak ada
                    const baseUrl = (window.LARAVEL_BASE || '').replace(/\/$/, '');
                    const defaultLogo = baseUrl + '/landing_page/kualanamu.png';
                    logoImg.src = defaultLogo;
                    console.log('Using default logo:', defaultLogo);
                }
            }
            if (runningTextContent) {
                const textToDisplay = landingPageSettings?.runningText || "Selamat datang di Bandara Internasional Kualanamu.";
                const messages = textToDisplay.split('||').map(msg => msg.trim()).filter(Boolean);
                const separator = '<img src="' + (window.LARAVEL_BASE || '') + '/logo_running_text.png" class="logo-running-text-separator" style="margin:0;">';
                let fullText = (messages.length > 0 ? messages.join(separator) : textToDisplay);
                runningTextContent.innerHTML = `<div class="running-text-inner" style="white-space:nowrap;display:inline-block;">${fullText}</div>`;

                const inner = runningTextContent.querySelector('.running-text-inner');
                if (!inner) return;

                const containerWidth = runningTextContent.offsetWidth;
                const textWidth = inner.offsetWidth;
                let x = containerWidth;
                const speed = 90; // px per detik

                function animate(ts) {
                    if (!animate.lastTs) animate.lastTs = ts;
                    const dt = (ts - animate.lastTs) / 1000;
                    animate.lastTs = ts;

                    x -= speed * dt;
                    if (x <= -textWidth) {
                        x = containerWidth;
                    }
                    inner.style.transform = `translateX(${x}px)`;
                    window._runningTextRaf = requestAnimationFrame(animate);
                }

                inner.style.transform = `translateX(${containerWidth}px)`;
                if (window._runningTextRaf) cancelAnimationFrame(window._runningTextRaf);
                animate.lastTs = null;
                window._runningTextRaf = requestAnimationFrame(animate);
            }
        }

        // --- PERUBAHAN: Fungsi trackClick diubah untuk menerima parameter 'action' ---
        async function trackClick(promoId, tenantId, action = 'click') {
            console.log('Track Click Mocked:', promoId, tenantId, action);
            return { success: true };
        }

        async function openModal(promo) {
            console.log('Opening modal for promo:', promo);
            clearInterval(modalCountdownInterval);
            if (!skipBtn) {
                skipBtn = document.getElementById('modal-skip-btn');
                if (!skipBtn) {
                    // Tambahkan tombol skip jika belum ada
                    const btn = document.createElement('button');
                    btn.id = 'modal-skip-btn';
                    btn.textContent = 'Lewati';
                    btn.style.display = 'none';
                    btn.className = 'modal-skip-btn modern-skip-btn';
                    document.querySelector('#promoModal .modal-content').appendChild(btn);
                    skipBtn = btn;
                }
            }
            skipBtn.style.display = 'none';
            if (skipTimeout) clearTimeout(skipTimeout);
            const { defaultPopupSettings } = settings;
            const isDefaultPromo = !promo.id;
            let targetWebsiteLink = '#';
            const now = new Date();
            // Urutan: logo, nama tenant, gambar, judul, deskripsi
            if (isDefaultPromo) {
                let popupLogo = defaultPopupSettings?.logo || 'https://placehold.co/60x60/EEE/31343C?text=Icon';
                if (popupLogo.startsWith('ui/')) {
                    popupLogo = (window.LARAVEL_BASE || '') + '/data_image/' + popupLogo;
                }
                modalLogo.src = popupLogo;
                modalCompanyName.textContent = defaultPopupSettings?.companyName || 'Informasi Bandara';
                modalImage.src = promo.image_data || 'https://placehold.co/600x400/EEE/31343C?text=Promo';
                modalPromoTitle.textContent = promo.title;
                modalDescription.textContent = defaultPopupSettings?.description || 'Terima kasih telah menggunakan layanan kami.';
                targetWebsiteLink = defaultPopupSettings?.website || '#';
            } else if (promo.is_premium == 1 && promo.premium_start_date && promo.premium_end_date && now >= new Date(promo.premium_start_date) && now <= new Date(promo.premium_end_date)) {
                await trackClick(promo.id, promo.tenant_id, 'click');
                const baseUrl = (window.LARAVEL_BASE || '').replace(/\/$/, '');
                console.log('Premium promo - baseUrl:', baseUrl);
                console.log('Premium promo - tenant_logo_path:', promo.tenant_logo_path);
                console.log('Premium promo - image_path:', promo.image_path);
                const tenantLogoPath = promo.tenant_logo_path
                    ? baseUrl + '/data_image/' + promo.tenant_logo_path.replace(/\s+/g, '_')
                    : 'https://placehold.co/60x60/EEE/31343C?text=Logo';
                console.log('Premium promo - tenantLogoPath:', tenantLogoPath);
                modalLogo.src = tenantLogoPath;
                modalLogo.onerror = function () {
                    console.error('Failed to load tenant logo from:', tenantLogoPath);
                    this.src = 'https://placehold.co/60x60/EEE/31343C?text=Logo';
                };
                modalLogo.style.display = 'block';
                modalCompanyName.textContent = promo.tenant_company_name || promo.tenant_name;
                const promoImagePath = promo.image_path
                    ? baseUrl + '/data_image/' + promo.image_path.replace(/\s+/g, '_')
                    : 'https://placehold.co/600x400/EEE/31343C?text=Promo';
                modalImage.src = promoImagePath;
                modalImage.onerror = function () {
                    console.error('Failed to load promo image from:', promoImagePath);
                    this.src = 'https://placehold.co/600x400/EEE/31343C?text=Promo';
                };
                modalImage.onload = function () {
                    console.log('Promo image loaded successfully from:', promoImagePath);
                };
                modalPromoTitle.textContent = promo.title;
                modalDescription.textContent = promo.description || 'Deskripsi tidak tersedia.';
                targetWebsiteLink = promo.tenant_website || '#';
            } else {
                const clickResult = await trackClick(promo.id, promo.tenant_id, 'click');
                if (!clickResult.success) {
                    alert(clickResult.message || 'Promo sudah tidak tersedia');
                    return;
                }
                const baseUrl = (window.LARAVEL_BASE || '').replace(/\/$/, '');
                console.log('Regular promo - baseUrl:', baseUrl);
                console.log('Regular promo - tenant_logo_path:', promo.tenant_logo_path);
                console.log('Regular promo - image_path:', promo.image_path);
                const tenantLogoPath = promo.tenant_logo_path
                    ? baseUrl + '/data_image/' + promo.tenant_logo_path.replace(/\s+/g, '_')
                    : 'https://placehold.co/60x60/EEE/31343C?text=Logo';
                console.log('Regular promo - tenantLogoPath:', tenantLogoPath);
                modalLogo.src = tenantLogoPath;
                modalLogo.onerror = function () {
                    console.error('Failed to load tenant logo from:', tenantLogoPath);
                    this.src = 'https://placehold.co/60x60/EEE/31343C?text=Logo';
                };
                modalLogo.style.display = 'block';
                modalCompanyName.textContent = promo.tenant_company_name || promo.tenant_name;
                const promoImagePath = promo.image_path
                    ? baseUrl + '/data_image/' + promo.image_path.replace(/\s+/g, '_')
                    : 'https://placehold.co/600x400/EEE/31343C?text=Promo';
                console.log('Regular promo - promoImagePath:', promoImagePath);
                modalImage.src = promoImagePath;
                modalImage.onerror = function () {
                    console.error('Failed to load promo image from:', promoImagePath);
                    this.src = 'https://placehold.co/600x400/EEE/31343C?text=Promo';
                };
                modalImage.onload = function () {
                    console.log('Promo image loaded successfully from:', promoImagePath);
                };
                modalPromoTitle.textContent = promo.title;
                modalDescription.textContent = promo.description || 'Deskripsi tidak tersedia.';
                targetWebsiteLink = promo.tenant_website || '#';
            }
            promoModal.style.display = 'flex';
            let popupCountdown = 4;
            modalCountdownElement.textContent = `Akan dialihkan dalam ${popupCountdown} detik...`;
            modalCountdownInterval = setInterval(async () => {
                popupCountdown--;
                if (popupCountdown > 0) {
                    modalCountdownElement.textContent = `Akan dialihkan dalam ${popupCountdown} detik...`;
                } else {
                    clearInterval(modalCountdownInterval);
                    modalCountdownElement.textContent = '';
                    skipBtn.style.display = 'block';
                }
            }, 1000);
            skipBtn.onclick = async function () {
                window.location.href = '';
            };
        }

        function closeModal() {
            promoModal.style.display = 'none';
            clearInterval(modalCountdownInterval);
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function loadSlidesAndInitSwiper(includePremium = false) {
            if (swiperInstance) {
                swiperInstance.destroy(true, true);
            }
            if (!swiperWrapper) return;

            swiperWrapper.innerHTML = '';
            let finalPromos = [];
            const now = new Date();

            if (includePremium) {
                finalPromos = allPromos.filter(promo => {
                    // PERBAIKAN: Terima status 'aktif' atau 'approved'
                    if (promo.status !== 'approved' && promo.status !== 'aktif') return false;
                    if (promo.is_premium == 1) {
                        if (promo.premium_start_date && promo.premium_end_date) {
                            const startDate = new Date(promo.premium_start_date);
                            const endDate = new Date(promo.premium_end_date);
                            return now >= startDate && now <= endDate;
                        }
                        return false;
                    } else if (promo.promo_type === 'tanggal') {
                        if (!promo.start_date || !promo.end_date) return false;
                        const startDate = new Date(promo.start_date + 'T00:00:00');
                        const endDate = new Date(promo.end_date + 'T23:59:59');
                        return now >= startDate && now <= endDate;
                    } else if (promo.promo_type === 'jam') {
                        if (!promo.start_date || !promo.end_date || !promo.start_time || !promo.end_time) return false;
                        const startDateTime = new Date(promo.start_date + 'T' + promo.start_time);
                        const endDateTime = new Date(promo.end_date + 'T' + promo.end_time);
                        return now >= startDateTime && now <= endDateTime;
                    } else if (promo.promo_type === 'klik') {
                        return promo.clicks_achieved < promo.click_quota;
                    }
                    return false;
                });
            } else {
                finalPromos = allPromos.filter(promo => {
                    // PERBAIKAN: Terima status 'aktif' atau 'approved'
                    if ((promo.status !== 'approved' && promo.status !== 'aktif') || promo.is_premium == 1) return false;
                    if (promo.promo_type === 'tanggal') {
                        if (!promo.start_date || !promo.end_date) return false;
                        const startDate = new Date(promo.start_date + 'T00:00:00');
                        const endDate = new Date(promo.end_date + 'T23:59:59');
                        return now >= startDate && now <= endDate;
                    } else if (promo.promo_type === 'jam') {
                        if (!promo.start_date || !promo.end_date || !promo.start_time || !promo.end_time) return false;
                        const startDateTime = new Date(promo.start_date + 'T' + promo.start_time);
                        const endDateTime = new Date(promo.end_date + 'T' + promo.end_time);
                        return now >= startDateTime && now <= endDateTime;
                    } else if (promo.promo_type === 'klik') {
                        return promo.clicks_achieved < promo.click_quota;
                    }
                    return false;
                });
            }

            if (finalPromos.length === 0 && settings.landingPageSettings?.defaultSlideImage) {
                let defaultImg = settings.landingPageSettings.defaultSlideImage;
                if (defaultImg.startsWith('ui/')) {
                    defaultImg = (window.LARAVEL_BASE || '') + '/data_image/' + defaultImg;
                }
                finalPromos = [{
                    title: settings.landingPageSettings?.defaultPromoTitle || "Selamat Datang",
                    header_text: settings.landingPageSettings?.defaultHeaderText || "Promo Saat Ini",
                    image_data: defaultImg
                }];
            }
            if (finalPromos.length > 1) {
                shuffleArray(finalPromos);
            }
            let enableLoop = false;
            let enableAutoplay = false;
            let slidesToRender = [...finalPromos];
            if (finalPromos.length === 1) {
                enableLoop = false;
                enableAutoplay = false;
            } else if (finalPromos.length === 2) {
                enableLoop = true;
                enableAutoplay = true;
                slidesToRender = [finalPromos[0], finalPromos[1], finalPromos[0], finalPromos[1], finalPromos[0], finalPromos[1]];
            } else if (finalPromos.length === 3) {
                enableLoop = true;
                enableAutoplay = true;
                slidesToRender = [finalPromos[0], finalPromos[1], finalPromos[2], finalPromos[0], finalPromos[1], finalPromos[2]];
            } else if (finalPromos.length === 4) {
                enableLoop = true;
                enableAutoplay = true;
                slidesToRender = [finalPromos[0], finalPromos[1], finalPromos[2], finalPromos[3], finalPromos[0], finalPromos[1], finalPromos[2], finalPromos[3]];
            } else if (finalPromos.length >= 5) {
                enableLoop = true;
                enableAutoplay = true;
                slidesToRender = finalPromos;
            }
            slidesToRender.forEach(promo => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide' + (promo.isPremium ? ' premium-slide' : '');
                slide.dataset.promoData = JSON.stringify(promo);
                const imageUrl = promo.image_data || '';
                slide.dataset.bgImage = imageUrl;
                slide.innerHTML = `<a href="#" aria-label="Lihat promo ${promo.title}"><img src="${imageUrl}" alt="Banner Promosi: ${promo.title}"></a>`;
                swiperWrapper.appendChild(slide);
            });
            swiperInstance = new Swiper('.swiper-container-3d', {
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                loop: enableLoop,
                slidesPerView: 'auto',
                autoplay: false,
                coverflowEffect: {
                    rotate: 20,
                    stretch: 0,
                    depth: 100,
                    modifier: 1.2,
                    slideShadows: true
                },
                on: {
                    slideChange: function () {
                        if (!this.slides[this.activeIndex]) return;
                        const promo = JSON.parse(this.slides[this.activeIndex].dataset.promoData);
                        titleElement.textContent = promo.title || settings.landingPageSettings?.defaultPromoTitle || 'Informasi Promo';
                        backgroundElement.style.backgroundImage = `url('${this.slides[this.activeIndex].dataset.bgImage}')`;
                    }
                }
            });
            if (swiperInstance.slides && swiperInstance.slides.length > 0) {
                const firstSlide = swiperInstance.slides[swiperInstance.activeIndex];
                if (firstSlide) {
                    const promo = JSON.parse(firstSlide.dataset.promoData);
                    titleElement.textContent = promo.title || settings.landingPageSettings?.defaultPromoTitle || 'Informasi Promo';
                    backgroundElement.style.backgroundImage = `url('${firstSlide.dataset.bgImage}')`;
                }
            }
            setTimeout(() => {
                if (swiperInstance && swiperInstance.params) {
                    swiperInstance.params.autoplay = {
                        delay: 5000,
                        disableOnInteraction: false
                    };
                    swiperInstance.autoplay.start();
                }
            }, 10000);
        }

        function updateDateTime() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' };
            if (footerDateElement) footerDateElement.textContent = now.toLocaleDateString('id-ID', options);
            if (footerClockElement) footerClockElement.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(/\./g, ':');

            const footerDateElementMobile = document.getElementById('footer-date-mobile');
            const footerClockElementMobile = document.getElementById('footer-clock-mobile');
            if (footerDateElementMobile) footerDateElementMobile.textContent = now.toLocaleDateString('id-ID', options);
            if (footerClockElementMobile) footerClockElementMobile.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(/\./g, ':');
        }

        function showLoginButton() {
            if (!countdownText || !loginButtonContainer) return;
            let countdownValue = 10;
            countdownText.style.display = 'block';
            countdownText.textContent = `Petunjuk detail akan muncul dalam ${countdownValue}...`;
            const countdownInterval = setInterval(() => {
                countdownValue--;
                if (countdownValue > 0) {
                    countdownText.textContent = `Petunjuk detail akan muncul dalam ${countdownValue}...`;
                } else {
                    clearInterval(countdownInterval);
                    countdownText.style.display = 'none';
                    loginButtonContainer.classList.add('visible');
                }
            }, 1000);
        }

        function showPremiumBanner() {
            if (!premiumOverlay || !premiumPopup) {
                return;
            }
            const now = new Date();
            const premiumPromos = allPromos.filter(promo => {
                // PERBAIKAN: Terima status 'aktif' atau 'approved'
                if (promo.is_premium != 1 || (promo.status !== 'approved' && promo.status !== 'aktif')) return false;
                if (promo.premium_pause_start && promo.premium_pause_start !== '0000-00-00 00:00:00' && promo.premium_pause_start !== null) return false;
                if (promo.premium_start_date && promo.premium_end_date) {
                    const startDate = new Date(promo.premium_start_date);
                    const endDate = new Date(promo.premium_end_date);
                    return now >= startDate && now <= endDate;
                }
                return false;
            });

            if (premiumPromos.length === 0) {
                loadSlidesAndInitSwiper(false);
                return;
            }

            const promosToShow = premiumPromos.slice(0, 2);
            let currentIdx = 0;

            function showSinglePremium(idx) {
                const premiumPromo = promosToShow[idx];
                currentlyDisplayedPremiumPromo = premiumPromo;
                const premiumTitle = document.getElementById('premium-banner-title');
                const premiumBannerImg = document.querySelector('.premium-banner-img');
                if (premiumTitle) premiumTitle.textContent = premiumPromo.title || 'Promo Premium Spesial!';
                if (premiumBannerImg && premiumPromo.image_data) {
                    premiumBannerImg.src = premiumPromo.image_data;
                }
                const premiumDesc = document.getElementById('premium-banner-desc');
                if (premiumDesc) premiumDesc.style.display = 'none';
            }

            function nextPremium() {
                currentIdx++;
                if (currentIdx < promosToShow.length) {
                    showSinglePremium(currentIdx);
                    premiumTimer = 15;
                    if (premiumCountdown) premiumCountdown.textContent = premiumTimer;
                    skipPremiumBtn.style.display = 'none';
                } else {
                    hidePremiumBanner();
                }
            }

            showSinglePremium(currentIdx);
            premiumOverlay.style.display = 'flex';
            premiumPopup.classList.remove('fadeout');
            premiumOverlay.classList.remove('fadeout');
            premiumTimer = 15;
            if (premiumCountdown) premiumCountdown.textContent = premiumTimer;
            skipPremiumBtn.style.display = 'none';
            premiumSkipped = false;
            if (premiumInterval) clearInterval(premiumInterval);
            premiumInterval = setInterval(() => {
                premiumTimer--;
                if (premiumCountdown) premiumCountdown.textContent = premiumTimer < 10 ? '0' + premiumTimer : premiumTimer;
                if (premiumTimer === 9 && skipPremiumBtn.style.display === 'none') {
                    skipPremiumBtn.style.display = 'block';
                }
                if (premiumTimer <= 0) {
                    nextPremium();
                }
            }, 1000);
        }

        function hidePremiumBanner() {
            if (!premiumOverlay || !premiumPopup) return;
            clearInterval(premiumInterval);
            premiumPopup.classList.add('fadeout');
            premiumOverlay.classList.add('fadeout');
            setTimeout(() => {
                premiumOverlay.style.display = 'none';
                premiumPopup.classList.remove('fadeout');
                premiumOverlay.classList.remove('fadeout');
                insertPremiumBannerToCarousel();
            }, 600);
        }

        if (skipPremiumBtn) {
            skipPremiumBtn.addEventListener('click', () => {
                if (currentlyDisplayedPremiumPromo) {
                    trackClick(currentlyDisplayedPremiumPromo.id, currentlyDisplayedPremiumPromo.tenant_id, 'skip');
                }
                premiumSkipped = true;
                hidePremiumBanner();
            });
        }

        function insertPremiumBannerToCarousel() {
            const now = new Date();
            const hasPremiumPromos = allPromos.some(promo => {
                // PERBAIKAN: Terima status 'aktif' atau 'approved'
                if (promo.is_premium != 1 || (promo.status !== 'approved' && promo.status !== 'aktif')) return false;
                if (promo.premium_start_date && promo.premium_end_date) {
                    const startDate = new Date(promo.premium_start_date);
                    const endDate = new Date(promo.premium_end_date);
                    return now >= startDate && now <= endDate;
                }
                return false;
            });
            loadSlidesAndInitSwiper(hasPremiumPromos);
        }

        async function initializePage() {
            try {
                // Gunakan data mock langsung
                const result = MOCK_DATA;
                // const response = await fetch(API_URL); // DIBUANG: penyebab error
                // const result = await response.json();

                if (result.success) {
                    allPromos = (result.activePromos || []).map(promo => {
                        let imgPath = '';
                        if (promo.image_path && promo.image_path !== '') {
                            imgPath = (window.LARAVEL_BASE || '') + '/data_image/' + promo.image_path;
                        } else if (result.settings && result.settings.landingPageSettings && result.settings.landingPageSettings.defaultSlideImage) {
                            imgPath = result.settings.landingPageSettings.defaultSlideImage;
                        } else {
                            imgPath = 'https://placehold.co/600x400/EEE/31343C?text=Promo';
                        }
                        return {
                            ...promo,
                            image_data: imgPath,
                            tenant_logo: promo.tenant_logo_path ? (window.LARAVEL_BASE || '') + '/data_image/' + promo.tenant_logo_path : '',
                            tenant_company_name: promo.tenant_company_name || '',
                            tenant_description: promo.tenant_description || '',
                            tenant_address: promo.tenant_address || '',
                            tenant_website: promo.tenant_website || ''
                        };
                    });
                    settings = result.settings;
                    applySettings();
                    loadSlidesAndInitSwiper(false);
                    showPremiumBanner();
                } else {
                    loadSlidesAndInitSwiper(false);
                }
            } catch (error) {
                console.error("Failed to initialize page:", error);
                loadSlidesAndInitSwiper(false);
            }

            updateDateTime();
            setInterval(updateDateTime, 1000);
            setTimeout(showLoginButton, 2000);
        }

        if (closeButton) closeButton.addEventListener('click', () => closeModal());

        window.addEventListener('click', (event) => {
            if (event.target === promoModal) closeModal();
        });

        if (swiperWrapper) {
            swiperWrapper.addEventListener('click', async (event) => {
                const clickedSlide = event.target.closest('.swiper-slide');
                if (clickedSlide) {
                    event.preventDefault();
                    const promoData = JSON.parse(clickedSlide.dataset.promoData);
                    await openModal(promoData);
                }
            });
        }

        initializePage();
    });

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategoryData } from '../hooks/useCategoryData.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { dataService } from '../services/dataService.js';
import ContentCard from '../components/cards/ContentCard.jsx';
import CharacterCard from '../components/cards/CharacterCard.jsx';
import EventCard from '../components/cards/EventCard.jsx';
import LightboxGallery from '../components/interactive/LightboxGallery.jsx';
import VideoModal from '../components/interactive/VideoModal.jsx';
import CategoryContentRow from '../components/interactive/CategoryContentRow.jsx';
import SakuraEffect from '../components/interactive/SakuraEffect.jsx';
import KpopIdolStageEffect from '../components/interactive/KpopIdolStageEffect.jsx';
import MoviesProjectorEffect from '../components/interactive/MoviesProjectorEffect.jsx';
import MangaActionEffect from '../components/interactive/MangaActionEffect.jsx';
import GamingHextechEffect from '../components/interactive/GamingHextechEffect.jsx';
import ComicsSpiderWebEffect from '../components/interactive/ComicsSpiderWebEffect.jsx';
import DragonFireEmbersEffect from '../components/interactive/DragonFireEmbersEffect.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useVideoVisibilityAutoplay } from '../hooks/useVideoVisibilityAutoplay.js';
import { useDataSync } from '../hooks/useDataSync.js';

export default function CategoryHub() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { categoryId } = useParams();
  const { categoryInfo, contents, characters, events, franchises, isValidCategory } = useCategoryData(categoryId);
  const isMovies = categoryId === 'movies';
  const isGaming = categoryId === 'gaming';
  const isAnime = categoryId === 'anime';
  const isKpop = categoryId === 'kpop';
  const isManga = categoryId === 'manga';
  const isComics = categoryId === 'comics';
  const isTvShows = categoryId === 'tvshows';
  const { isDark } = useTheme();
  const dataVersion = useDataSync();

  // Unified Cinematic Hero Video state (matching Anime across all categories)
  const [heroMuted, setHeroMuted] = useState(true);
  const heroVideoRef = useRef(null);

  const toggleHeroAudio = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !heroMuted;
      setHeroMuted(!heroMuted);
    }
  };

  useEffect(() => {
    setHeroMuted(true);
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => {});
    }
  }, [categoryId]);

  const isVi = language === 'vi';

  const heroConfig = useMemo(() => {
    const configs = {
      anime: {
        videoSrc: '/GunDam.mp4',
        badgeText: 'Anime Exclusive',
        badgeGradient: 'linear-gradient(135deg, #FF6B81, #ff4757)',
        badgeShadow: 'rgba(255, 107, 129, 0.35)',
        videoTitle: isVi ? 'Mobile Suit Gundam: Chiến Binh Thép Tái Xuất' : 'Mobile Suit Gundam: Iron-Blooded Warriors',
        heroSubtitle: '• Mobile Suit GunDam',
        heroDesc: isVi
          ? 'Khám phá thế giới hoạt hình Nhật Bản đỉnh cao, các tác phẩm shounen huyền thoại cùng trailer bom tấn Mobile Suit Gundam: Chiến Binh Thép Tái Xuất với những màn đại chiến mecha mãn nhãn.'
          : 'Explore top Japanese animation, legendary shounen masterpieces, and the blockbuster Mobile Suit Gundam trailer featuring visually breathtaking mecha battles.',
        effect: <SakuraEffect autoStart={true} />,
      },
      gaming: {
        videoSrc: '/video_lol.mp4',
        badgeText: 'Gaming Exclusive',
        badgeGradient: 'linear-gradient(135deg, #00cec9, #0984e3)',
        badgeShadow: 'rgba(0, 206, 201, 0.35)',
        videoTitle: 'League of Legends: Cinematic eSports',
        heroSubtitle: '• League of Legends & eSports',
        heroDesc: isVi
          ? 'Thế giới game đỉnh cao, eSports chuyên nghiệp, các tựa game bom tấn AAA cùng trailer bom tấn League of Legends Cinematic với những trận đại chiến huyền thoại và đồ họa tương lai mãn nhãn.'
          : 'High-octane gaming, pro eSports, blockbuster AAA titles, and cinematic League of Legends trailers featuring legendary showdowns and stunning futuristic visuals.',
        effect: <GamingHextechEffect autoStart={true} />,
      },
      manga: {
        videoSrc: '/manga-hero-video.mp4',
        badgeText: 'Manga Exclusive',
        badgeGradient: 'linear-gradient(135deg, #d35400, #E17055)',
        badgeShadow: 'rgba(211, 84, 0, 0.35)',
        videoTitle: 'Manga Shounen Jump & Seinen Masterpieces',
        heroSubtitle: isVi ? '• Kho Tàng Truyện Tranh Huyền Thoại' : '• Legendary Manga Masterpieces',
        heroDesc: isVi
          ? 'Đắm chìm vào những trang truyện tranh kinh điển, các nét vẽ mực đỉnh cao từ Eiichiro Oda, Gege Akutami, Kentaro Miura đến thế giới shounen bùng nổ cảm xúc.'
          : 'Immerse yourself in timeless manga chapters, masterwork ink drawings from legendary mangaka, and emotional shounen adventures.',
        effect: <MangaActionEffect autoStart={true} />,
      },
      movies: {
        videoSrc: '/movies-hero-video.mp4',
        badgeText: 'Cinema Exclusive',
        badgeGradient: 'linear-gradient(135deg, #0984E3, #00a8ff)',
        badgeShadow: 'rgba(9, 132, 227, 0.35)',
        videoTitle: 'Hollywood & Vũ Trụ Điện Ảnh Marvel/DC',
        heroSubtitle: isVi ? '• Bom Tấn Màn Bạc & Kỹ Xảo Điện Ảnh' : '• Silver Screen Blockbusters & CGI',
        heroDesc: isVi
          ? 'Hòa mình vào vũ trụ điện ảnh đỉnh cao, những kiệt tác màn ảnh rộng, vũ trụ đa chiều MCU & DC cùng kỹ xảo CGI mãn nhãn hàng đầu thế giới.'
          : 'Step into epic cinematic universes, silver screen masterpieces, Marvel and DC multiverses, and world-class visual effects.',
        effect: <MoviesProjectorEffect autoStart={true} />,
      },
      tvshows: {
        videoSrc: '/dragon.mp4',
        badgeText: 'House of the Dragon 4K',
        badgeGradient: 'linear-gradient(135deg, #d63031 0%, #e17055 50%, #f39c12 100%)',
        badgeShadow: 'rgba(214, 48, 49, 0.45)',
        videoTitle: isVi
          ? 'House of the Dragon: Vũ Điệu Của Bầy Rồng (Dance of the Dragons)'
          : 'House of the Dragon: Dance of the Dragons',
        heroSubtitle: isVi
          ? '• House of the Dragon & Vũ Trụ Game of Thrones'
          : '• House of the Dragon & Game of Thrones Universe',
        heroDesc: isVi
          ? 'Bước vào kỷ nguyên huy hoàng và tàn khốc của Gia tộc Targaryen, nơi bầu trời rực lửa bởi những con rồng khổng lồ Caraxes, Vhagar và Syrax trong cuộc đại chiến vương quyền đẫm máu "Vũ Điệu Của Bầy Rồng".'
          : 'Step into the glorious and brutal reign of House Targaryen, where skies burn with legendary dragons Caraxes, Vhagar, and Syrax in the bloodiest civil war for the Iron Throne: The Dance of the Dragons.',
        effect: <DragonFireEmbersEffect autoStart={true} />,
      },
      kpop: {
        videoSrc: '/Kpol.mp4',
        badgeText: 'K-Pop Comeback Stage 4K',
        badgeGradient: 'linear-gradient(135deg, #ff5ba8 0%, #a06cff 50%, #4fd8ff 100%)',
        badgeShadow: 'rgba(255, 91, 168, 0.45)',
        videoTitle: isVi ? 'K-Pop Comeback Stage: Vũ Đạo & Thần Thái Đỉnh Cao' : 'K-Pop Comeback Stage: Elite Choreography & Visuals',
        heroSubtitle: isVi ? '• K-Pop Live Stage & Làn Sóng Hallyu' : '• K-Pop Live Stage & Hallyu Wave',
        heroDesc: isVi
          ? 'Đắm chìm vào những màn vũ đạo bùng nổ, visual tỏa sáng và thần thái đỉnh cao từ các nhóm nhạc hàng đầu K-Pop, hòa cùng biển lightstick rực rỡ và giai điệu bắt tai gây sốt toàn cầu.'
          : 'Immerse yourself in electrifying choreography, shining visuals, and charismatic performances from top K-Pop idols, amidst glowing oceans of lightsticks.',
        effect: <KpopIdolStageEffect autoStart={true} />,
      },
      comics: {
        videoSrc: '/spiderman-hero.mp4',
        badgeText: 'Spider-Man & Marvel Comics',
        badgeGradient: 'linear-gradient(135deg, #e74c3c 0%, #0984e3 100%)',
        badgeShadow: 'rgba(231, 76, 60, 0.45)',
        videoTitle: isVi ? 'Spider-Man: Vũ Trụ Đa Chiều & Marvel Comics' : 'Spider-Man: Multiverse & Marvel Comics',
        heroSubtitle: isVi ? '• Spider-Man & Kỷ Nguyên Siêu Anh Hùng' : '• Spider-Man & Superhero Era',
        heroDesc: isVi
          ? 'Đắm chìm vào thế giới siêu anh hùng Người Nhện (Spider-Man), những màn đu tơ bay lượn nghẹt thở giữa các tòa nhà chọc trời New York, giác quan nhện nhạy bén và kỷ nguyên truyện tranh Marvel & DC bất hủ.'
          : 'Swing through New York skyscrapers with Spider-Man, experience hyper-acute spider-sense, and dive into timeless Marvel and DC comic eras.',
        effect: <ComicsSpiderWebEffect autoStart={true} />,
      },
    };
    return configs[categoryId] || configs.anime;
  }, [categoryId, isVi]);

  // Tự dừng video hero khi cuộn ra khỏi màn hình hoặc khi rời trang, để web mượt hơn
  useVideoVisibilityAutoplay(heroVideoRef, heroConfig.videoSrc);

  // Content Filters
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Character Filter
  const [selectedFranchise, setSelectedFranchise] = useState('all');

  // Event Filter
  const [selectedEventStatus, setSelectedEventStatus] = useState('all');

  // Modals
  const [lightboxImages, setLightboxImages] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  // Dynamic format count mapping for badges
  const formatCounts = useMemo(() => {
    const counts = { all: contents.length, article: 0, gallery: 0, video: 0, audio: 0 };
    contents.forEach((c) => {
      if (counts[c.type] !== undefined) {
        counts[c.type]++;
      }
    });
    return counts;
  }, [contents]);

  // Google SEO / Lighthouse optimization: dynamic title, meta description & Schema.org JSON-LD
  useEffect(() => {
    if (categoryInfo) {
      const prevTitle = document.title;
      document.title = `${categoryInfo.name || categoryInfo.label} Hub — Vũ Trụ Anime, Bài Viết & Nhân Vật | FandomVerse`;

      let metaDesc = document.querySelector('meta[name="description"]');
      let createdMeta = false;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
        createdMeta = true;
      }
      const prevMetaDesc = metaDesc.content;
      metaDesc.content = `${categoryInfo.description} Khám phá ${contents.length} bài viết & media, ${characters.length} nhân vật tiêu biểu và ${events.length} sự kiện nổi bật trong vũ trụ ${categoryInfo.label}.`;

      // Schema.org JSON-LD CollectionPage
      const scriptId = 'schema-category-hub';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${categoryInfo.label} Hub — FandomVerse`,
        description: categoryInfo.description,
        url: window.location.href,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: contents.length,
          itemListElement: contents.map((c, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: c.title,
            description: c.shortDescription,
            image: c.thumbnail,
            url: `${window.location.origin}${window.location.pathname}#/category/${categoryId}/article/${c.id}`,
          })),
        },
      };
      script.textContent = JSON.stringify(schemaData);

      return () => {
        document.title = prevTitle;
        if (createdMeta && metaDesc) {
          metaDesc.remove();
        } else if (metaDesc) {
          metaDesc.content = prevMetaDesc;
        }
        const existingScript = document.getElementById(scriptId);
        if (existingScript) existingScript.remove();
      };
    }
  }, [categoryInfo, contents, characters, events, categoryId]);

  // Sorted once; each per-type list below is a filter of it (sort is stable, so order is unchanged)
  const sortedContents = useMemo(() => {
    return dataService.getContentsByCategory(categoryId, { sort: selectedSort });
  }, [categoryId, selectedSort, language, dataVersion]);

  const filteredContents = useMemo(
    () => (selectedType === 'all' ? sortedContents : sortedContents.filter((c) => c.type === selectedType)),
    [sortedContents, selectedType]
  );

  const [videoContents, galleryContents, articleContents, audioContents] = useMemo(
    () => ['video', 'gallery', 'article', 'audio'].map((type) => sortedContents.filter((c) => c.type === type)),
    [sortedContents]
  );

  // Filtered Characters
  const filteredCharacters = useMemo(() => {
    return dataService.getCharactersByCategory(categoryId, {
      franchise: selectedFranchise,
    });
  }, [categoryId, selectedFranchise, language, dataVersion]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return dataService.getEventsByCategory(categoryId, {
      status: selectedEventStatus,
    });
  }, [categoryId, selectedEventStatus, language]);

  if (!isValidCategory) {
    return (
      <div className="container-fluid px-3 px-md-4 px-lg-5 py-5 text-center">
        <EmptyState
          title={t('categoryHub.notFoundTitle')}
          message={t('categoryHub.notFoundMessage', { categoryId })}
          actionLabel={t('categoryHub.backHome')}
          onAction={() => (window.location.hash = '#/')}
        />
      </div>
    );
  }

  return (
    <div className={`container-fluid px-2 px-sm-3 px-md-4 px-xl-5 py-3 ${isGaming ? 'gaming-universe-container' : ''} ${isAnime ? 'anime-universe-container' : ''} ${isKpop ? 'kpop-universe-container' : ''} ${isMovies ? 'movies-universe-container' : ''} ${isManga ? 'manga-universe-container' : ''} ${isComics ? 'comics-universe-container' : ''} ${categoryId}-universe-container`}>
      {/* EXCLUSIVE CINEMATIC HERO BANNER — WIDESCREEN & EXPANDED CANVAS */}
      <div className={`category-cinema-hero ${categoryId}-cinema-hero mb-4`}>
        <video
          key={heroConfig.videoSrc}
          ref={heroVideoRef}
          className="category-cinema-hero-bg"
          src={heroConfig.videoSrc}
          autoPlay
          loop
          muted={heroMuted}
          playsInline
        />
        <div className="category-cinema-hero-scrim" />

        <div className="category-cinema-hero-content">
          <div className="category-cinema-hero-eyebrow">
            <span className={`badge-category badge-category-${categoryId} fs-6`}>
              <i className={`bi ${categoryInfo.icon} me-1`}></i> Fandom Universe
            </span>
            <span
              className="badge rounded-pill px-3 py-1 text-white small d-inline-flex align-items-center gap-1"
              style={{
                background: heroConfig.badgeGradient,
                boxShadow: `0 2px 8px ${heroConfig.badgeShadow}`,
              }}
            >
              <i className="bi bi-stars"></i> {heroConfig.badgeText}
            </span>
            <span
              className="badge rounded-pill px-3 py-1 text-white small d-inline-flex align-items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <i className="bi bi-play-circle-fill"></i> {isVi ? 'Video Nổi Bật' : 'Featured Video'}
            </span>
            {heroConfig.effect}
          </div>

          {isTvShows ? (
            <div className="dragon-hero-headline-block mb-3">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge-targaryen-realm">
                  <i className="bi bi-shield-fill text-danger me-1"></i> HBO ORIGINAL • GAME OF THRONES UNIVERSE
                </span>
                <span className="badge-valyrian-steel">
                  HOUSE TARGARYEN
                </span>
              </div>
              <h1 className="dragon-cinema-main-title">
                HOUSE <span className="dragon-fire-text">OF THE</span> DRAGON
              </h1>
              <div className="dragon-cinema-tagline">
                <span className="tagline-rune">⚔️</span>
                <span className="tagline-text">{isVi ? 'VŨ ĐIỆU CỦA BẦY RỒNG • FIRE & BLOOD' : 'DANCE OF THE DRAGONS • FIRE & BLOOD'}</span>
                <span className="tagline-rune">⚔️</span>
              </div>
            </div>
          ) : (
            <h1 className="category-cinema-hero-title text-white">
              {categoryInfo.label}
              <span className="ms-2 fs-4 fw-normal text-white-50 d-block d-sm-inline">
                {heroConfig.heroSubtitle}
              </span>
            </h1>
          )}

          <p className="category-cinema-hero-desc">
            {heroConfig.heroDesc}
          </p>

          <div className="category-cinema-hero-actions">
            <button
              type="button"
              className="category-cinema-hero-cta"
              style={{
                background: heroConfig.badgeGradient,
                boxShadow: `0 8px 24px ${heroConfig.badgeShadow}`,
              }}
              onClick={() => setActiveVideo({
                id: `${categoryId}-hero-video`,
                title: heroConfig.videoTitle,
                mediaUrl: heroConfig.videoSrc,
              })}
            >
              <i className="bi bi-play-circle-fill fs-5"></i>
              <span>{isVi ? 'Xem Bản Chi Tiết (Full Video)' : 'Watch Full Video'}</span>
            </button>

            {isTvShows && (
              <button
                type="button"
                className="category-cinema-hero-btn-dragon"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('fv-trigger-dracarys'));
                }}
                title={isVi ? 'Nhấn để giải phóng ngọn lửa rồng Dracarys!' : 'Click to unleash dragon fire breath!'}
              >
                <span>🔥</span>
                <span>{isVi ? 'Phun Lửa Rồng (Dracarys)' : 'Dracarys Fire Breath'}</span>
              </button>
            )}

            <button
              type="button"
              className="category-cinema-hero-btn-secondary"
              onClick={toggleHeroAudio}
              title={heroMuted ? (isVi ? 'Bật âm thanh video' : 'Unmute video') : (isVi ? 'Tắt tiếng video' : 'Mute video')}
            >
              <i className={`bi ${heroMuted ? 'bi-volume-mute-fill' : 'bi-volume-up-fill'} fs-6`}></i>
              <span>{heroMuted ? (isVi ? 'Bật Âm Thanh' : 'Unmute') : (isVi ? 'Tắt Âm Thanh' : 'Mute')}</span>
            </button>

            <button
              type="button"
              className="movies-hero-icon-btn"
              aria-label={isVi ? 'Chia sẻ' : 'Share'}
              title={isVi ? 'Sao chép liên kết chia sẻ' : 'Copy share link'}
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert(isVi ? ('Đã sao chép liên kết vũ trụ ' + categoryInfo.label + ' vào bộ nhớ tạm!') : ('Copied link for ' + categoryInfo.label + ' to clipboard!'));
              }}
            >
              <i className="bi bi-share-fill"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Format Filter Bar (Tất cả, Bài viết, Video, Bộ ảnh, Audio) & Sort */}
      <div
        className="d-flex flex-wrap align-items-center justify-content-between gap-3 my-4 p-3 rounded-4 shadow-sm"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border-color)',
        }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="small fw-bold text-uppercase me-1" style={{ color: `var(--accent-${categoryId}, #6C5CE7)` }}>
            <i className="bi bi-funnel-fill me-1"></i> {isVi ? 'Định dạng:' : 'Format:'}
          </span>
          {[
            { id: 'all', label: isVi ? 'Tất cả' : 'All', count: formatCounts.all, icon: 'bi-grid-fill' },
            { id: 'article', label: isVi ? 'Bài viết' : 'Articles', count: formatCounts.article, icon: 'bi-file-text-fill' },
            { id: 'video', label: 'Video', count: formatCounts.video, icon: 'bi-play-circle-fill' },
            { id: 'gallery', label: isVi ? 'Bộ ảnh' : 'Galleries', count: formatCounts.gallery, icon: 'bi-images' },
            { id: 'audio', label: 'Audio', count: formatCounts.audio, icon: 'bi-soundwave' },
          ].map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 border-0 transition-all ${
                selectedType === fmt.id
                  ? 'text-white shadow-sm'
                  : isDark ? 'text-white-50 bg-white bg-opacity-10 hover-text-white' : 'text-secondary bg-light'
              }`}
              style={{
                background: selectedType === fmt.id ? `var(--accent-${categoryId}, #6C5CE7)` : undefined,
                fontSize: '0.82rem',
              }}
              onClick={() => setSelectedType(fmt.id)}
            >
              <i className={`bi ${fmt.icon}`}></i>
              <span>{fmt.label}</span>
              <span className="badge rounded-pill bg-black bg-opacity-25 ms-1" style={{ fontSize: '0.72rem' }}>
                {fmt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="d-flex align-items-center gap-2 ms-auto">
          <span className={`small ${isDark ? 'text-white-50' : 'text-secondary'}`}>
            <i className="bi bi-sort-down me-1"></i> {isVi ? 'Sắp xếp:' : 'Sort:'}
          </span>
          <select
            className={`form-select form-select-sm rounded-pill ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`}
            style={{ width: 'auto', minWidth: '140px' }}
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            <option value="newest">{isVi ? 'Mới nhất' : 'Newest'}</option>
            <option value="featured">{isVi ? 'Nổi bật' : 'Featured'}</option>
            <option value="alphabetical">{isVi ? 'Theo tên (A-Z)' : 'Alphabetical'}</option>
          </select>
        </div>
      </div>

      {/* When filtering a specific format: show dedicated responsive grid */}
      {selectedType !== 'all' ? (
        <div className="fv-category-filtered-grid mb-5">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom border-white-50 border-opacity-10">
            <h4 className={`fw-bold mb-0 ${isDark ? 'text-white' : 'text-dark'}`}>
              {selectedType === 'article' && (isVi ? 'Danh Sách Toàn Bộ Bài Viết' : 'All Articles & Analysis')}
              {selectedType === 'video' && (isVi ? 'Danh Sách Video Đặc Sắc' : 'Featured Videos')}
              {selectedType === 'gallery' && (isVi ? 'Danh Sách Bộ Sưu Tập Ảnh' : 'Photo Galleries')}
              {selectedType === 'audio' && (isVi ? 'Danh Sách Podcast & Bản Âm Thanh' : 'Podcasts & Audios')}
              <span className="badge rounded-pill ms-2 fs-6" style={{ background: `var(--accent-${categoryId}, #6C5CE7)` }}>
                {filteredContents.length}
              </span>
            </h4>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => setSelectedType('all')}
            >
              <i className="bi bi-arrow-left me-1"></i> {isVi ? 'Xem tất cả chuyên mục' : 'View all sections'}
            </button>
          </div>

          <div className="row g-3 g-md-4">
            {filteredContents.map((cItem) => (
              <div key={cItem.id} className="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex">
                <div className="w-100 h-100">
                  <ContentCard
                    item={cItem}
                    onOpenMedia={(v) => setActiveVideo(v)}
                    onOpenGallery={(g) => setLightboxImages(g.images)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Divided Distinct Rows: Video, Gallery, Article, Audio */
      <div className="category-divided-content-sections mt-4">
        {/* 1. Video Row - Wider Cinema Cards */}
        <CategoryContentRow
          title={isVi ? "Video & Phân Cảnh Đặc Sắc" : "Featured Videos & Epic Scenes"}
          subtitle={isVi ? "Các đoạn video clip, trailer bom tấn và hoạt cảnh đại chiến mãn nhãn" : "Blockbuster trailers, iconic clips, and visually stunning battle scenes"}
          icon="bi-play-circle-fill"
          color="#ff4757"
          badgeText={`${videoContents.length} Video`}
          items={videoContents}
          cardWidth="400px"
          onOpenMedia={(v) => setActiveVideo(v)}
          onOpenGallery={(g) => setLightboxImages(g.images)}
        />

        {/* 2. Gallery Row */}
        <CategoryContentRow
          title={isVi ? "Bộ Sưu Tập Ảnh & Concept Art" : "Gallery & Concept Art"}
          subtitle={isVi ? "Phòng trưng bày hình nền 4K, bản vẽ phác thảo mecha và minh họa độc quyền" : "4K wallpapers, mecha concept art, and exclusive illustrations"}
          icon="bi-images"
          color="#feca57"
          badgeText={`${galleryContents.length} ${isVi ? 'Bộ Ảnh' : 'Galleries'}`}
          items={galleryContents}
          onOpenMedia={(v) => setActiveVideo(v)}
          onOpenGallery={(g) => setLightboxImages(g.images)}
        />

        {/* 3. Article Row */}
        <CategoryContentRow
          title={isVi ? "Bài Viết Chuyên Sâu & Phân Tích" : "In-Depth Articles & Analysis"}
          subtitle={isVi ? "Đánh giá tác phẩm, phân tích nhân vật và các bài xã luận văn hóa đặc sắc" : "Reviews, character deep-dives, and cultural essays"}
          icon="bi-file-text-fill"
          color="#a29bfe"
          badgeText={`${articleContents.length} ${isVi ? 'Bài Viết' : 'Articles'}`}
          items={articleContents}
          onOpenMedia={(v) => setActiveVideo(v)}
          onOpenGallery={(g) => setLightboxImages(g.images)}
        />

        {/* 4. Audio Row */}
        <CategoryContentRow
          title={isVi ? "Podcast & Bản Âm Thanh Fandom" : "Podcasts & Fandom Audio"}
          subtitle={isVi ? "Nhạc nền OST kinh điển và các số radio thảo luận cùng cộng đồng" : "Iconic soundtracks (OST) and community radio episodes"}
          icon="bi-soundwave"
          color="#00cec9"
          badgeText={`${audioContents.length} Audio`}
          items={audioContents}
          onOpenMedia={(v) => setActiveVideo(v)}
          onOpenGallery={(g) => setLightboxImages(g.images)}
        />
      </div>
      )}

      {/* Characters Showcase Section */}
      {filteredCharacters.length > 0 && (
        <div className="fv-category-section mb-5 mt-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge rounded-pill px-2.5 py-1 text-white small fw-bold d-inline-flex align-items-center gap-1.5"
                style={{ background: '#00b894', boxShadow: '0 4px 12px rgba(0, 184, 148, 0.3)' }}
              >
                <i className="bi bi-people-fill"></i> {Math.min(filteredCharacters.length, 10)} {isVi ? 'Nhân Vật' : 'Characters'}
              </span>
              <h3 className={`font-heading fw-bold mb-0 fs-5 ${isDark ? 'text-white' : 'text-dark'}`}>
                {isVi ? 'Nhân Vật Tiêu Biểu' : 'Featured Characters'} ({categoryInfo.label})
              </h3>
            </div>
            {franchises.length > 0 && (
              <div className="d-flex align-items-center gap-2">
                <select
                  className={`form-select form-select-sm rounded-pill ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`}
                  style={{ minWidth: '180px' }}
                  value={selectedFranchise}
                  onChange={(e) => setSelectedFranchise(e.target.value)}
                >
                  <option value="all">{t('categoryHub.allFranchise')}</option>
                  {franchises.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="fv-characters-5col-grid">
            {filteredCharacters.slice(0, 10).map((char) => (
              <div key={char.id} className="fv-character-5col-item">
                <CharacterCard character={char} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Showcase Section */}
      {filteredEvents.length > 0 && (
        <div className="fv-category-section mb-5 mt-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge rounded-pill px-2.5 py-1 text-white small fw-bold d-inline-flex align-items-center gap-1.5"
                style={{ background: '#f39c12', boxShadow: '0 4px 12px rgba(243, 156, 18, 0.3)' }}
              >
                <i className="bi bi-calendar-event-fill"></i> {Math.min(filteredEvents.length, 10)} {isVi ? 'Sự Kiện' : 'Events'}
              </span>
              <h3 className={`font-heading fw-bold mb-0 fs-5 ${isDark ? 'text-white' : 'text-dark'}`}>
                {isVi ? 'Sự Kiện & Lễ Hội Fandom' : 'Fandom Events & Festivals'}
              </h3>
            </div>
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className={`btn rounded-pill-start ${selectedEventStatus === 'all' ? (isDark ? 'btn-light' : 'btn-dark') : 'btn-outline-secondary'}`}
                onClick={() => setSelectedEventStatus('all')}
              >
                {t('navbar.all')}
              </button>
              <button
                type="button"
                className={`btn ${selectedEventStatus === 'upcoming' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedEventStatus('upcoming')}
              >
                {t('categoryHub.statusUpcoming')}
              </button>
              <button
                type="button"
                className={`btn rounded-pill-end ${selectedEventStatus === 'past' ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedEventStatus('past')}
              >
                {t('categoryHub.statusPast')}
              </button>
            </div>
          </div>
          <div className="fv-events-5col-grid">
            {filteredEvents.slice(0, 10).map((evt) => (
              <div key={evt.id} className="fv-event-5col-item">
                <EventCard event={evt} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Gallery Modal */}
      {lightboxImages && (
        <LightboxGallery
          images={lightboxImages}
          title={t('categoryHub.galleryTitle', { label: categoryInfo.label })}
          onClose={() => setLightboxImages(null)}
        />
      )}

      {/* Video Modal */}
      {activeVideo && (
        <VideoModal item={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}

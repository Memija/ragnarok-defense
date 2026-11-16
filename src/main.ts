import './style.less';
import { MainMenu } from './engine/MainMenu';
import { SoundManager } from './engine/SoundManager';
import { getEffectiveDpr, INITIAL_UNLOCKED_CITY, isCityUnlocked } from './engine/GameConfig';
import { initUI } from './ui';
import { t, detectLang, ensureLocaleLoaded } from './i18n';
import type { Game } from './engine/Game';
import type { MapMenu } from './engine/MapMenu';
import type { DefenderSelectionModal } from './engine/DefenderSelectionModal';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const menuCanvas = document.getElementById('menu-canvas') as HTMLCanvasElement;
const menuCtx = menuCanvas?.getContext('2d');

const mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;
const mapCtx = mapCanvas?.getContext('2d');

if (ctx && canvas.parentElement && menuCtx && mapCtx) {
  let mapMenuPromise: Promise<typeof import('./engine/MapMenu')> | null = null;
  const loadMapMenuModule = () => (mapMenuPromise ??= import('./engine/MapMenu'));

  let registryPromise: Promise<typeof import('./engine/DefenderRegistry')> | null = null;
  const loadRegistryModule = () => (registryPromise ??= import('./engine/DefenderRegistry'));

  let gamePromise: Promise<typeof import('./engine/Game')> | null = null;
  const loadGameModule = () => (gamePromise ??= import('./engine/Game'));

  let defenderModalInstance: DefenderSelectionModal | null = null;
  let defenderModalPromise: Promise<DefenderSelectionModal> | null = null;
  const getDefenderModal = () =>
    (defenderModalPromise ??= import('./engine/DefenderSelectionModal').then(
      ({ DefenderSelectionModal: ModalClass }) => {
        defenderModalInstance = new ModalClass();
        (window as any).__defenderSelectionModal = defenderModalInstance;
        return defenderModalInstance;
      }
    ));

  const boot = async () => {
    const initialLang = detectLang();
    if (initialLang !== 'en') {
      await ensureLocaleLoaded(initialLang);
    }

    initUI();

    // Show layout smoothly once JS, CSS, and active locale are ready to avoid FOUC
    const layout = document.getElementById('app-layout');
    if (layout) layout.style.opacity = '1';

    const mainMenuDiv = document.getElementById('main-menu');
    const mapMenuDiv = document.getElementById('map-menu');
    const gameContainer = document.getElementById('game-container');
    const returnBtn = document.getElementById('return-menu-btn');
    const returnFromMapBtn = document.getElementById('return-from-map-btn');
    let game: Game | null = null;
    let mapMenu: MapMenu | null = null;
    let mainMenu: MainMenu;
    let navSeq = 0;

    const resizeMenu = () => {
      const dpr = getEffectiveDpr();
      if (mainMenuDiv && menuCanvas && !mainMenuDiv.classList.contains('hidden')) {
        const rect = mainMenuDiv.getBoundingClientRect();
        const totalHeight = rect.height;
        if (rect.width > 0 && totalHeight > 0) {
          menuCanvas.width = rect.width * dpr;
          menuCanvas.height = totalHeight * dpr;
          menuCtx.setTransform(1, 0, 0, 1, 0, 0);
          menuCtx.scale(dpr, dpr);
          menuCanvas.style.width = `${rect.width}px`;
          menuCanvas.style.height = `${totalHeight}px`;
          if (mainMenu) {
            mainMenu.built = false;
          }
        }
      }
      if (mapMenuDiv && mapCanvas && !mapMenuDiv.classList.contains('hidden')) {
        const rect = document.body.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          mapCanvas.width = rect.width * dpr;
          mapCanvas.height = rect.height * dpr;
          mapCtx.setTransform(1, 0, 0, 1, 0, 0);
          mapCtx.scale(dpr, dpr);
          mapCanvas.style.width = `${rect.width}px`;
          mapCanvas.style.height = `${rect.height}px`;
        }
      }
      if (game && gameContainer && !gameContainer.classList.contains('hidden') && canvas.parentElement) {
        const parentW = canvas.parentElement.clientWidth;
        const parentH = canvas.parentElement.clientHeight;
        canvas.width = parentW * dpr;
        canvas.height = parentH * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        game.resize(parentW, parentH);
      }
    };

    const isModalOpen = () => {
      const settingsModal = document.getElementById('settings-modal');
      if (settingsModal && !settingsModal.classList.contains('hidden')) return true;
      const defenderModalEl = document.getElementById('defender-modal');
      if (defenderModalEl && !defenderModalEl.classList.contains('hidden')) return true;
      const foreignModalEl = document.getElementById('foreign-worlds-modal');
      if (foreignModalEl && !foreignModalEl.classList.contains('hidden')) return true;
      return false;
    };

    const syncMenuPauseState = () => {
      const shouldPauseMenus = document.hidden || isModalOpen();
      if (mainMenu && mainMenu.isActive) {
        if (shouldPauseMenus) mainMenu.pause();
        else mainMenu.resume();
      }
      if (mapMenu && mapMenu.isActive) {
        if (shouldPauseMenus) mapMenu.pause();
        else mapMenu.resume();
      }
    };

    const isGameActivelyPlaying = () => Boolean(game && game.gameState === 'playing');

    const prepareNextLevel = async (
      nextRealm: string,
      nextCity: string | undefined,
      nextLevel: number,
      previousSquad: string[]
    ) => {
      if (!game || isGameActivelyPlaying()) return;
      const defenderModal = await getDefenderModal();
      if (!game || isGameActivelyPlaying()) return;
      const previousBodyClass = document.body.className;
      document.body.className = nextCity ? `theme-${nextRealm} location-${nextCity}` : `theme-${nextRealm}`;

      defenderModal.open({
        realm: nextRealm,
        city: nextCity,
        level: nextLevel,
        initialSelected: previousSquad,
        isMidGame: false,
        onConfirm: (chosen) => {
          if (game) {
            game.startNextBattle(nextCity, nextLevel, chosen);
          }
        },
        onCancel: () => {
          document.body.className = previousBodyClass;
        }
      });
    };

    const launchGame = async (realm: string, city?: string, chosenDefenders?: string[]) => {
      if (realm !== 'svartalfheim') return;
      const seq = ++navSeq;
      const safeCity = city && isCityUnlocked(city) ? city : INITIAL_UNLOCKED_CITY;
      city = safeCity;

      const [{ Game: GameClass }, { CITY_LEVELS, getSavedLoadout }] = await Promise.all([
        loadGameModule(),
        loadRegistryModule()
      ]);
      if (seq !== navSeq) return;

      if (mainMenuDiv && gameContainer) {
        document.body.className = city ? `theme-${realm} location-${city}` : `theme-${realm}`;
        const realmNames: Record<string, { name: string; icon: string }> = {
          asgard:       { name: 'Asgard',       icon: '⚡' },
          alfheim:      { name: 'Alfheim',      icon: '✨' },
          vanaheim:     { name: 'Vanaheim',     icon: '🌿' },
          svartalfheim: { name: 'Svartalfheim', icon: '⚒️' },
          midgard:      { name: 'Midgard',      icon: '🌱' },
          jotunheim:    { name: 'Jötunheim',    icon: '❄️' },
          niflheim:     { name: 'Niflheim',     icon: '🌫️' },
          muspelheim:   { name: 'Muspelheim',   icon: '🔥' },
          helheim:      { name: 'Helheim',      icon: '💀' }
        };

        const info = realmNames[realm] || realmNames.midgard;
        const realmNameEl = document.getElementById('realm-name');
        const realmIconEl = document.getElementById('realm-icon');

        let displayName = info.name;
        if (city) {
          const cityKey = `loc_${city.replace(/-/g, '_')}_name`;
          const transCity = t(cityKey);
          const cityFormatted = transCity !== cityKey ? transCity : city.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
          const worldKey = `world_${realm}`;
          const transWorld = t(worldKey);
          const worldName = transWorld !== worldKey ? transWorld : info.name;
          displayName = `${worldName} - ${cityFormatted}`;
        }

        if (realmNameEl) realmNameEl.textContent = displayName;
        if (realmIconEl) realmIconEl.textContent = info.icon;

        mainMenu.stop();
        if (mapMenu) mapMenu.stop();

        mainMenuDiv.classList.add('hidden');
        mainMenuDiv.classList.remove('active');
        if (mapMenuDiv) mapMenuDiv.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        const targetLevel = city && CITY_LEVELS[city] ? CITY_LEVELS[city] : 1;
        const squad = chosenDefenders && chosenDefenders.length > 0 ? chosenDefenders : getSavedLoadout(targetLevel, realm);

        const dpr = getEffectiveDpr();
        const rect = canvas.parentElement?.getBoundingClientRect();
        const width = rect && rect.width > 0 ? rect.width : (window.innerWidth - 120);
        const height = rect && rect.height > 0 ? rect.height : (window.innerHeight - 72);

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        if (game) {
          game.stop();
        }
        game = new GameClass(canvas, ctx, realm, city, squad, targetLevel, (nr, nc, nl, ps) => {
          void prepareNextLevel(nr, nc, nl, ps);
        });
        game.start();
      }
    };

    const promptDefenderSelection = async (realm?: string, city?: string) => {
      if (game && game.gameState === 'playing') return;
      const activeRealm = 'svartalfheim';
      if (realm && realm !== 'svartalfheim') return;
      const safeCity = city && isCityUnlocked(city) ? city : INITIAL_UNLOCKED_CITY;
      city = safeCity;

      const [defenderModal, { CITY_LEVELS, getSavedLoadout }] = await Promise.all([
        getDefenderModal(),
        loadRegistryModule()
      ]);
      if (game && game.gameState === 'playing') return;

      const targetLevel = city && CITY_LEVELS[city] ? CITY_LEVELS[city] : 1;
      const initialSelected = getSavedLoadout(targetLevel, activeRealm);
      const previousBodyClass = document.body.className;
      document.body.className = city ? `theme-${activeRealm} location-${city}` : `theme-${activeRealm}`;

      defenderModal.open({
        realm: activeRealm,
        city,
        level: targetLevel,
        initialSelected,
        isMidGame: false,
        onConfirm: (chosen) => {
          void launchGame(activeRealm, city, chosen);
        },
        onCancel: () => {
          document.body.className = previousBodyClass;
        }
      });
    };

    const startGame = (realm: string, city?: string, chosenDefenders?: string[]) => {
      if (chosenDefenders && chosenDefenders.length > 0) {
        void launchGame(realm, city, chosenDefenders);
      } else {
        void promptDefenderSelection(realm, city);
      }
    };

    const returnToYggdrasil = () => {
      if (game && game.gameState === 'playing') return;
      navSeq++;
      if (game) {
        game.stop();
        game = null;
      }
      if (mapMenu) {
        mapMenu.stop();
        mapMenu = null;
      }
      document.body.className = '';
      mapMenuDiv?.classList.add('hidden');
      gameContainer?.classList.add('hidden');
      if (mainMenuDiv) {
        mainMenuDiv.classList.remove('hidden');
        mainMenuDiv.classList.add('active');
        resizeMenu();
        mainMenu.built = false;
        mainMenu.start();
        syncMenuPauseState();
      }
    };

    const openRealmMap = async (realm: string) => {
      if (game && game.gameState === 'playing') return;
      const seq = ++navSeq;
      const { MapMenu: MapMenuClass } = await loadMapMenuModule();
      if (seq !== navSeq) return;

      if (game) {
        game.stop();
        game = null;
      }
      mainMenu.stop();
      if (mapMenu) {
        mapMenu.stop();
        mapMenu = null;
      }
      if (mainMenuDiv) {
        mainMenuDiv.classList.add('hidden');
        mainMenuDiv.classList.remove('active');
      }
      gameContainer?.classList.add('hidden');
      if (mapMenuDiv) {
        mapMenuDiv.classList.remove('hidden');
      }
      resizeMenu();

      document.body.className = `theme-${realm}`;
      mapMenu = new MapMenuClass(
        mapCanvas,
        mapCtx,
        realm,
        (city: string) => {
          startGame(realm, city);
        },
        () => {
          returnToYggdrasil();
        }
      );
      mapMenu.start();
      syncMenuPauseState();
    };

    mainMenu = new MainMenu(menuCanvas, menuCtx, (realm: string) => {
      if (realm === 'svartalfheim') {
        void openRealmMap(realm);
      }
    });

    window.addEventListener('resize', resizeMenu);
    resizeMenu();
    mainMenu.start();
    syncMenuPauseState();

    // Warm lazy chunks during idle time after first MainMenu paint so navigation is instantaneous
    requestAnimationFrame(() => {
      const warmChunks = () => {
        void loadMapMenuModule();
        void loadRegistryModule();
        void getDefenderModal();
        void loadGameModule();
      };
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(warmChunks, { timeout: 1500 });
      } else {
        setTimeout(warmChunks, 600);
      }
    });

    if (returnFromMapBtn) {
      returnFromMapBtn.addEventListener('click', () => {
        if (game && game.gameState === 'playing') return;
        (window as any).__closeSettings?.();
        SoundManager.getInstance().playClick();
        returnToYggdrasil();
      });
    }

    let pausedByVisibility = false;

    const handleResume = () => {
      syncMenuPauseState();
      if (document.hidden) return;
      if (game && game.gameState === 'playing') {
        if (pausedByVisibility || (!isModalOpen() && game.isPaused)) {
          pausedByVisibility = false;
          game.resume();
        }
      }
    };

    const handlePause = () => {
      syncMenuPauseState();
      if (game && !game.isPaused && game.gameState === 'playing') {
        pausedByVisibility = true;
        game.pause();
      }
    };

    const handleReturnToMenu = () => {
      if (game && game.gameState === 'playing') return;
      SoundManager.getInstance().playClick();
      pausedByVisibility = false;
      const shouldReturnToRealmMap = Boolean(game && game.realm === 'svartalfheim' && game.city);
      const activeRealm = game?.realm || 'svartalfheim';

      if (game) {
        game.stop();
        game = null;
      }

      if (shouldReturnToRealmMap) {
        void openRealmMap(activeRealm);
      } else {
        returnToYggdrasil();
      }
    };

    if (returnBtn) {
      returnBtn.addEventListener('click', handleReturnToMenu);
    }

    window.addEventListener('ragnarok-modal-visibility', syncMenuPauseState);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        handlePause();
      } else {
        handleResume();
      }
    });

    window.addEventListener('focus', () => {
      handleResume();
    });

    (window as any).__startGame = startGame;
    (window as any).__launchGame = launchGame;
    (window as any).__promptDefenderSelection = promptDefenderSelection;
    (window as any).__getGame = () => game;
  };

  void boot();
}

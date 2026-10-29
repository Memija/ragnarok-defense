import './style.less';
import { Game } from './engine/Game';
import { MainMenu } from './engine/MainMenu';
import { MapMenu } from './engine/MapMenu';
import { SoundManager } from './engine/SoundManager';
import { DefenderSelectionModal } from './engine/DefenderSelectionModal';
import { CITY_LEVELS, getSavedLoadout } from './engine/DefenderRegistry';
import { initUI } from './ui';
import { t } from './i18n';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const menuCanvas = document.getElementById('menu-canvas') as HTMLCanvasElement;
const menuCtx = menuCanvas?.getContext('2d');

const mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;
const mapCtx = mapCanvas?.getContext('2d');

if (ctx && canvas.parentElement && menuCtx && mapCtx) {
  // Show layout smoothly once JS and CSS are initialized to avoid FOUC
  const layout = document.getElementById('app-layout');
  if (layout) layout.style.opacity = '1';

  initUI();
  
  const mainMenuDiv = document.getElementById('main-menu');
  const mapMenuDiv = document.getElementById('map-menu');
  const gameContainer = document.getElementById('game-container');
  const returnBtn = document.getElementById('return-menu-btn');
  const returnFromMapBtn = document.getElementById('return-from-map-btn');
  let game: Game | null = null;
  let mapMenu: MapMenu | null = null;
  const defenderModal = new DefenderSelectionModal();
  (window as any).__defenderSelectionModal = defenderModal;
  
  let mainMenu: MainMenu;

  const resizeMenu = () => {
    const dpr = window.devicePixelRatio || 1;
    if (mainMenuDiv && menuCanvas) {
      const rect = mainMenuDiv.getBoundingClientRect();
      const totalHeight = rect.height;
      menuCanvas.width = rect.width * dpr;
      menuCanvas.height = totalHeight * dpr;
      menuCtx!.setTransform(1, 0, 0, 1, 0, 0);
      menuCtx!.scale(dpr, dpr);
      menuCanvas.style.width = `${rect.width}px`;
      menuCanvas.style.height = `${totalHeight}px`;
      if (mainMenu) {
        mainMenu.built = false;
      }
    }
    if (mapMenuDiv && mapCanvas) {
      const rect = document.body.getBoundingClientRect();
      mapCanvas.width = rect.width * dpr;
      mapCanvas.height = rect.height * dpr;
      mapCtx!.setTransform(1, 0, 0, 1, 0, 0);
      mapCtx!.scale(dpr, dpr);
      mapCanvas.style.width = `${rect.width}px`;
      mapCanvas.style.height = `${rect.height}px`;
    }
    if (game && gameContainer && !gameContainer.classList.contains('hidden') && canvas.parentElement) {
      const parentW = canvas.parentElement.clientWidth;
      const parentH = canvas.parentElement.clientHeight;
      canvas.width = parentW * dpr;
      canvas.height = parentH * dpr;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      game.resize(parentW, parentH);
    }
  };

  const prepareNextLevel = (
    nextRealm: string,
    nextCity: string | undefined,
    nextLevel: number,
    previousSquad: string[]
  ) => {
    if (!game || game.gameState === 'playing') return;
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

  const launchGame = (realm: string, city?: string, chosenDefenders?: string[]) => {
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
      
      // If a city is selected, we can append it to the realm name
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
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      const width = rect && rect.width > 0 ? rect.width : (window.innerWidth - 120);
      const height = rect && rect.height > 0 ? rect.height : (window.innerHeight - 72);
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      if (game) {
        game.stop();
      }
      // Passing realm, city, squad, targetLevel, and next-level preparation handler
      game = new Game(canvas, ctx, realm, city, squad, targetLevel, prepareNextLevel);
      game.start();
    }
  };

  const promptDefenderSelection = (realm?: string, city?: string) => {
    if (game && game.gameState === 'playing') return;
    const activeRealm = realm || 'svartalfheim';
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
        launchGame(activeRealm, city, chosen);
      },
      onCancel: () => {
        document.body.className = previousBodyClass;
      }
    });
  };

  const startGame = (realm: string, city?: string, chosenDefenders?: string[]) => {
    if (chosenDefenders && chosenDefenders.length > 0) {
      launchGame(realm, city, chosenDefenders);
    } else {
      promptDefenderSelection(realm, city);
    }
  };

  const returnToYggdrasil = () => {
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
    }
  };

  const openRealmMap = (realm: string) => {
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
    mapMenu = new MapMenu(mapCanvas, mapCtx, realm, (city: string) => {
      startGame(realm, city);
    }, () => {
      returnToYggdrasil();
    });
    mapMenu.start();
  };

  mainMenu = new MainMenu(menuCanvas, menuCtx, (realm: string) => {
    if (realm === 'svartalfheim') {
      openRealmMap(realm);
    } else {
      // Directly start game for other realms
      startGame(realm);
    }
  });
  
  window.addEventListener('resize', resizeMenu);
  resizeMenu();
  mainMenu.start();

  if (returnFromMapBtn) {
    returnFromMapBtn.addEventListener('click', () => {
      (window as any).__closeSettings?.();
      SoundManager.getInstance().playClick();
      returnToYggdrasil();
    });
  }

  let pausedByVisibility = false;

  const isModalOpen = () => {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal && !settingsModal.classList.contains('hidden')) return true;
    const defenderModalEl = document.getElementById('defender-modal');
    if (defenderModalEl && !defenderModalEl.classList.contains('hidden')) return true;
    return false;
  };

  const handleResume = () => {
    if (document.hidden) return;
    if (game && game.gameState === 'playing') {
      if (pausedByVisibility || (!isModalOpen() && game.isPaused)) {
        pausedByVisibility = false;
        game.resume();
      }
    }
  };

  const handlePause = () => {
    if (game && !game.isPaused && game.gameState === 'playing') {
      pausedByVisibility = true;
      game.pause();
    }
  };

  const handleReturnToMenu = () => {
    SoundManager.getInstance().playClick();
    pausedByVisibility = false;
    const shouldReturnToRealmMap = Boolean(game && game.realm === 'svartalfheim' && game.city);
    const activeRealm = game?.realm || 'svartalfheim';

    if (game) {
      game.stop();
      game = null;
    }

    if (shouldReturnToRealmMap) {
      openRealmMap(activeRealm);
    } else {
      returnToYggdrasil();
    }
  };

  if (returnBtn) {
    returnBtn.addEventListener('click', handleReturnToMenu);
  }
  const inGameReturnBtn = document.getElementById('in-game-return-btn');
  if (inGameReturnBtn) {
    inGameReturnBtn.addEventListener('click', handleReturnToMenu);
  }

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
}

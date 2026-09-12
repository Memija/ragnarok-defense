import './style.less';
import { Game } from './engine/Game';
import { MainMenu } from './engine/MainMenu';
import { MapMenu } from './engine/MapMenu';
import { SoundManager } from './engine/SoundManager';
import { DefenderSelectionModal } from './engine/DefenderSelectionModal';
import { CITY_LEVELS } from './engine/DefenderRegistry';
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
  };

  const openRosterForCurrentGame = () => {
    if (!game) return;
    defenderModal.open({
      realm: game.realm,
      city: game.city,
      level: game.level,
      initialSelected: game.selectedDefenders,
      isMidGame: true,
      onConfirm: (chosen) => {
        if (game) {
          game.updateLoadout(chosen);
          if (game.gameState === 'victory') {
            game.restartBattle();
          }
        }
      }
    });
  };

  const startGame = (realm: string, city?: string) => {
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
      
      // Offer defender selection before entering the battle based on level
      defenderModal.open({
        realm,
        city,
        level: targetLevel,
        isMidGame: false,
        onConfirm: (chosenDefenders) => {
          setTimeout(() => {
            const dpr = window.devicePixelRatio || 1;
            const width = canvas.parentElement!.clientWidth;
            const height = canvas.parentElement!.clientHeight - 80;
            
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx!.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            if (game) {
              game.stop();
            }
            // Passing realm, city, chosenDefenders, targetLevel, and roster opener
            game = new Game(canvas, ctx, realm, city, chosenDefenders, targetLevel, openRosterForCurrentGame);
            game.start();
          }, 50);
        },
        onCancel: () => {
          // If cancelled on entry, return to previous menu
          if (city && mapMenuDiv) {
            gameContainer.classList.add('hidden');
            mapMenuDiv.classList.remove('hidden');
            resizeMenu();
            if (mapMenu) mapMenu.start();
          } else {
            gameContainer.classList.add('hidden');
            if (mainMenuDiv) {
              mainMenuDiv.classList.remove('hidden');
              mainMenuDiv.classList.add('active');
              resizeMenu();
              mainMenu.built = false;
              mainMenu.start();
            }
          }
        }
      });
    }
  };

  mainMenu = new MainMenu(menuCanvas, menuCtx, (realm: string) => {
    if (realm === 'svartalfheim') {
      // Show Map Menu
      mainMenu.stop();
      if (mainMenuDiv) {
        mainMenuDiv.classList.add('hidden');
        mainMenuDiv.classList.remove('active');
      }
      if (mapMenuDiv) {
        mapMenuDiv.classList.remove('hidden');
      }
      resizeMenu();
      
      document.body.className = `theme-${realm}`;
      mapMenu = new MapMenu(mapCanvas, mapCtx, realm, (city: string) => {
        startGame(realm, city);
      }, () => {
        // Return to Yggdrasil from the canvas portal node
        if (mapMenu) { mapMenu.stop(); mapMenu = null; }
        document.body.className = '';
        if (mapMenuDiv) mapMenuDiv.classList.add('hidden');
        if (mainMenuDiv) {
          mainMenuDiv.classList.remove('hidden');
          mainMenuDiv.classList.add('active');
          // Resize canvas first so it has correct dimensions, then rebuild tree
          resizeMenu();
          mainMenu.built = false;
          mainMenu.start();
        }
      });
      mapMenu.start();
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
      if (mapMenu) {
        mapMenu.stop();
        mapMenu = null;
      }
      
      document.body.className = '';
      if (mapMenuDiv) {
        mapMenuDiv.classList.add('hidden');
      }
      if (mainMenuDiv) {
        mainMenuDiv.classList.remove('hidden');
        mainMenuDiv.classList.add('active');
        resizeMenu();
        mainMenu.built = false;
        mainMenu.start();
      }
    });
  }

  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      SoundManager.getInstance().playClick();
      if (game) {
        game.stop();
        game = null;
      }
      
      document.body.className = '';
      gameContainer?.classList.add('hidden');
      
      if (mainMenuDiv) {
        mainMenuDiv.classList.remove('hidden');
        mainMenuDiv.classList.add('active');
        resizeMenu();
        mainMenu.built = false;
        mainMenu.start();
      }
    });
  }

  (window as any).__startGame = startGame;
  (window as any).__getGame = () => game;
}

import './style.less';
import { Game } from './engine/Game';
import { MainMenu } from './engine/MainMenu';
import { initUI } from './ui';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const menuCanvas = document.getElementById('menu-canvas') as HTMLCanvasElement;
const menuCtx = menuCanvas?.getContext('2d');

if (ctx && canvas.parentElement && menuCtx) {
  initUI();
  
  const mainMenuDiv = document.getElementById('main-menu');
  const gameContainer = document.getElementById('game-container');
  const returnBtn = document.getElementById('return-menu-btn');
  let game: Game | null = null;
  
  let mainMenu: MainMenu;

  const resizeMenu = () => {
    if (mainMenuDiv && menuCanvas) {
      const dpr = window.devicePixelRatio || 1;
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
  };

  mainMenu = new MainMenu(menuCanvas, menuCtx, (realm: string) => {
    if (mainMenuDiv && gameContainer) {
      // Set body theme class
      document.body.className = `theme-${realm}`;

      const realmNames: Record<string, { name: string; icon: string }> = {
        asgard:       { name: 'ASGARD',       icon: '⚡' },
        alfheim:      { name: 'ALFHEIM',      icon: '✨' },
        vanaheim:     { name: 'VANAHEIM',     icon: '🌿' },
        svartalfheim: { name: 'SVARTALFHEIM', icon: '⚒️' },
        midgard:      { name: 'MIDGARD',      icon: '🌱' },
        jotunheim:    { name: 'JÖTUNHEIM',    icon: '❄️' },
        niflheim:     { name: 'NIFLHEIM',     icon: '🌫️' },
        muspelheim:   { name: 'MUSPELHEIM',   icon: '🔥' },
        helheim:      { name: 'HELHEIM',      icon: '💀' }
      };
      const info = realmNames[realm] || realmNames.midgard;
      const realmNameEl = document.getElementById('realm-name');
      const realmIconEl = document.getElementById('realm-icon');
      if (realmNameEl) realmNameEl.textContent = info.name;
      if (realmIconEl) realmIconEl.textContent = info.icon;
      
      mainMenu.stop();
      mainMenuDiv.classList.remove('active');
      gameContainer.classList.remove('hidden');
      
      // Let the browser calculate the flex sizes, then set the canvas to match
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
        game = new Game(canvas, ctx, realm);
        game.start();
      }, 50);
    }
  });
  
  window.addEventListener('resize', resizeMenu);
  resizeMenu();
  mainMenu.start();



  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      if (game) {
        game.stop();
        game = null;
      }
      
      // Reset body class
      document.body.className = '';
      
      if (mainMenuDiv && gameContainer) {
        gameContainer.classList.add('hidden');
        mainMenuDiv.classList.add('active');
        resizeMenu();
        mainMenu.start();
      }
    });
  }
}

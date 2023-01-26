const { app, BrowserWindow, Tray, Menu, Notification } = require('electron');
const path = require('path');
const quotes = require('./quotes.js');
var timeRemaining;
var tray = null;

const createWindow = () => {
  const win = new BrowserWindow({
    show: false,
    width: 300,
    height: 200,
  });

  win.loadFile('index.html');
  win.on('minimize', function (event) {
    event.preventDefault();
    win.hide();
  });

  win.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }

    return false;
  });

  app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, 'coach-carter.ico'));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Restart',
        click: function () {
          app.relaunch();
          app.exit();
          console.log('Restarting timer');
        },
      },
      {
        label: 'Show App',
        click: function () {
          win.show();
        },
      },
      {
        label: 'Quit',
        click: function () {
          app.isQuiting = true;
          app.quit();
        },
      },
    ]);
    tray.setToolTip('Coach Carter');
    tray.setContextMenu(contextMenu);
  });

  function showPushupNotification() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const notification = new Notification({
      title: 'Push ups now - Do It!',
      body: quote,
      icon: path.join(__dirname, 'coach-carter.png'),
      silent: true,
      buttons: [
        {
          text: 'Done, reset time',
          role: 'reset',
        },
        {
          text: 'Stop',
          role: 'stop',
        },
      ],
    });

    notification.on('click', (event, buttonIndex) => {
      // The 'Done, reset time' button was clicked
      // Reset the time here
      startTimer();
    });

    notification.on('close', e => {
      console.log('Closing app, meet you next time!');
    });

    notification.show();
  }

  function startTimer() {
    const duration = 45 * 60 * 1000; // 45 minutes in milliseconds
    let remainingTime = duration;

    const intervalId = setInterval(() => {
      remainingTime -= 1000;
      if (remainingTime <= 0) {
        clearInterval(intervalId);
        console.log('Timer completed');
        showPushupNotification();
      } else {
        const minutes = Math.floor(remainingTime / 1000 / 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        timeRemaining = `${minutes}:${seconds}`;
        tray.setToolTip(`Coach Carter ${timeRemaining}`);
        console.log(`${minutes} minutes ${seconds} seconds remaining`);
      }
    }, 1000);
  }

  startTimer();
};

app.whenReady().then(() => {
  createWindow();
});

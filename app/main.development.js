/* eslint global-require: 1, flowtype-errors/show-errors: 0 */
// @flow
import { app, BrowserWindow, ipcMain } from 'electron';
import MenuBuilder from './menu';

import loadCorePackages from './corePackageLoader';

let mainWindow = null;

if ( process.env.NODE_ENV === 'production' )
{
    const sourceMapSupport = require( 'source-map-support' );
    sourceMapSupport.install();
}

if ( process.env.NODE_ENV === 'development' )
{
    require( 'electron-debug' )();
    const path = require( 'path' );
    const p = path.join( __dirname, '..', 'app', 'node_modules' );
    require( 'module' ).globalPaths.push( p );
}

const installExtensions = async () =>
{
    const installer = require( 'electron-devtools-installer' );
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = [
        'REACT_DEVELOPER_TOOLS',
        'REDUX_DEVTOOLS'
    ];

    return Promise
    .all( extensions.map( name => installer.default( installer[name], forceDownload ) ) )
    .catch( console.log );
};


app.on( 'window-all-closed', () =>
{
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
    if ( process.platform !== 'darwin' )
{
        app.quit();
    }
} );


app.on( 'ready', async () =>
{
    if ( process.env.NODE_ENV === 'development' )
{
        await installExtensions();
    }

    loadCorePackages();


    mainWindow = new BrowserWindow( {
        show              : false,
        width             : 2048,
        height            : 1024,
        titleBarStyle     : 'hidden-inset',
        'standard-window' : false,
    } );

    mainWindow.loadURL( `file://${__dirname}/app.html` );

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event

    mainWindow.webContents.on( 'did-finish-load', () =>
    {
        if ( !mainWindow )
        {
            throw new Error( '"mainWindow" is not defined' );
        }
        mainWindow.show();
        mainWindow.focus();
    } );

    mainWindow.on( 'closed', () =>
    {
        mainWindow = null;
    } );

    const menuBuilder = new MenuBuilder( mainWindow );
    menuBuilder.buildMenu();
    //
    // // bounce back command messages from the render process.
    // // this keeps all command handling in the browser component
    // ipcMain.on( 'command', ( ...args ) =>
    // {
    //
    //     //dutty. this is just trying to replace actions...
    //     const event = args[0];
    //     // const type = args[1];
    //
    //
    //     // console.log( 'type'  , type );
    //     const theRest = args.slice(1);
    //
    //     // console.log( 'theRest'  , theRest );
    //     // var args = [...arguments];
    //
    //     // console.log( 'args'  , args );
    //     event.sender.send('command', ...theRest );
    //
    // })
} );

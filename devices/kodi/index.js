"use strict";

const neeoapi = require("neeo-sdk");
const controller = require("./controller");
const commands = require("./Commands/commands");

const DISCOVERY_INSTRUCTIONS = {
  headerText: "Discover Kodi",
  description: 'NEEO will discover Kodi. Make sure to enable: "Announce services to other systems", "Allow remote control via HTTP" and "Allow remote control from applications on other systems". Pres Next to continue.'
};

const SECURITY_CODE_INSTRUCTIONS = {
  type: "SECURITY_CODE",
  headerText: "Kodi Password",
  description: "Please enter the password you use with KODI"
};

const kodi = buildKodiDriver();
const kodiPlayer = buildKodiPlayerDriver();

console.log("Kodi Driver by Niels de Klerk.");

module.exports = {
  devices: [kodi, kodiPlayer],
  buildKodiDriver,
  buildKodiPlayerDriver
};

function buildKodiDriver() {
  let kodiDriver = neeoapi.buildDevice("IP Driver");
  kodiDriver.setManufacturer("KODI");
  kodiDriver.addAdditionalSearchToken("XBMC");
  kodiDriver.setType("MEDIAPLAYER");
  kodiDriver.addDirectory({ name: "MOVIE LIBRARY", label: "MOVIE LIBRARY" }, controller.movieLibrary);
  kodiDriver.addDirectory({ name: "MUSIC LIBRARY", label: "MUSIC LIBRARY" }, controller.musicLibrary);
  kodiDriver.addDirectory({ name: "TV SHOW LIBRARY", label: "TV SHOW LIBRARY" }, controller.tvshowLibrary);
  kodiDriver.addDirectory({ name: "PVR LIBRARY", label: "PVR LIBRARY" }, controller.pvrLibrary);
  Object.keys(commands.neeoCommands()).forEach(key => {
    kodiDriver.addButton({ name: key, label: key });
  });
  kodiDriver.addButtonHander(controller.onButtonPressed);
  kodiDriver.addSlider({ name: "VOLUMESLIDER", label: "VOLUME", range: [0, 100], unit: "%" }, { setter: controller.volume.set, getter: controller.volume.get });
  kodiDriver.addTextLabel({ name: "NOWPLAYINGLABEL", label: "Now Playing Label", isLabelVisible: false }, controller.nowPlayingLabel);
  kodiDriver.addImageUrl({ name: "NOWPLAYINGIMGSMALL", label: "Now Playing Cover (Small)", size: "small" }, controller.nowPlayingImg);
  kodiDriver.addImageUrl({ name: "NOWPLAYINGIMGLARGE", label: "Now Playing Cover (Large)", size: "large" }, controller.nowPlayingImg);
  kodiDriver.enableDiscovery(DISCOVERY_INSTRUCTIONS, controller.discoverDevices);
  //kodiDriver.enableRegistration(SECURITY_CODE_INSTRUCTIONS, { register: controller.addDeviceDiscoveryPassword, isRegistered: () => {console.log('isRegistered')}  } )
  kodiDriver.registerSubscriptionFunction(controller.registerStateUpdateCallback);
  kodiDriver.registerInitialiseFunction(controller.initialise);
  return kodiDriver;
}

function buildKodiPlayerDriver() {
  let kodiDriver = neeoapi.buildDevice("IP Driver (Player)");
  kodiDriver.setManufacturer("KODI");
  kodiDriver.addAdditionalSearchToken("XBMC");
  kodiDriver.setType("MEDIAPLAYER");
  kodiDriver.addRootDirectory({ name: "PLAYER_ROOT_DIRECTORY", label: "ROOT" }, controller.movieLibrary);
  kodiDriver.addQueueDirectory({ name: "PLAYER_QUEUE_DIRECTORY", label: "QUEUE" }, controller.movieLibrary);
  kodiDriver.addDirectory({ name: "MOVIE LIBRARY", label: "MOVIE LIBRARY" }, controller.movieLibrary);
  kodiDriver.addDirectory({ name: "MUSIC LIBRARY", label: "MUSIC LIBRARY" }, controller.musicLibrary);
  kodiDriver.addDirectory({ name: "TV SHOW LIBRARY", label: "TV SHOW LIBRARY" }, controller.tvshowLibrary);
  kodiDriver.addDirectory({ name: "PVR LIBRARY", label: "PVR LIBRARY" }, controller.pvrLibrary);
  kodiDriver.addSwitch({ name: "PLAYING" }, controller.playSwitch);
  kodiDriver.addSwitch({ name: "MUTE" }, controller.muteSwitch);
  kodiDriver.addSwitch({ name: "SHUFFLE" }, controller.shuffleSwitch);
  kodiDriver.addSwitch({ name: "REPEAT" }, controller.repeatSwitch);

  Object.keys(commands.neeoCommands()).forEach(key => {
    kodiDriver.addButton({ name: key, label: key });
  });
  kodiDriver.addButtonHander(controller.onButtonPressed);

  kodiDriver.addSlider({ name: "VOLUME", label: "VOLUME", range: [0, 100], unit: "%" }, { setter: controller.volume.set, getter: controller.volume.get });
  kodiDriver.addSensor({ name: "COVER_ART_SENSOR", type: "string" }, controller.coverArtSensor);
  kodiDriver.addSensor({ name: "TITLE_SENSOR", type: "string" }, controller.titleSensor);
  kodiDriver.addSensor({ name: "DESCRIPTION_SENSOR", type: "string" }, controller.descriptionSensor);
  kodiDriver.addTextLabel({ name: "NOWPLAYINGLABEL", label: "Now Playing Label", isLabelVisible: false }, controller.nowPlayingLabel);
  kodiDriver.addImageUrl({ name: "NOWPLAYINGIMGSMALL", label: "Now Playing Cover (Small)", size: "small" }, controller.nowPlayingImg);
  kodiDriver.addImageUrl({ name: "NOWPLAYINGIMGLARGE", label: "Now Playing Cover (Large)", size: "large" }, controller.nowPlayingImg);
  kodiDriver.enableDiscovery(DISCOVERY_INSTRUCTIONS, controller.discoverDevices);
  //kodiDriver.enableRegistration(SECURITY_CODE_INSTRUCTIONS, { register: controller.addDeviceDiscoveryPassword, isRegistered: () => {console.log('isRegistered')}  } )
  kodiDriver.registerSubscriptionFunction(controller.registerStateUpdateCallback);
  kodiDriver.registerInitialiseFunction(controller.initialise);
  return kodiDriver;
}

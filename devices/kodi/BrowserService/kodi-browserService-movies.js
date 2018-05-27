'use strict';
const images = require('../images');
const neeoapi = require('neeo-sdk');
const kodiController = require('../kodi-controller');
const tools = require('../tools');

const DEFAULT_PATH = '.';

module.exports = {
  browse,
  action
};

function action (deviceId, movieId){
  console.log ("Now starting movie with movieid:",movieId);
  kodiController.library.playerOpen(deviceId, {movieid: parseInt(movieId, 10)});
}

function browse(devideId, params) {
  let browseIdentifier = params.browseIdentifier || DEFAULT_PATH;
  
  console.log ("BROWSEING", browseIdentifier);
  const listOptions = {
    limit: params.limit,
    offset: params.offset,
    browseIdentifier
  };

  //If Movies
  if (browseIdentifier == "Movies" || browseIdentifier == "Unwatched movies" || browseIdentifier == "Watched movies"){
    return kodiController.library.getMovies(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions);
    });

  //If Recent Movies
  } else if (browseIdentifier == "Recent Movies") {
    return kodiController.library.getRecentlyAddedMovies(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions);
    }); 
 
  //Base Menu
  } else {
    return baseListMenu(devideId);
  }
}

//////////////////////////////////
// Format Browsing list
function formatList(deviceId, listItems, listOptions) {
  let browseIdentifier = listOptions.browseIdentifier;
  const options = {
    title: `Browsing ${browseIdentifier}`,
    totalMatchingItems: listItems.length,
    browseIdentifier,
    offset: listOptions.offset,
    limit: listOptions.limit,
  };

  const list = neeoapi.buildBrowseList(options);
  const itemsToAdd = list.prepareItemsAccordingToOffsetAndLimit(listItems);
  const kodiInstance = kodiController.getKodi(deviceId);
  

  console.log ("browseIdentifier:", browseIdentifier);


  if (browseIdentifier == 'Movies'){
    list.addListItem({title: 'Filter', label: 'List All', thumbnailUri: images.icon_filter, browseIdentifier: 'Unwatched movies'});

  } else if(browseIdentifier == 'Unwatched movies'){
    list.addListItem({title: 'Filter', label: 'List Unwatched', thumbnailUri: images.icon_filter, browseIdentifier: 'Watched movies'});

  } else if (browseIdentifier == 'Watched movies'){
    list.addListItem({title: 'Filter', label: 'List Watched', thumbnailUri: images.icon_filter, browseIdentifier: 'Movies'});
  }

  list.addListHeader(`${browseIdentifier}`);
  itemsToAdd.map((item) => {
    if (browseIdentifier == 'Movies' || browseIdentifier == "Recent Movies" || (browseIdentifier == 'Unwatched movies' && item.playcount == 0) ||  (browseIdentifier == 'Watched movies' && item.playcount != 0)){
      const listItem = {
        title: tools.movieTitle(item),
        label: tools.arrayToString(item.genre),
        thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
        actionIdentifier: `${item.movieid}`
      };
      list.addListItem(listItem);
    }
  });
  return list;
}


//////////////////////////////////
// Base Movie Menu
function baseListMenu(deviceId){

  const options = {
    title: `Movies`,
    totalMatchingItems: 2,
    browseIdentifier: ".",
    offset: 0,
    limit: 10
  };
  const list = neeoapi.buildBrowseList(options);
 
  if (kodiController.kodiReady(deviceId)){
    list.addListHeader('Movies');
    list.addListItem({
      title: "Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "Movies"
    });
    list.addListItem({
      title: "Recent Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "Recent Movies"
    });
  } else {
    list.addListHeader('Kodi is not connected');
    list.addListItem({
      title: "Tap to refresh",
      thumbnailUri: images.icon_movie,
      browseIdentifier: '.'
    });
  }
  return list;
}
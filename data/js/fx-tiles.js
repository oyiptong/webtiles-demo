
self.port.on("inject_firefox_tile", function([place, links]) {
    console.error("PLACE! " + JSON.stringify(place, null, 4));
    console.error("links! " + JSON.stringify(links, null, 4));
    if ('frecent_sites' in place && 'directoryId' in place) {
        console.error("Got a live one!");

        let id = place.directoryId;
        let tile = null;
        for (let t of links) {
            if ('directoryId' in t && t.directoryId == id){
                tile = t;
                break;
            }
        }
        console.error("Master: " + JSON.stringify(tile));
        let ad = document.createElement('img');
        ad.src = tile.imageURI;
        document.body.insertBefore(ad, document.body.firstChild);
    }
});




export const displayMap = (locations) => {

  mapboxgl.accessToken = 'pk.eyJ1IjoibmFiaGFtc2hhcm1hIiwiYSI6ImNsMWVmOGY3ejBxcGEzcHAzbXN5dGljdG8ifQ.BA4MCWSgBF_jcM1ZEJNzzA';
  let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/nabhamsharma/cl1eg4n66007i15nt0lijvspp', // style URL
    // center: [-118, 34], // starting position [lng, lat]
    // zoom: 9, // starting zoom
    scrollZoom: false
  });



  const bounce = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //Add marker

    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);


    //Add Popup

    new mapboxgl.Popup({
      offset: 30
    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
      .addTo(map)

    bounce.extend(loc.coordinates)
  });

  map.fitBounds(bounce, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 200

    }
  });

}


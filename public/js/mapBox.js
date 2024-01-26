export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoieWFzaDA1MjEiLCJhIjoiY2xyMnl5cDl1MDd3ZTJrcjFuNTV1cmsweCJ9.TWdib5MHBZZi2Fa398-88Q';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/yash0521/clr2z44xc01bf01qu595kbku9', // style URL
    scrollZoom: false,
    // center: [-118.113491, 34.111745], // starting position [lng, lat]
    // zoom: 4, // starting zoom
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add Popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend the boundaries to include each marker on load
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

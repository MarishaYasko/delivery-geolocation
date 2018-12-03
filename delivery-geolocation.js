/*
@name: delivery-geolocation
@description module for an site that help calc destination from x to n point with help of GoogleMaps script
@author Marianna Yasko
 */

class DeliveryByGeolocationModule {

    constructor(translates) {
        this.api = {
            googleMapsAPIKey: 'AIzaSyDwYZIWauBDucDi1DQv028vBOxIYjFPVis',
            streetsApi: ''
        };
        this.translates = translates;
        this.Map = null;
    }

    connectBaseScripts(googleApiKey) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
        document.head.appendChild(script);
    }

    buildDestanyForm(translates) {
        const template = `<form id="orderForm">
            <div class="pac-card">
              <div class="pac-container" id="pac-container-x">
                <input class="pac-input" type="text" name="destanyX" id="destanyX" placeholder="${translates.placeholders.x}">
              </div>
            </div>
            <div class="pac-card">
              <div class="pac-container" id="pac-container-y">
                 <input class="pac-input" type="text" name="destanyY" id="destanyY" placeholder="${translates.placeholders.y}" />
              </div>
            </div>
            <div class="pac-card">
              <div class="pac-container">
                 <input class="pac-input" type="text" name="destanyLength" id="destanyLength" placeholder="${translates.placeholders.destany_length}" />
              </div>
            </div>
        </form>`;

        const formTemplate = document.createElement('div');
        formTemplate.innerHTML = template;

        return formTemplate;
    }

    buildMap() {
        const template = `<div id="googleMap"></div>`;

        const mapTemplate = document.createElement('div');
        mapTemplate.innerHTML = template;

        return mapTemplate;
    }

    shoosePointOnMap(info) {
        console.log('Choosen point: ', info);
    }

    init() {
        this.connectBaseScripts(this.api.googleMapsAPIKey);
        const form = this.buildDestanyForm(this.translates);
        const map = this.buildMap();
        document.body.appendChild(form);
        document.body.appendChild(map);
        this.handleDestanyInputs();
    }

    handleDestanyInputs() {
        const destany = {
            x: null,
            y: null
        };
        document.getElementById('destanyX').addEventListener('input', (event) => {
            console.log('Detstany x handled: ', event.target.value);
            destany.x = event.target.value;
            if (destany.x && destany.y) {
                calcDestanyLength({ x: 20, y: 40 });
            }
        });
        document.getElementById('destanyY').addEventListener('input', (event) => {
            console.log('Detstany y handled: ', event.target.value);
            destany.y = event.target.value;
            calcDestanyLength({ x: 20, y: 40 });
        });
        function calcDestanyLength({ x, y }) {
            // call to GoogleMaps api
            document.getElementById('destanyLength').value = 100;
        }
    }

    initMap() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.Map = new google.maps.Map(document.getElementById('googleMap'), {
                    center: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    },
                    zoom: 20
                });
                const card = document.getElementById('pac-card');
                const destanyInputs = {
                    x: document.querySelector('#destanyX'),
                    y: document.querySelector('#destanyY')
                };

                this.Map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

                const autocompleteX = new google.maps.places.Autocomplete(destanyInputs.x);
                const autocompleteY = new google.maps.places.Autocomplete(destanyInputs.y);

                // Bind the map's bounds (viewport) property to the autocomplete object,
                // so that the autocomplete requests use the current map bounds for the
                // bounds option in the request.
                autocompleteX.bindTo('bounds', this.Map);
                autocompleteY.bindTo('bounds', this.Map);

                // Set the data fields to return when the user selects a place.
                autocompleteX.setFields(['address_components', 'geometry', 'icon', 'name']);
                autocompleteY.setFields(['address_components', 'geometry', 'icon', 'name']);

                const marker = new google.maps.Marker({
                    map: this.Map,
                    anchorPoint: new google.maps.Point(0, -20)
                });

                autocompleteX.addListener('place_changed', ((event) => {
                    console.log(event);
                    marker.setVisible(false);
                    const place = autocompleteX.getPlace();
                    if (!place.geometry) {
                        console.log('No place geometry');
                        return;
                    }

                    // If the place has a geometry, then present it on a map.
                    if (place.geometry.viewport) {
                        this.Map.fitBounds(place.geometry.viewport);
                    } else {
                        this.Map.setCenter(place.geometry.location);
                        this.Map.setZoom(17);  // Why 17? Because it looks good.
                    }
                    marker.setPosition(place.geometry.location);
                    marker.setVisible(true);

                    let address = '';
                    if (place.address_components) {
                        address = [
                            (place.address_components[0] && place.address_components[0].short_name || ''),
                            (place.address_components[1] && place.address_components[1].short_name || ''),
                            (place.address_components[2] && place.address_components[2].short_name || '')
                        ].join(' ');
                        console.log('address: ', address);
                    }
                }));
            });
        }
    }
}
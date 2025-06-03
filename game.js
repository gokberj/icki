class AlcoholLicenseGame {
    constructor() {
        this.locations = [
            // Istanbul - Dense areas
            { name: 'Fatih', city: 'İstanbul', center: [41.0186, 28.9497], zoom: 17 },
            { name: 'Sultanahmet', city: 'İstanbul', center: [41.0082, 28.9784], zoom: 17 },
            { name: 'Eminönü', city: 'İstanbul', center: [41.0168, 28.9700], zoom: 17 },
            { name: 'Üsküdar', city: 'İstanbul', center: [41.0246, 29.0170], zoom: 17 },
            { name: 'Eyüp', city: 'İstanbul', center: [41.0477, 28.9334], zoom: 17 },
            { name: 'Kasımpaşa', city: 'İstanbul', center: [41.0389, 28.9765], zoom: 17 },
            { name: 'Balat', city: 'İstanbul', center: [41.0289, 28.9476], zoom: 17 },
            
            // İzmir - Historic/Dense areas
            { name: 'Konak', city: 'İzmir', center: [38.4189, 27.1287], zoom: 17 },
            { name: 'Kemeraltı', city: 'İzmir', center: [38.4192, 27.1325], zoom: 17 },
            { name: 'Basmane', city: 'İzmir', center: [38.4256, 27.1389], zoom: 17 },
            
            // Ankara - Central/Dense areas
            { name: 'Ulus', city: 'Ankara', center: [39.9420, 32.8556], zoom: 17 },
            { name: 'Hacıbayram', city: 'Ankara', center: [39.9410, 32.8625], zoom: 17 },
            { name: 'Hamamönü', city: 'Ankara', center: [39.9307, 32.8608], zoom: 17 },
            { name: 'Cebeci', city: 'Ankara', center: [39.9350, 32.8780], zoom: 17 },
            
            // Bursa - Historic areas
            { name: 'Osmangazi', city: 'Bursa', center: [40.1826, 29.0665], zoom: 17 },
            { name: 'Tophane', city: 'Bursa', center: [40.1834, 29.0590], zoom: 17 },
            { name: 'Muradiye', city: 'Bursa', center: [40.1943, 29.0510], zoom: 17 },
            
            // Eskişehir - Historic/University areas
            { name: 'Odunpazarı', city: 'Eskişehir', center: [39.7667, 30.5256], zoom: 17 },
            
            // Diyarbakır - Historic areas
            { name: 'Sur', city: 'Diyarbakır', center: [37.9158, 40.2369], zoom: 17 },
            { name: 'Suriçi', city: 'Diyarbakır', center: [37.9110, 40.2340], zoom: 17 },
            
            // Konya - Historic center
            { name: 'Mevlana', city: 'Konya', center: [37.8706, 32.5046], zoom: 17 },
            { name: 'Karatay', city: 'Konya', center: [37.8740, 32.4960], zoom: 17 },
            
            // Kayseri - Historic center
            { name: 'Melikgazi', city: 'Kayseri', center: [38.7225, 35.4875], zoom: 17 },
            { name: 'Cumhuriyet', city: 'Kayseri', center: [38.7205, 35.4810], zoom: 17 },
            
            // Gaziantep - Dense areas
            { name: 'Şahinbey', city: 'Gaziantep', center: [37.0662, 37.3833], zoom: 17 },
            { name: 'Bey Mahallesi', city: 'Gaziantep', center: [37.0640, 37.3780], zoom: 17 },
            
            // Trabzon - Historic center
            { name: 'Ortahisar', city: 'Trabzon', center: [41.0055, 39.7269], zoom: 17 },
            
            // Samsun - Central area
            { name: 'İlkadım', city: 'Samsun', center: [41.2867, 36.3300], zoom: 17 },
            
            // Erzurum - Historic center
            { name: 'Yakutiye', city: 'Erzurum', center: [39.9043, 41.2679], zoom: 17 }
        ];
        
        this.establishments = [
            { type: 'tekel', label: 'Bir tekel bayii aç', icon: 'tekel.png' },
            { type: 'restaurant', label: 'Bir içkili restoran aç', icon: 'rest.png' },
            { type: 'meyhane', label: 'Bir meyhane aç', icon: 'meyhane.png' },
            { type: 'bar', label: 'Bir bar aç', icon: 'bar.png' },
            { type: 'club', label: 'Bir gece kulübü aç', icon: 'club.png' }
        ];
        
        this.currentLocationIndex = 0;
        this.currentEstablishment = 0;
        this.placedEstablishments = [];
        this.restrictedZones = [];
        this.gameActive = true;
        this.hintLayers = [];
        this.failedZones = [];
        this.greenAreas = [];
        this.customCursor = null;
        
        this.initGame();
    }
    
    async initGame() {
        // Pick random location
        this.currentLocationIndex = Math.floor(Math.random() * this.locations.length);
        const location = this.locations[this.currentLocationIndex];
        
        this.currentEstablishment = 0;
        this.placedEstablishments = [];
        this.restrictedZones = [];
        this.gameActive = true;
        this.hintLayers = [];
        this.failedZones = [];
        this.clickLocation = null;
        this.greenAreas = [];
        
        // Hide game over modal
        document.getElementById('game-over-modal').style.display = 'none';
        
        // Clean up any existing green layer
        if (this.greenLayer) {
            this.greenLayer.clearLayers();
        }
        
        // Show loading message
        document.querySelector('#challenge .location').textContent = 'Harita yükleniyor...';
        document.querySelector('#challenge .progress').textContent = '1/5';
        document.querySelector('#challenge .text').textContent = '';
        document.querySelector('#challenge .icon').src = '';
        document.querySelector('#challenge .icon').style.display = 'none';
        
        // Add loading spinner
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        document.querySelector('#challenge .task').appendChild(spinner);
        
        if (this.map) {
            this.map.remove();
        }
        
        this.initMap(location);
        
        // Load real data
        await this.loadRealRestrictedZones();
        await this.loadGreenAreas();
        
        this.updateChallenge();
        
        // Initialize custom cursor
        this.showCustomCursor();
    }
    
    initMap(location) {
        this.map = L.map('map', {
            center: location.center,
            zoom: location.zoom,
            minZoom: location.zoom,
            maxZoom: 18,
            zoomControl: false,
            attributionControl: false
        });
        
        // Use CartoDB Positron tiles which have minimal labels (only street names)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '',
            maxZoom: 19,
            subdomains: 'abcd'
        }).addTo(this.map);
        
        // Add only street labels layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
            attribution: '',
            maxZoom: 19,
            subdomains: 'abcd',
            pane: 'shadowPane'  // This ensures labels appear above other features
        }).addTo(this.map);
        
        this.dangerLayer = L.layerGroup().addTo(this.map);
        this.hintLayer = L.layerGroup().addTo(this.map);
        this.greenLayer = L.layerGroup().addTo(this.map);
        this.restrictedLayer = L.layerGroup().addTo(this.map);
        this.placementLayer = L.layerGroup().addTo(this.map);
        
        // Add click handler
        this.map.on('click', (e) => this.onMapClick(e));
        
        // Create custom cursor
        this.createCustomCursor();
        
        // Track mouse movement for custom cursor
        this.map.on('mousemove', (e) => this.updateCustomCursor(e));
        this.map.on('mouseenter', () => this.showCustomCursor());
        this.map.on('mouseleave', () => this.hideCustomCursor());
    }
    
    async loadRealRestrictedZones() {
        const bounds = this.map.getBounds();
        const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
        
        // Overpass API query for schools, mosques, and dormitories
        const query = `
            [out:json][timeout:30];
            (
                // Schools
                node["amenity"="school"](${bbox});
                way["amenity"="school"](${bbox});
                node["amenity"="kindergarten"](${bbox});
                way["amenity"="kindergarten"](${bbox});
                node["amenity"="university"](${bbox});
                way["amenity"="university"](${bbox});
                node["amenity"="college"](${bbox});
                way["amenity"="college"](${bbox});
                
                // Religious places
                node["amenity"="place_of_worship"]["religion"="muslim"](${bbox});
                way["amenity"="place_of_worship"]["religion"="muslim"](${bbox});
                node["amenity"="place_of_worship"]["religion"="christian"](${bbox});
                way["amenity"="place_of_worship"]["religion"="christian"](${bbox});
                node["amenity"="place_of_worship"]["religion"="jewish"](${bbox});
                way["amenity"="place_of_worship"]["religion"="jewish"](${bbox});
                
                // Dormitories
                node["building"="dormitory"](${bbox});
                way["building"="dormitory"](${bbox});
                node["amenity"="dormitory"](${bbox});
                way["amenity"="dormitory"](${bbox});
                node["tourism"="hostel"]["operator"~"university|üniversite|yurt"](${bbox});
                way["tourism"="hostel"]["operator"~"university|üniversite|yurt"](${bbox});
            );
            out center;
        `;
        
        try {
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
            
            const data = await response.json();
            
            // Process the data
            data.elements.forEach(element => {
                let lat, lng, name, type, subtype, religion;
                
                // Get coordinates
                if (element.type === 'node') {
                    lat = element.lat;
                    lng = element.lon;
                } else if (element.center) {
                    lat = element.center.lat;
                    lng = element.center.lon;
                } else {
                    return; // Skip if no coordinates
                }
                
                // Get name
                name = element.tags.name || element.tags['name:tr'] || '';
                
                // Determine type and subtype
                if (element.tags.amenity === 'kindergarten') {
                    type = 'school';
                    subtype = 'Anaokulu';
                    name = name || 'Anaokulu';
                } else if (element.tags.amenity === 'school') {
                    type = 'school';
                    // Try to determine school type from name
                    if (name.toLowerCase().includes('ilkokul') || name.toLowerCase().includes('ilköğretim')) {
                        subtype = 'İlkokulu';
                    } else if (name.toLowerCase().includes('ortaokul')) {
                        subtype = 'Ortaokulu';
                    } else if (name.toLowerCase().includes('lise')) {
                        subtype = 'Lisesi';
                    } else {
                        subtype = 'Okulu';
                    }
                    name = name || 'Okul';
                } else if (element.tags.amenity === 'university') {
                    type = 'school';
                    subtype = 'Üniversitesi';
                    name = name || 'Üniversite';
                } else if (element.tags.amenity === 'college') {
                    type = 'school';
                    subtype = 'Koleji';
                    name = name || 'Kolej';
                } else if (element.tags.amenity === 'place_of_worship') {
                    type = 'worship';
                    religion = element.tags.religion;
                    if (element.tags.religion === 'christian') {
                        subtype = 'Kilisesi';
                        name = name || 'Kilise';
                    } else if (element.tags.religion === 'jewish') {
                        subtype = 'Sinagogu';
                        name = name || 'Sinagog';
                    } else {
                        subtype = 'Camii';
                        name = name || 'Cami';
                    }
                } else if (element.tags.building === 'dormitory' || 
                           element.tags.amenity === 'dormitory' || 
                           (element.tags.tourism === 'hostel' && element.tags.operator)) {
                    type = 'dormitory';
                    subtype = 'Yurdu';
                    name = name || 'Öğrenci Yurdu';
                } else {
                    return; // Skip unknown types
                }
                
                this.restrictedZones.push({
                    type: type,
                    subtype: subtype,
                    religion: religion,
                    lat: lat,
                    lng: lng,
                    name: name
                });
            });
            
            console.log(`Loaded ${this.restrictedZones.length} restricted zones`);
            
        } catch (error) {
            console.error('Error loading data from Overpass API:', error);
            // Fallback to some default zones if API fails
            this.createFallbackZones();
        }
    }
    
    createFallbackZones() {
        // Fallback data in case API fails
        const location = this.locations[this.currentLocationIndex];
        alert('Gerçek veri yüklenemedi, varsayılan verilerle devam ediliyor.');
        
        // Add some known locations as fallback
        this.restrictedZones = [
            {type: 'school', subtype: 'Ortaokulu', lat: location.center[0] + 0.001, lng: location.center[1], name: 'Örnek Ortaokulu'},
            {type: 'worship', subtype: 'Camii', religion: 'muslim', lat: location.center[0], lng: location.center[1] + 0.001, name: 'Örnek Camii'},
            {type: 'dormitory', subtype: 'Yurdu', lat: location.center[0] - 0.001, lng: location.center[1], name: 'Örnek Yurdu'}
        ];
    }
    
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    createCustomCursor() {
        if (!this.customCursor) {
            this.customCursor = document.createElement('img');
            this.customCursor.className = 'custom-cursor';
            this.customCursor.style.display = 'none';
            document.body.appendChild(this.customCursor);
        }
    }
    
    updateCustomCursor(e) {
        if (this.customCursor && this.gameActive && this.currentEstablishment < this.establishments.length) {
            const containerPoint = e.containerPoint;
            this.customCursor.style.left = containerPoint.x + 'px';
            this.customCursor.style.top = containerPoint.y + 'px';
        }
    }
    
    showCustomCursor() {
        if (this.customCursor && this.gameActive && this.currentEstablishment < this.establishments.length) {
            this.customCursor.style.display = 'block';
        }
    }
    
    hideCustomCursor() {
        if (this.customCursor) {
            this.customCursor.style.display = 'none';
        }
    }
    
    async loadGreenAreas() {
        const bounds = this.map.getBounds();
        const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
        
        // Query for parks and green areas
        const query = `
            [out:json][timeout:30];
            (
                // Parks and gardens
                way["leisure"="park"](${bbox});
                way["leisure"="garden"](${bbox});
                way["leisure"="playground"](${bbox});
                way["landuse"="grass"](${bbox});
                way["landuse"="recreation_ground"](${bbox});
                way["landuse"="village_green"](${bbox});
                way["landuse"="forest"](${bbox});
                way["natural"="wood"](${bbox});
                way["natural"="grassland"](${bbox});
            );
            out geom;
        `;
        
        try {
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
            
            const data = await response.json();
            
            // Process and display green areas
            data.elements.forEach(element => {
                if (element.geometry) {
                    const coordinates = element.geometry.map(coord => [coord.lat, coord.lon]);
                    const polygon = L.polygon(coordinates, {
                        fillColor: '#81C784',
                        fillOpacity: 0.3,
                        weight: 0,
                        interactive: false
                    }).addTo(this.greenLayer);
                    
                    this.greenAreas.push(polygon);
                }
            });
            
        } catch (error) {
            console.error('Error loading green areas:', error);
        }
    }
    
    updateChallenge() {
        const current = this.establishments[this.currentEstablishment];
        const challengeEl = document.getElementById('challenge');
        const location = this.locations[this.currentLocationIndex];
        
        // Remove any loading spinner
        const spinner = challengeEl.querySelector('.loading-spinner');
        if (spinner) spinner.remove();
        
        // Show icon again
        document.querySelector('#challenge .icon').style.display = 'block';
        
        // Add fade out effect
        challengeEl.style.opacity = '0';
        challengeEl.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // Update location
            document.querySelector('#challenge .location').textContent = `${location.city}, ${location.name}`;
            
            // Update progress
            document.querySelector('#challenge .progress').textContent = `${this.currentEstablishment + 1}/5`;
            
            // Update task
            document.querySelector('#challenge .text').textContent = current.label;
            document.querySelector('#challenge .icon').src = current.icon;
            
            // Update cursor class
            document.getElementById('map').className = `placing-${current.type}`;
            
            // Update custom cursor image
            if (this.customCursor) {
                this.customCursor.src = current.icon;
                this.showCustomCursor();
            }
            
            // Fade back in
            challengeEl.style.opacity = '1';
            challengeEl.style.transform = 'scale(1)';
        }, 300);
    }
    
    onMapClick(e) {
        if (!this.gameActive || this.currentEstablishment >= this.establishments.length) {
            return;
        }
        
        const clickedLat = e.latlng.lat;
        const clickedLng = e.latlng.lng;
        this.clickLocation = e.latlng;
        
        // Check if click is in a green area
        let inGreenArea = false;
        for (let greenArea of this.greenAreas) {
            if (greenArea.getBounds && greenArea.getBounds().contains(e.latlng)) {
                // More precise check using ray casting
                const polygon = greenArea.getLatLngs()[0];
                if (this.isPointInPolygon(e.latlng, polygon)) {
                    inGreenArea = true;
                    break;
                }
            }
        }
        
        if (inGreenArea) {
            // Show warning for green area
            const warning = L.popup()
                .setLatLng(e.latlng)
                .setContent('🌳 Park ve yeşil alanlara yerleşemezsin!')
                .openOn(this.map);
            setTimeout(() => this.map.closePopup(warning), 2000);
            return;
        }
        
        // Check if click is too close to already placed establishments (150m)
        for (let placed of this.placedEstablishments) {
            const distance = this.calculateDistance(clickedLat, clickedLng, placed.lat, placed.lng);
            if (distance < 150) {
                // Show temporary warning
                const warning = L.popup()
                    .setLatLng(e.latlng)
                    .setContent('⚠️ Buraya yakın zaten bir işletme açtın.')
                    .openOn(this.map);
                setTimeout(() => this.map.closePopup(warning), 2000);
                return;
            }
        }
        
        // Check if click is within 100m of any restricted zone
        let tooClose = false;
        let closestSafeDistance = Infinity;
        this.failedZones = [];
        
        this.restrictedZones.forEach(zone => {
            const distance = this.calculateDistance(clickedLat, clickedLng, zone.lat, zone.lng);
            if (distance <= 100) {
                tooClose = true;
                this.failedZones.push({
                    zone: zone,
                    distance: Math.round(distance)
                });
            } else if (distance > 100 && distance < closestSafeDistance) {
                closestSafeDistance = distance;
            }
        });
        
        // Sort by distance
        this.failedZones.sort((a, b) => a.distance - b.distance);
        
        if (tooClose) {
            // Show all danger zones that were hit
            this.failedZones.forEach(item => {
                this.revealDangerZone(item.zone, true);
            });
            this.gameOver(false);
        } else {
            // Check for "Kıl payı!" (within 5 meters of danger)
            if (closestSafeDistance <= 105) {
                this.showCloseCallPopup();
            }
            
            // Safe placement
            this.placeEstablishment(e.latlng);
            this.showHints(clickedLat, clickedLng);
        }
    }
    
    // Helper function to check if a point is inside a polygon
    isPointInPolygon(point, polygon) {
        const x = point.lat, y = point.lng;
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lat, yi = polygon[i].lng;
            const xj = polygon[j].lat, yj = polygon[j].lng;
            
            const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    showCloseCallPopup() {
        // Create and show the "Kıl payı!" popup
        const popup = document.createElement('div');
        popup.className = 'close-call-popup';
        popup.innerHTML = '<span>🔥 Kıl payı!</span>';
        document.body.appendChild(popup);
        
        // Remove after animation
        setTimeout(() => {
            popup.remove();
        }, 2000);
    }
    
    showHints(lat, lng) {
        // Find all restricted zones within 200m (to show partial circles)
        const nearbyZones = this.restrictedZones.filter(zone => {
            const distance = this.calculateDistance(lat, lng, zone.lat, zone.lng);
            return distance <= 200; // 100m placement radius + 100m danger radius
        });
        
        if (nearbyZones.length === 0) return;
        
        // Create placement circle (100m radius from clicked point)
        const placementCircle = turf.circle([lng, lat], 0.1, {steps: 64, units: 'kilometers'});
        
        nearbyZones.forEach(zone => {
            // Create danger circle for this zone
            const dangerCircle = turf.circle([zone.lng, zone.lat], 0.1, {steps: 64, units: 'kilometers'});
            
            // Find intersection
            const intersection = turf.intersect(placementCircle, dangerCircle);
            
            if (intersection) {
                // Convert to Leaflet format and add to map as permanent hint
                L.geoJSON(intersection, {
                    style: {
                        className: 'hint-zone'
                    }
                }).addTo(this.hintLayer);
            }
        });
    }
    
    revealAllDangerZones() {
        // Group zones by proximity to merge overlapping circles
        const mergedZones = this.getMergedDangerZones();
        
        // Clear previous danger zones
        this.dangerLayer.clearLayers();
        
        // Draw merged zones
        mergedZones.forEach(zone => {
            L.geoJSON(zone, {
                style: {
                    className: 'danger-zone'
                }
            }).addTo(this.dangerLayer);
        });
        
        // Add markers for institutions
        this.restrictedZones.forEach(zone => {
            this.addInstitutionMarker(zone, true);
        });
    }
    
    getMergedDangerZones() {
        if (this.restrictedZones.length === 0) return [];
        
        // Create circles for all zones
        let circles = this.restrictedZones.map(zone => 
            turf.circle([zone.lng, zone.lat], 0.1, {steps: 64, units: 'kilometers'})
        );
        
        // Merge overlapping circles
        let merged = circles[0];
        for (let i = 1; i < circles.length; i++) {
            try {
                const union = turf.union(merged, circles[i]);
                if (union) merged = union;
            } catch (e) {
                // If union fails, keep them separate
                console.warn('Failed to merge circles', e);
            }
        }
        
        return [merged];
    }
    
    revealDangerZone(zone, showName = false) {
        // Add a single danger circle for the hit zone with animation
        const circle = L.circle([zone.lat, zone.lng], {
            radius: 100,
            className: 'danger-zone danger-zone-reveal'
        }).addTo(this.dangerLayer);
        
        // Remove the reveal class after animation
        setTimeout(() => {
            if (circle._path) {
                circle._path.classList.remove('danger-zone-reveal');
            }
        }, 1000);
        
        this.addInstitutionMarker(zone, showName);
    }
    
    getOSMIcon(zone) {
        if (zone.type === 'school') {
            return 'osm-icon-school';
        } else if (zone.type === 'worship') {
            if (zone.religion === 'christian') {
                return 'osm-icon-church';
            } else if (zone.religion === 'jewish') {
                return 'osm-icon-synagogue';
            } else {
                return 'osm-icon-mosque';
            }
        } else if (zone.type === 'dormitory') {
            return 'osm-icon-dormitory';
        }
        return 'osm-icon-school';
    }
    
    addInstitutionMarker(zone, showName) {
        // Create OSM-style icon
        const iconClass = this.getOSMIcon(zone);
        
        // Create a custom icon with label
        const iconHtml = `
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                <div class="osm-icon ${iconClass}"></div>
                ${showName ? `<div style="background: white; padding: 2px 6px; border-radius: 4px; 
                           font-size: 12px; margin-top: 4px; white-space: nowrap;
                           box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    ${zone.name}
                </div>` : ''}
            </div>
        `;
        
        L.marker([zone.lat, zone.lng], {
            icon: L.divIcon({
                html: iconHtml,
                iconSize: showName ? [150, 50] : [20, 20],
                iconAnchor: showName ? [75, 25] : [10, 10],
                className: ''
            })
        }).addTo(this.restrictedLayer);
    }
    
    placeEstablishment(latlng) {
        const establishment = this.establishments[this.currentEstablishment];
        
        // Save this placement
        this.placedEstablishments.push({
            lat: latlng.lat,
            lng: latlng.lng,
            type: establishment.type
        });
        
        // Place the establishment with PNG icon with animation
        const marker = L.marker(latlng, {
            icon: L.icon({
                iconUrl: establishment.icon,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                className: 'establishment-marker-animated'
            })
        }).addTo(this.placementLayer);
        
        // Add multiple animated circles for success effect
        const circles = [];
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const circle = L.circle(latlng, {
                    radius: 100,
                    fillColor: '#4CAF50',
                    fillOpacity: 0,
                    color: '#4CAF50',
                    weight: 2,
                    opacity: 0,
                    className: 'success-ripple'
                }).addTo(this.placementLayer);
                circles.push(circle);
                
                // Remove after animation
                setTimeout(() => {
                    this.placementLayer.removeLayer(circle);
                }, 1500);
            }, i * 200);
        }
        
        this.currentEstablishment++;
        
        if (this.currentEstablishment >= this.establishments.length) {
            setTimeout(() => this.gameOver(true), 500);
        } else {
            this.updateChallenge();
        }
    }
    
    getFailureMessage() {
        if (this.failedZones.length === 0) {
            return '100 metre kuralı ihlal edildi.';
        }
        
        let message = '';
        
        this.failedZones.forEach((item, index) => {
            const zone = item.zone;
            const distance = item.distance;
            
            // Format the institution name properly
            let institutionName = zone.name;
            if (institutionName && !institutionName.toLowerCase().includes(zone.subtype.toLowerCase())) {
                institutionName = `${institutionName} ${zone.subtype}`;
            } else if (!institutionName) {
                institutionName = zone.subtype;
            }
            
            message += `${distance} metre mesafende ${institutionName}`;
            
            if (index < this.failedZones.length - 1) {
                message += ', ';
            }
        });
        
        message += ' olduğu için ruhsat alamazsın.';
        return message;
    }
    
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                document.body.appendChild(confetti);
                
                // Remove after animation
                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
    }
    
    gameOver(won) {
        this.gameActive = false;
        
        // Remove cursor class and hide custom cursor
        document.getElementById('map').className = '';
        this.hideCustomCursor();
        
        // Hide challenge text but keep structure
        document.getElementById('challenge').style.visibility = 'hidden';
        
        // Reveal all danger zones with merged circles
        this.revealAllDangerZones();
        
        const location = this.locations[this.currentLocationIndex];
        let content = '';
        
        if (won) {
            // Create confetti effect
            this.createConfetti();
            
            content = `<h3 style="color: #4CAF50;">🎉 Tebrikler!</h3>
                      <button class="restart-button" onclick="game.initGame()">Yeni Bölge</button>
                      <p>${location.city}, ${location.name}'de başarılı oldunuz!</p>`;
        } else {
            content = `<h3 style="color: #F44336;">💥 Başarısız!</h3>
                      <button class="restart-button" onclick="game.initGame()">Yeni Bölge</button>
                      <p>${this.getFailureMessage()}</p>`;
        }
        
        document.getElementById('game-over-modal').innerHTML = content;
        document.getElementById('game-over-modal').style.display = 'block';
        
        // Show challenge text again after a delay
        setTimeout(() => {
            document.getElementById('challenge').style.visibility = 'visible';
            document.getElementById('challenge').style.display = 'block';
        }, 100);
    }
}

// Create global game instance
let game;
// Game initialization is now handled by the startGame() function in HTML

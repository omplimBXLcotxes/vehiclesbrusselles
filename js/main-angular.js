var app = angular.module("MyApp", ["firebase", 'ui.router', 'angularMoment']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/home");
    $urlRouterProvider.when('/marc', '/home');
    $stateProvider
    // Dashboard
        .state('home', {
            url: "/home",
            templateUrl: "views/inici.html",
            controller: "HomeCtrl"
        })
        .state('editartot', {
            url: "/editar",
            templateUrl: "views/editartot.html",
            controller: "EditarTotCtrl"
        }).state('mapa', {
            url: "/mapa",
            templateUrl: "views/mapa.html",
            controller: "HomeCtrl"
        })
        .state('login', {
            url: "/login/:mid/:fin",
            templateUrl: "views/login.html",
            controller: "LoginCtrl"
        })
        .state('verificar', {
            url: "/verificar/:mid/:fin",
            templateUrl: "views/verificar.html",
            controller: "VerificarCtrl"
        })
        .state('afegir', {
            url: "/afegir",
            templateUrl: "views/add.html",
            controller: "AddCtrl"
        })
        .state('editar', {
            url: "/editar/:id",
            templateUrl: "views/editar.html",
            controller: "EditarCtrl"
        })
        .state('contactar', {
            url: "/contactar/:id",
            templateUrl: "views/contactar.html",
            controller: "ContactarCtrl"
        })
        .state('ok', {
            url: "/correcte",
            templateUrl: "views/ok.html"
        })
        .state('contactat', {
            url: "/contactat/:persona",
            templateUrl: "views/contactat.html",
            controller: "OkCtrl"
        })
        .state('dades', {
            url: "/dades",
            templateUrl: "views/dades.html",
            controller: "DadesCtrl"
        })
    $.extend($.fn.pickadate.defaults, {
        monthsFull: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'],
        weekdaysShort: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'],
        monthsShort: ['Gen', 'Feb', 'Març', 'Abril', 'Maig', 'Juny', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des'],
        today: '',
        clear: '',
        close: '',
        selectMonths: false,
        selectYears: 1,
        closeOnSelect: true,
        format: 'dd/mm/yyyy',
        firstDay: 1,
        min: new Date(2017, 11, 1)
    })
}]);

app.controller("MainCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
    var ref = firebase.database().ref();

});

app.controller("HomeCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
    $scope.user_id = false;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            $scope.user_id = user.uid;
            $scope.user = user;
            $scope.tanca = function () {
                firebase.auth().signOut();
            };
        } else {
            $scope.user = "";
            $scope.user_id = false;
        }
    });
    var ref = firebase.database().ref();
    $scope.cotxes = $firebaseArray(ref.child("cotxes"));
    $scope.dades = $firebaseObject(ref.child("dades/totals"));
    var map;
    var infowindow;

    $(document).ready(function () {
        $('select').material_select();
        $('.datepicker').pickadate({
            selectMonths: true,
            selectYears: 1,
            closeOnSelect: true,
            format: 'dd/mm/yyyy',
            firstDay: 1
        });
    });

    $scope.minim = function (cotxe) {
        if ($scope.minim_places) {
            return cotxe.lliures >= $scope.minim_places;
        } else {
            return true;
        }
    }
    $scope.datamin = function (cotxe) {
        if ($scope.dataminim) {
            return cotxe.anada == $scope.dataminim;
        } else {
            return true;
        }
    }
    $scope.datamax = function (cotxe) {
        if ($scope.datamaxim) {
            return cotxe.tornada == $scope.datamaxim;
        } else {
            return true;
        }
    }
    $scope.mostrarplens = false;
    $scope.mostrarPlens = function (cotxe) {
        if ($scope.mostrarplens) {
            return true;
        } else {
            return cotxe.lliures > 0;
        }
    }
    $scope.filtre_vehicle = "tot";
    $scope.filtrevehicle = function (cotxe) {
        if ($scope.filtre_vehicle == "Cotxe") {
            return cotxe.vehicle == "Cotxe";
        } else if ($scope.filtre_vehicle == "Moto") {
            return cotxe.vehicle == "Moto";
        } else if ($scope.filtre_vehicle == "Caravana") {
            return cotxe.vehicle == "Caravana";
        } else {
            return true;
        }
    }

    $scope.eliminar = function (idcotxe, idpersona) {
        if (confirm("Segur que vols eliminar la publicació?")) {
            if ($scope.user.uid == idpersona || $scope.user.uid != "mmucCScs6GWKXvTT7O6cirDt1K0QM2" || $scope.user.uid != "mmtxA396QdGdXVK7rnT0L4PmPrMi12") {
                ref.child("cotxes/" + idcotxe).remove();
            } else {
                alert("No tens permís per eliminar aquesta publicació");
            }
        } else {
            alert("Ok, no l'eliminem.");
        }
    }

    function initMap() {
        var pyrmont = {
            lat: 41.7,
            lng: 1.8
        };

        map = new google.maps.Map(document.getElementById('mapa'), {
            center: pyrmont,
            zoom: 7
        });

        infowindow = new google.maps.InfoWindow();

        var oms = new OverlappingMarkerSpiderfier(map, {
            markersWontMove: true,
            markersWontHide: true,
            basicFormatEvents: true
        });

        $scope.cotxes.forEach(function (place) {

            (function () {
                var markerData = {
                    lat: Number(place.location.lat),
                    lng: Number(place.location.lng),
                    text: "<a href='#/contactar/" + place.$id + "'>" + place.ubicacio + " - " + place.passatgers + " persones</a>"
                }
                var label = "";
                if (place.lliures > 0) {
                    label = "*";
                } else {
                    label = ""
                }
                var marker = new google.maps.Marker({
                    position: markerData,
                    label: label
                });
                google.maps.event.addListener(marker, 'spider_click', function (e) { // 'spider_click', not plain 'click'
                    infowindow.setContent(markerData.text);
                    infowindow.open(map, marker);
                });
                oms.addMarker(marker); // adds the marker to the spiderfier _and_ the map
            })();
        });
    }

    $scope.cotxes.$loaded().then(function () {
        initMap();
    });
});


app.controller("AddCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
    $scope.vehicle = "Cotxe";
    var ref = firebase.database().ref();
    $scope.cotxes = $firebaseArray(ref.child("cotxes"));
    $(document).ready(function () {
        $('select').material_select();
        $('.datepicker').pickadate();
    });

    $scope.tanca = function () {
        firebase.auth().signOut();
    }

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            if (user.emailVerified == false) {
                $state.go("verificar", {
                    mid: "afegir",
                    fin: "cotxe"
                });
            }
            $scope.usuari = $firebaseObject(ref.child("usuaris/" + user.uid));
            $scope.usuari.$loaded().then(function () {
                setTimeout(function () {
                    if (!$scope.usuari.id) {
                        ref.child("usuaris/" + user.uid + "/id").set(user.uid);
                        $scope.usuari = $firebaseObject(ref.child("usuaris/" + user.uid));
                    }
                });
            });
            $scope.uid = user.uid;

            $scope.publica = function () {
                if (user.emailVerified == true) {
                    var nom = $scope.nom,
                        passatgers = Math.round($scope.passatgers),
                        lliures = Math.round($scope.lliures) || 0,
                        preu = $scope.preu || "",
                        anada = $scope.anada,
                        tornada = $scope.tornada,
                        hanada = $scope.hanada,
                        htornada = $scope.htornada,
                        ubicacio = $scope.ubicacio,
                        location = $scope.location || "",
                        comarca = $scope.comarca || "",
                        provincia = $scope.provincia || "",
                        info = $scope.info || "",
                        vehicle = $scope.vehicle,
                        date = Date.now();

                    if (!nom) {
                        alert("Falta especificar el teu nom");
                    } else if (!passatgers) {
                        alert("Has d'especificar el número de passatgers");
                    } else if (!anada || !tornada) {
                        alert("Has d'especificar una data d'anada i una data de tornada");
                    } else if (!hanada || !htornada) {
                        alert("Has d'especificar una hora d'anada i una de tornada");
                    } else if (!ubicacio) {
                        alert("Has d'especificar una ubicació");
                    } else if (passatgers < 0 || lliures < 0) {
                        alert("El nombre de passatgers i/o places disponibles no pot ser inferior a 0");
                    } else if (passatgers < lliures) {
                        alert("El nombre de places lliures no pot ser superior al de passatgers");
                    } else if (passatgers > 10) {
                        alert("Número de passatgers molt elevat.\No es pot publicar. Contacta'ns a vehiclesbrusselles@gmail.com i t'ajudarem.");
                    } else if (passatgers == 0) {
                        alert("El nombre de passatgers no pot ser 0");
                    } else if (passatgers % 1 != 0 || lliures % 1 != 0) {
                        alert("El nombre de passatgers i/o places disponibles ha de ser un nombre enter");
                    } else {

                        ref.child("cotxes").push({
                            id: $scope.uid,
                            nom: nom,
                            passatgers: passatgers,
                            lliures: lliures,
                            preu: preu,
                            anada: anada,
                            tornada: tornada,
                            hanada: hanada,
                            htornada: htornada,
                            ubicacio: ubicacio,
                            location: location,
                            info: info,
                            date: date,
                            comarca: comarca,
                            provincia: provincia,
                            vehicle: vehicle
                        }).then(function () {
                            $scope.places = 0;
                            $scope.placeslliures = 0;
                            $scope.cotxes.forEach(function (cotxe) {
                                setTimeout(function () {
                                    //ZONA COMENTADA, EN CAS DE SER NECESSARI S'EXECUTA UNA VEGADA I OMPLA ELS CAMPS COMARCA I PROVINCIA DELS QUE NO LA TENEN DEFINIDA
                                    /*(function (ct) {
                                        $.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + ct.location.lat + "," + ct.location.lng + "&key=AIzaSyCTCdp2zHmt3pJ3KDzy8VOE2HzIvU7pNaI", function (data) {
                                            data.results.forEach(function (result) {
                                                if (result.types[0] == "administrative_area_level_3") {
                                                    ref.child("cotxes/" + ct.$id + "/comarca").set(result.address_components[0].long_name);
                                                    ref.child("cotxes/" + ct.$id + "/provincia").set(result.address_components[1].long_name);
                                                }
                                            });
                                        });
                                    })(cotxe);*/
                                    $scope.places += Number(cotxe.passatgers) || 0;
                                    $scope.placeslliures += (Number(cotxe.lliures) || 0);
                                }, 200);
                            });
                            setTimeout(function () {
                                ref.child("dades/totals").set({
                                    cotxes: $scope.cotxes.length,
                                    places: $scope.places,
                                    placeslliures: $scope.placeslliures
                                }).then(function () {
                                    $state.go('ok');
                                });
                            }, 600);
                        });
                    }

                } else {
                    alert("No has verificat l'adreça de correu electrònic.");
                }
            }

        } else {
            $state.go("login", {
                mid: "afegir",
                fin: "cotxe"
            });
        }

        var map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 41.8688,
                lng: 1.9195
            },
            zoom: 6
        });

        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);

        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds());
        });

        var markers = [];

        searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            markers.forEach(function (marker) {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            var place = places[0];

            console.log(place);

            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                title: place.name,
                position: place.geometry.location
            }));

            //obtenim lat i lng
            var lat = place.geometry.location.lat();
            var lng = place.geometry.location.lng();

            //BUSQUEM COMARCA I PROVINCIA
            (function () {
                $.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=AIzaSyCTCdp2zHmt3pJ3KDzy8VOE2HzIvU7pNaI", function (data) {
                    data.results.forEach(function (result) {
                        if (result.types[0] == "administrative_area_level_3") {
                            $scope.comarca = (result.address_components[0].long_name || "");
                            $scope.provincia = (result.address_components[1].long_name || "");
                        }
                    });
                });
            })();

            $scope.location = {
                lat: lat,
                lng: lng
            };

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
            map.fitBounds(bounds);
        });



    });

});


app.controller("EditarCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
    var ref = firebase.database().ref();
    $(document).ready(function () {
        $('select').material_select();
        $('.datepicker').pickadate({
            selectMonths: true,
            selectYears: 1,
            today: '',
            clear: '',
            close: '',
            closeOnSelect: true,
            format: 'dd/mm/yyyy',
            firstDay: 1
        });
    });

    $scope.tanca = function () {
        firebase.auth().signOut();
    }

    $scope.cotxe = $firebaseObject(ref.child("cotxes/" + $stateParams.id));

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            $scope.uid = user.uid;
            $scope.cotxe.$loaded().then(function () {
                if (user.uid != $scope.cotxe.id && user.uid != "ucCScs6GWKXvTT7O6cirDt1K0QM2" && user.uid != "txA396QdGdXVK7rnT0L4PmPrMi12") {
                    $state.go("home");
                }

                $scope.eliminar = function (id) {
                    if (confirm("Segur que vols eliminar la publicació?")) {
                        if (user.uid == $scope.cotxe.id || user.uid != "ucCScs6GWKXvTT7O6cirDt1K0QM2" || user.uid != "txA396QdGdXVK7rnT0L4PmPrMi12") {
                            ref.child("cotxes/" + id).remove().then(function () {
                                $state.go("home");
                            });
                        } else {
                            alert("No tens permís per eliminar aquesta publicació");
                        }
                    } else {
                        alert("Ok, no l'eliminem.");
                    }
                }

                setTimeout(function () {
                    Materialize.updateTextFields();
                }, 500);

                var map = new google.maps.Map(document.getElementById('map'), {
                    center: {
                        lat: $scope.cotxe.location.lat,
                        lng: $scope.cotxe.location.lng
                    },
                    zoom: 13
                });

                var input = document.getElementById('pac-input');
                var searchBox = new google.maps.places.SearchBox(input);

                map.addListener('bounds_changed', function () {
                    searchBox.setBounds(map.getBounds());
                });

                var markers = [];


                searchBox.addListener('places_changed', function () {
                    var places = searchBox.getPlaces();

                    if (places.length == 0) {
                        return;
                    }

                    // Clear out the old markers.
                    markers.forEach(function (marker) {
                        marker.setMap(null);
                    });
                    markers = [];

                    // For each place, get the icon, name and location.
                    var bounds = new google.maps.LatLngBounds();
                    var place = places[0];
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }

                    // Create a marker for each place.
                    markers.push(new google.maps.Marker({
                        map: map,
                        title: place.name,
                        position: place.geometry.location
                    }));

                    var lat = place.geometry.location.lat();
                    var lng = place.geometry.location.lng();

                    //BUSQUEM COMARCA I PROVINCIA
                    (function () {
                        $.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=AIzaSyCTCdp2zHmt3pJ3KDzy8VOE2HzIvU7pNaI", function (data) {
                            data.results.forEach(function (result) {
                                if (result.types[0] == "administrative_area_level_3") {
                                    $scope.cotxe.comarca = (result.address_components[0].long_name);
                                    $scope.cotxe.provincia = (result.address_components[1].long_name);
                                }
                            });
                        });
                    })();

                    $scope.cotxe.location = {
                        lat: lat,
                        lng: lng
                    };

                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                    map.fitBounds(bounds);
                });


            });
        } else {
            $state.go("login", {
                mid: "editar",
                fin: $stateParams.id
            });
        }

        $scope.guarda = function () {
            if ($scope.uid != $scope.cotxe.id && (user.uid != "ucCScs6GWKXvTT7O6cirDt1K0QM2") && (user.uid != "txA396QdGdXVK7rnT0L4PmPrMi12")) {
                $state.go("home");
            } else {
                var id = $scope.cotxe.$id;
                var refnova = ref.child("cotxes/" + id);
                refnova.child("nom").set($scope.cotxe.nom);
                refnova.child("passatgers").set($scope.cotxe.passatgers);
                refnova.child("lliures").set($scope.cotxe.lliures);
                refnova.child("preu").set($scope.cotxe.preu);
                refnova.child("anada").set($scope.cotxe.anada);
                refnova.child("tornada").set($scope.cotxe.tornada);
                refnova.child("hanada").set($scope.cotxe.hanada);
                refnova.child("htornada").set($scope.cotxe.htornada);
                refnova.child("ubicacio").set($scope.cotxe.ubicacio);
                refnova.child("location").set($scope.cotxe.location);
                refnova.child("comarca").set($scope.cotxe.comarca);
                refnova.child("provincia").set($scope.cotxe.provincia);
                refnova.child("info").set($scope.cotxe.info);
                $state.go("ok");
            }
        }

    });

});


app.controller("LoginCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
    firebase.auth().onAuthStateChanged(function (user) {
        if ((user) && (user.emailVerified == false)) {
            user.sendEmailVerification().then(function () {
                setTimeout(function () {
                    $state.go("verificar", {
                        mid: $stateParams.mid,
                        fin: $stateParams.fin
                    });
                }, 400);
            });
        } else if ((user) && (user.emailVerified == true)) {
            if ($stateParams.mid == "afegir") {
                $state.go("afegir");
            } else if ($stateParams.mid == "editar-publicacions") {
                $state.go("editartot");
            } else {
                window.location = "http://cotxes.omplimbrusselles.eu/#/" + $stateParams.mid + "/" + $stateParams.fin;
            }

        }

        $scope.mid = $stateParams.mid;
        var uiConfig = {
            signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
            tosUrl: 'http://www.marcpujolgualdo.cat'
        };
        if ($stateParams.mid == "afegir") {
            uiConfig.signInSuccessUrl = 'http://cotxes.omplimbrusselles.eu/#/afegir';
        } else if ($stateParams.mid == "editar-publicacions") {
            uiConfig.signInSuccessUrl = 'http://cotxes.omplimbrusselles.eu/#/editar';
        } else {
            uiConfig.signInSuccessUrl = 'http://cotxes.omplimbrusselles.eu/#/' + $stateParams.mid + "/" + $stateParams.fin;
        }
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', uiConfig);
    });
});


app.controller("VerificarCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
    firebase.auth().onAuthStateChanged(function (user) {
        $scope.comprova = function () {
            window.location.reload();
        }
        if ((user) && (user.emailVerified)) {
            if ($stateParams.mid == "afegir") {
                $state.go("afegir");
            } else if ($stateParams.mid == "editar-publicacions") {
                $state.go("editartot");
            } else {
                window.location = "http://cotxes.omplimbrusselles.eu/#/" + $stateParams.mid + "/" + $stateParams.fin;
            }
        } else if ((user) && !(user.emailVerified)) {
            $scope.user = user;
        } else if (!user) {
            $state.go("login", {
                mid: $stateParams.mid,
                fin: $stateParams.fin
            });
        }
    });
});
app.controller("OkCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
    firebase.auth().onAuthStateChanged(function (user) {
        $scope.persona = $stateParams.persona;
    });
});

app.controller("EditarTotCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            $state.go("login", {
                mid: "editar-publicacions",
                fin: "cotxes"
            });
        } else {
            var ref = firebase.database().ref();
            $scope.cotxes = $firebaseArray(ref.child("cotxes"));
            $scope.user = user;
            $scope.eliminar = function (id) {
                if (confirm("Segur que vols eliminar la publicació?")) {
                    if ($scope.user.uid == user.uid || $scope.user.uid != "mmucCScs6GWKXvTT7O6cirDt1K0QM2" || $scope.user.uid != "mmtxA396QdGdXVK7rnT0L4PmPrMi12") {
                        ref.child("cotxes/" + id).remove();
                    } else {
                        alert("No tens permís per eliminar aquesta publicació");
                    }
                } else {
                    alert("Ok, no l'eliminem.");
                }
            }
        }
    });
});

app.controller("ContactarCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject, $http) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            $state.go("login", {
                mid: "contactar",
                fin: $stateParams.id
            });
        } else {
            $scope.user = user;
            if (user.emailVerified == false) {
                $state.go("verificar", {
                    mid: "contactar",
                    fin: $stateParams.id
                });
            }
            $scope.memail = user.email;
            $scope.carregant = false;
            var ref = firebase.database().ref();
            $scope.cotxe = $firebaseObject(ref.child("cotxes/" + $stateParams.id));
            $scope.missatge = function () {
                if (user.emailVerified == true) {
                    var email = user.email,
                        telefon = $scope.mtelefon,
                        missatge = $scope.msg;
                    if (!email || email == "" || email == null) {
                        alert("Has d'introduir un email vàlid.\nPensa que és on et respondrà el propietari/ària del cotxe");
                    } else if (!telefon || telefon == "") {
                        alert("Has de proporcionar un telèfon.\nAmb l'adreça de correu no n'hi ha prou. Sempre val més tenir més d'una via de contacte...");
                    } else if (!missatge) {
                        alert("Has d'escriure algun missatge!");
                    } else {

                        $scope.carregant = true;
                        $.get("https://us-central1-cotxesbrusselles.cloudfunctions.net/enviarMissatge?email=" + encodeURI(email) + "&telefon=" + encodeURI(telefon) + "&msg=" + encodeURI(missatge) + "&id=" + encodeURI($stateParams.id) + "&uid=" + encodeURI($scope.cotxe.id), function (data) {
                            console.log(data);
                            if (data == "Fet") {
                                $state.go("contactat", {
                                    persona: $scope.cotxe.nom
                                });
                            }
                        });
                    }
                } else {
                    alert("Primer has de verificar la teva adreça de correu electrònic");
                }
            };

            $scope.eliminar = function (id) {
                if (confirm("Segur que vols eliminar la publicació?")) {
                    if (user.uid == $scope.cotxe.id || user.uid != "ucCScs6GWKXvTT7O6cirDt1K0QM2" || user.uid != "txA396QdGdXVK7rnT0L4PmPrMi12") {
                        ref.child("cotxes/" + id).remove().then(function () {
                            $state.go("home");
                        });
                    } else {
                        alert("No tens permís per eliminar aquesta publicació");
                    }
                } else {
                    alert("Ok, no l'eliminem.");
                }
            }

            function initMap() {
                var pyrmont = {
                    lat: $scope.cotxe.location.lat,
                    lng: $scope.cotxe.location.lng
                };

                map = new google.maps.Map(document.getElementById('map'), {
                    center: pyrmont,
                    zoom: 14
                });

                infowindow = new google.maps.InfoWindow();

                var marker = new google.maps.Marker({
                    map: map,
                    position: {
                        lat: $scope.cotxe.location.lat,
                        lng: $scope.cotxe.location.lng
                    }
                });
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(place.ubicacio + " - " + place.passatgers + " persones");
                    infowindow.open(map, this);
                });
            }
            $scope.cotxe.$loaded().then(function () {
                initMap();
            });
        }
    });
});


app.controller("DadesCtrl", function ($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
    var ref = firebase.database().ref();
    $scope.cotxes = $firebaseArray(ref.child("cotxes"));
    $scope.num_cotxes = 0;
    $scope.num_motos = 0;
    $scope.num_caravanes = 0;
    $scope.places = 0;
    $scope.placeslliures = 0;
    $scope.cotxe_places = 0;
    $scope.cotxe_placeslliures = 0;
    $scope.moto_places = 0;
    $scope.moto_placeslliures = 0;
    $scope.caravana_places = 0;
    $scope.caravana_placeslliures = 0;

    $scope.lleida = 0;
    $scope.barcelona = 0;
    $scope.tarragona = 0;
    $scope.girona = 0;
    $scope.altres = [];
    $scope.cotxes.$loaded().then(function () {
        $scope.cotxes.forEach(function (cotxe) {
            setTimeout(function () {
                //ZONA COMENTADA, EN CAS DE SER NECESSARI S'EXECUTA UNA VEGADA I OMPLA ELS CAMPS COMARCA I PROVINCIA DELS QUE NO LA TENEN DEFINIDA
                /*(function (ct) {
                    $.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + ct.location.lat + "," + ct.location.lng + "&key=AIzaSyCTCdp2zHmt3pJ3KDzy8VOE2HzIvU7pNaI", function (data) {
                        data.results.forEach(function (result) {
                            if (result.types[0] == "administrative_area_level_3") {
                                ref.child("cotxes/" + ct.$id + "/comarca").set(result.address_components[0].long_name);
                                ref.child("cotxes/" + ct.$id + "/provincia").set(result.address_components[1].long_name);
                            }
                         }
                        });
                    });
                })(cotxe);*/
                $scope.places += Number(cotxe.passatgers) || 0;
                if (cotxe.provincia == "Barcelona") {
                    $scope.barcelona += 1;
                } else if (cotxe.provincia == "Lleida" || cotxe.provincia == "Lérida") {
                    $scope.lleida += 1;
                } else if (cotxe.provincia == "Girona" || cotxe.provincia == "Gerona" || cotxe.provincia == "Province of Girona") {
                    $scope.girona += 1;
                } else if (cotxe.provincia == "Tarragona") {
                    $scope.tarragona += 1;
                } else {
                    $scope.altres.push(cotxe.provincia || "sense definir");
                }

                if (cotxe.vehicle == "Cotxe") {
                    $scope.num_cotxes += 1;
                    $scope.cotxe_places += Number(cotxe.passatgers) || 0;
                } else if (cotxe.vehicle == "Moto") {
                    $scope.num_motos += 1;
                    $scope.moto_places += Number(cotxe.passatgers) || 0;
                } else if (cotxe.vehicle == "Caravana") {
                    $scope.num_caravanes += 1;
                    $scope.caravana_places += Number(cotxe.passatgers) || 0;
                }
                $scope.placeslliures += (Number(cotxe.lliures) || 0);
                if (cotxe.vehicle == "Cotxe") {
                    $scope.cotxe_placeslliures += Number(cotxe.lliures) || 0;
                } else if (cotxe.vehicle == "Moto") {
                    $scope.moto_placeslliures += Number(cotxe.lliures) || 0;
                } else if (cotxe.vehicle == "Caravana") {
                    $scope.caravana_placeslliures += Number(cotxe.lliures) || 0;
                }

                $scope.$apply();
            }, 200);
        });
        setTimeout(function () {
            ref.child("dades/totals").set({
                cotxes: $scope.cotxes.length,
                places: $scope.places,
                placeslliures: $scope.placeslliures
            });
        }, 1000);
    });
});

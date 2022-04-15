let svg = d3.select("svg");
svg.style("background-color", "green");

let rect = d3.select("rect")
    .style("fill", "red");

d3.select("body")
    .style("margin", "0");
//Variable
let life = 3;
let score = 0;
let xRed = -15;
let yRed =25;

function addScore(){
    score = score +10
    document.querySelector("#score").innerHTML= score 
}

// Systeme de vie
function suppVie() {
    if (life == 2) {
        svg.select("#life3").style("display", "none");
    }
    if (life == 1) {
        svg.select("#life2").style("display", "none");
    }
    if (life == 0) {
        svg.select("#life1").style("display", "none");
        if ( score > 100){
            setTimeout(() => {
                alert("Ton aventure s'achève ici, retourne à Bourg Palette... Mais t'as quand même un score de "+score +", bravo!");
                // Recommencer un partie
                window.location.reload()
    
            }, 10)
        }else{
            setTimeout(() => {
                alert("Ton aventure s'achève ici, retourne à Bourg Palette... T'as quand même un score de "+score +". Professeur Chen aurait honte de toi -_- !");
                
                window.location.reload()
    
            }, 10)
        }
       
    }
}
// Couche principale
let mainlayer = svg.append("g")

// Visibilité et position de Fred (Red) en fonction de la souris
function positionRed(e) {
    let pointer = d3.pointer(e);
    xRed = pointer[0];
    yRed = pointer[1];
    d3.select("#red")
        .attr("x", pointer[0] - 6)
        .attr("y", pointer[1] - 7);
}

// Entrée de la souris
rect.on("mouseenter", function (e) {
    positionRed(e);
    d3.select("#red")
        .style("display", null)
})

// Déplacement de la souris
rect.on("mousemove", function (e) {
    positionRed(e);
})

let compteur = 0;

// Fonction qui va nous générer un chiffre aléatoire entre 0 et n
function entierAlea(n) {
    return Math.floor(Math.random() * n);
}

let coordonnees = [];

// Création des pokeballs
function creationPokeball() {
    let update =
        svg
        .selectAll(".pokeball")
        .data(coordonnees, a => a.id)

    // Animation de la pokéball quand elle touche un ennemi
    update
        .exit()
        .remove();

    // pokéball par défaut
    update
        .enter()
        .append("use")
        .attr("href", "#def_pokeball")
        .attr("class", "pokeball")
        .transition()
        .duration(500)
    update_coords();
   
}

function update_coords() {
    svg
        .selectAll(".pokeball")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}

// Exécution de la fonction creationPokéball
creationPokeball();

// Les boules sont lancées à intervales réguliers
setInterval(function () {
    if (coordonnees.length == 0) return;
    coordonnees.forEach(function (d) {
        d.vitesse += 4;
        d.x += d.vitesse / 50
    });
    filtre = coordonnees.filter(d => d.x < 160);
    if (coordonnees.length == filtre.length)
        update_coords();
    else {
        coordonnees = filtre;
        creationPokeball();
    }
}, 50);


// Génération des boules aux coordonnées du personnage Red
setInterval(function () {
    compteur++;
    coordonnees.push({
        x: xRed,
        y: yRed,
        vitesse: 60,
        id: compteur
    });
    creationPokeball();
}, 600);
///////// Génération des ennemis /////////

// Création des Pikachu (ennemis)
function creationSuppressionPikachu() {
    let lien = svg.selectAll(".ennemi")
        .data(ennemi);
    lien.enter()
        .append("use")
        .attr("class", "ennemi")
        .attr("href", "#ennemi");
    lien.exit()
        .remove();
    placePikachu();
}

//Tableau ennemi vide
let ennemi = [];

//Remplissage du tableau par des pikachus
setInterval(function () {
    ennemi.push({
        x: 140,
        y: entierAlea(90),
        vx: -2,
        vy: 0
    })
    creationSuppressionPikachu();
}, 1000)

function placePikachu() {
    svg.selectAll(".ennemi")
        .attr("transform", d => `translate(${d.x},${d.y})`);
}
function suppPikachu(d) {
    return d.x > -10
}

function suppressionDansTableau(tableau, critere) {
    let suppression = false;
    for (let i = tableau.length - 1; i >= 0; i--) {
        if (critere(tableau[i])) {
            tableau.splice(i, 1);
            suppression = true;
        }
    }
    return suppression;
}

function distance(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);

}

function mouvementPikachu() {
    ennemi.forEach(d => {
        //chaque pikachu se déplace de sa vitesse en x et en y
        d.x += d.vx;
        d.y += d.vy;
        // si une coordonnée atteint le bord, pikachu disparait 
    })
    if (ennemi.every(suppPikachu)) {
        placePikachu();
    } else {
        ennemi = ennemi.filter(suppPikachu);
        life--
        suppVie()
        creationSuppressionPikachu()
    }
    // Mise à jour des coordonnées de Pikachu
    placePikachu();

    if (suppressionDansTableau(ennemi, pikachu =>
        suppressionDansTableau(coordonnees, coordonnee => distance(pikachu, coordonnee) < 10))) {
    // test de collision entre chaque pikachu et chaque pokeball 
    //au moins un pikachu et une pokeball ont été supprimés en plus d'ajouter 10 au score
    addScore()
    creationSuppressionPikachu();
    creationPokeball();

} else {
    //uniquement les coordonnées des pikachu ont été modifiées, on fait la mise à jour correspondante
    placePikachu();

    }
// test de collision entre chaque éclair et Red 
    if (suppressionDansTableau(coorEclair, eclair => distance(eclair, {x: xRed, y: yRed}) < 6)) {
    //un éclair et une vie a été supprimé
    life --
    suppVie();
    }
}




/////////////Création des éclairs des ennemis ////////
let coorEclair = [];

// Création des éclairs
function creationEclair() {
    let update =
        svg
        .selectAll(".eclair")
        .data(coorEclair, a => a.id)

    // Animation de l'éclair quand elle touche un ennemi
    update
        .exit()
        .remove();

    // éclair par défaut
    update
        .enter()
        .append("use")
        .attr("href", "#def_eclair")
        .attr("class", "eclair")
        .transition()
        .duration(500)
    update_coordEclair();
}

function update_coordEclair() {
    svg
        .selectAll(".eclair")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}

// Exécution de la fonction creationEclair
creationEclair();

// Les éclairs sont lancées à intervales réguliers
setInterval(function () {
    if (coorEclair.length == 0) return;
    coorEclair.forEach(function (d) {
        // d.vitesse -= 4;
        // d.x += d.vitesse / 50
        d.x-= 2 
    });
    filtre = coorEclair.filter(d => d.x < 160);
    if (coorEclair.length == filtre.length)
        update_coordEclair();
    else {
        coorEclair = filtre;
        creationEclair();
    }
}, 50);


// Génération des éclairs aux coordonnées du 2eme pikachu de chaque intervalle
setInterval(function () {
    compteur++;
    coorEclair.push({
        x: ennemi[1].x -10,
        y: ennemi[1].y +3,
        vitesse: 60,
        id: compteur
    });
    creationEclair();
}, 1200);


setInterval(ennemi, 100);
creationSuppressionPikachu();
setInterval(mouvementPikachu, 100);

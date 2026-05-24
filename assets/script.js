let works = [];
const token = localStorage.getItem("token");
const api = "http://localhost:5678/api"

async function getWorks(){
    const response = await fetch(`${api}/works`);

    if (!response.ok) {
        throw new Error("Erreur lors du chargement des travaux");
    }
    // Permets de convertir l'objet de la base de donnée en tableau Js utilisable et stocker dans works
    works = await response.json();

    // appelle la fonction d'affichage et affichage le tableau converti juste avant ^
    displayAppartements(works)
}

getWorks();

// Fonction pour gérer l'affichage des projets
function displayAppartements(projects){
    document.querySelector(".gallery").innerHTML = "";
    // Boucle pour afficher les projets selon le nombre de projet dispo dans le tableau
    for (let i = 0; i < projects.length; i++) {
        // Récupération d'un élément précis du tableau à chaque tour de boucle.
        const projet = projects[i];

        // Récupération de l'élément du DOM qui accueillera les figure v
        const sectionGallery = document.querySelector(".gallery");
        // Création d'une balise ( ici figure ) dédiée a chaqueprojet 
        const projectsElement = document.createElement("figure");
        projectsElement.dataset.id = projects[i].id
        // Création des balises Img
        const imageElement = document.createElement("img");
        imageElement.src = projet.imageUrl;
        // Ajout d'une balise alt pour l'accessibilité web
        imageElement.alt = projet.title
        // Création des balises Titres / figure caption :
        const nomElement = document.createElement("figcaption");
        nomElement.innerText = projet.title

        sectionGallery.appendChild(projectsElement);
        projectsElement.appendChild(imageElement);
        projectsElement.appendChild(nomElement)
    }
}

// Ajout dynamique des boutons de tri ensuite ajout de leur fonctions
const filtresDiv = document.querySelector(".filtres")
const boutonTous = document.createElement("button");
// Ajout du bouton Tous non dynamique car pas présent dans la bdd
boutonTous.innerText = "Tous";
boutonTous.classList.add("btn-all", "buttonactif")
boutonTous.addEventListener("click", () => {
    document.querySelectorAll(".filtres button").forEach(btn => btn.classList.remove("active"))
    boutonTous.classList.add("active");
    displayAppartements(works);
})
filtresDiv.appendChild(boutonTous)
// Ajout des autres bouton en les prenant dynamiquement depuis l'api
fetch(`${api}/categories`)
    .then(res => res.json())
    .then(data => {
        data.forEach(categorie => {
            const buttonCategorie = document.createElement("button")
            buttonCategorie.classList.add("buttonactif")
            buttonCategorie.innerText = categorie.name
            filtresDiv.appendChild(buttonCategorie)

            buttonCategorie.addEventListener("click", () => {
                const filtered = works.filter(work => work.categoryId === categorie.id);
                // Enlever le actif de tous les boutons 
                document.querySelectorAll(".filtres button").forEach(btn => btn.classList.remove("active"))
                // Ajouter active sur le bouton cliqué
                buttonCategorie.classList.add("active");
                displayAppartements(filtered)
            })

            const option = document.createElement("option");
            option.value = categorie.id;
            option.innerText = categorie.name;
            document.getElementById("categorie").appendChild(option)
        })
    })

// Changement de style sur les boutons lorsqu'ils sont actif !
const buttons = document.querySelectorAll(".buttonactif")

buttons.forEach(button => {
    button.addEventListener("click", () => {
        // Retirer la classe active de tous les boutons
        buttons.forEach(btn => btn.classList.remove("active"));

        // Ajouter la classe active sur celui qui est actif
        button.classList.add("active")
    })
})

// Création de la page de connexion ainsi que ses fonctionnalités :
// Si token = true ( bon / actif )
if (token) {
    document.getElementById("bandeau-edition").style.display = "block";
    document.getElementById("btn-modifier").style.display = "inline";

    const btnLogin = document.querySelector(".btn-login a");
    btnLogin.textContent = "logout";
    btnLogin.addEventListener("click", (e) => {
        e.preventDefault();
        // Enlever le token du localstorage quand on clique sur logout ( déconnexion )
        localStorage.removeItem("token");
        window.location.reload();
    })
}

const btnModifier = document.getElementById("btn-modifier");
// Appartion du bouton Modifier une fois connecté : 
btnModifier.addEventListener("click", () => {
    modale.style.display = "flex"
    displayGalerieModale();
})

// Ajout de la modale pour afficher la galerie et possibilité d'ajout de projets
const modale = document.getElementById("modale");
const modaleGalerie = document.getElementById("modale-galerie");
const modaleAjout = document.getElementById("modale-ajout");
const galerieModale = document.getElementById("galerie-modale")
const btnAjouterPhoto = document.getElementById("btn-ajouter-photo")
const modaleClose = document.getElementById("modale-close");

// Fonction pour afficher les projets comme sur la page principale cette fois dans l'overlay sans les title etc
function displayGalerieModale() {
    galerieModale.innerHTML = "";
    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.dataset.id = work.id;

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        // pour chaque img affiché , un bouton poubelle s'affiche avec un style prédéfini sur style.css
        const btnDelete = document.createElement("button");
        btnDelete.classList.add("btn-delete");
        btnDelete.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

        // Supression de l'image directement dans l'api graçe a la méthode DELETE bien sur en asynchrone
        btnDelete.addEventListener("click", async () => {
            await fetch(`${api}/works/${work.id}` , {
                method: "DELETE",
                headers: {
                    // Permet de savoir si on a le droit grâce au token ( Bearer = porteur/se) de token
                    "Authorization": `Bearer ${token}`
                }
            });
            // fonction native js qui permet de retirer l'élément choisi du DOM
            figure.remove();
            // Remets a jour le tableau : works
            works = works.filter(w => w.id !== work.id);
            // Rafraîchis la galerie principale
            displayAppartements(works);
        })

        figure.appendChild(img);
        figure.appendChild(btnDelete);
        galerieModale.appendChild(figure);
    });
}

// Passage a la modale d'ajout d'images
btnAjouterPhoto.addEventListener("click", () => {
    modaleGalerie.style.display = "none";
    modaleAjout.style.display = "block";
    modaleBack.style.display = "block";
})
// Bouton croix pour quitter l'overlay
modaleClose.addEventListener("click", () => {
    modale.style.display = "none"
    formAjout.reset();
    uploadZone.innerHTML = uploadZoneOriginal;
    photoInput = document.getElementById("photo-input");
    initPhotoInput()
})

// affichage de la modale a l'écran en mode admin pour ajouter des projets
const formAjout = document.getElementById("form-ajout");
const titreAjout = document.getElementById("titre");
const modaleBack = document.getElementById("modale-back");
const uploadZone = document.querySelector(".upload-zone")
let photoInput = document.getElementById("photo-input");
const categorieChoix = document.getElementById("categorie")
const btnValider = document.getElementById("btn-valider");

const uploadZoneOriginal = uploadZone.innerHTML;
// Ajout d'un bouton retour pour revenir a la gallerie dans l'overlay
modaleBack.addEventListener("click", () => {
    modaleGalerie.style.display = "block";
    modaleAjout.style.display = "none";
    modaleBack.style.display = "none";
    formAjout.reset();
    uploadZone.innerHTML = uploadZoneOriginal;
    photoInput = document.getElementById("photo-input");
    initPhotoInput()
    displayGalerieModale();
})

// Affichage de la photo dans la zone de l'upload et écoute les changements 
function initPhotoInput() {
    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0]; // Permet de stocker le fichier dans = file et le selectionner
        const reader = new FileReader() // Objet natif de JS qui permet de lire les fichiers depuis le nav

        //  fonction qui s'exécute auto quand la lecture du fichier est terminée
        reader.onload = () => {
            const img = document.createElement("img");
            img.src = reader.result;
            uploadZone.innerHTML = ""; // vide la zone d'upload
            uploadZone.appendChild(img); // Ajoute l'img a la zone d'upload
        }
        reader.readAsDataURL(file); // Lance la lecture
    })
}
initPhotoInput()

// Vérifie si l'utilisateur clique dans la modale affiché ou ailleurs
modale.addEventListener("click", (e) => {
    if ( e.target === modale) {
        modale.style.display = "none";
        formAjout.reset();
        uploadZone.innerHTML = uploadZoneOriginal;
        photoInput = document.getElementById("photo-input")
        initPhotoInput();
    }
})

// Vérifie si tout les champs sont bien remplis pour rendre le bouton #1D6154 et fonctionnel
function checkFormFull() {
    if (photoInput.files.length > 0 && titreAjout.value !== "" && categorieChoix.value !== "" ) {
        // Changement de couleur du bouton une fois les champs plein
        btnValider.style.backgroundColor = "#1D6154";
        btnValider.disabled = false
    } else {
        btnValider.style.backgroundColor = "#A7A7A7"
        btnValider.disabled = true
    }
}

photoInput.addEventListener("change", checkFormFull);
titreAjout.addEventListener("input", checkFormFull);
categorieChoix.addEventListener("change", checkFormFull);

formAjout.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(btnValider.disabled) return;
    if (titreAjout.value === "") {
        alert("Il manque le titre avant d'ajouter");
        return
    }

    // Envoi des data a l'API de cette maniére car un fichier est inclus dans la donnée 
    const formData = new FormData();
    // Ajout de l'attribut de la data et leur ajoute la valeur
    formData.append("image", photoInput.files[0]);
    formData.append("title", titreAjout.value);
    formData.append("category", categorieChoix.value);
    const response = await fetch(`${api}/works`, {
        method: "POST",
        headers: {
            // Vérifie encore si on l'autorisation grâce au porteur de token
            "Authorization": `Bearer ${token}`
        },
        body: formData
    })

    const NewWork = await response.json();
    // Fonction native Js qui permets d'ajouter directement un élément ( push )
    works.push(NewWork);
    displayAppartements(works)

    // Reset du formulaire comme voulu aprés chaque submit complet
    formAjout.reset();
    uploadZone.innerHTML = uploadZoneOriginal;
    initPhotoInput()
    // Remise par défaut de la couleur du bouton
    btnValider.style.backgroundColor = "#A7A7A7";

})
let works = [];
const token = localStorage.getItem("token");
const api = "http://localhost:5678/api"

async function getWorks(){
    const response = await fetch(`${api}/works`);

    if (!response.ok) {
        throw new Error("Erreur lors du chargement des travaux");
    }
    works = await response.json();

    displayAppartements(works)
}

getWorks();

function displayAppartements(appartements){
    document.querySelector(".gallery").innerHTML = "";
    for (let i = 0; i < appartements.length; i++) {
        // Récupération d'un élément précis du tableau à chaque tour de boucle.
        const article = appartements[i];

        // Récupération de l'élément du DOM qui accueillera les articles
        const sectionGallery = document.querySelector(".gallery");
        // Création d'une balise (ici figure ) dédiée a un appartement 
        const appartElement = document.createElement("figure");
        appartElement.dataset.id = appartements[i].id
        // Création des balises Img
        const imageElement = document.createElement("img");
        imageElement.src = article.imageUrl;
        imageElement.alt = article.title
        // Création des balises Titres :
        const nomElement = document.createElement("figcaption");
        nomElement.innerText = article.title

        sectionGallery.appendChild(appartElement);
        appartElement.appendChild(imageElement);
        appartElement.appendChild(nomElement)

    }
}

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

// Ajout dynamique des boutons de tri ensuite ajout de leur fonctions

const filtresDiv = document.querySelector(".filtres")
const boutonTous = document.createElement("button");
boutonTous.innerText = "Tous";
boutonTous.classList.add("btn-all", "buttonactif")
boutonTous.addEventListener("click", () => {
    document.querySelectorAll(".filtres button").forEach(btn => btn.classList.remove("active"))
    boutonTous.classList.add("active");
    displayAppartements(works);
})
filtresDiv.appendChild(boutonTous)
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

// Création de la page de connexion ainsi que ses fonctionnalités :

if (token) {
    document.getElementById("bandeau-edition").style.display = "block";
    document.getElementById("btn-modifier").style.display = "inline";

    const btnLogin = document.querySelector(".btn-login a");
    btnLogin.textContent = "logout";
    btnLogin.addEventListener("click", (e) => {
        e.preventDefault();
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

function displayGalerieModale() {
    galerieModale.innerHTML = "";
    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.dataset.id = work.id;

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const btnDelete = document.createElement("button");
        btnDelete.classList.add("btn-delete");
        btnDelete.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

        btnDelete.addEventListener("click", async () => {
            await fetch(`${api}/works/${work.id}` , {
                method: "DELETE",
                headers: {
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

btnAjouterPhoto.addEventListener("click", () => {
    modaleGalerie.style.display = "none";
    modaleAjout.style.display = "block";
    modaleBack.style.display = "block";
})

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

// Affichage de la photo dans la zone de l'upload 
function initPhotoInput() {
    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0]; // Permet de stocker le fichier dans = file et le selectionner
        const reader = new FileReader() // Objet natif de JS qui permet de lire les fichiers depuis le nav

        //  fonction qui s'exécute quand la lecture est terminée
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

modale.addEventListener("click", (e) => {
    if ( e.target === modale) {
        modale.style.display = "none";
        formAjout.reset();
        uploadZone.innerHTML = uploadZoneOriginal;
        photoInput = document.getElementById("photo-input")
        initPhotoInput();
    }
})

// Vérifie si tout les champs sont bien remplis

function checkFormFull() {
    if (photoInput.files.length > 0 && titreAjout.value !== "" && categorieChoix.value !== "" ) {
        // Changement de couleur du bouton une fois les champs plein
        btnValider.style.backgroundColor = "#1D6154";
    } else {
        btnValider.style.backgroundColor = "#A7A7A7"
    }
}

photoInput.addEventListener("change", checkFormFull);
titreAjout.addEventListener("input", checkFormFull);
categorieChoix.addEventListener("change", checkFormFull);

formAjout.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (titreAjout.value === "") {
        alert("Il manque le titre avant d'ajouter");
        return
    }

    // Envoi des data a l'API
    const formData = new FormData();

    formData.append("image", photoInput.files[0]);
    formData.append("title", titreAjout.value);
    formData.append("category", categorieChoix.value);
    const response = await fetch(`${api}/works`, {
        method: "POST",
        headers: {
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
// On récupére le formulaire pour Log-in 

const btnSubmit = document.getElementById("btn-submit");

btnSubmit.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log("Submitted");
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        

        if (response.ok) {
            const data = await response.json();
            // On prensd le token on le nomme tel que "token" et on le mets dans le local storage
            localStorage.setItem("token", data.token);
            // Affiche "Token reçu + token" si bien recu :
            console.log("token reçu :", data.token);
            // Raméne a la page index.html avec les modifs admin dispo
            window.location.href = "index.html";
        } else {
            // Affiche erreur si combi Mdp + email fausse
            alert("Erreur dans l’identifiant ou le mot de passe")
        }
    } catch (error) {
        console.error("Erreur : ", error);
        
    }
})
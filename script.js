
/* =====================================================
   ANTHELME-MARKET
   SCRIPT.JS
===================================================== */

/* =====================================================
   1. VARIABLES
===================================================== */

let panier = JSON.parse(
    localStorage.getItem("panier-client")
) || [];

let commandeEnCours = null;


/* =====================================================
   2. UTILITAIRES
===================================================== */

function sauvegarderPanier() {

    localStorage.setItem(
        "panier-client",
        JSON.stringify(panier)
    );

}


function formaterPrix(prix) {

    return Number(prix).toLocaleString("fr-FR") + " FCFA";

}


/* =====================================================
   3. TROUVER UN ARTICLE VENDEUR
===================================================== */

function trouverArticleVendeur(idProduit) {

    const articles =
        JSON.parse(
            localStorage.getItem("articles-vendeur")
        ) || [];

    return articles.find(function(article) {

        return String(article.id) === String(idProduit);

    });

}


function trouverVendeurProduit(idProduit) {

    const article =
        trouverArticleVendeur(idProduit);

    if (article) {

        return article.vendeurId;

    }

    return null;

}


/* =====================================================
   4. AFFICHER LE NOMBRE DU PANIER
===================================================== */

function actualiserNombrePanier() {

    const compteur =
        document.getElementById("nombre-panier");

    if (!compteur) return;

    const total =
        panier.reduce(function(somme, produit) {

            return somme + Number(produit.quantite || 0);

        }, 0);

    compteur.textContent = total;

}


/* =====================================================
   5. AJOUTER AU PANIER
===================================================== */

function ajouterAuPanier(
    nom,
    prix,
    stock,
    idProduit
) {

    /*
       PRODUIT FIXE
    */

    if (idProduit === undefined) {

        const produitExistant =
            panier.find(function(produit) {

                return (
                    produit.nom === nom &&
                    produit.id === undefined
                );

            });


        if (produitExistant) {

            produitExistant.quantite++;

        } else {

            panier.push({

                nom: nom,

                prix: Number(prix),

                quantite: 1

            });

        }

        sauvegarderPanier();

        actualiserNombrePanier();

        afficherPanier();

        return;

    }


    /*
       PRODUIT VENDEUR
    */

    const article =
        trouverArticleVendeur(idProduit);


    if (!article) {

        alert("❌ Cet article n'existe plus.");

        return;

    }


    const stockDisponible =
        Number(article.stock);


    if (stockDisponible <= 0) {

        alert("❌ Cet article est en rupture de stock.");

        return;

    }


    const produitExistant =
        panier.find(function(produit) {

            return String(produit.id) === String(idProduit);

        });


    if (produitExistant) {

        if (
            Number(produitExistant.quantite)
            >= stockDisponible
        ) {

            alert("❌ Stock insuffisant.");

            return;

        }

        produitExistant.quantite++;

    } else {

        panier.push({

            id: article.id,

            nom: article.nom,

            prix: Number(article.prix),

            quantite: 1,

            vendeurId: article.vendeurId

        });

    }


    sauvegarderPanier();

    actualiserNombrePanier();

    afficherPanier();

}


/* =====================================================
   6. VÉRIFIER LE STOCK DU PANIER
===================================================== */

function verifierStockPanier() {

    panier = panier.filter(function(produit) {

        /*
           Produit fixe
        */

        if (produit.id === undefined) {

            return true;

        }


        /*
           Produit vendeur
        */

        const article =
            trouverArticleVendeur(produit.id);


        if (!article) {

            return false;

        }


        if (Number(article.stock) <= 0) {

            return false;

        }


        if (
            Number(produit.quantite)
            > Number(article.stock)
        ) {

            produit.quantite =
                Number(article.stock);

        }


        return true;

    });


    sauvegarderPanier();

}


/* =====================================================
   7. AFFICHER LE PANIER
===================================================== */

function afficherPanier() {

    const contenu =
        document.getElementById("contenu-panier");

    if (!contenu) return;


    if (panier.length === 0) {

        contenu.innerHTML = `
            <div
                style="
                    background:white;
                    padding:25px;
                    border-radius:12px;
                    margin-bottom:20px;
                "
            >
                <strong>🛒 Votre panier est vide.</strong>
            </div>
        `;

        return;

    }


    let total = 0;


    let html = `
        <div
            style="
                background:white;
                padding:25px;
                border-radius:15px;
                box-shadow:0 4px 15px rgba(0,0,0,.08);
            "
        >

            <h2 style="margin-bottom:20px;">
                🛒 Mon panier
            </h2>
    `;


    panier.forEach(function(produit) {

        const sousTotal =
            Number(produit.prix)
            * Number(produit.quantite);

        total += sousTotal;


        html += `

            <div
                class="article-panier"
                style="
                    padding:15px 0;
                    border-bottom:1px solid #ddd;
                "
            >

                <strong>
                    ${produit.nom}
                </strong>

                <p>
                    ${formaterPrix(produit.prix)}
                </p>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        margin-top:10px;
                    "
                >

                    <button
                        type="button"
                        onclick="diminuerQuantite('${produit.id ?? produit.nom}')"
                        style="
                            width:35px;
                            padding:7px;
                        "
                    >
                        −
                    </button>

                    <strong>
                        ${produit.quantite}
                    </strong>

                    <button
                        type="button"
                        onclick="augmenterQuantite('${produit.id ?? produit.nom}')"
                        style="
                            width:35px;
                            padding:7px;
                        "
                    >
                        +
                    </button>

                    <button
                        type="button"
                        onclick="supprimerDuPanier('${produit.id ?? produit.nom}')"
                        style="
                            padding:7px 12px;
                            background:#111;
                            color:white;
                            border:none;
                            border-radius:6px;
                            cursor:pointer;
                        "
                    >
                        Supprimer
                    </button>

                </div>

                <p style="margin-top:10px;">
                    Sous-total :
                    <strong>
                        ${formaterPrix(sousTotal)}
                    </strong>
                </p>

            </div>

        `;

    });


    html += `

            <h3 style="margin-top:20px;">
                Total :
                ${formaterPrix(total)}
            </h3>

            <button
                type="button"
                onclick="ouvrirCommande()"
                style="
                    width:100%;
                    margin-top:20px;
                    padding:14px;
                    border:none;
                    border-radius:8px;
                    background:#d4af37;
                    color:#111;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                Passer la commande
            </button>

        </div>
    `;


    contenu.innerHTML = html;

}


/* =====================================================
   8. AUGMENTER QUANTITÉ
===================================================== */

function augmenterQuantite(idProduit) {

    const produit =
        panier.find(function(item) {

            return String(
                item.id !== undefined
                    ? item.id
                    : item.nom
            ) === String(idProduit);

        });


    if (!produit) return;


    /*
       Produit vendeur
    */

    if (produit.id !== undefined) {

        const article =
            trouverArticleVendeur(produit.id);


        if (!article) {

            alert("❌ Article introuvable.");

            return;

        }


        if (
            Number(produit.quantite)
            >= Number(article.stock)
        ) {

            alert("❌ Stock insuffisant.");

            return;

        }

    }


    produit.quantite++;


    sauvegarderPanier();

    actualiserNombrePanier();

    afficherPanier();

}


/* =====================================================
   9. DIMINUER QUANTITÉ
===================================================== */

function diminuerQuantite(idProduit) {

    const index =
        panier.findIndex(function(item) {

            return String(
                item.id !== undefined
                    ? item.id
                    : item.nom
            ) === String(idProduit);

        });


    if (index === -1) return;


    if (panier[index].quantite > 1) {

        panier[index].quantite--;

    } else {

        panier.splice(index, 1);

    }


    sauvegarderPanier();

    actualiserNombrePanier();

    afficherPanier();

}


/* =====================================================
   10. SUPPRIMER DU PANIER
===================================================== */

function supprimerDuPanier(idProduit) {

    panier =
        panier.filter(function(item) {

            return String(
                item.id !== undefined
                    ? item.id
                    : item.nom
            ) !== String(idProduit);

        });


    sauvegarderPanier();

    actualiserNombrePanier();

    afficherPanier();

}


/* =====================================================
   11. OUVRIR / FERMER PANIER
===================================================== */

function afficherMasquerPanier() {

    const contenu =
        document.getElementById("contenu-panier");

    if (!contenu) return;


    if (
        contenu.innerHTML.trim() === ""
        || contenu.style.display === "none"
    ) {

        verifierStockPanier();

        contenu.style.display = "block";

        afficherPanier();

    } else {

        contenu.style.display = "none";

    }

}


/* =====================================================
   12. RECHERCHE
===================================================== */

function rechercherProduits() {

    const recherche =
        document
        .getElementById("recherche-produit")
        ?.value
        .toLowerCase()
        .trim();


    const produits =
        document.querySelectorAll(".produit");


    produits.forEach(function(produit) {

        const texte =
            produit.textContent.toLowerCase();


        if (
            recherche === ""
            || texte.includes(recherche)
        ) {

            produit.style.display = "";

        } else {

            produit.style.display = "none";

        }

    });


    const produitsVendeurs =
        document.getElementById(
            "produits-vendeurs"
        );


    if (produitsVendeurs) {

        const cartes =
            produitsVendeurs.querySelectorAll(
                ".produit, .carte-produit"
            );


        cartes.forEach(function(produit) {

            const texte =
                produit.textContent.toLowerCase();


            if (
                recherche === ""
                || texte.includes(recherche)
            ) {

                produit.style.display = "";

            } else {

                produit.style.display = "none";

            }

        });

    }

}


/* =====================================================
   13. FILTRER CATÉGORIE
===================================================== */

function filtrerCategorie(categorie) {

    const produits =
        document.querySelectorAll(
            ".produit"
        );


    produits.forEach(function(produit) {

        const cat =
            produit.dataset.categorie;


        if (cat === categorie) {

            produit.style.display = "";

        } else {

            produit.style.display = "none";

        }

    });


    const produitsVendeurs =
        document.getElementById(
            "produits-vendeurs"
        );


    if (produitsVendeurs) {

        const cartes =
            produitsVendeurs.querySelectorAll(
                ".produit, .carte-produit"
            );


        cartes.forEach(function(carte) {

            if (
                carte.dataset.categorie
                === categorie
            ) {

                carte.style.display = "";

            } else {

                carte.style.display = "none";

            }

        });

    }

}


/* =====================================================
   14. AFFICHER TOUS LES PRODUITS
===================================================== */

function afficherTousLesProduits() {

    const produits =
        document.querySelectorAll(
            ".produit"
        );


    produits.forEach(function(produit) {

        produit.style.display = "";

    });


    const produitsVendeurs =
        document.getElementById(
            "produits-vendeurs"
        );


    if (produitsVendeurs) {

        const cartes =
            produitsVendeurs.querySelectorAll(
                ".produit, .carte-produit"
            );


        cartes.forEach(function(carte) {

            carte.style.display = "";

        });

    }


    const recherche =
        document.getElementById(
            "recherche-produit"
        );


    if (recherche) {

        recherche.value = "";

    }

}


/* =====================================================
   15. INSCRIPTION / COMPTE
===================================================== */

function afficherNomClient() {

    const bouton =
        document.getElementById(
            "bouton-compte"
        );

    if (!bouton) return;


    const utilisateur =
        JSON.parse(
            localStorage.getItem("utilisateur")
        );


    if (utilisateur) {

        bouton.textContent =
            "👤 " + utilisateur.nom;

    } else {

        bouton.textContent =
            "👤 S'inscrire";

    }

}


/* =====================================================
   16. MENU COMPTE
===================================================== */

function afficherMenuCompte() {

    const menu =
        document.getElementById(
            "menu-compte"
        );

    if (!menu) return;


    if (menu.style.display === "block") {

        menu.style.display = "none";

    } else {

        menu.style.display = "block";

    }

}


/* =====================================================
   17. MES INFORMATIONS
===================================================== */

function afficherInformationsClient() {

    const utilisateur =
        JSON.parse(
            localStorage.getItem("utilisateur")
        );


    if (!utilisateur) {

        alert(
            "❌ Vous devez d'abord vous inscrire."
        );

        return;

    }


    const fenetre =
        document.getElementById(
            "fenetre-informations"
        );


    const details =
        document.getElementById(
            "details-informations"
        );


    if (!fenetre || !details) return;


    details.innerHTML = `

        <div class="information-client">
            <p>
               <strong>Prénom :</strong>
               ${utilisateur.prenom || ""}
            </p>

            <p>
                <strong>Nom :</strong>
                ${utilisateur.nom || ""}
            </p>

            <p>
                <strong>Email :</strong>
                ${utilisateur.email || ""}
            </p>

            <p>
                <strong>Téléphone :</strong>
                ${utilisateur.telephone || ""}
            </p>
            
            <p>
                  <strong>Commune :</strong>
                  ${utilisateur.commune || ""}
            </p>
            
            <p>
                 <strong>Adresse de livraison :</strong>
                 ${utilisateur.adresse || ""}
            </p>


            <p>
                   <strong>Téléphone :</strong>
                     ${commande.telephone || ""}
            </p>

        </div>

    `;


    fenetre.style.display = "flex";


    const menu =
        document.getElementById(
            "menu-compte"
        );


    if (menu) {

        menu.style.display = "none";

    }

}


/* =====================================================
   18. MES COMMANDES
===================================================== */

function afficherMesCommandes() {

    const fenetre =
        document.getElementById(
            "fenetre-commandes"
        );


    const liste =
        document.getElementById(
            "liste-commandes"
        );


    if (!fenetre || !liste) return;


    const commandes =
        JSON.parse(
            localStorage.getItem("commandes")
        ) || [];


    if (commandes.length === 0) {

        liste.innerHTML = `
            <p>
                Vous n'avez encore aucune commande.
            </p>
        `;

    } else {

        liste.innerHTML =
            commandes
            .slice()
            .reverse()
            .map(function(commande) {

                return `

                    <div class="commande-client">

                        <p>
                            <strong>Commande :</strong>
                            ${commande.id}
                        </p>

                        <p>
                            <strong>Date :</strong>
                            ${commande.date}
                        </p>

                        <p>
                            <strong>Total :</strong>
                            ${formaterPrix(commande.total)}
                        </p>

                        <p>
                             <strong>Commune :</strong>
                              ${commande.commune || ""}
                         </p>

                         <p>
                               <strong>Adresse de livraison :</strong>
                                ${commande.adresse || ""}
                        </p>



                         <p>
                           <strong>Statut :</strong>

                           <span class="badge-statut
                                ${
                                 commande.statut === "Livrée"
                                      ? "badge-livree"
                                      : commande.statut === "Expédiée"
                                           ? "badge-expediee"
                                           : commande.statut === "En préparation"
                                               ? "badge-preparation"
                                               : commande.statut === "Annulée"
                                                    ? "badge-annulee"
                                                    : "badge-attente"
                                 }
                            ">
                                ${commande.statut}
                      </span>
                </p>

                {
                            commande.statut === "En attente"
                                ? `
                                     <button
                                         type="button"
                                         class="bouton-annuler-commande"
                                         onclick="annulerCommande('${commande.id}')"
                                   >
                                         ✕ Annuler la commande
                                      </button>
                                 `
                                 : ""
                 }
                        <p>
                            <strong>Produits :</strong>
                        </p>

                        <ul>
                            ${
                                (commande.produits || [])
                                .map(function(produit) {

                                    return `
                                        <li>
                                            ${produit.nom}
                                            × ${produit.quantite}
                                            —
                                            ${formaterPrix(
                                                Number(produit.prix)
                                                * Number(produit.quantite)
                                            )}
                                        </li>
                                    `;

                                })
                                .join("")
                            }
                        </ul>

                    </div>

                `;

            })
            .join("");

    }


    fenetre.style.display = "flex";


    const menu =
        document.getElementById(
            "menu-compte"
        );


    if (menu) {

        menu.style.display = "none";

    }

}

function annulerCommande(idCommande) {

    const confirmation =
        confirm(
            "⚠️ Voulez-vous vraiment annuler cette commande ?"
        );

    if (!confirmation) return;


    let commandes =
        JSON.parse(
            localStorage.getItem("commandes")
        ) || [];


    const index =
        commandes.findIndex(
            function(commande) {
                return commande.id === idCommande;
            }
        );


    if (index === -1) {
        alert("❌ Commande introuvable.");
        return;
    }


    if (commandes[index].statut !== "En attente") {
        alert(
            "❌ Cette commande ne peut plus être annulée."
        );
        return;
    }


    commandes[index].statut = "Annulée";


    localStorage.setItem(
        "commandes",
        JSON.stringify(commandes)
    );


    alert("✅ Votre commande a été annulée.");


    afficherMesCommandes();
}


function fermerMesCommandes() {

    const fenetre =
        document.getElementById(
            "fenetre-commandes"
        );


    if (fenetre) {

        fenetre.style.display = "none";

    }

}


/* =====================================================
   19. DÉCONNEXION
===================================================== */

function deconnecterClient() {

    localStorage.removeItem(
        "utilisateur"
    );


    afficherNomClient();


    const menu =
        document.getElementById(
            "menu-compte"
        );


    if (menu) {

        menu.style.display = "none";

    }


    alert("✅ Vous êtes déconnecté.");

}


/* =====================================================
   20. OUVRIR LA FENÊTRE COMMANDE
===================================================== */

function ouvrirCommande() {

    if (panier.length === 0) {

        alert("🛒 Votre panier est vide.");

        return;

    }


    verifierStockPanier();


    if (panier.length === 0) {

        alert(
            "❌ Les produits du panier ne sont plus disponibles."
        );

        return;

    }


    const fenetre =
        document.getElementById(
            "fenetre-commande"
        );


    const details =
        document.getElementById(
            "details-commande"
        );


    const totalElement =
        document.getElementById(
            "total-commande"
        );


    if (!fenetre || !details || !totalElement) {

        return;

    }


    let total = 0;


    details.innerHTML =
        panier
        .map(function(produit) {

            const sousTotal =
                Number(produit.prix)
                * Number(produit.quantite);

            total += sousTotal;


            return `
                <p>
                    ${produit.nom}
                    × ${produit.quantite}
                    —
                    ${formaterPrix(sousTotal)}
                </p>
            `;

        })
        .join("");


    totalElement.textContent =
        "Total : " + formaterPrix(total);


    fenetre.style.display = "flex";

}


/* =====================================================
   21. CRÉER LA COMMANDE
===================================================== */

function creerCommande() {

    if (panier.length === 0) {

        alert("❌ Le panier est vide.");

        return;

    }


    const nom =
        document.getElementById(
            "nom-commande"
        )?.value.trim();


    const telephone =
        document.getElementById(
            "telephone-commande"
        )?.value.trim();

    const commune =
        document.getElementById(
            "commune-commande"
        )?.value;
   
    const adresse =
        document.getElementById(
            "adresse-commande"
        )?.value.trim();


    const instruction =
        document.getElementById(
            "instruction-commande"
        )?.value.trim();


    if (!nom || !telephone || !adresse) {

        alert(
            "❌ Veuillez remplir toutes les informations obligatoires."
        );

        return;

    }


    /*
       Vérification finale du stock
    */

    for (const produit of panier) {

        if (produit.id !== undefined) {

            const article =
                trouverArticleVendeur(
                    produit.id
                );


            if (!article) {

                alert(
                    "❌ L'un des produits n'est plus disponible."
                );

                return;

            }


            if (
                Number(article.stock)
                < Number(produit.quantite)
            ) {

                alert(
                    "❌ Stock insuffisant pour : "
                    + article.nom
                );

                return;

            }

        }

    }


    let total = 0;


    panier.forEach(function(produit) {

        total +=
            Number(produit.prix)
            * Number(produit.quantite);

    });


    const produitsCommande =
        panier.map(function(produit) {

            return {

                id: produit.id,

                nom: produit.nom,

                prix: Number(produit.prix),

                quantite: Number(produit.quantite),

                vendeurId:
                    produit.vendeurId || null

            };

        });


    const commande = {

        id:
            "BM-" + Date.now(),

        nom: nom,

        telephone: telephone,

        commune: commune,

        adresse: adresse,

        instruction:
            instruction || "",

        produits:
            produitsCommande,

        total:
            total,

        date:
            new Date().toLocaleString(
                "fr-FR"
            ),

        statut:
            "En attente"

    };


    const commandes =
        JSON.parse(
            localStorage.getItem("commandes")
        ) || [];


    commandes.push(commande);


    localStorage.setItem(
        "commandes",
        JSON.stringify(commandes)
    );


    /*
       Diminuer le stock vendeur
    */

    let articles =
        JSON.parse(
            localStorage.getItem("articles-vendeur")
        ) || [];


    articles =
        articles.map(function(article) {

            const produitCommande =
                produitsCommande.find(function(produit) {

                    return (
                        String(produit.id)
                        === String(article.id)
                    );

                });


            if (produitCommande) {

                article.stock =
                    Math.max(
                        0,
                        Number(article.stock)
                        - Number(produitCommande.quantite)
                    );

            }


            return article;

        });


    localStorage.setItem(
        "articles-vendeur",
        JSON.stringify(articles)
    );


    commandeEnCours = commande;


    /*
       Vider le panier
    */

    panier = [];

    sauvegarderPanier();

    actualiserNombrePanier();

    afficherPanier();


    /*
       Fermer commande
    */

    const fenetreCommande =
        document.getElementById(
            "fenetre-commande"
        );


    if (fenetreCommande) {

        fenetreCommande.style.display =
            "none";

    }


    /*
       Afficher paiement
    */

    afficherPaiement(total);


    actualiserStatistiquesVendeur();

    afficherProduitsVendeurs();

}


/* =====================================================
   22. PAIEMENT
===================================================== */

function afficherPaiement(montant) {

    const fenetre =
        document.getElementById(
            "fenetre-paiement"
        );


    if (!fenetre) return;


    document.getElementById(
        "montant-wave"
    ).textContent =
        formaterPrix(montant);


    document.getElementById(
        "montant-orange"
    ).textContent =
        formaterPrix(montant);


    document.getElementById(
        "montant-mtn"
    ).textContent =
        formaterPrix(montant);


    document.getElementById(
        "montant-moov"
    ).textContent =
        formaterPrix(montant);


    document.getElementById(
        "montant-livraison"
    ).textContent =
        formaterPrix(montant);


    fenetre.style.display = "flex";

}


function choisirPaiement(mode) {

    const paiement =
        document.getElementById(
            "fenetre-paiement"
        );


    if (paiement) {

        paiement.style.display = "none";

    }


    const fenetres = {

        wave: "fenetre-wave",

        orange: "fenetre-orange",

        mtn: "fenetre-mtn",

        moov: "fenetre-moov",

        livraison: "fenetre-livraison"

    };


    const id =
        fenetres[mode];


    const fenetre =
        document.getElementById(id);


    if (fenetre) {

        fenetre.style.display = "flex";

    }

}


function terminerCommande() {

    const fenetres = [

        "fenetre-wave",
        "fenetre-orange",
        "fenetre-mtn",
        "fenetre-moov",
        "fenetre-livraison",
        "fenetre-paiement"

    ];


    fenetres.forEach(function(id) {

        const fenetre =
            document.getElementById(id);


        if (fenetre) {

            fenetre.style.display = "none";

        }

    });


    commandeEnCours = null;


    alert(
        "✅ Commande enregistrée avec succès !"
    );

}


/* =====================================================
   23. PAIEMENTS
===================================================== */

function payerWave() {

    terminerCommande();

}


function payerOrange() {

    terminerCommande();

}


function payerMtn() {

    terminerCommande();

}


function payerMoov() {

    terminerCommande();

}


function payerLivraison() {

    terminerCommande();

}


/* =====================================================
   24. VENDEUR : IDENTIFIANT
===================================================== */

function obtenirVendeurId() {

    let vendeurId =
        localStorage.getItem(
            "vendeurId"
        );


    if (!vendeurId) {

        vendeurId =
            "VENDEUR-"
            + Date.now()
            + "-"
            + Math.random()
                .toString(36)
                .substring(2, 8);


        localStorage.setItem(
            "vendeurId",
            vendeurId
        );

    }


    return vendeurId;

}


/* =====================================================
   25. ESPACE VENDEUR
===================================================== */

function afficherEspaceVendeur() {

    const espace =
        document.getElementById(
            "espace-vendeur"
        );


    if (!espace) return;


    espace.style.display = "block";


    actualiserStatistiquesVendeur();


    afficherProduitsVendeurs();


    const menu =
        document.getElementById(
            "menu-compte"
        );


    if (menu) {

        menu.style.display = "none";

    }

}


function fermerEspaceVendeur() {

    const espace =
        document.getElementById(
            "espace-vendeur"
        );


    if (espace) {

        espace.style.display = "none";

    }

}


/* =====================================================
   26. AJOUTER UN ARTICLE
===================================================== */

function ajouterArticle() {

    const fenetre =
        document.getElementById(
            "fenetre-ajout-article"
        );


    if (!fenetre) return;


    fenetre.style.display = "flex";

}


function fermerAjoutArticle() {

    const fenetre =
        document.getElementById(
            "fenetre-ajout-article"
        );


    if (fenetre) {

        fenetre.style.display = "none";

    }

}


/* =====================================================
   27. ENREGISTRER UN ARTICLE
===================================================== */

function enregistrerArticle(event) {

    event.preventDefault();


    const nom =
        document.getElementById(
            "nom-article"
        ).value.trim();


    const prix =
        Number(
            document.getElementById(
                "prix-article"
            ).value
        );


    const categorie =
        document.getElementById(
            "categorie-article"
        ).value;


    const stock =
        Number(
            document.getElementById(
                "stock-article"
            ).value
        );


    const description =
        document.getElementById(
            "description-article"
        ).value.trim();


    const fichier =
        document.getElementById(
            "image-article"
        ).files[0];


    if (
        !nom
        || prix < 0
        || !categorie
        || stock < 1
        || !description
        || !fichier
    ) {

        alert(
            "❌ Veuillez remplir tous les champs."
        );

        return;

    }


    const lecteur =
        new FileReader();


    lecteur.onload = function() {

        const articles =
            JSON.parse(
                localStorage.getItem(
                    "articles-vendeur"
                )
            ) || [];


        articles.push({

            id: Date.now(),

            vendeurId:
                obtenirVendeurId(),

            nom: nom,

            prix: prix,

            categorie: categorie,

            stock: stock,

            description: description,

            image:
                lecteur.result

        });


        localStorage.setItem(
            "articles-vendeur",
            JSON.stringify(articles)
        );


        alert(
            "✅ Article publié avec succès !"
        );


        document
        .getElementById(
            "form-article"
        )
        .reset();


        fermerAjoutArticle();

        afficherProduitsVendeurs();

        actualiserStatistiquesVendeur();

    };


    lecteur.readAsDataURL(fichier);

}


/* =====================================================
   28. MES ARTICLES
===================================================== */

function afficherMesArticles() {

    const fenetre =
        document.getElementById(
            "fenetre-mes-articles"
        );


    const liste =
        document.getElementById(
            "liste-mes-articles"
        );


    if (!fenetre || !liste) return;


    const vendeurId =
        obtenirVendeurId();


    const articles =
        JSON.parse(
            localStorage.getItem(
                "articles-vendeur"
            )
        ) || [];


    const mesArticles =
        articles.filter(function(article) {

            return article.vendeurId === vendeurId;

        });


    if (mesArticles.length === 0) {

        liste.innerHTML = `
            <p>
                Vous n'avez encore publié aucun article.
            </p>
        `;

    } else {

        liste.innerHTML =
            mesArticles.map(function(article) {

                return `

                    <div
                        style="
                            background:#f7f7f7;
                            padding:18px;
                            border-radius:12px;
                            margin-bottom:15px;
                        "
                    >

                        ${
                            article.image
                            ? `
                                <img
                                    src="${article.image}"
                                    style="
                                        width:120px;
                                        height:120px;
                                        object-fit:contain;
                                        border-radius:10px;
                                        background:white;
                                        margin-bottom:10px;
                                    "
                                >
                            `
                            : ""
                        }

                        <h3>
                            ${article.nom}
                        </h3>

                        <p>
                            Prix :
                            <strong>
                                ${formaterPrix(article.prix)}
                            </strong>
                        </p>

                        <p>
                            Stock :
                            <strong>
                                ${article.stock}
                            </strong>
                        </p>

                        <p>
                            ${article.description}
                        </p>

                        <div
                            style="
                                display:flex;
                                gap:10px;
                                margin-top:12px;
                            "
                        >

                            <button
                                type="button"
                                onclick="modifierArticle(${article.id})"
                            >
                                ✏️ Modifier
                            </button>

                            <button
                                type="button"
                                onclick="supprimerArticle(${article.id})"
                            >
                                🗑️ Supprimer
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");

    }


    fenetre.style.display = "flex";

}


function fermerMesArticles() {

    const fenetre =
        document.getElementById(
            "fenetre-mes-articles"
        );


    if (fenetre) {

        fenetre.style.display = "none";

    }

}


/* =====================================================
   29. MODIFIER UN ARTICLE
===================================================== */

let articleEnModification = null;


function modifierArticle(id) {

    const articles =
        JSON.parse(
            localStorage.getItem(
                "articles-vendeur"
            )
        ) || [];


    const vendeurId =
        obtenirVendeurId();


    const article =
        articles.find(function(item) {

            return (
                String(item.id)
                === String(id)
                &&
                item.vendeurId
                === vendeurId
            );

        });


    if (!article) {

        alert(
            "❌ Article introuvable."
        );

        return;

    }


    articleEnModification =
        article.id;


    document.getElementById(
        "modification-nom"
    ).value =
        article.nom;


    document.getElementById(
        "modification-prix"
    ).value =
        article.prix;


    document.getElementById(
        "modification-categorie"
    ).value =
        article.categorie;


    document.getElementById(
        "modification-stock"
    ).value =
        article.stock;


    document.getElementById(
        "modification-description"
    ).value =
        article.description;


    const fenetre =
        document.getElementById(
            "fenetre-modification"
        );


    if (fenetre) {

        fenetre.style.display = "flex";

    }

}


function fermerModification() {

    const fenetre =
        document.getElementById(
            "fenetre-modification"
        );


    if (fenetre) {

        fenetre.style.display = "none";

    }


    articleEnModification = null;

}


/* =====================================================
   30. ENREGISTRER MODIFICATION
===================================================== */

function enregistrerModification(event) {

    event.preventDefault();


    if (!articleEnModification) {

        return;

    }


    const vendeurId =
        obtenirVendeurId();


    const articles =
        JSON.parse(
            localStorage.getItem(
                "articles-vendeur"
            )
        ) || [];


    const index =
        articles.findIndex(function(article) {

            return (
                String(article.id)
                === String(articleEnModification)
                &&
                article.vendeurId
                === vendeurId
            );

        });


    if (index === -1) {

        alert(
            "❌ Article introuvable."
        );

        return;

    }


    articles[index].nom =
        document.getElementById(
            "modification-nom"
        ).value.trim();


    articles[index].prix =
        Number(
            document.getElementById(
                "modification-prix"
            ).value
        );


    articles[index].categorie =
        document.getElementById(
            "modification-categorie"
        ).value;


    articles[index].stock =
        Number(
            document.getElementById(
                "modification-stock"
            ).value
        );


    articles[index].description =
        document.getElementById(
            "modification-description"
        ).value.trim();


    localStorage.setItem(
        "articles-vendeur",
        JSON.stringify(articles)
    );


    alert(
        "✅ Article modifié avec succès !"
    );


    fermerModification();

    afficherMesArticles();

    afficherProduitsVendeurs();

    actualiserStatistiquesVendeur();

}


/* =====================================================
   31. SUPPRIMER ARTICLE
===================================================== */

function supprimerArticle(id) {

    const vendeurId =
        obtenirVendeurId();


    const articles =
        JSON.parse(
            localStorage.getItem(
                "articles-vendeur"
            )
        ) || [];


    const article =
        articles.find(function(item) {

            return (
                String(item.id)
                === String(id)
                &&
                item.vendeurId
                === vendeurId
            );

        });


    if (!article) {

        alert(
            "❌ Article introuvable."
        );

        return;

    }


    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer cet article ?"
        );


    if (!confirmation) return;


    const nouveauxArticles =
        articles.filter(function(item) {

            return String(item.id)
                !== String(id);

        });


    localStorage.setItem(
        "articles-vendeur",
        JSON.stringify(nouveauxArticles)
    );


    /*
       Retirer également du panier
    */

    panier =
        panier.filter(function(produit) {

            return String(produit.id)
                !== String(id);

        });


    sauvegarderPanier();

    actualiserNombrePanier();

    afficherPanier();

    afficherMesArticles();

    afficherProduitsVendeurs();

    actualiserStatistiquesVendeur();


    alert(
        "✅ Article supprimé."
    );

}


/* =====================================================
   32. AFFICHER LES PRODUITS VENDEURS
===================================================== */

function afficherProduitsVendeurs() {

    const conteneur =
        document.getElementById(
            "produits-vendeurs"
        );


    if (!conteneur) return;


    const articles =
        JSON.parse(
            localStorage.getItem(
                "articles-vendeur"
            )
        ) || [];


    if (articles.length === 0) {

        conteneur.innerHTML = "";

        return;

    }


    conteneur.innerHTML =
        articles.map(function(article) {

            return `

                <div
                    class="produit carte-produit"
                    data-categorie="${article.categorie}"
                >

                    <div class="image-produit">

                        ${
                            article.image
                            ? `
                                <img
                                    src="${article.image}"
                                    alt="${article.nom}"
                                >
                            `
                            : `
                                <span>
                                    📦
                                </span>
                            `
                        }

                    </div>

                    <h3>
                        ${article.nom}
                    </h3>

                    <p class="description">
                        ${article.description}
                    </p>

                    <div class="prix">
                        ${formaterPrix(article.prix)}
                    </div>

                    <p
                        style="
                            margin-bottom:10px;
                            color:#666;
                        "
                    >
                        Stock :
                        ${article.stock}
                    </p>

                    <button
                        type="button"
                        onclick="
                            ajouterAuPanier(
                                '${String(article.nom).replace(/'/g, "\\'")}',
                                ${Number(article.prix)},
                                ${Number(article.stock)},
                                '${article.id}'
                            )
                        "
                        ${
                            Number(article.stock) <= 0
                            ? "disabled"
                            : ""
                        }
                    >
                        ${
                            Number(article.stock) <= 0
                            ? "Rupture de stock"
                            : "Ajouter au panier"
                        }
                    </button>

                </div>

            `;

        })
        .join("");

}


/* =====================================================
   33. MES VENTES
===================================================== */

function afficherVentes() {

    const fenetre =
        document.getElementById(
            "fenetre-mes-ventes"
        );


    const liste =
        document.getElementById(
            "liste-mes-ventes"
        );


    if (!fenetre || !liste) return;


    const vendeurId =
        obtenirVendeurId();


    const commandes =
        JSON.parse(
            localStorage.getItem(
                "commandes"
            )
        ) || [];


    const ventes =
        commandes.filter(function(commande) {

            return (commande.produits || [])
                .some(function(produit) {

                    return (
                        produit.vendeurId
                        === vendeurId
                    );

                });

        });


    if (ventes.length === 0) {

        liste.innerHTML = `
            <p>
                Vous n'avez encore aucune vente.
            </p>
        `;

    } else {

        liste.innerHTML =
            ventes
            .slice()
            .reverse()
            .map(function(commande) {

                const produitsVendeur =
                    (commande.produits || [])
                    .filter(function(produit) {

                        return (
                            produit.vendeurId
                            === vendeurId
                        );

                    });


                let totalVendeur = 0;


                produitsVendeur.forEach(function(produit) {

                    totalVendeur +=
                        Number(produit.prix)
                        * Number(produit.quantite);

                });


                return `

                    <div
                        style="
                            background:#f7f7f7;
                            padding:20px;
                            border-radius:12px;
                            margin-bottom:15px;
                        "
                    >

                        <h3>
                            🧾 ${commande.id}
                        </h3>

                        <p>
                            <strong>Client :</strong>
                            ${commande.nom}
                        </p>

                        <p>
                            <strong>Téléphone :</strong>
                            ${commande.telephone}
                        </p>

                        <p>
                            <strong>Adresse :</strong>
                            ${commande.adresse}
                        </p>

                        ${
                            commande.instruction
                            ? `
                                <p>
                                    <strong>Instruction :</strong>
                                    ${commande.instruction}
                                </p>
                            `
                            : ""
                        }

                        <p>
                            <strong>Date :</strong>
                            ${commande.date}
                        </p>

                        <h4 style="margin-top:12px;">
                            Produits vendus :
                        </h4>

                        <ul>
                            ${
                                produitsVendeur
                                .map(function(produit) {

                                    return `
                                        <li>
                                            ${produit.nom}
                                            × ${produit.quantite}
                                            —
                                            ${formaterPrix(
                                                Number(produit.prix)
                                                * Number(produit.quantite)
                                            )}
                                        </li>
                                    `;

                                })
                                .join("")
                            }
                        </ul>

                        <p style="margin-top:12px;">
                            <strong>
                                Total vendeur :
                                ${formaterPrix(totalVendeur)}
                            </strong>
                        </p>

                        <label
                            style="
                                display:block;
                                margin-top:15px;
                                font-weight:bold;
                            "
                        >
                            Statut de la commande :
                        </label>

                        <select
                            onchange="
                                changerStatutCommande(
                                    '${commande.id}',
                                    this.value
                                )
                            "
                            style="
                                width:100%;
                                margin-top:8px;
                                padding:10px;
                                border:1px solid #ddd;
                                border-radius:8px;
                            "
                        >

                            <option
                                value="En attente"
                                ${
                                    commande.statut
                                    === "En attente"
                                    ? "selected"
                                    : ""
                                }
                            >
                                En attente
                            </option>

                            <option
                                value="En préparation"
                                ${
                                    commande.statut
                                    === "En préparation"
                                    ? "selected"
                                    : ""
                                }
                            >
                                En préparation
                            </option>

                            <option
                                value="Expédiée"
                                ${
                                    commande.statut
                                    === "Expédiée"
                                    ? "selected"
                                    : ""
                                }
                            >
                                Expédiée
                            </option>

                            <option
                                value="Livrée"
                                ${
                                    commande.statut
                                    === "Livrée"
                                    ? "selected"
                                    : ""
                                }
                            >
                                Livrée
                            </option>

                        </select>

                    </div>

                `;

            })
            .join("");

    }


    fenetre.style.display = "flex";

}


function fermerVentes() {

    const fenetre =
        document.getElementById(
            "fenetre-mes-ventes"
        );


    if (fenetre) {

        fenetre.style.display = "none";

    }

}


/* =====================================================
   34. CHANGER STATUT COMMANDE
===================================================== */

function changerStatutCommande(
    idCommande,
    nouveauStatut
) {

    const commandes =
        JSON.parse(
            localStorage.getItem(
                "commandes"
            )
        ) || [];


    const commande =
        commandes.find(function(item) {

            return String(item.id)
                === String(idCommande);

        });


    if (!commande) {

        alert(
            "❌ Commande introuvable."
        );

        return;

    }


    const ancienStatut =
        commande.statut;


    commande.statut =
        nouveauStatut;


    localStorage.setItem(
        "commandes",
        JSON.stringify(commandes)
    );


    if (
        nouveauStatut === "Livrée"
        &&
        ancienStatut !== "Livrée"
    ) {

        alert(
            "🟢 Commande livrée !"
        );

    }


    afficherVentes();

    afficherMesCommandes();

    actualiserStatistiquesVendeur();

}


/* =====================================================
   35. STATISTIQUES VENDEUR
===================================================== */

function actualiserStatistiquesVendeur() {

    const vendeurId =
        obtenirVendeurId();


    const articles =
        JSON.parse(
            localStorage.getItem(
                "articles-vendeur"
            )
        ) || [];


    const commandes =
        JSON.parse(
            localStorage.getItem(
                "commandes"
            )
        ) || [];


    /*
       MES ARTICLES
    */

    const mesArticles =
        articles.filter(function(article) {

            return (
                article.vendeurId
                === vendeurId
            );

        });


    const nombreArticles =
        document.getElementById(
            "nombre-mes-articles"
        );


    if (nombreArticles) {

        nombreArticles.textContent =
            mesArticles.length;

    }


    /*
       MES VENTES
    */

    const mesVentes =
        commandes.filter(function(commande) {

            return (commande.produits || [])
                .some(function(produit) {

                    return (
                        produit.vendeurId
                        === vendeurId
                    );

                });

        });


    const nombreVentes =
        document.getElementById(
            "nombre-mes-ventes"
        );


    if (nombreVentes) {

        nombreVentes.textContent =
            mesVentes.length;

    }


    /*
       MES REVENUS
       UNIQUEMENT LES COMMANDES LIVRÉES
    */

    let revenus = 0;


    commandes.forEach(function(commande) {

        if (
            commande.statut
            !== "Livrée"
        ) {

            return;

        }


        (commande.produits || [])
        .forEach(function(produit) {

            if (
                produit.vendeurId
                === vendeurId
            ) {

                revenus +=
                    Number(produit.prix)
                    * Number(produit.quantite);

            }

        });

    });


    const revenusElement =
        document.getElementById(
            "revenus-vendeur"
        );


    if (revenusElement) {

        revenusElement.textContent =
            formaterPrix(revenus);

    }

}


/* =====================================================
   36. FERMER LES FENÊTRES DE PAIEMENT
===================================================== */

function fermerFenetre(id) {

    const fenetre =
        document.getElementById(id);


    if (fenetre) {

        fenetre.style.display = "none";

    }

}


/* =====================================================
   37. INITIALISATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /*
           Panier
        */

        verifierStockPanier();

        actualiserNombrePanier();


        /*
           Client
        */

        afficherNomClient();


        /*
           Produits vendeurs
        */

        afficherProduitsVendeurs();


        /*
           Statistiques
        */

        actualiserStatistiquesVendeur();


        /*
           RECHERCHE
        */

        const recherche =
            document.getElementById(
                "recherche-produit"
            );


        if (recherche) {

            recherche.addEventListener(
                "input",
                rechercherProduits
            );

        }


        /*
           BOUTON COMPTE
        */

        const boutonCompte =
            document.getElementById(
                "bouton-compte"
            );


        if (boutonCompte) {

            boutonCompte.addEventListener(
                "click",
                function() {

                    const utilisateur =
                        JSON.parse(
                            localStorage.getItem(
                                "utilisateur"
                            )
                        );


                    if (!utilisateur) {

                        const fenetre =
                            document.getElementById(
                                "fenetre-inscription"
                            );


                        if (fenetre) {

                            fenetre.style.display =
                                "flex";

                        }

                    } else {

                        afficherMenuCompte();

                    }

                }
            );

        }


        /*
           FORMULAIRE INSCRIPTION
        */

        const formInscription =
            document.getElementById(
                "form-inscription"
            );


        if (formInscription) {

            formInscription.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();


                    const nom =
                        document.getElementById(
                            "nom-inscription"
                        )?.value.trim();
                   const prenom =
                            document.getElementById(
                            "prenom-inscription"
                        )?.value.trim();


                    const email =
                        document.getElementById(
                            "email-inscription"
                        )?.value.trim();


                    const telephone =
                        document.getElementById(
                            "telephone-inscription"
                        )?.value.trim();
                    const commune =
                         document.getElementById(
                              "commune-inscription"
                        )?.value;

                    const adresse =
                          document.getElementById(
                              "adresse-inscription"
                         )?.value.trim();


                    const motDePasse =
                        document.getElementById(
                            "mot-de-passe-inscription"
                        )?.value;
                   
                   const confirmationMotDePasse =
                         document.getElementById(
                         "confirmation-mot-de-passe"
                         )?.value;


if (
    !prenom
    || !nom
    || !email
    || !telephone
    || !commune
    || !adresse
    || !motDePasse
    || !confirmationMotDePasse
) {
    alert(
        "❌ Veuillez remplir tous les champs."
    );
    return;
}

if (motDePasse !== confirmationMotDePasse) {
    alert(
        "❌ Les deux mots de passe ne correspondent pas."
    );
    return;
}

                    localStorage.setItem(
    "utilisateur",
    JSON.stringify({
        prenom: prenom,
        nom: nom,
        email: email,
        telephone: telephone,
        commune: commune,
        adresse: adresse
    })
);


                    afficherNomClient();


                    const fenetre =
                        document.getElementById(
                            "fenetre-inscription"
                        );


                    if (fenetre) {

                        fenetre.style.display =
                            "none";

                    }


                    formInscription.reset();


                    alert(
                        "✅ Inscription réussie !"
                    );

                }
            );

        }


        /*
           FORMULAIRE COMMANDE
        */

        const formCommande =
            document.getElementById(
                "form-commande"
            );


        if (formCommande) {

            formCommande.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();

                    creerCommande();

                }
            );

        }


        /*
           FORMULAIRE AJOUT ARTICLE
        */

        const formArticle =
            document.getElementById(
                "form-article"
            );


        if (formArticle) {

            formArticle.addEventListener(
                "submit",
                enregistrerArticle
            );

        }


        /*
           FORMULAIRE MODIFICATION
        */

        const formModification =
            document.getElementById(
                "form-modification"
            );


        if (formModification) {

            formModification.addEventListener(
                "submit",
                enregistrerModification
            );

        }
        /* =====================================================
   APERÇU DE LA PHOTO AVANT PUBLICATION
===================================================== */

const imageArticle =
    document.getElementById("image-article");


if (imageArticle) {

    imageArticle.addEventListener(
        "change",
        function () {

            const fichier =
                this.files[0];

            if (!fichier) {
                return;
            }


            /* Vérifier que c'est bien une image */

            if (!fichier.type.startsWith("image/")) {

                alert("Veuillez sélectionner une image.");

                this.value = "";

                return;
            }


            /* Créer l'aperçu */

            let apercu =
                document.getElementById(
                    "apercu-image-article"
                );


            /* Créer l'élément s'il n'existe pas */

            if (!apercu) {

                apercu =
                    document.createElement("img");

                apercu.id =
                    "apercu-image-article";

                apercu.alt =
                    "Aperçu de l'article";


                this.parentElement
                    .appendChild(apercu);
            }


            /* Afficher l'image */

            const lecteur =
                new FileReader();


            lecteur.onload =
                function (event) {

                    apercu.src =
                        event.target.result;

                };


            lecteur.readAsDataURL(fichier);

        }
    );

}


        /*
           PAIEMENT WAVE
        */

        const formWave =
            document.getElementById(
                "form-wave"
            );


        if (formWave) {

            formWave.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();

                    payerWave();

                }
            );

        }


        /*
           ORANGE MONEY
        */

        const formOrange =
            document.getElementById(
                "form-orange"
            );


        if (formOrange) {

            formOrange.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();

                    payerOrange();

                }
            );

        }


        /*
           MTN MOMO
        */

        const formMtn =
            document.getElementById(
                "form-mtn"
            );


        if (formMtn) {

            formMtn.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();

                    payerMtn();

                }
            );

        }


        /*
           MOOV MONEY
        */

        const formMoov =
            document.getElementById(
                "form-moov"
            );


        if (formMoov) {

            formMoov.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();

                    payerMoov();

                }
            );

        }


        /*
           LIVRAISON
        */

        const confirmerLivraison =
            document.getElementById(
                "confirmer-livraison"
            );


        if (confirmerLivraison) {

            confirmerLivraison.addEventListener(
                "click",
                payerLivraison
            );

        }


        /*
           BOUTONS FERMER
        */

        const fermerInformations =
            document.querySelector(
                ".fermer-informations"
            );


        if (fermerInformations) {

            fermerInformations.addEventListener(
                "click",
                function() {

                    fermerFenetre(
                        "fenetre-informations"
                    );

                }
            );

        }


        const fermerCommande =
            document.querySelector(
                ".fermer-commande"
            );


        if (fermerCommande) {

            fermerCommande.addEventListener(
                "click",
                function() {

                    fermerFenetre(
                        "fenetre-commande"
                    );

                }
            );

        }


        const boutonsFermeturePaiement = {

            ".fermer-paiement":
                "fenetre-paiement",

            ".fermer-wave":
                "fenetre-wave",

            ".fermer-orange":
                "fenetre-orange",

            ".fermer-mtn":
                "fenetre-mtn",

            ".fermer-moov":
                "fenetre-moov",

            ".fermer-livraison":
                "fenetre-livraison"

        };


        Object.keys(
            boutonsFermeturePaiement
        ).forEach(function(selecteur) {

            const bouton =
                document.querySelector(
                    selecteur
                );


            if (bouton) {

                bouton.addEventListener(
                    "click",
                    function() {

                        fermerFenetre(
                            boutonsFermeturePaiement[
                                selecteur
                            ]
                        );

                    }
                );

            }

        });


        /*
           Fermer inscription si bouton présent
        */

        const fermerInscription =
            document.querySelector(
                ".fermer-inscription"
            );


        if (fermerInscription) {

            fermerInscription.addEventListener(
                "click",
                function() {

                    fermerFenetre(
                        "fenetre-inscription"
                    );

                }
            );

        }


        /*
           Fermer en cliquant sur le fond
        */

        document.addEventListener(
            "click",
            function(event) {

                const menu =
                    document.getElementById(
                        "menu-compte"
                    );


                const compte =
                    document.querySelector(
                        ".compte"
                    );


                if (
                    menu
                    &&
                    compte
                    &&
                    !compte.contains(event.target)
                    &&
                    !menu.contains(event.target)
                ) {

                    menu.style.display = "none";

                }

            }
        );


    }
);

/* =====================================================
   BLACK-Market A
   ESPACE VENDEUR
===================================================== */


/* =====================================================
   IDENTIFIANT DU VENDEUR
===================================================== */

function obtenirVendeurId() {

    let vendeurId =
        localStorage.getItem("vendeurId");


    /* =========================
       SI LE VENDEUR N'A PAS ENCORE
       D'IDENTIFIANT
    ========================= */

    if (!vendeurId) {

        vendeurId =
            "VENDEUR-" +
            Date.now() +
            "-" +
            Math.random()
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
   1. AJOUTER UN ARTICLE
===================================================== */


/* =========================
   OUVRIR AJOUT ARTICLE
========================= */

function ajouterArticle() {

    const fenetre =
        document.getElementById("fenetre-ajout-article");

    if (fenetre) {
        fenetre.style.display = "flex";
    }

}


/* =========================
   FERMER AJOUT ARTICLE
========================= */

function fermerAjoutArticle() {

    const fenetre =
        document.getElementById("fenetre-ajout-article");

    if (fenetre) {
        fenetre.style.display = "none";
    }

}


/* =========================
   PUBLIER UN ARTICLE
========================= */

const formulaireArticle =
    document.getElementById("form-article");

if (formulaireArticle) {

    formulaireArticle.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            /* =========================
               RÉCUPÉRER LES INFORMATIONS
            ========================= */

            const nom =
                document
                    .getElementById("nom-article")
                    .value
                    .trim();

            const prix =
                Number(
                    document
                        .getElementById("prix-article")
                        .value
                );

            const categorie =
                document
                    .getElementById("categorie-article")
                    .value;

            const stock =
                Number(
                    document
                        .getElementById("stock-article")
                        .value
                );

            const description =
                document
                    .getElementById("description-article")
                    .value
                    .trim();

            const image =
                document
                    .getElementById("image-article")
                    .files[0];


            /* =========================
               VÉRIFICATIONS
            ========================= */

            if (!nom) {

                alert(
                    "Veuillez entrer le nom de l'article."
                );

                return;
            }


            if (!prix || prix <= 0) {

                alert(
                    "Veuillez entrer un prix valide."
                );

                return;
            }


            if (!stock || stock < 1) {

                alert(
                    "Veuillez entrer une quantité de stock valide."
                );

                return;
            }


            if (!image) {

                alert(
                    "Veuillez choisir une image."
                );

                return;
            }


            /* =========================
               LIRE L'IMAGE
            ========================= */

            const lecteur =
                new FileReader();


            lecteur.onload =
                function(event) {

                    const imageBase64 =
                        event.target.result;


                    /* =========================
                       CRÉER L'ARTICLE
                    ========================= */

                    const article = {

    id: Date.now(),

    vendeurId:
    obtenirVendeurId(),

    nom: nom,

    prix: prix,

    categorie: categorie,

    stock: stock,

    description: description,

    image: imageBase64

};


                    /* =========================
                       RÉCUPÉRER LES ARTICLES
                    ========================= */

                    let articles =
                        JSON.parse(
                            localStorage.getItem(
                                "articles-vendeur"
                            )
                        ) || [];


                    /* =========================
                       AJOUTER
                    ========================= */

                    articles.push(article);


                    /* =========================
                       SAUVEGARDER
                    ========================= */

                    localStorage.setItem(
                        "articles-vendeur",
                        JSON.stringify(articles)
                    );


                    /* =========================
                       CONFIRMATION
                    ========================= */

                    alert(
                        "✅ Article publié avec succès !"
                    );


                    /* =========================
                       FERMER
                    ========================= */

                    fermerAjoutArticle();


                    /* =========================
                       VIDER LE FORMULAIRE
                    ========================= */

                    formulaireArticle.reset();


                    /* =========================
                       ACTUALISER MES ARTICLES
                    ========================= */

                    if (
                        typeof afficherMesArticles ===
                        "function"
                    ) {

                        afficherMesArticles();

                    }


                    /* =========================
                       ACTUALISER LES PRODUITS
                    ========================= */

                    if (
                        typeof afficherProduitsVendeurs ===
                        "function"
                    ) {

                        afficherProduitsVendeurs();

                    }

                };


            lecteur.readAsDataURL(image);

        }
    );

}


/* =====================================================
   2. GESTION DES ARTICLES
===================================================== */


/* =========================
   AFFICHER MES ARTICLES
========================= */

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


    const articles =
        JSON.parse(
            localStorage.getItem(
                "articles-vendeur"
            )
        ) || [];


    liste.innerHTML = "";


    /* =========================
       AUCUN ARTICLE
    ========================= */

    if (articles.length === 0) {

        liste.innerHTML =
            "<p>📦 Vous n'avez encore publié aucun article.</p>";

        fenetre.style.display =
            "flex";

        return;
    }


    /* =========================
       AFFICHER LES ARTICLES
    ========================= */

    articles.forEach(
        function(article) {

            const bloc =
                document.createElement("div");


            bloc.className =
                "article-vendeur";


            bloc.innerHTML =

                "<div class=\"image-article-vendeur\">" +

                    "<img " +
                    "src=\"" +
                    (
                        article.image ||
                        "image/produit1.jpg"
                    ) +
                    "\" " +
                    "alt=\"" +
                    article.nom +
                    "\">" +

                "</div>" +


                "<div class=\"informations-article\">" +

                    "<h3>🏷️ " +
                    article.nom +
                    "</h3>" +


                    "<p>💰 Prix : " +
                    Number(article.prix)
                        .toLocaleString("fr-FR") +
                    " FCFA</p>" +


                    "<p>📂 Catégorie : " +
                    article.categorie +
                    "</p>" +


                    "<p>📦 Stock : " +
                    article.stock +
                    "</p>" +


                    "<p>📝 " +
                    (
                        article.description ||
                        ""
                    ) +
                    "</p>" +


                    "<div class=\"actions-article\">" +

                        "<button " +
                        "class=\"bouton-modifier\" " +
                        "onclick=\"modifierArticle(" +
                        article.id +
                        ")\">" +

                            "✏️ Modifier" +

                        "</button>" +


                        "<button " +
                        "class=\"bouton-supprimer\" " +
                        "onclick=\"supprimerArticle(" +
                        article.id +
                        ")\">" +

                            "🗑️ Supprimer" +

                        "</button>" +

                    "</div>" +

                "</div>";


            liste.appendChild(bloc);

        }
    );


    fenetre.style.display =
        "flex";

}


/* =========================
   FERMER MES ARTICLES
========================= */

function fermerMesArticles() {

    const fenetre =
        document.getElementById(
            "fenetre-mes-articles"
        );


    if (fenetre) {

        fenetre.style.display =
            "none";

    }

}


/* =========================
   SUPPRIMER UN ARTICLE
========================= */

function supprimerArticle(id) {

    const confirmation =
        confirm(
            "Voulez-vous vraiment supprimer cet article ?"
        );


    if (!confirmation) return;


    let articles =
        JSON.parse(
            localStorage.getItem(
                "articles-vendeur"
            )
        ) || [];


    articles =
        articles.filter(
            function(article) {

                return article.id !== id;

            }
        );


    localStorage.setItem(
        "articles-vendeur",
        JSON.stringify(articles)
    );


    alert(
        "🗑️ Article supprimé."
    );


    afficherMesArticles();


    if (
        typeof afficherProduitsVendeurs ===
        "function"
    ) {

        afficherProduitsVendeurs();

    }

}


/* =====================================================
   3. MODIFICATION D'ARTICLE
===================================================== */


/* =========================
   ARTICLE EN MODIFICATION
========================= */

let articleEnModification = null;


/* =========================
   MODIFIER UN ARTICLE
========================= */

function modifierArticle(id) {

    const articles =
        JSON.parse(
            localStorage.getItem(
                "articles-vendeur"
            )
        ) || [];


    const article =
        articles.find(
            function(article) {

                return article.id === id;

            }
        );


    if (!article) {

        alert(
            "Article introuvable."
        );

        return;
    }


    articleEnModification =
        id;


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

        fenetre.style.display =
            "flex";

    }

}


/* =========================
   FERMER MODIFICATION
========================= */

function fermerModification() {

    const fenetre =
        document.getElementById(
            "fenetre-modification"
        );


    if (fenetre) {

        fenetre.style.display =
            "none";

    }

}


/* =========================
   ENREGISTRER MODIFICATION
========================= */

const formulaireModification =
    document.getElementById(
        "form-modification"
    );


if (formulaireModification) {

    formulaireModification.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (
                articleEnModification ===
                null
            ) {

                alert(
                    "Article introuvable."
                );

                return;
            }


            const articles =
                JSON.parse(
                    localStorage.getItem(
                        "articles-vendeur"
                    )
                ) || [];


            const article =
                articles.find(
                    function(article) {

                        return (
                            article.id ===
                            articleEnModification
                        );

                    }
                );


            if (!article) {

                alert(
                    "Article introuvable."
                );

                return;
            }


            /* =========================
               MODIFIER
            ========================= */

            article.nom =
                document
                    .getElementById(
                        "modification-nom"
                    )
                    .value
                    .trim();


            article.prix =
                Number(
                    document
                        .getElementById(
                            "modification-prix"
                        )
                        .value
                );


            article.categorie =
                document
                    .getElementById(
                        "modification-categorie"
                    )
                    .value;


            article.stock =
                Number(
                    document
                        .getElementById(
                            "modification-stock"
                        )
                        .value
                );


            article.description =
                document
                    .getElementById(
                        "modification-description"
                    )
                    .value
                    .trim();


            /* =========================
               SAUVEGARDER
            ========================= */

            localStorage.setItem(
                "articles-vendeur",
                JSON.stringify(articles)
            );


            alert(
                "✅ Article modifié avec succès !"
            );


            fermerModification();


            articleEnModification =
                null;


            afficherMesArticles();


            if (
                typeof afficherProduitsVendeurs ===
                "function"
            ) {

                afficherProduitsVendeurs();

            }

        }
    );

}


/* =====================================================
   4. GESTION DES VENTES
===================================================== */


/* =====================================================
   AFFICHER MES VENTES
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

    if (!fenetre || !liste) {
        return;
    }


    /* =================================================
       VENDEUR CONNECTÉ
    ================================================= */

    const vendeurId =
        obtenirVendeurId();


    /* =================================================
       RÉCUPÉRER LES COMMANDES
    ================================================= */

    const commandes =
        JSON.parse(
            localStorage.getItem("commandes")
        ) || [];


    liste.innerHTML = "";


    /* =================================================
       RECHERCHER LES VENTES DU VENDEUR
    ================================================= */

    const ventes = [];


    commandes.forEach(function(commande) {

        if (
            !commande.produits ||
            !Array.isArray(commande.produits)
        ) {
            return;
        }


        const produitsDuVendeur =
            commande.produits.filter(
                function(produit) {

                    return (
                        produit.vendeurId &&
                        String(produit.vendeurId) ===
                        String(vendeurId)
                    );

                }
            );


        if (
            produitsDuVendeur.length === 0
        ) {
            return;
        }


        /* =================================================
           CALCUL DU TOTAL DU VENDEUR
        ================================================= */

        let totalVendeur = 0;


        produitsDuVendeur.forEach(
            function(produit) {

                totalVendeur +=
                    Number(produit.prix || 0) *
                    Number(produit.quantite || 0);

            }
        );


        ventes.push({

            commande: commande,

            produits: produitsDuVendeur,

            total: totalVendeur

        });

    });


    /* =================================================
       AUCUNE VENTE
    ================================================= */

    if (ventes.length === 0) {

        liste.innerHTML = `

            <div class="aucune-vente">

                <div style="font-size:50px;">
                    🛒
                </div>

                <h3>
                    Aucune vente pour le moment
                </h3>

                <p>
                    Les commandes concernant
                    vos articles apparaîtront ici.
                </p>

            </div>

        `;

        fenetre.style.display = "flex";

        return;
    }


    /* =================================================
       AFFICHER LES VENTES
    ================================================= */

    ventes.forEach(function(vente, index) {

        const commande =
            vente.commande;

        const produits =
            vente.produits;


        const carte =
            document.createElement("div");


        carte.className =
            "carte-vente";


        /* =================================================
           PRODUITS
        ================================================= */

        let produitsHTML = "";


        produits.forEach(function(produit) {

            const quantite =
                Number(produit.quantite || 0);

            const prix =
                Number(produit.prix || 0);

            const sousTotal =
                prix * quantite;


            produitsHTML += `

                <div class="produit-vente">

                    <strong>
                        🛍️ ${produit.nom}
                    </strong>

                    <span>
                        📦 Quantité :
                        ${quantite}
                    </span>

                    <span>
                        💰 Prix unitaire :
                        ${prix.toLocaleString("fr-FR")}
                        FCFA
                    </span>

                    <span>
                        💵 Sous-total :
                        ${sousTotal.toLocaleString("fr-FR")}
                        FCFA
                    </span>

                </div>

            `;

        });


        /* =================================================
           STATUT
        ================================================= */

        const statut =
            commande.statut ||
            "En attente";


        /* =================================================
           ID COMMANDE
        ================================================= */

        const idCommande =
            commande.id ||
            "BM-" + (index + 1);


        /* =================================================
           CARTE
        ================================================= */

        carte.innerHTML = `

            <div class="entete-vente">

                <h3>
                    🧾 Commande #${idCommande}
                </h3>

                <select
                    class="select-statut-vente"
                    data-commande-id="${idCommande}"
                >

                    <option
                        value="En attente"
                        ${statut === "En attente"
                            ? "selected"
                            : ""}
                    >
                        🟡 En attente
                    </option>

                    <option
                        value="En préparation"
                        ${statut === "En préparation"
                            ? "selected"
                            : ""}
                    >
                        🟠 En préparation
                    </option>

                    <option
                        value="Expédiée"
                        ${statut === "Expédiée"
                            ? "selected"
                            : ""}
                    >
                        🔵 Expédiée
                    </option>

                    <option
                        value="Livrée"
                        ${statut === "Livrée"
                            ? "selected"
                            : ""}
                    >
                        🟢 Livrée
                    </option>

                </select>

            </div>


            <div class="informations-client">

                <h4>
                    👤 Informations client
                </h4>

                <p>
                    <strong>Nom :</strong>
                    ${commande.nom || "Non renseigné"}
                </p>

                <p>
                    <strong>📞 Téléphone :</strong>
                    ${commande.telephone || "Non renseigné"}
                </p>

                <p>
                    <strong>📍 Adresse :</strong>
                    ${commande.adresse || "Non renseignée"}
                </p>

            </div>


            <div class="produits-commande">

                <h4>
                    📦 Produit(s) vendu(s)
                </h4>

                ${produitsHTML}

            </div>


            <div class="resume-vente">

                <p>
                    📅
                    <strong>Date :</strong>
                    ${commande.date || "Non renseignée"}
                </p>

                <p class="total-vente">

                    💰

                    <strong>
                        Votre vente :
                        ${vente.total.toLocaleString("fr-FR")}
                        FCFA
                    </strong>

                </p>

            </div>

        `;


        /* =================================================
           CHANGEMENT DU STATUT
        ================================================= */

        const select =
            carte.querySelector(
                ".select-statut-vente"
            );


        if (select) {

            select.addEventListener(
                "change",
                function() {

                    changerStatutCommande(
                        idCommande,
                        this.value
                    );

                }
            );

        }


        liste.appendChild(carte);

    });


    /* =================================================
       OUVRIR LA FENÊTRE
    ================================================= */

    fenetre.style.display =
        "flex";

}


/* =====================================================
   FERMER MES VENTES
===================================================== */

function fermerVentes() {

    const fenetre =
        document.getElementById(
            "fenetre-mes-ventes"
        );

    if (fenetre) {

        fenetre.style.display =
            "none";

    }

}


/* =====================================================
   CHANGER LE STATUT
===================================================== */

function changerStatutCommande(
    idCommande,
    nouveauStatut
) {

    let commandes =
        JSON.parse(
            localStorage.getItem("commandes")
        ) || [];


    /* =================================================
       RECHERCHER LA COMMANDE
    ================================================= */

    const commande =
        commandes.find(
            function(commande) {

                return String(commande.id) ===
                       String(idCommande);

            }
        );


    if (!commande) {

        alert(
            "❌ Commande introuvable."
        );

        return;
    }


    /* =================================================
       ANCIEN STATUT
    ================================================= */

    const ancienStatut =
        commande.statut ||
        "En attente";


    /* =================================================
       NOUVEAU STATUT
    ================================================= */

    commande.statut =
        nouveauStatut;


    /* =================================================
       SAUVEGARDER
    ================================================= */

    localStorage.setItem(
        "commandes",
        JSON.stringify(commandes)
    );


    /* =================================================
       MESSAGE
    ================================================= */

    if (
        nouveauStatut === "Livrée" &&
        ancienStatut !== "Livrée"
    ) {

        alert(
            "🟢 Commande livrée !"
        );

    }


    /* =================================================
       ACTUALISER
    ================================================= */

    afficherVentes();


    if (
        typeof actualiserStatistiquesVendeur ===
        "function"
    ) {

        actualiserStatistiquesVendeur();

    }

}
/* =====================================================
   5. STATISTIQUES DU VENDEUR
===================================================== */

/* =====================================================
   5. STATISTIQUES DU VENDEUR
===================================================== */

function actualiserStatistiquesVendeur() {

    /* =========================
       RÉCUPÉRER LE VENDEUR
    ========================= */

    const vendeurId =
        obtenirVendeurId();


    /* =========================
       RÉCUPÉRER LES ARTICLES
    ========================= */

    const articles =
        JSON.parse(
            localStorage.getItem("articles-vendeur")
        ) || [];


    /* =========================
       RÉCUPÉRER LES COMMANDES
    ========================= */

    const commandes =
        JSON.parse(
            localStorage.getItem("commandes")
        ) || [];


    /* =========================
       RÉCUPÉRER LES CARTES
    ========================= */

    const statistiques =
        document.querySelectorAll(
            ".carte-statistique strong"
        );


    if (statistiques.length < 3) {

        console.log(
            "⚠️ Les cartes statistiques ne sont pas présentes."
        );

        return;
    }


    /* =================================================
       1. MES ARTICLES
    ================================================= */

    const mesArticles =
    articles.filter(function(article) {

        return (
            String(article.vendeurId) ===
            String(vendeurId)
        );

    });

    statistiques[0].textContent =
        mesArticles.length;


    /* =================================================
       2. MES VENTES
    ================================================= */

    let nombreVentes = 0;


    commandes.forEach(function(commande) {

        if (
            !commande.produits ||
            !Array.isArray(commande.produits)
        ) {

            return;

        }


        const produitsDuVendeur =
            commande.produits.filter(
                function(produit) {

                    return (
                        String(produit.vendeurId) === String(vendeurId)
                    );

                }
            );


        if (produitsDuVendeur.length > 0) {

            nombreVentes++;

        }

    });


    statistiques[1].textContent =
        nombreVentes;


    /* =================================================
       3. MES REVENUS
    ================================================= */

    let revenus = 0;


    commandes.forEach(function(commande) {

        /* =========================
           SEULEMENT LES COMMANDES
           LIVRÉES
        ========================= */

        if (
            commande.statut !== "Livrée"
        ) {

            return;

        }


        if (
            !commande.produits ||
            !Array.isArray(commande.produits)
        ) {

            return;

        }


        /* =========================
           PRODUITS DU VENDEUR
        ========================= */

        commande.produits.forEach(
            function(produit) {

                if (
    String(produit.vendeurId) ===
    String(vendeurId)
) {

                    revenus +=
                        Number(produit.prix) *
                        Number(produit.quantite);

                }

            }
        );

    });


    /* =========================
       AFFICHER LES REVENUS
    ========================= */

    statistiques[2].textContent =
        revenus.toLocaleString("fr-FR") +
        " FCFA";

}

/* =================================================
   MES VENTES — AFFICHER LES COMMANDES DU VENDEUR
================================================= */


/* =====================================================
   LANCER LES STATISTIQUES
===================================================== */

actualiserStatistiquesVendeur();


/* =====================================================
   FIN ESPACE VENDEUR
===================================================== */
// Modèle par défaut du mandat de recherche
// Les variables entre {{}} seront remplacées par les vraies valeurs

export const MANDAT_TEMPLATE_DEFAULT = `MANDAT DE RECHERCHE IMMOBILIÈRE

Numéro du mandat : {{MANDAT_NUMERO}}

ENTRE LES SOUSSIGNÉS :

L'Agence en Ligne, société de conseil en négociation immobilière, ci-après dénommée « Le Mandataire »,

ET

{{CLIENT_PRENOM}} {{CLIENT_NOM}}, demeurant à l'adresse communiquée lors de l'inscription, joignable par email à {{CLIENT_EMAIL}}{{CLIENT_TELEPHONE}}, ci-après dénommé(e) « Le Mandant »,

IL A ÉTÉ CONVENU CE QUI SUIT :

ARTICLE 1 – OBJET DU MANDAT

Le Mandant confie au Mandataire un mandat de recherche en vue de la négociation du prix d'acquisition d'un ou plusieurs biens immobiliers. Le Mandataire s'engage à accompagner le Mandant dans la négociation du prix auprès du vendeur ou de son représentant, afin d'obtenir les meilleures conditions d'achat possibles.

ARTICLE 2 – OBLIGATIONS DU MANDATAIRE

Le Mandataire s'engage à :
- Analyser le bien immobilier ciblé et son positionnement de prix sur le marché
- Élaborer une stratégie de négociation adaptée
- Mener les échanges avec le vendeur ou son mandataire
- Informer régulièrement le Mandant de l'avancement des négociations
- Conseiller le Mandant sur les offres à formuler

ARTICLE 3 – OBLIGATIONS DU MANDANT

Le Mandant s'engage à :
- Fournir au Mandataire toutes les informations nécessaires à la négociation
- Ne pas mener de négociations parallèles sur le même bien sans en informer le Mandataire
- Informer le Mandataire de toute évolution de sa situation ou de ses critères de recherche

ARTICLE 4 – RÉMUNÉRATION

La rémunération du Mandataire est fixée comme suit :
- Forfait fixe : 500 € (cinq cents euros) TTC, dû à la signature du présent mandat
- Honoraires de résultat : 10 % de l'économie réalisée par tranche complète de 5 000 €

L'économie est calculée comme la différence entre le prix affiché initial du bien et le prix d'acquisition final obtenu grâce à la négociation.

Exemple : pour un bien affiché à 300 000 € négocié à 275 000 €, l'économie est de 25 000 €, soit 5 tranches complètes de 5 000 €. Les honoraires de résultat s'élèvent à 5 × 500 € = 2 500 €.

Les honoraires de résultat ne sont dus qu'en cas d'accord trouvé avec le vendeur.

ARTICLE 5 – DURÉE

Le présent mandat est conclu pour une durée de 12 mois à compter de sa signature. Il est renouvelable par tacite reconduction par périodes de 6 mois, sauf dénonciation par l'une des parties par lettre recommandée avec accusé de réception, avec un préavis de 15 jours.

ARTICLE 6 – DROIT DE RÉTRACTATION

Conformément aux articles L221-18 et suivants du Code de la consommation, le Mandant dispose d'un délai de 14 jours à compter de la signature du présent mandat pour exercer son droit de rétractation, sans avoir à motiver sa décision ni à supporter de pénalités. Pour exercer ce droit, le Mandant adresse un email à contact@lagenceenligne.fr.

ARTICLE 7 – PROTECTION DES DONNÉES

Les données personnelles collectées dans le cadre du présent mandat sont traitées conformément au Règlement Général sur la Protection des Données (RGPD). Elles sont utilisées exclusivement pour l'exécution du mandat et la gestion de la relation commerciale. Le Mandant dispose d'un droit d'accès, de rectification, de suppression et de portabilité de ses données.

ARTICLE 8 – LOI APPLICABLE

Le présent mandat est soumis au droit français. Tout litige sera porté devant les tribunaux compétents.

Fait en un exemplaire numérique, le {{DATE_SIGNATURE}}.`;

// Fonction pour remplacer les variables dans le template
export function remplirMandat(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

// Générer un numéro de mandat unique
export function genererNumeroMandat(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `MR-${year}-${rand}`;
}

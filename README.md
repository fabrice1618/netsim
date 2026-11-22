# Utilisation Netsim

URL: https://fabrice1618.github.io/netsim/

## Interface

L'application est organisée en trois zones :
- **Barre de navigation (haut)** : menu principal à gauche, contrôles d'animation à droite.
- **Canvas (centre)** : zone de travail où sont placés les équipements.
- **Panneau latéral (gauche)** : actions contextuelles pour l'élément sélectionné.

## Menu principal (barre de navigation)

| Entrée | Action |
|--------|--------|
| Upload | Restaure un fichier JSON |
| Save | Enregistre un fichier JSON dans votre dossier téléchargement |
| Add Host | Ajoute un ordinateur |
| Add DHCP server | Ajoute un serveur DHCP |
| Add DNS server | Ajoute un serveur DNS |
| Add web server | Ajoute un serveur HTTP |
| Add switch | Ajoute un switch |
| Add router | Ajoute un routeur |
| Select language | Choisir la langue de l'interface |

**Sauvegarder régulièrement votre travail**. En cas d'erreur ou de rafraîchissement, vos données seront perdues.

## Contrôle de l'animation (barre de navigation, droite)

| Bouton | Action |
|--------|--------|
| Slow | Diminue la vitesse de l'animation |
| Play/Pause | Lance ou met en pause l'animation |
| Fast | Augmente la vitesse de l'animation |

## Actions communes à tous les équipements (panneau latéral)

- **Delete element** : supprimer l'équipement
- **Edit Name / Group** : renommer l'équipement ou changer son groupe
- **Create Link** : créer un câble entre deux équipements

## Hôte

- Network diagnostics / Ping : vérifier la connexion avec une adresse IP
- Edit Gateways : configurer le routage
- Edit IP Info - Interface 0 : configuration réseau statique
- Request DHCP info : configuration réseau dynamique (DHCP client)
- DNS lookup : résolution nom d'hôte → adresse IP
- Web browser (HTTP client) : navigateur web intégré

## DHCP server

- idem Hôte
- Edit DHCP server info : plage d'adresses, passerelle, DNS distribués

## DNS server

- idem Hôte
- DNS server config : table de résolution nom → adresse IP

## Web server

- idem Hôte
- Edit HTTP server info : configuration du serveur HTTP

## Switch

- Actions communes uniquement (pas de configuration IP)

## Router

- Network diagnostics / Ping
- Edit Gateways : table de routage statique
- Edit IP Info - interface 0 / interface 1 : configuration IP de chaque interface
- Edit NAT table : configuration NAT / mode passerelle

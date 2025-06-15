# Préparation environnement de développement

ATTENTION: **ne fonctionne pas**. Le javascrript généré ne fonctionne pas

## Preparation (Ubuntu):

### Installation nodeJS

Source: https://nodejs.org/fr/download
```
# Télécharger et installer nvm :
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# au lieu de redémarrer le shell
\. "$HOME/.nvm/nvm.sh"

# Télécharger et installer Node.js :
nvm install 22

# Vérifier la version de Node.js :
node -v # Doit afficher "v22.16.0".
nvm current # Doit afficher "v22.16.0".

# Vérifier la version de npm :
npm -v # Doit afficher "10.9.2".
```


```
npm install -g npm@11.4.2
npm install -g grunt

cd /var/www/html
npm install --save-dev grunt grunt-contrib-uglify

npm audit fix  

```

## Uglify


```
$ npm run build


# OLD
$ grunt

```

## NetworkSimulator

Educational Network Simulator Project

Check out the project's webpage at: http://projects.bardok.net/educational-network-simulator/

(c) 2015 Jorge García Ochoa de Aspuru

bardok@gmail.com

@bardok

This project is covered by GPLv3 license.


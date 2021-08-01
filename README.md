# SPOTIFY CLONE BACKEND

## About This Repo
This repo is the backend authentication of [spotify-clone-frontend](https://github.com/MohammadAfandy/spotify-clone-frontend). It follows authorization guide provided on the API [documentation](https://developer.spotify.com/documentation/general/guides/authorization-guide/)

## Made with
* Typescript
* Node.js
* Express.js
* axios

## Instalation
### Install Dependencies
```
npm install
```

### Rename .env.example to .env
```
CLIENT_ID = <Client ID from the Spotify Developer Dashboard>
CLIENT_SECRET = <Client Secret from the Spotify Developer Dashboard>
REDIRECT_URI = <Redirect URL specified from the Spotify Developer Dashboard>
FRONTEND_URI = <Frontend URL>
DEBUG = <true if in local environment>
```
### Run Application
#### Development
```
npm run dev
```

#### Production
```
npm run build
npm run start
```

## Disclaimer
[spotify-clone-frontend](https://github.com/MohammadAfandy/spotify-clone-frontend) and [spotify-clone-backend](https://github.com/MohammadAfandy/spotify-clone-backend) is intended for educational purpose only. All data including image, song, logo, etc belong to their respective copyright owners.
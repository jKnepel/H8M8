# SystemsDevelopmentWS22-AI-Moderation Frontend

## Development

### Setup for Developers

#### Before Running Webapp (Environment Variables)

Before running, set up the environment variables. Either by creating a file named '.env' (easiest and simplest), setting the env variables as flags for the parcel bundler, or creating multiple env files for different environemnts (like '.env.production' or '.env.development').

The '.env.template' file can be used as a template.

* `SERVICE_WORKER_ON = true | false` set true if you would like to enable the mockserver with sampel API data. Default: false.
* `BACKEND_URL = <url of api>` optionally, you can set the url of the API. By default you don't have to set this, because the url defaults to a url, depending on whether in development mode and whether SERVICE_WORKER_ON=true.

Default URL's:

* webapp dev server: http://localhost:80
* mockservice provider: same as webapp!
* backend API url: http://127.0.0.1:8000

#### Run Webapp Locally (Start Development Server)

Execute following commands:

* `cd webapp` (change directory to webapp)
* `npm install`
* `npm run start` to start the dev server

#### Troubleshooting

After merges you might need to run npm install, to install changed dependencies. You should also delete the '.parcel-cache' folder after many changes or changed dependencies. Or just run `npm run postmerge` in the webapp folder.

### Tech Stack

* React 17 and React Router v6
* SASS, BEM as naming convention (https://getbem.com/naming/)
* Parcel v2 as Bundler (https://parceljs.org/)
* Mantine als Design System (https://mantine.dev/)
* Redux as state container + Redux Saga for auth management
* Typescript and Javascript
* MSW as mockservice for API data
* Axios and React Query for REST API calls
* Chart library: Recharts (https://recharts.org/en-US)
* Icon library: Tabler Icons (https://tabler-icons-react.vercel.app/)



This is the base REPOSITORY for Gen3.2 data commons.


## Getting Started
Gen3 Data Commons using the Gen3 Frontend Framework is a matter of the following:

* create a clone of [Gen3 Data Commons Application](https://github.com/uc-cdis/commons-frontend-app/)  

* Configure the commons by editing the configuration files in the ```config```

* Add your pages and content

* Deploy via helm charts or Docker.

Changes to the Gen3 Data Commons Application can be pulled from the Common Frontend Repository. You need configure git to pull from the Common Frontend Repository.
```bash
git remote add upstream https://github.com/uc-cdis/commons-frontend-app.git
```
or
```bash
git remote add upstream git@github.com:uc-cdis/commons-frontend-app.git
```

changes to ```main``` can be pulled from the Common Frontend Repository by running:
```bash
git pull upstream main
```

Please see [Styling and Theming](https://github.com/uc-cdis/gen3-frontend-framework/blob/develop/docs/Local%20Development/Styling%20and%20Theming.md) and [Local Development with Helm Charts](https://github.com/uc-cdis/gen3-frontend-framework/blob/develop/docs/Local%20Development/Using%20Helm%20Charts/Local%20Development%20with%20Helm%20Charts.md)
for more information on setting up and configuring the Gen3 Data Commons Application.
This documentation is currently less complete than we would like, but we will be adding to it as development progresses.

## Installation

The minimum node version is set to v20.11.0 only from an LTS perspective.
Node can be downloaded from the official Node.js site. You may also consider using a [Node version manager](https://docs.npmjs.com/cli/v7/configuring-npm/install#using-a-node-version-manager-to-install-nodejs-and-npm).
Your version of Node may not ship with npm v10. To install it, run:

```bash
npm install npm@10.2.4 -g
```

Note: if you see this error:
```
npm ERR! code ENOWORKSPACES
npm ERR! This command does not support workspaces.
```
you can run ```npx next telemetry disable```

Alternatively, you can use `nvm` to install the correct version of npm:
```bash
nvm install 20.11.0
```

### Install Dependencies

From the root of the project, install dependencies by running:

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Local Development with Cloud Backend

The local frontend can communicate with the deployed cloud backend (e.g. `https://omix3.test.biocommons.org.au`). In development mode, `next.config.js` rewrites API routes (`/_status`, `/user/*`, `/guppy/*`, `/mds/*`, etc.) to the URL specified by `NEXT_PUBLIC_GEN3_API_TARGET` in `.env.development`.

#### Why the dev proxy is needed

When Next.js rewrites proxy a request, they forward the original `Host: localhost:3000` header to the destination. The cloud backend's reverse proxy (nginx/ingress) does not recognise this host and rejects the request. The `dev-proxy.mjs` script solves this by running a local HTTP proxy on port 8080 that rewrites the `Host` header to the cloud domain before forwarding the request over HTTPS. It uses only Node.js built-in modules and has no external dependencies.

```
Browser → localhost:3000 (Next.js) → localhost:8080 (dev-proxy.mjs) → cloud backend (HTTPS)
```

#### Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) installed
- Node.js v24.12.0+ (defined in `.nvmrc`)

#### Steps

1. Switch to the correct Node version:
```bash
nvm use
```

2. Install dependencies:
```bash
npm install
```

3. Verify `.env.development` has the proxy target set:
```
NEXT_PUBLIC_GEN3_API_TARGET=http://localhost:8080
```

4. Start the dev proxy (Terminal 1):
```bash
node dev-proxy.mjs
```

5. Start the Next.js dev server (Terminal 2):
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in an **incognito/private** browser window to avoid cookie conflicts.

7. You will be redirected to the Login page. To authenticate:
   - Go to your cloud instance (e.g. [https://omix3.test.biocommons.org.au/Profile](https://omix3.test.biocommons.org.au/Profile)) and generate an API key.
   - Copy the API key JSON.
   - On the local Login page, paste the API key JSON into the **"Authorize with Credentials"** field.

#### Notes

- **API keys expire** — regenerate from the cloud instance's Profile page when your session expires.
- **Use incognito** — this avoids conflicts with cookies from the cloud instance.
- **Dev-only** — the proxy and rewrites are only active when `NODE_ENV=development`. They have no effect on production builds or deployments.
- **No external dependencies** — `dev-proxy.mjs` uses only Node.js built-in modules (`node:http`, `node:https`, `node:url`).


## Docker

You build a Docker image by:

```bash
docker build .
```
## Updating a forked commons

The following steps usually apply to update a forked commons.

Get the changes from the parent fork:
```bash
git remote add upstream git@github.com:uc-cdis/commons-frontend-app.git
git fetch upstream
```
Create a branch and merge changes from upstream:
```bash
git merge upstream/main
```
If the above has the error message:  "fatal: refusing to merge unrelated histories" error.
This often happens when the repo was created as a template, not a fork.
To resolve this, the ```--allow-unrelated-histories``` flag can be used during the merge operation. This flag forces Git to merge the branches despite lacking a common history.
```bash
git merge upstream/main --allow-unrelated-histories
```
If you use this flag, it is recommended that you carefully review the changes and resolve any conflicts before finalizing the merge.

You will see merge conflicts. In general: **take the remote's version for everything except the config files**, as those are customized to the commons config. Resolve any remaining config issues and open a PR.
Test the new common by running it locally or in a staging environment.


 # Wedding Marketplace Website UI

 This is a code bundle for Wedding Marketplace Website UI. The original project is available at https://www.figma.com/design/CavBiDtGNd3hsXG5NrHKjd/Wedding-Marketplace-Website-UI.

 ## Running the code

 Run `npm i` to install the dependencies.

 Run `npm run dev` to start the development server.

 ## Vercel Deployment

 This app is a Vite SPA and is ready for Vercel deployment.

 Required settings:

 - Root Directory: `shadi-bazaar` if you are importing the whole repository into Vercel
 - Install Command: `pnpm install --frozen-lockfile`
 - Build Command: `pnpm run build`
 - Output Directory: `dist`

 Required environment variables:

 - `VITE_API_BASE_URL`

 Example:

 ```env
 VITE_API_BASE_URL=https://your-api-domain.com/api/web/v1/
 ```

 Notes:

 - `vercel.json` is included for SPA rewrites, so direct visits to routes like `/feed`, `/chat`, and `/profile/123` work correctly.
 - Make sure the API URL points to your deployed Laravel `web/v1` endpoints.
  

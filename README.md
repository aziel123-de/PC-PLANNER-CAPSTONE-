# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Local backend (development)

The frontend proxies requests starting with `/api` to the backend at `http://127.0.0.1:5050` when running `npm run dev` (Vite).

Make sure to start the backend before calling the API endpoints:

1. In `pc-planner-capstone/Backend` run:
	- `npm install` (if needed)
	- `node index.js`

2. Start the frontend in the project root:
	- `npm run dev`

The SignUp form sends requests to `/api/register` which will be forwarded to the backend.

## Profile Pictures

Profile pictures are now stored in MySQL database and persist after logout. Users can upload profile pictures through the Settings page:

- Maximum file size: 2MB
- Supported formats: JPEG, PNG
- Pictures are stored in `Backend/uploads/` directory
- Database stores the file path in the `profile_picture` column

To upload a profile picture:
1. Login to your account
2. Go to Settings page
3. Upload a profile picture
4. Save changes
5. Your picture will persist even after logout!

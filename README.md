# ChronoTrack

*Company*: CODTECH IT SOLUTIONS

*Name*: Paul Bryton Raj

*INTERN ID*: CY06DY2622

*DOMAIN*: Full Stack Developement

*DURATION*: 4 weeks

*MENTOR*: **NEELA SANTHOSH**


ChronoTrack is a modern, full-featured time and productivity tracker built with Next.js and Firebase. It provides real-time data synchronization, offline capabilities, and a clean, customizable user interface with light and dark modes.

## Features

- **Real-time Time Tracking**: Start and stop a timer for your tasks.
- **Project Management**: Create, edit, and delete projects with custom names and colors.
- **Dynamic Dashboard**: Get an at-a-glance overview of your tracked time, including daily summaries and weekly trends.
- **Persistent Data**: All time entries and projects are saved to a Firestore database.
- **Real-time Sync**: Data is synchronized in real-time across all your devices.
- **Offline Support**: The application is configured to work offline, automatically syncing your changes when you reconnect.
- **Customizable Themes**: Supports light, dark, and system-default themes, with preferences saved to your user profile.
- **User Settings**: Customize application behavior, such as Pomodoro timer duration.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## Getting Started

To run the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    The project uses `npm` as its package manager.
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    This project is pre-configured to work with Firebase. Ensure you have a `firebaseConfig` object in `src/firebase/config.ts`. The application uses Firebase App Hosting's environment variables for production deployment, so your local configuration will be used for development.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deployment

This application is optimized for deployment on [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). The `apphosting.yaml` file is already configured. Deploy

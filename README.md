# Decision Engine (Frontend UI)

## Problem Statement
While the human brain is highly capable, it suffers from severe "analysis paralysis" and emotional bias when confronted with multi-variable decisions. This frontend serves as the interactive dashboard for the Decision Engine API, allowing users to visually construct complex matrices, assign weighted criteria, and mathematically evaluate their dilemmas to find the optimal, objective choice.

---

## System Architecture

This application is built as a Single Page Application (SPA) using modern React standards.

* **Framework:** React 18 + Vite (for lightning-fast HMR and optimized builds).
* **Language:** TypeScript for strict type-safety across components.
* **Routing:** `react-router-dom` for seamless, client-side navigation without page reloads.
* **HTTP Client:** Axios, configured with global interceptors to automatically attach JWT tokens to secure requests.
* **State Management:** React's native `useState` and `useEffect` hooks manage the complex, nested state of the decision matrix.

---

## API Integration Strategy

The UI communicates with a dedicated Node/Express backend. 
* A central `apiClient` (`src/api/client.ts`) acts as the single source of truth for backend communication.
* **Authentication Flow:** On successful login, the JWT is stored in `localStorage`. The Axios interceptor intercepts every subsequent outbound request and injects the `Authorization: Bearer <token>` header, ensuring the user only ever sees their own data.

---

## Tradeoffs

1. **Inline CSS vs. Component Libraries:** For the MVP, inline CSS was used to rapidly prototype the layout and data flow. Moving forward, this will be stripped out in favor of a utility-first framework like Tailwind CSS for scalable design.
2. **Client-Side vs. Server-Side Rendering:** Chose a Vite SPA over Next.js SSR. Since this is an authenticated, highly interactive dashboard (rather than a public-facing blog requiring SEO), a standard React SPA provides the best developer experience and sufficient performance.

---

## Challenges Faced

* **Managing Deeply Nested State:** The `DecisionDetail` matrix requires rendering an object that contains arrays of Options, arrays of Criteria, and cross-referenced Scores. 
* **Database Constraint Handling:** The UI had to be designed to gracefully catch and display custom backend errors (e.g., preventing a user from accidentally scoring "Toyota" for "Mileage" twice) without crashing the application.

---

## Future Improvements

* **UI/UX Overhaul:** Implement a complete design system with a dark-mode-first approach.
* **Data Visualization:** Add radar charts (spider charts) to visually map out why the winning option beat the runner-ups across different criteria.
* **Drag and Drop:** Allow users to reorder criteria priority using a drag-and-drop interface.
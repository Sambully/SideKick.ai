# SideKick.ai - AI Companion

An intelligent AI companion application that allows users to create, customize, and chat with AI personas. Built with a modern full-stack architecture, it features real-time streaming responses, secure authentication, and subscription management.

## Tech Stack

**Frontend:**
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS, Shadcn/UI (Radix Primitives)
*   **Icons:** Lucide React
*   **Auth:** Clerk
*   **State/Routing:** React Router DOM, React Hooks

**Backend:**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** PostgreSQL (via Prisma ORM)
*   **AI Models:** Google Gemini (Generative AI), Replicate (Llama 2)
*   **Payments:** Razorpay
*   **Vector DB:** Pinecone / Memory Manager (Langchain)
*   **Utilities:** Upstash (Rate Limiting)

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Authentication (Clerk)
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# AI Services
GEMINI_API_KEY="AIza..."
REPLICATE_API_TOKEN="r8_..."

# Payments (Razorpay)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your_secret"

# Optional/Legacy
PINECONE_API_KEY="..."
PINECONE_INDEX="..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

Create a `.env` file in the `frontend` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Sambully/SideKick.ai.git
    cd SideKick.ai
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    # Generate Prisma Client
    npx prisma generate
    # Push Database Schema
    npx prisma db push
    ```

3.  **Start Backend Server:**
    ```bash
    npm start
    # Server runs on http://localhost:3000
    ```

4.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

5.  **Start Frontend:**
    ```bash
    npm run dev
    # Client runs on http://localhost:5173
    ```

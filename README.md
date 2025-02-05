# Cosmos API Index

## 🚀 Your Gateway to Intelligent Document Interaction

A powerful web application that transforms how you create, manage, and converse with vectorized file indexes. Harnessing the capabilities of Next.js 15, FastAPI, and the cutting-edge Cosmos API, this tool brings your documents to life through intuitive chat interactions.

## 🎯 Purpose

**Cosmos API Index** simplifies the creation and querying of vector databases for efficient document retrieval. Leveraging the Cosmos API, users can:

- 📄 **Upload documents** into searchable indexes
- 💬 **Interact with data** through a Natural Language interface
- 🌐 **Analyze files** in multiple languages

Ideal for researchers, content managers, and professionals working with large volumes of textual data who require swift and precise information retrieval.

## ✨ Key Features

- 📁 Create, manage, and delete file indexes
- 🔄 Upload and remove files from indexes
- 🧠 Generate embeddings via Cosmos API
- 🤖 Interactive chat interface for querying indexed content
- 📚 Sourced responses using RAG techniques
- 💻 Modern, responsive UI with Tailwind CSS and shadcn/ui components
- ⚡ Real-time data fetching powered by TanStack Query

## 🛠️ Tech Stack

### Frontend

- ⚛️ Next.js 15 (App Router)
- 🎨 TailwindCSS
- 🧩 shadcn/ui components
- 🔍 TanStack Query
- 📦 pnpm package manager

### Backend

- 🐍 FastAPI (Python)
- 🌌 Cosmos Client by Delos Intelligence
- 📜 Poetry for dependency management

## 🏁 Getting Started

### Prerequisites

- 🟢 Node.js (v18+)
- 📦 pnpm
- 🐍 Python 3.9+
- 📜 Poetry
- 🔑 Cosmos API key (obtain from [platform.cosmos-suite.ai](https://platform.cosmos-suite.ai))

### 🔑 Obtaining a Cosmos API Key

Before you begin, you need to create a **Cosmos API key**:

1. Visit [platform.cosmos-suite.ai](https://platform.cosmos-suite.ai)
2. Sign up or log in to your account.
3. Navigate to the Dashboard, and generate a new API key.

![Create CosmosAPI key](https://i.ibb.co/b5sx86GB/Screenshot-from-2025-02-03-16-43-11.png)

### 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/Delos-Intelligence/cosmos-api-index.git
cd cosmos-api-index
```

2. Install frontend dependencies:

```bash
cd frontend
pnpm install
```

3. Install backend dependencies:

```bash
cd backend
poetry install
```

4. Set up environment variables:
   Create a `.env` file in the root directory (refer to `.env.example`) and paste the key you created in [platform.cosmos-suite.ai](https://platform.cosmos-suite.ai):

```env
COSMOS_APIKEY=your_apikey_here
```

> **Note**: _By default, the backend will serve the port 8000, and the frontend the 3000. You can customize those in their respective `.env`._

5. Start the development servers:

**Frontend (NextJS):**

```bash
cd frontend
pnpm dev
```

Serves on `http://localhost:3000` by default (or next available port)

**Backend (Python):**

```bash
cd backend
python -m index
```

Runs on `http://localhost:8000` (unless modified in `backend/.env` and `frontend/.env`)

## 📖 Usage Guide

1. Access the web application (default: `http://localhost:3000`).

2. Create a new Index:

- Upload files
- Provide a name
- Optionally add or delete files, or rename the Index

3. Select an Index to query its files.
   ![Embedding Index](https://i.ibb.co/TBpvKmgb/Screenshot-from-2025-02-03-15-56-51.png)

4. For **RAG** operations (research on file contents), it is required to **Embed the Index**:
   ![Embedding Index](https://i.ibb.co/jZQ6NCRD/Screenshot-from-2025-02-03-15-36-59.png)

5. Start **chatting with your index** :
   ![Chat with Index](https://i.ibb.co/yBqVJ8bb/Screenshot-from-2025-02-03-15-53-20.png)

6. Index Management:

> **Note**:
>
> - Most operations are **real-time**, excepting the Index deletion.
> - **Delete Index** is scheduled after a **2-hour countdown**.
> - During the **countdown status**, it is possible to **restore Index**.

## 🔗 API Endpoints

### 📁 Indexes

- `GET /files/index/list` - List all indexes
- `POST /files/index/create` - Create a new index
- `PUT /files/index/{index_id}/rename` - Rename an index
- `DELETE /files/index/{index_id}/delete` - Delete an index (_warning: delayed operation_ - scheduled to be effective in 2h from current time)
- `PUT /files/index/{index_id}/restore` - Restore an index scheduled for deletion

### 📄 Files

- `GET /files/index/{index_id}/details` - See index details, such as files contained, storage, index status, embedded flag...
- `POST /files/index/{index_id}/add_files` - Upload files to an index
- `DELETE /files/index/{index_id}/delete_files` - Delete a file

### 💬 Chat

- `POST /files/index/{index_uuid}/ask` - Send a message to chat with Index
- `POST /files/index/{index_uuid}/embed` - Embed the Index content in order to enable RAG operations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙌 Acknowledgments

- [Cosmos API](https://platform.cosmos-suite.ai)
- [Delos Intelligence](https://www.delosintelligence.fr/en)
- [FastAPI](https://fastapi.tiangolo.com) for building high-performance APIs
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [TanStack Query](https://tanstack.com/query/latest) for efficient data fetching

## 🆘 Support

If you encounter any issues or have questions, please file an issue on the GitHub repository, or contact
[contact@delosintelligence.fr](mailto:contact@delosintelligence.fr)

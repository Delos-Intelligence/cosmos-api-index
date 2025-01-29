# Vector Index Chat

A web application that allows you to create, manage, and interact with vector indexes through a chat interface. Built with Next.js 15 and FastAPI, powered by the Cosmos API.

## Features

- Create and manage vector indexes
- Upload and delete files from your indexes
- Generate embeddings using Cosmos API
- Interactive chat interface for querying your indexed content
- Modern, responsive UI built with Tailwind CSS and shadcn/ui components
- Real-time data fetching with TanStack Query

## Tech Stack

### Frontend

- Next.js 15 (App Router)
- TailwindCSS
- shadcn/ui components
- TanStack Query
- pnpm package manager

### Backend

- FastAPI (Python)
- Cosmos Client by Delos Intelligence
- Poetry dependency management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- Python 3.9+
- Poetry

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/vector-index-chat.git
cd vector-index-chat
```

2. Install frontend dependencies:

```bash
pnpm install
```

3. Install backend dependencies:

```bash
cd backend
poetry install
```

4. Create a `.env` file in the root directory:

```env
COSMOS_API_KEY=your_api_key_here
```

5. Start the development servers:

Frontend:

```bash
pnpm dev
```

Backend:

```bash
poetry run uvicorn app.main:app --reload
```

## Usage

1. Create a new index:

```bash
POST /api/indexes
{
  "name": "my-index",
  "description": "Optional description"
}
```

2. Upload files to your index:

```bash
POST /api/indexes/{index_id}/files
```

3. Generate embeddings:

```bash
POST /api/indexes/{index_id}/embed
```

4. Start chatting with your index through the web interface!

## API Documentation

### Indexes

- `GET /api/indexes` - List all indexes
- `POST /api/indexes` - Create a new index
- `DELETE /api/indexes/{index_id}` - Delete an index

### Files

- `POST /api/indexes/{index_id}/files` - Upload files to an index
- `GET /api/indexes/{index_id}/files` - List files in an index
- `DELETE /api/indexes/{index_id}/files/{file_id}` - Delete a file

### Chat

- `POST /api/chat` - Send a message to chat with your indexed content

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Delos Intelligence](https://delos.com) for the Cosmos API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [TanStack Query](https://tanstack.com/query/latest) for efficient data fetching

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

// pages/api/chat.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { indexUuid, question, outputLanguage, activeFilesHashes } = req.body;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/index/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        index_uuid: indexUuid,
        question,
        output_language: outputLanguage,
        active_files_hashes: activeFilesHashes,
      }),
    },
  );

  const data = await response.json();
  res.status(response.status).json(data);
}
